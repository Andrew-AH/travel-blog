# Agent guide — Wei's Tiny Adventures

Repository and local WordPress installation reviewed on **2026-09-25**. This is a map of the implementation and its important constraints, not a replacement for inspecting the specific code or current database records you change. Runtime versions, content and installed plugins can change after this snapshot.

## Start here

- **WordPress is the current app.** Unless a request explicitly concerns the legacy app, implement it in WordPress.
- The goal of the migration is to preserve the owner's custom frontend while gaining editable content and normal WordPress plugin support. Preserve the established design and interactions when making ordinary changes.
- **Live content is in the WordPress database.** The owner actively edits it in the dashboard. Read current content before updating it; source templates and legacy copy may be outdated.
- Start everything with `npm run wordpress:start` from the project root, with Docker Desktop running. Site: `http://localhost:8080`; admin: `http://localhost:8080/wp-admin/`. No separate frontend server is required.
- `legacy-app/` contains the original React/Node application. It is separate at runtime, but some original files are still inputs to the WordPress asset build. Do not assume the folder is disposable.
- First choose the right change location using the source-of-truth table below. Avoid rebuilding or reimporting content for a small dashboard edit.

## History and product context

1. The original site was a custom React/Vite travel journal with locally served artwork/fonts, country journals, an interactive destination atlas, travel planning tools and a small Node/SQLite newsletter backend.
2. A custom WordPress block theme and companion plugin were added to retain the design while making content editable. This is a conventional WordPress-rendered site with React widgets, **not a headless WordPress backend behind a separate React SPA**.
3. Docker Compose was added to install WordPress, activate the theme/plugin and import the initial content. The owner subsequently tested the dashboard and made real content edits there.
4. The original app, assets, utilities, tests and historical artifacts were moved into `legacy-app/`. Root npm commands now primarily support WordPress; legacy commands are explicitly prefixed.
5. Migration fixes restored the curved hero lettering/button icons and homepage preview links. A subsequent fix restored wheel/touch scrolling after inherited page CSS clipped the WordPress body.

User-requested changes at this snapshot: the live About page heading is **“Hello, I’m Wei.”**; header order is **Destinations → Budget guides → Travel tips → About me**, followed by Subscribe. The heading was updated in the database; menu order was updated in the theme's header pattern. Treat these as history, not permission to overwrite newer user edits.

The design uses a blue wave logo, navy/sea-blue text, pale paper backgrounds, watercolor artwork and an alpine lake hero. Fonts are locally hosted Lato, Cormorant Garamond and Allura. Preserve existing images, responsive layouts, readable HTML text, keyboard access and image credits. Earlier artwork/screenshots are alternatives and history, not necessarily the current design.

## Workspace map

| Location | Purpose |
| --- | --- |
| `docker-compose.yml` | Current WordPress, MariaDB, setup and optional WP-CLI services |
| `wordpress/weis-tiny-adventures/` | Active custom WordPress block theme |
| `wordpress/weis-travel-tools/` | Active companion plugin: content model, blocks, React tools, newsletter |
| `wordpress/docker/` | Startup/import scripts and PHP upload configuration |
| `scripts/` | WordPress startup, asset preparation, starter-content generation, packaging and browser tests |
| Root `package.json`, `package-lock.json`, `node_modules/` | WordPress JS/build/test tooling; these are intentional even though production pages are served by PHP |
| Root `.env` | Local Docker/admin credentials and port; private, not a content store |
| `legacy-app/` | Original app with its own manifest, lockfile, Vite config, source, backend, public assets, docs and scripts |
| `artifacts/` | Ignored WordPress screenshots, reports, old experiments and a historical test installation |
| `legacy-app/artifacts/` | Ignored legacy screenshots, experiments, logs and one-off tests |

`artifacts/wordpress-test/` is an old test harness, **not the current Docker app**. Do not edit its WordPress/PHP copies to change the live site. Prefer maintained tests under `scripts/`; artifact scripts may have obsolete ports, IDs or assumptions and are not guaranteed to exist in a fresh checkout.

## Sources of truth: where changes belong

| Request | Authoritative location / approach |
| --- | --- |
| Current page text, article body, destination details, uploaded media | WordPress database/media library, through admin, WP-CLI or authenticated REST API |
| Navigation or shared template layout | Check saved `wp_navigation`, `wp_template_part`, `wp_template` records first; otherwise theme `parts/`, `patterns/`, `templates/` |
| Global editor palette/fonts/layout settings | Theme `theme.json`, plus any saved Site Editor global styles |
| WordPress-specific styling | Theme `assets/wordpress.css`; editor adjustments in `assets/editor.css` |
| Travel-tip tabs on editable pages | Theme `assets/theme.js` |
| Destination data model, server-rendered journal cards/blocks | Plugin `weis-travel-tools.php` |
| Interactive map/checklist/official-link selectors | Plugin `src/`, then rebuild the bundle |
| Newsletter backend | Plugin `includes/newsletter.php` |
| Newsletter browser/editor behavior | Plugin `assets/newsletter.js`, `assets/newsletter-editor.js`, corresponding CSS |
| Dynamic block editor controls | Plugin `assets/editor.js` and matching PHP block definitions |
| Initial import layouts and seed records | Theme `content/*.html`, `content/seed.json`, and `inc/setup.php`; these are not live page records |
| Original app behavior | `legacy-app/src/`, `legacy-app/server/` and its own scripts/config |

Saved Site Editor templates/styles can override theme files. An inserted pattern becomes editable content; later pattern-file changes do not necessarily update an existing saved page. A change to `legacy-app/src/App.jsx` will not change a WordPress page. A source-only patch also does not capture database-only edits for deployment.

## Docker and local commands

Use Node.js **24+**, Docker Desktop with Linux containers, and npm. The manifests currently specify React 19.3, Vite 8.3 and Playwright 1.63; lockfiles define the exact installed dependency graph.

```sh
# Run these from the project root.
npm run wordpress:start
npm run wordpress:stop
docker compose ps -a
docker compose logs --tail 40 wordpress setup
docker compose run --rm wp-cli core version
docker compose run --rm wp-cli plugin list
```

`scripts/start-wordpress.mjs` fills missing `WP_*` entries in `.env` with local defaults and generated passwords, starts Compose, waits for setup and checks its exit code. On an initialized workspace, `docker compose up -d` also works. Empty/malformed existing settings are not repaired automatically. Editing an admin password in `.env` does not reset an already-installed WordPress account.

Compose project name: `weis-travel-blog`. Services:

- `wordpress`: official `wordpress:php8.3-apache`, bound to `127.0.0.1:${WP_PORT:-8080}`. PHP/Apache serves both pages and backend endpoints.
- `db`: `mariadb:11.4`, available on the Compose network, without a host database port.
- `setup`: one-shot WP-CLI container; successful `Exited (0)` is expected. Installs core only when needed, activates the custom plugin/theme, imports content when needed, and flushes rewrite rules. It reactivates this project's theme/plugin on subsequent runs; account for that when testing alternatives.
- `wp-cli`: optional `tools` profile, invoked with `docker compose run --rm wp-cli ...`; runs as UID/GID `33:33` on the shared WordPress files.

Persistent volumes are normally `weis-travel-blog_database_data` and `weis-travel-blog_wordpress_data`. They hold the database and `/var/www/html` respectively, including WordPress core, configuration, uploads and dashboard-installed plugins. Source theme/plugin folders are read-only bind mounts **inside Docker**; edit them on the host. Block editor changes still save normally to the database.

`wordpress/docker/uploads.ini` sets 64 MB uploads/posts and 256 MB PHP memory. Local configuration enables direct plugin installation and disables the dashboard PHP file editor; this does not disable the block/Site Editor. First installation sets Australia/Sydney timezone and discourages search indexing. At review time, WordPress core was 7.1.2 and only `weis-travel-tools` was active; SEO/ad plugins were not yet configured. The image tags float, so verify actual versions rather than assuming this snapshot is a pin.

Ordinary stop/start preserves data. **`docker compose down -v` deletes the site's saved data** and is not a routine restart. Preserve root `.env` and WordPress configuration/salts. Changing `WP_PORT` on an existing site also requires updating its stored URLs; changing the port mapping alone is insufficient.

## Updating live WordPress content

Prefer WP-CLI in this local setup, or the authenticated REST API. Both invoke WordPress's own update logic; do not use direct SQL for ordinary page edits.

1. Find the current record by slug/type, and read its content. IDs vary across installations. Example read-only discovery:

   ```sh
   docker compose run --rm wp-cli post list --post_type=page --name=about-me --fields=ID,post_title --format=json
   docker compose run --rm wp-cli post list --post_type=wp_navigation,wp_template_part,wp_template --fields=ID,post_type,post_name --format=json
   ```

2. Keep a revision or recoverable copy. Apply only the requested edit to the current content, preserving unrelated dashboard changes, block comments/attributes, links and inline artwork.
3. Run writes as the configured administrator (`--user=...`, using `WP_ADMIN_USER`). For PHP via `wp eval`/`eval-file`, use `wp_update_post(wp_slash($post_data), true)` and check for `WP_Error`. Correct slashing matters for block attribute JSON and HTML. Read back and compare the saved result.
4. Verify the rendered page; for structural block edits, also check that the editor can parse/save/reload without invalid blocks.

The import code has a narrowly scoped KSES bypass for bundled trusted SVG/block markup. Do not generalize that bypass to arbitrary submitted HTML. Run legitimate administrative edits with the proper user/capabilities and preserve the existing markup.

Do not re-run seed generation/import as a way to edit live copy. The importer deliberately keeps matching existing records. For database-only edits, report that the change is in the running WordPress installation, not just in source files.

## WordPress implementation details

### Theme

- `functions.php`: theme support, assets, page/body classes, setup integration and render filters. The filters render editable crest text as curved SVG and add icons to standard buttons; rendered decoration may intentionally differ from stored block markup.
- `theme.json`: palette, self-hosted fonts, editor settings and template registration.
- `templates/front-page.html`, `journal-page.html`, `page.html`, `single.html`, `taxonomy-wei_country.html`, `index.html`, `404.html`: page structures. `parts/header.html` loads `patterns/header.php`; inspect database overrides before assuming that file is active.
- `assets/site.css`: generated concatenation of original CSS. **Do not hand-edit it for WordPress fixes**; the next asset build overwrites it. Use `assets/wordpress.css` for adaptation styles. Its enqueued version uses file modification time; other assets still use explicit version strings, so consider cache invalidation when modifying them.
- `inc/setup.php`: administrator-only, repeatable importer. It imports media to uploads, resolves `{{asset:...}}` / `{{url:...}}` tokens, creates pages/posts/destinations and sets the homepage when appropriate. `_wei_seed` and `_wei_original_asset` metadata identify prior imports; `wei_pending_media` / `_wei_pending_photo` support retries.
- Docker adds a `wei_docker_setup_complete` marker and skips completed imports unless media needs retry. Initial seed: seven pages, 16 destinations, 12 country terms and three Bali article previews. These are **seed counts**, not total database counts; default WordPress sample records and later user content can also exist.

### Companion plugin and content model

`weis-travel-tools.php` registers the public `wei_destination` post type and shared `wei_country` taxonomy for destinations and normal blog posts. Individual destination URLs use `/place/<slug>/`; country archives use `/destinations/<country>/`. Standard pages include `/destinations/`, `/travel-tips/`, `/budget-guides/`, `/about-me/`, `/subscribe/`, `/unsubscribe/` and the homepage.

For destinations, title = place name, content = postcard description, excerpt = tagline, featured image = photo. `_wei_region`, `_wei_longitude`, `_wei_latitude`, `_wei_image_alt` provide map metadata. Coordinates are `[longitude, latitude]`; missing either coordinate keeps a place in the gallery without a map pin. `menu_order` controls destination ordering. Associate a destination and article with the same country to connect their journal.

Posts support `_wei_coming_soon`, `_wei_read_time`, `_wei_image_class`. Seed previews are published posts flagged as coming soon, not full articles. Homepage preview links lead to the relevant country collection and article anchor. Country collections show an empty state when no posts exist and use `wei_page` for their own pagination. Budget Guides is intentionally a work-in-progress page in the starter content.

Dynamic block names are `wei/destination-atlas`, `wei/packing-checklist`, `wei/travel-safety`, `wei/travel-entry`, `wei/country-posts`, `wei/recent-posts`, `wei/country-cover`, plus `wei/newsletter-signup`, `wei/newsletter-unsubscribe`, `wei/newsletter-teaser`. PHP and editor JS definitions must agree on attributes. Editor scripts use WordPress's `wp.*` packages and dynamic blocks save their attributes rather than a static rendered result.

Public widget flow:

```text
WordPress records + block attributes
  → PHP render callback: fallback HTML + JSON in .wei-widget-data
  → plugin src/frontend.jsx finds [data-wei-widget]
  → React mounts the matching widget into .wei-widget-content
```

The atlas receives server-provided destination data; it is not fetching the legacy hardcoded destination array in the browser. Keep safe JSON encoding, fallback content, WordPress-generated URLs and attachment URLs. Avoid hardcoded localhost URLs in reusable theme/plugin output.

`src/Atlas.jsx` handles search, continent filters and postcards; `src/components/WorldMap.jsx` handles projection, pins, nearby-pin selection, zoom and pan. Geography is bundled Natural Earth/TopoJSON rendered with D3 Geo, not a paid map API or remote tile service. Preserve first-click/tap pin selection, keyboard controls, empty continent states and vertical touch scrolling over the map.

`PackingChecklist.jsx` saves progress in browser localStorage (`weis-tiny-adventures-packing-v1`) and provides text download/reset. This is per browser/origin, not a WordPress user account feature. Safety/entry widgets link to official resources; they are not live advisory/visa eligibility engines. Verify official sources before changing travel guidance or claiming current rules. WordPress and legacy component/data copies are separate; they are not automatically synchronized.

### Newsletter

- Backend: `includes/newsletter.php`; browser behavior: hand-maintained `assets/newsletter.js` (not generated by the React build).
- Anonymous JSON POST endpoints: `/wp-json/wei/v1/newsletter/subscribe` and `/wp-json/wei/v1/newsletter/unsubscribe`.
- Private table: `$wpdb->prefix . 'wei_newsletter_subscribers'`. Stores normalized email, optional first name, consent/version/time, status, token hash and encrypted recoverable export token. These are mailing-list subscribers, not WordPress login accounts.
- Preserve affirmative consent, honeypot checks, 4 KB body limit, same-origin checks, request limits and indistinguishable duplicate signup responses. Limits use `REMOTE_ADDR`; do not casually trust forwarded IP headers.
- Homepage signup drafts use sessionStorage; emails are not carried in query strings. Exported unsubscribe URLs carry `#token=...`; visiting a link alone does not unsubscribe someone. A confirming POST is required.
- **Tools → Newsletter** displays records and exports active subscribers with their individual unsubscribe links. Export is administrator/nonce protected. Do not log or commit exports/tokens.
- Both WordPress and legacy implementations collect subscriptions but **do not send email**. No email provider or double-opt-in confirmation delivery is configured. Legacy SQLite subscribers are not automatically imported into WordPress.
- Export-token encryption depends on WordPress auth salts. Preserve the database and salts together when migrating; changing salts prevents decrypting existing export tokens. Previously issued unsubscribe links can still match stored hashes.

## Build dependencies and generated files

```sh
# Root; npm ci is needed once on a fresh checkout for build/test dependencies.
npm ci
npm run wordpress:assets
npm run wordpress:build
```

`scripts/build-wordpress.mjs` reads `legacy-app/src/data/{destinations,posts}.js`, a specific list of legacy CSS files, and `legacy-app/public/{images,fonts}`. It writes theme `assets/site.css`, copies eligible assets/credits, generates decorative icon SVGs, and writes `content/seed.json`. It does **not** update imported database pages/posts. Back up any intentional hand changes to generated/copied targets before regenerating them.

`wordpress:build` runs that preparation, then Vite library mode with `wordpress/weis-travel-tools/vite.config.mjs`. The plugin's own `src/frontend.jsx` becomes `assets/travel-tools.js` (IIFE), with `assets/travel-tools.css` and a separate watercolor texture. `emptyOutDir: false` preserves the hand-maintained editor/newsletter assets in the same directory. Never replace this with an indiscriminate clean of `assets/`.

`node scripts/generate-wordpress-content.mjs` is a separate, explicit starter-layout generator. It contains original copy and reads the legacy Travel Tips source, then overwrites theme starter HTML and selected pattern files. It is not part of normal builds and is not a live content migration.

`scripts/package-wordpress.ps1` zips the current theme/plugin into `wordpress/packages/`. Build before packaging if React/assets changed. Docker development uses the mounted source directories, not those ZIPs.

## Legacy app reference

Run legacy commands inside `legacy-app/`, or use root `legacy:*` aliases:

```sh
npm run legacy:dev
npm run legacy:build
npm run legacy:preview
npm run legacy:start
```

- `src/main.jsx` / `src/App.jsx`: React entry, homepage and pathname-based selection of lazy-loaded pages. Normal links navigate page URLs; there is no React Router dependency.
- `src/pages/`: destinations, country journals, travel tips, budget placeholder, About, signup and unsubscribe pages with their CSS.
- `src/components/SiteChrome.jsx`: branding, header, newsletter footer. Other component files implement the map/checklist/selectors/forms.
- `src/data/destinations.js`, `posts.js`, `countryJournals.js`: original hardcoded content and country grouping. Bali maps to Indonesia; London maps to the United Kingdom; Australian places share Australia.
- `public/`: local fonts, photos, illustration originals, WebP variants and credits. Legacy image optimization scripts use paths relative to the legacy working directory.
- `server/index.mjs`: Node HTTP production server, default `127.0.0.1:3000`, serving `dist/` plus newsletter endpoints. Build before `legacy:start`.
- `server/app.mjs`: allowlisted page routes, static-file handling and newsletter middleware. Preserve unknown-country/deeper-route 404s and private-file/path-traversal protections when modifying routing.
- `server/newsletter.mjs`: built-in `node:sqlite` persistence and POST `/api/newsletter/{subscribe,unsubscribe}`. `server/vite-newsletter.mjs` exposes the same backend in Vite dev **and preview**; serving `dist/` on an arbitrary static host does not provide that API.
- `legacy-app/.env`: optional legacy `SITE_URL`, `NEWSLETTER_DATA_DIR`, `HOST`, `PORT`, `TRUST_PROXY_IP`. Keep it separate from root Docker `.env`. Default private data lives in `legacy-app/data/`; it must not be publicly served. CSV export is `npm --prefix legacy-app run newsletter:export` and requires the correct site origin.

The two apps can diverge intentionally. Do not copy live WordPress content back into legacy files without a request to synchronize them. Neither app's Node dependencies require an extra Node server for WordPress production requests.

## Verification and known regression

Choose checks appropriate to the change; do not run every suite for a text-only edit. Fresh browser-test environments need `npx playwright install chromium`. Root WordPress tests load root `.env` and use `WP_PORT`/admin credentials; run them against this local site, not an unrelated installation.

| Check | What it establishes |
| --- | --- |
| `npm run wordpress:build` | Asset-copy paths and React plugin compile |
| `npm run test:wordpress` | Eight routes at desktop/mobile widths, screenshots, errors/broken images/overflow, map filtering, checklist persistence, tip tabs, mobile navigation, admin login and plugin installer |
| `npm run test:wordpress:scroll` | Real wheel and touch scrolling, including over the map and after closing the mobile menu |
| `docker compose exec wordpress php -l /var/www/html/wp-content/themes/weis-tiny-adventures/functions.php` | Example PHP syntax check; substitute the specific modified PHP file |
| `npm run legacy:build` | Legacy Vite build from its new folder |
| `npm --prefix legacy-app run test:newsletter` | Legacy validation, consent/storage/export/unsubscribe, routes and private-file protections |
| `npm --prefix legacy-app run test:destinations` | Legacy desktop/touch map interactions, filters, country links and previews |

The root smoke test does **not** submit a newsletter subscription or prove content-editor round trips. For changes to those areas, verify signup → stored record → admin export → unsubscribe, or edit/save/reload a temporary draft as appropriate. Clean up only records created by the check. Historical examples exist under ignored `artifacts/`, but inspect their assumptions before reuse. Screenshots/reports go to `artifacts/docker-wordpress/`.

**Scrolling regression:** original page classes such as `.atlas-page` and `.tips-page` use `overflow: clip` on inner React wrappers. WordPress also applies those classes to `<body>`. Clipping the body propagates to the viewport and blocks user scrolling even though `window.scrollTo()` and full-page screenshots can succeed. The fix in theme `assets/wordpress.css` sets `overflow: visible` on the relevant body classes while inner wrappers retain clipping. Preserve it and run the wheel/touch suite after changes to page wrappers, body classes, navigation overlays or overflow styles. Keep map `touch-action: pan-y` behavior.

## Operational conventions and further context

- Work within the requested scope and preserve existing dashboard/source edits. This guide does not require an extra approval step for ordinary requested edits.
- This workspace uses Windows/PowerShell and a path containing spaces. Quote paths; avoid embedding large PHP/JSON/HTML strings in shell commands. Smart apostrophes can also confuse PowerShell quoting. Prefer a script file or `spawnSync` argument arrays; pass `wp_slash`-prepared data through WordPress rather than hand-escaping SQL.
- Before moving/deleting directories, verify resolved paths stay inside the intended workspace. Keep `.sh` files LF (`.gitattributes`). Other projects can occupy ports such as 5173; identify the actual process/project before stopping it. Never infer that a listener is this app solely from its port.
- Do not print/commit `.env`, `wp-config.php`, subscriber data, SQL dumps or authentication tokens. `.gitignore` excludes local data, dependencies, build outputs and artifacts. Git metadata may not be present in a provided workspace; check before assuming Git operations are available.
- SEO/ad plugins install through normal WordPress mechanisms but still need configuration and provider accounts/placements where relevant. Do not promise arbitrary plugin compatibility or silently connect external services. The current Docker configuration is local development, not a public hosting deployment.
- A deployment needs the database, uploads, theme/plugin code and relevant configuration/salts. Preserve serialized WordPress data when changing URLs; use WordPress-aware migration tools, not raw string replacement in a SQL dump.
- Keep this file updated when architecture, commands, data ownership or important workflows change. Mark historical observations as such rather than hardcoding current content IDs or credentials.

Useful references: [development mini guide](WORDPRESS-DEVELOPMENT.md), [WordPress installation/editing guide](wordpress/README.md), [legacy overview](legacy-app/README.md), [legacy newsletter setup](legacy-app/NEWSLETTER-SETUP.md), [brand history](legacy-app/BRAND-NOTES.md), [hero artwork](legacy-app/HERO-ARTWORK.md), [asset credits](legacy-app/ASSET-CREDITS.md), and the travel-source notes under `legacy-app/src/data/`.
