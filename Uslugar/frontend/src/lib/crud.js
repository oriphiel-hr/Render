// assets/js/crud.js
(function () {
// Koristi global window.API_ORIGIN ako je postavljen (iz CrudTab.jsx)
// ili default na relativni path /api/admin
const API_ORIGIN = (window.API_ORIGIN || '').replace(/\/+$/, '');
const API_PREFIX = window.API_PREFIX || '/api/admin';
const API_BASE = API_ORIGIN ? `${API_ORIGIN}${API_PREFIX}` : API_PREFIX;
// sad će pozivi ići na .../api/admin/users, .../api/admin/categories


  /**
   * OPTION CACHE za <select> iz relacija
   * source = { resource:'users', value:'id', label:'fullName', fallback:'email', qs:'limit=1000' }
   */
  const OptionCache = {
    _data: new Map(),
    async get(source) {
      const key = JSON.stringify(source || {});
      if (!source) return null;
      if (this._data.has(key)) return this._data.get(key);

      const url = new URL(`${API_BASE}/${source.resource}`);
      if (source.qs) {
        const sp = new URLSearchParams(source.qs);
        sp.forEach((v, k) => url.searchParams.set(k, v));
      } else {
        // uzmi više stavki da pokrije većinu slučajeva
        url.searchParams.set('limit', 1000);
      }

      try {
        const raw = await fetchJSON(url.toString());
        const items = Array.isArray(raw) ? raw : (raw.items || raw.results || []);
        const rows = items.map(r => ({
          value: r[source.value],
          label:
            (source.label && r[source.label]) ||
            (source.fallback && r[source.fallback]) ||
            r[source.value]
        }));
        this._data.set(key, rows);
        return rows;
      } catch (e) {
        console.error('OptionCache error', source, e);
        this._data.set(key, []);
        return [];
      }
    },
    /** helper: ID -> label */
    async labelFor(source, id) {
      if (!source) return id;
      const opts = await this.get(source);
      const hit = opts.find(o => String(o.value) === String(id));
      return hit ? hit.label : id;
    }
  };

  // === KONFIGURACIJA RESURSA (usklđeno s tvojom Prisma shemom) ===
  const RESOURCES = {
    users: {
      title: 'Korisnici',
      idField: 'id',
      columns: [
        { key: 'id', label: 'ID', type: 'hidden' },
        { key: 'email', label: 'Email', type: 'text', required: true },
        { key: 'fullName', label: 'Ime i prezime', type: 'text', required: true },
        { key: 'phone', label: 'Telefon', type: 'text' },
        { key: 'city', label: 'Grad', type: 'text' },
        { key: 'role', label: 'Uloga', type: 'select', values: ['USER', 'PROVIDER', 'ADMIN'] }
      ],
      defaultSort: ['createdAt', 'desc'],
    },

    categories: {
      title: 'Kategorije',
      idField: 'id',
      columns: [
        { key: 'id', label: 'ID', type: 'hidden' },
        { key: 'name', label: 'Naziv', type: 'text', required: true }
      ],
      defaultSort: ['name', 'asc'],
    },

    providers: {
      title: 'Pružatelji usluga',
      idField: 'id',
      columns: [
        { key: 'id', label: 'ID', type: 'hidden' },
        {
          key: 'userId', label: 'Korisnik', type: 'select',
          source: { resource: 'users', value: 'id', label: 'fullName', fallback: 'email' }
        },
        { key: 'bio', label: 'Bio', type: 'textarea' },
        { key: 'serviceArea', label: 'Područje', type: 'text' },
        { key: 'ratingAvg', label: 'Prosjek', type: 'number', readOnly: true },
        { key: 'ratingCount', label: 'Broj ocjena', type: 'number', readOnly: true },
        // categories (m:n) – ostavljamo izvan CRUD forme radi jednostavnosti
      ],
      defaultSort: ['id', 'desc'],
    },

    jobs: {
      title: 'Poslovi',
      idField: 'id',
      columns: [
        { key: 'id', label: 'ID', type: 'hidden' },
        { key: 'title', label: 'Naziv', type: 'text', required: true },
        { key: 'description', label: 'Opis', type: 'textarea' },
        { key: 'budgetMin', label: 'Budžet od', type: 'number' },
        { key: 'budgetMax', label: 'Budžet do', type: 'number' },
        { key: 'city', label: 'Grad', type: 'text' },
        { key: 'status', label: 'Status', type: 'select',
          values: ['OPEN','IN_PROGRESS','COMPLETED','CANCELLED'] },
        {
          key: 'userId', label: 'Naručitelj', type: 'select',
          source: { resource: 'users', value: 'id', label: 'fullName', fallback: 'email' }
        },
        {
          key: 'categoryId', label: 'Kategorija', type: 'select',
          source: { resource: 'categories', value: 'id', label: 'name' }
        },
      ],
      defaultSort: ['createdAt', 'desc'],
    },

    offers: {
      title: 'Ponude',
      idField: 'id',
      columns: [
        { key: 'id', label: 'ID', type: 'hidden' },
        { key: 'amount', label: 'Iznos', type: 'number', required: true },
        { key: 'message', label: 'Poruka', type: 'textarea' },
        { key: 'status', label: 'Status', type: 'select',
          values: ['PENDING','ACCEPTED','REJECTED'] },
        {
          key: 'jobId', label: 'Posao', type: 'select',
          source: { resource: 'jobs', value: 'id', label: 'title' }
        },
        {
          key: 'userId', label: 'Ponuditelj', type: 'select',
          source: { resource: 'users', value: 'id', label: 'fullName', fallback: 'email' }
        },
      ],
      defaultSort: ['createdAt', 'desc'],
    },

    reviews: {
      title: 'Recenzije',
      idField: 'id',
      columns: [
        { key: 'id', label: 'ID', type: 'hidden' },
        { key: 'rating', label: 'Ocjena', type: 'number', required: true },
        { key: 'comment', label: 'Komentar', type: 'textarea' },
        {
          key: 'fromUserId', label: 'Od', type: 'select',
          source: { resource: 'users', value: 'id', label: 'fullName', fallback: 'email' }
        },
        {
          key: 'toUserId', label: 'Za', type: 'select',
          source: { resource: 'users', value: 'id', label: 'fullName', fallback: 'email' }
        },
      ],
      defaultSort: ['createdAt', 'desc'],
    },
  };

  // === helperi ===
  const fetchJSON = async (url, opts = {}) => {
    const r = await fetch(url, {
      headers: { 'Content-Type': 'application/json' },
      credentials: 'omit',
      ...opts
    });
    if (!r.ok) throw new Error(`${r.status} ${r.statusText}`);
    return r.status === 204 ? null : r.json();
  };
  const toast = (msg, ok = true) => console[ok ? 'log' : 'error'](msg);

  const App = {
    inited: false,
    state: { resource: 'jobs', page: 1, pageSize: 10, total: 0, items: [], search: '', sort: null },

    mount(node) { this.root = node; this.renderShell(); this.bindEvents(); this.load(); },
    cfg() { return RESOURCES[this.state.resource]; },
    idField() { return this.cfg().idField || 'id'; },

    renderShell() {
      const resOptions = Object.entries(RESOURCES)
        .map(([k,c]) => `<option value="${k}">${c.title||k}</option>`).join('');
      this.root.innerHTML = `
        <div class="crud-toolbar">
          <strong>Resurs:</strong>
          <select id="crud-resource">${resOptions}</select>
          <input id="crud-search" placeholder="Pretraži…"/>
          <button id="crud-add">+ Dodaj</button>
          <span class="crud-badge" id="crud-count"></span>
          <span style="margin-left:auto"></span>
          <button id="crud-refresh">Osvježi</button>
        </div>
        <div class="table-wrap">
          <table class="crud-table">
            <thead id="crud-thead"></thead>
            <tbody id="crud-tbody"></tbody>
          </table>
        </div>
        <div class="crud-toolbar" style="justify-content:flex-end">
          <button id="crud-prev">«</button>
          <span id="crud-page" class="crud-badge">1</span>
          <button id="crud-next">»</button>
        </div>
        <div class="dialog" id="crud-dialog">
          <div class="card">
            <h3 id="dlg-title" style="margin-top:0">Uredi</h3>
            <form id="crud-form">
              <div class="grid" id="crud-form-grid"></div>
              <div class="actions">
                <button type="button" id="dlg-cancel">Odustani</button>
                <button type="submit" id="dlg-save">Spremi</button>
              </div>
            </form>
          </div>
        </div>`;
      this.root.querySelector('#crud-resource').value = this.state.resource;
      this.renderHead();
    },

    bindEvents() {
      const q = s => this.root.querySelector(s);
      q('#crud-resource').addEventListener('change', e => {
        this.state.resource = e.target.value; this.state.page = 1; this.state.search = '';
        q('#crud-search').value = ''; this.renderHead(); this.load();
      });
      q('#crud-search').addEventListener('input', e => {
        this.state.search = e.target.value.trim(); this.state.page = 1; this.load();
      });
      q('#crud-add').addEventListener('click', () => this.openDialog());
      q('#crud-refresh').addEventListener('click', () => this.load());
      q('#crud-prev').addEventListener('click', () => { if (this.state.page>1) { this.state.page--; this.load(); }});
      q('#crud-next').addEventListener('click', () => {
        const maxPage = Math.max(1, Math.ceil(this.state.total / this.state.pageSize));
        if (this.state.page < maxPage) { this.state.page++; this.load(); }
      });
      q('#dlg-cancel').addEventListener('click', () => this.closeDialog());
      q('#crud-form').addEventListener('submit', (e) => this.submitForm(e));
      q('#crud-thead').addEventListener('click', (e) => {
        if (e.target.matches('th[data-key]')) {
          const key = e.target.getAttribute('data-key');
          const current = this.state.sort || (this.cfg().defaultSort || [key,'asc']);
          const dir = (current[0]===key && current[1]==='asc') ? 'desc' : 'asc';
          this.state.sort = [key, dir]; this.load();
        }
      });
      q('#crud-tbody').addEventListener('click', (e) => {
        const tr = e.target.closest('tr[data-id]'); if (!tr) return;
        const id = tr.getAttribute('data-id');
        if (e.target.matches('.btn-edit')) {
          const item = this.state.items.find(x => String(x[this.idField()]) === id);
          this.openDialog(item);
        } else if (e.target.matches('.btn-del')) {
          this.remove(id);
        }
      });
    },

    renderHead() {
      const cfg = this.cfg();
      const cols = cfg.columns.filter(c => c.type !== 'hidden');
      const sort = this.state.sort || cfg.defaultSort;
      this.root.querySelector('#crud-thead').innerHTML = `<tr>
        ${cols.map(c=>{
          const s = (sort && sort[0]===c.key) ? (sort[1]==='asc'?'▲':'▼') : '';
          return `<th data-key="${c.key}">${c.label||c.key} ${s}</th>`;
        }).join('')}
        <th style="width:120px">Akcije</th>
      </tr>`;
    },

    async load() {
      const { resource, page, pageSize, search, sort } = this.state;
      const params = new URLSearchParams({ page, limit: pageSize });
      if (search) params.set('q', search);
      if (sort) params.set('sort', `${sort[0]}:${sort[1]}`);

      try {
        const data = await fetchJSON(`${API_BASE}/${resource}?${params.toString()}`);
        const items = Array.isArray(data) ? data : (data.items || data.results || []);
        const total = Array.isArray(data) ? items.length : (data.total ?? items.length);
        this.state.items = items; this.state.total = total;
        await this.renderRows(); // čekaj jer resolveri labela su async
      } catch (e) {
        toast(`Greška pri učitavanju: ${e.message}`, false);
      }
    },

    async renderRows() {
      const cfg = this.cfg();
      const cols = cfg.columns.filter(c => c.type !== 'hidden');
      const idField = this.idField();
      const tbody = this.root.querySelector('#crud-tbody');
      const count = this.root.querySelector('#crud-count');
      const pageBadge = this.root.querySelector('#crud-page');

      // pripremi sve opcije koje trebaju (paralelno)
      await Promise.all(cols.filter(c => c.source).map(c => OptionCache.get(c.source)));

      const html = await Promise.all(this.state.items.map(async (item) => {
        const tds = await Promise.all(cols.map(async (c) => {
          let raw = item[c.key];
          // ako je foreign key – prikaži labelu
          if (c.source && raw != null) {
            raw = await OptionCache.labelFor(c.source, raw);
          }
          return `<td>${this.formatCell(raw)}</td>`;
        }));
        return `<tr data-id="${item[idField]}">${tds.join('')}
          <td><button class="btn-edit">Uredi</button> <button class="btn-del">Obriši</button></td>
        </tr>`;
      }));

      tbody.innerHTML = html.join('') || `<tr><td colspan="${cols.length+1}" style="text-align:center;color:#666">Nema podataka</td></tr>`;
      count.textContent = `Ukupno: ${this.state.total}`;
      pageBadge.textContent = `${this.state.page}`;
    },

    formatCell(v) {
      if (v == null) return '';
      if (typeof v === 'boolean') return v ? '✓' : '✗';
      if (typeof v === 'object') return `<code class="crud-badge">${JSON.stringify(v)}</code>`;
      return String(v);
    },

    async openDialog(item = null) {
      const cfg = this.cfg();
      const grid = this.root.querySelector('#crud-form-grid');
      const dialog = this.root.querySelector('#crud-dialog');
      const title = this.root.querySelector('#dlg-title');
      title.textContent = item ? 'Uredi zapis' : 'Novi zapis';

      // pobrini se da su opcije za select napunjene
      await Promise.all(cfg.columns.filter(c => c.source).map(c => OptionCache.get(c.source)));

      grid.innerHTML = await (async () => {
        const parts = await Promise.all(cfg.columns.map(async (c) => {
          const val = item ? (item[c.key] ?? '') : (c.default ?? '');
          const req = c.required ? 'required' : '';
          const ro  = c.readOnly ? 'readonly' : '';
          const hidden = c.type === 'hidden' ? 'style="display:none"' : '';

          if (c.type === 'select') {
            const opts = (await OptionCache.get(c.source)) || (c.values || []).map(v => ({value:v,label:v}));
            const htmlOpts = (opts.length ? opts : (c.values||[]).map(v=>({value:v,label:v})))
              .map(o => `<option value="${o.value}" ${String(val)===String(o.value)?'selected':''}>${o.label}</option>`).join('');
            return `<div ${hidden}><label>${c.label||c.key}</label><select name="${c.key}" ${req}>${htmlOpts}</select></div>`;
          }

          const inputTag = c.type === 'textarea'
            ? `<textarea name="${c.key}" ${req} ${ro}>${val??''}</textarea>`
            : `<input type="${c.type||'text'}" name="${c.key}" value="${val??''}" ${req} ${ro}/>`;
          return `<div ${hidden}><label>${c.label||c.key}</label>${inputTag}</div>`;
        }));
        return parts.join('');
      })();

      dialog.style.display = 'flex';
      this.editingId = item ? item[this.idField()] : null;
    },

    closeDialog() { this.root.querySelector('#crud-dialog').style.display = 'none'; this.editingId = null; },

    async submitForm(e) {
      e.preventDefault();
      const fd = new FormData(e.target);
      const body = {};
      for (const [k, v] of fd.entries()) {
        const col = this.cfg().columns.find(c => c.key===k);
        if (col?.readOnly) continue; // ne šalji readonly polja
        if (col && col.type === 'number' && v !== '') body[k] = Number(v);
        else body[k] = v === '' ? null : v;
      }

      const res = this.state.resource;
      const id = this.editingId;
      try {
        if (id == null) {
          await fetchJSON(`${API_BASE}/${res}`, { method: 'POST', body: JSON.stringify(body) });
          toast('Dodano');
        } else {
          await fetchJSON(`${API_BASE}/${res}/${encodeURIComponent(id)}`, { method: 'PUT', body: JSON.stringify(body) });
          toast('Ažurirano');
        }
        this.closeDialog(); this.load();
      } catch (e) { toast(`Greška pri spremanju: ${e.message}`, false); }
    },

    async remove(id) {
      if (!confirm('Obriši zapis?')) return;
      const res = this.state.resource;
      try { await fetchJSON(`${API_BASE}/${res}/${encodeURIComponent(id)}`, { method: 'DELETE' }); toast('Obrisano'); this.load(); }
      catch (e) { toast(`Greška pri brisanju: ${e.message}`, false); }
    },

    init() { if (this.inited) return; this.inited = true; this.mount(document.getElementById('crud-app')); }
  };

  window.CrudApp = App;
})();
