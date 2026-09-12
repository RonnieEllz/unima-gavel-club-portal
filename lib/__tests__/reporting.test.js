import test from 'node:test';
import assert from 'node:assert/strict';
import { summarizeMembershipStatus } from '../reporting.js';

test('summarizeMembershipStatus counts members by status correctly', () => {
  const summary = summarizeMembershipStatus([
    { membership_status: 'active' },
    { membership_status: 'active' },
    { membership_status: 'pending' },
    { membership_status: 'rejected' },
  ]);

  assert.deepEqual(summary, {
    total: 4,
    active: 2,
    pending: 1,
    inactive: 0,
    rejected: 1,
  });
});
