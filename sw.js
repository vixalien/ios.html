addEventListener('install', (event) => {
	if (swinstalled != true) {
		event.waitUntil(
			caches.open('v1').then((cache) => {
				return cache.addAll([
					'/',
					'/index.html',
					'/manifest.json',
					'/img/icons/vix.png',
				]);
			})
		);
		var swinstalled = true
	}
});

onmessage = e => { console.log(e) }

self.addEventListener('fetch', (event) => {
	event.respondWith(
		caches.match(event.request).then((resp) => {
			return resp || fetch(event.request).then((response) => {
				let responseClone = response.clone();
				caches.open('v1').then((cache) => {
					if (event.request.url.indexOf("data") > 0) {
						cache.put(event.request, responseClone);
					}
				});
				return response;
			});
		}).catch(() => {
			return caches.match('/img/icons/vix.png');
		})
	);
})

	self.addEventListener('activate', (event) => {
		var cacheKeeplist = ['v1'];
		event.waitUntil(
			caches.keys().then((keyList) => {
				return Promise.all(keyList.map((key) => {
					if (cacheKeeplist.indexOf(key) === -1) {
						return caches.delete(key);
					}
				}));
			})
		);
	});