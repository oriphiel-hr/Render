import React from 'react';

const About = () => {
  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 bg-gray-50 min-h-screen">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-extrabold text-gray-900 mb-4">
          🏢 O nama
        </h1>
        <p className="text-xl text-gray-600 mb-8">
          Uslugar - Platforma za povezivanje klijenata i pružatelja usluga
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Company Info */}
        <div className="bg-white rounded-lg shadow-md p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            🎯 Naša misija
          </h2>
          <p className="text-gray-700 mb-6 leading-relaxed">
            Uslugar je revolucionarna platforma koja povezuje klijente koji traže usluge 
            s kvalitetnim pružateljima usluga. Naš cilj je olakšati pronalaženje pouzdanih 
            izvođača radova i omogućiti pružateljima usluga da pronađu nove klijente.
          </p>
          
          <h3 className="text-xl font-semibold text-gray-900 mb-4">
            🚀 Ekskluzivni lead sustav
          </h3>
          <p className="text-gray-700 mb-6 leading-relaxed">
            Naša jedinstvena značajka je ekskluzivni lead sustav gdje samo jedan pružatelj 
            dobiva kontakt klijenta. Nema konkurencije, nema spam poruka - samo kvalitetni 
            leadovi za kvalitetne pružatelje usluga.
          </p>

          <h3 className="text-xl font-semibold text-gray-900 mb-4">
            📊 Naše vrijednosti
          </h3>
          <ul className="text-gray-700 space-y-2">
            <li className="flex items-center gap-2">
              <span className="text-green-500">✓</span>
              Transparentnost i poštenje
            </li>
            <li className="flex items-center gap-2">
              <span className="text-green-500">✓</span>
              Kvaliteta iznad kvantitete
            </li>
            <li className="flex items-center gap-2">
              <span className="text-green-500">✓</span>
              Podrška lokalnoj zajednici
            </li>
            <li className="flex items-center gap-2">
              <span className="text-green-500">✓</span>
              Inovacija i tehnologija
            </li>
          </ul>
        </div>

        {/* Company Details */}
        <div className="bg-white rounded-lg shadow-md p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            🏢 Podaci o tvrtki
          </h2>
          
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                📍 Adresa
              </h3>
              <p className="text-gray-700">
                Slavenskoga ulica 5<br />
                10000 Zagreb<br />
                Hrvatska
              </p>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                📞 Kontakt
              </h3>
              <p className="text-gray-700">
                <strong>Telefon:</strong> <a href="tel:+385915618258" className="inline-flex items-center gap-2 text-blue-700 hover:text-blue-900 hover:underline underline-offset-2 px-2 py-1 rounded bg-blue-50 hover:bg-blue-100 border border-blue-100 transition-colors">📞 091 561 8258</a><br />
                <strong>Kontakt osoba:</strong> Tomislav Kranjec, direktor
              </p>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                💼 Naša djelatnost
              </h3>
              <p className="text-gray-700">
                <strong>Djelatnost:</strong> Računalno programiranje i razvoj softvera<br />
                <strong>Specijalizacija:</strong> Web aplikacije, mobilne aplikacije i IT savjetovanje<br />
                <span className="text-sm text-gray-600">
                  Pružamo usluge razvoja web stranica, mobilnih aplikacija, 
                  e-trgovine i IT savjetovanja za poduzeća svih veličina.
                </span>
              </p>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                🌟 Zašto Uslugar?
              </h3>
              <ul className="text-gray-700 space-y-2">
                <li className="flex items-start gap-2">
                  <span className="text-blue-500">🎯</span>
                  <span>Ekskluzivni leadovi bez konkurencije</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-500">💰</span>
                  <span>Refund ako klijent ne odgovori</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-500">📊</span>
                  <span>ROI analitika i statistike</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-500">🔐</span>
                  <span>Verifikacija klijenata i trust score</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-500">⚡</span>
                  <span>Queue sustav za pravednu distribuciju</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="mt-16 bg-white rounded-lg shadow-md p-8">
        <h2 className="text-2xl font-bold text-gray-900 text-center mb-8">
          📈 Naši rezultati
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="text-center">
            <div className="text-3xl font-bold text-blue-600 mb-2">51+</div>
            <div className="text-gray-700">Kategorija usluga</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-green-600 mb-2">100%</div>
            <div className="text-gray-700">Ekskluzivni leadovi</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-purple-600 mb-2">24h</div>
            <div className="text-gray-700">Rok za odgovor</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-orange-600 mb-2">48h</div>
            <div className="text-gray-700">Refund garancija</div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="mt-16 text-center bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 text-white">
        <h2 className="text-3xl font-bold mb-4">
          Spremni za ekskluzivne leadove?
        </h2>
        <p className="text-xl mb-6 opacity-90">
          Registrirajte se danas i počnite primati kvalitetne leadove
        </p>
        <div className="space-x-4">
          <a
            href="#register-user"
            className="inline-block bg-white text-blue-600 py-3 px-8 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
          >
            🎯 Registriraj se kao Pružatelj
          </a>
          <a
            href="#contact"
            className="inline-block bg-green-500 text-white py-3 px-8 rounded-lg font-semibold hover:bg-green-600 transition-colors"
          >
            📞 Kontaktiraj nas
          </a>
        </div>
      </div>
    </div>
  );
};

export default About;
