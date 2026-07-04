export default {
  lang: {
    hr: "Hrvatski",
    en: "English",
    de: "Deutsch",
    sl: "Slovenščina",
    bs: "Bosanski",
    sr: "Srpski",
    it: "Italiano",
    hu: "Magyar",
    pl: "Polski",
    cs: "Čeština",
    fr: "Français",
    es: "Español",
    sk: "Slovenčina"
  },
  langPicker: {
    label: "Choose language",
    hint: "13 languages — pick yours"
  },

  nav: {
    home: "Home",
    login: "Log in",
    plans: "Plans",
    help: "Help",
    contact: "Contact",
    mySpace: "My space",
    settings: "Settings",
    admin: "Admin",
    logout: "Log out",
    menu: "Menu",
    close: "Close",
    greeting: "Hello, {name}",
    quickNav: "Quick navigation",
    mySpaceUnread: "My space ({count})",
    donate: "Support"
  },
  auth: {
    welcome: "Welcome to Ravnopar",
    welcomeLogin: "Log in",
    subtitleRegister: "Three simple steps to your profile.",
    subtitleLogin: "Enter your email and password to access your profile.",
    stepAccount: "Account",
    stepVerify: "Verification",
    stepLogin: "Log in",
    stepReset: "Reset",
    stepNewPassword: "New password",
    createAccount: "1. Create account",
    referralApplied: "Invite applied — thanks for joining through a friend.",
    email: "Email",
    password: "Password",
    displayName: "Display name",
    dateOfBirth: "Date of birth",
    day: "Day",
    month: "Month",
    year: "Year",
    city: "City",
    country: "Country",
    language: "Language",
    identity: "Your identity",
    profileType: "Profile type",
    aboutOptional: "About me (optional)",
    aboutPlaceholder: "Introduce yourself briefly...",
    seekingWho: "Who you are looking for",
    seekingType: "Profile type you seek",
    seekingIntent: "What you are looking for",
    continueVerify: "Continue to verification",
    saving: "Saving...",
    hasAccount: "Already have an account?",
    signIn: "Log in",
    verifyTitle: "2. Confirm email",
    verifyHint: "Enter the 6-digit code you received by email.",
    verifyCode: "Verification code",
    back: "Back",
    confirmEmail: "Confirm email",
    checking: "Checking...",
    loginTitle: "3. Log in",
    loginTitleOnly: "Log in",
    forgotPassword: "Forgot password?",
    loggingIn: "Logging in...",
    enterApp: "Enter Ravnopar",
    noAccount: "Don't have an account?",
    register: "Sign up",
    resetTitle: "Reset password",
    resetHint: "We will send a code to your email if the account exists.",
    sendCode: "Send code",
    sending: "Sending...",
    newPasswordTitle: "New password",
    newPassword: "New password",
    savePassword: "Save password",
    backHome: "← Back to home",
    captchaRequired: "Complete captcha before registering.",
    registerSuccess: "Account created. Enter the verification code you received.",
    registerFailed: "Registration failed. Check your details and try again.",
    verifySuccess: "Email confirmed. You can log in now.",
    verifyFailed: "Verification failed. Check the code and try again.",
    loginFailed: "Login failed. Check your email and password.",
    resetSuccess: "Password changed. Please log in.",
    resetFailed: "Reset failed.",
    checkEmail: "Check your email.",
    dobInvalid: "Choose a valid date of birth (18+).",
    dobInvalidMonth: "Invalid month — enter a number from 01 to 12.",
    dobInvalidDay: "Day must be at least 01.",
    dobInvalidDayForMonth: "That month has no day {day} (maximum is {max}).",
    dobFeb29NotLeap: "29 February {year} does not exist — that year is not a leap year.",
    dobInvalidYear: "Year must be between {min} and {max}.",
    dobUnderage: "You must be at least 18 years old.",
    dobPlaceholder: "15.03.1985",
    dobFormatHint: "One field — enter day, month and year (e.g. 15.03.1985).",
    dobSelected: "Selected: {date}"
  },
  months: [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December"
  ],
  countries: {
    HR: "Croatia",
    SI: "Slovenia",
    BA: "Bosnia and Herzegovina",
    RS: "Serbia",
    ME: "Montenegro",
    MK: "North Macedonia",
    AT: "Austria",
    DE: "Germany",
    CH: "Switzerland",
    IT: "Italy",
    HU: "Hungary",
    SK: "Slovakia",
    CZ: "Czechia",
    PL: "Poland",
    GB: "United Kingdom",
    IE: "Ireland",
    US: "United States",
    CA: "Canada",
    FR: "France",
    ES: "Spain",
    PT: "Portugal",
    NL: "Netherlands",
    BE: "Belgium",
    LU: "Luxembourg",
    SE: "Sweden",
    NO: "Norway",
    DK: "Denmark",
    FI: "Finland",
    GR: "Greece",
    RO: "Romania",
    BG: "Bulgaria",
    UA: "Ukraine",
    TR: "Turkey",
    AU: "Australia",
    NZ: "New Zealand"
  },
  api: {
    ADULTS_ONLY: "Only adults (18+) can register.",
    EMAIL_EXISTS: "Email already exists.",
    INVALID_PAYLOAD: "Invalid data. Check your input and try again.",
    INVALID_CODE: "Invalid or expired code.",
    INVALID_CREDENTIALS: "Invalid email or password.",
    EMAIL_NOT_VERIFIED: "Email not verified. Check your inbox.",
    ACCOUNT_SUSPENDED: "Account suspended. Contact support.",
    PROFILE_NOT_FOUND: "Profile not found.",
    CAPTCHA_FAILED: "Captcha verification failed.",
    CAPTCHA_REQUIRED: "Captcha verification required.",
    INVALID_SUBMISSION: "Invalid submission.",
    SEEKING_AGE_UNDER_MIN: "The seeking age range cannot be below 18.",
    SEEKING_AGE_OVER_MAX: "The seeking age range cannot be above 99.",
    SEEKING_AGE_INVERTED: "Minimum seeking age must be less than or equal to maximum."
  },
  errors: {
    generic: "Something went wrong. Please try again."
  },
  identity: {
    MALE: "Male",
    FEMALE: "Female",
    NON_BINARY: "Non-binary",
    OTHER: "Other"
  },
  profileType: {
    INDIVIDUAL: "Individual",
    COUPLE: "Couple"
  },
  intent: {
    CHAT: "Chat",
    CASUAL: "Casual",
    RELATIONSHIP: "Relationship",
    MARRIAGE: "Marriage",
    ADVENTURE: "Adventure"
  },
  relationship: {
    SINGLE: "Single",
    OPEN: "In a relationship (open to meeting)",
    COMPLICATED: "It's complicated"
  },
  children: {
    NONE: "No children",
    HAS: "Has children",
    WANTS_SOMEDAY: "Wants children someday",
    NOT_IMPORTANT: "Not important to me"
  },
  smoking: {
    NO: "Non-smoker",
    SOMETIMES: "Occasional smoker",
    YES: "Smoker"
  },
  activity: {
    online: "Online",
    today: "Active today",
    week: "Active this week",
    daysAgo: "Active {days} days ago"
  },
  tags: {
    remove: "Remove",
    addCustom: "Add",
    customPlaceholder: "Custom tag (e.g. hiking)",
    count: "{current}/{max} tags",
    common: "In common: {tags}",
    public: {
      READING: "Reading",
      HIKING: "Hiking",
      ANIMALS: "Animals",
      COFFEE: "Coffee",
      MUSIC: "Music",
      TRAVEL: "Travel",
      SPORTS: "Sports",
      COOKING: "Cooking",
      GAMING: "Gaming",
      ART: "Art",
      NATURE: "Nature",
      MOVIES: "Movies",
      DANCING: "Dancing",
      PHOTOGRAPHY: "Photography"
    },
    private: {
      CASUAL_SEX: "Casual / physical",
      NO_RUSH_INTIMACY: "No rush with intimacy",
      CUDDLES: "Cuddles and affection",
      OPEN_MINDED: "Open to talking about desires",
      MONOGAMOUS: "Monogamous intimacy",
      EXPLORING: "Still exploring what I want",
      FRIENDSHIP_FIRST: "Friendship first",
      LONG_TERM_FOCUS: "Long-term focus"
    }
  },
  availability: {
    AVAILABLE: "Available",
    FOCUSED_CONTACT: "In conversation",
    PAUSED: "Paused"
  },
  role: {
    USER: "User",
    ADMIN: "Administrator"
  },
  planTier: {
    free: "Free",
    plus: "Plus",
    supporter: "Supporter"
  },
  reportStatus: {
    OPEN: "Open",
    IN_REVIEW: "In review",
    RESOLVED: "Resolved",
    DISMISSED: "Dismissed"
  },
  auditCategory: {
    ADMIN_ACTION: "Admin",
    MODERATION: "Moderation",
    SECURITY: "Security",
    FEED_RANKING: "Feed ranking",
    COMPLIANCE: "Compliance"
  },
  auditAction: {
    SUSPEND: "Suspend",
    UNSUSPEND: "Unsuspend",
    DELETE_USER: "Delete",
    PLAN_CHANGE: "Plan change",
    ROLE_CHANGE: "Role change",
    VERIFY_PHOTO: "Verification",
    UNVERIFY_PHOTO: "Remove verification",
    VERIFY_REJECT: "Reject selfie",
    AVAILABILITY_CHANGE: "Status change",
    ONBOARDING_CHANGE: "Onboarding",
    REPORT_RESOLVED: "Report resolved",
    BLOCK: "Block",
    REPORT: "Report",
    FEED_SNAPSHOT: "Feed snapshot",
    DATA_EXPORT: "Data export",
    ACCOUNT_DELETE_SELF: "Account deletion",
    ACCOUNT_DELETE: "Account deletion",
    ADMIN_USER_SEARCH: "Admin search"
  },
  moderationAction: {
    NONE: "No action",
    WARN: "Warning",
    SUSPEND: "Suspend",
    DELETE: "Delete"
  },
  common: {
    back: "Back",
    backHome: "← Back to home",
    backToApp: "← Back to My space",
    loading: "Loading...",
    saving: "Saving...",
    save: "Save",
    remove: "Remove",
    copy: "Copy",
    copied: "Copied",
    user: "User",
    yearsShort: "yrs",
    question: "Question",
    answer: "Answer",
    yes: "Yes",
    no: "No",
    close: "Close",
    refresh: "Refresh",
    confirm: "Confirm",
    cancel: "Cancel",
    unreadCount: "{count} new",
    percent: "{percent}%",
    photoCount: "{current}/{max}"
  },
  meta: {
    defaultTitle: "Ravnopar",
    defaultDescription: "Ravnopar — a fair dating platform. No paywall for conversation, chat after a match, and transparent rules.",
    titles: {
      home: "Fair dating without a paywall",
      auth: "Sign up / Log in",
      settings: "Settings",
      app: "My space",
      chat: "Conversation",
      profile: "Profile",
      onboarding: "Welcome",
      donate: "Support the project",
      plans: "Plans",
      faq: "Help & FAQ",
      guidelines: "Community guidelines",
      privacy: "Privacy policy",
      terms: "Terms of service",
      contact: "Contact",
      fairFeed: "How the fair feed works",
      fairnessReport: "Fairness report",
      donatePublic: "Support the project",
      admin: "Admin"
    },
    descriptions: {
      home: "Free dating without a paywall — fair dating for Europe. Chat after a match, transparent rules. 18+.",
      auth: "Create your Ravnopar account or log in.",
      settings: "Edit your profile, photos, notifications, and privacy.",
      app: "Your Ravnopar feed, conversations, and contact requests.",
      chat: "Private chat with your match.",
      profile: "View a Ravnopar profile.",
      onboarding: "A quick guide to Ravnopar.",
      donate: "Voluntarily support Ravnopar server costs.",
      plans: "Ravnopar pricing model — free chat, premium plans prepared in advance.",
      faq: "Free dating, chat without subscription, fair feed — FAQ about Ravnopar.",
      guidelines: "What is allowed, what is not, and how to stay safe on Ravnopar.",
      privacy: "How Ravnopar collects, uses, and protects your data.",
      terms: "Terms for using the Ravnopar platform.",
      contact: "Contact the Ravnopar team for support, privacy, and reports.",
      fairFeed: "How Ravnopar ranks profiles — transparent rules, no paid boost.",
      fairnessReport: "Public fairness metrics and premium red lines.",
      donatePublic: "Voluntarily support Ravnopar server costs — no feed advantage.",
      admin: "Ravnopar admin center."
    }
  },
  footer: {
    plans: "Plans",
    help: "Help",
    fairFeed: "Fair feed",
    fairnessReport: "Report",
    guidelines: "Guidelines",
    privacy: "Privacy",
    terms: "Terms",
    contact: "Contact",
    donate: "Support the project",
    settings: "Settings",
    copyright: "© {year} Ravnopar · 18+ · Fair dating",
    navLabel: "Footer",
    mobileDockLabel: "Quick navigation",
    mySpace: "My space"
  },
  cookie: {
    ariaLabel: "Cookies",
    message:
      "We use essential cookies for login. Analytics (Plausible) runs without tracking cookies and does not identify you. Learn more in our",
    privacyLink: "privacy policy",
    accept: "Got it"
  },
  theme: {
    toggle: "Change theme"
  },
  gallery: {
    prev: "Previous",
    next: "Next"
  },
  video: {
    embedTitle: "Profile video",
    externalLink: "Watch profile video"
  },
  avatar: {
    alt: "Profile photo: {name}"
  },
  home: {
    donateThanks: "Thank you for your donation! Your support helps keep Ravnopar running.",
    eyebrow: "Dating without reach manipulation",
    title: "Ravnopar",
    lead: "A fair platform for meeting people: profiles with photos, chat after a match, and rules that are clear from the start.",
    communityCount: "{count}+ available in the community",
    contacts30d: "{count} contacts (30 days)",
    activeCities: "Active: {cities}",
    ctaStart: "Get started",
    ctaLogin: "I already have an account",
    chipNoPaywall: "No hidden reach limits",
    chipChatAfterMatch: "Chat after a match",
    chipAntiSpam: "Spam protection",
    showcaseEyebrow: "Experience preview",
    showcaseTitle: "Meet people like in a dating app — without a paywall",
    showcaseText: "Swipe cards, photo galleries, and chat after a match. Fair rules stay the same.",
    showcaseMockName: "Maya, 28 · Zagreb",
    showcaseMockBio: "I love coffee, hiking, and honest conversation.",
    howItWorks: "How it works",
    steps: [
      {
        title: "Sign up",
        text: "Create your profile, add a photo and a short description, and choose who you are looking for."
      },
      {
        title: "Meet people",
        text: "Browse a feed of available profiles without hidden reach reduction."
      },
      {
        title: "Talk fairly",
        text: "Once mutual contact is established, open chat and talk in the app."
      }
    ],
    safetyTitle: "Safety and community",
    safetyItems: [
      {
        icon: "🛡️",
        title: "Block and report",
        text: "You can block or report an uncomfortable profile to the admin team."
      },
      {
        icon: "✉️",
        title: "Verified email",
        text: "Registration requires email confirmation — fewer fake profiles."
      },
      {
        icon: "🤝",
        title: "Community rules",
        text: "Clear behavior rules and respect for other users’ boundaries."
      },
      {
        icon: "⏸️",
        title: "Visibility control",
        text: "Pause your profile or delete your account whenever you want — in Settings."
      }
    ],
    safetyLink: "Read community guidelines →",
    whyTitle: "Why Ravnopar",
    values: [
      {
        title: "No paywall for conversation",
        text: "Basic communication is available to everyone — without artificial barriers."
      },
      {
        title: "Fair visibility",
        text: "Active pairs temporarily leave the feed so others still get a chance."
      },
      {
        title: "Protection and control",
        text: "Blocking, reports, and anti-spam limits protect community quality."
      }
    ],
    pricingTitle: "Pricing model",
    pricingEyebrow: "No surprises",
    pricingLead: "Ravnopar is free for conversation — and that is our intention. Premium will come only when the platform is stable, and you will know in advance.",
    pricingChipNoPaywall: "♥ No paywall",
    pricingChipFair: "Fair visibility",
    pricingLink: "Read the pricing model",
    faqTitle: "Questions?",
    faqLead: "How matches, chat, profile pause, and email notifications work — all in one place.",
    faqLink: "Help & FAQ",
    ctaTitle: "Ready for fair dating?",
    ctaSubtitle: "Registration takes a few minutes. You must be 18+.",
    ctaFree: "Start for free"
  },
  settings: {
    loading: "Loading settings...",
    backToApp: "← My space",
    title: "Profile settings",
    subtitle: "Completeness: {percent}% · Status: {status}",
    photos: "Photos ({current}/{max})",
    photosHint: "JPG/PNG, automatically resized. Max. 3 photos.",
    displayName: "Display name",
    city: "City",
    bio: "About me",
    bioPlaceholder: "Introduce yourself briefly — what you are looking for, what you enjoy...",
    publicTagsLegend: "Interests and hobbies (public)",
    publicTagsHint: "Up to 5 tags — visible on your profile and in the feed. Helps others see what you enjoy (reading, animals, sports…).",
    privateTagsLegend: "Intimate preferences (private)",
    privateTagsHint:
      "Up to 5 tags — visible only after a contact is accepted. Clearly signals what you want intimately (e.g. casual, no rush).",
    lifestyleLegend: "Life details (optional)",
    lifestyleHint:
      "Helps others understand context — not a search filter, but gives a small feed bonus when values match.",
    childrenLabel: "Children",
    smokingLabel: "Smoking",
    relationshipLabel: "Status",
    lifestyleUnset: "— prefer not to say",
    icebreakersLegend: "Icebreaker questions (up to 3)",
    icebreakersHint: "Short questions and answers — they help with first contact.",
    addIcebreaker: "Add icebreaker",
    preferencesLegend: "Matching preferences",
    preferencesHint: "Control which profiles you see in the feed — along with identity, intent, and compatibility.",
    seekingAgeMin: "Seeking age from",
    seekingAgeMax: "to",
    seekingAgeHint: "Mutual — others must also be seeking your age. Minimum age is 18.",
    seekingAgeUnder18: "The seeking age cannot be below 18.",
    ageRangeInvalid: "Minimum seeking age must be less than or equal to maximum.",
    seekingAgeOver99: "The seeking age cannot be above 99.",
    maxDistanceLabel: "Maximum distance",
    distanceUnlimited: "No limit",
    distanceKmOption: "Up to {km} km",
    maxDistanceHint:
      "To filter by distance, enable location in the section below. Profiles without location may still appear.",
    sameCountryOnly: "Only profiles from my country",
    sameCountryHint: "When enabled, you only see users from the same country as on your profile.",
    profileTypeLegend: "Profile type",
    seekingProfileTypeLegend: "Seeking profile type",
    locationLegend: "Distance (private)",
    locationHint: "Coordinates are not shown to others — only a rough distance (e.g. “5–15 km”). Both people must enable the option.",
    shareLocation: "Show distance from me to other users",
    loadLocation: "Load my location",
    locationSaved: "Location saved",
    videoLegend: "Profile video (link)",
    videoPlaceholder: "YouTube, Vimeo, Instagram, or TikTok link",
    videoUrlPlaceholder: "https://youtube.com/...",
    verificationLegend: "Profile verification",
    verificationHint: "Selfie for manual review by the admin team — compared with your profile photo. Not publicly visible.",
    verified: "Profile verified",
    verificationPending: "Selfie is under review — you will be notified after it is checked.",
    verificationSelfie: "Verification selfie",
    identityLegend: "Identity",
    seekingIdentityLegend: "Seeking identity",
    intentLegend: "Intent",
    availabilityLabel: "Profile visibility",
    availabilityAvailable: "Available in feed",
    availabilityPaused: "Paused (hidden)",
    availabilityFocused: "In active conversation",
    notifyEmail: "Email notifications (new requests, matches, messages)",
    saveProfile: "Save profile",
    premiumTitle: "Premium plans",
    premiumHint: "Checkout is ready — plan activation after payment.",
    gdprTitle: "Privacy (GDPR)",
    gdprHint: "Download a copy of your data in JSON format.",
    exportData: "Download my data",
    dangerTitle: "Danger zone",
    dangerHint: "Deleting your account removes your profile, messages, and contact history.",
    deleteAccount: "Delete account",
    photoAdded: "Photo added — click Save profile.",
    photoUploadFailed: "Photo upload failed.",
    exportDone: "Data export downloaded.",
    exportFailed: "Export failed.",
    selfieAdded: "Selfie added — save profile to submit for review.",
    selfieFailed: "Selfie upload failed.",
    geolocationUnsupported: "Your browser does not support geolocation.",
    locationLoaded: "Location loaded. Save profile.",
    locationFailed: "Location unavailable. Check your browser permissions.",
    locationRequired: "Use the “Load my location” button before saving when location sharing is enabled.",
    profileSaved: "Profile saved.",
    saveFailed: "Save failed.",
    deleteConfirm: "Permanently delete account? This action cannot be undone.",
    deleteFailed: "Account deletion failed.",
    planSuccess: "Payment received. Premium activation follows after verification.",
    checkoutFailed: "Premium checkout is not available.",
    ordersTitle: "Payment history",
    ordersHint: "Donations and premium payments linked to your account.",
    orderDonation: "Donation",
    orderPlan: "Premium plan",
    orderOther: "Payment",
    orderStatus_PAID: "Paid",
    orderStatus_PENDING: "Pending",
    orderStatus_FAILED: "Failed",
    orderStatus_CANCELLED: "Cancelled",
    donorBadgeVisible: "Show supporter badge on profile",
    donorBadgeHint:
      "The badge does not give feed priority — it only shows you supported the project. You can hide it anytime."
  },
  dashboard: {
    greeting: "Hello, {name}",
    subtitle: "Swipe profiles or use the buttons — one at a time, no rush.",
    feedCount: "{count} profiles in your feed",
    feedEmpty: "There are currently no compatible profiles in your feed.",
    settingsLink: "Profile settings",
    loading: "Loading...",
    incompleteTitle: "Your profile is not complete yet ({percent}%).",
    incompleteHint: "Add a photo, short description, and icebreaker — that increases your chances of contact.",
    completeProfile: "Complete profile",
    conversations: "Conversations",
    conversationsUnread: "Conversations ({unread} new)",
    openChat: "Open chat",
    policyTitle: "Along with preferences",
    policyNarrowAge: "Your age range is very narrow — consider widening it for more matches.",
    policySameCountry: "You filter to your country only — that significantly reduces the number of profiles.",
    policySmallDistance: "A small distance ({km} km) may limit profiles in your feed.",
    policyDistanceNoLocation:
      "You set a max distance but location is not enabled — the filter will not work until you load it in Settings.",
    statusTitle: "Your status",
    availability: "Availability",
    completeness: "Completeness",
    rating: "Average rating",
    activeContact: "You are currently talking with {partner}.",
    openChatBtn: "Open chat",
    closeContact: "End conversation",
    visibleInFeed: "You are visible in the feed — swipe profiles below.",
    incomingTitle: "Contact requests",
    accept: "Accept",
    decline: "Decline",
    discoverTitle: "Discover profiles",
    discoverCount: " · {count} for you",
    gateTitle: "Profile not ready for feed",
    gateHint: "Add a photo and short description (min. 10 characters) before sending requests and swiping.",
    gateOnboarding: "View intro",
    emptyTitle: "No new profiles",
    emptyHint: "Expand your city or preferences in Settings — or check back soon when someone new joins.",
    expandPreferences: "Expand preferences",
    seenAllTitle: "You have seen everyone",
    seenAllHint: "Come back later — new profiles appear regularly.",
    seenAllAgain: "Browse again",
    feedCounter: "{current} / {total}",
    contactSent: "Contact request sent.",
    contactSentWarning: "Request sent. {warning}",
    contactFailed: "Sending request failed.",
    blocked: "User blocked.",
    blockFailed: "Blocking failed.",
    reported: "Report received. Thank you.",
    reportFailed: "Report failed.",
    accepted: "Contact accepted.",
    declined: "Request declined.",
    respondFailed: "Response was not saved.",
    closed: "Contact closed. You are available in the feed again.",
    closeFailed: "Closing failed.",
    reportReason: "Inappropriate behaviour",
    reportNote: "Report from the user interface.",
    blockReason: "User preference",
    closeReason: "User closed the contact"
  },
  chat: {
    backToApp: "← My space",
    title: "Conversation",
    loading: "Loading...",
    unavailable: "Chat is not available.",
    empty: "Send the first message — you can also use an icebreaker from the profile.",
    read: "Read",
    react: "React",
    typing: "Typing…",
    placeholder: "Write a message...",
    send: "Send",
    sending: "Sending...",
    back: "Back",
    sendFailed: "Sending message failed."
  },
  profile: {
    back: "← Back",
    loading: "Loading...",
    unavailable: "Profile is not available.",
    verified: "Verified profile",
    supporter: "Supporter",
    planPlus: "Plus",
    donorSupporter: "Supporter",
    video: "Video",
    seeking: "Looking for:",
    interests: "Interests",
    lifestyle: "Life details",
    privatePreferences: "Intimate preferences",
    privateLocked: "Intimate preferences are visible only after a contact is accepted.",
    noPrivateTags: "No private tags yet — add them in Settings.",
    sendRequest: "Send request",
    report: "Report",
    block: "Block",
    requestSent: "Request sent.",
    requestFailed: "Sending failed.",
    reportDone: "Report received.",
    reportFailed: "Report failed.",
    reportReason: "Inappropriate behaviour",
    reportNote: "Report from profile page.",
    blockReason: "User preference"
  },
  onboarding: {
    eyebrow: "Welcome",
    title: "A profile that stands out",
    lead: "Before you enter the feed, add a photo and a short description — both are required to send requests.",
    stepPhoto: "1. Photo",
    stepPhotoHint: "Profiles with photos get more responses.",
    changePhoto: "Change photo",
    addPhoto: "Add photo",
    stepBio: "2. About me (min. 10 characters)",
    stepBioHint: "Briefly say who you are and what you are looking for.",
    editBio: "Edit description",
    writeBio: "Write about yourself",
    stepFeed: "3. Feed",
    stepFeedHint: "Once your profile is ready, swipe and send your first request.",
    finishReady: "Finish intro and open feed",
    finishIncomplete: "Complete profile in Settings",
    finishHint: "Complete your photo and description in Settings first",
    incompleteError: "Add a photo and short description (min. 10 characters) in Settings before continuing.",
    saveFailed: "Save failed."
  },
  match: {
    eyebrow: "Mutual contact",
    title: "It's a match!",
    lead: "You and {partner} are ready to talk.",
    startChat: "Start conversation",
    backToApp: "Back to app",
    continueBrowsing: "Continue browsing"
  },
  donate: {
    backToApp: "← Back to My space",
    pricingLink: "Pricing model",
    eyebrow: "Thank you",
    title: "Support the project",
    lead: "We keep Ravnopar running with a lot of effort and a small budget. If the platform matters to you, you can help voluntarily — without pressure and without extra features in return.",
    sectionEyebrow: "Project support",
    sectionTitle: "Support Ravnopar",
    sectionLead: "If the platform helps you meet people, you can voluntarily help with server costs. Every contribution really helps — and you do not get any advantage in the feed.",
    note: "Donations are completely voluntary. Thank you for considering it. ♥",
    revolutTitle: "Card (Revolut)",
    revolutHint: "Quick card payment — opens a secure Revolut page.",
    revolutBtn: "Donate by card",
    stripeTitle: "Card (Stripe)",
    stripeRedirecting: "Redirecting...",
    stripeFailed: "Card payment is currently unavailable.",
    stripeNote: "Payment is processed by Stripe.",
    bankTitle: "Bank transfer",
    recipient: "Recipient",
    iban: "IBAN",
    reference: "Reference / description",
    copyIban: "Copy IBAN",
    copyRef: "Kopiraj",
    defaultReference: "Ravnopar donation",
    impactTitle: "Community impact",
    impactLead: "Numbers are loaded from real platform data.",
    impactMembers: "Community members",
    impactContacts: "Contacts (30 days)",
    impactSupporters: "Supporters",
    impactDonated: "Donated (30 days)",
    impactCoverage: "Operating costs covered this month",
    impactMonthlyCost: "Estimated monthly cost",
    costBreakdownTitle: "Where the money goes",
    costServer: "Server and database (Render)",
    costEmail: "Email notifications",
    costDomain: "Domain and SSL",
    whatDonationDoesNot: "Donations do not buy",
    notBuyBoost: "feed boost or ranking advantage",
    notBuyVisibility: "greater profile visibility",
    notBuyMessages: "paywall on conversation",
    whatDonationDoes: "Donations help",
    helpsServer: "keep the platform online",
    helpsCommunity: "a community that wants fair dating",
    thanksBadge: "Supporter badge (no ranking effect)",
    publicThanks: "Thank you to everyone helping Ravnopar stay online."
  },
  fairFeed: {
    title: "How the fair feed works",
    subtitle: "Transparent — no hidden reach throttling.",
    intro: "Ravnopar does not sell visibility. Here is what affects who you see — and what never does.",
    principlesTitle: "Ranking principles",
    neverTitle: "Never affects ranking",
    neverItems: ["Payment or donations", "Premium plan (Plus / Supporter)", "Number of swipes or time in app"],
    doesTitle: "May affect ranking (small and transparent)",
    explainLink: "View fairness report",
    faqLink: "Questions and answers",
    principles: {
      compatibility_filter: "Compatibility — preferences and intents must match",
      no_plan_boost: "Plan tier (free/plus/supporter) adds no feed points",
      fair_waiting_boost: "Fair boost if someone waits long without incoming requests",
      interest_lifestyle_points: "Small bonus for shared interests and lifestyle match",
      completeness_verification: "Profile completeness and verification (small clear points)",
      active_pairs_hidden: "Active pairs are temporarily hidden from the feed"
    }
  },
  fairnessReport: {
    title: "Fairness report",
    subtitle: "Public activity and rules overview — updated on load.",
    statsTitle: "Community (30 days)",
    changesTitle: "Rule changes (90 days)",
    noChanges: "No limit or ranking rule changes in the last 90 days.",
    premiumTitle: "Premium red lines",
    premiumItems: [
      "Premium does not boost the feed",
      "Chat stays free",
      "Donations give no advantage",
      "Premium = comfort, not access"
    ]
  },
  feedSignals: {
    shared_interests: "Shared interests",
    verified: "Verified profile",
    complete_profile: "Complete profile",
    fair_waiting: "Fair boost — awaiting contact",
    community_supporter: "Community supporter",
    whyTitle: "Why this profile?"
  },
  notifications: {
    title: "Notifications",
    empty: "No new notifications.",
    markAllRead: "Mark all read",
    open: "Open"
  },
  invite: {
    title: "Invite a friend",
    hint: "Share your link — it is free, no rewards for now, but it helps a small community grow.",
    invitedCount: "Invited registrations: {count}",
    copyLink: "Copy link",
    yourCode: "Your code: {code}"
  },
  swipe: {
    stampLike: "Interested",
    stampPass: "Skip",
    sameCity: "Same city",
    seeking: "Looking for:",
    awaitingContact: "Awaiting contact",
    multiPhotos: "{count} photos",
    fullProfile: "Complete profile",
    report: "Report",
    block: "Block",
    ariaPass: "Skip",
    ariaLike: "Send request"
  },
  pricing: {
    heroEyebrow: "Fair and open",
    heroTitle: "Plans with a human face",
    heroLead: "Ravnopar is not here to drain your wallet before your first conversation. Here we explain how the platform works today — and how it will work as we grow, without surprises.",
    heroChipChat: "♥ Free conversation",
    heroChipFair: "No hidden reach",
    heroChipNotice: "30-day advance notice",
    ctaTitle: "Ready for fair dating?",
    ctaLead: "Registration is free. If you like the approach — welcome to the community.",
    ctaStart: "Start for free",
    ctaBack: "Back to home",
    supportEyebrow: "Voluntary",
    supportTitle: "Voluntary support",
    supportLead:
      "If you like how Ravnopar works, you can voluntarily help cover running costs — with no feed advantage.",
    supportRevolutBtn: "Support on Revolut",
    supportAppLink: "All payment options",
    policyEyebrow: "Transparent from the start",
    policy: {
      headline: "Money should not stand between people",
      lead: "Ravnopar is free for meeting people today — and that is our intention. We will not introduce paid features until the product is stable and the community is genuinely active on the platform.",
      promisesIntro: "You can count on this — today and when we introduce Premium:",
      triggersIntro: "We are not rushing into paid plans. We will enable Premium only when all of the following make sense:",
      footnote: "When that moment comes, we will enable the plans below. Prices are indicative; we will confirm them before launch and notify you at least 30 days in advance."
    },
    promises: [
      {
        icon: "💬",
        title: "Conversation stays free",
        text: "Sending requests, accepting contact, and chat will never be behind a paywall."
      },
      {
        icon: "⚖️",
        title: "Fair visibility",
        text: "We do not charge by the number of people in your city or hide reach from those who do not pay."
      },
      {
        icon: "✨",
        title: "Premium = extras, not access",
        text: "Paid plans will be optional only — never a ticket to conversation."
      },
      {
        icon: "📬",
        title: "Advance notice",
        text: "Before any billing, we will notify you by email and in the app — at least 30 days in advance."
      },
      {
        icon: "🤝",
        title: "Donations stay voluntary",
        text: "If you donate, you do not get feed priority — only our sincere thanks."
      }
    ],
    triggers: [
      {
        icon: "🛠️",
        text: "The product runs stably, without constant outages"
      },
      {
        icon: "👥",
        text: "Enough people actively use Ravnopar every month"
      },
      {
        icon: "💌",
        text: "A significant number of users actually send or accept contacts"
      },
      {
        icon: "🌱",
        text: "Server costs that donations do not cover long term"
      }
    ],
    values: [
      {
        icon: "♥",
        title: "People before revenue",
        text: "We build the platform for real connections, not maximum billing."
      },
      {
        icon: "☀",
        title: "Honesty without fine print",
        text: "We write rules clearly — so you know what to expect today and tomorrow."
      },
      {
        icon: "◉",
        title: "Community, not metrics",
        text: "We make decisions based on activity and trust, not pressure to “fill a city”."
      }
    ],
    founderNote: {
      quote: "We did not build Ravnopar to push you into a subscription before you meet anyone. If we ever introduce Premium, it will be because the platform is growing and needs maintenance — not because you need to pay to be seen.",
      signature: "Thank you for being here. — the Ravnopar team"
    },
    valuesAriaLabel: "Ravnopar values",
    plansEyebrow: "Plans",
    plansTitle: "Choose your pace — without pressure",
    plansLead: "The free plan covers everything essential. Premium options are already prepared, but intentionally disabled until the community is ready.",
    planStatusActive: "Active",
    planStatusSoon: "Coming soon",
    planStatusBuy: "Available",
    planStatusDisabled: "In preparation",
    planBtnIncluded: "Included in the app",
    planBtnSoon: "Coming soon",
    planBtnBuy: "Buy plan",
    planBtnDisabled: "Not available yet",
    planDisabledTitle: "This plan is not available yet. We will notify you in advance before billing is introduced.",
    planHintCheckout: "Premium checkout is available in Settings after you log in.",
    planHintLogin: "Log in to buy a premium plan.",
    planHintLater: "We will activate it when the product and community are ready — notice will come in advance.",
    freePrice: "0 €",
    plans: [
      {
        id: "free",
        name: "Free",
        icon: "🏠",
        priceEur: 0,
        period: "",
        tagline: "Your start",
        description: "Everything you need for fair dating — today and when we introduce Premium.",
        features: [
          "Profile and visibility in feed",
          "Sending and accepting requests",
          "Blocking, reports, and spam protection",
          "No hidden reach reduction"
        ],
        tier: "free"
      },
      {
        id: "plus",
        name: "Ravnopar Plus",
        icon: "✦",
        priceEur: 4.99,
        period: "/ mo",
        tagline: "More for your profile",
        description: "For those who want extra control — without affecting others in the feed.",
        features: [
          "More photos on profile",
          "Advanced filters (fair for everyone)",
          "Priority report handling",
          "Verified profile badge (coming soon)"
        ],
        tier: "premium"
      },
      {
        id: "supporter",
        name: "Ravnopar Supporter",
        icon: "♥",
        priceEur: 2.99,
        period: "/ mo",
        tagline: "Support and stay",
        description: "A symbolic subscription for those who believe in what we are building.",
        features: [
          "Everything in the free plan",
          "Supporter badge on profile",
          "Early access to new features (beta)",
          "Monthly insight into platform costs"
        ],
        tier: "premium"
      }
    ]
  },
  faq: {
    title: "Help & FAQ",
    subtitle: "Answers to the most common questions about Ravnopar.",
    backHome: "← Back to home",
    contact: "Contact",
    ctaTitle: "Didn't find your answer?",
    ctaLead: "Email us — questions, compliments, suggestions, and privacy requests.",
    ctaEmail: "Send email",
    items: [
      {
        q: "Is Ravnopar free?",
        a: "Yes — sending requests, accepting contact, and in-app conversation are free. Donations are voluntary and do not give feed priority."
      },
      {
        q: "How does a match work?",
        a: "You browse profiles in the feed and send a contact request. If the other person accepts, a private chat opens and you are both temporarily focused on the conversation."
      },
      {
        q: "What happens after contact is accepted?",
        a: "You can open chat with the person and talk in the app. Active pairs temporarily leave the feed so others still get a chance."
      },
      {
        q: "Will you charge for conversation?",
        a: "No. Basic communication stays free. Premium plans (when available) will be optional extras only — with advance notice."
      },
      {
        q: "How can I pause or delete my profile?",
        a: "In Settings you can pause visibility or permanently delete your account. Deletion is irreversible."
      },
      {
        q: "How do I report inappropriate behavior?",
        a: "Use the Report button on a profile. The admin team reviews reports and may take action."
      },
      {
        q: "Will I receive email notifications?",
        a: "You can enable notifications for new requests, accepted contacts, and messages. You can turn off email notifications in Settings."
      },
      {
        q: "Who can use Ravnopar?",
        a: "Adults (18+) with a verified email. Respect community rules and other users’ boundaries."
      },
      {
        q: "What is ghosting and what does Ravnopar do about it?",
        a: "Ghosting is when someone accepts contact but then stops replying. After 48 hours of inactivity we send a warning; after 72 hours the conversation auto-closes and you both become available in the feed again. Old unanswered requests expire after 14 days."
      },
      {
        q: "Do donations give feed priority?",
        a: "No. Donations help server costs and may show a supporter badge — but they never affect profile order. See the Fair feed page for details."
      },
      {
        q: "What will premium plans never do?",
        a: "Premium will not boost you in the feed, hide you from others, or limit free chat. Red lines are published on the Fairness report page."
      }
    ]
  },
  contact: {
    title: "Contact",
    subtitle: "We're here for questions, compliments, suggestions, and privacy requests.",
    topicsTitle: "What you can write about",
    topics: [
      "Questions about using Ravnopar",
      "Compliments and improvement ideas",
      "Privacy requests (GDPR)",
      "Technical issues and bugs"
    ],
    reportHint:
      "To report a user in the app, use the Report button on their profile — do not email other people's personal data unless necessary for safety.",
    emailTitle: "Email",
    emailHint: "We respond within a reasonable time — usually within a few business days.",
    emergencyTitle: "Emergencies",
    emergencyHint: "Ravnopar is not an emergency service. If you are in danger, contact local police or emergency services (112).",
    faqLink: "FAQ",
    homeLink: "Home"
  },
  legal: {
    back: "Back",
    disclaimer: "These texts are informational templates for the Ravnopar platform. Before official launch, we recommend review by a lawyer familiar with GDPR and EU/Croatian law. Last updated: June 2026.",
    privacy: {
      title: "Privacy policy",
      description: "How Ravnopar collects, uses, and protects your data.",
      sections: [
        {
          title: "Data controller and contact",
          body: "Ravnopar is a fair dating platform for adults (18+). For privacy questions, write to {email}."
        },
        {
          title: "Age limit",
          body: "The service is exclusively for people over 18. By registering, you confirm you meet the age requirement. We use your date of birth only to verify age and do not display it publicly."
        },
        {
          title: "Data we collect",
          body: "Identity and contact data (email, display name), profile (city, short description, photos, dating preferences, icebreaker answers), optional video link, messages after a match, technical logs (activity time), optional roughly rounded location (coordinates only if you enable distance sharing), verification selfie (not public), referral code, and payment/donation data if you use them."
        },
        {
          title: "Location and distance",
          body: "Location sharing is optional and off by default. If you enable it, coordinates are used only to calculate rough distance (e.g. “5–15 km”) — we do not show exact coordinates to other users or on a map. You can disable location in Settings; coordinates are deleted on the next profile save."
        },
        {
          title: "Verification selfie",
          body: "A selfie for profile verification is used only for moderation (comparison with your profile photo). It is not visible to other users. After approval or rejection, the admin team may delete the selfie from the system."
        },
        {
          title: "Purpose of processing",
          body: "Providing the dating service, profile display, matching, chat, safety (blocking, reports), email notifications you approve, referral program, aggregated visit analytics, and platform maintenance."
        },
        {
          title: "Legal basis (GDPR)",
          body: "Mainly contract performance (using the service), legitimate interest (security, abuse prevention, aggregated visit analytics), and consent (email notifications, location, non-essential cookies)."
        },
        {
          title: "Sharing with third parties",
          body: "We do not sell your data. We share data only with service providers necessary for operation (Render hosting, SMTP email, optional Stripe for payments, optional Plausible/Umami analytics) and when required by law. Providers are contractually obligated to protect data."
        },
        {
          title: "Storage and security",
          body: "We keep data while you use your account. We apply reasonable technical measures (HTTPS, password hashing, admin panel access control). Photos may be stored in the database (base64) or on S3/R2 if configured. No system is 100% secure."
        },
        {
          title: "Your rights",
          body: "You have the right of access, rectification, erasure, restriction of processing, objection, and data portability (where applicable). Account deletion is available in Settings. For other requests, contact us by email; we respond within the GDPR timeframe."
        },
        {
          title: "Cookies and analytics",
          body: "Essential cookies/tokens are used for login. Analytics (Plausible) is cookieless and does not use advertising profiles — it collects only aggregated visit data (pages, sources, devices). The banner is informational and does not block analytics."
        },
        {
          title: "Referral",
          body: "If you use an invite, we record the referral code of the person who invited you for internal statistics only. We do not share your email address with the inviter."
        },
        {
          title: "Policy changes",
          body: "We may update this policy. We will notify you of material changes via the app or email. Continued use after publication is considered acceptance of the updated policy."
        }
      ]
    },
    terms: {
      title: "Terms of service",
      description: "Terms for using the Ravnopar platform.",
      sections: [
        {
          title: "Acceptance of terms",
          body: "By using Ravnopar, you accept these terms and the privacy policy. You must be at least 18 years old."
        },
        {
          title: "Service description",
          body: "Ravnopar is a tool for fair dating — profiles, contact requests, chat after mutual acceptance, and moderation. We do not guarantee relationship success or a specific number of matches."
        },
        {
          title: "Account and profile",
          body: "You are responsible for accurate data, password security, and profile content. A profile with a photo and short description is required to send requests to others. Fake profiles and false age are prohibited."
        },
        {
          title: "Prohibited behavior",
          body: "Harassment, threats, spam, hate speech, publishing others’ personal data, non-consensual content, service trading, fraud, and anything illegal under Croatian/EU law are prohibited."
        },
        {
          title: "Moderation and suspension",
          body: "We reserve the right to suspend or delete accounts that violate the rules, without prior notice in urgent cases. You can report users in the app."
        },
        {
          title: "Billing and donations",
          body: "Core features are free. Premium plans and donations are optional (see /planovi). We publish prices and billing terms in advance."
        },
        {
          title: "Service availability",
          body: "We provide the service “as is”. Outages may occur due to maintenance, hosting, or force majeure. We recommend regularly saving important data (GDPR export in Settings)."
        },
        {
          title: "Liability",
          body: "Meetings outside the platform are at your own risk. We advise caution on first meetings (public place, tell someone you trust). Ravnopar is not a party to relationships between users."
        },
        {
          title: "Governing law",
          body: "These terms are interpreted under the laws of the Republic of Croatia, with binding EU regulations (including GDPR) where applicable. Jurisdiction: courts in Croatia, unless EU consumer law requires otherwise."
        }
      ]
    },
    guidelines: {
      title: "Community guidelines",
      description: "What is allowed, what is not, and how to stay safe on Ravnopar.",
      sections: [
        {
          title: "Allowed",
          body: "Honest profile, diverse preferences, respecting boundaries, declining contact without explanation, reporting suspicious behavior."
        },
        {
          title: "Not allowed",
          body: "Insults, harassment, threats, spam requests, fake profiles, explicit photos without consent context, asking for money."
        },
        {
          title: "Ravnopar fair model",
          body: "No paywall for basic chat. Active pairs temporarily leave the feed. Anti-spam limits protect the community. Boost/super-like do not exist."
        },
        {
          title: "Profile with photo",
          body: "Without a photo and short description, you cannot send requests — that protects community quality and reduces fake profiles."
        },
        {
          title: "Safety when meeting",
          body: "Meet in a public place first, tell a friend where you are going, do not share financial details too early, report suspicious behavior to the admin team."
        },
        {
          title: "Verification",
          body: "The “Verified profile” badge is granted by an admin after comparing a selfie with the profile photo. It is not a guarantee of identity, but it helps build trust."
        }
      ]
    }
  },
  admin: {
    title: "Admin center",
    subtitle: "Users, moderation, payments, and platform fairness.",
    loggedInAs: "Logged in as",
    stats: {
      totalProfiles: "Total profiles",
      available: "Available",
      focused: "In conversation",
      paused: "Paused",
      suspended: "Suspended",
      openReports: "Open reports",
      pendingContacts: "Pending contacts",
      matches30d: "Matches (30d)",
      messages7d: "Messages (7d)"
    },
    analyticsTitle: "Visit analytics (Plausible)",
    analyticsSubtitle: "Aggregated data for {site} — no need to open Plausible manually.",
    analyticsOpenExternal: "Open in Plausible",
    analyticsNotConfigured:
      "Plausible is not connected. Set PLAUSIBLE_API_KEY and PLAUSIBLE_SHARED_DASHBOARD_URL on the backend (Render → ravnopar-backend → Environment).",
    analyticsPartialConfig:
      "Set PLAUSIBLE_API_KEY for numbers or PLAUSIBLE_SHARED_DASHBOARD_URL for the embedded dashboard.",
    analyticsVisitorsToday: "Visitors (today)",
    analyticsPageviewsToday: "Pageviews (today)",
    analyticsVisitors7d: "Visitors (7d)",
    analyticsPageviews7d: "Pageviews (7d)",
    analyticsVisitors30d: "Visitors (30d)",
    analyticsBounce7d: "Bounce rate (7d)",
    analyticsDuration7d: "Visit duration (7d)",
    analyticsTopPages: "Top pages (7d)",
    analyticsTopSources: "Traffic sources (7d)",
    analyticsPage: "Page",
    analyticsSource: "Source",
    analyticsVisitors: "Visitors",
    analyticsPageviews: "Pageviews",
    analyticsDashboard: "Plausible dashboard",
    quickActions: "Quick actions",
    inactivityThreshold: "Inactivity threshold (h)",
    dailyContactLimit: "Daily contact limit",
    closeInactive: "Close inactive pairs",
    saveLimit: "Save limit",
    refreshAll: "Refresh all",
    verificationTitle: "Profile verification ({count})",
    profilePhoto: "Profile photo",
    noPhoto: "No photo",
    selfie: "Selfie",
    approve: "Approve",
    reject: "Reject",
    usersTitle: "Users",
    searchPlaceholder: "Search name, email, city...",
    search: "Search",
    tableName: "Name",
    tableEmail: "Email",
    tableCity: "City",
    tableRole: "Role",
    tablePlan: "Plan",
    tableStatus: "Status",
    tableActions: "Actions",
    planFor: "Plan for {name}",
    suspended: "Suspended",
    verify: "Verify",
    unsuspend: "Unsuspend",
    suspend: "Suspend",
    removeAdmin: "Remove admin",
    setAdmin: "Make admin",
    delete: "Delete",
    cannotRemoveOwnAdmin: "You cannot remove your own admin role",
    cannotDeleteSelf: "You cannot delete your own account",
    cannotDeleteAdmin: "Admin accounts are not deleted from the panel",
    deleteUserTitle: "Permanently delete user",
    deleteConfirm: "Permanently delete user {name} ({email})?\n\nThis action cannot be undone.",
    moderationTitle: "Moderation",
    reportedBy: "Reported by: {name}",
    paymentsTitle: "Payments",
    riskTitle: "Risk profiles",
    riskScore: "Risk: {score}",
    userUpdated: "User updated.",
    updateFailed: "Update failed.",
    userDeleted: "User deleted.",
    deleteFailed: "Deletion failed.",
    sweepSuccess: "Pairs closed: {count}.",
    sweepFailed: "Operation failed.",
    limitSaved: "Limit saved.",
    reportResolved: "Report processed and logged in audit.",
    reportFailed: "Report processing failed.",
    deleteReportedConfirm: "Permanently delete the reported user?",
    suspendReportedConfirm: "Suspend the reported user?",
    selfieRejected: "Selfie rejected."
  },
  audit: {
    title: "Audit and review",
    tabs: {
      timeline: "Log",
      moderation: "Moderation",
      fairness: "Fairness",
      feed: "Feed ranking",
      compliance: "Compliance"
    },
    allCategories: "All categories",
    categoryAdmin: "Admin actions",
    categoryModeration: "Moderation",
    categorySecurity: "Security",
    categoryFeed: "Feed ranking",
    categoryCompliance: "Compliance",
    refresh: "Refresh",
    noEvents: "No records.",
    actor: "From: {name}",
    target: "To: {name}",
    moderationHint: "History of report decisions — who resolved, what action, suspend/delete.",
    noDecisions: "No decisions yet.",
    resolvedBy: "Resolved by: {name}",
    byCity: "By city (available)",
    byIdentity: "By identity",
    newUsers: "New users",
    newUsersStats: "7d: {last7d} · 30d: {last30d} · without contact (7d): {withoutIncoming7d}",
    metrics: "Without incoming (7d): {withoutIncoming7d} · Pending: {pending7d} · Accepted: {accepted7d}",
    feedHint: "Why profile X ranks above Y — transparent ranking explanation (plan does not add points).",
    feedViewer: "Why profile X ranks above Y — transparent ranking explanation (plan does not add points).",
    selectUser: "Select user…",
    showRanking: "Show ranking",
    feedExplainFailed: "Ranking explanation is not available.",
    tableRank: "#",
    tableProfile: "Profile",
    tableCity: "City",
    tableScore: "Points",
    tableFactors: "Factors",
    retentionDays: "Audit record retention: {days} days",
    resolveOutcome: "Outcome",
    resolveAction: "Action",
    resolveNotes: "Note (optional)",
    resolveSubmit: "Resolve and log",
    outcomeResolved: "Resolved",
    outcomeDismissed: "Dismissed",
    actionNone: "No action",
    actionWarn: "Warning",
    actionSuspend: "Suspend",
    actionDelete: "Delete user"
  },
  icebreakers: {
    prompts: [
      "Favorite coffee spot in your city?",
      "My ideal weekend looks like this…",
      "Something that instantly makes me laugh:",
      "My go-to comfort food:",
      "Plan for a first meetup:",
      "I am currently into:",
      "A song that describes me:",
      "A trip I would take right now:"
    ]
  },
  donatePrompt: {
    match: {
      title: "Congratulations on your match!",
      text: "If Ravnopar helps you meet people, you can voluntarily support keeping the platform running."
    },
    milestone: {
      title: "Thank you for using Ravnopar",
      text: "You have been with us for a while. If you want to help cover server costs, a donation is welcome — but not required."
    },
    support: "Support the project",
    notNow: "Not now",
    neverAgain: "Do not show again"
  }
};
