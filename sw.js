const CACHE = 'islami-takvim-v1';
const ASSETS = [
  '/index.html',
  '/manifest.json'
];

// Kurulum: temel dosyaları önbelleğe al
self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE).then(cache => cache.addAll(ASSETS))
  );
  self.skipWaiting();
});

// Aktivasyon: eski önbellekleri temizle
self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// Fetch: önce ağdan dene, başarısız olursa önbellekten sun
self.addEventListener('fetch', e => {
  // API isteklerini (aladhan, alquran) cache'leme — her zaman canlı çek
  if (e.request.url.includes('api.aladhan') || e.request.url.includes('alquran.cloud')) {
    return;
  }
  e.respondWith(
    fetch(e.request)
      .then(res => {
        // Başarılı cevabı önbelleğe de yaz
        const clone = res.clone();
        caches.open(CACHE).then(cache => cache.put(e.request, clone));
        return res;
      })
      .catch(() => caches.match(e.request))
  );
});
