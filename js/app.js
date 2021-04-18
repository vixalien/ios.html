/*if ('serviceWorker' in navigator && localStorage.swinstalled != "true") {
	navigator.serviceWorker.register('/sw.js', { scope: '/' })
		.then((reg) => {
			// registration worked
			console.log('Registration succeeded. Scope is ' + reg.scope);
			localStorage.swinstalled = true;
		}).catch((error) => {
			// registration failed
			console.log('Registration failed with ' + error);
		})
}*/

var leads = document.querySelectorAll(".view.lead");
for (var i = 0; i < leads.length; i++) {
	leads[i].onscroll = function(e) {
		setTimeout(function() {
			if (e.target.scrollTop == 0) {
				e.target.classList.add("lead");
			} else {
				e.target.classList.remove("lead");
			}
		}, 10);
	}
}

// Segmented controls
var controls = document.querySelectorAll(".segmentedcontrol > .control");
for (var i = 0; i < controls.length; i++) {
	controls[i].onclick = function(e) {
		var i = 0, par = e.target;
		while (i != e.path.length - 1) {
			if (e.path[i].classList.contains("segmentedcontrol")) {
				par = e.path[i];
				var active = par.querySelector(".active");
				if (active) {
					active.classList.remove("active");
				}
				e.target.classList.add("active");
				break;
			}
			i++;
		}
	}
}

class alert {
	constructor(title = "Alert", body = "", links = {OK: "#"} ,mini = false, dismissable = true) {
		var al = document.createElement("div");
		if(mini) {
			al.classList.add("mini");
		}
		this.mini = mini;
		this.dismissable = dismissable;
		al.classList.add("alert");
		var titleE = document.createElement("h4");
		titleE.classList.add("title");
		titleE.innerHTML = title;
		al.appendChild(titleE);
		// Deal with content with a root elem
		if(body.startsWith("<")) {
			var tagName = body.match(/^<(\w*)/)[1];
			var bodyE = document.createElement(tagName);
			al.appendChild(bodyE);
			bodyE.outerHTML = body;
		} else {
			var bodyE = document.createElement("p");
			bodyE.innerHTML = body;
			al.appendChild(bodyE);
		}
		var linksE = document.createElement("div");
		linksE.classList.add("links");
		if (typeof links == "object") {
			for (var link in links) {
				var linkE = document.createElement("a");
				linkE.href = links[link];
				linkE.innerHTML = link;
				console.log(linkE);
				linksE.appendChild(linkE);
			}
		}
		al.appendChild(linksE);
		al.view = this;
		this.element = al;
		this.title = title;
		this.body = body;
		this.links = links;
		this.visible = false;
		this.init();
		return this;
	}
	update() {
		var u = new this.constructor(this.title, this.body, this.links);
		for(var un in u) {
			this[un] = u[un];
		}
	}

	show() {
		this.element.classList.add("active");
		this.shadow.classList.add("active");
		this.visible = true;
	}

	init() {
		document.body.appendChild(this.element);
		for (var i = 0; i < this.element.querySelectorAll(".links > *").length; i++) {
			this.element.querySelectorAll(".links > *")[i].addEventListener("click", function(e) {
				e.preventDefault();
				setTimeout(function() {e.path.find(e => e.classList.contains("alert")).view.close()}, 50);
			})
		}
		var shadow = document.createElement("div");
		shadow.classList.add("alert-shadow");
		shadow.view = this;
		if(this.dismissable) {
			shadow.onclick = function(e) {
				e.target.view.close();
			}
		}
		this.shadow = document.body.appendChild(shadow);
		this.reinit = this.init;
		this.init = undefined;
	}

	close() {
		this.element.classList.remove("active");
		this.shadow.classList.remove("active");
		this.visible = false;
	}
}

class modal {
	constructor(body, bg = document.querySelector("view") || document.body.children[0]) {
		var al = document.createElement("div");
		al.classList.add("modal");
		al.innerHTML = body;
		al.view = this;
		this.element = al;
		this.body = body;
		this.visible = false;
		this.bg = bg;
		this.init();
		return this;
	}
	update() {
		var u = new this.constructor(this.body);
		for (var un in u) {
			this[un] = u[un];
		}
	}

	show() {
		this.element.classList.add("active");
		this.bg.classList.add("modal-bg");
		this.visible = true;
	}

	init() {
		document.body.appendChild(this.element);
		for (var i = 0; i < this.element.querySelectorAll(".links > *").length; i++) {
			this.element.querySelectorAll(".links > *")[i].addEventListener("click", function(e) {
				e.preventDefault();
				setTimeout(function() { e.path.find(e => e.classList.contains("alert")).view.close() }, 300);
			})
		}
		this.reinit = this.init;
		this.init = undefined;
	}

	close() {
		this.element.classList.remove("active");
		this.bg.classList.remove("modal-bg");
		this.visible = false;
	}
}

// register sw
if ('serviceWorker' in navigator) navigator.serviceWorker.register('/sw.js', { scope: '/' })