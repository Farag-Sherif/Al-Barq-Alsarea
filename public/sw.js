const CACHE_VERSION = 'v17'
const SHELL_CACHE_NAME = `Ø§Ù„Ø¨Ø±Ù‚ Ø§Ù„Ø³Ø±ÙŠØ¹-shell-${CACHE_VERSION}`
const RUNTIME_CACHE_NAME = `Ø§Ù„Ø¨Ø±Ù‚ Ø§Ù„Ø³Ø±ÙŠØ¹-runtime-${CACHE_VERSION}`
const CACHE_PREFIX = 'Ø§Ù„Ø¨Ø±Ù‚ Ø§Ù„Ø³Ø±ÙŠØ¹-'
const OFFLINE_URL = '/offline.html'

const APP_SHELL_URLS = [
  '/',
  '/index.html',
  OFFLINE_URL,
  '/manifest.webmanifest',
  '/logo_icons/favicon.ico',
  '/logo_icons/favicon-16x16.png',
  '/logo_icons/favicon-32x32.png',
  '/pwa/icon-192-logo-v5.png',
  '/logo_icons/android-chrome-192x192.png',
  '/logo_icons/android-chrome-512x512.png',
  '/pwa/icon-512-logo-v5.png',
]

function isCacheableResponse(response) {
  return Boolean(response && response.ok && response.type !== 'opaque')
}

function isStaticAssetPath(pathname) {
  return (
    pathname.startsWith('/assets/') ||
    pathname.startsWith('/images/') ||
    pathname.startsWith('/logo_icons/') ||
    pathname.endsWith('.js') ||
    pathname.endsWith('.css') ||
    pathname.endsWith('.png') ||
    pathname.endsWith('.jpg') ||
    pathname.endsWith('.jpeg') ||
    pathname.endsWith('.webp') ||
    pathname.endsWith('.svg') ||
    pathname.endsWith('.ico') ||
    pathname.endsWith('.woff2') ||
    pathname.endsWith('.ttf')
  )
}

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches
      .open(SHELL_CACHE_NAME)
      .then((cache) => cache.addAll(APP_SHELL_URLS))
      .then(() => self.skipWaiting()),
  )
})

self.addEventListener('activate', (event) => {
  event.waitUntil(
    (async () => {
      const keys = await caches.keys()
      await Promise.all(
        keys
          .filter(
            (key) =>
              key.startsWith(CACHE_PREFIX) &&
              key !== SHELL_CACHE_NAME &&
              key !== RUNTIME_CACHE_NAME,
          )
          .map((key) => caches.delete(key)),
      )

      if (self.registration.navigationPreload) {
        await self.registration.navigationPreload.enable()
      }

      await self.clients.claim()
    })(),
  )
})

self.addEventListener('fetch', (event) => {
  const { request } = event
  if (request.method !== 'GET') return

  const url = new URL(request.url)
  if (url.origin !== self.location.origin) return

  if (request.mode === 'navigate') {
    event.respondWith(
      (async () => {
        try {
          const preloaded = await event.preloadResponse
          if (preloaded) return preloaded

          const networkResponse = await fetch(request)
          if (isCacheableResponse(networkResponse)) {
            const shellCache = await caches.open(SHELL_CACHE_NAME)
            await shellCache.put('/index.html', networkResponse.clone())
          }

          if (networkResponse.ok) {
            return networkResponse
          }

          // Some static hosts do not rewrite SPA routes; serve app shell on 404 navigations.
          const cachedIndex = await caches.match('/index.html')
          if (cachedIndex) return cachedIndex

          return networkResponse
        } catch {
          const cachedRequestedPage = await caches.match(request)
          if (cachedRequestedPage) return cachedRequestedPage

          const cachedIndex = await caches.match('/index.html')
          if (cachedIndex) return cachedIndex

          const offlineFallback = await caches.match(OFFLINE_URL)
          return (
            offlineFallback ||
            new Response('You are offline', {
              status: 503,
              headers: { 'Content-Type': 'text/plain; charset=utf-8' },
            })
          )
        }
      })(),
    )
    return
  }

  if (!isStaticAssetPath(url.pathname)) return

  event.respondWith(
    (async () => {
      const runtimeCache = await caches.open(RUNTIME_CACHE_NAME)
      const cached = await runtimeCache.match(request)

      const networkFetch = fetch(request)
        .then(async (response) => {
          if (isCacheableResponse(response)) {
            await runtimeCache.put(request, response.clone())
          }
          return response
        })
        .catch(() => null)

      if (cached) {
        // Stale-while-revalidate keeps UI fast while refreshing assets in background.
        void networkFetch
        return cached
      }

      const networkResponse = await networkFetch
      if (networkResponse) return networkResponse

      return new Response('', { status: 504, statusText: 'Gateway Timeout' })
    })(),
  )
})

self.addEventListener('message', (event) => {
  if (event.data === 'SKIP_WAITING') {
    self.skipWaiting()
  }
})

