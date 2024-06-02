const CacheVersion = 5;
const CacheName = "shenmi_v" + CacheVersion;
const CacheList = [
	"/",
	"/index.html",
	"/assets/index.js",
	"/assets/index.css",
	"/images/bg.png",
	"/images/maho.gif"
]

this.addEventListener("install", e => {
	e.waitUntil(
		caches.open(CacheName).then(cache => {
			return cache.addAll(CacheList)
		}).then(this.skipWaiting)
	)
});

this.addEventListener("activate", e => {
	e.waitUntil(
		Promise.all([
			this.clients.claim(),
			caches.keys().then(cacheList => {
				return Promise.all(
					cacheList.map(cacheName => {
						if(cacheName !== CacheName){
							return caches.delete(cacheName)
						}
					})
				);
			})
		])
	);
});

this.addEventListener("fetch", e => {
	const url = new URL(e.request.url);
	if(url.origin !== self.origin){
		return
	}
	if(url.pathname.startsWith("/auth") || url.pathname.startsWith("/setting") || url.pathname.startsWith("/404") || url.pathname === "/"){
		let pageRequest = new Request("/");
		e.respondWith(caches.match(pageRequest).then(response => {
			return response || fetch(pageRequest)
		}))
	} else {
		e.respondWith(fetch(e.request).catch(() => {
			return caches.match(e.request)
		}));
	}
});
