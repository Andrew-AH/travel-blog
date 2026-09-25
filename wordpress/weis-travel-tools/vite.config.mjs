import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { fileURLToPath } from 'node:url'
import { readFileSync } from 'node:fs'

const watercolor = readFileSync(new URL('./src/watercolor-wash.webp', import.meta.url))
const watercolorDataUrl = `data:image/webp;base64,${watercolor.toString('base64')}`

export default defineConfig({
  root: fileURLToPath(new URL('.', import.meta.url)),
  plugins: [react(), {
    name: 'wei-shared-watercolor',
    enforce: 'post',
    generateBundle(_options, bundle) {
      // Library mode inlines images. Keep this shared texture as one cacheable asset.
      for (const asset of Object.values(bundle)) {
        if (asset.type === 'asset' && asset.fileName.endsWith('.css')) asset.source = String(asset.source).replaceAll(watercolorDataUrl, './watercolor-wash.webp')
      }
      this.emitFile({ type: 'asset', fileName: 'watercolor-wash.webp', source: watercolor })
    },
  }],
  publicDir: false,
  base: './',
  define: { 'process.env.NODE_ENV': JSON.stringify('production') },
  build: {
    outDir: 'assets',
    emptyOutDir: false,
    lib: { entry: fileURLToPath(new URL('./src/frontend.jsx', import.meta.url)), name: 'WeiTravelTools', formats: ['iife'], fileName: () => 'travel-tools.js', cssFileName: 'travel-tools' },
    rollupOptions: { output: { assetFileNames: '[name][extname]' } },
  },
})
