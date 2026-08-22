// =====================================
// SmartBook Service Worker
// V6.0 PWA
// =====================================

const CACHE_NAME = "smartbook-v6-cache-v1";

const APP_FILES = [
    "./",
    "./index.html",
    "./transaction.html",
    "./setting.html",
    "./report.html",
    "./manifest.json",

    "./css/style.css",
    "./css/mobile.css",

    "./js/app.js",
    "./js/storage.js",
    "./js/firebase.js",
    "./js/budget.js",
    "./js/category.js",
    "./js/quick-entry.js",
    "./js/dashboard.js",
    "./js/trend-chart.js",
    "./js/calendar.js",
    "./js/utils.js",

    "./icons/smartbook-192.png",
    "./icons/smartbook-512.png"
];


// =====================================
// 安裝
// =====================================

self.addEventListener(
    "install",
    function (event) {

        event.waitUntil(

            caches
                .open(CACHE_NAME)
                .then(function (cache) {

                    console.log(
                        "SmartBook Service Worker：建立快取"
                    );

                    return cache.addAll(APP_FILES);

                })

        );

        self.skipWaiting();

    }
);


// =====================================
// 啟用
// =====================================

self.addEventListener(
    "activate",
    function (event) {

        event.waitUntil(

            caches
                .keys()
                .then(function (cacheNames) {

                    return Promise.all(

                        cacheNames.map(
                            function (cacheName) {

                                if (
                                    cacheName !==
                                    CACHE_NAME
                                ) {

                                    return caches.delete(
                                        cacheName
                                    );

                                }

                            }
                        )

                    );

                })

        );

        self.clients.claim();

    }
);


// =====================================
// 網路請求
// =====================================

self.addEventListener(
    "fetch",
    function (event) {

        if (
            event.request.method !==
            "GET"
        ) {
            return;
        }

        event.respondWith(

            fetch(event.request)

                .then(function (response) {

                    const responseClone =
                        response.clone();

                    caches
                        .open(CACHE_NAME)
                        .then(function (cache) {

                            cache.put(
                                event.request,
                                responseClone
                            );

                        });

                    return response;

                })

                .catch(function () {

                    return caches.match(
                        event.request
                    );

                })

        );

    }
);