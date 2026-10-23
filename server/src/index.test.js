import test from "node:test";
import assert from "node:assert/strict";
import { users, notices, deadlines, exams } from "./data.js";

test("seed data contains all supported portal roles", () => {
  assert.deepEqual(users.map((user) => user.role).sort(), ["administrator", "faculty", "student"]);
  assert.ok(notices.length > 0);
  assert.ok(deadlines.length > 0);
  assert.ok(exams.length > 0);
});
