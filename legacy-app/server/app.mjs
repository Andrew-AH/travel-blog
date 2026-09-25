import { createReadStream } from 'node:fs'
import { realpath, stat } from 'node:fs/promises'
import path from 'node:path'
import { createNewsletterMiddleware, isWithin } from './newsletter.mjs'
import { countryJournals } from '../src/data/countryJournals.js'

const ROUTES = new Set(['/', '/destinations', '/travel-tips', '/budget-guides', '/about-me', '/subscribe', '/unsubscribe', ...countryJournals.map(journal => `/destinations/${journal.slug}`)])
const MIME = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8', '.json': 'application/json', '.svg': 'image/svg+xml', '.webp': 'image/webp', '.avif': 'image/avif', '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.gif': 'image/gif', '.ico': 'image/x-icon', '.woff': 'font/woff', '.woff2': 'font/woff2', '.ttf': 'font/ttf', '.txt': 'text/plain; charset=utf-8', '.xml': 'application/xml' }

function notFound(response) {
  response.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8', 'Cache-Control': 'no-store' })
  response.end('Not found')
}

export function createStaticHandler(distDirectory) {
  return async (request, response) => {
    response.setHeader('X-Content-Type-Options', 'nosniff')
    response.setHeader('Referrer-Policy', 'no-referrer')
    if (!['GET', 'HEAD'].includes(request.method)) { response.writeHead(405, { Allow: 'GET, HEAD' }); response.end(); return }
    try {
      const pathname = decodeURIComponent(new URL(request.url, 'http://localhost').pathname)
      const parts = pathname.split('/')
      if (pathname.includes('\\') || pathname.includes('\0') || parts.some(part => part.startsWith('.')) || /\.(?:sqlite(?:3)?(?:-\w+)?|db|csv)$/i.test(pathname) || /^\/(?:data|server|scripts|src|node_modules)(?:\/|$)/i.test(pathname)) return notFound(response)
      const route = pathname.replace(/\/$/, '') || '/'
      const root = await realpath(distDirectory)
      const requested = path.resolve(root, ROUTES.has(route) ? 'index.html' : `.${pathname}`)
      if (!isWithin(root, requested)) return notFound(response)
      const file = await realpath(requested)
      if (!isWithin(root, file)) return notFound(response)
      const info = await stat(file)
      const type = MIME[path.extname(file).toLowerCase()]
      if (!info.isFile() || !type) return notFound(response)
      response.writeHead(200, { 'Content-Type': type, 'Content-Length': info.size, 'Cache-Control': pathname.startsWith('/assets/') ? 'public, max-age=31536000, immutable' : 'no-cache' })
      if (request.method === 'HEAD') return response.end()
      const stream = createReadStream(file)
      stream.on('error', () => response.destroy())
      response.on('close', () => stream.destroy())
      stream.pipe(response)
    } catch { if (!response.headersSent) notFound(response); else response.destroy() }
  }
}

export function createApp({ distDirectory, ...newsletterOptions }) {
  const files = createStaticHandler(distDirectory)
  const newsletter = createNewsletterMiddleware(newsletterOptions)
  return (request, response) => newsletter(request, response, () => {
    if (request.url.startsWith('/api/')) return notFound(response)
    return files(request, response)
  })
}
