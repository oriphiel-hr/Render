/**
 * Odabrani skupovi matičnih podataka — mapiranje na Sudreg API.
 * @see https://sudreg-data.gov.hr/api/javni/dokumentacija/open_api
 */

const PODRUZNICA_API_PATHS = [
  '/nazivi_podruznica',
  '/skraceni_nazivi_podruznica',
  '/sjedista_podruznica',
  '/email_adrese_podruznica',
  '/djelatnosti_podruznica'
];

const DATASETS = [
  {
    id: 'subjekti',
    label: 'Subjekti',
    description: 'Temeljni podaci subjekta upisa (identitet, status, datumi, sudovi). Pravni oblik nije ovdje — vidi /pravni_oblici.',
    apiPaths: ['/subjekti'],
    relatedPaths: ['/pravni_oblici'],
    alternative: 'Za jedan MBS/OIB: GET /detalji_subjekta',
    paging: true,
    onlyActiveDefault: true,
    onlyActiveNote:
      'only_active=1 (zadano): samo aktivni (status=1). 0 = uključuje i neaktivne (status=0, uklj. brisane).',
    fields: [
      'mbs',
      'oib',
      'status',
      'postupak',
      'datum_osnivanja',
      'datum_brisanja',
      'sud_id_nadlezan',
      'sud_id_sluzba',
      'glavna_djelatnost',
      'ino_podruznica',
      'stecajna_masa',
      'likvidacijska_masa'
    ]
  },
  {
    id: 'pravni_oblici',
    label: 'Pravni oblik',
    description: 'Vrsta pravnog oblika subjekta (d.o.o., j.d.o.o., d.d., …) — jedan red po MBS.',
    apiPaths: ['/pravni_oblici'],
    alternative: 'Šifrarnik: /vrste_pravnih_oblika · expand_relations=true za naziv i kraticu',
    paging: true,
    expandRelations: true,
    fields: [
      'mbs',
      'vrsta_pravnog_oblika_id',
      'vrsta_pravnog_oblika.sifra',
      'vrsta_pravnog_oblika.naziv',
      'vrsta_pravnog_oblika.kratica'
    ]
  },
  {
    id: 'tvrtka',
    label: 'Tvrtka (naziv)',
    description: 'Puni i skraćeni naziv tvrtke — odvojeno od /subjekti.',
    apiPaths: ['/tvrtke'],
    alternative: 'GET /detalji_subjekta → tvrtka, skracena_tvrtka',
    paging: true,
    fields: ['mbs', 'tvrtka', 'skracena_tvrtka', 'jezik_id', 'status']
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
  },
  {
    id: 'podružnica',
    label: 'Podružnica',
    description:
      'Podaci o podružnicama — isti MBS matičnog subjekta, razlikovanje rednim brojem podružnice.',
    apiPaths: PODRUZNICA_API_PATHS,
    alternative:
      'GET /detalji_subjekta → podruznice[] (ukl. zastupanje — nema zasebnog bulk endpointa)',
    paging: true,
    mbsNote: 'Podružnica nema zaseban MBS — koristi se mbs matice + podruznica_rbr.',
    resursi: [
      { id: 'naziv', label: 'Naziv podružnice', path: '/nazivi_podruznica', fields: ['mbs', 'podruznica_rbr', 'naziv', 'jezik_id'] },
      {
        id: 'skraceni_naziv',
        label: 'Skraćeni naziv podružnice',
        path: '/skraceni_nazivi_podruznica',
        fields: ['mbs', 'podruznica_rbr', 'skraceni_naziv', 'jezik_id']
      },
      {
        id: 'sjedište',
        label: 'Sjedište podružnice',
        path: '/sjedista_podruznica',
        fields: ['mbs', 'podruznica_rbr', 'ulica', 'naselje', 'postanski_broj', 'drzava']
      },
      {
        id: 'email',
        label: 'Email podružnice',
        path: '/email_adrese_podruznica',
        fields: ['mbs', 'podruznica_rbr', 'email_adresa_rbr', 'adresa']
      },
      {
        id: 'djelatnost',
        label: 'Djelatnosti podružnice',
        path: '/djelatnosti_podruznica',
        fields: ['mbs', 'podruznica_rbr', 'nkd_sifra', 'djelatnost_tekst']
      }
    ],
    fields: ['mbs', 'podruznica_rbr', 'naziv', 'skraceni_naziv', 'sjedište', 'email', 'djelatnost']
  }
];

const BY_ID = new Map(DATASETS.map((d) => [d.id, d]));

function listDatasets() {
  return DATASETS.map((d) => ({
    id: d.id,
    label: d.label,
    description: d.description,
    apiPaths: d.apiPaths,
    relatedPaths: d.relatedPaths || null,
    expandRelations: d.expandRelations === true,
    paging: d.paging !== false,
    fields: d.fields,
    vrste: d.vrste || null,
    resursi: d.resursi || null,
    mbsNote: d.mbsNote || null,
    alternative: d.alternative || null,
    onlyActiveDefault: d.onlyActiveDefault === true,
    onlyActiveNote: d.onlyActiveNote || null,
    planned: false
  }));
}

function getDataset(id) {
  return BY_ID.get(String(id || '').trim()) || null;
}

/** Svi Sudreg pozivi za puni import (bez ručnog odabira po metodi). */
function listAllImportJobs() {
  const jobs = [];
  for (const d of DATASETS) {
    if (d.id === 'djelatnost') {
      for (const v of d.vrste || []) {
        jobs.push({
          datasetKey: `djelatnost:${v.id}`,
          datasetId: 'djelatnost',
          apiPath: v.path,
          label: `${d.label} — ${v.label}`,
          query: { vrsta: v.id }
        });
      }
      continue;
    }
    if (d.id === 'podružnica') {
      for (const r of d.resursi || []) {
        const slug = r.path.replace(/^\//, '').replace(/\//g, '_');
        jobs.push({
          datasetKey: `podruznica:${slug}`,
          datasetId: 'podružnica',
          apiPath: r.path,
          label: `${d.label} — ${r.label}`,
          query: { api_path: r.path }
        });
      }
      continue;
    }
    jobs.push({
      datasetKey: d.id,
      datasetId: d.id,
      apiPath: d.apiPaths[0],
      label: d.label,
      query: {}
    });
  }
  return jobs;
}

module.exports = {
  DATASETS,
  PODRUZNICA_API_PATHS,
  listDatasets,
  getDataset,
  listAllImportJobs
};
