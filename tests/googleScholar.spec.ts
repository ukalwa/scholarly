import * as scholarly from "../src";

import anyTest, { TestInterface } from "ava";

import MockAdapter from "axios-mock-adapter";
import axios from "axios";
import fs from "fs";

const test = anyTest as TestInterface<{ mock: MockAdapter }>;

test.before((t) => {
  t.context.mock = new MockAdapter(axios, { delayResponse: 1000 });
});

test.afterEach((t) => {
  t.context.mock.reset();
});

test.after((t) => {
  t.context.mock.restore();
});

test("search should resolve and return an Array", async (t) => {
  try {
    t.context.mock
      .onGet("https://scholar.google.com/scholar?hl=en&q=test%20api")
      .reply(200, fs.readFileSync(__dirname + "/searchData.txt", "utf-8"));
    const data = await scholarly.search("test api");
    // Retrieve first 10 results
    Array.isArray(data) && data.length === 10
      ? t.pass(`Number of results received: ${data.length}`)
      : t.fail("Number of results != 10");
  } catch (e) {
    // Ignore error due to Rate Limiting (too many requests in succession) by Google APIs
    if (e instanceof Error) {
      e.message.indexOf("429") !== -1 ? t.pass() : t.fail("Test failed: " + e);
    }
  }
});

test("user profile search should resolve and return an Array", async (t) => {
  try {
    t.context.mock
      .onGet("https://scholar.google.com/citations?hl=en&user=test-user")
      .reply(200, fs.readFileSync(__dirname + "/profileData.txt", "utf-8"));
    const data = await scholarly.user("test-user");
    Array.isArray(data) && data.length > 0 ? t.pass() : t.fail();
  } catch (e) {
    // Ignore error due to Rate Limiting (too many requests in succession) by Google APIs
    if (e instanceof Error) {
      e.message.indexOf("429") !== -1 ? t.pass() : t.fail("Test failed: " + e);
    }
  }
});

test("throw error if the query is empty", async (t) => {
  try {
    const _ = await scholarly.search("");
  } catch (e) {
    if (e instanceof Error) {
      e.message === "Query cannot be empty!" ? t.pass() : t.fail();
    }
  }
  try {
    const _ = await scholarly.user("");
  } catch (e) {
    if (e instanceof Error) {
      e.message === "User cannot be empty!" ? t.pass() : t.fail();
    }
  }
});

test("Network connectivity error", async (t) => {
  t.context.mock
    .onGet("https://scholar.google.com/citations?hl=en&user=dummy-user")
    .reply(404, "Not found error")
    .onGet("https://scholar.google.com/scholar?hl=en&q=dummy%20api")
    .reply(404, "Not found error");
  try {
    const _ = await scholarly.search("dummy api");
  } catch (e) {
    if (e instanceof Error) {
      e.message.indexOf("404") !== -1 ? t.pass() : t.fail();
    }
  }
  try {
    const _ = await scholarly.user("dummy-user");
  } catch (e) {
    if (e instanceof Error) {
      e.message.indexOf("404") !== -1 ? t.pass() : t.fail();
    }
  }
});
