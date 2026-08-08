const KEYS = {
  memberSince: 'ravnoparMemberSince',
  matchPending: 'ravnoparDonateMatchPending',
  matchShown: 'ravnoparDonateMatchPromptShown',
  milestoneShown: 'ravnoparDonateMilestonePromptShown',
  dismissedForever: 'ravnoparDonateDismissedForever'
};

export const DONATE_MILESTONE_DAYS = 14;

export function isDonateDismissedForever() {
  return localStorage.getItem(KEYS.dismissedForever) === '1';
}

export function dismissDonateForever() {
  localStorage.setItem(KEYS.dismissedForever, '1');
  localStorage.removeItem(KEYS.matchPending);
}

export function recordMemberSinceIfNeeded() {
  if (!localStorage.getItem(KEYS.memberSince)) {
    localStorage.setItem(KEYS.memberSince, String(Date.now()));
  }
}

export function markMatchDonateMoment() {
  if (localStorage.getItem(KEYS.matchShown) === '1') return;
  localStorage.setItem(KEYS.matchPending, '1');
}

function daysSinceMemberStart() {
  const raw = localStorage.getItem(KEYS.memberSince);
  if (!raw) return 0;
  return (Date.now() - Number(raw)) / (1000 * 60 * 60 * 24);
}

export function getDonatePrompt() {
  if (isDonateDismissedForever()) {
    return { show: false, reason: null };
  }

  if (localStorage.getItem(KEYS.matchPending) === '1') {
    return { show: true, reason: 'match' };
  }

  if (
    localStorage.getItem(KEYS.milestoneShown) !== '1' &&
    daysSinceMemberStart() >= DONATE_MILESTONE_DAYS
  ) {
    return { show: true, reason: 'milestone' };
  }

  return { show: false, reason: null };
}

export function dismissDonatePrompt(reason) {
  if (reason === 'match') {
    localStorage.removeItem(KEYS.matchPending);
    localStorage.setItem(KEYS.matchShown, '1');
  }
  if (reason === 'milestone') {
    localStorage.setItem(KEYS.milestoneShown, '1');
  }
}
