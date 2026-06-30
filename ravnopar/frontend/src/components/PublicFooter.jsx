import { Link } from 'react-router-dom';
import { isDonateConfigured } from '../lib/donate-config.js';
import { useI18n } from '../lib/i18n/index.jsx';

export default function PublicFooter({ token }) {
  const { t } = useI18n();
  const showDonate = token && isDonateConfigured();

  return (
    <footer className="public-footer">
      <nav className="public-footer-nav" aria-label={t('footer.navLabel')}>
        <Link to="/planovi">{t('footer.plans')}</Link>
        <Link to="/pomoc">{t('footer.help')}</Link>
        <Link to="/kako-radi-feed">{t('footer.fairFeed')}</Link>
        <Link to="/fer-izvjestaj">{t('footer.fairnessReport')}</Link>
        <Link to="/pravila">{t('footer.guidelines')}</Link>
        <Link to="/privatnost">{t('footer.privacy')}</Link>
        <Link to="/uvjeti">{t('footer.terms')}</Link>
        <Link to="/kontakt">{t('footer.contact')}</Link>
        {isDonateConfigured() && <Link to="/doniraj">{t('footer.donate')}</Link>}
        {showDonate && <Link to="/app/podrzi">{t('footer.donate')}</Link>}
        {token && <Link to="/app/postavke">{t('footer.settings')}</Link>}
      </nav>
      <p className="public-footer-copy">{t('footer.copyright', { year: new Date().getFullYear() })}</p>
    </footer>
  );
}
