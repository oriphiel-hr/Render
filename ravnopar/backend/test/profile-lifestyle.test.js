import test from 'node:test';
import assert from 'node:assert/strict';
import {
  normalizeChildrenPref,
  scoreLifestyleOverlap,
  shouldShowAwaitingContact
} from '../src/lib/profile-lifestyle.js';

test('lifestyle overlap gives points for matching fields', () => {
  const me = { childrenPref: 'NONE', smoking: 'NO', relationshipStatus: 'SINGLE' };
  const candidate = { childrenPref: 'NONE', smoking: 'YES', relationshipStatus: 'SINGLE' };
  const result = scoreLifestyleOverlap(me, candidate);
  assert.equal(result.points, 4);
  assert.deepEqual(result.matches, ['childrenPref', 'relationshipStatus']);
});

test('awaiting contact chip requires no incoming requests and min days', () => {
  assert.equal(shouldShowAwaitingContact({ incoming7d: 0, waitingDays: 2 }), true);
  assert.equal(shouldShowAwaitingContact({ incoming7d: 1, waitingDays: 10 }), false);
  assert.equal(shouldShowAwaitingContact({ incoming7d: 0, waitingDays: 1 }), false);
});

test('invalid lifestyle values normalize to null', () => {
  assert.equal(normalizeChildrenPref('INVALID'), null);
  assert.equal(normalizeChildrenPref('HAS'), 'HAS');
});
