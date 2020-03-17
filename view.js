class nview {
	constructor(options) {
		var defaults = {
			// Root: Where to put newly created elements
			root: ".views",
			// Transite: Which elements need to transition or animation
			transite: [".view-body", ".view-title", ".view-lead-title"],
			// Path: which is the relative URL of this view
			path: "/views",
			// Content: What is the content of the view
			content: "",
			// Selector: Which is the selector for the view
			// Note: Selecor overrides content if it is valid and match an element
			selector: "",
			// Elem: the DOM element of the view
			elem: null,
			// Note: Either elem, selector or content  must exist
			// Note: when there is content supplied, a DOM element is created in root
			// Store: Store the element in localStorage as Cache
			store: true,
			// Superpose: Whether the new view has it's content directly
			superpose: false,
		}
		defaults = merge(defaults, options);
		for (var option in defaults) {
			this[option] = defaults[option];
		}
		this.path = new URL(this.path, location.href).href;
		this.compile();
		if(this.store) {
			this.cache();
		}
	}

	compile() {
		if(this.selector) {
			var selected = document.querySelector(this.selector);
			if(selected) {
				this.elem = selected;
				this.content = selected.innerHTML || selected.value;
			} else {
				throw new Error("The supplied selector matches nothing");
			}
		} else if(this.elem) {
			this.content = this.elem.innerHTML || this.elem.value;
		} else {
			var elem = document.createElement("div");
			var url = new URL(this.path, location).hash;
			if(!document.getElementById(url)) {
				elem.id = url;
				if (this.root && document.querySelector(this.root)) {
					this.elem = document.querySelector(this.root).appendChild(elem);
					if (this.superpose) {
						this.elem.outerHTML = this.content;
					} else {
						this.elem.innerHTML = this.content;
					}
					this.elem.classList.add("view");
				} else {
					throw new Error("The supplied root selector matches nothing");
				}
			} else {
				this.elem = document.getElementById(this.path);
				this.content = this.elem.innerHTML || this.elem.value;
			}
		}
	}

	cache() {
		var nv = JSON.parse(localStorage.getItem("nviews") || "{}");
		nv[this.path] = this;
		localStorage.setItem("nviews", JSON.stringify(nv));
	}

	revert() {
		var nv = JSON.parse(localStorage.getItem("nviews") || "{}");
		this.content = nv[this.path];
	}
}

class nviewstack {
	constructor(options) {
		var defaults = {
			// Slide: Pixels from the side edge where a User can start dragging
			slidestart: 40,
			// Slide Completion: How much must the User drag to initiate back or forward
			slidecompletion: 0.5
		}
		defaults = merge(defaults, options);
		for (var option in options) {
			if(option in defaults) {
				defaults[options] = options[option];
			}
		}
	}

	requestURL(url, isStatic = false) {
		a = new XMLHttpRequest();
		a.open("GET", url, false);
		a.send();
		var ur = new URL(url, location).hash;
		return new nview({ path: ur, content: a.responseText, store: isStatic, superpose: true });
	}

	resolveURL(url, isStatic = false) {
		var url = new URL(url, location.href);
		var nv = JSON.parse(localStorage.getItem("nviews") || "{}");
		var cache = nv[url.href];
		if (cache) {
			cache.selector = "";
			cache.elem = null;
			cache = new nview(cache);
			return cache;
		} else if (url.origin == location.origin && url.pathname == location.pathname && url.hash == location.hash) {
			return new nview({ path: location.href, content: document.body.innerHTML, store: false });
		} else {
			return this.requestURL(url.href, isStatic);
		}
		localStorage.setItem("nviews", JSON.stringify(nv));
	}

	init(view) {
		this.currentView = view;
		this.stack.push(view.path);
	}

	disableTransition(elem) {
		elem.style.transition = "00ms";
	}

	enableTransition(elem, duration = "300ms") {
		elem.style.transition = duration;
	}

	slideTransition(elem, ratio, fade = false) {
		elem.style.display = "block";
		var transform = "translate3d(" + (ratio * 100) + "%, 0, 0)";
		elem.style["-webkit-transform"] = transform;
		elem.style["-moz-transform"] = transform;
		elem.style["-ms-transform"] = transform;
		elem.style["-o-transform"] = transform;
		elem.style["transform"] = transform;
		elem.style["opacity"] = fade ? Math.abs(1 - ratio) : 1;
	}

	fadeTransition(elem, ratio) {
		elem.style.opacity = ratio;
	}

	slide(view, base, fade = false, transite = true) {
		var active = document.querySelector(".view.active");
		var view = doc
	}

	transitionTo() {

	}

	show(url) {
		var view = new nview({ path: url });
		if(!this.currentView!=view) {
			if(this.stack.includes(view.url)) {
				this.stack.splice(this.stack.findIndex(el => el == view.url), this.stack.length - 1);
			}
			this.stack.push(view.path);
			this.transitionTo(url);
		}
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