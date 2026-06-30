import { prisma } from '../lib/prisma.js';
import { distanceLabelForProfiles } from '../lib/geo.js';
import {
  isAgeCompatible,
  isCountryCompatible,
  isDistanceCompatible
} from '../lib/match-preferences.js';
import { scorePublicTagOverlap } from '../lib/profile-tags.js';
import { scoreLifestyleOverlap, shouldShowAwaitingContact, lifestyleFieldsFromProfile } from '../lib/profile-lifestyle.js';
import { tagsOverlap, toPublicProfile } from '../lib/profile-public.js';
import { calculateProfileCompleteness, hasProfilePhoto } from '../services/profile-service.js';

function normalizeStringArray(value) {
  if (!Array.isArray(value)) return [];
  return value.filter((v) => typeof v === 'string');
}

function hasOverlap(a, b) {
  const setB = new Set(b);
  return a.some((item) => setB.has(item));
}

export function isFeedCompatible(me, candidate) {
  const mySeekingIdentities = normalizeStringArray(me.seekingIdentities);
  const mySeekingProfileTypes = normalizeStringArray(me.seekingProfileTypes);
  const myIntents = normalizeStringArray(me.intents);
  const candidateSeekingIdentities = normalizeStringArray(candidate.seekingIdentities);
  const candidateSeekingProfileTypes = normalizeStringArray(candidate.seekingProfileTypes);
  const candidateIntents = normalizeStringArray(candidate.intents);

  const myWantsCandidate =
    mySeekingIdentities.includes(candidate.identity) &&
    mySeekingProfileTypes.includes(candidate.profileType);
  const candidateWantsMe =
    candidateSeekingIdentities.includes(me.identity) &&
    candidateSeekingProfileTypes.includes(me.profileType);
  const intentOverlap = hasOverlap(myIntents, candidateIntents);

  return (
    myWantsCandidate &&
    candidateWantsMe &&
    intentOverlap &&
    hasProfilePhoto(candidate) &&
    isAgeCompatible(me, candidate) &&
    isCountryCompatible(me, candidate) &&
    isDistanceCompatible(me, candidate)
  );
}

function daysSince(date) {
  return Math.max(0, Math.floor((Date.now() - new Date(date).getTime()) / (24 * 60 * 60 * 1000)));
}

export function scoreCandidate(me, candidate, { incoming7d = 0 }) {
  const factors = [];
  let score = 0;

  const completeness = calculateProfileCompleteness(candidate);
  const completenessPts = Math.round(completeness * 0.2);
  score += completenessPts;
  if (completenessPts > 0) {
    factors.push({ key: 'completeness', label: 'Potpunost profila', points: completenessPts, detail: `${completeness}%` });
  }

  if (candidate.photoVerified) {
    score += 5;
    factors.push({ key: 'verified', label: 'Verificirana fotografija', points: 5 });
  }

  const tagMatch = scorePublicTagOverlap(me, candidate);
  if (tagMatch.points > 0) {
    score += tagMatch.points;
    factors.push({
      key: 'shared_tags',
      label: 'Zajednički interesi',
      points: tagMatch.points,
      detail: tagMatch.overlap.join(', ')
    });
  }

  const lifestyleMatch = scoreLifestyleOverlap(
    lifestyleFieldsFromProfile(me),
    lifestyleFieldsFromProfile(candidate)
  );
  if (lifestyleMatch.points > 0) {
    score += lifestyleMatch.points;
    factors.push({
      key: 'shared_lifestyle',
      label: 'Podudaranje životnih navika',
      points: lifestyleMatch.points,
      detail: lifestyleMatch.matches.join(', ')
    });
  }

  const waitingDays = daysSince(candidate.createdAt);
  if (incoming7d === 0) {
    const waitingPts = Math.min(waitingDays, 30) * 2;
    score += waitingPts;
    factors.push({
      key: 'fair_waiting',
      label: 'Čeka kontakt (fer boost)',
      points: waitingPts,
      detail: `${waitingDays} dana bez dolaznih zahtjeva (7d)`
    });
  } else {
    factors.push({
      key: 'has_incoming',
      label: 'Ima dolazne zahtjeve (7d)',
      points: 0,
      detail: `${incoming7d} zahtjeva`
    });
  }

  const planNote = candidate.planTier && candidate.planTier !== 'free'
    ? `Paket: ${candidate.planTier}`
    : 'Besplatni paket';
  factors.push({
    key: 'no_plan_boost',
    label: 'Paket ne utječe na rang',
    points: 0,
    detail: planNote
  });

  return { score, factors, completeness, waitingDays, incoming7d };
}

export async function buildRankedFeed(me, { blockedIds, logSnapshot = false, recordSnapshot }) {
  const since7d = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  const profiles = await prisma.userProfile.findMany({
    where: { id: { not: me.id }, availability: 'AVAILABLE' },
    take: 80
  });

  const compatible = profiles.filter(
    (candidate) => !blockedIds.has(candidate.id) && isFeedCompatible(me, candidate)
  );
  const candidateIds = compatible.map((c) => c.id);

  const incomingRows = candidateIds.length
    ? await prisma.matchContact.groupBy({
        by: ['targetId'],
        where: { targetId: { in: candidateIds }, createdAt: { gt: since7d } },
        _count: { targetId: true }
      })
    : [];
  const incomingByTarget = new Map(incomingRows.map((row) => [row.targetId, row._count.targetId]));

  const ranked = compatible
    .map((candidate) => {
      const incoming7d = incomingByTarget.get(candidate.id) || 0;
      const { score, factors, completeness, waitingDays } = scoreCandidate(me, candidate, { incoming7d });
      return {
        profileId: candidate.id,
        displayName: candidate.displayName,
        city: candidate.city,
        identity: candidate.identity,
        score,
        factors,
        completeness,
        candidate,
        incoming7d,
        waitingDays
      };
    })
    .sort((a, b) => b.score - a.score || new Date(b.candidate.createdAt) - new Date(a.candidate.createdAt));

  const withRank = ranked.map((row, index) => ({ ...row, rank: index + 1 }));

  if (logSnapshot && recordSnapshot) {
    recordSnapshot(me.id, withRank).catch(() => {});
  }

  const items = withRank.map((row) => {
    const overlap = tagsOverlap(me.publicTags, row.candidate.publicTags);
    const feedSignals = [];
    if (overlap.length > 0) feedSignals.push('shared_interests');
    if (row.candidate.photoVerified) feedSignals.push('verified');
    if (row.completeness >= 85) feedSignals.push('complete_profile');
    if (row.incoming7d === 0 && row.waitingDays >= 3) feedSignals.push('fair_waiting');
    if (row.candidate.lifetimeDonatedCents > 0 && row.candidate.donorBadgeVisible !== false) {
      feedSignals.push('community_supporter');
    }

    return toPublicProfile(row.candidate, {
      completeness: row.completeness,
      distanceLabel: distanceLabelForProfiles(me, row.candidate),
      commonTags: overlap,
      feedSignals,
      awaitingContact: shouldShowAwaitingContact({
        incoming7d: row.incoming7d,
        waitingDays: row.waitingDays
      }),
      fullProfile: row.completeness >= 90,
      isDonorSupporter:
        row.candidate.lifetimeDonatedCents > 0 && row.candidate.donorBadgeVisible !== false
    });
  });

  return { items, rankings: withRank };
}

export const FEED_PRINCIPLE_KEYS = [
  'compatibility_filter',
  'no_plan_boost',
  'fair_waiting_boost',
  'interest_lifestyle_points',
  'completeness_verification',
  'active_pairs_hidden'
];

export async function explainFeedForViewer(viewerProfileId) {
  const me = await prisma.userProfile.findUnique({ where: { id: viewerProfileId } });
  if (!me) return null;

  const [blockedByMe, blockedMe] = await Promise.all([
    prisma.userBlock.findMany({ where: { blockerId: viewerProfileId }, select: { blockedId: true } }),
    prisma.userBlock.findMany({ where: { blockedId: viewerProfileId }, select: { blockerId: true } })
  ]);
  const blockedIds = new Set([
    ...blockedByMe.map((b) => b.blockedId),
    ...blockedMe.map((b) => b.blockerId)
  ]);

  const { rankings } = await buildRankedFeed(me, { blockedIds, logSnapshot: false });
  return {
    viewer: { id: me.id, displayName: me.displayName, city: me.city, identity: me.identity },
    principles: FEED_PRINCIPLE_KEYS,
    principlesLegacy: [
      'Kompatibilnost (preferencije + namjere) je obavezni filter',
      'Dobni raspon i udaljenost filtriraju feed kad su postavljeni',
      'Paket (free/plus/supporter) ne daje bodove za rang',
      'Korisnici bez dolaznih zahtjeva duže čekaju — dobivaju fer boost',
      'Podudaranje interesa i životnih navika daje male bodove u feedu',
      'Potpunost profila i verifikacija daju male, transparentne bodove'
    ],
    rankings: rankings.slice(0, 20).map((row) => ({
      rank: row.rank,
      profileId: row.profileId,
      displayName: row.displayName,
      city: row.city,
      identity: row.identity,
      score: row.score,
      factors: row.factors
    }))
  };
}
