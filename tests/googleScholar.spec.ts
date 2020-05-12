import * as scholarly from "../lib";

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
    console.log(data);
    Array.isArray(data) && data.length > 0 ? t.pass() : t.fail();
  } catch (e) {
    // Ignore error due to Rate Limiting (too many requests in succession) by Google APIs
    if (e instanceof Error) {
      e.message.indexOf("429") !== -1 ? t.pass() : t.fail("Test failed: " + e);
    }
  }
});
