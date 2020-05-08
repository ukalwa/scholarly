import * as scholarly from "../lib";

import test from "ava";

import randomWords = require("random-words");

test("search should resolve and return an Array", async (t) => {
  try {
    const data = await scholarly.search(
      randomWords({ exactly: 1, wordsPerString: 2 })[0]
    );
    // Retrieve first 10 results
    Array.isArray(data) && data.length > 0
      ? t.pass()
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
    // Sending too many requests to google API is throwing a 429 error.
    // Fix it by delaying the execution of next test
    await new Promise((resolve) => setTimeout(resolve, 5000));
    const data = await scholarly.user("H18-9fkAAAAJ");
    if (!data) t.fail("Unable to access google scholar website");
    Array.isArray(data) && data.length > 0 ? t.pass() : t.fail();
  } catch (e) {
    // Ignore error due to Rate Limiting (too many requests in succession) by Google APIs
    if (e instanceof Error) {
      e.message.indexOf("429") !== -1 ? t.pass() : t.fail("Test failed: " + e);
    }
  }
});
