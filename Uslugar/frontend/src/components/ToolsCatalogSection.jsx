import React, { useMemo, useState } from 'react';

const TOOL_CATEGORIES = [
  { key: 'ALL', label: 'Sve kategorije', icon: '🧰' },
  { key: 'AKU', label: 'Akumulatorski alati', icon: '🔋' },
  { key: 'HAND', label: 'Ručni alati', icon: '🛠️' },
  { key: 'ELECTRO', label: 'Električni alati', icon: '⚡' },
  { key: 'WORKSHOP', label: 'Oprema za radionicu', icon: '🏭' },
  { key: 'GARDEN', label: 'Vrt i kuća', icon: '🌿' },
  { key: 'CONSUMABLES', label: 'Pribor i potrošni materijal', icon: '📦' },
];

const HARD_CODED_PRODUCTS = [
  { id: 'tool-1', name: 'Aku bušilica 20V / Industrial', category: 'AKU', priceFrom: 'od 129 €', image: '/assets/totaltools/aku-busilica.jpg' },
  { id: 'tool-2', name: 'Akumulatorski odvijač 4V', category: 'AKU', priceFrom: 'od 79 €', image: '/assets/totaltools/aku-odvijac.jpg' },
  { id: 'tool-3', name: 'Set ručnih alata za servis', category: 'HAND', priceFrom: 'od 39 €', image: '/assets/totaltools/radionica-oprema.jpg' },
  { id: 'tool-4', name: 'Električna kutna brusilica 1100W', category: 'ELECTRO', priceFrom: 'od 89 €', image: '/assets/totaltools/kutna-brusilica.jpg' },
  { id: 'tool-5', name: 'Sabljasta električna pila 1200W', category: 'WORKSHOP', priceFrom: 'od 149 €', image: '/assets/totaltools/sabljasta-pila.jpg' },
  { id: 'tool-6', name: 'Akumulatorske vrtne škare', category: 'GARDEN', priceFrom: 'od 119 €', image: '/assets/totaltools/vrtne-skare.jpg' },
  { id: 'tool-7', name: 'Dijamantna rezna ploča', category: 'CONSUMABLES', priceFrom: 'od 12 €', image: '/assets/totaltools/rezna-ploca.jpg' },
  { id: 'tool-8', name: 'Ubodna pila 20V / Industrial', category: 'ELECTRO', priceFrom: 'od 159 €', image: '/assets/totaltools/ubodna-pila.jpg' },
];

export default function ToolsCatalogSection({ id }) {
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [logosReady, setLogosReady] = useState({
    uslugar: true,
    totaltools: true,
  });
  const contactPrefillHref =
    '#contact?subject=partnership&message=' +
    encodeURIComponent(
      'Upit iz mini kataloga TotalTools.\n\nZanima me ponuda za alat(e):\n- \n\nKoličina:\nBudžet:\nGrad:\nTelefon:\n\nŽelim li i Uslugar pogodnost: DA/NE'
    );

  const visibleProducts = useMemo(
    () => HARD_CODED_PRODUCTS.filter((tool) => (selectedCategory === 'ALL' ? true : tool.category === selectedCategory)),
    [selectedCategory]
  );

  return (
    <section id={id} className="mb-8 rounded-2xl border border-amber-200 bg-gradient-to-r from-amber-50 to-white p-6 shadow-sm">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <div className="mb-4 flex flex-wrap items-center gap-3">
            <div className="flex items-center rounded-lg border border-gray-200 bg-white px-3 py-2 shadow-sm">
              {logosReady.uslugar ? (
                <img
                  src="/assets/uslugar-logo.svg"
                  alt="Uslugar logo"
                  className="h-8 w-auto"
                  onError={() => setLogosReady((prev) => ({ ...prev, uslugar: false }))}
                />
              ) : (
                <span className="text-sm font-bold text-gray-800">USLUGAR</span>
              )}
            </div>
            <span className="text-lg font-bold text-amber-700">×</span>
            <div className="flex items-center rounded-lg border border-gray-200 bg-white px-3 py-2 shadow-sm">
              {logosReady.totaltools ? (
                <img
                  src="/assets/totaltools-logo.svg"
                  alt="TotalTools logo"
                  className="h-8 w-auto"
                  onError={() => setLogosReady((prev) => ({ ...prev, totaltools: false }))}
                />
              ) : (
                <span className="text-sm font-bold text-gray-800">TOTALTOOLS</span>
              )}
            </div>
          </div>

          <h2 className="text-2xl font-bold text-amber-900">Alati partnera (TotalTools) - mini katalog</h2>
          <p className="mt-2 max-w-3xl text-sm text-amber-800">
            Suradnja{' '}
            <a href="https://www.uslugar.eu/" target="_blank" rel="noreferrer" className="font-semibold underline hover:text-amber-900">
              Uslugar
            </a>{' '}
            i{' '}
            <a href="https://totaltools.hr/" target="_blank" rel="noreferrer" className="font-semibold underline hover:text-amber-900">
              TotalTools
            </a>{' '}
            za izvođače: prijavite se i javimo vam se s informacijama o alatima i mogućim pogodnostima na Uslugar
            pretplati, prema vašoj djelatnosti i budžetu. Pogodnosti iz ponude odnose se na korisnike koji se u skladu
            s pravilima registriraju na{' '}
            <a href="#register-user" className="font-semibold underline hover:text-amber-900">
              Uslugar
            </a>
            . Popunjavanje ne jamči automatski popust - uvjete potvrđujemo pojedinačno. Upit možete poslati kroz{' '}
            <a href={contactPrefillHref} className="font-semibold underline hover:text-amber-900">
              kontakt formu
            </a>
            .
          </p>
          <div className="mt-3 grid gap-3 md:grid-cols-2">
            <div className="rounded-lg border border-amber-300 bg-white/80 p-3 text-sm text-amber-900">
              <p className="font-semibold">Tko je TotalTools?</p>
              <p className="mt-1">
                TotalTools je specijalizirani partner za profesionalne i hobi alate, pribor i opremu za radionicu,
                gradiliste te kucne i vrtne radove.
              </p>
              <a
                href="https://totaltools.hr/"
                target="_blank"
                rel="noreferrer"
                className="mt-2 inline-block font-semibold text-blue-700 hover:underline"
              >
                Posjeti totaltools.hr
              </a>
            </div>
            <div className="rounded-lg border border-amber-300 bg-white/80 p-3 text-sm text-amber-900">
              <p className="font-semibold">Zasto odabrati TotalTools?</p>
              <ul className="mt-1 space-y-1">
                <li>- Sirok izbor alata i potrosnog materijala</li>
                <li>- Ponuda prilagodena djelatnosti i budzetu</li>
                <li>- Brza usporedba i jednostavniji odabir</li>
              </ul>
            </div>
          </div>
          <div className="mt-3 rounded-lg border border-amber-300 bg-white/80 p-3 text-sm text-amber-900">
            <p className="font-semibold">Kako poslati upit za kupnju alata?</p>
            <p className="mt-1">
              Kliknite <strong>Zatrazi ponudu alata</strong>. Otvorit ce se postojeca kontakt forma s unaprijed
              popunjenom porukom. U poruci samo dopisite koji alat trebate, kolicinu, budzet i grad.
            </p>
          </div>
          <p className="mt-2 text-xs text-amber-700">Izvor kataloga: hardkodiran katalog sa slikama u frontendu</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <a
            href={contactPrefillHref}
            className="inline-flex items-center rounded-lg bg-amber-600 px-4 py-2 text-sm font-semibold text-white hover:bg-amber-700"
          >
            Zatrazi ponudu alata
          </a>
          <a
            href="#subscription"
            className="inline-flex items-center rounded-lg border border-amber-300 bg-white px-4 py-2 text-sm font-semibold text-amber-800 hover:bg-amber-100"
          >
            Zanimaju me i Uslugar pogodnosti
          </a>
        </div>
      </div>

      <div className="mt-5 flex flex-wrap gap-2">
        {TOOL_CATEGORIES.map((category) => (
          <button
            key={category.key}
            type="button"
            onClick={() => setSelectedCategory(category.key)}
            className={`rounded-full px-3 py-1.5 text-xs font-semibold ${
              selectedCategory === category.key
                ? 'bg-amber-600 text-white'
                : 'bg-white text-amber-800 border border-amber-300 hover:bg-amber-100'
            }`}
          >
            {category.icon} {category.label}
          </button>
        ))}
      </div>

      <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-4">
        {visibleProducts.map((tool) => (
          <div key={tool.id} className="rounded-xl border border-amber-200 bg-white p-4">
            <img
              src={tool.image}
              alt={tool.name}
              className="mb-3 h-40 w-full rounded-lg object-cover"
              loading="lazy"
            />
            <p className="text-sm font-semibold text-gray-900">{tool.name}</p>
            <p className="mt-1 text-xs text-gray-600">
              {TOOL_CATEGORIES.find((category) => category.key === tool.category)?.label || 'Kategorija'}
            </p>
            <p className="mt-2 text-sm font-bold text-amber-700">{tool.priceFrom}</p>
          </div>
        ))}
      </div>
      <p className="mt-3 text-xs text-gray-600">
        * Cijene su informativne (od). Konacna ponuda ovisi o tocnoj specifikaciji i dostupnosti.
      </p>
    </section>
  );
}
