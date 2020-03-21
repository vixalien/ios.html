class nrouter {
	defaults = {
		root: location.href,
		baseClass: "html",
		viewClass: "body",
		pushState: true,
		hash: false,
		currentContent: "",
		start: "data:text/html;base64,PGgxPkxvYWRpbmc8L2gxPjxzcGFuPlBsZWFzZSB3YWl0Li4uPC9zcGFuPg",
	}

	constructor(options) {
		console.log(options);
		this.options = merge(this.defaults, options);
		this.supported = {
			pushState: typeof history.pushState == "function",
			hash: typeof location.hash == "string",
		}
		this.init();
	}

	stack = []

	init() {
		// Pop states
		window.onpopstate = e => { console.log(e); this.backLook(location.href) };
		// Get all the elements by their selectors
		this.view = document.querySelector(this.options.viewClass);
		this.base = document.querySelector(this.options.baseClass);
		// Get the current URL
		if (this.base.tagName == "IFRAME") {
			this.current = this.base.src;
		} else {
			this.current = this.innerHTML;
		}
		if (!(this.base && this.view)) {
			throw new Error("Invalid selectors passed");
		}
		// Let's call this reinit
		this.reinit = this.init;
		this.init = undefined;
		NHook.call(this);
		this.dispatchEvent("create");
	}

	start(hash = false) {
		var url = new URL(this.options.start, location).href;
		this.stack.push({ url, method: "start" });
		this.show(this.options.start, { nothing: true });
		if(hash == true && this.options.hash && location.hash.length>1) {
			this.show(location.hash.replace("#",""), {nothing: true})
		}
	}

	fetch(url) {
		var a = new XMLHttpRequest;
		a.open("GET", url, false);
		a.send();
		return a.responseText;
	}

	navigate(url, options = {}) {
		console.log("Started navig");
		url = new URL(url, this.options.root).href;
		options = merge(this.options, options);
		console.log("Options", options);
		// What navigation to do?
		if (options.nothing) {
			// Do nothing
		} else if (options.hash && this.supported.hash) {
			// Update the hash only
			// Find the relative URL according to this
			this.stack.push({ url, method: "hash" });
			url = url.replace(location.origin + location.pathname, "");
			location.hash = "#" + url;
		} else if (options.pushState && this.supported.pushState) {
			// Push it to the stack
			history.pushState({}, null, url);
			this.stack.push({ url, method: "push" });
		}  else {
			// Update this the good old way
			location = url;
			// You won't see this
			this.stack.push({ url, method: "oldest" });
		}
	}

	backLook(url) {
		console.log("backLook", url);
		var hash = false;
		url = new URL(url, location);
		// Check if it is a hash
		if(url.hash.length>1) {
			var h = url.hash.replace("#", "");
			var newurl = new URL(h, location);
			var id = this.stack.findIndex(e => (e.url == url && e.method == "hash"));
			if(id>-1) {
				hash = true;
				this.stack.splice(id, this.stack.length - 1);
				this.show(newurl.href, { nothing: true });
			}
		}
		if(!hash) {
			var id = this.stack.findIndex(e => (e.url == url && e.method == "push"));
			if (id > -1) {
				this.stack.splice(id, this.stack.length - 1);
				this.show(url.href, { nothing: true });
			}
		} else {
			this.show(url.href, { nothing: true });
		}
	}

	show(url, options = {}) {
		url = new URL(url, this.options.root).href;
		options = merge(this.options, options);

		//
		console.log("showing", url);

		var content = "";
		// Content provided?
		if(options.content) {
			content = options.content;
		} else {
			content = this.fetch(url);
		}

		// How to render content?
		if(this.base.tagName=="IFRAME") {
			this.currentContent = this.base.src = url;
		} else {
			this.currentContent = this.base.innerHTML = content;
			// We've tried to put execScripts in this, but if done,
			// it will eval the scripts in strict mode, which is bad.
			execScripts(this.base);
		}

		// Navigate
		this.navigate(url, options);
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
	for (var i = 0; i < withsrc.length; i++) {
		withsrc[i].innerHTML = NUtils.fetch(withsrc[i].getAttribute("src"));
		withsrc[i].removeAttribute("src");
	}
	// Execute all scripts
	var src = base.querySelectorAll("script");
	for (var i = 0; i < src.length; i++) {
		eval(src[i].innerHTML);
	}
}

var NUtils = {
	fetch:  function(url) {
		var a = new XMLHttpRequest;
		a.open("GET", url, false);
		a.send();
		return a.responseText;
	}
}

function NEvent(name, eventInitDict = {}) {
	// Constructs a new event
	// Making new events with Event fails because you can't actually edit eventInitDict
	if (typeof name == "undefined") {
		// Checks that the name parameter is present
		throw new TypeError("Failed to construct '" + this.name + "': 1 argument required, but only 0 present.");
	} else if (typeof eventInitDict != "object") {
		// Checks that the second parameter is an object
		throw new TypeError("Failed to construct '" + this.name + "': parameter 2 ('eventInitDict') is not an object.");
	}
	// Initialize the event with some stuff, then set the second param, then override some props
	name = name.toString();
	ev = {
		...{
			target: null,
			currentTarget: null,
			eventPhase: 0,
			bubbles: false,
			cancelable: false,
			defaultPrevented: false,
			composed: false,
			srcElement: null,
			returnValue: true,
			cancelBubble: false,
			path: []
		},
		...eventInitDict,
		...{
			isTrusted: false,
			type: name,
			timeStamp: Date.now(),
		}
	}
	return ev;
}
// NHook is a constructor for hooking (listening and triggering Events)
function NHook() {
	// Part 1 : Listeners
	this.listeners = [];
	// Add an event
	this.addEventListener = function(name, fn) {
		this.listeners.push([name, fn]);
		return true;
	}

	// Alias = on
	this.on = this.addEventListener;

	// Remove an event
	// How it works: checks for added events with the given name and name of function (fn.name)
	this.removeEventListener = function(name, fn) {
		var keys = [];
		var currkey = -1;
		var listeners = this.listeners.filter(function(elem) {
			currkey += 1;
			var valid = (elem[0] == name) && (elem[1].name.indexOf(fnname) >= 0);
			if (valid) {
				keys.push(currkey);
			}
		});
		for (var i = 0; i < keys.length; i++) {
			this.listeners.splice(keys[i], 1);
		}
	}

	// off is an alias for removeEventListener
	this.off = this.addEventListener;

	// Dispatch an event
	// TODO: Check if param is an event
	this.dispatchEvent = function(event) {
		for (var i = 0; i < this.listeners.length; i++) {
			if (this.listeners[i][0] == event.type) {
				this.listeners[i][1](event);
			}
		}
	}

	// trigger is an alias for dispatchEvent
	this.trigger = this.dispatchEvent;
}