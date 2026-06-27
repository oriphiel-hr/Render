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
  if (!url) return null;

  const yt = youtubeId(url);
  if (yt) {
    return (
      <div className="video-embed">
        <iframe
          title="Video profil"
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
          title="Video profil"
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
        Pogledaj video profil
      </a>
    </p>
  );
}
