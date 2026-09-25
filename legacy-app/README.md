# Weis Tiny Adventures — legacy React app

A React recreation of the supplied coastal travel blog design, built with Vite. All visible text is HTML, the layout is responsive CSS, and the photography, illustrations, and fonts are served locally.

This folder contains the original app. The current WordPress site is maintained separately in [`../wordpress/`](../wordpress/README.md). WordPress dashboard edits are not synced into this legacy source.

Run the commands below from this `legacy-app` directory. From the project root, `npm run legacy:dev`, `npm run legacy:build`, `npm run legacy:preview`, and `npm run legacy:start` forward to this app.

## Run locally

Use Node.js 24 or newer. The mailing list uses Node's built-in SQLite support.

```sh
npm install
npm run dev
```

Open the local URL printed by Vite, usually http://127.0.0.1:5173.

## Production build

```sh
npm run build
npm run preview
```

For a production server with subscription collection, use `npm start` after building. Configure `SITE_URL` and a persistent private data directory as described in [NEWSLETTER-SETUP.md](NEWSLETTER-SETUP.md). Uploading `dist` alone to a static host does not provide the newsletter API.

## Editing the page

- `src/App.jsx`: homepage sections, copy, and page routing.
- `src/pages/DestinationsPage.jsx`: the interactive destination atlas and postcard previews.
- `src/pages/CountryJournalPage.jsx` and `country-journal.css`: country blog collections and empty states.
- `src/data/posts.js`: shared homepage and country blog metadata.
- `src/data/countryJournals.js`: country grouping, URLs, and post lookup.
- `src/pages/destinations.css`: destination page layout and responsive styles.
- `src/pages/TravelTipsPage.jsx` and `travel-tips.css`: the coastal travel field guide, topic-based tips, and page layout.
- `src/pages/BudgetGuidesPage.jsx` and `budget-guides.css`: the Budget Guides work-in-progress page.
- `src/pages/AboutMePage.jsx` and `about-me.css`: Wei's introduction, hobbies, and reason for sharing travel guides.
- `src/pages/SubscribePage.jsx` and `subscribe.css`: Letters from Wei signup page.
- `src/components/NewsletterSignupForm.jsx`: accessible name and email signup fields, consent, and submission states.
- `src/pages/UnsubscribePage.jsx`: confirmation page for private newsletter unsubscribe links.
- `server/`: private subscriber storage, newsletter API, and production web server.
- `src/components/TravelSafetyCheck.jsx`: official government advisory links and country selection.
- `src/components/TravelEntryCheck.jsx` and `src/data/entryRequirements.js`: worldwide visa guidance and official destination links for visas, travel authorisations, arrival declarations, and visitor levies.
- `src/components/PackingChecklist.jsx`: trip-specific packing lists, local progress, and text downloads.
- `src/data/destinations.js`: destination names, coordinates, photos, and journal text.
- `src/components/WorldMap.jsx`: local map geography, pins, zooming, and panning.
- `src/components/SiteChrome.jsx`: shared branding, navigation, and newsletter footer.
- `src/styles.css`: typography, colors, spacing, and responsive layouts.
- `public/images`: local photography and generated watercolor artwork.
- `public/fonts`: self-hosted fonts and their licenses.

The desktop/tablet layout follows the reference. Below 640px, the travel values use two columns and the posts use one column to keep everything readable. The phone status bar and home indicator from the supplied screenshot are not part of the webpage.

The Destinations navigation and Start exploring link open the atlas at `/destinations`. Travel tips opens `/travel-tips`. The first three homepage article previews are “THE ULTIMATE 12 DAYS IN BALI”, “MUST TRY SNACKS IN BALI”, and “THE PERFECT DAY IN LOVINA”, all under Destinations. Their links open the matching previews in `/destinations/indonesia`. Subscribe opens the working mailing-list signup at `/subscribe`. Photos and custom artwork follow the coastal style of the reference.

The Budget guides navigation opens `/budget-guides`, a coastal work-in-progress page with links to the travel tips and destination atlas.

About me opens `/about-me`, a personal introduction based on Wei's supplied biography. The page reuses the alpine watercolor artwork as a scenic postcard and links to Destinations and Travel Tips. Edit the introduction and story in `src/pages/AboutMePage.jsx`.

## Travel tips

Open `/travel-tips` for official country advice, expandable planning/budget/travel tips, and a packing checklist. The country selector opens the matching Smartraveller page in a new tab; it does not cache safety levels or imply a destination is safe. The selector includes eight overseas countries; Bali uses Indonesia's advice and London uses the United Kingdom's. All other destinations remain available through the official directory. Verified source URLs are documented in `src/data/TRAVEL-SAFETY-SOURCES.md`.

Immediately below the Smartraveller section, `/travel-tips#entry-requirements` offers IATA's worldwide visa-checker starting point and a selector for official resources covering Indonesia/Bali, France, Greece, Italy, Japan, New Zealand, South Korea, Switzerland, and the United Kingdom. It distinguishes visas, travel authorisations, arrival declarations, and visitor levies. Bali's levy and New Zealand's IVL link to their government sources; changing rules and fees remain on those sites. Verified URLs and status notes are documented in `src/data/ENTRY-REQUIREMENTS-SOURCES.md`.

City, Beach, and Outdoors packing lists share six essentials and have three additional items each. Selection and ticks are saved locally under `weis-tiny-adventures-packing-v1`; the checklist also works when storage is unavailable. Download exports the current list and its ticked state as plain text. Reset clears the currently displayed items, including shared essentials, while retaining other trip-specific items. Deep links include `/travel-tips#country-safety`, `/travel-tips#money-tips`, and `/travel-tips#packing-list`.

## Mailing list

Every header Subscribe link opens `/subscribe`. The homepage newsletter form carries the entered address to that page using temporary session storage, keeping the email out of the URL; the temporary draft is removed when the signup form opens. Email and affirmative newsletter consent are required. First name is optional; the form does not ask for travel interests.

Successful submissions are saved on the server in private SQLite storage, with duplicate protection and recorded consent. Client and server validation, request limits, a honeypot, and honest error states prevent a success message when storage fails. Unsubscribe links open `/unsubscribe` and require a button click before changing the subscription, so email link previews cannot unsubscribe someone.

`npm run newsletter:export` exports active subscribers and their private unsubscribe links to an ignored CSV in the data directory. Set your public `SITE_URL` first. Use a fresh export before sending so opted-out readers are excluded. No email delivery service is connected and the app does not send newsletters or confirmation emails. See [NEWSLETTER-SETUP.md](NEWSLETTER-SETUP.md) for storage, hosting, export, and mailing-provider details.

Run `npm run test:newsletter` for the backend collection, consent, privacy, persistence, export, and unsubscribe checks.

## Destination atlas

Open `/destinations` directly or use the Destinations navigation link. The atlas supports clickable pins, region filters, city/country search, zooming, panning, keyboard map controls, and destination postcard previews. Each postcard's “View all [country] blogs” link and the gallery photo/title links open that country's blog collection. It works on phones and uses locally bundled Natural Earth geography, so no map account, API key, or external tile service is needed.

The atlas contains the owner's 16 confirmed places: Bali, Malaysia, Singapore, Taiwan, Melbourne, Tasmania, Sydney, Broken Hill, Cairns, South Korea, Japan, Italy, Greece, France, London, and Switzerland. The collection spans 12 country entries and 3 regions. Alongside All places, filters always offer Africa, Antarctica, Asia, Europe, North America, Oceania, and South America. Continents without visits show an empty state; the visited-continent count remains based on actual pins. Countries and Tasmania use representative coordinates rather than an assumed city visit; city pins use their actual locations. Photos and copy introduce each destination without claiming to be personal travel photos or trip accounts.

Edit `src/data/destinations.js` to maintain the list. Each destination has a unique `id`, a display `name`, `country`, `region`, `[longitude, latitude]` coordinates, local photo paths with alt text, and postcard copy. The helper generates 400px and 800px image paths from each image name. Use one of the seven continent names for `region`; counts are generated from the destination list and `isSampleJournal` is now `false`. Run `node scripts/optimize-destination-images.mjs` to regenerate the atlas's responsive image variants from the retained originals.

Nearby pins stay geographically anchored. When several pins overlap at the current zoom, a compact place chooser lets you select the intended destination. Region views and destination selection zoom closer; the map supports zooming up to 8×.

Map controls: use the plus/minus buttons or focus the map and press `+` / `-`; drag or use arrow keys while zoomed; press Home or the reset button to return to the world view. Pin buttons are keyboard accessible, and every place is also available in the postcard gallery. Mobile vertical swipes continue scrolling the page.

Country collections use `/destinations/<country-slug>`. Bali opens Indonesia, all five Australian places open Australia, and London opens the United Kingdom. Countries without posts show a themed empty state. The three Bali previews are marked “Coming soon” because full articles have not been added. Maintain their titles, images, country, excerpt, and status in `src/data/posts.js`. Once a real article and its working route exist, set its `href` to that URL and its `status` to `published` to enable the article link in its country collection.

The app uses normal page URLs. The included production server and Vite serve `/destinations`, the 12 known country collections, `/travel-tips`, `/budget-guides`, `/about-me`, `/subscribe`, and `/unsubscribe`, alongside the newsletter API. The production server returns 404 for unknown country routes. Run `npm run test:destinations` for pin selection, country navigation, post previews, and mobile map checks.

The homepage hero now uses `alpine-hero-v1`, a muted watercolor adaptation of the user's mountain-and-lake photograph. Its blue-grey peaks, pale turquoise lake, and subdued forest blend into the existing light paper palette. A small feathered haze behind the description keeps the text readable while leaving the mountain ridge visible; phones use a centered crop. The earlier coastal hero remains in the project. The exact edit prompt and asset details are in `HERO-ARTWORK.md`.

Regenerate the WebP assets after editing their PNG originals:

```sh
node scripts/optimize-images.mjs
```

See `ASSET-CREDITS.md` for asset sources and `DESIGN-NOTES.md` for the generated artwork prompts.
