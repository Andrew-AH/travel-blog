# Asset credits

The current mountain-and-water brand emblem (`public/images/brand-mark.svg`) and matching favicon are original SVG artwork. The wordmark uses the site's licensed local fonts. Implementation and design notes are in `BRAND-NOTES.md`.

The active homepage hero (`alpine-hero-v1`) is a watercolor-style adaptation of the mountain-and-lake photograph supplied by the user, edited with the built-in image-generation tool. The generated PNG and optimized WebP are stored in `public/images/`. The source and exact edit prompt are documented in `HERO-ARTWORK.md`.

The previous coastal hero (`coastal-hero-v3`), original article photographs (`blog-coast-v2`, `blog-signpost-v2`, `blog-hammock-v2`), and watercolor shark (`whale-shark-v2`) are generated recreations of the supplied reference's imagery, created with the built-in image-generation tool. The watercolor background (`watercolor-wash`) is also generated. Each has a PNG original and a WebP derivative. The hammock image is also used on Travel Tips. Exact prompts are recorded in `DESIGN-NOTES.md`.

The homepage's Bali articles use the licensed Tegallalang rice-terrace image (credited in `public/images/destinations/CREDITS.md`), a licensed Bintang beer photograph, and the user's supplied Lovina sailing photograph. The article image sources and retained earlier images are documented in `public/images/articles/CREDITS.md`.

The earlier local photography is retained in the project but is no longer displayed:

- `public/images/blog-coast.jpg`: Francesco Ungaro, [Turquoise water laps a secluded sandy cove with cliffs](https://unsplash.com/photos/-btxhomSTp4), [Unsplash License](https://unsplash.com/license).
- `public/images/blog-signpost.jpg`: Alesia Kozik, [Brown Wooden Signage on Beach](https://www.pexels.com/photo/brown-wooden-signage-on-beach-7876329/), [Pexels License](https://www.pexels.com/license/).
- `public/images/blog-hammock.jpg`: Ákos Helgert, [Hammock at the Beach](https://www.pexels.com/photo/hammock-at-the-beach-8804731/), [Pexels License](https://www.pexels.com/license/).

Self-hosted fonts are downloaded from Google Fonts and supplied under their respective SIL Open Font Licenses, retained in `public/fonts`:

- [Allura](https://fonts.google.com/specimen/Allura), regular 400.
- [Cormorant Garamond](https://fonts.google.com/specimen/Cormorant+Garamond), medium 500, semibold 600, bold 700.
- [Lato](https://fonts.google.com/specimen/Lato), regular 400, bold 700, black 900.

The earlier coastal heroes (`coastal-hero`, `coastal-hero-v2`) and shark (`whale-shark`) were also created with the built-in image-generation tool and are retained for comparison.

## Destination atlas

The current atlas uses licensed Unsplash photographs for Bali, Melbourne, Tasmania, Sydney, Broken Hill, Cairns, South Korea, Japan, Greece, France, London, and Switzerland. Photographer names, source pages, download URLs, and license notes are in public/images/destinations/CREDITS.md, CREDITS-AUSTRALIA.md, and CREDITS-WORLD.md. Italy uses the generated coastal illustration described above and identifies it as illustrative in the postcard view. The earlier Lisbon and Thailand assets are retained but no longer displayed.

Map data is from Natural Earth via world-atlas; the source and redistribution license are recorded in src/data/MAP-SOURCES.md. The map is rendered locally using D3's Natural Earth projection.
