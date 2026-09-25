# Quick start: WordPress development

## 1. Start the whole site

Open Docker Desktop and wait for its engine to start. Open a terminal in:

```text
C:\Users\andrew.he\Desktop\Personal\Travel Blog
```

Run:

```sh
npm run wordpress:start
```

This starts WordPress (PHP and its web server), the MariaDB database, and the setup task that activates the custom theme/plugin and imports starter content on the first run. Existing content is kept on subsequent starts. There is **no separate frontend or backend command**.

- Website: http://localhost:8080
- Admin dashboard: http://localhost:8080/wp-admin/
- Login: open the root `.env` file and use `WP_ADMIN_USER` and `WP_ADMIN_PASSWORD`.

The setup container exiting with code `0` is normal: it has finished its job. Docker Desktop and Node.js 24+ are required. The initial start downloads Docker images; this machine is already set up.

## 2. Make changes

| Change | Where to work |
| --- | --- |
| Page text and photos | **Pages** in the dashboard |
| Blog articles | **Posts** |
| Places, map coordinates and destination photos | **Destinations** |
| Navigation and shared layouts | **Appearance → Editor** |
| SEO, ads or other plugins | **Plugins → Add New Plugin**, then configure the chosen plugin |
| Custom styling | `wordpress/weis-tiny-adventures/assets/wordpress.css` |
| Theme templates and PHP | `wordpress/weis-tiny-adventures/` |
| Map and interactive React tools | `wordpress/weis-travel-tools/src/` |
| Custom backend functionality | `wordpress/weis-travel-tools/` PHP files |

Dashboard edits are stored in the WordPress database. PHP and CSS file edits are mounted into the running container: refresh the page to see them.

After changing the plugin's React code, rebuild from the project root:

```sh
npm run wordpress:build
```

On a fresh checkout, run `npm ci` once before building or running browser tests. No frontend dev server is needed. The build also refreshes original theme assets from `legacy-app`; use `assets/wordpress.css` for WordPress styling changes rather than editing the generated `assets/site.css`.

If you have customized a template through the Site Editor, that saved database version takes precedence over the matching theme template file.

## 3. Check your changes

Refresh http://localhost:8080 and check the affected page at desktop and phone widths. For the existing automated checks:

```sh
npm run test:wordpress
npm run test:wordpress:scroll
```

On a fresh machine, install the test browser once with `npx playwright install chromium`.

## 4. Stop and resume

```sh
npm run wordpress:stop
npm run wordpress:start
```

Stopping preserves your content, uploads and installed plugins in Docker volumes. Removing those volumes with `docker compose down -v` deletes that saved data.

For troubleshooting:

```sh
docker compose ps -a
docker compose logs --tail 40 wordpress setup
```

The original React/Node app is in `legacy-app/`; it is separate from the running WordPress site. A public deployment also needs the WordPress database and uploads, not just these project files. This local site has search indexing disabled and no email delivery service configured.
