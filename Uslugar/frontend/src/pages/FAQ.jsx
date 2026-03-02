import React from 'react';

const FAQ = ({ userType = 'guest' }) => {
  // Segmentirano prema publici
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
      answer: "1 kredit = 1 ekskluzivan lead. Cijena ovisi o pretplatničkom planu. Kredite plaćaju isključivo pružatelji usluga – korisnici koji objavljuju poslove ne plaćaju ništa."
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
      answer: "Krediti se dodaju mjesečno prema vašem planu ili ih možete dodatno kupiti. Stanje kredita uvijek je vidljivo u vašem profilu."
    }
  ];

  const audienceFromUserType = userType === 'provider' ? 'provider' : 'user';
  const [audience, setAudience] = React.useState(audienceFromUserType);

  const faqsToShow = audience === 'provider'
    ? faqsProvider
    : faqsUser;

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 bg-gray-50 min-h-screen">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-extrabold text-gray-900 mb-4">
          ❓ Često Postavljana Pitanja
        </h1>
        <p className="text-xl text-gray-600 mb-8">
          Pronađite odgovore na najčešća pitanja o Uslugar platformi
        </p>
        <div className="mb-6 flex justify-center gap-3">
          <button
            type="button"
            onClick={() => setAudience('user')}
            className={
              "px-4 py-2 rounded-full text-sm font-medium border " +
              (audience === 'user'
                ? "bg-blue-600 text-white border-blue-600"
                : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50")
            }
          >
            👥 Za korisnike (naručitelje)
          </button>
          <button
            type="button"
            onClick={() => setAudience('provider')}
            className={
              "px-4 py-2 rounded-full text-sm font-medium border " +
              (audience === 'provider'
                ? "bg-purple-600 text-white border-purple-600"
                : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50")
            }
          >
            🛠️ Za pružatelje usluga
          </button>
        </div>
        <p className="text-sm text-gray-500 mb-8 max-w-2xl mx-auto">
          Trenutno prikazujemo odgovore za{" "}
          <strong>{audience === 'provider' ? 'pružatelje usluga' : 'korisnike (naručitelje)'}</strong>.
          Kao korisnik koji objavljuje poslove ne plaćate kredite – platforma je za vas besplatna. Informacije o kreditima i pretplati odnose se na pružatelje usluga.
        </p>
      </div>

      <div className="space-y-6">
        {faqsToShow.map((faq, index) => (
          <div key={index} className="bg-white rounded-lg shadow-md border border-gray-200 p-6 hover:shadow-lg transition-shadow">
            <h3 className="text-xl font-semibold text-gray-900 mb-3">
              {faq.question}
            </h3>
            <p className="text-gray-600 leading-relaxed">
              {faq.answer}
            </p>
          </div>
        ))}
      </div>

      {/* CTA Section */}
      <div className="mt-16 text-center bg-gradient-to-r from-stone-50 to-amber-50 dark:from-stone-900/50 dark:to-amber-900/20 rounded-2xl p-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          Niste pronašli odgovor?
        </h2>
        <p className="text-gray-600 mb-6">
          Kontaktirajte našu podršku ili pogledajte detaljnu dokumentaciju
        </p>
        <div className="space-x-4">
          <a
            href="mailto:support@uslugar.hr"
            className="inline-flex items-center gap-2 text-blue-700 hover:text-blue-900 hover:underline underline-offset-2 px-3 py-2 rounded-lg bg-blue-50 hover:bg-blue-100 border border-blue-100 transition-colors"
            title="Pošalji email podršci"
          >
            📧 Kontaktiraj podršku
          </a>
          <a
            href="#documentation"
            className="inline-flex items-center gap-2 text-green-700 hover:text-green-900 hover:underline underline-offset-2 px-3 py-2 rounded-lg bg-green-50 hover:bg-green-100 border border-green-100 transition-colors"
            title="Pogledaj dokumentaciju"
          >
            📚 Pregledaj dokumentaciju
          </a>
        </div>
      </div>
    </div>
  );
};

export default FAQ;
