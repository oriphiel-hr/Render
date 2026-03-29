import React, { useEffect, useMemo, useState } from 'react';
import api from '@/api';
import { CircleMarker, MapContainer, Popup, TileLayer } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png'
});

const CROATIA_CENTER = [45.815399, 15.966568];
const FILTERS_STORAGE_KEY = 'uslugar_admin_category_coverage_filters_v1';

function normalizeCity(city) {
  return String(city || '').trim();
}

function geocodeCity(city) {
  if (!city) return Promise.resolve(null);
  return fetch(
    `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(`${city}, Hrvatska`)}&limit=1`
  )
    .then((r) => r.json())
    .then((data) => (data?.[0] ? [parseFloat(data[0].lat), parseFloat(data[0].lon)] : null))
    .catch(() => null);
}

function markerColorByCount(count) {
  if (count >= 8) return '#b91c1c';
  if (count >= 5) return '#ea580c';
  if (count >= 3) return '#d97706';
  if (count >= 2) return '#2563eb';
  return '#0f766e';
}

function markerRadiusByCount(count) {
  return Math.max(8, Math.min(22, 6 + count * 2));
}

function rowPriorityClass(priorityScore) {
  if (priorityScore >= 12) return 'bg-red-50';
  if (priorityScore >= 7) return 'bg-amber-50';
  if (priorityScore >= 3) return 'bg-blue-50';
  return '';
}

function rowPriorityLabel(priorityScore) {
  if (priorityScore >= 12) return 'HIGH';
  if (priorityScore >= 7) return 'MEDIUM';
  if (priorityScore >= 3) return 'LOW';
  return 'MIN';
}

export default function CategoryCoveragePanel() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [selectedCategoryId, setSelectedCategoryId] = useState('ALL');
  const [cityCoords, setCityCoords] = useState({});
  const [minGap, setMinGap] = useState(1);
  const [highMediumOnly, setHighMediumOnly] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(FILTERS_STORAGE_KEY);
      if (!raw) return;
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed === 'object') {
        if (typeof parsed.selectedCategoryId === 'string') setSelectedCategoryId(parsed.selectedCategoryId);
        if (typeof parsed.minGap === 'number' && Number.isFinite(parsed.minGap)) {
          setMinGap(Math.max(0, Math.floor(parsed.minGap)));
        }
        if (typeof parsed.highMediumOnly === 'boolean') setHighMediumOnly(parsed.highMediumOnly);
      }
    } catch {
      // ignore invalid storage payload
    }
  }, []);

  useEffect(() => {
    let cancelled = false;
    async function loadCoverage() {
      setLoading(true);
      setError('');
      try {
        const include = {
          providers: {
            include: {
              user: { select: { id: true, city: true, latitude: true, longitude: true } }
            }
          },
          jobs: { select: { id: true, status: true } }
        };
        const { data } = await api.get('/admin/Category', {
          params: { skip: 0, take: 500, include: JSON.stringify(include) }
        });
        if (!cancelled) setCategories(data?.items || []);
      } catch (e) {
        if (!cancelled) setError(e?.response?.data?.error || e?.message || 'Greška pri učitavanju pokrivenosti');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    loadCoverage();
    return () => {
      cancelled = true;
    };
  }, []);

  const categoryRows = useMemo(() => {
    return (categories || []).map((cat) => {
      const providers = Array.isArray(cat.providers) ? cat.providers : [];
      const cities = new Set();
      providers.forEach((p) => {
        const city = normalizeCity(p?.user?.city);
        if (city) cities.add(city);
      });
      const openJobs = (cat.jobs || []).filter((j) => j.status === 'OPEN').length;
      return {
        id: cat.id,
        name: cat.name,
        isActive: cat.isActive !== false,
        providersCount: providers.length,
        citiesCount: cities.size,
        openJobs,
        gap: Math.max(0, openJobs - providers.length),
        priorityScore: openJobs * 2 + Math.max(0, openJobs - providers.length),
        providers
      };
    });
  }, [categories]);

  const selectedRows = useMemo(() => {
    if (selectedCategoryId === 'ALL') return categoryRows;
    return categoryRows.filter((r) => r.id === selectedCategoryId);
  }, [categoryRows, selectedCategoryId]);

  useEffect(() => {
    if (selectedCategoryId === 'ALL') return;
    const exists = categoryRows.some((r) => r.id === selectedCategoryId);
    if (!exists) setSelectedCategoryId('ALL');
  }, [categoryRows, selectedCategoryId]);

  useEffect(() => {
    try {
      localStorage.setItem(
        FILTERS_STORAGE_KEY,
        JSON.stringify({ selectedCategoryId, minGap, highMediumOnly })
      );
    } catch {
      // ignore storage write errors
    }
  }, [selectedCategoryId, minGap, highMediumOnly]);

  const selectedRowsByPriority = useMemo(() => {
    if (!highMediumOnly) return selectedRows;
    return selectedRows.filter((r) => r.priorityScore >= 7);
  }, [selectedRows, highMediumOnly]);

  const cityAggregates = useMemo(() => {
    const byCity = new Map();
    selectedRowsByPriority.forEach((cat) => {
      cat.providers.forEach((p) => {
        const city = normalizeCity(p?.user?.city);
        if (!city) return;
        if (!byCity.has(city)) {
          byCity.set(city, {
            city,
            providersCount: 0,
            categories: new Set(),
            latitude: null,
            longitude: null
          });
        }
        const row = byCity.get(city);
        row.providersCount += 1;
        row.categories.add(cat.name);
        if (p?.user?.latitude != null && p?.user?.longitude != null) {
          row.latitude = p.user.latitude;
          row.longitude = p.user.longitude;
        }
      });
    });
    return Array.from(byCity.values())
      .map((r) => ({
        ...r,
        categories: Array.from(r.categories).sort()
      }))
      .sort((a, b) => b.providersCount - a.providersCount);
  }, [selectedRowsByPriority]);

  useEffect(() => {
    let cancelled = false;
    const unresolved = cityAggregates.filter((c) => (c.latitude == null || c.longitude == null) && !cityCoords[c.city]);
    if (unresolved.length === 0) return;

    async function resolveCities() {
      const next = {};
      for (const c of unresolved) {
        const coords = await geocodeCity(c.city);
        if (coords) next[c.city] = coords;
      }
      if (!cancelled && Object.keys(next).length > 0) {
        setCityCoords((prev) => ({ ...prev, ...next }));
      }
    }
    resolveCities();
    return () => {
      cancelled = true;
    };
  }, [cityAggregates, cityCoords]);

  const mapPoints = useMemo(() => {
    return cityAggregates
      .map((c) => {
        if (c.latitude != null && c.longitude != null) {
          return { ...c, position: [c.latitude, c.longitude] };
        }
        if (cityCoords[c.city]) {
          return { ...c, position: cityCoords[c.city] };
        }
        return null;
      })
      .filter(Boolean);
  }, [cityAggregates, cityCoords]);

  const stats = useMemo(() => {
    const allProviders = categoryRows.reduce((sum, r) => sum + r.providersCount, 0);
    const categoriesWithProviders = categoryRows.filter((r) => r.providersCount > 0).length;
    const uncovered = categoryRows.filter((r) => r.providersCount === 0 && r.isActive).length;
    const citiesCovered = cityAggregates.length;
    return { allProviders, categoriesWithProviders, uncovered, citiesCovered };
  }, [categoryRows, cityAggregates]);

  const biggestGaps = useMemo(() => {
    return selectedRowsByPriority
      .filter((r) => r.openJobs > 0 && r.gap >= minGap)
      .sort((a, b) => b.priorityScore - a.priorityScore || b.gap - a.gap || b.openJobs - a.openJobs)
      .slice(0, 8);
  }, [selectedRowsByPriority, minGap]);

  const uncoveredCategories = useMemo(() => {
    return selectedRowsByPriority
      .filter((r) => r.isActive && r.providersCount === 0)
      .sort((a, b) => b.openJobs - a.openJobs || a.name.localeCompare(b.name))
      .slice(0, 12);
  }, [selectedRowsByPriority]);

  const ctaText = useMemo(() => {
    if (uncoveredCategories.length === 0) {
      return 'Trenutno su sve aktivne kategorije pokrivene pružateljima.';
    }
    const topByDemand = uncoveredCategories.filter((c) => c.openJobs > 0).slice(0, 5);
    const list = (topByDemand.length > 0 ? topByDemand : uncoveredCategories.slice(0, 5))
      .map((c) => c.name)
      .join(', ');
    return `Tražimo nove izvođače za kategorije: ${list}. Ako nudite ove usluge, prijavite se na Uslugar i povećajte vidljivost u svojoj regiji.`;
  }, [uncoveredCategories]);

  function exportGapCsv() {
    const rows = biggestGaps.map((g) => ({
      kategorija: g.name,
      otvoreni_poslovi: g.openJobs,
      pruzatelji: g.providersCount,
      gap: g.gap,
      priority_score: g.priorityScore
    }));
    const headers = ['kategorija', 'otvoreni_poslovi', 'pruzatelji', 'gap', 'priority_score'];
    const csv = [headers.join(','), ...rows.map((r) => headers.map((h) => r[h]).join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `category-gap-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  function exportUncoveredCsv() {
    const rows = uncoveredCategories.map((c) => ({
      kategorija: c.name,
      otvoreni_poslovi: c.openJobs,
      pruzatelji: c.providersCount,
      priority_score: c.priorityScore
    }));
    const headers = ['kategorija', 'otvoreni_poslovi', 'pruzatelji', 'priority_score'];
    const csv = [headers.join(','), ...rows.map((r) => headers.map((h) => r[h]).join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `category-uncovered-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  async function copyCta() {
    try {
      await navigator.clipboard.writeText(ctaText);
      window.alert('CTA tekst kopiran.');
    } catch {
      window.alert('Copy nije uspio. Ručno kopirajte tekst iz okvira.');
    }
  }

  function resetFilters() {
    setSelectedCategoryId('ALL');
    setMinGap(1);
    setHighMediumOnly(false);
    try {
      localStorage.removeItem(FILTERS_STORAGE_KEY);
    } catch {
      // ignore
    }
  }

  return (
    <div className="border rounded-lg p-4 bg-white space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Pokrivenost kategorija i lokacija</h3>
          <p className="text-sm text-gray-600">
            Gdje imate pružatelje i koje kategorije treba dodatno popuniti.
          </p>
        </div>
        <div className="min-w-64">
          <label className="text-sm font-medium text-gray-700">Filter kategorije</label>
          <select
            value={selectedCategoryId}
            onChange={(e) => setSelectedCategoryId(e.target.value)}
            className="mt-1 w-full border rounded px-3 py-2 bg-white"
          >
            <option value="ALL">Sve kategorije</option>
            {categoryRows
              .slice()
              .sort((a, b) => a.name.localeCompare(b.name))
              .map((r) => (
                <option key={r.id} value={r.id}>
                  {r.name}
                </option>
              ))}
          </select>
        </div>
        <div className="min-w-36">
          <label className="text-sm font-medium text-gray-700">Min gap</label>
          <input
            type="number"
            min={0}
            value={minGap}
            onChange={(e) => setMinGap(Math.max(0, Number(e.target.value) || 0))}
            className="mt-1 w-full border rounded px-3 py-2 bg-white"
          />
        </div>
        <label className="inline-flex items-center gap-2 text-sm font-medium text-gray-700 mt-6">
          <input
            type="checkbox"
            checked={highMediumOnly}
            onChange={(e) => setHighMediumOnly(e.target.checked)}
            className="h-4 w-4"
          />
          Samo HIGH/MEDIUM
        </label>
        <button
          type="button"
          onClick={resetFilters}
          className="mt-6 px-3 py-2 text-sm border border-gray-300 rounded-lg bg-white hover:bg-gray-50 text-gray-800"
        >
          Reset filtera
        </button>
      </div>

      {loading && <div className="text-sm text-gray-600">Učitavanje pokrivenosti...</div>}
      {error && <div className="text-sm text-red-700">Greška: {error}</div>}

      {!loading && !error && (
        <>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="border rounded p-3 bg-blue-50">
              <div className="text-xs text-gray-600">Kategorije s pružateljima</div>
              <div className="text-2xl font-bold text-blue-700">
                {stats.categoriesWithProviders}/{categoryRows.length}
              </div>
            </div>
            <div className="border rounded p-3 bg-emerald-50">
              <div className="text-xs text-gray-600">Aktivni pružatelji (zbroj)</div>
              <div className="text-2xl font-bold text-emerald-700">{stats.allProviders}</div>
            </div>
            <div className="border rounded p-3 bg-indigo-50">
              <div className="text-xs text-gray-600">Gradovi pokriveni</div>
              <div className="text-2xl font-bold text-indigo-700">{stats.citiesCovered}</div>
            </div>
            <div className="border rounded p-3 bg-amber-50">
              <div className="text-xs text-gray-600">Aktivne kategorije bez pružatelja</div>
              <div className="text-2xl font-bold text-amber-700">{stats.uncovered}</div>
            </div>
          </div>

          <div className="grid lg:grid-cols-5 gap-4">
            <div className="lg:col-span-3 border rounded overflow-hidden">
              <div className="px-3 py-2 border-b bg-gray-50 text-sm font-medium text-gray-700">
                Karta pokrivenosti po gradovima (heatmap po broju pružatelja)
              </div>
              <div className="h-80">
                <MapContainer center={CROATIA_CENTER} zoom={7} style={{ height: '100%', width: '100%' }} scrollWheelZoom>
                  <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  />
                  {mapPoints.map((p) => (
                    <CircleMarker
                      key={p.city}
                      center={p.position}
                      radius={markerRadiusByCount(p.providersCount)}
                      pathOptions={{
                        color: markerColorByCount(p.providersCount),
                        fillColor: markerColorByCount(p.providersCount),
                        fillOpacity: 0.42,
                        weight: 2
                      }}
                    >
                      <Popup>
                        <div className="min-w-[220px]">
                          <div className="font-semibold">{p.city}</div>
                          <div className="text-sm text-blue-700">Pružatelji: {p.providersCount}</div>
                          <div className="text-sm text-gray-700">Kategorije: {p.categories.length}</div>
                          <div className="mt-1 text-xs text-gray-600">{p.categories.slice(0, 6).join(', ')}</div>
                        </div>
                      </Popup>
                    </CircleMarker>
                  ))}
                </MapContainer>
              </div>
            </div>

            <div className="lg:col-span-2 border rounded">
              <div className="px-3 py-2 border-b bg-gray-50 text-sm font-medium text-gray-700 flex items-center justify-between">
                <span>
                  Najveći gapovi (sort: priority score)
                </span>
                <button
                  onClick={exportGapCsv}
                  className="text-xs px-2 py-1 border rounded hover:bg-white"
                >
                  CSV export
                </button>
              </div>
              <div className="max-h-80 overflow-auto">
                {biggestGaps.length === 0 ? (
                  <p className="p-3 text-sm text-gray-600">Trenutno nema otvorenih poslova za gap analizu.</p>
                ) : (
                  biggestGaps.map((g) => (
                    <div key={g.id} className={`px-3 py-2 border-b last:border-b-0 ${rowPriorityClass(g.priorityScore)}`}>
                      <div className="font-medium text-sm text-gray-900 flex items-center justify-between">
                        <span>{g.name}</span>
                        <span className="text-[11px] px-2 py-0.5 rounded border border-gray-300 bg-white">
                          {rowPriorityLabel(g.priorityScore)}
                        </span>
                      </div>
                      <div className="text-xs text-gray-600">
                        Otvoreni: {g.openJobs} | Pružatelji: {g.providersCount} | Gap: {g.gap} | Priority: {g.priorityScore}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          <div className="grid lg:grid-cols-2 gap-4">
            <div className="border rounded">
              <div className="px-3 py-2 border-b bg-gray-50 text-sm font-medium text-gray-700 flex items-center justify-between">
                <span>Aktivne kategorije bez pružatelja</span>
                <button
                  onClick={exportUncoveredCsv}
                  className="text-xs px-2 py-1 border rounded hover:bg-white"
                >
                  CSV export
                </button>
              </div>
              <div className="max-h-56 overflow-auto">
                {uncoveredCategories.length === 0 ? (
                  <p className="p-3 text-sm text-gray-600">Sve aktivne kategorije trenutno imaju barem jednog pružatelja.</p>
                ) : (
                  uncoveredCategories.map((c) => (
                    <div key={c.id} className={`px-3 py-2 border-b last:border-b-0 text-sm ${rowPriorityClass(c.priorityScore)}`}>
                      <div className="font-medium text-gray-900 flex items-center justify-between">
                        <span>{c.name}</span>
                        <span className="text-[11px] px-2 py-0.5 rounded border border-gray-300 bg-white">
                          {rowPriorityLabel(c.priorityScore)}
                        </span>
                      </div>
                      <div className="text-xs text-gray-600">
                        Otvoreni poslovi: {c.openJobs} | Priority: {c.priorityScore}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="border rounded bg-amber-50 border-amber-200">
              <div className="px-3 py-2 border-b border-amber-200 text-sm font-medium text-amber-900 flex items-center justify-between">
                <span>Predloženi CTA za akviziciju</span>
                <button
                  onClick={copyCta}
                  className="text-xs px-2 py-1 border border-amber-300 rounded hover:bg-amber-100"
                >
                  Kopiraj tekst
                </button>
              </div>
              <div className="p-3">
                <textarea
                  readOnly
                  value={ctaText}
                  className="w-full h-44 border border-amber-200 rounded bg-white p-2 text-sm text-gray-800"
                />
              </div>
            </div>
          </div>

          <div className="border rounded overflow-hidden">
            <div className="px-3 py-2 border-b bg-gray-50 text-sm font-medium text-gray-700">
              Kategorije po pokrivenosti
            </div>
            <div className="px-3 py-2 border-b bg-gray-50 text-xs text-gray-600 flex gap-4">
              <span>Legenda:</span>
              <span className="inline-flex items-center gap-1"><span className="w-3 h-3 rounded bg-red-50 border"></span> HIGH</span>
              <span className="inline-flex items-center gap-1"><span className="w-3 h-3 rounded bg-amber-50 border"></span> MEDIUM</span>
              <span className="inline-flex items-center gap-1"><span className="w-3 h-3 rounded bg-blue-50 border"></span> LOW</span>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="text-left px-3 py-2">Kategorija</th>
                    <th className="text-left px-3 py-2">Pružatelji</th>
                    <th className="text-left px-3 py-2">Gradovi</th>
                    <th className="text-left px-3 py-2">Otvoreni poslovi</th>
                    <th className="text-left px-3 py-2">Gap</th>
                    <th className="text-left px-3 py-2">Priority</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedRowsByPriority
                    .slice()
                    .sort((a, b) => b.priorityScore - a.priorityScore || b.providersCount - a.providersCount)
                    .map((r) => (
                      <tr key={r.id} className={`border-t ${rowPriorityClass(r.priorityScore)}`}>
                        <td className="px-3 py-2">{r.name}</td>
                        <td className="px-3 py-2">{r.providersCount}</td>
                        <td className="px-3 py-2">{r.citiesCount}</td>
                        <td className="px-3 py-2">{r.openJobs}</td>
                        <td className="px-3 py-2 font-medium">{r.gap}</td>
                        <td className="px-3 py-2 font-medium">
                          {r.priorityScore}
                          <span className="ml-2 text-[11px] px-2 py-0.5 rounded border border-gray-300 bg-white">
                            {rowPriorityLabel(r.priorityScore)}
                          </span>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
