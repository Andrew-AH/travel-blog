import path from 'node:path'
import { createNewsletterMiddleware, createSubscriberStore, isWithin, privateDataDirectory } from './newsletter.mjs'

export function newsletterPlugin(root, environment) {
  const dataDirectory = privateDataDirectory(root, environment.NEWSLETTER_DATA_DIR)
  function attach(server) {
    let store
    const newsletter = createNewsletterMiddleware({
      getStore: () => (store ||= createSubscriberStore(path.join(dataDirectory, 'newsletter.sqlite'))),
      siteUrl: environment.SITE_URL,
      trustProxyIp: environment.TRUST_PROXY_IP,
    })
    server.middlewares.use((request, response, next) => {
      let pathname
      try { pathname = decodeURIComponent(new URL(request.url, 'http://localhost').pathname) } catch { response.writeHead(400); response.end(); return }
      const candidate = pathname.startsWith('/@fs/') ? path.resolve(pathname.slice(5)) : path.resolve(root, `.${pathname}`)
      // Runs before Vite's public-file and /@fs/ handlers, including ?raw requests.
      if (isWithin(dataDirectory, candidate) || /\.(?:sqlite(?:3)?(?:-\w+)?|db|csv)(?:$|\?)/i.test(pathname) || pathname.split('/').some(segment => segment === '.env' || segment === '.git')) {
        response.writeHead(404, { 'Cache-Control': 'no-store' }); response.end('Not found'); return
      }
      return newsletter(request, response, next)
    })
    server.httpServer?.once('close', () => store?.close())
  }
  return {
    name: 'private-newsletter-api',
    config: () => ({ server: { fs: { deny: ['.env', '.env.*', '*.{crt,pem}', '**/.git/**', '**/*.sqlite*', '**/*.db', '**/*.csv', `${dataDirectory.replaceAll('\\', '/')}/**`] } } }),
    configureServer: attach,
    configurePreviewServer: attach,
  }
}
