import test from 'node:test';
import assert from 'node:assert/strict';
import {
  activityStatusFor,
  normalizePrivateTags,
  normalizePublicTags,
  scorePublicTagOverlap,
  tagsOverlap
} from '../src/lib/profile-tags.js';

test('normalize public tags keeps catalog and custom tags', () => {
  assert.deepEqual(normalizePublicTags(['READING', '  planinarenje  ', 'READING']), [
    'READING',
    'planinarenje'
  ]);
});

test('normalize private tags rejects public-only keys', () => {
  assert.deepEqual(normalizePrivateTags(['CASUAL_SEX', 'READING']), ['CASUAL_SEX']);
});

test('tag overlap scores ranking bonus', () => {
  const me = { publicTags: ['READING', 'COFFEE'] };
  const candidate = { publicTags: ['COFFEE', 'HIKING'] };
  assert.deepEqual(tagsOverlap(me.publicTags, candidate.publicTags), ['COFFEE']);
  assert.equal(scorePublicTagOverlap(me, candidate).points, 3);
});

test('activity status buckets', () => {
  const now = Date.now();
  assert.equal(activityStatusFor(new Date(now - 5 * 60 * 1000)), 'online');
  assert.equal(activityStatusFor(new Date(now - 3 * 60 * 60 * 1000)), 'today');
});
