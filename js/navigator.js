class router {
	defaults = {
		root: location.href,
		baseClass: "html",
		viewClass: "body",
		pushState: true,
		hash: false,
	}

	stack = []

	constructor(options) {
		this.options = merge(this.defaults, options);
		this.supported = {
			pushState: typeof history.pushState == "function",
			hash: typeof location.hash == "string",
		}
		this.init();
	}

	init() {
		this.base = document.querySelector(this.options.baseClass);
		this.view = this.base.querySelector(this.options.viewClass);
		if (!(this.base&&this.view)) {
			throw new Error("Invalid selectors passed");
		}
		if(this.options.pushState) {
			window.onpopstate = function(e) {
				// If there's an nrouter, fetch the url and show it,
				// Note!: this is improvision
				if(typeof a == "function" && a.prototype) {
					a.show(location.href, { nothing: true });
				}
			}
		}
	}

	anim = {
		translate: function(elem, willTransition = true) {
			// TODO: customise 300 to any other microseconds
			var transition = willTransition ? "all " + 300 + "ms" : "none";
			elem.style.webkitTransition = transition;
			elem.style.mozTransition = transition;
			elem.style.oTransition = transition;
			elem.style.msTransition = transition;
			elem.style.transition = transition;
		},
		create: function(content, model = document.createElement("div")) {
			// Create an element, then transite it to there
			var elem = document.createElement("div");
			elem.classList = model.classList;
			elem.innerHTML = content;
			// Save the bounding rect
			elem.rect = model.getBoundingClientRect();
			// Set the position as 0
			this.host(elem);
			this.fade(elem, 0);
			elem.style.top = elem.rect.top;
			elem.style.left = "100vw";
			elem.style.position = "absolute";
			elem.style.bottom = elem.rect.bottom;
			elem.style.right = elem.rect.right;
			elem.style.width = elem.rect.width;
			elem.style.height = elem.rect.height;
			this.translate(elem);
			a = this;
			setTimeout(function() {
				a.fade(elem, 1);
				elem.style.left = elem.rect.left;
			}, 100);
			
			return elem;
		},
		offset: function(elem) {
			// Make an elem to go to the left
			elem.style.position = "absolute";
			elem.style.left = "100vw";
			elem.style.top = "0";
			elem.style.bottom = "0";
			elem.style.right = "100%";
		},
		host: function(elem, base = document.body) {
			// Make the body not to show overflow
			base.style.overflowX = "hidden";
			// Append the elem to the document or body
			base.appendChild(elem);
		},
		slide: function(elem, ratio = 0) {
			// Slide an element into view
			elem.style.left = "calc(" + (ratio * 100) + "% + " + elem.rect.top + ")";
			elem.style.right = "calc(" + (-(ratio * 100)) + "% + " + elem.rect.top + ")";
		},
		fade: function(elem, ratio = 0) {
			// Fade an element out of view
			elem.style.opacity = ratio;
		}
	}

	showContent(content, push = true) {
		var elem = this.anim.create(content, this.view);
		this.anim.host(elem, this.base);
		this.anim.translate(elem);
		this.anim.offset(elem);
		a = this;

		setTimeout(
			function() {
				a.anim.slide(elem);
			}, 10
		);
		this.anim.slide(this.view, -1);

		setTimeout(
			function() {
				a.view.display = "none";
				a.view.remove();
				a.view = elem;
				// Fetch and evaluate scripts
				// We've tried to put execScripts in _this_, but if done,
				// it will eval the scripts in strict mode, which is bad.
				execScripts(a.view);
			}, 300+ 10
		);
	}

	fetch(url) {
		var a = new XMLHttpRequest;
		a.open("GET", url, false);
		a.send();
		return a.responseText;
	}

	show(url , options = {}) {
		url = new URL(url, this.options.root);
		options = merge(this.options, options);
		if(options.nothing) {
			// Do nothing
		} else if (options.pushState && this.supported.pushState) {
			// Push it to the stack
			history.pushState({}, null, url);
		} else if (options.hash && this.supported.hash) {
			// Update the hash only
			// Replace the hash
			url = url.replace(location.origin + location.pathname);
			this.location.hash = url;
		} else {
			// Update this the good old way
			location = url;
		}
		// Fetch stuff and update it
		var response = this.fetch(url);
		this.showContent(response);
	}
}

var isObject = x =>
	Object(x) === x

var merge = (left = {}, right = {}) =>
	Object.entries(right)
		.reduce
		((acc, [k, v]) =>
			isObject(v) && isObject(left[k])
				? { ...acc, [k]: merge(left[k], v) }
				: { ...acc, [k]: v }
			, left
		);

function execScripts(base = document) {
	// Fetch remote scripts
	var withsrc = base.querySelectorAll("script[src]");
	console.log("The srcs to fetch are", withsrc);
	for (var i = 0; i < withsrc.length; i++) {
		console.log("Fetching this", withsrc[i]);
		withsrc[i].innerHTML = router.prototype.fetch(withsrc[i].getAttribute("src"));
		console.log("Fetched this", withsrc[i]);
		withsrc[i].removeAttribute("src");
	}
	// Execute all scripts
	var src = base.querySelectorAll("script");
	console.log("The",src.length - 1," srcs to eval are", src);
	for (var i = 0; i < src.length; i++) {
		console.log(i, "Evaling this", src[i], "innerHTML is", src[i].innerHTML);
		eval(src[i].textContent);
		console.log(i,"Evaled this", src[i]);
	}
}