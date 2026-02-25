import React from 'react';

const FAQ = () => {
  const faqs = [
    {
      question: "Je li objavljivanje posla besplatno?",
      answer: "Da. Kao korisnik usluge (naručitelj) ne plaćate kredite – objavljivanje poslova i korištenje platforme za vas je besplatno. Kredite plaćaju pružatelji usluga kada kupuju vaš upit (ekskluzivni lead)."
    },
    {
      question: "Što ako pružatelj ne odgovori ili ne ispuni dogovor?",
      answer: "Možete prijaviti problem u aplikaciji. Platforma rješava prijave prema pravilima (npr. pružatelj može dobiti povrat svog kredita – to je njegov proces, vas ne zanima iznos u kreditima)."
    },
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
      answer: "1 kredit = 1 ekskluzivan lead. Cijena varira ovisno o planu koji odaberete. Odnosi se na pružatelje usluga – korisnici ne plaćaju kredite."
    },
    {
      question: "Što je AI quality score?",
      answer: "AI quality score ocjenjuje kvalitetu leadova na temelju povijesti odgovora i uspješnosti."
    },
    {
      question: "Mogu li otkazati pretplatu?",
      answer: "Da, možete otkazati pretplatu bilo kada. Ne postoji ugovorna obveza."
    },
    {
      question: "Kako funkcionira queue sustav?",
      answer: "Leadovi se dodjeljuju redom providerima. Imate 24 sata da odgovorite na ponuđeni lead."
    },
    {
      question: "Što je trust score?",
      answer: "Trust score (0-100) pokazuje koliko je klijent verifikiran i pouzdan za rad."
    },
    {
      question: "Trebam li licencu za svoju djelatnost?",
      answer: "Neke kategorije zahtijevaju licencu. Možete upload-ovati dokumente licenci u svom profilu."
    },
    {
      question: "Kako vidim svoju ROI statistiku?",
      answer: "U ROI dashboard-u vidite konverziju leadova, ukupan prihod i prosječnu vrijednost leada."
    },
    {
      question: "Mogu li pregovarati o cijeni?",
      answer: "Da, možete označiti ponude kao 'pregovorno' i razgovarati s klijentom o cijeni."
    },
    {
      question: "Kako funkcionira recenziranje?",
      answer: "Nakon završenog posla, klijent i pružatelj se mogu međusobno ocijeniti i komentirati."
    },
    {
      question: "Što ako ne odgovorim na lead u roku?",
      answer: "Lead se automatski prebacuje na sljedećeg providera u redu čekanja."
    },
    {
      question: "Kako funkcionira chat sustav?",
      answer: "Možete razgovarati s klijentom u real-time chatu vezanom uz konkretan posao."
    },
    {
      question: "Mogu li filtrirati leadove po kategorijama?",
      answer: "Da, možete odabrati kategorije koje vas zanimaju i primati samo relevantne leadove."
    },
    {
      question: "Što je trial period?",
      answer: "Novi pružatelji dobivaju 7 dana besplatno s 5 kredita da probaju platformu. Korisnici koji objavljuju poslove ne troše kredite – platforma je za njih besplatna."
    },
    {
      question: "Kako se ažuriraju krediti?",
      answer: "Krediti se dodaju mjesečno prema vašem planu (za pružatelje) ili možete kupiti dodatne. Korisnici usluge ne koriste kredite."
    }
  ];

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 bg-gray-50 min-h-screen">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-extrabold text-gray-900 mb-4">
          ❓ Često Postavljana Pitanja
        </h1>
        <p className="text-xl text-gray-600 mb-8">
          Pronađite odgovore na najčešća pitanja o Uslugar platformi
        </p>
        <p className="text-sm text-gray-500 mb-8 max-w-2xl mx-auto">
          Prva pitanja odnose se na korisnike (naručitelje koji objavljuju poslove) i pružatelje (izvođače koji primaju leadove). Kao korisnik ne plaćate kredite – platforma je besplatna za objavljivanje poslova. Kredite plaćaju pružatelji kada kupuju vaš upit.
        </p>
      </div>

      <div className="space-y-6">
        {faqs.map((faq, index) => (
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
