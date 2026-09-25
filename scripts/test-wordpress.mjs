import assert from 'node:assert/strict'
import { chromium } from '@playwright/test'
import { mkdir, writeFile } from 'node:fs/promises'

process.loadEnvFile()
const base = `http://localhost:${process.env.WP_PORT || 8080}`
const out = 'artifacts/docker-wordpress'
await mkdir(out, { recursive: true })
const browser = await chromium.launch({ headless: true })
const results = []
try {
  for (const width of [1440, 390]) {
    const page = await browser.newPage({ viewport: { width, height: 1000 } })
    for (const slug of ['', 'destinations/', 'destinations/indonesia/', 'about-me/', 'travel-tips/', 'budget-guides/', 'subscribe/', 'unsubscribe/']) {
      const errors = []
      const failed = []
      const onError = error => errors.push(error.message)
      const onResponse = response => { if (response.status() >= 400) failed.push(`${response.status()} ${response.url()}`) }
      page.on('pageerror', onError)
      page.on('response', onResponse)
      const response = await page.goto(`${base}/${slug}`, { waitUntil: 'networkidle' })
      await page.evaluate(async () => {
        await document.fonts.ready
        for (let y = 0; y < document.documentElement.scrollHeight; y += 700) {
          window.scrollTo(0, y)
          await new Promise(resolve => setTimeout(resolve, 35))
        }
        window.scrollTo(0, 0)
      })
      await page.waitForLoadState('networkidle')
      const metrics = await page.evaluate(() => ({
        title: document.title,
        overflow: document.documentElement.scrollWidth > innerWidth,
        brokenImages: [...document.images].filter(img => !img.complete || img.naturalWidth === 0).map(img => img.src),
      }))
      const result = { width, slug, status: response.status(), ...metrics, errors, failed }
      results.push(result)
      await page.screenshot({ path: `${out}/${slug.replaceAll('/', '-') || 'home'}-${width}.png`, fullPage: true })
      page.off('pageerror', onError)
      page.off('response', onResponse)
      assert.equal(result.status, 200, slug)
      assert.equal(result.overflow, false, `${slug}: horizontal overflow at ${width}`)
      assert.deepEqual([...errors, ...failed, ...metrics.brokenImages], [], `${slug}: browser errors`)
    }
    await page.goto(`${base}/destinations/`)
    await page.getByRole('searchbox', { name: 'Search destinations' }).fill('Bali')
    await page.waitForFunction(() => document.querySelectorAll('.atlas-destination-card').length === 1)
    assert.match(await page.locator('.atlas-destination-card').innerText(), /Bali/)
    await page.getByRole('button', { name: 'Clear search' }).click()
    await page.getByRole('button', { name: 'Africa', exact: true }).click()
    await page.getByRole('heading', { name: 'No postcards from Africa just yet' }).waitFor()
    await page.goto(`${base}/travel-tips/`)
    const documents = page.getByRole('checkbox', { name: /Travel documents/ })
    await documents.check()
    await page.reload()
    await documents.waitFor()
    assert.equal(await documents.isChecked(), true, 'Packing progress persists')
    await documents.uncheck()
    await page.locator('.tips-topic-buttons a[href="#money-tips"]').click()
    assert.equal(await page.locator('#money-tips').isVisible(), true)
    assert.equal(await page.locator('#before-you-go').isVisible(), false)
    if (width === 390) {
      await page.getByRole('button', { name: 'Open menu' }).click()
      await page.locator('.wp-block-navigation__responsive-container.is-menu-open').getByRole('link', { name: 'About me', exact: true }).click()
      await page.waitForURL('**/about-me/')
    }
    await page.close()
  }
  const admin = await browser.newPage()
  await admin.goto(`${base}/wp-login.php`)
  await admin.locator('#user_login').fill(process.env.WP_ADMIN_USER)
  await admin.locator('#user_pass').fill(process.env.WP_ADMIN_PASSWORD)
  await Promise.all([admin.waitForURL('**/wp-admin/'), admin.locator('#wp-submit').click()])
  await admin.goto(`${base}/wp-admin/plugin-install.php`)
  assert.equal(await admin.locator('#search-plugins').count(), 1, 'Plugin installer is available')
  results.push({ mapSearch: true, continentFilter: true, packingPersistence: true, tipTabs: true, mobileNavigation: true, adminLogin: true, pluginInstaller: true })
  console.log('WordPress checks passed: 16 page/viewport checks, map search/filter, packing persistence, tips, mobile navigation, admin login and plugin installer.')
} finally {
  await writeFile(`${out}/checks.json`, JSON.stringify(results, null, 2))
  await browser.close()
}
