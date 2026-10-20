import { createHash } from 'node:crypto'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Proces w tle (poza projektem) co kilka minut zapisuje pliki źródłowe
// ponownie, z niezmienioną treścią. Watcher widzi wtedy "zmianę", a że
// index.html i main.jsx nie mają granicy HMR, Vite przeładowuje całą stronę.
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

// https://vite.dev/config/
export default defineConfig({
  server: {
    host: true,
    allowedHosts: true,
    hmr: {
      clientPort: 443,
    },
  },
  plugins: [react(), ignoreNoopWrites()],
  build: {
    rolldownOptions: {
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
})
