/**
 * Realigns locale files to match hr.js key structure.
 * Reads existing translations from alternate key paths used in en-derived files.
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath, pathToFileURL } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const messagesDir = path.join(__dirname, '../frontend/src/lib/i18n/messages');

const hr = (await import(pathToFileURL(path.join(messagesDir, 'hr.js')).href)).default;

/** hr path -> alternative paths in en-style locale files */
const HR_ALT_PATHS = {
  'meta.titles.home': ['meta.homeTitle'],
  'meta.descriptions.home': ['meta.homeDescription'],
  'meta.titles.auth': ['meta.authTitle'],
  'meta.descriptions.auth': ['meta.authDescription'],
  'meta.titles.plans': ['meta.plansTitle'],
  'meta.descriptions.plans': ['meta.plansDescription'],
  'meta.titles.faq': ['meta.helpTitle'],
  'meta.descriptions.faq': ['meta.helpDescription'],
  'meta.titles.guidelines': ['meta.guidelinesTitle'],
  'meta.descriptions.guidelines': ['meta.guidelinesDescription'],
  'meta.titles.privacy': ['meta.privacyTitle'],
  'meta.descriptions.privacy': ['meta.privacyDescription'],
  'meta.titles.terms': ['meta.termsTitle'],
  'meta.descriptions.terms': ['meta.termsDescription'],
  'meta.titles.contact': ['meta.contactTitle'],
  'meta.descriptions.contact': ['meta.contactDescription'],
  'meta.titles.settings': ['meta.settingsTitle'],
  'meta.descriptions.settings': ['meta.settingsDescription'],
  'meta.titles.app': ['meta.dashboardTitle'],
  'meta.descriptions.app': ['meta.dashboardDescription'],
  'meta.titles.chat': ['meta.chatTitle'],
  'meta.descriptions.chat': ['meta.chatDescription'],
  'meta.titles.profile': ['meta.profileTitle'],
  'meta.descriptions.profile': ['meta.profileDescription'],
  'meta.titles.onboarding': ['meta.onboardingTitle'],
  'meta.descriptions.onboarding': ['meta.onboardingDescription'],
  'meta.titles.donate': ['meta.donateTitle'],
  'meta.descriptions.donate': ['meta.donateDescription'],
  'meta.titles.admin': ['meta.adminTitle'],
  'meta.descriptions.admin': ['meta.adminDescription'],
  'footer.navLabel': ['footer.ariaLabel'],
  'footer.mobileDockLabel': ['nav.quickNav'],
  'footer.mySpace': ['footer.dockMySpace'],
  'video.externalLink': ['video.watchExternal'],
  'home.communityCount': ['home.socialProofAvailable'],
  'home.contacts30d': ['home.socialProofContacts'],
  'home.activeCities': ['home.socialProofCities'],
  'home.chipNoPaywall': ['home.chipNoReach'],
  'home.chipAntiSpam': ['home.chipSpamProtection'],
  'home.howItWorks': ['home.stepsHeading'],
  'home.safetyTitle': ['home.safetyHeading'],
  'home.whyTitle': ['home.valuesHeading'],
  'home.pricingTitle': ['home.pricingHeading'],
  'home.faqTitle': ['home.faqHeading'],
  'home.faqLead': ['home.faqText'],
  'home.ctaTitle': ['home.ctaHeading'],
  'home.ctaSubtitle': ['home.ctaSubtext'],
  'home.ctaFree': ['home.ctaButton'],
  'settings.photos': ['settings.photosLabel'],
  'settings.bio': ['settings.bioLabel'],
  'settings.locationLegend': ['settings.distanceLegend'],
  'settings.locationHint': ['settings.distanceHint'],
  'settings.videoUrlPlaceholder': ['settings.videoInputPlaceholder'],
  'settings.availabilityLabel': ['settings.visibilityLabel'],
  'settings.availabilityAvailable': ['settings.visibilityAvailable'],
  'settings.availabilityPaused': ['settings.visibilityPaused'],
  'settings.availabilityFocused': ['settings.visibilityFocused'],
  'settings.gdprTitle': ['settings.privacyTitle'],
  'settings.gdprHint': ['settings.privacyHint'],
  'settings.dangerTitle': ['settings.dangerZoneTitle'],
  'settings.dangerHint': ['settings.dangerZoneHint'],
  'settings.locationFailed': ['settings.locationUnavailable'],
  'settings.planSuccess': ['settings.planPaymentSuccess'],
  'settings.checkoutFailed': ['settings.checkoutUnavailable'],
  'dashboard.incompleteTitle': ['dashboard.incompleteProfile'],
  'dashboard.policyTitle': ['dashboard.policyHeading'],
  'dashboard.availability': ['dashboard.statusAvailability'],
  'dashboard.completeness': ['dashboard.statusCompleteness'],
  'dashboard.rating': ['dashboard.statusRating'],
  'dashboard.openChatBtn': ['dashboard.openChat'],
  'dashboard.closeContact': ['dashboard.endConversation'],
  'dashboard.accept': ['dashboard.accept'],
  'dashboard.decline': ['dashboard.decline'],
  'dashboard.gateHint': ['dashboard.gateText'],
  'dashboard.emptyHint': ['dashboard.emptyText'],
  'dashboard.seenAllHint': ['dashboard.seenAllText'],
  'dashboard.seenAllAgain': ['dashboard.seenAllButton'],
  'dashboard.blocked': ['dashboard.userBlocked'],
  'dashboard.reported': ['dashboard.reportReceived'],
  'dashboard.accepted': ['dashboard.contactAccepted'],
  'dashboard.declined': ['dashboard.contactDeclined'],
  'dashboard.closed': ['dashboard.pairClosed'],
  'chat.back': ['common.back'],
  'profile.requestFailed': ['profile.sendFailed'],
  'profile.reportDone': ['profile.reportReceived'],
  'onboarding.finishIncomplete': ['onboarding.finishNotReady'],
  'onboarding.finishHint': ['onboarding.finishTitle'],
  'onboarding.incompleteError': ['onboarding.incomplete'],
  'donate.sectionLead': ['donate.sectionText'],
  'donate.revolutBtn': ['donate.revolutButton'],
  'donate.stripeRedirecting': ['donate.redirecting'],
  'donate.stripeFailed': ['donate.cardUnavailable'],
  'donate.copyRef': ['donate.copyReference'],
  'donate.defaultReference': ['donate.referenceDefault'],
  'invite.hint': ['invite.text'],
  'swipe.stampLike': ['swipe.interesting'],
  'swipe.stampPass': ['swipe.pass'],
  'swipe.ariaPass': ['swipe.passAria'],
  'swipe.ariaLike': ['swipe.likeAria'],
  'pricing.heroChipChat': ['pricing.chipFreeChat'],
  'pricing.heroChipFair': ['pricing.chipNoReach'],
  'pricing.heroChipNotice': ['pricing.chipNotice'],
  'pricing.ctaLead': ['pricing.ctaText'],
  'pricing.ctaBack': ['pricing.ctaHome'],
  'pricing.policy.headline': ['pricing.policyHeadline'],
  'pricing.policy.lead': ['pricing.policyLead'],
  'pricing.policy.promisesIntro': ['pricing.promisesIntro'],
  'pricing.policy.triggersIntro': ['pricing.triggersIntro'],
  'pricing.policy.footnote': ['pricing.footnote'],
  'pricing.valuesAriaLabel': ['pricing.valuesAria'],
  'pricing.planBtnIncluded': ['pricing.planButtonFree'],
  'pricing.planBtnSoon': ['pricing.planButtonSoon'],
  'pricing.planBtnDisabled': ['pricing.planButtonDisabled'],
  'contact.emailHint': ['contact.emailResponse'],
  'contact.emergencyHint': ['contact.emergencyText'],
  'legal.back': ['common.back'],
  'legal.privacy.title': ['legal.privacyTitle'],
  'legal.privacy.description': ['legal.privacyDescription'],
  'legal.terms.title': ['legal.termsTitle'],
  'legal.terms.description': ['legal.termsDescription'],
  'legal.guidelines.title': ['legal.guidelinesTitle'],
  'legal.guidelines.description': ['legal.guidelinesDescription'],
  'admin.stats.totalProfiles': ['admin.statTotalProfiles'],
  'admin.stats.available': ['admin.statAvailable'],
  'admin.stats.focused': ['admin.statFocused'],
  'admin.stats.paused': ['admin.statPaused'],
  'admin.stats.suspended': ['admin.statSuspended'],
  'admin.stats.openReports': ['admin.statOpenReports'],
  'admin.stats.pendingContacts': ['admin.statPendingContacts'],
  'admin.stats.matches30d': ['admin.statAccepted30d'],
  'admin.stats.messages7d': ['admin.statMessages7d'],
  'admin.closeInactive': ['admin.closeInactivePairs'],
  'admin.tableName': ['admin.colName'],
  'admin.tableEmail': ['admin.colEmail'],
  'admin.tableCity': ['admin.colCity'],
  'admin.tableRole': ['admin.colRole'],
  'admin.tablePlan': ['admin.colPlan'],
  'admin.tableStatus': ['admin.colStatus'],
  'admin.tableActions': ['admin.colActions'],
  'admin.setAdmin': ['admin.makeAdmin'],
  'admin.deleteUserTitle': ['admin.deleteUser'],
  'audit.tabs.timeline': ['audit.tabTimeline'],
  'audit.tabs.moderation': ['audit.tabModeration'],
  'audit.tabs.fairness': ['audit.tabFairness'],
  'audit.tabs.feed': ['audit.tabFeed'],
  'audit.tabs.compliance': ['audit.tabCompliance'],
  'audit.allCategories': ['audit.categoryAll'],
  'audit.actor': ['audit.from'],
  'audit.target': ['audit.to'],
  'audit.moderationHint': ['audit.moderationHistory'],
  'audit.feedHint': ['audit.feedExplain'],
  'audit.feedViewer': ['audit.feedExplain'],
  'audit.tableRank': ['audit.colRank'],
  'audit.tableProfile': ['audit.colProfile'],
  'audit.tableCity': ['audit.colCity'],
  'audit.tableScore': ['audit.colScore'],
  'audit.tableFactors': ['audit.colFactors'],
  'audit.resolveOutcome': ['audit.outcomeLabel'],
  'audit.resolveAction': ['audit.actionLabel'],
  'audit.resolveNotes': ['audit.notesPlaceholder'],
  'audit.resolveSubmit': ['audit.resolveAndLog'],
  'audit.actionNone': ['audit.actionNone'],
  'audit.actionWarn': ['audit.actionWarn'],
  'audit.actionSuspend': ['audit.actionSuspend'],
  'audit.actionDelete': ['audit.actionDeleteUser'],
  'donatePrompt.support': ['donatePrompt.match.support', 'donatePrompt.milestone.support'],
  'donatePrompt.notNow': ['donatePrompt.match.notNow', 'donatePrompt.milestone.notNow'],
  'donatePrompt.neverAgain': ['donatePrompt.match.neverAgain', 'donatePrompt.milestone.neverAgain']
};

// Legal sections: legal.privacy.sections.N -> legal.privacySections.N
for (let i = 0; i < 20; i++) {
  for (const kind of ['privacy', 'terms', 'guidelines']) {
    HR_ALT_PATHS[`legal.${kind}.sections.${i}.title`] = [`legal.${kind}Sections.${i}.title`];
    HR_ALT_PATHS[`legal.${kind}.sections.${i}.body`] = [`legal.${kind}Sections.${i}.body`];
  }
}

function getNested(obj, dotPath) {
  if (!obj || !dotPath) return undefined;
  return dotPath.split('.').reduce((acc, key) => {
    if (acc === undefined || acc === null) return undefined;
    if (Array.isArray(acc) && /^\d+$/.test(key)) return acc[Number(key)];
    return acc[key];
  }, obj);
}

function alignNode(hrNode, source, dotPath) {
  if (typeof hrNode === 'string') {
    const direct = getNested(source, dotPath);
    if (typeof direct === 'string') return direct;
    const alts = HR_ALT_PATHS[dotPath] || [];
    for (const alt of alts) {
      const val = getNested(source, alt);
      if (typeof val === 'string') return val;
    }
    return hrNode;
  }
  if (Array.isArray(hrNode)) {
    return hrNode.map((item, i) => alignNode(item, source, `${dotPath}.${i}`));
  }
  if (hrNode && typeof hrNode === 'object') {
    const out = {};
    for (const [k, v] of Object.entries(hrNode)) {
      const childPath = dotPath ? `${dotPath}.${k}` : k;
      out[k] = alignNode(v, source, childPath);
    }
    return out;
  }
  return hrNode;
}

function serialize(obj, indent = 0) {
  const pad = '  '.repeat(indent);
  const padIn = '  '.repeat(indent + 1);
  if (typeof obj === 'string') {
    return JSON.stringify(obj);
  }
  if (Array.isArray(obj)) {
    if (obj.every((x) => typeof x === 'string')) {
      return `[\n${padIn}${obj.map((s) => serialize(s, indent + 1)).join(`,\n${padIn}`)}\n${pad}]`;
    }
    return `[\n${obj.map((item) => `${padIn}${serialize(item, indent + 1)}`).join(',\n')}\n${pad}]`;
  }
  const entries = Object.entries(obj);
  if (entries.length === 0) return '{}';
  const lines = entries.map(([k, v]) => {
    const key = /^[a-zA-Z_$][a-zA-Z0-9_$]*$/.test(k) ? k : `'${k}'`;
    const val = serialize(v, indent + 1);
    if (typeof v === 'string' && v.includes('\n')) {
      return `${padIn}${key}: ${val.startsWith("'") ? val : val}`;
    }
    return `${padIn}${key}: ${val}`;
  });
  return `{\n${lines.join(',\n')}\n${pad}}`;
}

const locales = ['en', 'de', 'sl', 'bs', 'sr', 'it', 'hu', 'pl', 'cs', 'fr', 'es', 'sk'];

for (const code of locales) {
  const mod = await import(pathToFileURL(path.join(messagesDir, `${code}.js`)).href);
  const source = mod.default;
  const aligned = alignNode(hr, source, '');
  const content = `export default ${serialize(aligned, 0)};\n`;
  fs.writeFileSync(path.join(messagesDir, `${code}.js`), content, 'utf8');
  console.log(`Realigned ${code}.js`);
}

console.log('Done.');
