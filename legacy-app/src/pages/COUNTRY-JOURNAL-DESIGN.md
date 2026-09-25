# Country journals

Reading this as an addition to a personal travel blog, preserving the existing pale-blue watercolor journal and postcard style with native CSS.

DESIGN_VARIANCE: 2, MOTION_INTENSITY: 1, VISUAL_DENSITY: 3. These match the established atlas: the blue wave logo, Cormorant Garamond headings, Allura script, Lato body copy, pale paper, navy text, and muted blue accents. Existing fonts, local photos, and Phosphor icons are reused.

The map continues to select a photo and short-description postcard. Its action and gallery links now lead to `/destinations/<country>`, grouping places by their existing country value. Each page has a back-to-map link, country heading, scenic postcard, and country-specific post list or empty state. The three existing Bali titles appear as coming-soon previews under Indonesia because no article bodies exist yet; no personal trip accounts or publication dates are invented.

The homepage and country pages share `src/data/posts.js`. Planned posts have no active article links on collection pages. Published posts can provide their own real `href`. Country metadata and production route validation share `src/data/countryJournals.js`.

Pre-flight scope: preserve shared header/logo and atlas selection; check mouse, touch and keyboard navigation, all country mappings, responsive layouts, valid direct/reloaded URLs, empty/unknown countries, readable focus states and honest content status. No new animation or dependencies.

Verified: production build; 9 destination browser tests; 12 server tests including all country routes and unknown-path rejection. Inspected country page screenshots at desktop and phone sizes. Production browser checks passed at 1440, 768, 390, and 320px with no broken images, cropped main content, page errors, or horizontal overflow. Direct loads, refreshes, keyboard link activation, and homepage preview anchors work. The generated Italy cover remains identified as an illustration.
