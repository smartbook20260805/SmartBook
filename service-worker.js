const CACHE_NAME = "smartbook-v1";

const FILES_TO_CACHE = [
    "./",
    "./index.html",
    "./transaction.html",
    "./report.html",
    "./css/style.css",
    "./js/app.js",
    "./manifest.json"
];

// 安裝 Service Worker
self.addEventListener("install", event => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => cache.addAll(FILES_TO_CACHE))
    );

    self.skipWaiting();
});

// 啟用新版 Service Worker
self.addEventListener("activate", event => {
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames
                    .filter(name => name !== CACHE_NAME)
                    .map(name => caches.delete(name))
            );
        })
    );

    self.clients.claim();
});

// 優先讀取快取，沒有才連網
self.addEventListener("fetch", event => {
    event.respondWith(
        caches.match(event.request)
            .then(cachedResponse => {
                return cachedResponse || fetch(event.request);
            })
    );
});