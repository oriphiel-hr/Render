import React from 'react'
import ToolsCatalogSection from '../components/ToolsCatalogSection';

export default function TimeLanding({ initialSection }){
  React.useEffect(() => {
    if (!initialSection) return;
    const node = document.getElementById(initialSection);
    if (!node) return;
    node.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, [initialSection]);

  return (
    <div className="min-h-screen">
      {/* Hero */}
      <section className="max-w-6xl mx-auto px-4 py-16 md:py-24">
        <div className="grid md:grid-cols-2 gap-8 items-center">
          <div>
            <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight text-gray-900">
              Štedi vrijeme, ne živce.
              <br />
              <span className="text-amber-700 dark:text-amber-400">Nađi provjerenog majstora u 60 sekundi.</span>
            </h1>
            <p className="mt-4 text-lg text-gray-600">
              Samo jedan majstor vidi tvoj upit. Nema poziva s nepoznatih brojeva. Nema gubljenja vremena.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <a href="#leads" className="inline-flex items-center px-5 py-3 bg-amber-600 text-white rounded-md shadow hover:bg-amber-700">
                📩 Pošalji brzi upit
              </a>
              <a href="#register-user" className="inline-flex items-center px-5 py-3 bg-gray-100 text-gray-900 rounded-md hover:bg-gray-200">
                👷‍♂️ Postani majstor na Uslugaru
              </a>
            </div>
            <div className="mt-4 text-sm text-gray-500">
              ⏱ Odgovor u prosjeku: <span className="font-semibold text-gray-700">27 minuta</span>
            </div>
          </div>
          <div className="relative">
            <div className="rounded-xl bg-gradient-to-tr from-amber-50 to-orange-50 border border-amber-200 flex items-start justify-center">
              <div className="flex h-full w-full flex-col items-center justify-start px-6 pt-6 pb-4">
                <div className="flex items-center gap-3">
                  <div className="text-5xl">⏱️</div>
                  <div className="text-lg font-semibold text-gray-900">
                    Vrijeme je tvoja valuta
                  </div>
                </div>
                <div className="mt-2 text-sm text-gray-600 text-center max-w-xs">
                  Svaka minuta manje traženja znači minuta više za posao, obitelj ili odmor.
                </div>
                <div className="mt-4 grid w-full max-w-sm grid-cols-2 gap-3 text-xs text-amber-900 dark:text-amber-200">
                  <div className="col-span-2 rounded-lg border border-amber-200 dark:border-amber-700 px-3 py-2">
                    <div className="text-sm font-semibold">1 majstor</div>
                    <div className="mt-0.5 text-amber-800/90 dark:text-amber-300/90">
                      po svakom upitu – bez natjecanja
                    </div>
                  </div>
                  <div className="rounded-lg border border-amber-200 dark:border-amber-700 px-3 py-2">
                    <div className="text-sm font-semibold">27 min</div>
                    <div className="mt-0.5 text-amber-800/90 dark:text-amber-300/90">
                      prosječni prvi odgovor
                    </div>
                  </div>
                  <div className="rounded-lg border border-amber-200 dark:border-amber-700 px-3 py-2">
                    <div className="text-sm font-semibold">0 spam poziva</div>
                    <div className="mt-0.5 text-amber-800/90 dark:text-amber-300/90">
                      tvoj broj ne dijelimo s više izvođača
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Kako radi */}
      <section className="bg-gray-50 border-y">
        <div className="max-w-6xl mx-auto px-4 py-12">
          <h2 className="text-2xl font-bold text-gray-900">Kako radi</h2>
          <div className="mt-6 grid md:grid-cols-3 gap-6">
            {[{
              step:'1️⃣', title:'Pošalji upit', desc:'Što, kada, gdje. 30 sekundi.'
            },{
              step:'2️⃣', title:'Čekaj potvrdu', desc:'Dodjeljujemo jednog provjerenog majstora. 10 minuta.'
            },{
              step:'3️⃣', title:'Dogovori termin', desc:'Bez natjecanja i gubljenja vremena. ~1h prosječno.'
            }].map((k) => (
              <div key={k.step} className="bg-white rounded-lg border p-5">
                <div className="text-2xl">{k.step}</div>
                <div className="mt-2 font-semibold text-gray-900">{k.title}</div>
                <div className="mt-1 text-gray-600">{k.desc}</div>
              </div>
            ))}
          </div>
          <div className="mt-4 text-sm text-gray-500">Prosječno vrijeme do prvog kontakta: <span className="font-medium text-gray-700">37 minuta</span></div>
        </div>
      </section>

      {/* Zašto Uslugar */}
      <section className="max-w-6xl mx-auto px-4 py-12">
        <h2 className="text-2xl font-bold text-gray-900">Zašto Uslugar?</h2>
        <p className="mt-2 text-gray-600">Jer vrijeme više vrijedi od “besplatno”.</p>
        <div className="mt-6 grid md:grid-cols-4 gap-4">
          {[{
            icon:'⏰', title:'Bez čekanja', text:'Upit ide odmah pravom majstoru.'
          },{
            icon:'🙌', title:'Bez smetnji', text:'Nitko drugi ne vidi tvoje podatke.'
          },{
            icon:'💬', title:'Bez stresa', text:'Jedan razgovor, jedan dogovor.'
          },{
            icon:'🧱', title:'Bez rizika', text:'Samo provjereni izvođači.'
          }].map((f) => (
            <div key={f.title} className="bg-white rounded-lg border p-5">
              <div className="text-3xl">{f.icon}</div>
              <div className="mt-2 font-semibold text-gray-900">{f.title}</div>
              <div className="mt-1 text-gray-600">{f.text}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Koliko brzo rješavamo */}
      <section className="bg-gray-50 border-y">
        <div className="max-w-6xl mx-auto px-4 py-12">
          <h2 className="text-2xl font-bold text-gray-900">Vrijeme govori sve</h2>
          <div className="mt-6 grid md:grid-cols-3 gap-4">
            {[{
              name:'Vodoinstalater', time:'42 minute', stars:'⭐⭐⭐⭐⭐'
            },{
              name:'Električar', time:'36 minuta', stars:'⭐⭐⭐⭐☆'
            },{
              name:'Soboslikar', time:'1 sat 15 min', stars:'⭐⭐⭐⭐⭐'
            }].map((row) => (
              <div key={row.name} className="bg-white rounded-lg border p-5">
                <div className="font-semibold text-gray-900">{row.name}</div>
                <div className="mt-1 text-gray-600">Prosjek do dogovora: {row.time}</div>
                <div className="mt-1 text-yellow-500">{row.stars}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonial short */}
      <section className="max-w-6xl mx-auto px-4 py-12">
        <div className="grid md:grid-cols-2 gap-6">
          <blockquote className="bg-white border p-5 rounded-lg">
            “Na drugim servisima izgubila sam 2 dana na pozive. Ovdje sam sve dogovorila u 15 minuta.”
            <div className="mt-2 text-sm text-gray-600">— Marija, Zagreb</div>
          </blockquote>
          <blockquote className="bg-white border p-5 rounded-lg">
            “Konačno netko tko poštuje moje vrijeme.”
            <div className="mt-2 text-sm text-gray-600">— Goran, Rijeka</div>
          </blockquote>
        </div>
      </section>

      <div className="max-w-6xl mx-auto px-4 py-4">
        <ToolsCatalogSection id="tools-catalog" />
      </div>

      {/* CTA */}
      <section className="bg-amber-600 dark:bg-amber-700">
        <div className="max-w-6xl mx-auto px-4 py-12 text-center">
          <h3 className="text-2xl font-bold text-white">Uštedimo vrijeme — već danas</h3>
          <p className="mt-2 text-amber-100">Pošalji brzi upit i dobij prvog provjerenog majstora u sat vremena.</p>
          <div className="mt-6 flex justify-center gap-3">
            <a href="#leads" className="inline-flex items-center px-5 py-3 bg-white text-gray-900 rounded-md shadow hover:bg-gray-100">Pošalji upit</a>
            <a href="#register-user" className="inline-flex items-center px-5 py-3 bg-amber-500 text-white rounded-md hover:bg-amber-400">Postani majstor</a>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="max-w-6xl mx-auto px-4 py-8 text-sm text-gray-500">
        Uslugar.hr – tvoj mir u svijetu kaosa. Ekskluzivni majstori. Provjerene usluge. Bez poziva, bez stresa, bez gubljenja vremena.
      </footer>
    </div>
  )
}


