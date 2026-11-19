const CACHE_NAME = 'lms-anticurang-man4hst-v3';
const PRECACHE_URLS = [
  '/',
  '/index.html',
  '/manifest.json'
];

// Menghasilkan gambar PNG valid secara dinamis untuk /icon-192.png dan /icon-512.png
function buildPngIconResponse(size) {
  if (typeof OffscreenCanvas !== 'undefined') {
    const canvas = new OffscreenCanvas(size, size);
    const ctx = canvas.getContext('2d');
    const grad = ctx.createLinearGradient(0, 0, size, size);
    grad.addColorStop(0, '#D86CFB');
    grad.addColorStop(1, '#8A56FF');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, size, size);

    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = Math.round(size * 0.06);
    ctx.lineJoin = 'round';
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(size * 0.5, size * 0.18);
    ctx.lineTo(size * 0.76, size * 0.28);
    ctx.lineTo(size * 0.76, size * 0.5);
    ctx.quadraticCurveTo(size * 0.76, size * 0.72, size * 0.5, size * 0.82);
    ctx.quadraticCurveTo(size * 0.24, size * 0.72, size * 0.24, size * 0.5);
    ctx.lineTo(size * 0.24, size * 0.28);
    ctx.closePath();
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(size * 0.39, size * 0.5);
    ctx.lineTo(size * 0.47, size * 0.58);
    ctx.lineTo(size * 0.62, size * 0.42);
    ctx.stroke();

    return canvas.convertToBlob({ type: 'image/png' }).then(function (blob) {
      return new Response(blob, {
        status: 200,
        headers: { 'Content-Type': 'image/png', 'Cache-Control': 'public, max-age=86400' }
      });
    });
  }
  const fallbackBase64 = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==';
  const binary = atob(fallbackBase64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return Promise.resolve(new Response(bytes, {
    status: 200,
    headers: { 'Content-Type': 'image/png' }
  }));
}

self.addEventListener('install', function (event) {
  event.waitUntil(
    caches.open(CACHE_NAME).then(function (cache) {
      return cache.addAll(PRECACHE_URLS).catch(function () {});
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', function (event) {
  event.waitUntil(
    caches.keys().then(function (cacheNames) {
      return Promise.all(
        cacheNames.map(function (name) {
          if (name !== CACHE_NAME) {
            return caches.delete(name);
          }
        })
      );
    }).then(function () {
      return self.clients.claim();
    })
  );
});

self.addEventListener('fetch', function (event) {
  if (event.request.method !== 'GET') return;
  const url = new URL(event.request.url);
  if (url.pathname === '/icon-192.png') {
    event.respondWith(buildPngIconResponse(192));
    return;
  }
  if (url.pathname === '/icon-512.png') {
    event.respondWith(buildPngIconResponse(512));
    return;
  }
  event.respondWith(
    fetch(event.request)
      .then(function (networkResponse) {
        if (networkResponse && networkResponse.status === 200 && networkResponse.type === 'basic') {
          var responseClone = networkResponse.clone();
          caches.open(CACHE_NAME).then(function (cache) {
            cache.put(event.request, responseClone);
          });
        }
        return networkResponse;
      })
      .catch(function () {
        return caches.match(event.request);
      })
  );
});
