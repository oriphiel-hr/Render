const PLAUSIBLE_QUERY_URL = 'https://plausible.io/api/v2/query';

function siteId() {
  return process.env.PLAUSIBLE_SITE?.trim() || 'ravnopar.oriph.io';
}

function appendEmbedParam(url) {
  try {
    const parsed = new URL(url);
    if (!parsed.searchParams.has('embed')) parsed.searchParams.set('embed', 'true');
    return parsed.toString();
  } catch {
    return url;
  }
}

function metricAt(data, index = 0) {
  return data?.results?.[0]?.metrics?.[index] ?? null;
}

async function plausibleQuery(body) {
  const key = process.env.PLAUSIBLE_API_KEY?.trim();
  if (!key) return null;

  const res = await fetch(PLAUSIBLE_QUERY_URL, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${key}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(body)
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Plausible API ${res.status}: ${text.slice(0, 200)}`);
  }

  return res.json();
}

export async function getPlausibleAdminSummary() {
  const site = siteId();
  const apiKey = process.env.PLAUSIBLE_API_KEY?.trim();
  const shareUrl = process.env.PLAUSIBLE_SHARED_DASHBOARD_URL?.trim();

  if (!apiKey && !shareUrl) {
    return {
      configured: false,
      siteId: site,
      summary: null,
      shareUrl: null,
      externalUrl: `https://plausible.io/${site}`
    };
  }

  let summary = null;
  let error = null;

  if (apiKey) {
    try {
      const [today, last7d, last30d, topPages, topSources] = await Promise.all([
        plausibleQuery({ site_id: site, metrics: ['visitors', 'pageviews'], date_range: 'day' }),
        plausibleQuery({
          site_id: site,
          metrics: ['visitors', 'pageviews', 'bounce_rate', 'visit_duration'],
          date_range: '7d'
        }),
        plausibleQuery({ site_id: site, metrics: ['visitors', 'pageviews'], date_range: '30d' }),
        plausibleQuery({
          site_id: site,
          metrics: ['visitors', 'pageviews'],
          date_range: '7d',
          dimensions: ['event:page'],
          order_by: [['visitors', 'desc']],
          pagination: { limit: 10, offset: 0 }
        }),
        plausibleQuery({
          site_id: site,
          metrics: ['visitors'],
          date_range: '7d',
          dimensions: ['visit:source'],
          order_by: [['visitors', 'desc']],
          pagination: { limit: 8, offset: 0 }
        })
      ]);

      summary = {
        visitorsToday: metricAt(today, 0),
        pageviewsToday: metricAt(today, 1),
        visitors7d: metricAt(last7d, 0),
        pageviews7d: metricAt(last7d, 1),
        bounceRate7d: metricAt(last7d, 2),
        visitDuration7d: metricAt(last7d, 3),
        visitors30d: metricAt(last30d, 0),
        pageviews30d: metricAt(last30d, 1),
        topPages: (topPages?.results || []).map((row) => ({
          page: row.dimensions?.[0] || '—',
          visitors: row.metrics?.[0] ?? 0,
          pageviews: row.metrics?.[1] ?? 0
        })),
        topSources: (topSources?.results || []).map((row) => ({
          source: row.dimensions?.[0] || '(direct)',
          visitors: row.metrics?.[0] ?? 0
        }))
      };
    } catch (err) {
      error = err.message || 'Plausible API error';
    }
  }

  return {
    configured: true,
    siteId: site,
    summary,
    error,
    shareUrl: shareUrl ? appendEmbedParam(shareUrl) : null,
    externalUrl: shareUrl || `https://plausible.io/${site}`
  };
}
