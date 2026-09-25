import assert from 'node:assert/strict'
import { chromium } from '@playwright/test'

process.loadEnvFile()
const base = `http://localhost:${process.env.WP_PORT || 8080}`
const paths = ['', 'destinations/', 'destinations/indonesia/', 'travel-tips/', 'about-me/', 'budget-guides/', 'subscribe/', 'unsubscribe/']
const browser = await chromium.launch({ headless: true })
let checked = 0

async function swipeUp(session, x = 195, from = 650, to = 200) {
  await session.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: [{ x, y: from }] })
  for (let step = 1; step <= 12; step++) {
    await session.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x, y: from + (to - from) * step / 12 }] })
    await new Promise(resolve => setTimeout(resolve, 16))
  }
  await session.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] })
}

try {
  for (const mobile of [false, true]) {
    const context = await browser.newContext({ viewport: { width: mobile ? 390 : 1440, height: 800 }, isMobile: mobile, hasTouch: mobile })
    const page = await context.newPage()
    const session = mobile ? await context.newCDPSession(page) : null
    for (const path of paths) {
      await page.goto(`${base}/${path}`, { waitUntil: 'networkidle' })
      const scrollable = await page.evaluate(() => document.documentElement.scrollHeight > innerHeight + 50)
      if (scrollable) {
        if (mobile) await swipeUp(session)
        else { await page.mouse.move(700, 500); await page.mouse.wheel(0, 600) }
        await page.waitForFunction(() => scrollY > 50, { }, { timeout: 3000 }).catch(() => {
          throw new Error(`${mobile ? 'Touch' : 'Wheel'} scrolling is blocked on /${path}`)
        })
        checked++
      }
      assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), false, `Horizontal overflow on /${path}`)
    }
    // Scrolling must work even when the gesture starts directly over the map.
    await page.goto(`${base}/destinations/`, { waitUntil: 'networkidle' })
    const map = page.locator('.atlas-map').first()
    await map.scrollIntoViewIfNeeded()
    const box = await map.boundingBox()
    const before = await page.evaluate(() => scrollY)
    if (mobile) await swipeUp(session, box.x + box.width / 2, Math.min(700, box.y + box.height - 25), Math.max(80, box.y + 25))
    else { await map.hover(); await page.mouse.wheel(0, 400) }
    await page.waitForFunction(y => scrollY > y + 30, before, { timeout: 3000 })
    checked++
    if (mobile) {
      await page.goto(`${base}/travel-tips/`, { waitUntil: 'networkidle' })
      await page.getByRole('button', { name: 'Open menu' }).click()
      await page.getByRole('button', { name: 'Close menu' }).click()
      await swipeUp(session)
      await page.waitForFunction(() => scrollY > 50, {}, { timeout: 3000 })
      checked++
    }
    await context.close()
  }
  console.log(`Passed ${checked} wheel/touch scrolling checks, including the map and closing the mobile menu.`)
} finally {
  await browser.close()
}
