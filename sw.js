/* Jejak Kopi — service worker
   Halaman & aset: cache dulu, perbarui di belakang layar.
   data.json: SELALU dari jaringan (jangan pernah sajikan versi basi). */

const VERSI = "jejak-kopi-v2";
const SHELL = [
  "./",
  "./index.html",
  "./negara.html",
  "./kopi.html",
  "./catat.html",
  "./telusur.html",
  "./pengaturan.html",
  "./assets/app.css",
  "./assets/app.js",
  "./assets/konfigurasi.js",
  "./assets/seed.js",
  "./assets/icon-192.png",
  "./assets/icon-512.png",
  "./manifest.webmanifest"
];

self.addEventListener("install", e => {
  e.waitUntil(
    caches.open(VERSI)
      .then(c => Promise.all(SHELL.map(u => c.add(u).catch(() => {}))))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", e => {
  e.waitUntil(
    caches.keys()
      .then(ks => Promise.all(ks.filter(k => k !== VERSI).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", e => {
  const req = e.request;
  if(req.method !== "GET") return;

  const url = new URL(req.url);

  // Jangan sentuh panggilan ke GitHub API
  if(url.hostname === "api.github.com") return;

  // data.json selalu dari jaringan; kalau luring, pakai cache terakhir
  if(url.pathname.endsWith("data.json")){
    e.respondWith(
      fetch(req, { cache: "no-store" })
        .then(r => { const c = r.clone(); caches.open(VERSI).then(x => x.put(req, c)); return r; })
        .catch(() => caches.match(req))
    );
    return;
  }

  // sisanya: cache dulu, lalu segarkan
  e.respondWith(
    caches.match(req).then(hit => {
      const net = fetch(req).then(r => {
        if(r && r.ok && url.origin === location.origin){
          const c = r.clone(); caches.open(VERSI).then(x => x.put(req, c));
        }
        return r;
      }).catch(() => hit);
      return hit || net;
    })
  );
});
