import test from 'node:test';
import assert from 'node:assert/strict';
import { normalizeBulkMemberIds, isValidMembershipStatus } from '../member-bulk.js';

test('normalizeBulkMemberIds deduplicates valid UUIDs', () => {
  const ids = [
    '550e8400-e29b-41d4-a716-446655440000',
    '550e8400-e29b-41d4-a716-446655440000',
    'not-a-uuid',
    '123e4567-e89b-12d3-a456-426614174000',
  ];

  assert.deepEqual(normalizeBulkMemberIds(ids), [
    '550e8400-e29b-41d4-a716-446655440000',
    '123e4567-e89b-12d3-a456-426614174000',
  ]);
});

test('isValidMembershipStatus accepts valid status values', () => {
  assert.equal(isValidMembershipStatus('active'), true);
  assert.equal(isValidMembershipStatus('pending'), true);
  assert.equal(isValidMembershipStatus('unknown'), false);
});
