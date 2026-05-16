/**
 * Odabrani skupovi matičnih podataka (MVP import) — mapiranje na Sudreg API.
 * @see https://sudreg-data.gov.hr/api/javni/dokumentacija/open_api
 */

const DATASETS = [
  {
    id: 'tvrtka',
    label: 'Tvrtka',
    description: 'Osnovni podaci o subjektu — identitet i status u registru.',
    apiPaths: ['/subjekti', '/tvrtke'],
    alternative: 'Za jedan MBS: GET /detalji_subjekta (polja tvrtka, skracena_tvrtka, …)',
    paging: true,
    fields: [
      'mbs',
      'oib',
      'naziv / tvrtka',
      'skraceni_naziv',
      'pravni_oblik',
      'status',
      'datum_osnivanja',
      'datum_brisanja',
      'sud_id_nadlezan',
      'sud_id_sluzba',
      'glavna_djelatnost'
    ]
  },
  {
    id: 'sjedište',
    label: 'Sjedište',
    description: 'Adresa sjedišta subjekta (jedan red po MBS u tipičnom slučaju).',
    apiPaths: ['/sjedista'],
    alternative: 'GET /detalji_subjekta → sjediste',
    paging: true,
    fields: [
      'mbs',
      'adresa / ulica',
      'naselje',
      'postanski_broj',
      'drzava',
      'sifra_naselja',
      'naselje_van_sifrarnika'
    ]
  },
  {
    id: 'email',
    label: 'Email',
    description: 'E-mail adrese subjekta — može ih biti više (rbr).',
    apiPaths: ['/email_adrese'],
    alternative: 'GET /detalji_subjekta → email_adrese[]',
    paging: true,
    fields: ['mbs', 'email_adresa_rbr', 'adresa']
  },
  {
    id: 'djelatnost',
    label: 'Djelatnost (NKD)',
    description: 'NKD i tekst djelatnosti — tri izvora u API-ju.',
    apiPaths: [
      '/pretezite_djelatnosti',
      '/predmeti_poslovanja',
      '/evidencijske_djelatnosti'
    ],
    vrste: [
      { id: 'pretezita', label: 'Pretežita djelatnost', path: '/pretezite_djelatnosti' },
      { id: 'predmet', label: 'Predmet poslovanja', path: '/predmeti_poslovanja' },
      { id: 'evidencijska', label: 'Evidencijska djelatnost', path: '/evidencijske_djelatnosti' }
    ],
    fields: ['mbs', 'nkd_sifra / nacionalna_klasifikacija_djelatnosti_id', 'djelatnost_tekst', 'vrsta']
  }
];

const BY_ID = new Map(DATASETS.map((d) => [d.id, d]));

function listDatasets() {
  return DATASETS.map((d) => ({
    id: d.id,
    label: d.label,
    description: d.description,
    apiPaths: d.apiPaths,
    paging: d.paging !== false,
    fields: d.fields,
    vrste: d.vrste || null,
    planned: true
  }));
}

function getDataset(id) {
  return BY_ID.get(String(id || '').trim()) || null;
}

module.exports = { DATASETS, listDatasets, getDataset };
