import React from 'react'

export default function TimeLanding(){
  return (
    <div className="min-h-screen bg-white">
      {/* Hero */}
      <section className="max-w-6xl mx-auto px-4 py-16 md:py-24">
        <div className="grid md:grid-cols-2 gap-8 items-center">
          <div>
            <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight text-gray-900">
              Štedi vrijeme, ne živce.
              <br />
              <span className="text-indigo-600">Nađi provjerenog majstora u 60 sekundi.</span>
            </h1>
            <p className="mt-4 text-lg text-gray-600">
              Samo jedan majstor vidi tvoj upit. Nema poziva s nepoznatih brojeva. Nema gubljenja vremena.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <a href="#leads" className="inline-flex items-center px-5 py-3 bg-indigo-600 text-white rounded-md shadow hover:bg-indigo-700">
                📩 Pošalji brzi upit
              </a>
              <a href="#register-user" className="inline-flex items-center px-5 py-3 bg-gray-100 text-gray-900 rounded-md hover:bg-gray-200">
                👷‍♂️ Postani majstor na Uslugara
              </a>
            </div>
            <div className="mt-4 text-sm text-gray-500">
              ⏱ Odgovor u prosjeku: <span className="font-semibold text-gray-700">27 minuta</span>
            </div>
          </div>
          <div className="relative">
            <div className="aspect-video rounded-xl bg-gradient-to-tr from-indigo-50 to-indigo-100 border border-indigo-200 flex items-center justify-center">
              <div className="text-center p-6">
                <div className="text-6xl">⏱️</div>
                <div className="mt-2 text-gray-600">Vrijeme je tvoja valuta</div>
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

      {/* CTA */}
      <section className="bg-indigo-600">
        <div className="max-w-6xl mx-auto px-4 py-12 text-center">
          <h3 className="text-2xl font-bold text-white">Uštedimo vrijeme — već danas</h3>
          <p className="mt-2 text-indigo-100">Pošalji brzi upit i dobij prvog provjerenog majstora u sat vremena.</p>
          <div className="mt-6 flex justify-center gap-3">
            <a href="#leads" className="inline-flex items-center px-5 py-3 bg-white text-gray-900 rounded-md shadow hover:bg-gray-100">Pošalji upit</a>
            <a href="#register-user" className="inline-flex items-center px-5 py-3 bg-indigo-500 text-white rounded-md hover:bg-indigo-400">Postani majstor</a>
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


