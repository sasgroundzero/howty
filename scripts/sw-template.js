/**
 * Howty's offline worker, written into dist/sw.js by scripts/prerender.mjs with the build's file list.
 * After one visit every game works without a connection: the app files are saved up front, pages are
 * fetched fresh when online and fall back to the saved app when not.
 */
const VERSION = '__VERSION__'
const FILES = __FILES__
const CACHE = `howty-${VERSION}`

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(FILES)).then(() => self.skipWaiting()))
})
self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) => Promise.all(keys.filter((k) => k.startsWith('howty-') && k !== CACHE).map((k) => caches.delete(k)))).then(() => self.clients.claim()),
  )
})
self.addEventListener('fetch', (e) => {
  const req = e.request
  if (req.method !== 'GET') return
  const url = new URL(req.url)
  // pages: network first, so guides stay current; offline, or on a signal too weak to answer within
  // a few seconds (a basement, a cabin), the saved app opens and routes itself
  if (req.mode === 'navigate') {
    const saved = () => caches.match('/', { ignoreSearch: true, ignoreVary: true })
    const net = fetch(req)
    const slow = new Promise((ok) => setTimeout(ok, 4000)).then(saved)
    e.respondWith(
      Promise.race([net.catch(saved), slow.then((hit) => hit || net)]).then((res) => res || net),
    )
    return
  }
  // app files have content hashes in their names, and Google Fonts never change: cache first
  if (url.origin === location.origin || url.host.endsWith('gstatic.com') || url.host.endsWith('googleapis.com')) {
    e.respondWith(
      caches.match(req, { ignoreVary: true }).then(
        (hit) =>
          hit ||
          fetch(req).then((res) => {
            if (res.ok && (url.origin !== location.origin || url.pathname.startsWith('/assets/') || url.pathname.startsWith('/og/'))) {
              const copy = res.clone()
              caches.open(CACHE).then((c) => c.put(req, copy))
            }
            return res
          }),
      ),
    )
  }
})
