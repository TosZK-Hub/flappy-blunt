/* Shell cache so Add to Home Screen can open after one visit. Network first. */
const CACHE = "flappy-blunt-shell-4";
const SHELL = [
  "./",
  "./index.html",
  "./manifest.webmanifest",
  "./css/style.css",
  "./js/feel.js",
  "./js/physics.js",
  "./js/audio.js",
  "./js/meta.js",
  "./js/render.js",
  "./js/game.js",
  "./assets/icon-180.png",
  "./assets/icon-192.png",
  "./assets/icon-512.png",
  "./assets/icon-1024.png",
  "./assets/splash.png",
  "./assets/Anton-Regular.ttf",
  "./assets/LilitaOne-Regular.ttf",
];

self.addEventListener("install", function (event) {
  event.waitUntil(
    caches.open(CACHE).then(function (cache) {
      return cache.addAll(SHELL);
    })
  );
  self.skipWaiting();
});

self.addEventListener("activate", function (event) {
  event.waitUntil(
    caches.keys().then(function (keys) {
      return Promise.all(
        keys.filter(function (key) {
          return key !== CACHE;
        }).map(function (key) {
          return caches.delete(key);
        })
      );
    }).then(function () {
      return self.clients.claim();
    })
  );
});

self.addEventListener("fetch", function (event) {
  const req = event.request;
  if (req.method !== "GET") return;
  event.respondWith(
    fetch(req)
      .then(function (res) {
        const copy = res.clone();
        caches.open(CACHE).then(function (cache) {
          cache.put(req, copy);
        });
        return res;
      })
      .catch(function () {
        return caches.match(req);
      })
  );
});
