import test from 'node:test';
import assert from 'node:assert/strict';
import { normalizeAnnouncementInput } from '../announcement.js';

test('normalizeAnnouncementInput trims and validates announcement text', () => {
  assert.deepEqual(normalizeAnnouncementInput('  Hello club!  '), {
    text: 'Hello club!',
    valid: true,
  });

  assert.deepEqual(normalizeAnnouncementInput('   '), {
    text: '',
    valid: false,
  });
});
