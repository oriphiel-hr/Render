import { useI18n } from '../lib/i18n/index.jsx';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:4200/api';

function resolveMediaUrl(url) {
  if (!url) return null;
  if (url.startsWith('http://') || url.startsWith('https://')) return url;
  if (url.startsWith('/media/')) {
    const origin = API_BASE_URL.replace(/\/api\/?$/, '');
    return `${origin}${url}`;
  }
  return url;
}

function isHostedVideo(url) {
  if (!url) return false;
  if (url.startsWith('/media/videos/')) return true;
  try {
    return new URL(url).pathname.startsWith('/media/videos/');
  } catch (_error) {
    return false;
  }
}

function youtubeId(url) {
  try {
    const parsed = new URL(url);
    if (parsed.hostname === 'youtu.be') return parsed.pathname.slice(1);
    return parsed.searchParams.get('v');
  } catch (_error) {
    return null;
  }
}

function vimeoId(url) {
  try {
    const parts = new URL(url).pathname.split('/').filter(Boolean);
    return parts[parts.length - 1] || null;
  } catch (_error) {
    return null;
  }
}

export default function VideoEmbed({ url }) {
  const { t } = useI18n();

  if (!url) return null;

  if (isHostedVideo(url)) {
    const src = resolveMediaUrl(url);
    return (
      <div className="video-embed video-embed-hosted">
        <video controls playsInline preload="metadata" src={src}>
          {t('video.unsupported')}
        </video>
      </div>
    );
  }

  const yt = youtubeId(url);
  if (yt) {
    return (
      <div className="video-embed">
        <iframe
          title={t('video.embedTitle')}
          src={`https://www.youtube.com/embed/${yt}`}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      </div>
    );
  }

  const vimeo = vimeoId(url);
  if (vimeo) {
    return (
      <div className="video-embed">
        <iframe
          title={t('video.embedTitle')}
          src={`https://player.vimeo.com/video/${vimeo}`}
          allow="autoplay; fullscreen; picture-in-picture"
          allowFullScreen
        />
      </div>
    );
  }

  return (
    <p className="video-link-wrap">
      <a className="button button-secondary" href={url} target="_blank" rel="noopener noreferrer">
        {t('video.externalLink')}
      </a>
    </p>
  );
}
