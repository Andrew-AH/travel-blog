# Your editable WordPress travel journal

The theme recreates your existing design with editable WordPress blocks. The companion plugin supplies destinations, country journals, the interactive map, travel tools, and newsletter forms. You do not need React, Node.js, or a page builder to use the installed site.

The original React/Node app is now in [`../legacy-app/`](../legacy-app/README.md). WordPress Docker commands still run from the project root. The asset preparation script reads original images/styles from `legacy-app`; WordPress page edits remain in its database.

**Run the complete local site with Docker**

Start Docker Desktop, then run from the project root:

```sh
npm run wordpress:start
```

This generates private passwords in the root `.env` file, starts WordPress/PHP/Apache and MariaDB, then runs a one-time setup container to activate the included theme/plugin and import the journal. The setup container finishing with `Exited (0)` is expected. Running the command again preserves imported content and your edits.

- Site: http://localhost:8080
- Dashboard: http://localhost:8080/wp-admin/
- Username: `WP_ADMIN_USER` in `.env` (default `weiadmin`).
- Password: `WP_ADMIN_PASSWORD` in `.env`.

The database, uploads, installed third-party plugins and WordPress configuration persist in Docker named volumes. The custom theme/plugin are mounted directly from this project, so source edits appear locally; use `npm run wordpress:build` after editing their React code or shared source styles. Their source folders are read-only inside Docker; edit them here. WordPress page and Site Editor changes are saved normally in the database. Third-party plugins can be installed through **Plugins → Add New Plugin**.

```sh
docker compose ps -a                  # Container status
docker compose logs --tail 40 setup   # Import/startup result
npm run wordpress:stop               # Stop; keep all content and plugins
npm run wordpress:start              # Start again
npm run test:wordpress               # Browser/interaction checks (requires npm dependencies and Playwright Chromium)
docker compose run --rm wp-cli plugin list
```

After the first start, plain `docker compose up -d` also works. Do not use `docker compose down -v` unless you intend to delete this site's database and uploads. Choose a different `WP_PORT` in `.env` before the first installation if port 8080 is occupied; an existing site's stored WordPress URL must also be migrated if changing ports later.

This is a local development installation, available only on this computer. Search indexing is disabled under **Settings → Reading** for this local copy. SEO/ad plugins can be installed normally, but you still need to configure them, place ads where desired and connect any provider accounts. Before a public launch, migrate the database, uploads and code together, configure HTTPS and email delivery, and review the search-indexing setting. The newsletter currently collects subscriptions; it does not send email or import subscribers from the original Node backend.

**Install through your local WordPress dashboard**

Use WordPress 6.6 or newer with PHP 8.0 or newer. Sign in as an administrator, then:

1. Go to **Plugins → Add New Plugin → Upload Plugin**. Choose [weis-travel-tools.zip](packages/weis-travel-tools.zip), install it, and click **Activate Plugin**.
2. Go to **Appearance → Themes → Add New Theme → Upload Theme**. Choose [weis-tiny-adventures.zip](packages/weis-tiny-adventures.zip), install it, and click **Activate**.
3. Open **Appearance → Set up Wei’s journal**. Leave **Use the imported Home page as this site’s homepage** selected, then click **Import the travel journal**. Allow the photos to finish importing before leaving the page.
4. Click **View your journal**. The import adds seven pages, 16 destinations, three coming-soon article previews, and the supplied photos to your Media Library.

The import keeps existing matching pages and imported content. Running it again does not reset your edits. If an existing Home page prevented the new homepage from being selected, choose the page you want under **Settings → Reading → A static page**.

**Make everyday changes**

| What you want to change | Where to edit |
| --- | --- |
| Homepage, biography, budget page, travel tips, or signup introduction | **Pages → All Pages → Edit**. Click the text to type; select an image and choose **Replace** to change it. |
| Header, navigation, footer, or shared page layout | **Appearance → Editor**. Select the header/footer or open the relevant template. |
| Colours and fonts | **Appearance → Editor → Styles**. The original fonts and colour palette are included. |
| Blog articles | **Posts → Add New Post**. Write the article, select its **Country**, and choose a **Featured image**. |
| Existing coming-soon previews | Edit the post, add the full article, and clear **Show as a coming soon preview** in **Travel journal settings**. |
| Map pins and destination cards | **Destinations → Add destination** or edit a destination. Set its name, description, excerpt, featured image, Country, and **Destination map details**. |
| Newsletter signups | **Tools → Newsletter**. View signups and download the active-subscriber CSV. |

In the page editor, **List View** helps you select a section or a nested block. Travel tip accordion headings and their contents are editable. The map and article grids update from your published destinations and posts.

Select an interactive tool block to change its available heading and introduction in the block settings. Changes to how a tool works, its built-in packing items, or its official-resource list require updating the companion plugin.

For a destination, the main text becomes its postcard description and the excerpt becomes its short tagline. Choose a continent and enter longitude and latitude to place its map pin. Leave either coordinate blank to show the destination in the list without a pin. Give an article and a destination the same Country to connect their journal pages.

To reuse a layout, open the block inserter’s **Patterns** tab and search for **Alpine adventure hero**, **Wei’s postcard introduction**, or **Editable travel field guide**. Choose the **Travel journal layout** page template when using a full-width journal layout.

The three imported article previews still need their full stories written. The newsletter saves new signups and unsubscribe preferences in WordPress; it does not send emails. Use a fresh active-subscriber export with your mailing provider and include each recipient’s `unsubscribe_url`. Subscriber records from the previous React backend are not imported by the theme setup.

**If WordPress runs in Docker**

Dashboard ZIP uploads are still the easiest option. Alternatively, with Docker running, use these PowerShell commands from the Travel Blog project folder. Replace `YOUR_WORDPRESS_CONTAINER` with the WordPress container name shown by `docker ps`; the paths below are for the standard WordPress Docker image.

```powershell
docker ps --format "table {{.Names}}\t{{.Image}}\t{{.Ports}}"
docker cp .\wordpress\weis-travel-tools YOUR_WORDPRESS_CONTAINER:/var/www/html/wp-content/plugins/
docker cp .\wordpress\weis-tiny-adventures YOUR_WORDPRESS_CONTAINER:/var/www/html/wp-content/themes/
```

Then activate **Wei’s Travel Tools** under **Plugins**, activate **Weis Tiny Adventures** under **Appearance → Themes**, and run **Appearance → Set up Wei’s journal** as above. If a page opens with a 404 after installation, open **Settings → Permalinks** and click **Save Changes** once.

When you move online, migrate the WordPress database and uploads together with this theme and plugin so your edits move with the site. Keep the existing WordPress authentication salts when migrating: the newsletter uses them to protect the unsubscribe links included in subscriber exports.
