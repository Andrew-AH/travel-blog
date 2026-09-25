import { readFile, writeFile, mkdir, readdir, copyFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { destinations } from '../legacy-app/src/data/destinations.js';
import { posts } from '../legacy-app/src/data/posts.js';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { Compass } from '@phosphor-icons/react/dist/csr/Compass';
import { PaperPlaneTilt } from '@phosphor-icons/react/dist/csr/PaperPlaneTilt';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const legacyRoot = path.join(root, 'legacy-app');
const theme = path.join(root, 'wordpress/weis-tiny-adventures');
await mkdir(path.join(theme, 'assets'), { recursive: true });
await mkdir(path.join(theme, 'content'), { recursive: true });
await mkdir(path.join(theme, 'assets/icons'), { recursive: true });
for (const [name, component, weight] of [['compass', Compass, 'light'], ['paper-plane', PaperPlaneTilt, 'fill']]) {
  await writeFile(path.join(theme, `assets/icons/${name}.svg`), renderToStaticMarkup(React.createElement(component, { weight, 'aria-hidden': 'true' })));
}
const cssFiles = ['src/styles.css', 'src/pages/destinations.css', 'src/pages/country-journal.css', 'src/pages/travel-tips.css', 'src/pages/budget-guides.css', 'src/pages/about-me.css', 'src/pages/subscribe.css', 'src/pages/unsubscribe.css', 'src/components/brand.css', 'src/components/newsletter-signup.css', 'src/components/world-map.css', 'src/components/packing-checklist.css', 'src/components/travel-safety-check.css', 'src/components/travel-entry-check.css'];
let css = '';
for (const file of cssFiles) css += `\n/* Original: ${file} */\n${await readFile(path.join(legacyRoot, file), 'utf8')}\n`;
css = css.replaceAll("url('/images/", "url('images/").replaceAll("url('/fonts/", "url('fonts/");
await writeFile(path.join(theme, 'assets/site.css'), css);
async function copyAssets(source, target) {
  await mkdir(target, { recursive: true });
  for (const file of await readdir(source, { withFileTypes: true })) {
    if (file.isDirectory()) { await copyAssets(path.join(source, file.name), path.join(target, file.name)); continue; }
    if (!/\.(webp|svg|woff2|txt|md)$/i.test(file.name)) continue;
    await copyFile(path.join(source, file.name), path.join(target, file.name));
  }
}
await copyAssets(path.join(legacyRoot, 'public/images'), path.join(theme, 'assets/images'));
await copyAssets(path.join(legacyRoot, 'public/fonts'), path.join(theme, 'assets/fonts'));
await writeFile(path.join(theme, 'content/seed.json'), JSON.stringify({ destinations, posts }, null, 2));
await copyFile(path.join(legacyRoot, 'ASSET-CREDITS.md'), path.join(theme, 'ASSET-CREDITS.md'));
console.log(`Prepared theme assets and starter data: ${destinations.length} destinations, ${posts.length} article previews.`);
