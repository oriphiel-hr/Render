/**
 * Razine na kojima su globalno „jači” marketplacei (product tuning).
 * Isto se može prikazati u webu i u mobilnom profilu kao smjernica / roadmap.
 */
export const COMPETITIVE_FOCUS_AREAS = [
  {
    title: 'Trust layer',
    mustHave: true,
    bullets: [
      'Jasni "Verified provider" bedževi (ID, licenca, tvrtka).',
      'Smanjenje lažnih recenzija: dokaz izvršenog posla, signalizacija sumnjivog uzorka.',
      'Eksplicitno: što je provjereno, a što nije.'
    ]
  },
  {
    title: 'Instant booking / termin',
    bullets: [
      'Za brze kategorije (npr. montaže, sitni popravci) — odmah zauzmi termin (posebno važno na mobilu).'
    ]
  },
  {
    title: 'Garancija / buyer protection',
    bullets: [
      'I mali "Uslugar Guarantee" (do određenog iznosa) gradi povjerenje; standardiziran dispute flow.'
    ]
  },
  {
    title: 'SLA i brzina odgovora u rankinga',
    bullets: [
      'Prikaz: "Odgovara u X min".',
      'Boost u tražilici za pouzdane izvođače; korisniku jasan ETA: "prva ponuda za ~Y min".'
    ]
  },
  {
    title: 'Zadržavanje nakon posla',
    bullets: [
      '"Ponovi uslugu", omiljeni izvođač, sezonski podsjetnici (klima, bojler, …) — korisnik ne dođe samo jednom.'
    ]
  },
  {
    title: 'Standardizirani paketi',
    bullets: [
      'Fiksna cijena od–do za učestale poslove (npr. top 10 kategorija) kako bi manje bilo „praznog hoda".'
    ]
  }
];

export const NINETY_DAY_ROADMAP = {
  title: 'Što slijedi (90 dana, smjernica tima)',
  phases: [
    { label: 'Faza 1 (2–3 tjedna)', text: 'Trust bedževi + jasni profil (provjereno / neprovjereno).' },
    { label: 'Faza 2 (3–4 tjedna)', text: 'Instant booking za 2–3 jednostavne kategorije.' },
    { label: 'Faza 3 (3–4 tjedna)', text: 'Buyer protection + dispute centar + SLA u rankingu / oznakama.' }
  ]
};
