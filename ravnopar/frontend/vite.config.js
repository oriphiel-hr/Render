import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  resolve: {
    conditions: ['production', 'module', 'browser', 'default']
  },
  ssr: {
    noExternal: ['react-router', 'react-router-dom']
  }
});
