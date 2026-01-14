import React from 'react';

const Contact = () => {

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 bg-gray-50 min-h-screen">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-extrabold text-gray-900 mb-4">
          📞 Kontakt
        </h1>
        <p className="text-xl text-gray-600 mb-8">
          Kontaktirajte nas za sve informacije o Uslugar platformi
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Contact Information */}
        <div className="space-y-8">
          {/* Contact Details */}
          <div className="bg-white rounded-lg shadow-md p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              📍 Kontakt podaci
            </h2>
            
            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <div className="text-2xl">📍</div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-1">
                    Adresa
                  </h3>
                  <p className="text-gray-700">
                    Slavenskoga ulica 5<br />
                    10000 Zagreb<br />
                    Hrvatska
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="text-2xl">📞</div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-1">
                    Telefon
                  </h3>
                  <p className="text-gray-700">
                    <a 
                      href="tel:+385915618258" 
                      className="inline-flex items-center gap-2 text-blue-700 hover:text-blue-900 hover:underline underline-offset-2 px-2 py-1 rounded bg-blue-50 hover:bg-blue-100 border border-blue-100 transition-colors font-semibold"
                      title="Nazovi"
                    >
                      📞 091 561 8258
                    </a>
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="text-2xl">👤</div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-1">
                    Kontakt osoba
                  </h3>
                  <p className="text-gray-700">
                    Tomislav Kranjec, direktor
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="text-2xl">💼</div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-1">
                    Naša djelatnost
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
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <div className="bg-white rounded-lg shadow-md p-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              💬 Pošaljite nam poruku
            </h2>
            <form className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                    Ime i prezime
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Vaše ime i prezime"
                  />
                </div>
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="vas@email.com"
                  />
                </div>
              </div>
              
              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                  Telefon
                </label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="091 123 4567"
                />
              </div>

              <div>
                <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-1">
                  Predmet
                </label>
                <select
                  id="subject"
                  name="subject"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Odaberite predmet</option>
                  <option value="general">Općenito pitanje</option>
                  <option value="technical">Tehnička podrška</option>
                  <option value="business">Poslovni upit</option>
                  <option value="partnership">Partnerstvo</option>
                  <option value="complaint">Žalba</option>
                </select>
              </div>

              <div>
                <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">
                  Poruka
                </label>
                <textarea
                  id="message"
                  name="message"
                  rows="4"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Opišite svoje pitanje ili zahtjev..."
                ></textarea>
              </div>

              <button
                type="submit"
                className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
              >
                📤 Pošalji poruku
              </button>
            </form>
          </div>
        </div>

        {/* Map */}
        <div className="bg-white rounded-lg shadow-md p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            🗺️ Lokacija
          </h2>
          
          <div className="mb-4">
            <p className="text-gray-700 mb-2">
              <strong>Adresa:</strong> Slavenskoga ulica 5, 10000 Zagreb, Hrvatska
            </p>
            <p className="text-gray-700">
              <strong>Telefon:</strong> <a href="tel:+385915618258" className="text-blue-600 hover:underline">091 561 8258</a>
            </p>
          </div>

          <div className="relative">
            <div className="w-full h-96 rounded-lg border border-gray-300 overflow-hidden" style={{ minHeight: '400px' }}>
              <iframe
                src="https://www.openstreetmap.org/export/embed.html?bbox=15.9700%2C45.8100%2C15.9900%2C45.8200&layer=mapnik&marker=45.8150%2C15.9819"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="Oriphiel d.o.o. lokacija - Slavenskoga ulica 5, Zagreb"
              />
            </div>
            
            {/* Map info overlay */}
            <div className="absolute top-4 left-4 bg-white bg-opacity-90 backdrop-blur-sm rounded-lg p-3 shadow-lg">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                <span className="text-sm font-medium text-gray-900">Oriphiel d.o.o.</span>
              </div>
              <p className="text-xs text-gray-600 mt-1">
                Slavenskoga ulica 5, Zagreb
              </p>
            </div>
          </div>

          <div className="mt-4 text-sm text-gray-600">
            <p>
              💡 <strong>Savjet:</strong> Karta je interaktivna - možete zumirati i pomicati se po karti.
            </p>
            <p className="mt-1">
              🔗 <strong>Otvori u novom prozoru:</strong> 
              <a 
                href="https://www.openstreetmap.org/?mlat=45.8150&mlon=15.9819&zoom=15" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-blue-600 hover:underline ml-1"
              >
                Pogledaj na OpenStreetMap
              </a>
            </p>
          </div>
        </div>
      </div>

      {/* Business Hours */}
      <div className="mt-12 bg-white rounded-lg shadow-md p-8">
        <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">
          🕒 Radno vrijeme
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="text-center">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">📞 Telefonska podrška</h3>
            <p className="text-gray-700">
              Ponedjeljak - Petak: 09:00 - 17:00<br />
              Subota: 10:00 - 14:00<br />
              Nedjelja: Zatvoreno
            </p>
          </div>
          <div className="text-center">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">💬 Online podrška</h3>
            <p className="text-gray-700">
              24/7 dostupna<br />
              Odgovor u roku od 24h<br />
              Email: support@uslugar.hr
            </p>
          </div>
          <div className="text-center">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">🏢 Ured</h3>
            <p className="text-gray-700">
              Ponedjeljak - Petak: 08:00 - 16:00<br />
              Subota - Nedjelja: Zatvoreno<br />
              <em>Termin po dogovoru</em>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contact;
