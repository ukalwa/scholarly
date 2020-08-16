import GoogleScholar from "../../src/lib/googleScholar";

import axios from "axios";
import fs from "fs";

test("search should resolve and return an Array", async () => {
  const mock = jest.spyOn(axios, "get").mockResolvedValueOnce({
    status: 200,
    data: fs.readFileSync(__dirname + "/searchData.txt", "utf-8"),
  });
  const data = await GoogleScholar.search("test api");
  expect(data).toBeInstanceOf(Array);
  expect(data).toHaveLength(10);
  expect(mock).toBeCalledTimes(1);
  expect(mock).toBeCalledWith(
    "https://scholar.google.com/scholar?hl=en&q=test%20api"
  );

  mock.mockRestore();
});

test("user profile search should resolve and return an Array", async () => {
  const mock = jest.spyOn(axios, "get").mockResolvedValueOnce({
    status: 200,
    data: fs.readFileSync(__dirname + "/profileData.txt", "utf-8"),
  });
  const data = await GoogleScholar.user("test-user");
  expect(data).toBeInstanceOf(Array);
  expect(mock).toBeCalledTimes(1);
  expect(mock).toBeCalledWith(
    "https://scholar.google.com/citations?hl=en&user=test-user"
  );

  mock.mockRestore();
});

test("throw error if the query is empty", async () => {
  expect(GoogleScholar.search("")).rejects.toBeInstanceOf(Error);
  expect(GoogleScholar.user("")).rejects.toBeInstanceOf(Error);
});
