self.addEventListener('install', e => { self.skipWaiting(); });
self.addEventListener('activate', e => { self.clients.claim(); });
// Optional: cache-first for app shell (minimal for now)
self.addEventListener('fetch', e => {
  // You can customize caching here later
});
