/** Non-brand SEO: landing sections + FAQ discovery items (all 13 locales). */

const discoveryFaqHr = [
  {
    q: 'Je li Ravnopar alternativa Tinderu u Hrvatskoj?',
    a: 'Ako tražiš besplatno upoznavanje s chatom nakon matcha — bez paywalla za razgovor — Ravnopar može biti dobra opcija. Fokus je na fer pravilima i transparentnom feedu, ne na kopiranju druge aplikacije.'
  },
  {
    q: 'Mogu li upoznavati ljude besplatno, bez pretplate?',
    a: 'Da. Slanje zahtjeva, prihvaćanje kontakta i chat nakon matcha su besplatni. Nema obaveznog premiuma za razgovor — donacije su dobrovoljne i ne daju prednost u feedu.'
  },
  {
    q: 'Moram li plaćati poruke nakon matcha?',
    a: 'Ne. Kad obje strane prihvate kontakt, privatni chat je besplatan. Kod nas nema naplate poruka nakon matcha.'
  },
  {
    q: 'Kako se Ravnopar razlikuje od drugih dating aplikacija?',
    a: 'Fokus je na fer matchu — bez plaćenog boosta u feedu, bez skrivanja dosega i s jasnim pravilima protiv ghostinga. Premium (kad bude dostupan) neće ograničavati besplatni chat — detalje vidi na stranici Fer feed.'
  },
  {
    q: 'Radi li Ravnopar u Hrvatskoj i Europi?',
    a: 'Da — platforma je namijenjena korisnicima u Europi, s podrškom za više jezika. Registracija zahtijeva 18+ godina i verificiran email.'
  },
  {
    q: 'Je li Ravnopar za ozbiljno upoznavanje ili samo zabavu?',
    a: 'Oba — ovisi o tome što tražiš u profilu i preferencama. Pravila zajednice zabranjuju spam i neprimjereno ponašanje; fokus je na fer matchu i stvarnom razgovoru.'
  }
];

const discoveryFaqEn = [
  {
    q: 'Is Ravnopar a Tinder alternative?',
    a: 'If you want free dating with chat after a match — without a paywall for conversation — Ravnopar can be a good option. The focus is fair rules and a transparent feed, not copying another app.'
  },
  {
    q: 'Can I meet people for free, without a subscription?',
    a: 'Yes. Sending requests, accepting contact, and post-match chat are free. There is no required premium to talk — donations are voluntary and do not give feed priority.'
  },
  {
    q: 'Do I have to pay for messages after a match?',
    a: 'No. When both sides accept contact, private chat is free. We do not charge for messages after a match.'
  },
  {
    q: 'How is Ravnopar different from other dating apps?',
    a: 'The focus is fair matching — no paid feed boost, no hidden reach limits, and clear anti-ghosting rules. Premium (when available) will not limit free chat — see the Fair feed page.'
  },
  {
    q: 'Does Ravnopar work in Croatia and Europe?',
    a: 'Yes — the platform is built for users in Europe, with support for multiple languages. Registration requires 18+ and a verified email.'
  },
  {
    q: 'Is Ravnopar for serious dating or casual fun?',
    a: 'Both — it depends on what you set in your profile and preferences. Community rules ban spam and abuse; the focus is fair matching and real conversation.'
  }
];

const homeCompareHr = {
  title: 'Fer upoznavanje bez paywalla',
  lead:
    'Tražiš besplatno upoznavanje bez skrivenih limita dosega? Ravnopar nudi match i chat nakon obostranog kontakta — bez plaćanja poruka i bez plaćenog boosta u feedu.',
  points: [
    {
      title: 'Chat nakon matcha',
      text: 'Razgovor se otvara kad obje strane prihvate kontakt — nema paywalla za osnovnu komunikaciju.'
    },
    {
      title: 'Fer feed bez plaćenog boosta',
      text: 'Donacije i premium ne daju prednost u vidljivosti. Pravila rangiranja su javna na stranici Fer feed.'
    },
    {
      title: 'Zaštita od ghostinga',
      text: 'Upozorenja i automatsko zatvaranje neaktivnih razgovora — manje beskonačnog čekanja bez odgovora.'
    }
  ],
  link: 'Sva pitanja u pomoći →'
};

const homeFreeHr = {
  title: 'Besplatno upoznavanje — bez pretplate za razgovor',
  lead:
    'Zahtjevi za kontakt, match i chat uključeni su u osnovno korištenje — fokus je na stvarnom upoznavanju, ne na skrivenim troškovima za razgovor.',
  points: [
    {
      title: 'Registracija i profil',
      text: 'Napravi profil s fotografijom, odaberi koga tražiš i pregledaj feed dostupnih osoba.'
    },
    {
      title: 'Match bez skrivenih troškova',
      text: 'Pošalji zahtjev za kontakt; ako druga strana prihvati, otvori se privatni chat — besplatno.'
    },
    {
      title: '18+, više jezika',
      text: 'Platforma za Europu s podrškom za hrvatski i druge jezike. Poštuj pravila zajednice i granice drugih.'
    }
  ],
  link: 'Kreni besplatno →'
};

const homeCompareEn = {
  title: 'Fair dating without a paywall',
  lead:
    'Looking for free dating without hidden reach limits? Ravnopar offers matches and chat after mutual contact — no paid messages and no paid feed boost.',
  points: [
    {
      title: 'Chat after a match',
      text: 'Conversation opens when both sides accept contact — no paywall for basic communication.'
    },
    {
      title: 'Fair feed without paid boost',
      text: 'Donations and premium do not increase visibility. Ranking rules are public on the Fair feed page.'
    },
    {
      title: 'Anti-ghosting protection',
      text: 'Warnings and auto-closing inactive chats — less endless waiting without a reply.'
    }
  ],
  link: 'All questions in Help →'
};

const homeFreeEn = {
  title: 'Free dating — no subscription to talk',
  lead:
    'Contact requests, matches, and chat are included in basic use — the focus is real connection, not hidden costs to talk.',
  points: [
    {
      title: 'Sign up and profile',
      text: 'Create a profile with a photo, choose who you seek, and browse available people in the feed.'
    },
    {
      title: 'Match without hidden fees',
      text: 'Send a contact request; if the other person accepts, private chat opens — for free.'
    },
    {
      title: '18+, multiple languages',
      text: 'Built for Europe with Croatian and other languages. Respect community rules and others’ boundaries.'
    }
  ],
  link: 'Start for free →'
};

export const SEO_DISCOVERY_BLOCKS = {
  hr: {
    meta: {
      descriptions: {
        home:
          'Besplatno upoznavanje bez paywalla — fer dating aplikacija za HR i Europu. Chat nakon matcha, transparentna pravila. 18+.',
        faq: 'Besplatno upoznavanje, chat bez pretplate, fer feed — česta pitanja o Ravnoparu.'
      }
    },
    home: { seoCompare: homeCompareHr, seoFree: homeFreeHr },
    faq: { seoDiscoveryItems: discoveryFaqHr }
  },
  en: {
    meta: {
      descriptions: {
        home:
          'Free dating without a paywall — fair dating for Europe. Chat after a match, transparent rules. 18+.',
        faq: 'Free dating, chat without subscription, fair feed — FAQ about Ravnopar.'
      }
    },
    home: { seoCompare: homeCompareEn, seoFree: homeFreeEn },
    faq: { seoDiscoveryItems: discoveryFaqEn }
  },
  de: {
    meta: {
      descriptions: {
        home: 'Kostenloses Dating ohne Paywall — fairer Feed, Chat nach Match. 18+.',
        faq: 'Kostenloses Dating, Chat ohne Abo, fairer Feed — FAQ zu Ravnopar.'
      }
    },
    home: {
      seoCompare: {
        title: 'Faires Dating ohne Paywall',
        lead: 'Kostenloses Dating ohne versteckte Reichweitenlimits — Match und Chat nach gegenseitigem Kontakt.',
        points: [
          { title: 'Chat nach Match', text: 'Gespräch startet, wenn beide zustimmen — kein Paywall für Basis-Kommunikation.' },
          { title: 'Fairer Feed', text: 'Spenden und Premium erhöhen die Sichtbarkeit nicht. Regeln auf der Seite Fairer Feed.' },
          { title: 'Schutz vor Ghosting', text: 'Warnungen und automatisches Schließen inaktiver Chats.' }
        ],
        link: 'Alle Fragen in der Hilfe →'
      },
      seoFree: {
        title: 'Kostenloses Dating — kein Abo zum Chatten',
        lead: 'Anfragen, Match und Chat sind in der Basisnutzung enthalten — Fokus auf echtes Kennenlernen.',
        points: [
          { title: 'Profil anlegen', text: 'Foto, Bio, Präferenzen — dann Feed durchstöbern.' },
          { title: 'Match ohne versteckte Kosten', text: 'Bei Annahme öffnet sich der Chat — kostenlos.' },
          { title: '18+, mehrsprachig', text: 'Für Europa, mehrere Sprachen.' }
        ],
        link: 'Kostenlos starten →'
      }
    },
    faq: {
      seoDiscoveryItems: [
        {
          q: 'Ist Ravnopar eine Tinder-Alternative?',
          a: 'Wenn du kostenloses Dating mit Chat nach Match suchst — ohne Paywall — kann Ravnopar passen. Fokus auf faire Regeln und transparenten Feed.'
        },
        { q: 'Kann ich kostenlos Leute kennenlernen?', a: 'Ja. Anfragen, Kontaktannahme und Chat nach Match sind gratis.' },
        { q: 'Muss ich für Nachrichten nach dem Match zahlen?', a: 'Nein. Privater Chat ist kostenlos, wenn beide zustimmen.' },
        {
          q: 'Wie unterscheidet sich Ravnopar von anderen Dating-Apps?',
          a: 'Fokus auf faires Matching — kein bezahlter Boost, keine versteckte Reichweite, klare Anti-Ghosting-Regeln.'
        },
        { q: 'Funktioniert Ravnopar in Europa?', a: 'Ja — mehrere Sprachen, Registrierung ab 18 mit bestätigter E-Mail.' },
        { q: 'Ernsthaftes Dating oder eher locker?', a: 'Beides — je nach Profil. Fokus auf faires Matching und echten Austausch.' }
      ]
    }
  },
  sl: {
    meta: {
      descriptions: {
        home: 'Brezplačno spoznavanje brez paywalla — pošten feed, klepet po ujemanju. 18+.',
        faq: 'Brezplačno spoznavanje, klepet brez naročnine — FAQ o Ravnopar.'
      }
    },
    home: {
      seoCompare: {
        title: 'Pošteno spoznavanje brez paywalla',
        lead: 'Brezplačno spoznavanje brez skritih omejitev dosega — ujemanje in klepet po obojestranskem kontaktu.',
        points: [
          { title: 'Klepet po ujemanju', text: 'Pogovor se odpre, ko oba sprejmeta kontakt.' },
          { title: 'Pošten feed', text: 'Donacije in premium ne dajejo prednosti.' },
          { title: 'Zaščita pred ghostingom', text: 'Opozorila in samodejno zapiranje neaktivnih pogovorov.' }
        ],
        link: 'Vsa vprašanja v pomoči →'
      },
      seoFree: {
        title: 'Brezplačno spoznavanje — brez naročnine',
        lead: 'Zahteve, ujemanje in klepet so vključeni v osnovno uporabo.',
        points: [
          { title: 'Registracija', text: 'Profil s fotografijo in brskanje po feedu.' },
          { title: 'Ujemanje brez skritih stroškov', text: 'Zasebni klepet brezplačno po sprejetju.' },
          { title: '18+, več jezikov', text: 'Za Evropo, več jezikov.' }
        ],
        link: 'Začni brezplačno →'
      }
    },
    faq: {
      seoDiscoveryItems: [
        { q: 'Je Ravnopar alternativa Tinderju?', a: 'Če iščeš brezplačno spoznavanje s klepetom po ujemanju — brez paywalla — je Ravnopar dobra opcija. Poudarek na poštenih pravilih.' },
        { q: 'Ali lahko spoznavam brezplačno?', a: 'Da. Zahteve, sprejetje in klepet so brezplačni.' },
        { q: 'Ali moram plačati sporočila po ujemanju?', a: 'Ne. Zasebni klepet je brezplačen.' },
        { q: 'Kako se Ravnopar razlikuje od drugih dating aplikacij?', a: 'Pošten feed, brez plačanega boosta, jasna pravila proti ghostingu.' },
        { q: 'Ali deluje v Evropi?', a: 'Da — več jezikov, registracija 18+.' },
        { q: 'Za resno ali le zabavo?', a: 'Oboje — odvisno od profila.' }
      ]
    }
  },
  bs: {
    meta: {
      descriptions: {
        home: 'Besplatno upoznavanje bez paywalla — fer feed, chat nakon matcha. 18+.',
        faq: 'Besplatno upoznavanje, chat bez pretplate — FAQ o Ravnoparu.'
      }
    },
    home: { seoCompare: homeCompareHr, seoFree: homeFreeHr },
    faq: { seoDiscoveryItems: discoveryFaqHr }
  },
  sr: {
    meta: {
      descriptions: {
        home: 'Besplatno upoznavanje bez paywalla — fer feed, chat nakon matcha. 18+.',
        faq: 'Besplatno upoznavanje, chat bez pretplate — FAQ o Ravnoparu.'
      }
    },
    home: {
      seoCompare: {
        ...homeCompareHr,
        points: homeCompareHr.points.map((p) => ({ ...p }))
      },
      seoFree: {
        title: 'Besplatno upoznavanje — bez pretplate',
        lead: 'Zahtevi, match i chat uključeni su u osnovnu upotrebu.',
        points: [
          { title: 'Registracija', text: 'Profil sa fotografijom i pregled feeda.' },
          { title: 'Match bez skrivenih troškova', text: 'Privatni chat besplatno.' },
          { title: '18+, više jezika', text: 'Platforma za Evropu.' }
        ],
        link: 'Kreni besplatno →'
      }
    },
    faq: {
      seoDiscoveryItems: discoveryFaqHr.map((item) =>
        item.q.includes('drugih')
          ? {
              q: 'Kako se Ravnopar razlikuje od drugih dating aplikacija?',
              a: 'Fokus na fer matchu — bez plaćenog boosta, bez skrivanja dosega, jasna pravila protiv ghostinga.'
            }
          : { ...item }
      )
    }
  },
  it: {
    meta: {
      descriptions: {
        home: 'Incontri gratuiti senza paywall — feed equo, chat dopo il match. 18+.',
        faq: 'Incontri gratis, chat senza abbonamento — FAQ su Ravnopar.'
      }
    },
    home: {
      seoCompare: {
        title: 'Incontri equi senza paywall',
        lead: 'Incontri gratuiti senza limiti nascosti — match e chat dopo contatto reciproco.',
        points: [
          { title: 'Chat dopo il match', text: 'Conversazione quando entrambi accettano — nessun paywall.' },
          { title: 'Feed equo', text: 'Donazioni e premium non danno priorità.' },
          { title: 'Anti-ghosting', text: 'Avvisi e chiusura automatica delle chat inattive.' }
        ],
        link: 'Tutte le domande →'
      },
      seoFree: {
        title: 'Incontri gratuiti — senza abbonamento',
        lead: 'Richieste, match e chat inclusi nell’uso base.',
        points: [
          { title: 'Profilo', text: 'Foto, preferenze e feed.' },
          { title: 'Match senza costi nascosti', text: 'Chat privata gratuita dopo accettazione.' },
          { title: '18+, più lingue', text: 'Per l’Europa.' }
        ],
        link: 'Inizia gratis →'
      }
    },
    faq: {
      seoDiscoveryItems: [
        { q: 'Ravnopar è un’alternativa a Tinder?', a: 'Se cerchi incontri gratuiti con chat dopo il match — senza paywall — Ravnopar può fare al caso tuo. Focus su regole eque.' },
        { q: 'Posso conoscere persone gratis?', a: 'Sì. Richieste, accettazione e chat sono gratuite.' },
        { q: 'Devo pagare i messaggi dopo il match?', a: 'No. La chat privata è gratuita.' },
        { q: 'Come si differenzia Ravnopar dalle altre app di dating?', a: 'Focus su match equo — niente boost a pagamento, niente reach nascosto, regole anti-ghosting chiare.' },
        { q: 'Funziona in Europa?', a: 'Sì — più lingue, registrazione 18+.' },
        { q: 'Serio o casual?', a: 'Entrambi — dipende dal profilo.' }
      ]
    }
  },
  hu: {
    meta: {
      descriptions: {
        home: 'Ingyenes társkeresés paywall nélkül — fair feed, chat match után. 18+.',
        faq: 'Ingyenes társkeresés, chat előfizetés nélkül — GYIK a Ravnoparról.'
      }
    },
    home: {
      seoCompare: {
        title: 'Fair társkeresés paywall nélkül',
        lead: 'Ingyenes ismerkedés rejtett elérési limitek nélkül — match és chat kölcsönös elfogadás után.',
        points: [
          { title: 'Chat match után', text: 'Beszélgetés, ha mindketten elfogadják.' },
          { title: 'Fair feed', text: 'Adományok és prémium nem ad előnyt.' },
          { title: 'Ghosting elleni védelem', text: 'Figyelmeztetések és inaktív csevegések zárása.' }
        ],
        link: 'Minden kérdés a súgóban →'
      },
      seoFree: {
        title: 'Ingyenes társkeresés — nincs előfizetés',
        lead: 'Kérések, match és chat az alaphasználatban benne van.',
        points: [
          { title: 'Regisztráció', text: 'Profil fotóval, feed böngészése.' },
          { title: 'Match rejtett díjak nélkül', text: 'Ingyenes privát chat elfogadás után.' },
          { title: '18+, több nyelv', text: 'Európára.' }
        ],
        link: 'Indítás ingyen →'
      }
    },
    faq: {
      seoDiscoveryItems: [
        { q: 'A Ravnopar Tinder alternatíva?', a: 'Ha ingyenes társkeresést keresel chatttel match után — paywall nélkül — a Ravnopar jó opció lehet.' },
        { q: 'Ingyen is ismerkedhetek?', a: 'Igen. Kérések, elfogadás és chat ingyenes.' },
        { q: 'Fizetni kell az üzenetekért match után?', a: 'Nem. A privát chat ingyenes.' },
        { q: 'Miben különbözik a Ravnopar más társkereső appoktól?', a: 'Fair matching — nincs fizetős boost, nincs rejtett elérés, egyértelmű anti-ghosting szabályok.' },
        { q: 'Működik Európában?', a: 'Igen — több nyelv, 18+ regisztráció.' },
        { q: 'Komoly vagy laza?', a: 'Mindkettő — a profiltól függ.' }
      ]
    }
  },
  pl: {
    meta: {
      descriptions: {
        home: 'Darmowe randki bez paywalla — uczciwy feed, czat po matchu. 18+.',
        faq: 'Darmowe randki, czat bez subskrypcji — FAQ Ravnopar.'
      }
    },
    home: {
      seoCompare: {
        title: 'Uczciwe randki bez paywalla',
        lead: 'Darmowe randki bez ukrytych limitów — match i czat po obustronnym kontakcie.',
        points: [
          { title: 'Czat po matchu', text: 'Rozmowa po obustronnej akceptacji.' },
          { title: 'Uczciwy feed', text: 'Darowizny i premium nie dają przewagi.' },
          { title: 'Ochrona przed ghostingiem', text: 'Ostrzeżenia i auto-zamykanie nieaktywnych czatów.' }
        ],
        link: 'Wszystkie pytania →'
      },
      seoFree: {
        title: 'Darmowe randki — bez subskrypcji',
        lead: 'Prośby, match i czat w podstawowym użyciu.',
        points: [
          { title: 'Profil', text: 'Zdjęcie, preferencje, feed.' },
          { title: 'Match bez ukrytych opłat', text: 'Darmowy czat po akceptacji.' },
          { title: '18+, wiele języków', text: 'Dla Europy.' }
        ],
        link: 'Zacznij za darmo →'
      }
    },
    faq: {
      seoDiscoveryItems: [
        { q: 'Czy Ravnopar to alternatywa dla Tindera?', a: 'Jeśli szukasz darmowych randek z czatem po matchu — bez paywalla — Ravnopar może pasować. Nacisk na uczciwe zasady.' },
        { q: 'Czy mogę poznawać ludzi za darmo?', a: 'Tak. Prośby, akceptacja i czat są darmowe.' },
        { q: 'Czy płacę za wiadomości po matchu?', a: 'Nie. Prywatny czat jest darmowy.' },
        { q: 'Czym Ravnopar różni się od innych aplikacji randkowych?', a: 'Uczciwy match — bez płatnego boosta, bez ukrytego zasięgu, jasne zasady anti-ghosting.' },
        { q: 'Czy działa w Europie?', a: 'Tak — wiele języków, rejestracja 18+.' },
        { q: 'Na poważnie czy na luzie?', a: 'Obie opcje — zależy od profilu.' }
      ]
    }
  },
  cs: {
    meta: {
      descriptions: {
        home: 'Seznamování zdarma bez paywallu — férový feed, chat po matchi. 18+.',
        faq: 'Seznamování zdarma, chat bez předplatného — FAQ Ravnopar.'
      }
    },
    home: {
      seoCompare: {
        title: 'Férové seznamování bez paywallu',
        lead: 'Seznamování zdarma bez skrytých limitů — match a chat po oboustranném kontaktu.',
        points: [
          { title: 'Chat po matchi', text: 'Konverzace po oboustranném souhlasu.' },
          { title: 'Férový feed', text: 'Dary a premium nedávají prioritu.' },
          { title: 'Ochrana před ghostingem', text: 'Varování a uzavření neaktivních chatů.' }
        ],
        link: 'Všechny otázky →'
      },
      seoFree: {
        title: 'Seznamování zdarma — bez předplatného',
        lead: 'Žádosti, match a chat v základním použití.',
        points: [
          { title: 'Registrace', text: 'Profil s fotkou, feed.' },
          { title: 'Match bez skrytých poplatků', text: 'Soukromý chat zdarma.' },
          { title: '18+, více jazyků', text: 'Pro Evropu.' }
        ],
        link: 'Začít zdarma →'
      }
    },
    faq: {
      seoDiscoveryItems: [
        { q: 'Je Ravnopar alternativa k Tinderu?', a: 'Pokud hledáte seznamování zdarma s chatem po matchi — bez paywallu — Ravnopar může vyhovovat.' },
        { q: 'Mohu se seznamovat zdarma?', a: 'Ano. Žádosti, přijetí a chat jsou zdarma.' },
        { q: 'Platím za zprávy po matchi?', a: 'Ne. Soukromý chat je zdarma.' },
        { q: 'Jak se Ravnopar liší od jiných seznamovacích aplikací?', a: 'Férový match — bez placeného boostu, bez skrytého dosahu, jasná pravidla proti ghostingu.' },
        { q: 'Funguje v Evropě?', a: 'Ano — více jazyků, registrace 18+.' },
        { q: 'Vážně nebo na legraci?', a: 'Obojí — podle profilu.' }
      ]
    }
  },
  fr: {
    meta: {
      descriptions: {
        home: 'Rencontres gratuites sans paywall — fil équitable, chat après match. 18+.',
        faq: 'Rencontres gratuites, chat sans abonnement — FAQ Ravnopar.'
      }
    },
    home: {
      seoCompare: {
        title: 'Rencontres équitables sans paywall',
        lead: 'Rencontres gratuites sans limites cachées — match et chat après contact mutuel.',
        points: [
          { title: 'Chat après le match', text: 'Conversation quand les deux acceptent.' },
          { title: 'Fil équitable', text: 'Dons et premium ne donnent pas de priorité.' },
          { title: 'Anti-ghosting', text: 'Avertissements et fermeture des chats inactifs.' }
        ],
        link: 'Toutes les questions →'
      },
      seoFree: {
        title: 'Rencontres gratuites — sans abonnement',
        lead: 'Demandes, match et chat inclus dans l’usage de base.',
        points: [
          { title: 'Profil', text: 'Photo, préférences, fil.' },
          { title: 'Match sans frais cachés', text: 'Chat privé gratuit après acceptation.' },
          { title: '18+, plusieurs langues', text: 'Pour l’Europe.' }
        ],
        link: 'Commencer gratuitement →'
      }
    },
    faq: {
      seoDiscoveryItems: [
        { q: 'Ravnopar est-il une alternative à Tinder ?', a: 'Si vous cherchez des rencontres gratuites avec chat après match — sans paywall — Ravnopar peut convenir.' },
        { q: 'Puis-je rencontrer des gens gratuitement ?', a: 'Oui. Demandes, acceptation et chat sont gratuits.' },
        { q: 'Faut-il payer les messages après le match ?', a: 'Non. Le chat privé est gratuit.' },
        { q: 'En quoi Ravnopar diffère-t-il des autres apps de rencontre ?', a: 'Match équitable — pas de boost payant, pas de portée cachée, règles anti-ghosting claires.' },
        { q: 'Fonctionne-t-il en Europe ?', a: 'Oui — plusieurs langues, inscription 18+.' },
        { q: 'Sérieux ou casual ?', a: 'Les deux — selon le profil.' }
      ]
    }
  },
  es: {
    meta: {
      descriptions: {
        home: 'Citas gratis sin paywall — feed justo, chat tras el match. 18+.',
        faq: 'Citas gratis, chat sin suscripción — FAQ Ravnopar.'
      }
    },
    home: {
      seoCompare: {
        title: 'Citas justas sin paywall',
        lead: 'Citas gratis sin límites ocultos — match y chat tras contacto mutuo.',
        points: [
          { title: 'Chat tras el match', text: 'Conversación cuando ambos aceptan.' },
          { title: 'Feed justo', text: 'Donaciones y premium no dan prioridad.' },
          { title: 'Anti-ghosting', text: 'Avisos y cierre de chats inactivos.' }
        ],
        link: 'Todas las preguntas →'
      },
      seoFree: {
        title: 'Citas gratis — sin suscripción',
        lead: 'Solicitudes, match y chat incluidos en el uso básico.',
        points: [
          { title: 'Perfil', text: 'Foto, preferencias, feed.' },
          { title: 'Match sin costes ocultos', text: 'Chat privado gratis.' },
          { title: '18+, varios idiomas', text: 'Para Europa.' }
        ],
        link: 'Empezar gratis →'
      }
    },
    faq: {
      seoDiscoveryItems: [
        { q: '¿Es Ravnopar una alternativa a Tinder?', a: 'Si buscas citas gratis con chat tras el match — sin paywall — Ravnopar puede encajar.' },
        { q: '¿Puedo conocer gente gratis?', a: 'Sí. Solicitudes, aceptación y chat son gratis.' },
        { q: '¿Hay que pagar mensajes tras el match?', a: 'No. El chat privado es gratis.' },
        { q: '¿En qué se diferencia Ravnopar de otras apps de citas?', a: 'Match justo — sin boost de pago, sin alcance oculto, reglas anti-ghosting claras.' },
        { q: '¿Funciona en Europa?', a: 'Sí — varios idiomas, registro 18+.' },
        { q: '¿Serio o casual?', a: 'Ambos — según el perfil.' }
      ]
    }
  },
  sk: {
    meta: {
      descriptions: {
        home: 'Zoznamovanie zadarmo bez paywallu — férový feed, chat po matchi. 18+.',
        faq: 'Zoznamovanie zadarmo, chat bez predplatného — FAQ Ravnopar.'
      }
    },
    home: {
      seoCompare: {
        title: 'Férové zoznamovanie bez paywallu',
        lead: 'Zoznamovanie zadarmo bez skrytých limitov — match a chat po obojstrannom kontakte.',
        points: [
          { title: 'Chat po matchi', text: 'Konverzácia po obojstrannom súhlase.' },
          { title: 'Férový feed', text: 'Dary a premium nedávajú prioritu.' },
          { title: 'Ochrana pred ghostingom', text: 'Varovania a uzavretie neaktívnych chatov.' }
        ],
        link: 'Všetky otázky →'
      },
      seoFree: {
        title: 'Zoznamovanie zadarmo — bez predplatného',
        lead: 'Žiadosti, match a chat v základnom používaní.',
        points: [
          { title: 'Registrácia', text: 'Profil s fotkou, feed.' },
          { title: 'Match bez skrytých poplatkov', text: 'Súkromný chat zadarmo.' },
          { title: '18+, viac jazykov', text: 'Pre Európu.' }
        ],
        link: 'Začať zadarmo →'
      }
    },
    faq: {
      seoDiscoveryItems: [
        { q: 'Je Ravnopar alternatíva k Tinderu?', a: 'Ak hľadáte zoznamovanie zadarmo s chatom po matchi — bez paywallu — Ravnopar môže vyhovovať.' },
        { q: 'Môžem sa zoznamovať zadarmo?', a: 'Áno. Žiadosti, prijatie a chat sú zadarmo.' },
        { q: 'Platím za správy po matchi?', a: 'Nie. Súkromný chat je zadarmo.' },
        { q: 'Ako sa Ravnopar líši od iných zoznamovacích aplikácií?', a: 'Férový match — bez plateného boostu, bez skrytého dosahu, jasné pravidlá proti ghostingu.' },
        { q: 'Funguje v Európe?', a: 'Áno — viac jazykov, registrácia 18+.' },
        { q: 'Vážne alebo na zabavu?', a: 'Oboje — podľa profilu.' }
      ]
    }
  }
};
