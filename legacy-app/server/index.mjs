import { createServer } from 'node:http'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { createApp } from './app.mjs'
import { createSubscriberStore, privateDataDirectory } from './newsletter.mjs'

const root = fileURLToPath(new URL('../', import.meta.url))
const port = Number(process.env.PORT || 3000)
const host = process.env.HOST || '127.0.0.1'
const siteUrl = process.env.SITE_URL

try {
  if (!Number.isInteger(port) || port < 1 || port > 65535) throw new Error('PORT must be between 1 and 65535.')
  if (process.env.NODE_ENV === 'production' && !siteUrl) throw new Error('Set SITE_URL to the public HTTPS origin for production.')
  if (siteUrl && (!/^https?:$/.test(new URL(siteUrl).protocol) || (process.env.NODE_ENV === 'production' && new URL(siteUrl).protocol !== 'https:'))) throw new Error('SITE_URL must use HTTP locally or HTTPS in production.')
  const directory = privateDataDirectory(root)
  let store
  const getStore = () => (store ||= createSubscriberStore(path.join(directory, 'newsletter.sqlite')))
  const server = createServer(createApp({ distDirectory: path.join(root, 'dist'), getStore, siteUrl, trustProxyIp: process.env.TRUST_PROXY_IP }))
  server.requestTimeout = 15_000
  server.headersTimeout = 10_000
  server.listen(port, host, () => console.log(`Wei’s Tiny Adventures listening on http://${host}:${port}`))
  server.on('error', () => { console.error('The server could not listen. Check HOST and PORT.'); process.exitCode = 1 })
  const close = () => server.close(() => { store?.close(); process.exit(0) })
  process.once('SIGINT', close)
  process.once('SIGTERM', close)
} catch (error) {
  console.error(error.message)
  process.exitCode = 1
}
