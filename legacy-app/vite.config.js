import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import { newsletterPlugin } from './server/vite-newsletter.mjs';

export default defineConfig(({ mode }) => {
  const root = process.cwd();
  const environment = loadEnv(mode, root, '');
  return { plugins: [newsletterPlugin(root, environment), react()] };
});
