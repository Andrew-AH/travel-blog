import { randomBytes } from 'node:crypto'
import { mkdirSync, openSync, closeSync, realpathSync } from 'node:fs'
import path from 'node:path'
import { isIP } from 'node:net'
import { DatabaseSync } from 'node:sqlite'

export const CONSENT_VERSION = '2026-09-24'
export const CONSENT_TEXT = 'I agree to receive destination ideas, travel tips, and affordable travel inspiration from Wei’s Tiny Adventures. I can unsubscribe at any time.'
export const INTERESTS = ['destinations', 'travel-tips', 'affordable-travel']
const MAX_BODY_BYTES = 4096
const TOKEN_PATTERN = /^[A-Za-z0-9_-]{43}$/

export function isWithin(directory, candidate) {
  const relative = path.relative(directory, candidate)
  return relative === '' || (!relative.startsWith(`..${path.sep}`) && relative !== '..' && !path.isAbsolute(relative))
}

function physicalPath(location) {
  try { return realpathSync(location) } catch (error) {
    if (error.code !== 'ENOENT') throw error
    const parent = path.dirname(location)
    if (parent === location) return location
    return path.join(physicalPath(parent), path.basename(location))
  }
}

export function privateDataDirectory(root, configured = process.env.NEWSLETTER_DATA_DIR) {
  const directory = physicalPath(path.resolve(root, configured || 'data'))
  const publicDirectories = ['public', 'dist', 'src', 'node_modules'].map(name => physicalPath(path.join(root, name)))
  if (directory === physicalPath(root) || publicDirectories.some(publicDirectory => isWithin(publicDirectory, directory) || isWithin(directory, publicDirectory))) {
    throw new Error('NEWSLETTER_DATA_DIR must be a private directory outside public, dist, src, and node_modules.')
  }
  return directory
}

export function createSubscriberStore(databasePath) {
  mkdirSync(path.dirname(databasePath), { recursive: true, mode: 0o700 })
  // Create with private permissions before SQLite opens the file (POSIX hosts).
  closeSync(openSync(databasePath, 'a', 0o600))
  const database = new DatabaseSync(databasePath)
  try {
    database.exec(`
      PRAGMA busy_timeout = 5000;
      PRAGMA journal_mode = WAL;
      CREATE TABLE IF NOT EXISTS subscribers (
        id INTEGER PRIMARY KEY,
        email TEXT NOT NULL COLLATE NOCASE UNIQUE,
        first_name TEXT NOT NULL,
        interests TEXT NOT NULL,
        consent INTEGER NOT NULL CHECK (consent = 1),
        consent_text TEXT NOT NULL,
        consent_version TEXT NOT NULL,
        consent_at TEXT NOT NULL,
        status TEXT NOT NULL CHECK (status IN ('subscribed', 'unsubscribed')),
        unsubscribe_token TEXT NOT NULL UNIQUE,
        unsubscribed_at TEXT
      ) STRICT;
    `)
    const insert = database.prepare(`INSERT INTO subscribers
      (email, first_name, interests, consent, consent_text, consent_version, consent_at, status, unsubscribe_token)
      VALUES (?, ?, ?, 1, ?, ?, ?, 'subscribed', ?)
      ON CONFLICT(email) DO UPDATE SET
        first_name = excluded.first_name, interests = excluded.interests,
        consent_text = excluded.consent_text, consent_version = excluded.consent_version,
        consent_at = excluded.consent_at, status = 'subscribed',
        unsubscribe_token = excluded.unsubscribe_token, unsubscribed_at = NULL
      WHERE subscribers.status = 'unsubscribed'`)
    const unsubscribe = database.prepare("UPDATE subscribers SET status = 'unsubscribed', unsubscribed_at = ? WHERE unsubscribe_token = ? AND status = 'subscribed'")
    const knownToken = database.prepare('SELECT 1 FROM subscribers WHERE unsubscribe_token = ?')
    return {
      subscribe(input) {
        insert.run(input.email, input.firstName, JSON.stringify(input.interests), CONSENT_TEXT, CONSENT_VERSION, new Date().toISOString(), randomBytes(32).toString('base64url'))
      },
      unsubscribe(token) {
        const result = unsubscribe.run(new Date().toISOString(), token)
        return result.changes > 0 || Boolean(knownToken.get(token))
      },
      close() { database.close() },
    }
  } catch (error) {
    database.close()
    throw error
  }
}

export function validateSubscription(body) {
  const fieldErrors = {}
  if (!body || typeof body !== 'object' || Array.isArray(body)) return { fieldErrors: { email: 'Enter a valid email address.' } }
  const email = typeof body.email === 'string' ? body.email.trim().toLowerCase() : ''
  const [local, domain] = email.split('@')
  if (email.length > 254 || !local || local.length > 64 || !domain || !/^[a-z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-z0-9](?:[a-z0-9-]*[a-z0-9])?(?:\.[a-z0-9](?:[a-z0-9-]*[a-z0-9])?)+$/.test(email) || local.startsWith('.') || local.endsWith('.') || local.includes('..')) {
    fieldErrors.email = 'Enter a valid email address.'
  }
  const firstName = typeof body.firstName === 'string' ? body.firstName.trim() : ''
  if ((body.firstName !== undefined && typeof body.firstName !== 'string') || firstName.length > 80 || /[\u0000-\u001f\u007f]/.test(firstName)) fieldErrors.firstName = 'Use a first name of 80 characters or fewer.'
  if (!Array.isArray(body.interests) || body.interests.length > INTERESTS.length || body.interests.some(interest => !INTERESTS.includes(interest))) fieldErrors.interests = 'Choose from the travel interests shown.'
  if (body.consent !== true) fieldErrors.consent = 'Please agree to receive the newsletter.'
  return Object.keys(fieldErrors).length ? { fieldErrors } : { value: { email, firstName, interests: [...new Set(body.interests)] } }
}

function json(response, status, value, headers = {}) {
  response.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff', ...headers })
  response.end(JSON.stringify(value))
}

function readJson(request) {
  return new Promise((resolve, reject) => {
    const chunks = []
    let size = 0
    let failed = false
    const fail = () => { if (!failed) { failed = true; reject(new Error('Invalid body')) } }
    request.on('data', chunk => {
      size += chunk.length
      if (size > MAX_BODY_BYTES) { chunks.length = 0; fail(); return }
      if (!failed) chunks.push(chunk)
    })
    request.on('end', () => {
      if (failed) return
      try { resolve(JSON.parse(Buffer.concat(chunks).toString('utf8'))) } catch { fail() }
    })
    request.on('error', fail)
    request.on('aborted', fail)
  })
}

export function createRateLimiter({ limit = 10, windowMs = 15 * 60 * 1000, maxEntries = 10_000, now = Date.now } = {}) {
  const attempts = new Map()
  return key => {
    const time = now()
    // Bounded memory; never evict a live entry to make room for an attacker.
    if (attempts.size >= maxEntries) for (const [address, entry] of attempts) if (entry.reset <= time) attempts.delete(address)
    let entry = attempts.get(key)
    if (!entry || entry.reset <= time) {
      if (!entry && attempts.size >= maxEntries) return Math.ceil(windowMs / 1000)
      entry = { count: 0, reset: time + windowMs }
      attempts.set(key, entry)
    }
    entry.count += 1
    return entry.count > limit ? Math.max(1, Math.ceil((entry.reset - time) / 1000)) : 0
  }
}

function allowedOrigin(request, siteUrl) {
  if (request.headers['sec-fetch-site'] === 'cross-site') return false
  const origin = request.headers.origin
  // Non-browser integrations must also use JSON; browsers send Origin on POST.
  if (!origin) return true
  try {
    const expected = siteUrl ? new URL(siteUrl).origin : new URL(`${request.socket.encrypted ? 'https' : 'http'}://${request.headers.host}`).origin
    return origin === expected
  } catch { return false }
}

export function createNewsletterMiddleware({ getStore, siteUrl, trustProxyIp, rateLimiter = createRateLimiter() }) {
  if (trustProxyIp && !isIP(trustProxyIp)) throw new Error('TRUST_PROXY_IP must be the exact IP address of your reverse proxy.')
  const normalizeIp = address => address?.replace(/^::ffff:/, '')
  return async function newsletter(request, response, next = () => json(response, 404, { error: 'Not found.' })) {
    let pathname
    try { pathname = new URL(request.url, 'http://localhost').pathname } catch { return json(response, 400, { error: 'Invalid request.' }) }
    if (!pathname.startsWith('/api/newsletter')) return next()
    if (!['/api/newsletter/subscribe', '/api/newsletter/unsubscribe'].includes(pathname)) return json(response, 404, { error: 'Not found.' })
    if (request.method !== 'POST') return json(response, 405, { error: 'Use POST for this request.' }, { Allow: 'POST' })
    if (!allowedOrigin(request, siteUrl)) return json(response, 403, { error: 'Please submit this form from our website.' })
    let address = normalizeIp(request.socket.remoteAddress) || 'unknown'
    if (trustProxyIp && address === normalizeIp(trustProxyIp)) {
      // The rightmost value is the client seen by this one explicitly trusted proxy.
      const forwarded = String(request.headers['x-forwarded-for'] || '').split(',').at(-1).trim()
      if (isIP(forwarded)) address = normalizeIp(forwarded)
    }
    const retryAfter = rateLimiter(`${address}:${pathname}`)
    if (retryAfter) return json(response, 429, { error: 'Too many attempts. Please try again in a little while.' }, { 'Retry-After': String(retryAfter) })
    if (!/^application\/json(?:\s*;|$)/i.test(request.headers['content-type'] || '') || Number(request.headers['content-length']) > MAX_BODY_BYTES) return json(response, 400, { error: 'Please send a small, valid JSON request.' })
    let body
    try { body = await readJson(request) } catch { return json(response, 400, { error: 'Please send a small, valid JSON request.' }) }
    if (pathname.endsWith('/subscribe')) {
      if (body && typeof body === 'object' && body.website !== undefined && (typeof body.website !== 'string' || body.website.trim() !== '')) return json(response, 400, { error: 'We couldn’t accept this submission. Please try again.' })
      const validation = validateSubscription(body)
      if (validation.fieldErrors) return json(response, 400, { error: 'Please check the highlighted fields.', fieldErrors: validation.fieldErrors })
      try { getStore().subscribe(validation.value) } catch { return json(response, 503, { error: 'We couldn’t save your subscription. Please try again shortly.' }) }
    } else {
      if (!body || typeof body.token !== 'string' || !TOKEN_PATTERN.test(body.token)) return json(response, 400, { error: 'This unsubscribe link is incomplete. Please use the link in your newsletter.' })
      try {
        if (!getStore().unsubscribe(body.token)) return json(response, 400, { error: 'This unsubscribe link is no longer valid. Please use the link in your latest newsletter.' })
      } catch { return json(response, 503, { error: 'We couldn’t update your subscription. Please try again shortly.' }) }
    }
    return json(response, 200, { ok: true })
  }
}
