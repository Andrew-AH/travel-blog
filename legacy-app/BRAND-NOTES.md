# Weis Tiny Adventures logo

Restored the previous branding at the user's request: the outlined blue breaking wave beside a two-line wordmark, with “Weis Tiny” in bold Cormorant Garamond and “Adventures” in Allura script. The earlier wave paths, colours, typography, and responsive sizing were recovered from the project history and checked against `artifacts/logo-before-header.png`.

The shared `Brand` component and `src/components/brand.css` apply the restored identity across the site. The logo remains a home link with an explicit accessible name and a decorative image with empty alt text.

- Emblem: `public/images/brand-mark.svg`.
- Matching browser icon: `public/favicon.svg`.
- Wordmark: existing self-hosted Cormorant Garamond 700 and Allura 400 fonts.
- Method: native SVG and CSS; no raster generation or additional dependencies.

The mountain emblem and large “Wei’s” redesign have been replaced. Earlier redesign screenshots remain in `artifacts/logo-new-*` for history; restored screenshots use `artifacts/restored-brand-*`.
