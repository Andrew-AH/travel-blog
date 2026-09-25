import sharp from 'sharp'

const photographs = [
  { name: 'ubud', source: 'public/images/destinations/ubud-original.jpg' },
  { name: 'kyoto', source: 'public/images/destinations/kyoto-original.jpg' },
  { name: 'lisbon', source: 'public/images/destinations/lisbon-original.jpg' },
  { name: 'sydney', source: 'public/images/destinations/sydney-original.jpg' },
  { name: 'polignano', source: 'public/images/blog-coast-v2.png' },
  { name: 'koh-tao', source: 'public/images/blog-hammock-v2.png' },
  ...['melbourne', 'tasmania', 'broken-hill', 'cairns', 'south-korea', 'greece', 'france', 'london', 'switzerland', 'malaysia', 'singapore', 'taiwan'].map(name => ({ name, source: `public/images/destinations/${name}-original.jpg` })),
]

for (const { name, source } of photographs) {
  for (const width of [400, 800]) {
    const suffix = width === 800 ? '' : `-${width}`
    await sharp(source).resize(width, width * .75, { fit: 'cover' }).webp({ quality: 77, effort: 6 }).toFile(`public/images/destinations/${name}${suffix}.webp`)
  }
  console.log(`Optimized ${name} at 400px and 800px`)
}
