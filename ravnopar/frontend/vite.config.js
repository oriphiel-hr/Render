import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

function plausibleHeadPlugin(analyticsUrl) {
  return {
    name: 'ravnopar-plausible-head',
    transformIndexHtml(html) {
      if (!analyticsUrl) return html;

      const snippet = `
    <script>window.plausible=window.plausible||function(){(plausible.q=plausible.q||[]).push(arguments)},plausible.init=plausible.init||function(i){plausible.o=i||{}};plausible.init()</script>
    <script defer data-ravnopar-analytics="1" src="${analyticsUrl}"></script>`;

      return html.replace('</head>', `${snippet}\n  </head>`);
    }
  };
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const analyticsUrl = env.VITE_ANALYTICS_URL?.trim();

  return {
    plugins: [react(), plausibleHeadPlugin(analyticsUrl)],
    resolve: {
      conditions: ['production', 'module', 'browser', 'default']
    },
    ssr: {
      noExternal: ['react-router', 'react-router-dom']
    }
  };
});
