# Design notes

Visual target: the supplied Weis Tiny Adventures homepage reference. The page uses a pale paper and coastal blue palette, a centered serif/script hero, a four-column values row, three journal cards, a watercolor whale shark, and a compact newsletter strip.

Design settings: variance 2 (preserve the reference's symmetry), motion 1 (static layout with subtle button hover feedback), density 4. Native CSS, React, Phosphor line icons, and self-hosted Cormorant Garamond, Allura, and Lato. Pill buttons and rounded article cards follow the reference. The light theme deliberately stays consistent with the supplied design.

Source photos and illustrations are replacements for the originals shown in the screenshot. The requested webpage is built from actual React components rather than flattened into an image.

## Generated artwork

Created using the built-in image-generation tool. Original PNG files and optimized WebP copies are stored in `public/images`. To regenerate WebP files after changing an original, run `node scripts/optimize-images.mjs`.

### heroPrompt

Create a background artwork asset ONLY for a coastal travel blog, almost square landscape 1536x1472 composition. No website UI, NO TEXT, no letters, no logos. Very close to an airy white-and-pale-blue watercolor travel scrapbook mixed with realistic Mediterranean coastal photography. Composition is critical: top 63 percent is almost entirely very pale cool white paper/sky negative space, center MUST remain very pale blank so dark text can be placed over it later. Bottom 26 percent is detailed sparkling turquoise blue sea, horizon at 75 percent height on the left, with hazy pale blue mountainous peninsula extending across horizon center to right. At far right edge, small bright white Greek island cubic houses with tiny deep-blue doors and shutters, on a rocky coastal cliff with a low stone walkway and 2 palms. These buildings extend upward to 52 percent height but remain in rightmost 20 percent only. Rocky dark tan craggy promontory runs diagonally from lower-right to center bottom. Realistic white sea foam at bottom. Water and buildings organically dissolve into pale paper using irregular watercolor edges near the extreme left and right margins and the very bottom edge. Subtle pale blue watercolor blooms at right edge halfway down and left edge 65 percent down. Two tiny realistic flying gray-and-white seagulls at x10 percent,y27 percent, subdued. Rest of upper sky is white, not blue. Calm bright natural daylight, fine textured watercolor paper very subtle, elegant and delicate, not cartoon, no strong grain. Bottom edge has irregular feathered white paper-like wave mask leaving water visible nearly to bottom center. This is ONLY a blank background for a website with ample clean white space, not a screenshot or mockup.

### heroFinalPrompt

Edit this travel blog background image. Keep the overall delicate white/light-blue watercolor paper style and Mediterranean coast composition but move almost ALL the sea and mountains much LOWER. The desired background is for dark centered website text placed in the top 68% and that text must be over near-white sky. Horizon on the left MUST be at 78% of the canvas height (currently about 62%, too high). The mountains must stay near that lower horizon and not extend above 71% height. The white cubic houses on the right should begin around 55% of the height and stay within the rightmost 20% of image. Sea fills only bottom 22%, rather than bottom 40%. Keep the two small seagulls on the far left at around 26% height. Upper 68% center should be airy almost blank cool-white paper. Keep top margin calm without strong blue watercolor patches: watercolor blooms should appear mostly at right edge 40-65% height and left edge 65-80% height. Turquoise sea slightly more muted and softer in contrast, like a pale sunlit Mediterranean travel editorial photo. Rocks and houses are on the far right at bottom. Preserve the organic feathered watercolor edges. No text, no UI. Nearly square composition, same dimensions.

### whalePrompt

Use case: illustration-story. Asset type: transparent website watercolor decoration. Generate one beautiful natural-history watercolor illustration of a whale shark, long elegant body swimming diagonally from bottom-left tail to upper-right head, dorsal view angled slightly showing its left side. Head at x seventy percent y fifteen percent; tail near x twenty percent y ninety percent. Entire animal visible, isolated on a truly transparent background, no rectangular backdrop, no sea, no floor, no lettering or logos. Dusty pale ocean-blue and slate-blue watercolor pigment with white spotted pattern and long subtle pale stripes typical of a whale shark. Delicate hand-painted granulation and gentle washes, fine details, almost vintage field guide marine illustration. Broad flat rounded head, tiny dark eye, expressive natural fins. Tall portrait 1024x1536 composition, generous transparent padding around creature. Soft desaturated marine blue palette made to decorate the left margin of an airy white and blue travel blog. Gentle artistic silhouette, not photorealistic, not 3D. MUST transparent background.

### washPrompt

Use case: illustration-story. Asset type: seamless-feeling background artwork for a travel journal webpage. A very pale cool blue watercolor paper wash, wide horizontal canvas 1536x1024. Extremely subtle pale icy blue and light cyan watercolor pigment pools only around the far LEFT and RIGHT borders, with delicate irregular granular watercolor edges and a few small dilute splatters. Large center 75 percent nearly blank cool off-white #f1f7f8, bottom edge fades to nearly white #fafaf9. The left edge has some loose organic pale watercolor blooms, the right edge likewise. It must look like real diluted watercolor on smooth fine paper, airy bright restrained, fine paper texture, no distinct objects or shapes. No people, no sea, no creatures, no buildings, NO TEXT, no border lines, no vignette. Background asset only. Overall very light, total contrast low.

## Reference refinement, 2026-09-24

Preserved the established 96u hero, 24u travel-values section, and three-card layout. Refined headline sizing, crest-wave alignment, card text spacing, and newsletter position. The four values, three articles, text, and navigation labels still follow the supplied screenshot. On phones, the existing readable two-column values and one-column article layout is retained.

The new hero and three article images follow the reference's photo compositions. Watercolor edges are softer, the shark has a curved side-view silhouette, and the abrupt boundary above Recent Adventures has been blended. Original assets are retained alongside the new versions. All artwork was created with the built-in image-generation tool, then encoded as WebP with the local sharp dependency.

# Coastal hero refinement

Created with the built-in image-generation tool on 2026-09-24, using `public/images/coastal-hero-v2.webp` as the edit target. The selected output is saved as `public/images/coastal-hero-v3.png` and optimized as `public/images/coastal-hero-v3.webp`.

The image sits at 90% of the desktop hero height, anchored to the bottom. A subtle CSS sky overlay softens the watercolor edges without changing the source artwork. On phones it fills the hero with a crop toward the right to retain the seaside buildings.

Exact generation prompt:

```text
Use case: compositing. Asset type: background image for coastal travel-blog homepage, no UI or text.
Edit the provided coastal background, preserving its nearly square 1280x1232 layout and enormous pale empty central sky. Make it much closer to a softly photographed Greek seaside coast blended into VERY SUBTLE watercolor paper.
Precise composition: left sea horizon at 75% of total image height, up from the existing 78%. Lower 25% realistic pale turquoise sea with gentle horizontal ripples and rolling white surf at the bottom. Pale distant blue mountainous peninsula should begin at x45%, y75%, rising to x76%, y66%; mountains are HAZY low-contrast simple distant silhouettes, not sharp detailed hills. The RIGHT side should have a broad large dark grey rocky cliff and a narrow horizontal seaside walkway with an iron railing, running from x64%,y86% to right edge at y75%. Three or four simple cubic white Greek seaside buildings with small cobalt blue shutters follow the coastline on the RIGHT, starting at x82%,y64%, largest building flush to right edge rising up to y52%. Two SHORT small palms beside the walkway at x73%,y73% and x79%,y72%. No towering palm rising above roofs. Rocky promontory reaches from right edge towards x59%,y89%.
The top 63% must be almost entirely pale cool off-white empty sky/paper, with two little realistic seagulls at upper left x9%,y27% and x12%,y30%; larger gull lower and nearer than smaller gull. Center must remain clean and white so navy text can be overlaid. Top edge and header area should have NO watercolor blooms. Pale blue watercolor edges ONLY around right border at 38%-61% height and left border at 64%-75%, very diffused understated pale pigment, 70% lighter than supplied image. Water should extend cleanly to left edge in lower portion. Bottom edge irregularly fades to off-white paper, but sea visible almost to bottom center.
Lighting: soft hazy daytime Mediterranean light, muted and atmospheric, realistic photographic coast, airy almost-white negative space. Not oversaturated, not crisp HDR. No letters, no logo, no website elements.
```

# Travel blog card image prompts

Generated with the built-in `image_gen` tool on 2026-09-24. Each image was generated separately as a new, standalone landscape image. No input image was edited. The supplied website screenshot informed the requested compositions.

Inspected the outputs for scenic composition, typography (signpost), subject, and unwanted additions. Generated PNGs are 1448 × 1086 pixels (4:3). WebP siblings are 800 × 600 pixels, encoded using the repository's `sharp` dependency at quality 85. Full original PNGs are retained in `public/images`.

## coast

- Original: `public/images/blog-coast-v2.png`
- Optimized: `public/images/blog-coast-v2.webp`

Exact generation prompt:

```text
Use case: photorealistic-natural. Asset type: travel blog card photograph, landscape 4:3. Primary request: a natural scenic travel editorial photograph of a Mediterranean coastal town along chalk-white rocky cliffs, matching a soft coastal travel journal. Composition: elevated eye-level scenic viewpoint looking across the coastline, distant small white stone town and green shrubs on chalk-white rocky cliffs on the LEFT, broad brilliant turquoise sea on the RIGHT. A rocky headland recedes from the lower left toward the upper center. Pale blue lightly cloudy sky fills the upper 25 percent. Wide scenic context, coastline across the middle-left, deep blue to turquoise sparkling sea filling lower right and right side. Natural daylight, realistic slightly soft travel photography with authentic detail. No people, text, logos, watermarks. Avoid overhead aerial cove views, closeup rocks, sunsets. Generate one standalone landscape image.
```

## signpost

- Original: `public/images/blog-signpost-v2.png`
- Optimized: `public/images/blog-signpost-v2.webp`

Exact generation prompt:

```text
Use case: photorealistic-natural. Asset type: travel blog card photograph, landscape 4:3. Primary request: natural travel editorial photograph of a coastal beach access boardwalk with wooden direction signs. Composition: wooden boardwalk with a simple wooden handrail starts at the bottom LEFT and runs through low green coastal shrubs toward a calm brilliant blue beach horizon at mid-height. A tall weathered dark wooden signpost stands in the RIGHT third, with four short weathered arrow boards stacked vertically reading exactly BEACH, HOSTEL, COFFEE, SUNSET in faded white painted uppercase letters. Each board has a simple single arrow point alternating directions. Post nearly reaches upper edge but remains fully visible. Pale blue lightly cloudy sky fills upper half, turquoise sea behind the signpost and coastal vegetation below. Wide scenic context, not closeup; sunny natural light and authentic wood grain, soft editorial travel photography. No people, logos or watermarks. Generate one standalone landscape image.
```

## hammock

- Original: `public/images/blog-hammock-v2.png`
- Optimized: `public/images/blog-hammock-v2.webp`

Exact generation prompt:

```text
Use case: photorealistic-natural. Asset type: travel blog card photograph, landscape 4:3. Primary request: natural travel editorial photograph of an empty dark rope hammock on a quiet tropical island beach. Composition: an empty dark woven rope hammock hangs diagonally between palm trees across the middle-lower part of the frame, sagging near center, tied on left at mid-height and to a palm just outside the right edge. Tall coconut palm trunks descend along the LEFT edge and long green palm fronds stretch across the TOP. Fine white sandy beach fills bottom third. Calm clear turquoise sea behind the hammock extends rightward; distant wooded island coastline recedes on the left. Pale blue clouded sky visible at upper right. Softly sunlit tropical island, gentle shadows, warm natural travel editorial photography. No people, furniture, tables, chairs, buildings, boats, text, logos or watermarks. Generate one standalone landscape image.
```

## Preview notes

Use the WebP siblings in the three recent-adventure cards. All images have a 4:3 aspect ratio and keep the main subjects within a centered crop. The signpost sits in the right third with all four text labels present. The hammock hangs across the lower half, with palms along the left and top. The coast image places the white rocky headland on the left and turquoise water on the right.


# Whale shark illustration

Generated using the built-in image_gen tool.

+Use case: illustration-story
Asset type: transparent decorative watercolor illustration for a coastal travel journal website.
Primary request: One complete graceful whale shark swimming diagonally toward the upper right. Genuine transparent background with preserved alpha, no white backdrop and no checkerboard graphic.
Subject and composition: Portrait 2:3 composition. Large broad rounded head in upper right, looking upper-right at a shallow diagonal angle, with a small dark eye visible on the right cheek. Three-quarter side/top perspective showing rounded cheek and pale belly edge as well as patterned back. Head should be broad and prominent. Its long body curves down and left into an elegant loose S, with a slimmer tapering tail sweeping near lower left, and two asymmetric flared fins. The entire shark fits inside frame with a little clear margin. Natural whale shark anatomy, gentle expression, asymmetrical organic swimming motion, not rigid, not straight overhead.
Style/medium: Light hand-painted watercolor on textured paper but all background removed. Naturally granular pigments, translucent washed edges, gentle dry-brush details, very subtle fine anatomy lines. Pale dusty ocean blue, misty blue-gray, soft white spotted dorsal pattern. Delicate coastal travel journal illustration, low contrast so it can sit behind editorial content. Only tiny eye gets dark. Body substantially lighter than dark blue, absolutely no black or navy blocks.
Constraints: Exactly one whale shark; no water, no ocean scene, no plants, no bubbles, no text, no border, no shadow. No solid background. No photorealism, no hard vector outline, no overly repetitive dots. Entire body and tail visible. 1024 by 1536 portrait image.


## Destination atlas, 2026-09-24

The Destinations page extends the coastal journal theme into an interactive blue-and-ivory atlas. It preserves the wave wordmark, self-hosted Cormorant Garamond/Allura/Lato typography, watercolor edges, blue line icons, and postal details. A real vector map sits beside a lightly rotated photo postcard; a gallery below provides a second way to open each story. Map and gallery share the region and text filters. Motion is limited to gentle hover feedback and a short postcard-content transition with reduced-motion support.

Destinations are sample entries until the owner supplies their visited places. The collection is centralized in src/data/destinations.js. Authentic locally hosted photography and public-domain Natural Earth geography make the page independent of remote map tiles and image services at runtime. See the project README for controls and content editing.

## Confirmed travel pins

Replaced the sample collection with the owner's 13 requested places, producing 9 countries across Asia, Oceania, and Europe. Country names remain at country level; representative map positions do not imply a particular city was visited. Nearby place selection and closer zoom preserve accurate geographic anchors for dense pins in Australia and Europe. Removed sample labels and used neutral destination descriptions rather than invented personal memories.
