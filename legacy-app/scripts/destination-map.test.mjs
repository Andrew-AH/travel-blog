import assert from 'node:assert/strict'
import { after, before, test } from 'node:test'
import { fileURLToPath } from 'node:url'
import { chromium, expect } from '@playwright/test'
import { createServer } from 'vite'

const root = fileURLToPath(new URL('../', import.meta.url))
const places = {
  bali: { name: 'Bali', country: 'Indonesia', slug: 'indonesia', image: 'ubud', description: 'Rice terraces, palm-lined paths, and an island full of little discoveries. From the green interior to the coast, Bali has its own rhythm.' },
  japan: { name: 'Japan', country: 'Japan', slug: 'japan', image: 'kyoto' },
  'south-korea': { name: 'South Korea', country: 'South Korea', slug: 'south-korea', image: 'south-korea' },
  switzerland: { name: 'Switzerland', country: 'Switzerland', slug: 'switzerland', image: 'switzerland', description: 'Alpine peaks, clear lakes, and towns tucked between the hills. A country where the landscape is part of the journey.' },
  cairns: { name: 'Cairns', country: 'Australia', slug: 'australia', image: 'cairns' },
  italy: { name: 'Italy', country: 'Italy', slug: 'italy', image: 'polignano' },
}
let server
let browser
let origin

before(async () => {
  server = await createServer({ root, server: { host: '127.0.0.1', port: 0, hmr: false }, logLevel: 'silent' })
  await server.listen()
  origin = `http://127.0.0.1:${server.httpServer.address().port}`
  browser = await chromium.launch({ headless: true })
})

after(async () => {
  await browser?.close()
  await server?.close()
})

async function expectSelected(page, id) {
  const place = places[id]
  await expect(page.locator('.selected-postcard h2')).toHaveText(place.name)
  await expect(page.locator('.selected-postcard img')).toHaveAttribute('src', `/images/destinations/${place.image}.webp`)
  if (place.description) await expect(page.locator('.selected-description')).toHaveText(place.description)
  await expect(page.locator('.selected-postcard').getByRole('link', { name: `View all ${place.country} blogs`, exact: true })).toHaveAttribute('href', `/destinations/${place.slug}`)
  await expect(page.locator('.atlas-map-pin[aria-pressed="true"]')).toHaveCount(1)
  await expect(page.locator(`[data-place-id="${id}"]`)).toHaveAttribute('aria-pressed', 'true')
}

async function activate(locator, touch) {
  if (touch) await locator.tap()
  else await locator.click()
}

async function activatePin(page, id, touch) {
  await page.locator('.atlas-map').scrollIntoViewIfNeeded()
  if (!touch) await page.mouse.move(0, 0)
  const box = await page.locator(`[data-place-id="${id}"]`).boundingBox()
  assert.ok(box, `${id} has a visible pin`)
  const point = { x: box.x + box.width / 2, y: box.y + box.height / 2 }
  const hit = await page.evaluate(({ x, y }) => document.elementFromPoint(x, y)?.closest('[data-place-id]')?.dataset.placeId, point)
  assert.equal(hit, id, `The physical pointer must hit ${id}, not an overlapping pin`)
  // Real input is essential: DOM click() has detail=0 and bypassed the bug.
  if (touch) await page.touchscreen.tap(point.x, point.y)
  else await page.mouse.click(point.x, point.y)
}

for (const { label, width, touch } of [
  { label: 'desktop mouse', width: 1440, touch: false },
  { label: 'mobile touch', width: 390, touch: true },
]) {
  test(`${label}: pins immediately update the postcard and preserve map navigation`, { timeout: 45_000 }, async t => {
    const page = await browser.newPage({ viewport: { width, height: 1000 }, hasTouch: touch, isMobile: touch, reducedMotion: 'reduce' })
    t.after(() => page.close())
    page.setDefaultTimeout(4000)
    page.setDefaultNavigationTimeout(10_000)

    for (const id of ['japan', 'switzerland', 'cairns']) {
      await t.test(`first ${touch ? 'tap' : 'click'} selects ${places[id].name}`, async () => {
        await page.goto(`${origin}/destinations`)
        await expectSelected(page, 'bali')
        await activatePin(page, id, touch)
        await expectSelected(page, id)
        const nearby = page.getByRole('group', { name: 'Choose a nearby destination' })
        await expect(nearby).toBeVisible()
        await expect(nearby.getByRole('button', { name: places[id].name, exact: true })).toHaveAttribute('aria-pressed', 'true')
      })
    }

    // Reset closes the chooser and restores the world view without losing the postcard.
    await activate(page.getByRole('button', { name: 'Reset map view' }), touch)
    await expect(page.locator('.atlas-map')).toHaveAttribute('data-zoomed', 'false')
    await expect(page.locator('.atlas-map-nearby')).toHaveCount(0)
    await expectSelected(page, 'cairns')

    await activatePin(page, 'japan', touch)
    const nearby = page.getByRole('group', { name: 'Choose a nearby destination' })
    await expect(nearby.getByRole('button', { name: 'South Korea', exact: true })).toHaveAttribute('aria-pressed', 'false')
    await activate(nearby.getByRole('button', { name: 'South Korea', exact: true }), touch)
    await expectSelected(page, 'south-korea')
    await expect(nearby).toHaveCount(0)

    await activate(page.getByRole('group', { name: 'Filter destinations by region' }).getByRole('button', { name: 'Europe', exact: true }), touch)
    await expect(page.locator('.atlas-map-pin')).toHaveCount(5)
    await expectSelected(page, 'italy')
    const switzerland = page.locator('[data-place-id="switzerland"]')
    await switzerland.focus()
    await switzerland.press('Enter')
    await expectSelected(page, 'switzerland')
    await expect(page.locator('.atlas-map-nearby')).toHaveCount(0)

    await activate(page.locator('.selected-postcard').getByRole('link', { name: 'View all Switzerland blogs', exact: true }), touch)
    await expect(page).toHaveURL(`${origin}/destinations/switzerland`)
    await expect(page.getByRole('heading', { name: 'Switzerland', level: 1, exact: true })).toBeVisible()
    await expect(page.locator('.country-journal-empty')).toBeVisible()
    await expect(page.locator('.country-journal-empty')).toContainText('The Switzerland journal is still taking shape.')
    await expect(page.locator('.country-post-card')).toHaveCount(0)
    await expect(page.getByRole('dialog')).toHaveCount(0)

    await page.goBack()
    await expect(page).toHaveURL(`${origin}/destinations`)
    await expect(page.locator('.atlas-map-pin')).toHaveCount(16)
    await expect(page.locator('.atlas-map')).toHaveAttribute('data-zoomed', 'false')
    await expectSelected(page, 'bali')
    await activatePin(page, 'switzerland', touch)
    await expectSelected(page, 'switzerland')
  })

  test(`${label}: all continents filter destinations and empty regions recover`, { timeout: 30_000 }, async t => {
    const page = await browser.newPage({ viewport: { width, height: 1000 }, hasTouch: touch, isMobile: touch, reducedMotion: 'reduce' })
    t.after(() => page.close())
    page.setDefaultTimeout(4000)
    await page.goto(`${origin}/destinations`)
    const filters = page.getByRole('group', { name: 'Filter destinations by region' })
    const expectedOptions = ['All places', 'Africa', 'Antarctica', 'Asia', 'Europe', 'North America', 'Oceania', 'South America']
    await expect(filters.getByRole('button')).toHaveText(expectedOptions)
    await filters.scrollIntoViewIfNeeded()
    for (const option of expectedOptions) await expect(filters.getByRole('button', { name: option, exact: true })).toBeVisible()
    const filterBounds = await filters.getByRole('button').evaluateAll(buttons => buttons.map(button => {
      const { left, right } = button.getBoundingClientRect()
      return { label: button.textContent, left, right }
    }))
    for (const button of filterBounds) assert.ok(button.left >= -1 && button.right <= width + 1, `${button.label} must fit within the ${width}px viewport`)

    for (const [region, expectedPlaces] of [
      ['Asia', [['bali', 'Bali'], ['malaysia', 'Malaysia'], ['singapore', 'Singapore'], ['taiwan', 'Taiwan'], ['south-korea', 'South Korea'], ['japan', 'Japan']]],
      ['Europe', [['italy', 'Italy'], ['greece', 'Greece'], ['france', 'France'], ['london', 'London'], ['switzerland', 'Switzerland']]],
      ['Oceania', [['melbourne', 'Melbourne'], ['tasmania', 'Tasmania'], ['sydney', 'Sydney'], ['broken-hill', 'Broken Hill'], ['cairns', 'Cairns']]],
    ]) {
      const filter = filters.getByRole('button', { name: region, exact: true })
      await activate(filter, touch)
      await expect(filter).toHaveAttribute('aria-pressed', 'true')
      await expect(filters.locator('[aria-pressed="true"]')).toHaveCount(1)
      await expect(page.locator('.atlas-map-pin')).toHaveCount(expectedPlaces.length)
      assert.deepEqual(await page.locator('.atlas-map-pin').evaluateAll(pins => pins.map(pin => pin.dataset.placeId).sort()), expectedPlaces.map(([id]) => id).sort())
      await expect(page.locator('.atlas-destination-card h3')).toHaveText(expectedPlaces.map(([, name]) => name))
      await expect(page.locator('.atlas-no-results')).toHaveCount(0)
    }

    for (const region of ['Africa', 'Antarctica', 'North America', 'South America']) {
      const filter = filters.getByRole('button', { name: region, exact: true })
      await activate(filter, touch)
      await expect(filter).toHaveAttribute('aria-pressed', 'true')
      await expect(filters.locator('[aria-pressed="true"]')).toHaveCount(1)
      await expect(page.locator('.atlas-map-pin')).toHaveCount(0)
      await expect(page.locator('.atlas-destination-card')).toHaveCount(0)
      await expect(page.locator('.postcard-empty')).toBeVisible()
      await expect(page.locator('.postcard-empty h2')).toHaveText('Still on the wish list')
      await expect(page.locator('.postcard-empty')).toContainText(`No pins in ${region} just yet.`)
      await expect(page.locator('.selected-postcard .postcard-link')).toHaveCount(0)
      await expect(page.locator('.atlas-no-results h3')).toHaveText(`No postcards from ${region} just yet`)
      await activate(page.getByRole('button', { name: 'Show all places', exact: true }), touch)
      await expect(filters.getByRole('button', { name: 'All places', exact: true })).toHaveAttribute('aria-pressed', 'true')
      await expect(page.locator('.atlas-map-pin')).toHaveCount(16)
      await expect(page.locator('.atlas-destination-card')).toHaveCount(16)
      await expect(page.locator('.atlas-no-results')).toHaveCount(0)
      await expectSelected(page, 'bali')
    }
  })
}

test('place links open the right country and Bali lists the existing story previews', { timeout: 45_000 }, async t => {
  const page = await browser.newPage({ viewport: { width: 1440, height: 1000 }, reducedMotion: 'reduce' })
  t.after(() => page.close())
  page.setDefaultTimeout(4000)
  await page.goto(`${origin}/destinations`)

  for (const [name, country, slug] of [
    ['Bali', 'Indonesia', 'indonesia'],
    ['Melbourne', 'Australia', 'australia'],
    ['Tasmania', 'Australia', 'australia'],
    ['Sydney', 'Australia', 'australia'],
    ['Broken Hill', 'Australia', 'australia'],
    ['Cairns', 'Australia', 'australia'],
    ['London', 'United Kingdom', 'united-kingdom'],
    ['Malaysia', 'Malaysia', 'malaysia'],
    ['Singapore', 'Singapore', 'singapore'],
    ['Taiwan', 'Taiwan', 'taiwan'],
  ]) {
    await page.getByRole('searchbox', { name: 'Search destinations' }).fill(name)
    await expect(page.locator('.selected-postcard h2')).toHaveText(name)
    await expect(page.locator('.selected-postcard').getByRole('link', { name: `View all ${country} blogs`, exact: true })).toHaveAttribute('href', `/destinations/${slug}`)
    const card = page.locator('.atlas-destination-card').filter({ has: page.getByRole('heading', { name, exact: true }) })
    await expect(card).toHaveCount(1)
    await expect(card.locator('a.destination-photo-button')).toHaveAttribute('href', `/destinations/${slug}`)
    await expect(card.locator('h3 a')).toHaveAttribute('href', `/destinations/${slug}`)
  }

  await page.getByRole('searchbox', { name: 'Search destinations' }).fill('Bali')
  await page.locator('.atlas-destination-card h3 a').click()
  await expect(page).toHaveURL(`${origin}/destinations/indonesia`)
  await expect(page.getByRole('heading', { name: 'Indonesia', level: 1, exact: true })).toBeVisible()
  await expect(page.locator('.country-post-card')).toHaveCount(3)
  await expect(page.locator('.country-journal-empty')).toHaveCount(0)
  for (const [id, title] of [
    ['bali-12-day-guide', 'THE ULTIMATE 12 DAYS IN BALI'],
    ['bali-snacks', 'MUST TRY SNACKS IN BALI'],
    ['lovina-day-guide', 'THE PERFECT DAY IN LOVINA'],
  ]) {
    const card = page.locator(`.country-post-card#${id}`)
    await expect(card.getByRole('heading', { name: title, exact: true })).toBeVisible()
    await expect(card.getByText('Coming soon', { exact: true })).toBeVisible()
    await expect(card.getByRole('link')).toHaveCount(0)
  }
})
