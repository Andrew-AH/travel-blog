# Alpine homepage hero

The user requested replacing the Greek coastal homepage background with their supplied photograph of a turquoise alpine lake, snowy mountain ridge, and conifer forest. This edit keeps the existing blue-and-paper visual language with restrained color and clear space for the homepage copy.

- Method: built-in `image_gen` image editing, using the user attachment as the edit target (`num_last_images_to_include: 1`). No CLI/API fallback was used.
- Generated source: `public/images/alpine-hero-v1.png`, 1278 × 1230 pixels.
- Served asset: `public/images/alpine-hero-v1.webp`, converted with Sharp at quality 85. No pixel retouching was performed outside imagegen.
- Homepage consumer: `src/App.jsx`, including the matching image preload.
- Presentation: `src/styles.css` fades the upper sky gently to white and uses a small feathered haze only behind the description. The mountain ridge stays visible, with a centered mobile crop and the existing wave transition. The stronger full-width fade was removed after the user requested clearer mountains.
- Regeneration: the WebP conversion is included in `scripts/optimize-images.mjs`.
- Earlier coastal assets remain available; the user-provided source image is in the conversation attachment. The new artwork is an AI-edited adaptation, not an unmodified photograph.

## Exact edit prompt

```text
Use case: style-transfer / compositing. Asset type: a single homepage hero BACKGROUND image for an airy pale-blue and ivory travel journal website. Edit target: the user's attached photograph of the turquoise alpine lake below snow-covered jagged mountains, with evergreen forest in the foreground. Adapt THIS photograph into a delicate photographic watercolor background, keeping the recognizable mountain ridgeline, grey rock faces, snowy peaks, turquoise lake and conifers. Do not substitute an unrelated mountain scene.
Composition for actual website: near-square canvas about 1280 x 1232. Extend the canvas upward into enormous clean off-white paper/sky negative space: the entire TOP 55-60% should be almost blank #fcfcfc, with no noticeable dark shapes, so a header, centered navy title, script subtitle and description can sit over it. Concentrate the recognizable mountain-and-lake landscape in the BOTTOM 40-45%. Peaks may rise gently into the lower right at 53% height, central mountain ridgeline around 64%, pale muted turquoise lake around 82%, with a little soft forest framing the bottom corners. Keep the center above 68% extremely light and calm. Crop excess foreground trees if needed, keep the lake clearly visible, and preserve plausible mountain geometry.
Style and color: soft real photography gently merging into watercolor paper, very restrained palette of powder blue, blue-grey rock, ivory snow and desaturated sage-grey trees. Remove strong cobalt sky entirely; sky dissolves to almost white. Reduce green and turquoise saturation substantially, lift dark forest shadows, soften rock contrast. Fine mountain detail should still be discernible in the bottom landscape. Subtle translucent pale-blue watercolor fringes at outer sides, beautifully irregular feathered edge fading into white along bottom. Calm, light, quiet, spacious; no heavy paint texture or oversaturated color. The landscape should feel like the softly photographed lower portion of a coastal watercolor travel site, now alpine. Keep top and central reading area nearly white rather than hazy grey. NO text, lettering, typography, logos, UI, buttons, borders, houses, seagulls or new objects. Background asset only, not a website screenshot.
```
