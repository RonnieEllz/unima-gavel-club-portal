import test from "node:test";
import assert from "node:assert/strict";
import { canResetMemberPasswords } from "../role-policy";

test("member password reset is limited to super and administrator roles", () => {
  assert.equal(canResetMemberPasswords("super_admin"), true);
  assert.equal(canResetMemberPasswords("administrator"), true);
  assert.equal(canResetMemberPasswords("operations_admin"), false);
  assert.equal(canResetMemberPasswords("treasurer"), false);
  assert.equal(canResetMemberPasswords("content_administrator"), false);
  assert.equal(canResetMemberPasswords(null), false);
});
