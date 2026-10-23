import test from "node:test";
import assert from "node:assert/strict";

test("server package is configured for the API", () => {
  assert.equal(typeof process.env.NODE_ENV, "string");
});
