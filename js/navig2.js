class nrouter {
	defaults = {
		root: location.href,
		baseClass: "html",
		viewClass: "body",
		pushState: true,
		hash: false,
	}

	fetch(url) {
		var a = new XMLHttpRequest;
		a.open("GET", url, false);
		a.send();
		return a.responseText;
	}

	navigate(url) {
		var a = window.location;
		history.pushState({url: new URL("",location).href, powered_by: this.name}, null, url );
	}

	backLook(url) {
		url = new URL(url, location).href
		if (this.stack.includes(url)) {
			console.log("included");
			this.show(url, undefined, false);
			var id = this.stack.findIndex(e => e == url);
			this.stack.splice(id, this.stack.length - 1);
		} else {
			console.log("not included");
			this.show(url);
		}
	}

	init() {
		// Pop states
		window.onpopstate = e => { console.log(e); this.backLook(location.href) };
		// Get all the elements by their selectors
		this.head = document.querySelector(this.options.headClass);
		this.body = document.querySelector(this.options.bodyClass);
		this.base = document.querySelector(this.options.baseClass);
		// Init the stack
		this.stack = [];
		this.stack.push(window.location.href);
		// Let's call this reinit
		this.reinit = this.init;
		this.init = undefined;
		NHook.call(this);
		this.dispatchEvent("create");
	}

	show(url, content = undefined, push = true) {
		url = new URL(url, location).href;
		if(!content) {
			content = this.fetch(url);
		}
		if(this.base.tagName=="IFRAME") {
			this.base.src = url;
		} else {
			this.base.innerHTML = content;
			// We've tried to put execScripts in this, but if done,
			// it will eval the scripts in strict mode, which is bad.
			execScripts(this.base);
		}
		this.stack.push(url);
		if (push) {
			this.navigate(url);
		}
	} 

	constructor(options) {
		this.options = merge(this.defaults, options);
		this.init();
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