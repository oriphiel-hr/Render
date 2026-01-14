/* src/admin/ModelPage.jsx */
import React, { useEffect, useMemo, useState } from 'react'
import api from '@/api'

// JSON primjeri za svaki model
const MODEL_EXAMPLES = {
  User: {
    email: "korisnik@example.com",
    passwordHash: "$2a$10$...(generiraj bcrypt hash)",
    fullName: "Ime Prezime",
    role: "USER",
    phone: "+385 91 234 5678",
    city: "Zagreb",
    latitude: 45.8150,
    longitude: 15.9819,
    isVerified: false,
    legalStatusId: "cls4_doo (za firme koje traže usluge)",
    taxId: "98765432109",
    companyName: "Firma d.o.o."
  },
  ProviderProfile: {
    userId: "cm...(User ID)",
    bio: "Profesionalni opis",
    specialties: ["Specijalizacija 1", "Specijalizacija 2"],
    experience: 5,
    website: "https://example.com",
    isAvailable: true,
    legalStatusId: "cls2_sole_trader (LegalStatus ID)",
    taxId: "12345678901",
    companyName: "Vodoinstalater Marić obrt"
  },
  Category: {
    name: "Naziv kategorije",
    description: "Opis kategorije",
    parentId: null,
    isActive: true
  },
  Job: {
    title: "Naziv posla",
    description: "Detaljan opis posla",
    budgetMin: 200,
    budgetMax: 500,
    city: "Zagreb",
    latitude: 45.8150,
    longitude: 15.9819,
    status: "OPEN",
    urgency: "NORMAL",
    jobSize: "MEDIUM",
    deadline: "2025-12-31T23:59:59.000Z",
    images: [],
    userId: "cm...(User ID)",
    categoryId: "cm...(Category ID)"
  },
  Offer: {
    amount: 350,
    message: "Poruka uz ponudu",
    status: "PENDING",
    isNegotiable: true,
    estimatedDays: 3,
    jobId: "cm...(Job ID)",
    userId: "cm...(Provider User ID)"
  },
  Review: {
    rating: 5,
    comment: "Odličan servis!",
    fromUserId: "cm...(User ID)",
    toUserId: "cm...(Provider User ID)"
  },
  Notification: {
    title: "Naslov notifikacije",
    message: "Sadržaj notifikacije",
    type: "SYSTEM",
    isRead: false,
    userId: "cm...(User ID)",
    jobId: null,
    offerId: null
  },
  ChatRoom: {
    name: "Naziv chat sobe",
    jobId: "cm...(Job ID - opcionalno)"
  },
  ChatMessage: {
    content: "Sadržaj poruke",
    senderId: "cm...(User ID)",
    roomId: "cm...(ChatRoom ID)"
  },
  Subscription: {
    userId: "cm...(User ID)",
    plan: "BASIC",
    status: "ACTIVE",
    credits: 10,
    expiresAt: "2026-01-01T00:00:00.000Z"
  },
  SubscriptionPlan: {
    name: "BASIC",
    displayName: "Basic Plan",
    price: 39,
    currency: "EUR",
    credits: 10,
    features: ["Feature 1", "Feature 2"],
    isPopular: false,
    displayOrder: 1,
    isActive: true,
    description: "Basic plan description",
    savings: "Save 10€"
  },
  LegalStatus: {
    code: "SOLE_TRADER",
    name: "Obrtnik",
    description: "Registrirani obrt - fizička osoba s OIB-om",
    isActive: true
  }
}

// WHERE primjeri za filtriranje
const WHERE_EXAMPLES = {
  User: { role: "PROVIDER", city: "Zagreb" },
  ProviderProfile: { isAvailable: true },
  Category: { isActive: true },
  Job: { status: "OPEN", urgency: "HIGH" },
  Offer: { status: "PENDING" },
  Review: { rating: { gte: 4 } },
  Notification: { isRead: false, type: "NEW_JOB" },
  ChatRoom: { jobId: { not: null } },
  ChatMessage: { senderId: "cm...(User ID)" },
  Subscription: { status: "ACTIVE", plan: "PREMIUM" },
  SubscriptionPlan: { isActive: true, isPopular: true },
  LegalStatus: { isActive: true }
}

// INCLUDE primjeri za relacije
const INCLUDE_EXAMPLES = {
  User: { providerProfile: true, jobs: true, legalStatus: true }, // phoneVerificationAttempts je automatski uključen
  ProviderProfile: { user: true, categories: true, legalStatus: true },
  Category: { parent: true, children: true, providers: true },
  Job: { user: true, category: true, offers: true },
  Offer: { user: true, job: true },
  Review: { from: true, to: true },
  Notification: { user: true },
  ChatRoom: { participants: true, messages: true, job: true },
  ChatMessage: { sender: true, room: true },
  Subscription: {},
  SubscriptionPlan: {},
  LegalStatus: { users: true, providers: true }
}

function Textarea({label, value, onChange, placeholder}){
  return (
    <label className="block">
      <div className="text-sm text-gray-600 mb-1">{label}</div>
      <textarea
        value={value}
        onChange={e=>onChange(e.target.value)}
        placeholder={placeholder}
        rows={6}
        className="w-full border rounded p-2 font-mono text-sm"
      />
    </label>
  )
}

// Helper function to render cell value with links
function renderCellValue(value, colName) {
  const isObject = typeof value === 'object' && value !== null
  const isLong = typeof value === 'string' && value.length > 50
  
  if (isObject) {
    // Check if it's a user object
    if (colName === 'user' && value.id && (value.email || value.fullName)) {
      return (
        <a 
          href={`#admin-User?id=${value.id}`}
          className="text-blue-600 hover:text-blue-800 hover:underline"
        >
          👤 {value.fullName || value.email || value.id}
        </a>
      )
    }
    
    // Check if it's a job object
    if (colName === 'job' && value.id && value.title) {
      return (
        <a 
          href={`#admin-Job?id=${value.id}`}
          className="text-green-600 hover:text-green-800 hover:underline"
        >
          📋 {value.title}
        </a>
      )
    }
    
    // Check if it's an offer object
    if (colName === 'offer' && value.id) {
      return (
        <a 
          href={`#admin-Offer?id=${value.id}`}
          className="text-purple-600 hover:text-purple-800 hover:underline"
        >
          💰 Offer {value.id.slice(-8)}
        </a>
      )
    }
    
    // Check if it's category
    if (colName === 'category' && value.id && value.name) {
      return (
        <a 
          href={`#admin-Category?id=${value.id}`}
          className="text-indigo-600 hover:text-indigo-800 hover:underline"
        >
          📂 {value.name}
        </a>
      )
    }
    
    // For other objects, just show JSON
    return JSON.stringify(value)
  }
  
  return String(value)
}

export default function ModelPage({ model }){
  const [items, setItems] = useState([])
  const [total, setTotal] = useState(0)
  const [skip, setSkip] = useState(0)
  const [take, setTake] = useState(25)
  const [where, setWhere] = useState('')
  const [include, setInclude] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [editItem, setEditItem] = useState(null) // null=zatvoreno, {}=create, obj=edit
  const [rawJson, setRawJson] = useState('{}')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function load(){
    setLoading(true); setError('')
    try{
      const params = { skip, take }
      if(where) params.where = where
      if(include) params.include = include
      const { data } = await api.get(`/admin/${model}`, { params })
      setItems(data.items || [])
      setTotal(data.total || 0)
    }catch(e){
      setError(e?.response?.data?.error || e?.message || String(e))
    }finally{
      setLoading(false)
    }
  }
  useEffect(() => { 
    // Reset WHERE i INCLUDE kad se promijeni model
    setWhere('')
    setInclude('')
    setSkip(0)
    load() 
  }, [model])
  
  // Reload kad se promijeni skip ili take
  useEffect(() => { 
    load() 
  }, [skip, take])

  // Filter items by search term
  const filteredItems = useMemo(() => {
    if (!searchTerm) return items;
    
    const searchLower = searchTerm.toLowerCase();
    return items.filter(item => {
      return Object.values(item).some(value => {
        if (value === null || value === undefined) return false;
        const strValue = typeof value === 'object' ? JSON.stringify(value) : String(value);
        return strValue.toLowerCase().includes(searchLower);
      });
    });
  }, [items, searchTerm]);

  // Generiraj kolone čak i kad nema podataka (iz prve stavke ili default polja)
  const cols = useMemo(() => {
    if(items.length === 0) {
      // Ako nema podataka, vrati default kolone za model
      const defaults = MODEL_EXAMPLES[model] || {}
      return Object.keys(defaults).length > 0 ? Object.keys(defaults) : ['id']
    }
    const set = new Set()
    items.forEach(it => Object.keys(it).forEach(k => set.add(k)))
    return Array.from(set)
  }, [items, model])
  
  const totalPages = Math.ceil(total / take)
  const currentPage = Math.floor(skip / take) + 1

  // Export functions
  const exportToCSV = () => {
    const headers = cols.join(',');
    const rows = filteredItems.map(item => 
      cols.map(col => {
        const val = item[col];
        if (val === null || val === undefined) return '';
        if (typeof val === 'object') return JSON.stringify(val);
        return String(val).replace(/"/g, '""');
      }).join(',')
    );
    const csv = [headers, ...rows].join('\n');
    
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${model}_export_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  const exportToJSON = () => {
    const data = JSON.stringify(filteredItems, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${model}_export_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
  };

  function openCreate(){
    const example = MODEL_EXAMPLES[model] || {}
    setEditItem({})
    setRawJson(JSON.stringify(example, null, 2))
  }
  function openEdit(it){
    setEditItem(it)
    setRawJson(JSON.stringify(it, null, 2))
  }
  function loadExample(){
    const example = MODEL_EXAMPLES[model] || {}
    setRawJson(JSON.stringify(example, null, 2))
  }
  function loadWhereExample(){
    const example = WHERE_EXAMPLES[model] || {}
    setWhere(JSON.stringify(example, null, 2))
  }
  function loadIncludeExample(){
    const example = INCLUDE_EXAMPLES[model] || {}
    setInclude(JSON.stringify(example, null, 2))
  }
  async function save(){
    setLoading(true); setError('')
    try{
      const body = JSON.parse(rawJson)
      if(editItem?.id){
        await api.put(`/admin/${model}/${encodeURIComponent(editItem.id)}`, body)
      }else{
        await api.post(`/admin/${model}`, body)
      }
      setEditItem(null); await load()
    }catch(e){
      setError(e?.response?.data?.error || e?.message || String(e))
    }finally{ setLoading(false) }
  }
  async function remove(id){
    if(!confirm('Obrisati zapis?')) return
    setLoading(true); setError('')
    try{
      await api.delete(`/admin/${model}/${encodeURIComponent(id)}`)
      await load()
    }catch(e){
      setError(e?.response?.data?.error || e?.message || String(e))
    }finally{ setLoading(false) }
  }

  async function resetSmsAttempts(userId, userEmail){
    if(!confirm(`Resetirati SMS pokušaje za korisnika ${userEmail || userId}?`)) return
    setLoading(true); setError('')
    try{
      const response = await api.post(`/admin/users/${encodeURIComponent(userId)}/reset-sms-attempts`)
      alert(`✅ ${response.data.message}`)
      await load() // Reload da vidimo ažurirane podatke
    }catch(e){
      setError(e?.response?.data?.error || e?.message || String(e))
      alert(`❌ Greška: ${e?.response?.data?.error || e?.message || String(e)}`)
    }finally{ setLoading(false) }
  }

  return (
    <div className="space-y-4">
      {/* Header sa brojem zapisa */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">{model}</h2>
          <p className="text-sm text-gray-600 mt-1">
            Ukupno <span className="font-semibold text-gray-900">{total}</span> zapisa
            {searchTerm && (
              <span className="ml-2">
                | Filtrirano: <span className="font-semibold text-blue-700">{filteredItems.length}</span>
              </span>
            )}
            {total > 0 && (
              <span className="ml-2">
                | Prikazujem {skip + 1}-{Math.min(skip + take, total)} od {total}
              </span>
            )}
          </p>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={exportToCSV}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
          >
            📄 CSV
          </button>
          <button 
            onClick={exportToJSON}
            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 font-medium"
          >
            📄 JSON
          </button>
          <button onClick={openCreate} className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 font-medium">
            + Kreiraj novi
          </button>
        </div>
      </div>

      {/* Controls */}
      <div className="flex flex-wrap items-end gap-3 mb-4">
        <label className="block flex-1 min-w-64">
          <div className="text-sm font-medium text-gray-700 mb-1">Pretraga</div>
          <input
            type="text"
            placeholder="Traži u svim poljima..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full border rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500"
          />
        </label>
        <label className="block">
          <div className="text-sm font-medium text-gray-700 mb-1">Zapisa po stranici</div>
          <select 
            value={take} 
            onChange={e=>setTake(Number(e.target.value))} 
            className="border rounded-lg p-2 w-32 bg-white"
          >
            <option value={10}>10</option>
            <option value={25}>25</option>
            <option value={50}>50</option>
            <option value={100}>100</option>
          </select>
        </label>
        <button onClick={load} className="px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800">
          🔄 Reload
        </button>
      </div>

      {/* Stats */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div>
              <div className="text-sm text-gray-600">
                {searchTerm ? 'Filtrirano' : 'Prikazano'}
              </div>
              <div className="text-2xl font-bold text-blue-700">
                {searchTerm ? `${filteredItems.length} / ${items.length}` : items.length}
              </div>
            </div>
            <div>
              <div className="text-sm text-gray-600">Ukupno</div>
              <div className="text-2xl font-bold text-gray-700">{total}</div>
            </div>
          </div>
          <div className="flex gap-2">
            <button 
              onClick={exportToCSV}
              className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700"
            >
              📄 Export CSV
            </button>
            <button 
              onClick={exportToJSON}
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
            >
              📄 Export JSON
            </button>
          </div>
        </div>
      </div>

      <details className="border rounded p-3 bg-gray-50">
        <summary className="cursor-pointer font-medium">
          Napredna pretraga (where/include JSON) 
          <span className="ml-2 px-2 py-0.5 bg-indigo-100 text-indigo-800 text-xs rounded font-semibold">
            Model: {model}
          </span>
        </summary>
        
        {/* Info box */}
        <div className="bg-blue-50 border border-blue-200 rounded p-3 mt-3 mb-3">
          <p className="text-sm text-blue-900">
            <strong>💡 Savjet:</strong> Koristi <strong>where</strong> za filtriranje zapisa i <strong>include</strong> za učitavanje povezanih relacija.
            Primjeri su specifični za <strong>{model}</strong> model.
          </p>
          <div className="mt-2 flex gap-2">
            <button 
              onClick={loadWhereExample}
              className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
            >
              📋 Where primjer za {model}
            </button>
            <button 
              onClick={loadIncludeExample}
              className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
            >
              📋 Include primjer za {model}
            </button>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-3">
          <div>
            <Textarea
              label="where (JSON) - Filtriranje"
              value={where}
              onChange={setWhere}
              placeholder='{"email":{"contains":"@gmail.com"}}'
            />
            <div className="text-xs text-gray-500 mt-1">
              Primjer: {"{"}"status":"OPEN", "city":"Zagreb"{"}"}
            </div>
          </div>
          <div>
            <Textarea
              label="include (JSON) - Relacije"
              value={include}
              onChange={setInclude}
              placeholder='{"offers":true}'
            />
            <div className="text-xs text-gray-500 mt-1">
              Primjer: {"{"}"user":true, "category":true{"}"}
            </div>
          </div>
        </div>
        <div className="mt-3 flex gap-2">
          <button onClick={load} className="px-3 py-2 bg-gray-900 text-white rounded hover:bg-gray-800">
            🔍 Primijeni pretragu
          </button>
          <button 
            onClick={() => {setWhere(''); setInclude(''); load()}} 
            className="px-3 py-2 border rounded hover:bg-gray-100"
          >
            🔄 Resetuj filtere
          </button>
        </div>
      </details>

      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-red-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Greška</h3>
              <div className="mt-2 text-sm text-red-700 whitespace-pre-wrap font-mono">
                {error}
              </div>
              {error.includes('Unknown argument') && (
                <div className="mt-2 text-sm text-red-600">
                  <strong>💡 Tip:</strong> Provjerite da koristite WHERE/INCLUDE primjer za <strong>{model}</strong> model.
                  Kliknite "Where primjer" ili "Include primjer" za točan template.
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <div className="overflow-x-auto border rounded">
        <table className="border-collapse" style={{ minWidth: '100%', width: 'max-content' }}>
          <thead className="bg-gray-100 sticky top-0">
            <tr>
              {cols.map(c => (
                <th key={c} className="text-left p-3 border-b font-semibold text-gray-700 whitespace-nowrap min-w-32">
                  {c}
                </th>
              ))}
              <th className="text-left p-3 border-b font-semibold text-gray-700 whitespace-nowrap sticky right-0 bg-gray-100 min-w-32">
                Akcije
              </th>
            </tr>
          </thead>
          <tbody>
            {filteredItems.length === 0 ? (
              <tr>
                <td colSpan={cols.length + 1} className="p-8 text-center">
                  <div className="flex flex-col items-center justify-center text-gray-500">
                    {searchTerm ? (
                      <>
                        <svg className="w-16 h-16 mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                        <p className="text-lg font-medium mb-2">Nema rezultata</p>
                        <p className="text-sm mb-4">Nema zapisa koji odgovaraju pretrazi "{searchTerm}"</p>
                        <button 
                          onClick={() => setSearchTerm('')}
                          className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
                        >
                          Očisti pretragu
                        </button>
                      </>
                    ) : (
                      <>
                        <svg className="w-16 h-16 mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                        </svg>
                        <p className="text-lg font-medium mb-2">Nema zapisa</p>
                        <p className="text-sm mb-4">Još nema podataka za model {model}</p>
                        <button 
                          onClick={openCreate}
                          className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700"
                        >
                          + Kreiraj prvi zapis
                        </button>
                      </>
                    )}
                  </div>
                </td>
              </tr>
            ) : (
              filteredItems.map(it => (
                <tr key={it.id} className="odd:bg-white even:bg-gray-50 hover:bg-blue-50">
                  {cols.map(c => {
                    const value = it[c]
                    const isLong = typeof value === 'string' && value.length > 50
                    const isObject = typeof value === 'object' && value !== null
                    const displayValue = renderCellValue(value, c)
                    const isComplexObject = isObject && !(typeof displayValue === 'object')
                    
                    return (
                      <td 
                        key={c} 
                        className="p-3 align-top border-b whitespace-nowrap"
                        style={{ 
                          maxWidth: (isLong || (isObject && isComplexObject)) ? '400px' : 'none',
                          minWidth: '120px'
                        }}
                      >
                        <div className="group relative">
                          <div className={isLong || (isObject && isComplexObject) ? "truncate" : ""}>
                            {displayValue}
                          </div>
                          {(isLong || (isObject && isComplexObject)) && (
                            <div className="hidden group-hover:block absolute z-10 bg-gray-900 text-white text-xs rounded p-2 shadow-lg max-w-md break-all left-0 top-full mt-1">
                              {typeof displayValue === 'string' ? displayValue : JSON.stringify(value)}
                            </div>
                          )}
                        </div>
                      </td>
                    )
                  })}
                  <td className="p-3 border-b whitespace-nowrap sticky right-0 bg-white">
                    <div className="flex flex-wrap gap-1">
                      <button onClick={()=>openEdit(it)} className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700">
                        Edit
                      </button>
                      {model === 'User' && (it.phone || it.phoneVerificationAttempts > 0) && (
                        <button 
                          onClick={()=>resetSmsAttempts(it.id, it.email)} 
                          title={`Resetiraj SMS pokušaje (trenutno: ${it.phoneVerificationAttempts || 0}/5)`}
                          className="px-3 py-1 bg-orange-600 text-white text-sm rounded hover:bg-orange-700"
                        >
                          🔄 SMS
                        </button>
                      )}
                      <button 
                        onClick={()=>remove(it.id)} 
                        disabled={model === 'User' && it.role === 'ADMIN'}
                        title={model === 'User' && it.role === 'ADMIN' ? 'ADMIN korisnika nije moguće obrisati' : ''}
                        className={`px-3 py-1 text-white text-sm rounded ${model === 'User' && it.role === 'ADMIN' ? 'bg-rose-300 cursor-not-allowed' : 'bg-rose-600 hover:bg-rose-700'}`}
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {total > 0 && (
        <div className="flex items-center justify-between border-t pt-4">
          <div className="text-sm text-gray-700">
            Stranica <span className="font-semibold">{currentPage}</span> od <span className="font-semibold">{totalPages}</span>
          </div>
          
          <div className="flex items-center gap-2">
            <button
              onClick={() => setSkip(Math.max(0, skip - take))}
              disabled={skip === 0}
              className="px-4 py-2 border rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              ← Prethodna
            </button>
            
            {/* Page numbers */}
            <div className="flex gap-1">
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                let pageNum;
                if (totalPages <= 5) {
                  pageNum = i + 1;
                } else if (currentPage <= 3) {
                  pageNum = i + 1;
                } else if (currentPage >= totalPages - 2) {
                  pageNum = totalPages - 4 + i;
                } else {
                  pageNum = currentPage - 2 + i;
                }
                
                return (
                  <button
                    key={i}
                    onClick={() => setSkip((pageNum - 1) * take)}
                    className={`w-10 h-10 rounded-lg ${
                      pageNum === currentPage
                        ? 'bg-indigo-600 text-white font-semibold'
                        : 'border hover:bg-gray-50'
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              })}
            </div>

            <button
              onClick={() => setSkip(skip + take)}
              disabled={skip + take >= total}
              className="px-4 py-2 border rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Sljedeća →
            </button>
          </div>
          
          <div className="text-sm text-gray-600">
            Idi na stranicu:
            <input
              type="number"
              min={1}
              max={totalPages}
              value={currentPage}
              onChange={(e) => {
                const page = Math.max(1, Math.min(totalPages, Number(e.target.value) || 1))
                setSkip((page - 1) * take)
              }}
              className="ml-2 w-16 border rounded px-2 py-1 text-center"
            />
          </div>
        </div>
      )}

      {/* Modal */}
      {editItem !== null && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50">
          <div className="bg-white w-full max-w-4xl rounded shadow-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-lg font-semibold">{editItem?.id ? 'Uredi' : 'Kreiraj'} {model}</h3>
              <button onClick={()=>setEditItem(null)} className="px-2 py-1">✕</button>
            </div>
            
            {/* Info box */}
            <div className="bg-blue-50 border border-blue-200 rounded p-3 mb-3">
              <p className="text-sm text-blue-900">
                <strong>💡 Savjet:</strong> {editItem?.id 
                  ? 'Za update možeš poslati samo polja koja mijenjaš. Primjer: {"fullName":"Novo Ime"}'
                  : 'Popuni JSON sa svim potrebnim poljima. Klikni "Učitaj primjer" za template.'
                }
              </p>
              {!editItem?.id && (
                <button 
                  onClick={loadExample}
                  className="mt-2 px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
                >
                  📋 Učitaj primjer za {model}
                </button>
              )}
            </div>

            <textarea
              value={rawJson}
              onChange={e=>setRawJson(e.target.value)}
              className="w-full border rounded p-2 font-mono text-sm"
              rows={18}
              placeholder="Unesi JSON..."
            />
            
            <div className="mt-3 flex justify-between items-center">
              <div className="text-xs text-gray-500">
                Format: JSON | Provjeri sintaksu prije spremanja
              </div>
              <div className="flex gap-2">
                <button onClick={()=>setEditItem(null)} className="px-3 py-2 border rounded hover:bg-gray-50">Odustani</button>
                <button onClick={save} className="px-3 py-2 bg-emerald-600 text-white rounded hover:bg-emerald-700" disabled={loading}>
                  {loading ? 'Spremam...' : 'Spremi'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
