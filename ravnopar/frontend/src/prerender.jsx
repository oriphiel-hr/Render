import { renderToString } from 'react-dom/server';
import { StaticRouter } from 'react-router-dom';
import { I18nProvider } from './lib/i18n/index.jsx';
import HomePage from './pages/HomePage.jsx';
import PlanoviPage from './pages/PlanoviPage.jsx';
import FairFeedPage from './pages/FairFeedPage.jsx';
import FairnessReportPage from './pages/FairnessReportPage.jsx';
import PublicDonatePage from './pages/PublicDonatePage.jsx';
import FaqPage from './pages/FaqPage.jsx';
import GuidelinesPage from './pages/GuidelinesPage.jsx';
import PrivacyPage from './pages/PrivacyPage.jsx';
import TermsPage from './pages/TermsPage.jsx';
import ContactPage from './pages/ContactPage.jsx';
import { PUBLIC_PATHS, buildPrerenderFilePath } from './lib/seo.js';
import { SUPPORTED_LOCALES } from './lib/i18n/locale-meta.js';

const PAGE_MAP = {
  '/': HomePage,
  '/planovi': PlanoviPage,
  '/kako-radi-feed': FairFeedPage,
  '/fer-izvjestaj': FairnessReportPage,
  '/doniraj': PublicDonatePage,
  '/pomoc': FaqPage,
  '/pravila': GuidelinesPage,
  '/privatnost': PrivacyPage,
  '/uvjeti': TermsPage,
  '/kontakt': ContactPage
};

function pageProps(path) {
  if (path === '/planovi') return { token: null };
  return {};
}

export function renderPublicPage(locale, path) {
  const Page = PAGE_MAP[path];
  if (!Page) return null;

  const urlPath = path === '/' ? `/${locale}` : `/${locale}${path}`;
  const props = pageProps(path);

  const body = renderToString(
    <StaticRouter location={urlPath}>
      <I18nProvider initialLocale={locale}>
        <Page {...props} />
      </I18nProvider>
    </StaticRouter>
  );

  return { body, urlPath, outFile: buildPrerenderFilePath(locale, path) };
}

export function listPrerenderJobs() {
  const jobs = [];
  for (const locale of SUPPORTED_LOCALES) {
    for (const path of PUBLIC_PATHS) {
      jobs.push({ locale, path });
    }
  }
  return jobs;
}
