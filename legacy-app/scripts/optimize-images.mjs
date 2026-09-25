import sharp from 'sharp'

// Preserve the original artwork; regenerate the WebP assets used by the page.
const assets = [
  { name: 'alpine-hero-v1', width: 1280, quality: 85 },
  { name: 'coastal-hero-v3', width: 1280, quality: 85 },
  { name: 'whale-shark-v2', width: 600, quality: 86 },
  { name: 'watercolor-wash', quality: 86 },
  { name: 'blog-coast-v2', width: 800, quality: 85 },
  { name: 'blog-signpost-v2', width: 800, quality: 85 },
  { name: 'blog-hammock-v2', width: 800, quality: 85 },
]

for (const { name, width, quality } of assets) {
  let image = sharp(`public/images/${name}.png`)
  if (width) image = image.resize({ width, withoutEnlargement: true })
  await image.webp({ quality, effort: 6 }).toFile(`public/images/${name}.webp`)
  console.log(`Optimized ${name}`)
}
