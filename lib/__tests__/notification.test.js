import test from 'node:test';
import assert from 'node:assert/strict';
import { buildNotificationMessage } from '../notifications.js';

test('buildNotificationMessage formats club notices for members', () => {
  assert.equal(buildNotificationMessage('update', 'Leadership workshop'), 'A new update was posted: Leadership workshop');
  assert.equal(buildNotificationMessage('story', 'Family day recap'), 'A new story was published: Family day recap');
  assert.equal(buildNotificationMessage('meeting', 'Weekly meeting'), 'A new meeting has been posted: Weekly meeting');
});
