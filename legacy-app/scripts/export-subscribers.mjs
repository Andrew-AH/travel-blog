import { randomBytes } from 'node:crypto'
import { mkdirSync, realpathSync, writeFileSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { DatabaseSync } from 'node:sqlite'
import { isWithin, privateDataDirectory } from '../server/newsletter.mjs'

export function csvCell(value) {
  let text = String(value ?? '')
  // Prevent spreadsheet formula execution, including after leading whitespace.
  if (/^[\s\u0000-\u001f]*[=+\-@]/.test(text) || /^[\t\r\n]/.test(text)) text = `'${text}`
  return `"${text.replaceAll('"', '""')}"`
}

export function exportSubscribers({ root, dataDirectory, siteUrl }) {
  if (!siteUrl) throw new Error('Set SITE_URL to your public website origin before exporting unsubscribe links.')
  const site = new URL(siteUrl)
  if (!['http:', 'https:'].includes(site.protocol) || site.username || site.password || site.pathname !== '/' || site.search || site.hash) throw new Error('SITE_URL must be an HTTP(S) origin, without credentials, a path, query, or fragment.')
  if (site.protocol !== 'https:' && !['localhost', '127.0.0.1', '[::1]'].includes(site.hostname)) throw new Error('Use HTTPS for the public SITE_URL.')
  const directory = privateDataDirectory(root, dataDirectory)
  const database = new DatabaseSync(path.join(directory, 'newsletter.sqlite'), { readOnly: true })
  let rows
  try {
    database.exec('PRAGMA busy_timeout = 5000')
    rows = database.prepare("SELECT email, first_name, interests, consent_text, consent_version, consent_at, unsubscribe_token FROM subscribers WHERE status = 'subscribed' AND consent = 1 ORDER BY id").all()
  } finally { database.close() }
  const headers = ['email', 'first_name', 'interests', 'consent_text', 'consent_version', 'consent_at', 'unsubscribe_url']
  const lines = [headers.map(csvCell).join(',')]
  for (const row of rows) {
    const unsubscribeUrl = new URL('/unsubscribe', site)
    unsubscribeUrl.hash = `token=${encodeURIComponent(row.unsubscribe_token)}`
    lines.push([row.email, row.first_name, JSON.parse(row.interests).join('; '), row.consent_text, row.consent_version, row.consent_at, unsubscribeUrl.href].map(csvCell).join(','))
  }
  const exportDirectory = path.join(directory, 'exports')
  mkdirSync(exportDirectory, { recursive: true, mode: 0o700 })
  if (!isWithin(directory, realpathSync(exportDirectory))) throw new Error('The export directory must remain inside the private data directory.')
  const file = path.join(exportDirectory, `subscribers-${new Date().toISOString().replaceAll(':', '-')}-${randomBytes(3).toString('hex')}.csv`)
  writeFileSync(file, `${lines.join('\r\n')}\r\n`, { flag: 'wx', mode: 0o600 })
  return { file, count: rows.length }
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try {
    const result = exportSubscribers({ root: fileURLToPath(new URL('../', import.meta.url)), dataDirectory: process.env.NEWSLETTER_DATA_DIR, siteUrl: process.env.SITE_URL })
    console.log(`Exported ${result.count} active subscriber(s) to ${result.file}`)
  } catch (error) {
    const message = error.code?.startsWith('ERR_SQLITE') ? 'The subscriber database could not be read. Collect a subscription first and check the private data directory.' : error.message
    console.error(`Newsletter export failed: ${message}`)
    process.exitCode = 1
  }
}
