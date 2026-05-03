import React, { useState, useRef, useEffect } from 'react';

// Jednostavna ilustracija "pitanje / pomoć" za vizualni identitet FAQ sekcije
const FAQHeroIcon = () => (
  <div className="mx-auto mb-6 flex items-center justify-center" aria-hidden>
    <svg
      width="80"
      height="80"
      viewBox="0 0 80 80"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="text-indigo-500 dark:text-indigo-400 drop-shadow-sm"
    >
      <circle cx="40" cy="40" r="36" stroke="currentColor" strokeWidth="2.5" fill="none" opacity="0.3" />
      <circle cx="40" cy="40" r="28" stroke="currentColor" strokeWidth="2" fill="none" opacity="0.5" />
      <path
        d="M40 28c-4.4 0-8 3.2-8 7.2 0 2.4 1.6 4 3.2 5.2l.8.6v3h8v-5.2l-1.2-.8c-2.4-1.6-4-3.2-4-5.8 0-2.4 2-4.4 4.4-4.4s4.4 2 4.4 4.4h8c0-5.6-4.4-10-9.2-10z"
        fill="currentColor"
        opacity="0.9"
      />
      <circle cx="40" cy="54" r="4" fill="currentColor" opacity="0.9" />
    </svg>
  </div>
);

const FAQ = ({ userType = 'guest' }) => {
  const faqsUser = [
    {
      question: "Je li objavljivanje posla besplatno?",
      answer: "Da. Kao korisnik usluge (naručitelj) ne plaćate kredite – objavljivanje poslova i korištenje platforme za vas je besplatno. Kredite plaćaju pružatelji usluga kada kupuju vaš upit (ekskluzivni lead)."
    },
    {
      question: "Što ako pružatelj ne odgovori ili ne ispuni dogovor?",
      answer: "Možete prijaviti problem u aplikaciji. Platforma rješava prijave prema pravilima. Vi ne plaćate ništa dodatno – eventualni povrat kredita je interni proces pružatelja."
    },
    {
      question: "Što je trust score?",
      answer: "Trust score (0-100) pokazuje koliko je klijent verifikiran i pouzdan za rad. Pomaže pružateljima da znaju da surađuju s ozbiljnim naručiteljima."
    },
    {
      question: "Kako funkcionira recenziranje?",
      answer: "Nakon završenog posla, vi i pružatelj se možete međusobno ocijeniti i komentirati. Ocjene pomažu drugim korisnicima da odaberu kvalitetne suradnike."
    },
    {
      question: "Kako funkcionira chat sustav?",
      answer: "Možete razgovarati s pružateljem u real-time chatu vezanom uz konkretan posao. Sav dogovor i komunikacija ostaju unutar platforme."
    },
    {
      question: "Smijem li kontaktirati pružatelja izvan platforme prije angažmana?",
      answer: "Platforma je zamišljena tako da se prvi kontakt i dogovor oko posla vode kroz lead i chat. Neovlašteno zaobilazenje (npr. traženje izravnog kontakta samo da se izbjegne lead) nije u skladu s pravilima i može imati posljedice po račun."
    }
  ];

  const faqsProvider = [
    {
      question: "Što je ekskluzivan lead?",
      answer: "Ekskluzivan lead znači da samo vi (kao pružatelj) dobivate kontakt klijenta. Nema drugih izvođača koji konkuriraju za isti posao."
    },
    {
      question: "Što ako klijent ne odgovori?",
      answer: "Ako klijent (naručitelj) ne odgovori u roku od 48 sati, automatski dobivate refund kredita kao pružatelj."
    },
    {
      question: "Koliko košta 1 kredit?",
      answer: "1 kredit = 1 ekskluzivan lead. Cijena ovisi o pretplatničkom planu. Kredite plaćaju isključivo pružatelji usluga – korisnici koji objavljuju poslove ne plaćaju ništa.",
      linkToPricing: true
    },
    {
      question: "Što je AI quality score?",
      answer: "AI quality score ocjenjuje kvalitetu leadova na temelju povijesti odgovora, uspješnosti i ponašanja korisnika. Viši score znači veća vjerojatnost da će se posao realizirati."
    },
    {
      question: "Mogu li otkazati pretplatu?",
      answer: "Da, možete otkazati pretplatu bilo kada. Nema ugovorne obveze – nakon isteka tekućeg obračunskog razdoblja pretplata se više ne obnavlja."
    },
    {
      question: "Kako funkcionira queue sustav?",
      answer: "Leadovi se dodjeljuju redom providerima koji ispunjavaju kriterije. Imate određeno vrijeme (npr. 24 sata) da odgovorite na ponuđeni lead prije nego što prijeđe na sljedećeg."
    },
    {
      question: "Trebam li licencu za svoju djelatnost?",
      answer: "Za neke kategorije obavezna je licenca ili ovlaštenje. U svom profilu možete uploadati dokumente licenci kako bi klijenti vidjeli da ste ovlašteni za rad."
    },
    {
      question: "Što su postavke „javnog prikaza” profila?",
      answer: "Možete odabrati prikaz „tvrtka prvo” (kad je poslovna značka potvrđena), standardni prikaz ili ograničen javni ogled koji smanjuje vidljivost portfelja, vanjskog weba i duljine opisa u tražilici — kako bi se smanjilo neformalno „obilazenje” platforme prije angažmana. Možete dodati i do šest kratkih redaka o uslugama ili suradnji (npr. više djelatnosti)."
    },
    {
      question: "Kako vidim svoju ROI statistiku?",
      answer: "U ROI dashboardu vidite koliko ste leadova kupili, koliko ste poslova zatvorili i koji je ukupni prihod – tako možete pratiti isplativost platforme."
    },
    {
      question: "Što uključuje Mini CRM za leadove?",
      answer: "Mini CRM u „Moji ekskluzivni leadovi” uključuje: bilješke po leadu (napomene, dogovoreno s klijentom), sljedeći korak (npr. „Nazovi u petak”) i datum podsjetnika – sve na jednoj kartici leada, s gumbom Spremi."
    },
    {
      question: "Mogu li pregovarati o cijeni?",
      answer: "Da. Možete označiti ponude kao 'pregovorno' i kroz chat dogovoriti konačnu cijenu s klijentom."
    },
    {
      question: "Što je trial period?",
      answer: "Novi pružatelji dobivaju probni period (npr. 7 dana) s početnim brojem kredita kako bi testirali platformu. Korisnici koji objavljuju poslove ne troše kredite – za njih je objava posla besplatna."
    },
    {
      question: "Kako se ažuriraju krediti?",
      answer: "Krediti se dodaju mjesečno prema vašem planu ili ih možete dodatno kupiti. Stanje kredita uvijek je vidljivo u vašem profilu.",
      linkToPricing: true
    }
  ];

  const audienceFromUserType = userType === 'provider' ? 'provider' : 'user';
  const [audience, setAudience] = useState(audienceFromUserType);
  const [openIndex, setOpenIndex] = useState(0);
  const [search, setSearch] = useState('');
  const [showBackToTop, setShowBackToTop] = useState(false);
  const [feedbackSent, setFeedbackSent] = useState(null); // null | 'yes' | 'no'
  const faqTopRef = useRef(null);
  const searchInputRef = useRef(null);

  const faqsToShow = audience === 'provider' ? faqsProvider : faqsUser;
  const filteredFaqs = search.trim()
    ? faqsToShow.filter(
        (faq) =>
          faq.question.toLowerCase().includes(search.toLowerCase()) ||
          faq.answer.toLowerCase().includes(search.toLowerCase())
      )
    : faqsToShow;

  const toggleOpen = (index) => {
    setOpenIndex((prev) => (prev === index ? -1 : index));
  };

  const clearSearch = () => {
    setSearch('');
    setOpenIndex(0);
    searchInputRef.current?.focus();
  };

  useEffect(() => {
    const onScroll = () => setShowBackToTop(window.scrollY > 400);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    const onKeyDown = (e) => {
      if (e.key !== 'Escape') return;
      if (search.trim().length > 0) clearSearch();
      else searchInputRef.current?.blur();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [search]);

  // JSON-LD FAQPage za SEO (sva pitanja – korisnici + pružatelji)
  useEffect(() => {
    const allFaqs = [...faqsUser, ...faqsProvider];
    const schema = {
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: allFaqs.map((faq) => ({
        '@type': 'Question',
        name: faq.question,
        acceptedAnswer: {
          '@type': 'Answer',
          text: faq.answer
        }
      }))
    };
    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.textContent = JSON.stringify(schema);
    script.id = 'faq-jsonld';
    const existing = document.getElementById('faq-jsonld');
    if (existing) existing.remove();
    document.head.appendChild(script);
    return () => {
      const el = document.getElementById('faq-jsonld');
      if (el) el.remove();
    };
  }, []);

  /** Označi podudaranje pretrage u tekstu (escape + highlight) */
  const highlightMatch = (text, query) => {
    if (!text || !query.trim()) return text;
    const q = query.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const re = new RegExp(`(${q})`, 'gi');
    const parts = text.split(re);
    return parts.map((part, i) =>
      i % 2 === 1 ? (
        <mark key={i} className="bg-amber-200 dark:bg-amber-600/50 rounded px-0.5 font-medium">{part}</mark>
      ) : (
        part
      )
    );
  };
  const hasSearch = search.trim().length > 0;

  return (
    <div ref={faqTopRef} className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors">
      {/* Hero + trust vizual */}
      <div className="text-center mb-12">
        <div className="faq-animate-in faq-delay-0">
          <FAQHeroIcon />
        </div>
        <h1 className="faq-animate-in faq-delay-1 text-4xl font-extrabold text-gray-900 dark:text-white mb-4 transition-colors">
          Često Postavljana Pitanja
        </h1>
        <p className="faq-animate-in faq-delay-2 text-xl text-gray-600 dark:text-gray-300 mb-8 transition-colors">
          Pronađite odgovore na najčešća pitanja o Uslugar platformi
        </p>

        {/* Jedinstvena aktivna boja (indigo) – usklađeno s ostatkom aplikacije */}
        <div className="faq-animate-in faq-delay-3 mb-6 flex justify-center gap-3 flex-wrap">
          <button
            type="button"
            onClick={() => { setAudience('user'); setOpenIndex(0); }}
            className={
              'px-5 py-2.5 rounded-full text-sm font-medium border transition-all duration-200 ' +
              (audience === 'user'
                ? 'bg-indigo-600 text-white border-indigo-600 shadow-md shadow-indigo-500/25'
                : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 hover:border-gray-400')
            }
          >
            👥 Za korisnike (naručitelje)
          </button>
          <button
            type="button"
            onClick={() => { setAudience('provider'); setOpenIndex(0); }}
            className={
              'px-5 py-2.5 rounded-full text-sm font-medium border transition-all duration-200 ' +
              (audience === 'provider'
                ? 'bg-indigo-600 text-white border-indigo-600 shadow-md shadow-indigo-500/25'
                : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 hover:border-gray-400')
            }
          >
            🛠️ Za pružatelje usluga
          </button>
        </div>

        <p className="faq-animate-in faq-delay-4 text-sm text-gray-500 dark:text-gray-400 mb-6 max-w-2xl mx-auto transition-colors">
          Trenutno prikazujemo odgovore za{' '}
          <strong className="text-gray-700 dark:text-gray-200">
            {audience === 'provider' ? 'pružatelje usluga' : 'korisnike (naručitelje)'}
          </strong>
          {' '}({faqsToShow.length} {faqsToShow.length === 1 ? 'pitanje' : 'pitanja'}).
          Kao korisnik koji objavljuje poslove ne plaćate kredite – platforma je za vas besplatna. Informacije o kreditima i pretplati odnose se na pružatelje usluga.
        </p>

        {/* Pretraga po pitanjima */}
        <div className="faq-animate-in faq-delay-5 mb-8 max-w-xl mx-auto">
          <label htmlFor="faq-search" className="sr-only">Pretraži pitanja</label>
          <div className="flex gap-2">
            <input
              ref={searchInputRef}
              id="faq-search"
              type="search"
              placeholder="Pretraži pitanja ili odgovore..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setOpenIndex(-1); }}
              className="flex-1 px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:focus:ring-indigo-400 dark:focus:border-indigo-400 transition-colors"
              aria-label="Pretraži pitanja"
            />
            {hasSearch && (
              <button
                type="button"
                onClick={clearSearch}
                className="px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors shrink-0"
                aria-label="Očisti pretragu"
                title="Očisti pretragu (Escape)"
              >
                Očisti
              </button>
            )}
          </div>
          {hasSearch ? (
            <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
              Pronađeno {filteredFaqs.length} {filteredFaqs.length === 1 ? 'rezultat' : 'rezultata'}. Tipka <kbd className="px-1.5 py-0.5 rounded bg-gray-200 dark:bg-gray-600 text-xs font-mono">Esc</kbd> briše pretragu.
            </p>
          ) : (
            <p className="mt-2 text-xs text-gray-400 dark:text-gray-500">
              Savjet: tipka <kbd className="px-1 py-0.5 rounded bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 font-mono">Esc</kbd> briše pretragu.
            </p>
          )}
        </div>
      </div>

      {/* Accordion FAQ – stagger animacija */}
      <div className="space-y-3">
        {filteredFaqs.length === 0 ? (
          <div className="faq-animate-in faq-delay-6 text-center py-12 px-6 rounded-xl bg-white dark:bg-gray-800/80 border border-gray-200 dark:border-gray-700">
            <p className="text-gray-600 dark:text-gray-400 mb-4">Nema rezultata za „{search}”. Pokušajte drugi pojam ili uklonite pretragu.</p>
            <button
              type="button"
              onClick={clearSearch}
              className="px-4 py-2 rounded-lg bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-200 dark:hover:bg-indigo-900/50 transition-colors text-sm font-medium"
            >
              Očisti pretragu
            </button>
          </div>
        ) : (
          filteredFaqs.map((faq, index) => {
            const isOpen = openIndex === index;
            const delayClass = `faq-delay-${Math.min(6 + index, 15)}`;
            return (
              <div
                key={index}
                className={`faq-animate-in ${delayClass} rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800/80 shadow-sm hover:shadow-md dark:shadow-none transition-all duration-200 overflow-hidden`}
              >
              <button
                type="button"
                onClick={() => toggleOpen(index)}
                className="w-full text-left px-6 py-4 flex items-center justify-between gap-4 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 dark:focus-visible:ring-offset-gray-900 rounded-xl"
                aria-expanded={isOpen}
                aria-controls={`faq-answer-${index}`}
                id={`faq-question-${index}`}
              >
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white pr-2">
                  {hasSearch ? highlightMatch(faq.question, search) : faq.question}
                </h3>
                <span
                  className={
                    'flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-indigo-600 dark:text-indigo-400 transition-transform duration-200 ' +
                    (isOpen ? 'rotate-180 bg-indigo-50 dark:bg-indigo-900/30' : 'bg-gray-100 dark:bg-gray-700')
                  }
                  aria-hidden
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="6 9 12 15 18 9" />
                  </svg>
                </span>
              </button>
              <div
                id={`faq-answer-${index}`}
                role="region"
                aria-labelledby={`faq-question-${index}`}
                className={`faq-accordion-grid ${isOpen ? 'open' : ''}`}
              >
                <div className="faq-accordion-inner">
                  <p className="px-6 pb-4 pt-0 text-gray-600 dark:text-gray-300 leading-relaxed">
                    {hasSearch ? highlightMatch(faq.answer, search) : faq.answer}
                  </p>
                  {faq.linkToPricing && (
                    <p className="px-6 pb-4 pt-0 text-sm">
                      <a href="/#pricing" className="text-indigo-600 dark:text-indigo-400 hover:underline font-medium">
                        Detalje pogledajte na stranici Cjenik →
                      </a>
                    </p>
                  )}
                </div>
              </div>
            </div>
            );
          })
        )}
      </div>

      {/* CTA – dark mode + blagi hover + uvodna animacija */}
      <div className="faq-animate-in faq-delay-6 mt-16 text-center rounded-2xl p-8 bg-gradient-to-r from-stone-50 to-amber-50 dark:from-gray-800/80 dark:to-indigo-900/20 border border-stone-200/80 dark:border-gray-700 transition-colors">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
          Niste pronašli odgovor?
        </h2>
        <p className="text-gray-600 dark:text-gray-300 mb-6">
          Kontaktirajte našu podršku ili pogledajte detaljnu dokumentaciju
        </p>
        <div className="flex flex-wrap justify-center gap-3">
          <a
            href="mailto:support@uslugar.hr"
            className="inline-flex items-center gap-2 text-indigo-700 dark:text-indigo-300 hover:text-indigo-900 dark:hover:text-indigo-100 hover:underline underline-offset-2 px-4 py-2.5 rounded-lg bg-indigo-50 dark:bg-indigo-900/30 hover:bg-indigo-100 dark:hover:bg-indigo-900/50 border border-indigo-100 dark:border-indigo-800 transition-colors"
            title="Pošalji email podršci"
          >
            📧 Kontaktiraj podršku
          </a>
          <a
            href="/#documentation"
            className="inline-flex items-center gap-2 text-emerald-700 dark:text-emerald-300 hover:text-emerald-900 dark:hover:text-emerald-100 hover:underline underline-offset-2 px-4 py-2.5 rounded-lg bg-emerald-50 dark:bg-emerald-900/20 hover:bg-emerald-100 dark:hover:bg-emerald-900/40 border border-emerald-100 dark:border-emerald-800 transition-colors"
            title="Pogledaj dokumentaciju"
          >
            📚 Pregledaj dokumentaciju
          </a>
          <a
            href="/#pricing"
            className="inline-flex items-center gap-2 text-amber-700 dark:text-amber-300 hover:text-amber-900 dark:hover:text-amber-100 hover:underline underline-offset-2 px-4 py-2.5 rounded-lg bg-amber-50 dark:bg-amber-900/20 hover:bg-amber-100 dark:hover:bg-amber-900/40 border border-amber-100 dark:border-amber-800 transition-colors"
            title="Cjenik planova"
          >
            💰 Cjenik
          </a>
        </div>
        {feedbackSent === null ? (
          <div className="mt-8 pt-6 border-t border-stone-200 dark:border-gray-600">
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Je li vam ova stranica pomogla?</p>
            <div className="flex justify-center gap-3">
              <button
                type="button"
                onClick={() => setFeedbackSent('yes')}
                className="px-4 py-2 rounded-lg bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200 hover:bg-green-200 dark:hover:bg-green-900/50 transition-colors text-sm font-medium"
              >
                Da
              </button>
              <button
                type="button"
                onClick={() => setFeedbackSent('no')}
                className="px-4 py-2 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors text-sm font-medium"
              >
                Ne
              </button>
            </div>
          </div>
        ) : (
          <p className="mt-6 text-sm text-gray-600 dark:text-gray-400">
            {feedbackSent === 'yes' ? '👍 Hvala na povratnoj informaciji!' : 'Hvala. Ako želite, kontaktirajte podršku s konkretnim pitanjem – rado ćemo nadopuniti FAQ.'}
          </p>
        )}
      </div>

      {/* Vrati se na vrh – fiksiran gumb, vidljiv nakon skrolanja */}
      {showBackToTop && (
        <button
          type="button"
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          className="faq-back-to-top fixed bottom-6 right-6 z-40 flex h-12 w-12 items-center justify-center rounded-full bg-indigo-600 text-white shadow-lg hover:bg-indigo-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2 dark:bg-gray-800 dark:hover:bg-gray-700 transition-colors"
          aria-label="Vrati se na vrh stranice"
          title="Vrati se na vrh"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
            <polyline points="18 15 12 9 6 15" />
          </svg>
        </button>
      )}
    </div>
  );
};

export default FAQ;
