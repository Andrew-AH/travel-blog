import assert from 'node:assert/strict'
import { once } from 'node:events'
import { mkdtempSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { createServer } from 'node:http'
import os from 'node:os'
import path from 'node:path'
import { DatabaseSync } from 'node:sqlite'
import test from 'node:test'
import { createServer as createViteServer } from 'vite'
import { createApp } from '../server/app.mjs'
import { newsletterPlugin } from '../server/vite-newsletter.mjs'
import { CONSENT_TEXT, CONSENT_VERSION, createRateLimiter, createSubscriberStore, privateDataDirectory, validateSubscription } from '../server/newsletter.mjs'
import { csvCell, exportSubscribers } from './export-subscribers.mjs'

const subscription = { email: 'traveller@example.com', firstName: 'Alex', interests: ['destinations', 'affordable-travel'], consent: true, website: '' }

async function fixture(t, options = {}) {
  const root = mkdtempSync(path.join(os.tmpdir(), 'travel-newsletter-test-'))
  const distDirectory = path.join(root, 'dist')
  const dataDirectory = path.join(root, 'data')
  mkdirSync(distDirectory)
  writeFileSync(path.join(distDirectory, 'index.html'), '<!doctype html><title>Travel blog</title>')
  writeFileSync(path.join(distDirectory, 'app.js'), 'window.test = true')
  const databasePath = path.join(dataDirectory, 'newsletter.sqlite')
  const store = createSubscriberStore(databasePath)
  const server = createServer(createApp({ distDirectory, getStore: () => store, rateLimiter: createRateLimiter({ limit: 100 }), ...options }))
  server.listen(0, '127.0.0.1')
  await once(server, 'listening')
  const url = `http://127.0.0.1:${server.address().port}`
  t.after(async () => {
    server.closeAllConnections()
    await new Promise(resolve => server.close(resolve))
    store.close()
    // Every test root is a fresh, resolved directory under the OS temp directory.
    assert.ok(root.startsWith(path.join(os.tmpdir(), 'travel-newsletter-test-')))
    rmSync(root, { recursive: true, force: true })
  })
  const post = (body = subscription, endpoint = 'subscribe', headers = {}) => fetch(`${url}/api/newsletter/${endpoint}`, { method: 'POST', headers: { 'Content-Type': 'application/json', Origin: url, ...headers }, body: JSON.stringify(body) })
  const rows = () => {
    const database = new DatabaseSync(databasePath, { readOnly: true })
    try { return database.prepare('SELECT * FROM subscribers ORDER BY id').all() } finally { database.close() }
  }
  return { root, dataDirectory, databasePath, store, url, post, rows }
}

test('validates consent, email, optional name, and the allowed interest values', () => {
  assert.equal(validateSubscription(subscription).value.email, subscription.email)
  assert.deepEqual(validateSubscription({ ...subscription, firstName: undefined, interests: [] }).value.interests, [])
  const result = validateSubscription({ email: 'not-an-email', firstName: 'a'.repeat(81), interests: ['other'], consent: false })
  assert.deepEqual(Object.keys(result.fieldErrors).sort(), ['consent', 'email', 'firstName', 'interests'])
  for (const email of ['a..b@example.com', '.a@example.com', 'a.@example.com', 'a@-example.com', 'a@example', 'a@exa_mple.com']) assert.ok(validateSubscription({ ...subscription, email }).fieldErrors.email)
  assert.ok(validateSubscription(null).fieldErrors)
})

test('persists normalized consent and returns indistinguishable duplicate responses without edits', async t => {
  const f = await fixture(t)
  const first = await f.post({ ...subscription, email: '  Traveller@EXAMPLE.com  ' })
  assert.equal(first.status, 200)
  assert.deepEqual(await first.json(), { ok: true })
  const row = f.rows()[0]
  assert.equal(row.email, 'traveller@example.com')
  assert.equal(row.first_name, 'Alex')
  assert.deepEqual(JSON.parse(row.interests), subscription.interests)
  assert.equal(row.consent, 1)
  assert.equal(row.consent_text, CONSENT_TEXT)
  assert.equal(row.consent_version, CONSENT_VERSION)
  assert.ok(Number.isFinite(Date.parse(row.consent_at)))
  assert.match(row.unsubscribe_token, /^[A-Za-z0-9_-]{43}$/)
  const duplicate = await f.post({ ...subscription, email: 'TRAVELLER@example.com', firstName: 'Someone else', interests: [] })
  assert.deepEqual(await duplicate.json(), { ok: true })
  assert.deepEqual(f.rows(), [row])
  const reopened = createSubscriberStore(f.databasePath)
  reopened.subscribe({ email: 'second@example.com', firstName: '', interests: [] })
  reopened.close()
  assert.equal(f.rows().length, 2)
})

test('rejects invalid input, honeypots, malformed JSON, large bodies, and foreign origins without collecting', async t => {
  const f = await fixture(t)
  const invalid = await f.post({ ...subscription, email: 'broken', consent: false })
  assert.equal(invalid.status, 400)
  assert.deepEqual(Object.keys((await invalid.json()).fieldErrors).sort(), ['consent', 'email'])
  assert.equal((await f.post({ ...subscription, website: 'spam.example' })).status, 400)
  assert.equal((await f.post(subscription, 'subscribe', { Origin: 'https://unrelated.example' })).status, 403)
  assert.equal((await f.post(subscription, 'subscribe', { 'Sec-Fetch-Site': 'cross-site' })).status, 403)
  assert.equal((await f.post({ ...subscription, firstName: 'x'.repeat(5000) })).status, 400)
  const malformed = await fetch(`${f.url}/api/newsletter/subscribe`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: '{' })
  assert.equal(malformed.status, 400)
  const wrongType = await fetch(`${f.url}/api/newsletter/subscribe`, { method: 'POST', body: JSON.stringify(subscription) })
  assert.equal(wrongType.status, 400)
  assert.equal(f.rows().length, 0)
})

test('rate limits repeated attempts and permits requests after the window expires', async t => {
  let now = 1000
  const limiter = createRateLimiter({ limit: 2, windowMs: 1000, now: () => now })
  const f = await fixture(t, { rateLimiter: limiter })
  assert.equal((await f.post()).status, 200)
  assert.equal((await f.post()).status, 200)
  const limited = await f.post()
  assert.equal(limited.status, 429)
  assert.equal(limited.headers.get('Retry-After'), '1')
  now = 2001
  assert.equal((await f.post()).status, 200)
  assert.equal(f.rows().length, 1)
})

test('requires POST for opt-out and excludes unsubscribed addresses from future exports', async t => {
  const f = await fixture(t)
  await f.post()
  const token = f.rows()[0].unsubscribe_token
  assert.equal((await fetch(`${f.url}/api/newsletter/unsubscribe?token=${token}`)).status, 405)
  assert.equal(f.rows()[0].status, 'subscribed')
  assert.equal((await f.post({ token: 'bad' }, 'unsubscribe')).status, 400)
  assert.equal((await f.post({ token }, 'unsubscribe')).status, 200)
  const row = f.rows()[0]
  assert.equal(row.status, 'unsubscribed')
  assert.ok(Number.isFinite(Date.parse(row.unsubscribed_at)))
  assert.equal((await f.post({ token }, 'unsubscribe')).status, 200)
  assert.deepEqual(f.rows()[0], row)
  const exported = exportSubscribers({ root: f.root, siteUrl: f.url })
  assert.equal(exported.count, 0)
  assert.ok(!readFileSync(exported.file, 'utf8').includes(subscription.email))
  assert.equal((await f.post({ ...subscription, firstName: 'New consent', interests: ['travel-tips'] })).status, 200)
  const rejoined = f.rows()[0]
  assert.equal(rejoined.status, 'subscribed')
  assert.equal(rejoined.first_name, 'New consent')
  assert.deepEqual(JSON.parse(rejoined.interests), ['travel-tips'])
  assert.notEqual(rejoined.unsubscribe_token, token)
  assert.equal(rejoined.unsubscribed_at, null)
  assert.equal((await f.post({ token }, 'unsubscribe')).status, 400)
  assert.equal(f.rows()[0].status, 'subscribed')
  assert.equal(exportSubscribers({ root: f.root, siteUrl: f.url }).count, 1)
})

test('ignores forwarded addresses unless one exact proxy IP is explicitly trusted', async t => {
  const direct = await fixture(t, { rateLimiter: createRateLimiter({ limit: 1 }) })
  assert.equal((await direct.post(subscription, 'subscribe', { 'X-Forwarded-For': '192.0.2.1' })).status, 200)
  assert.equal((await direct.post(subscription, 'subscribe', { 'X-Forwarded-For': '192.0.2.2' })).status, 429)
  const proxied = await fixture(t, { trustProxyIp: '127.0.0.1', rateLimiter: createRateLimiter({ limit: 1 }) })
  assert.equal((await proxied.post(subscription, 'subscribe', { 'X-Forwarded-For': '192.0.2.1' })).status, 200)
  assert.equal((await proxied.post(subscription, 'subscribe', { 'X-Forwarded-For': '203.0.113.1, 192.0.2.1' })).status, 429)
  assert.equal((await proxied.post(subscription, 'subscribe', { 'X-Forwarded-For': '192.0.2.2' })).status, 200)
})

test('fails honestly when storage is unavailable without leaking internal details', async t => {
  const f = await fixture(t, { getStore: () => { throw new Error('private database path and email') } })
  const response = await f.post()
  assert.equal(response.status, 503)
  const body = await response.json()
  assert.match(body.error, /try again/i)
  assert.ok(!JSON.stringify(body).includes('private database'))
})

test('serves known SPA routes and static files while keeping private and unknown paths inaccessible', async t => {
  const f = await fixture(t)
  await f.post()
  const exported = exportSubscribers({ root: f.root, siteUrl: f.url })
  for (const pathname of ['/', '/destinations', '/travel-tips', '/budget-guides', '/about-me', '/subscribe', '/unsubscribe']) {
    const response = await fetch(`${f.url}${pathname}`)
    assert.equal(response.status, 200, pathname)
    assert.match(await response.text(), /Travel blog/)
  }
  assert.equal((await fetch(`${f.url}/app.js`)).headers.get('Content-Type'), 'text/javascript; charset=utf-8')
  for (const pathname of ['/data/newsletter.sqlite', `/data/exports/${path.basename(exported.file)}`, '/.env', '/server/newsletter.mjs', '/api/newsletter/subscribers', '/unrecognised-route', '/%2e%2e/data/newsletter.sqlite', '/assets/..%5c..%5cdata/newsletter.sqlite']) assert.equal((await fetch(`${f.url}${pathname}`)).status, 404, pathname)
  assert.throws(() => privateDataDirectory(f.root, './public/subscribers'), /private directory/)
  assert.throws(() => privateDataDirectory(f.root, './dist/subscribers'), /private directory/)
  assert.throws(() => privateDataDirectory(f.root, '.'), /private directory/)
})

test('serves country collections on GET and HEAD with optional trailing slashes', async t => {
  const f = await fixture(t)
  const countrySlugs = ['indonesia', 'malaysia', 'singapore', 'taiwan', 'australia', 'south-korea', 'japan', 'italy', 'greece', 'france', 'united-kingdom', 'switzerland']
  for (const slug of countrySlugs) {
    for (const suffix of ['', '/']) {
      const pathname = `/destinations/${slug}${suffix}`
      for (const method of ['GET', 'HEAD']) {
        const response = await fetch(`${f.url}${pathname}`, { method })
        assert.equal(response.status, 200, `${method} ${pathname}`)
        assert.equal(response.headers.get('Content-Type'), 'text/html; charset=utf-8')
        assert.ok(Number(response.headers.get('Content-Length')) > 0)
        if (method === 'HEAD') assert.equal(await response.text(), '')
        else assert.match(await response.text(), /Travel blog/)
      }
    }
  }
})

test('keeps unknown countries and deeper collection paths outside the SPA allowlist', async t => {
  const f = await fixture(t)
  const paths = ['/destinations/unknown', '/destinations/unknown/', '/destinations/bali', '/destinations/Indonesia', '/destinations/indonesia/bali-12-day-guide', '/destinations/australia/sydney', '/destinations/indonesia//', '/destinations//indonesia', '/destinations/%2e%2e/data/newsletter.sqlite', '/destinations/indonesia%5c..%5c..%5cdata/newsletter.sqlite']
  for (const pathname of paths) {
    for (const method of ['GET', 'HEAD']) {
      const response = await fetch(`${f.url}${pathname}`, { method })
      assert.equal(response.status, 404, `${method} ${pathname}`)
      assert.equal(response.headers.get('Cache-Control'), 'no-store')
      if (method === 'HEAD') assert.equal(await response.text(), '')
      else assert.equal(await response.text(), 'Not found')
    }
  }
})

test('exports active consented contacts with safe CSV fields and private per-recipient opt-out links', async t => {
  const f = await fixture(t)
  await f.post({ ...subscription, email: '=formula@example.com', firstName: '+SUM(1,2)' })
  await f.post({ ...subscription, email: 'second@example.com', firstName: 'Alex "A", Smith' })
  const exported = exportSubscribers({ root: f.root, siteUrl: 'https://travel.example' })
  assert.equal(exported.count, 2)
  assert.ok(exported.file.startsWith(path.join(f.dataDirectory, 'exports')))
  const csv = readFileSync(exported.file, 'utf8')
  assert.ok(csv.includes('"\'=formula@example.com"'))
  assert.ok(csv.includes('"\'+SUM(1,2)"'))
  assert.ok(csv.includes('"Alex ""A"", Smith"'))
  assert.ok(csv.includes(`https://travel.example/unsubscribe#token=${f.rows()[0].unsubscribe_token}`))
  assert.throws(() => exportSubscribers({ root: f.root }), /SITE_URL/)
  assert.throws(() => exportSubscribers({ root: f.root, siteUrl: 'javascript:alert(1)' }), /SITE_URL/)
  assert.throws(() => exportSubscribers({ root: f.root, siteUrl: 'http://travel.example' }), /HTTPS/)
  assert.equal(csvCell('  =1+1'), '"\'  =1+1"')
})

test('Vite mounts the working API and blocks both root-relative and /@fs/ private data access', async t => {
  const f = await fixture(t)
  writeFileSync(path.join(f.root, 'index.html'), '<!doctype html><title>Vite test</title>')
  const vite = await createViteServer({ root: f.root, configFile: false, plugins: [newsletterPlugin(f.root, {})], server: { host: '127.0.0.1', port: 0 }, logLevel: 'silent' })
  try {
    await vite.listen()
    const origin = `http://127.0.0.1:${vite.httpServer.address().port}`
    const response = await fetch(`${origin}/api/newsletter/subscribe`, { method: 'POST', headers: { 'Content-Type': 'application/json', Origin: origin }, body: JSON.stringify(subscription) })
    assert.equal(response.status, 200)
    assert.equal(f.rows().length, 1)
    const exported = exportSubscribers({ root: f.root, siteUrl: origin })
    for (const pathname of ['/data/newsletter.sqlite', `/data/exports/${path.basename(exported.file)}`, `/@fs/${f.databasePath.replaceAll('\\', '/')}?raw`, `/@fs/${exported.file.replaceAll('\\', '/')}?raw`]) assert.equal((await fetch(`${origin}${pathname}`)).status, 404, pathname)
  } finally { await vite.close() }
})
