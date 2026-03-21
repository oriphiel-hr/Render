import React, { useEffect, useMemo, useState } from 'react';
import api from '../api';

export default function AdminScreenshots() {
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [loadingScreenshots, setLoadingScreenshots] = useState(false);
  const [usersResult, setUsersResult] = useState(null);
  const [genResult, setGenResult] = useState(null);
  const [files, setFiles] = useState([]);
  const [filesLoading, setFilesLoading] = useState(false);
  const [videoLoading, setVideoLoading] = useState(false);
  const [videoLoadingLabel, setVideoLoadingLabel] = useState('');
  const [videoResult, setVideoResult] = useState(null);
  const [videoFormats, setVideoFormats] = useState([]);
  const [videosLoading, setVideosLoading] = useState(false);
  const [zipLoading, setZipLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [deleteVideosLoading, setDeleteVideosLoading] = useState(false);
  const [error, setError] = useState('');

  const hasFiles = files?.length > 0;

  const getAbsUrl = (maybeRel) => {
    if (!maybeRel) return maybeRel;
    if (typeof window === 'undefined') return maybeRel;
    // Ukloni fragment (npr. #time-landing) da ne ode u browserove blob/capture modove
    const clean = maybeRel.split('#')[0];
    if (clean.startsWith('http')) return clean;
    const apiOrigin = (api?.defaults?.baseURL || '').replace(/\/api\/?$/, '');
    if (clean.startsWith('/docs/') && apiOrigin) return `${apiOrigin}${clean}`;
    return `${window.location.origin}${clean}`;
  };

  const grouped = useMemo(() => {
    const groups = { korisnik: [], pruzatelj: [], tim: [], direktor: [], ostalo: [] };
    for (const f of files || []) {
      const n = (f.fileName || '').toLowerCase();
      if (n.includes('korisnik')) groups.korisnik.push(f);
      else if (n.includes('pruzatelj') || n.includes('pružatelj')) groups.pruzatelj.push(f);
      else if (n.includes('tim')) groups.tim.push(f);
      else if (n.includes('director') || n.includes('direktor')) groups.direktor.push(f);
      else groups.ostalo.push(f);
    }
    return groups;
  }, [files]);

  async function refreshList() {
    try {
      setFilesLoading(true);
      setError('');
      const { data } = await api.get('/admin/docs-screenshots', { timeout: 120000 });
      setFiles(data.files || []);
    } catch (e) {
      setError(e?.response?.data?.error || e.message || 'Greška pri učitavanju screenshotova.');
    } finally {
      setFilesLoading(false);
    }
  }

  async function refreshVideos() {
    try {
      setVideosLoading(true);
      setError('');
      const { data } = await api.get('/admin/docs-social-videos', { timeout: 120000 });
      setVideoFormats(data.formats || []);
    } catch (e) {
      setError(e?.response?.data?.error || e.message || 'Greška pri učitavanju videa.');
    } finally {
      setVideosLoading(false);
    }
  }

  useEffect(() => {
    refreshList();
    refreshVideos();
  }, []);

  const createTestUsersAndData = async () => {
    try {
      setLoadingUsers(true);
      setError('');
      setUsersResult(null);
      const { data } = await api.post('/admin/screenshot-test-users', {}, { timeout: 180000 });
      setUsersResult(data);
    } catch (e) {
      setError(e?.response?.data?.error || e.message || 'Greška pri kreiranju testnih korisnika.');
    } finally {
      setLoadingUsers(false);
    }
  };

  const generateScreenshots = async () => {
    try {
      setLoadingScreenshots(true);
      setError('');
      setGenResult(null);
      const { data } = await api.post('/admin/generate-docs-screenshots', {}, { timeout: 600000 });
      setGenResult(data);
      await refreshList();
    } catch (e) {
      const d = e?.response?.data;
      setGenResult({
        success: false,
        error: d?.error || e.message || 'Greška pri generiranju screenshotova.',
        hint: d?.hint,
        scriptPath: d?.scriptPath,
        stdout: d?.stdout,
        stderr: d?.stderr,
      });
    } finally {
      setLoadingScreenshots(false);
    }
  };

  const generateVideos = async (videoFormat = 'all') => {
    const labels = {
      all: 'TikTok/YT/FB',
      tiktok: 'TikTok',
      youtube: 'YouTube',
      facebook: 'Facebook',
    };
    const currentLabel = labels[videoFormat] || String(videoFormat);
    const stopVideoLoading = () => {
      setVideoLoading(false);
      setVideoLoadingLabel('');
    };

    try {
      setVideoLoading(true);
      setVideoLoadingLabel(currentLabel);
      setError('');
      setVideoResult(null);
      // Backend pokreće Playwright u pozadini (bez 15+ min HTTP čekanja)
      const { data } = await api.post(
        '/admin/generate-social-videos',
        { videoFormat, intervalMs: 1800, stepWaitMs: 1800 },
        { timeout: 120000 }
      );

      if (data.async && data.jobId) {
        setVideoResult({
          success: true,
          pending: true,
          jobId: data.jobId,
          message: data.message || 'Generiranje u tijeku…',
        });
        const myJobId = data.jobId;
        const started = Date.now();
        const maxWaitMs = 90 * 60 * 1000;

        const poll = async () => {
          try {
            const { data: st } = await api.get('/admin/generate-social-videos/status', { timeout: 60000 });
            if (st.jobId !== myJobId) {
              if (Date.now() - started > 180000) {
                setVideoResult({
                  success: false,
                  error:
                    'Status posla se ne poklapa s ovim pokretanjem (npr. drugi tab ili restart servera). Osvježite i pokušajte ponovno.',
                });
                stopVideoLoading();
                return;
              }
              setTimeout(poll, 4000);
              return;
            }
            if (st.status === 'running') {
              if (Date.now() - started > maxWaitMs) {
                setVideoResult({
                  success: false,
                  error: `Generiranje traje predugo (>${Math.round(maxWaitMs / 60000)} min). Provjerite logove na serveru.`,
                });
                stopVideoLoading();
                return;
              }
              setTimeout(poll, 4000);
              return;
            }
            if (st.status === 'success') {
              setVideoResult({
                success: true,
                pending: false,
                jobId: st.jobId,
                message: 'Social videi i screenshotovi su generirani.',
                users: st.users,
                stdout: st.stdoutTail,
              });
              await refreshVideos();
            } else if (st.status === 'error') {
              setVideoResult({
                success: false,
                error: st.errorMessage || 'Generiranje social videa nije uspjelo.',
                stdout: st.stdoutTail,
                stderr: st.stderrTail,
              });
            } else {
              setVideoResult({
                success: false,
                error: `Neočekivano stanje: ${st.status || 'n/a'}`,
              });
            }
            stopVideoLoading();
          } catch (err) {
            setVideoResult({
              success: false,
              error: err?.response?.data?.error || err.message || 'Greška pri provjeri statusa videa.',
            });
            stopVideoLoading();
          }
        };
        poll();
        return;
      }

      setVideoResult(data);
      await refreshVideos();
      stopVideoLoading();
    } catch (e) {
      const d = e?.response?.data;
      const status = e?.response?.status;
      setVideoResult({
        success: false,
        error: d?.error || e.message || 'Greška pri generiranju videa.',
        jobId: d?.jobId,
        stdout: d?.stdout,
        stderr: d?.stderr,
        conflict: status === 409,
      });
      stopVideoLoading();
    }
  };

  const renderGrid = (items) => {
    if (!items?.length) return null;
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {items.map((f) => (
          <a
            key={f.fileName}
            href={getAbsUrl(f.url)}
            target="_blank"
            rel="noopener noreferrer"
            className="group rounded-lg border bg-white hover:shadow transition overflow-hidden"
            title={f.fileName}
          >
            <div className="aspect-[16/10] bg-gray-50 overflow-hidden">
              <img
                src={getAbsUrl(f.url)}
                alt={f.fileName}
                className="w-full h-full object-cover group-hover:scale-[1.01] transition"
                loading="lazy"
              />
            </div>
            <div className="px-3 py-2 text-xs text-gray-600 font-mono truncate">{f.fileName}</div>
          </a>
        ))}
      </div>
    );
  };

  const renderVideos = () => {
    if (!videoFormats?.length) {
      return <div className="text-sm text-gray-600">Nema videa u `/docs/social`.</div>;
    }

    const getFormatOpenUrl = (fmt) => {
      const firstVideo = fmt?.videos?.[0]?.url;
      if (firstVideo) return getAbsUrl(firstVideo);
      const firstShot = fmt?.shots?.[0]?.url;
      if (firstShot) return getAbsUrl(firstShot);
      return getAbsUrl(`/docs/social/${fmt.formatDir}/manifest.json`);
    };

    return (
      <div className="space-y-8">
        <div className="text-xs text-gray-500">
          Pronađeno formata: {videoFormats.length}
        </div>
        {videoFormats.map((fmt) => (
          <section key={fmt.formatDir} className="border rounded-lg p-3">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-3">
              <div>
                <div className="font-semibold text-sm">{fmt.formatDir}</div>
                {fmt.manifest?.ts && (
                  <div className="text-xs text-gray-500">Zadnje generirano: {new Date(fmt.manifest.ts).toLocaleString()}</div>
                )}
              </div>
              <a
                href={getFormatOpenUrl(fmt)}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-indigo-700 hover:underline"
              >
                Otvori datoteku
              </a>
            </div>

            {fmt.videos?.length > 0 ? (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {fmt.videos.map((v) => (
                  <div key={v.fileName} className="rounded border bg-white p-2">
                    <div className="text-xs text-gray-600 font-mono truncate mb-2">{v.fileName}</div>
                    <video controls className="w-full rounded" src={getAbsUrl(v.url)} />
                    <button
                      type="button"
                      className="text-sm text-indigo-700 hover:underline mt-2 inline-block"
                      onClick={() => downloadVideo(v.url, v.fileName)}
                      title="Preuzmi video datoteku"
                    >
                      Preuzmi video
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-sm text-gray-600">Nema video datoteka (još).</div>
            )}

            {fmt.shots?.length > 0 && (
              <div className="mt-4">
                <div className="font-semibold text-sm mb-2">Česti screenshotovi (frames)</div>
                {renderGrid(fmt.shots.slice(0, 12))}
                {fmt.shots.length > 12 && (
                  <div className="text-xs text-gray-500 mt-2">Prikazano prvih 12 od {fmt.shots.length}.</div>
                )}
              </div>
            )}
          </section>
        ))}
      </div>
    );
  };

  const downloadAllScreenshotsZip = async () => {
    try {
      setZipLoading(true);
      setError('');
      const { data } = await api.post(
        '/admin/docs-screenshots/download-zip',
        { scope: 'all' },
        { responseType: 'blob', timeout: 300000 }
      );

      const blob = data instanceof Blob ? data : new Blob([data]);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `uslugar-screenshots-${new Date().toISOString().slice(0, 10)}.zip`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (e) {
      setError(e?.response?.data?.error || e.message || 'Greška pri preuzimanju ZIP-a.');
    } finally {
      setZipLoading(false);
    }
  };

  async function downloadVideo(videoUrl, fileName) {
    try {
      setVideoLoading(true);
      setError('');
      const url = getAbsUrl(videoUrl);
      const res = await fetch(url);
      if (!res.ok) throw new Error(`Download failed: ${res.status}`);
      const blob = await res.blob();
      const objUrl = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = objUrl;
      a.download = fileName || 'video';
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(objUrl);
    } catch (e) {
      setError(e?.message || 'Greška pri preuzimanju videa.');
    } finally {
      setVideoLoading(false);
    }
  }

  const deleteAllScreenshots = async () => {
    const ok = window.confirm('Obrisati SVE screenshotove (images) iz /docs i /docs/social/**/shots? Ova radnja je nepovratna.');
    if (!ok) return;

    try {
      setDeleteLoading(true);
      setError('');
      await api.delete('/admin/docs-screenshots', { data: { scope: 'all', confirm: true }, timeout: 180000 });
      setFiles([]);
      await refreshList();
      await refreshVideos();
    } catch (e) {
      setError(e?.response?.data?.error || e.message || 'Greška pri brisanju screenshotova.');
    } finally {
      setDeleteLoading(false);
    }
  };

  const deleteAllSocialVideos = async () => {
    const ok = window.confirm('Obrisati SVE social video datoteke (.webm/.mp4) iz /docs/social? Ova radnja je nepovratna.');
    if (!ok) return;

    try {
      setDeleteVideosLoading(true);
      setError('');
      await api.delete('/admin/docs-screenshots', { data: { scope: 'social-videos', confirm: true }, timeout: 180000 });
      await refreshVideos();
    } catch (e) {
      setError(e?.response?.data?.error || e.message || 'Greška pri brisanju social videa.');
    } finally {
      setDeleteVideosLoading(false);
    }
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">📸 Screenshotovi</h1>
        <p className="text-gray-600">
          Testni korisnici + uvjerljivi demo podaci + generiranje screenshotova vodiča (Playwright).
        </p>
      </div>

      {error && (
        <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      )}

      <div className="bg-white rounded-lg shadow p-4 mb-6">
        <div className="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
          <div className="text-sm text-gray-700">
            <div className="font-semibold">Brze akcije</div>
            <div className="text-gray-500">
              1) Kreiraj testne korisnike 2) Generiraj screenshotove 3) Osvježi listu.
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={createTestUsersAndData}
              disabled={loadingUsers}
              className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 disabled:opacity-50"
            >
              {loadingUsers ? 'Radim…' : '👤 Testni korisnici + demo podaci'}
            </button>
            <button
              onClick={generateScreenshots}
              disabled={loadingScreenshots}
              className="px-4 py-2 bg-emerald-600 text-white rounded hover:bg-emerald-700 disabled:opacity-50"
            >
              {loadingScreenshots ? 'Generiram…' : '📸 Generiraj screenshotove vodiča'}
            </button>
            <button
              onClick={() => generateVideos('all')}
              disabled={videoLoading}
              className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 disabled:opacity-50"
            >
              {videoLoading ? `Snimam ${videoLoadingLabel}…` : '🎬 Generiraj social video (TikTok/YT/FB)'}
            </button>
            <button
              onClick={() => generateVideos('tiktok')}
              disabled={videoLoading}
              className="px-4 py-2 bg-fuchsia-600 text-white rounded hover:bg-fuchsia-700 disabled:opacity-50"
            >
              {videoLoading && videoLoadingLabel === 'TikTok' ? 'Snimam TikTok…' : '🎵 TikTok'}
            </button>
            <button
              onClick={() => generateVideos('youtube')}
              disabled={videoLoading}
              className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50"
            >
              {videoLoading && videoLoadingLabel === 'YouTube' ? 'Snimam YouTube…' : '▶️ YouTube'}
            </button>
            <button
              onClick={() => generateVideos('facebook')}
              disabled={videoLoading}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
            >
              {videoLoading && videoLoadingLabel === 'Facebook' ? 'Snimam Facebook…' : '📘 Facebook'}
            </button>
            <button
              onClick={refreshList}
              disabled={filesLoading}
              className="px-4 py-2 border rounded hover:bg-gray-50 disabled:opacity-50"
            >
              {filesLoading ? 'Učitavam…' : '↻ Osvježi listu'}
            </button>
          </div>
        </div>

        {(usersResult || genResult || videoResult) && (
          <div className="mt-4 grid grid-cols-1 lg:grid-cols-2 gap-4">
            {usersResult && (
              <div className={`p-3 rounded border ${usersResult.success ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
                <div className="font-semibold text-sm mb-1">Testni korisnici</div>
                {usersResult.success ? (
                  <>
                    <div className="text-sm text-green-900">{usersResult.message}</div>
                    {usersResult.users?.length > 0 && (
                      <ul className="mt-2 text-xs text-green-900 space-y-1 font-mono">
                        {usersResult.users.map((u, i) => (
                          <li key={i}>{u.role}: {u.email} ({u.fullName})</li>
                        ))}
                      </ul>
                    )}
                  </>
                ) : (
                  <div className="text-sm text-red-900">{usersResult.error || 'Greška.'}</div>
                )}
              </div>
            )}

            {genResult && (
              <div className={`p-3 rounded border ${genResult.success ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
                <div className="font-semibold text-sm mb-1">Generiranje screenshotova</div>
                {genResult.success ? (
                  <>
                    <div className="text-sm text-green-900">{genResult.message}</div>
                    {genResult.stdout && (
                      <pre className="mt-2 p-2 bg-black/10 rounded text-xs max-h-40 overflow-auto">{genResult.stdout}</pre>
                    )}
                  </>
                ) : (
                  <>
                    <div className="text-sm text-red-900">{genResult.error || 'Greška.'}</div>
                    {genResult.hint && <div className="mt-1 text-xs text-red-800">{genResult.hint}</div>}
                    {(genResult.stderr || genResult.stdout) && (
                      <pre className="mt-2 p-2 bg-black/10 rounded text-xs max-h-40 overflow-auto">{genResult.stderr || genResult.stdout}</pre>
                    )}
                  </>
                )}
              </div>
            )}

            {videoResult && (
              <div
                className={`p-3 rounded border ${
                  videoResult.pending
                    ? 'bg-amber-50 border-amber-200'
                    : videoResult.success
                      ? 'bg-green-50 border-green-200'
                      : 'bg-red-50 border-red-200'
                }`}
              >
                <div className="font-semibold text-sm mb-1">Generiranje videa</div>
                {videoResult.pending ? (
                  <>
                    <div className="text-sm text-amber-900">{videoResult.message}</div>
                    {videoResult.jobId && (
                      <div className="text-xs text-amber-800 mt-1 font-mono">Job: {videoResult.jobId}</div>
                    )}
                    <p className="text-xs text-amber-800 mt-2">
                      Ovo može trajati i 20–40+ minuta. Možete ostaviti tab otvoren ili kasnije kliknuti „Osvježi videe”.
                    </p>
                  </>
                ) : videoResult.success ? (
                  <>
                    <div className="text-sm text-green-900">{videoResult.message}</div>
                    {videoResult.users?.length > 0 && (
                      <ul className="mt-2 text-xs text-green-900 space-y-1 font-mono">
                        {videoResult.users.map((u, i) => (
                          <li key={i}>
                            {u.role}: {u.email} ({u.fullName})
                          </li>
                        ))}
                      </ul>
                    )}
                    {videoResult.stdout && (
                      <pre className="mt-2 p-2 bg-black/10 rounded text-xs max-h-40 overflow-auto">{videoResult.stdout}</pre>
                    )}
                  </>
                ) : (
                  <>
                    <div className="text-sm text-red-900">{videoResult.error || 'Greška.'}</div>
                    {videoResult.conflict && videoResult.jobId && (
                      <div className="text-xs text-red-800 mt-1">Aktivni job: {videoResult.jobId}</div>
                    )}
                    {(videoResult.stderr || videoResult.stdout) && (
                      <pre className="mt-2 p-2 bg-black/10 rounded text-xs max-h-40 overflow-auto">{videoResult.stderr || videoResult.stdout}</pre>
                    )}
                  </>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      <div className="bg-white rounded-lg shadow p-4 mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <div className="font-semibold">Social videi</div>
            <div className="text-sm text-gray-500">
              TikTok/Reels (9:16), YouTube (16:9), Square (1:1) + česti screenshotovi tijekom snimanja.
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={deleteAllSocialVideos}
              disabled={deleteVideosLoading}
              className="px-3 py-1.5 bg-red-600 text-white rounded text-sm hover:bg-red-700 disabled:opacity-50"
            >
              {deleteVideosLoading ? 'Brišem videe...' : '🗑️ Obriši social videe'}
            </button>
            <button
              onClick={refreshVideos}
              disabled={videosLoading}
              className="px-4 py-2 border rounded hover:bg-gray-50 disabled:opacity-50"
            >
              {videosLoading ? 'Učitavam…' : '↻ Osvježi videe'}
            </button>
          </div>
        </div>
        {renderVideos()}
      </div>

      <div className="bg-white rounded-lg shadow p-4">
        <div className="flex items-center justify-between mb-4">
          <div>
            <div className="font-semibold">Galerija</div>
            <div className="text-sm text-gray-500">
              {hasFiles ? `Pronađeno ${files.length} datoteka.` : 'Nema screenshotova u /docs.'}
            </div>
          </div>
          <div className="flex items-center gap-2 flex-wrap justify-end">
            <a
              href="/docs/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-indigo-700 hover:underline"
            >
              Otvori `/docs` u novom tabu
            </a>
            <button
              onClick={downloadAllScreenshotsZip}
              disabled={zipLoading}
              className="px-3 py-1.5 bg-indigo-600 text-white rounded text-sm hover:bg-indigo-700 disabled:opacity-50"
            >
              {zipLoading ? 'ZIP...' : '⬇️ Skini sve (ZIP)'}
            </button>
            <button
              onClick={deleteAllScreenshots}
              disabled={deleteLoading}
              className="px-3 py-1.5 bg-red-600 text-white rounded text-sm hover:bg-red-700 disabled:opacity-50"
            >
              {deleteLoading ? 'Brišem...' : '🗑️ Obriši screenshotove'}
            </button>
          </div>
        </div>

        {hasFiles ? (
          <div className="space-y-8">
            {grouped.korisnik.length > 0 && (
              <section>
                <div className="font-semibold text-sm mb-2">Korisnik</div>
                {renderGrid(grouped.korisnik)}
              </section>
            )}
            {grouped.pruzatelj.length > 0 && (
              <section>
                <div className="font-semibold text-sm mb-2">Pružatelj</div>
                {renderGrid(grouped.pruzatelj)}
              </section>
            )}
            {grouped.tim.length > 0 && (
              <section>
                <div className="font-semibold text-sm mb-2">Tim</div>
                {renderGrid(grouped.tim)}
              </section>
            )}
            {grouped.direktor.length > 0 && (
              <section>
                <div className="font-semibold text-sm mb-2">Direktor</div>
                {renderGrid(grouped.direktor)}
              </section>
            )}
            {grouped.ostalo.length > 0 && (
              <section>
                <div className="font-semibold text-sm mb-2">Ostalo</div>
                {renderGrid(grouped.ostalo)}
              </section>
            )}
          </div>
        ) : (
          <div className="text-sm text-gray-600">
            Klikni <span className="font-semibold">“Generiraj screenshotove vodiča”</span> pa osvježi listu.
          </div>
        )}
      </div>
    </div>
  );
}

