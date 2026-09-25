# Wei's Tiny Adventures

The current site runs on WordPress. The original React/Node app is archived separately in [`legacy-app/`](legacy-app/README.md).

Start here: [WordPress development mini guide](WORDPRESS-DEVELOPMENT.md).

Code agents: read [AGENTS.md](AGENTS.md) for architecture, data ownership, project history, commands and migration pitfalls.

## WordPress — current site

Start Docker Desktop, then run from this directory:

```sh
npm run wordpress:start
```

- Website: http://localhost:8080
- Admin: http://localhost:8080/wp-admin/
- Login: `WP_ADMIN_USER` and `WP_ADMIN_PASSWORD` in the root `.env` file.
- Theme: `wordpress/weis-tiny-adventures/`
- Companion plugin: `wordpress/weis-travel-tools/`
- Docker services and persistent volumes: `docker-compose.yml`

Content, settings and dashboard edits live in the WordPress database. Uploads and installed plugins live in Docker storage. `npm run wordpress:stop` stops the site without removing this data.

See [WordPress instructions](wordpress/README.md) for editing, installing plugins and maintaining the site.

## Legacy React/Node app

All original frontend/backend source, public assets, Vite configuration, legacy utilities/tests and design notes are in `legacy-app/`, with its own `package.json` and lockfile.

```sh
cd legacy-app
npm install
npm run dev
```

Alternatively, use `npm run legacy:dev` or `npm run legacy:build` from this project root. See the [legacy README](legacy-app/README.md) for its server, newsletter and test commands. Legacy newsletter configuration belongs in `legacy-app/.env`; the root `.env` is for WordPress Docker.

## Build tools

The root npm dependencies support the WordPress React plugin, migration scripts and browser checks. The root `node_modules/` is therefore still used by WordPress tooling.

`npm run wordpress:build` rebuilds the plugin and refreshes the original theme assets from `legacy-app`. This updates packaged files and starter data, not imported WordPress database content. `scripts/generate-wordpress-content.mjs` is an explicit migration utility for regenerating starter page files from the original copy; it also reads `legacy-app` and does not publish those files into existing WordPress pages.
