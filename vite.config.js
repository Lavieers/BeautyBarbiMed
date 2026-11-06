import { createHash } from 'node:crypto'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import process from 'node:process'
import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import { normalizeSiteUrl, renderSeoHead, robotsTxt, sitemapXml } from './src/seo/site.js'

// Proces w tle (poza projektem) co kilka minut zapisuje pliki źródłowe
// ponownie, z niezmienioną treścią. Watcher widzi wtedy "zmianę", a że
// index.html nie ma granicy HMR, Vite przeładowuje całą stronę.
// Porównujemy skrót treści i przepuszczamy dalej tylko realne edycje.
function ignoreNoopWrites() {
  const hashes = new Map()
  const key = (file) => file.split('?')[0].replaceAll('\\', '/')

  const digest = (file) => {
    try {
      return createHash('sha1').update(readFileSync(file)).digest('hex')
    } catch {
      return null
    }
  }

  const remember = (file) => {
    const hash = digest(file)
    if (hash) hashes.set(key(file), hash)
  }

  return {
    name: 'ignore-noop-writes',
    apply: 'serve',

    // Skróty zbieramy przy serwowaniu plików, żeby pierwszy fałszywy zapis
    // po starcie serwera też został wyciszony.
    transform(_code, id) {
      remember(id)
      return null
    },

    transformIndexHtml(_html, ctx) {
      if (ctx.filename) remember(ctx.filename)
    },

    configureServer(server) {
      const { root, configFile, envDir } = server.config

      // Pliki spoza grafu modułów: ich zapis restartuje cały serwer, więc
      // muszą mieć skrót policzony od razu na starcie.
      remember(resolve(root, 'index.html'))
      if (configFile) remember(configFile)
      for (const name of ['.env', '.env.local', '.env.development', '.env.development.local']) {
        remember(resolve(envDir || root, name))
      }

      const emit = server.watcher.emit.bind(server.watcher)

      server.watcher.emit = (event, ...args) => {
        if (event === 'change' && typeof args[0] === 'string') {
          const file = args[0]
          const hash = digest(file)

          if (hash) {
            if (hashes.get(key(file)) === hash) return false
            hashes.set(key(file), hash)
          }
        }

        return emit(event, ...args)
      }
    },
  }
}

// Pierwszy skrypt strony jest zwykłym inline i nie może importować Reacta.
// Dopiero po narysowaniu zdjęcia hero dokładamy spakowany moduł aplikacji.
function lcpBootEntry() {
  return {
    name: 'lcp-boot-entry',
    transformIndexHtml: {
      order: 'post',
      handler(html, ctx) {
        if (!html.includes('__BOOT__')) return html
        if (ctx.server) return html.replaceAll('__BOOT__', '/src/bootstrap.jsx')

        const hero = Object.values(ctx.bundle ?? {}).find((item) => {
          if (item.type !== 'asset') return false
          const names = [item.fileName, item.name, item.originalFileName, ...(item.originalFileNames ?? [])]
          return names.some((name) => String(name).includes('hero-bg'))
        })
        if (hero?.fileName) html = html.replaceAll('/src/assets/hero-bg.webp', `/${hero.fileName}`)

        const chunk = Object.values(ctx.bundle ?? {}).find(
          (item) =>
            item.type === 'chunk' &&
            item.isEntry &&
            item.facadeModuleId?.replaceAll('\\', '/').endsWith('/src/bootstrap.jsx'),
        )
        if (!chunk) return html
        const fromMeta = chunk.viteMetadata?.importedCss ? [...chunk.viteMetadata.importedCss] : []
        const cssFiles = fromMeta.length
          ? fromMeta
          : Object.values(ctx.bundle ?? {})
              .filter((item) => item.type === 'asset' && item.fileName?.endsWith('.css') && item.fileName.includes('bootstrap'))
              .map((item) => item.fileName)
        const cssLinks = cssFiles
          .map((file) => `<link rel="stylesheet" href="/${file}" media="print" onload="this.media='all'" />`)
          .join('')
        return html.replaceAll('__BOOT__', `/${chunk.fileName}`).replace('</head>', `${cssLinks}\n  </head>`)
      },
    },
  }
}

// Opis, dane gabinetu, robots.txt i sitemap. Adres strony dokleja się z VITE_SITE_URL.
function siteSeo(siteUrl) {
  let root = process.cwd()
  let command = 'build'
  return {
    name: 'site-seo',
    configResolved(config) {
      root = config.root
      command = config.command
    },
    buildStart() {
      if (command === 'build' && !siteUrl) {
        console.warn(
          '\n[seo] Brak VITE_SITE_URL — canonical, og:url i sitemap.xml dołączą się po ustawieniu adresu strony.\n',
        )
      }
    },
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        const url = req.url?.split('?')[0]
        if (url === '/robots.txt') {
          res.setHeader('Content-Type', 'text/plain; charset=utf-8')
          res.end(robotsTxt(siteUrl))
          return
        }
        if (url === '/sitemap.xml') {
          const xml = sitemapXml(siteUrl)
          if (!xml) return next()
          res.setHeader('Content-Type', 'application/xml; charset=utf-8')
          res.end(xml)
          return
        }
        next()
      })
    },
    transformIndexHtml: {
      order: 'pre',
      handler(html, ctx) {
        const imagePath = ctx.server ? '/src/assets/hero-bg.webp' : '/og.webp'
        const tags = renderSeoHead({ siteUrl, imagePath })
        return html.replace('</head>', `    ${tags}\n  </head>`)
      },
    },
    generateBundle() {
      this.emitFile({
        type: 'asset',
        fileName: 'og.webp',
        source: readFileSync(resolve(root, 'src/assets/hero-bg.webp')),
      })
      this.emitFile({ type: 'asset', fileName: 'robots.txt', source: robotsTxt(siteUrl) })
      const xml = sitemapXml(siteUrl)
      if (xml) this.emitFile({ type: 'asset', fileName: 'sitemap.xml', source: xml })
    },
  }
}

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, import.meta.dirname, 'VITE_')
  const siteUrl = normalizeSiteUrl(process.env.VITE_SITE_URL || env.VITE_SITE_URL)

  return {
    server: {
      host: true,
      allowedHosts: true,
      hmr: {
        clientPort: 443,
      },
    },
    plugins: [react(), ignoreNoopWrites(), siteSeo(siteUrl), lcpBootEntry()],
    build: {
      rolldownOptions: {
        input: {
          index: resolve(import.meta.dirname, 'index.html'),
          bootstrap: resolve(import.meta.dirname, 'src/bootstrap.jsx'),
        },
        output: {
          // Biblioteki w osobnych plikach: ładują się równolegle i przy zmianie kodu
          // strony przeglądarka nie pobiera ich ponownie z cache.
          codeSplitting: {
            groups: [
              { name: 'vendor-react', test: /node_modules[\\/](react|react-dom|scheduler|react-router|react-router-dom)[\\/]/, priority: 30 },
              { name: 'vendor-motion', test: /node_modules[\\/](motion|motion-dom|motion-utils|framer-motion)[\\/]/, priority: 20 },
              { name: 'vendor-supabase', test: /node_modules[\\/]@supabase[\\/]/, priority: 10 },
            ],
          },
        },
      },
    },
  }
})
