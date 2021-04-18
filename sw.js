addEventListener('install', (event) => {
	if (swinstalled != true) {
		event.waitUntil(
			caches.open('v1.1').then((cache) => {
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

function fromCache(request) {
	return caches.open(CACHE).then(function (cache) {
		return cache.match(request).then(function (matching) {
			return matching || Promise.reject('no-match');
		});
	});
}

function toCache(request, response) {
	return caches.open(CACHE).then(function (cache) {
		if (response.status < 200 || response.status > 399) return "not stored"
		// transform text requests into Requests
		request = new Request(request)
		request.headers.set('--sw-content-type', response.headers.get('content-type'))
		return cache.put(request, response.clone()).then(() => response);
	});
}

function update(request) {
	return fetch(request).then(function (response) {
		return toCache(request, response);
	})
	// failed to fetch, probably offline, do nothing
	.catch(() => {});
}

self.addEventListener('fetch', (event) => {
	event.respondWith(fromCache(event.request).catch(() => fetch(event.request)))
	event.waitUntil(update(req))
})

	self.addEventListener('activate', (event) => {
		var cacheKeeplist = ['v1.1'];
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