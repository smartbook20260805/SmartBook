const CACHE_NAME = "smartbook-v2";

const FILES_TO_CACHE = [
    "./",
    "./index.html",
    "./transaction.html",
    "./report.html",
    "./css/style.css",
    "./js/app.js",
    "./manifest.json"
];

// 安裝
self.addEventListener("install", event => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => cache.addAll(FILES_TO_CACHE))
    );

    self.skipWaiting();
});

// 刪除舊快取
self.addEventListener("activate", event => {
    event.waitUntil(
        caches.keys().then(cacheNames =>
            Promise.all(
                cacheNames
                    .filter(name => name !== CACHE_NAME)
                    .map(name => caches.delete(name))
            )
        )
    );

    self.clients.claim();
});

// HTML、CSS、JS 優先抓最新版；離線時才使用快取
self.addEventListener("fetch", event => {

    if (event.request.method !== "GET") return;

    event.respondWith(
        fetch(event.request)
            .then(response => {

                const responseCopy = response.clone();

                caches.open(CACHE_NAME).then(cache => {
                    cache.put(event.request, responseCopy);
                });

                return response;
            })
            .catch(() => caches.match(event.request))
    );
});