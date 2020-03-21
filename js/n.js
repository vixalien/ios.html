function MEvent(name, eventInitDict = {}) {
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
function hook_to(target, hooks = new Mhook) {
	for (hook in hooks) {
		target[hook] = hooks[hook];
	}
}

// MHook is a constructor for hooking (listening and triggering Events)
function MHook() {
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
		var listeners = this.elements.filter(function(elem) {
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

function element(attributes, model) {
	// model is a link to the `model` param
	this.model = model;
	// no utility: just to remind that:
	// todo: whenever you change an attr, the element should show it's not saved
	this.saved = false;
	this[this.model.rules.key.name] = undefined;
	Object.defineProperty(this, 'new_record', {
		get() {
			return typeof this[this.model.rules.key.name] == "undefined";
		},
		writtable: false,
	});
	for (var i = 0; i < this.model.fields.length; i++) {
		this[this.model.fields[i]] = this.model.defaults[this.model.fields[i]];
	}
	for (attr in attributes) {
		this[attr] = attributes[attr]
	}
	Object.defineProperty(this, 'valid', {
		get() {
			return this.model.valid(this);
		},
		writtable: false,
	});
	Object.defineProperty(this, 'errors', {
		get() {
			return this.model.errors(this);
		},
		writtable: false,
	});
	this.save = function() {
		var saved = this.model.save(this[model.rules.key.name], this);
		this.saved = saved.saved;
		if (saved.saved) {
			this.dispatchEvent(new MEvent("save", { target: this }));
		} else {
			this.dispatchEvent(new MEvent("invalid", { target: this, errors: saved.errors }));
		}
		return saved.saved;
	}
	this.delete = function() {
		this.dispatchEvent(new MEvent("delete", { target: this }));
		return this.model.delete(this[model.rules.key.name]);
	}
	this.update = function(attributes) {
		for (attrib in attributes) {
			this[attrib] = attributes[attrib];
		}
		return this.save;
	}
	permitted = [];
	for (var prop in this) {
		permitted.push(prop);
	}
	return new Watcher(this, permitted);
}

function callchange(elem, permitted = []) {
	this.props = [];
	this.log = [];
	this.change = {};
	hook_to(this);
	for(prop in elem) {
		if(permitted.includes(prop)) {
			this.props.push(prop);
			this[prop] = elem[prop];
			this.change[prop] = [];
		} else {
			throw new Error("someproperty unexpected: " + prop);
		}
	}
	const handler = {
		get: function(obj, prop) {
			if(prop in obj) {
				return obj[prop];
			} else if(prop.startsWith("change_")) {
				var att = prop.split("change_")[1];
				return obj.change[att];
			} else if (prop == "changed") {
				return obj.log.length == 0;
			} else if (prop.endsWith("_was")) {
				var att = prop.split("_was")[0];
				return obj.change[att[obj.change[att].length - 1]];
			} else {
				return undefined;
			}
		},

		set: function(obj, prop, value) {
			obj.dispatchEvent(new MEvent("change", { attrib: prop, new: value, old: obj[prop], target: obj }));
			obj.dispatchEvent(new MEvent("change:" + prop, { attrib: prop, new: value, old: obj[prop], target: obj }));
			obj.log.push({ attrib: prop, new: value, old: obj[prop], time: Date.now() });
			obj.change[prop].push(value);
			obj[prop] = value;
		}
	};
	var p = new Proxy(this, handler);
	return p;
}
Watcher = function(object, permitted = []) {
	this.props = [];
	this.log = [];
	this.change = {};
	par = this
	for (prop in object) {
		if (permitted.includes(prop)) {
			this.props.push(prop)
			this[prop] = object[prop];
			this.change[prop] = [];
			value = object[prop];
			Object.defineProperty(this, "__" + prop, {
				value: value,
				enumerable: false,
				configurable: false,
			});
			Object.defineProperty(this, prop, {
				get() {
					var att = prop;
					return ("__" + att) in this ? this["__" + att] : undefined;
				},
				set(value) {
					var att = prop;
					console.log("this", this, "value", value, "att", att);
					if (!this.hasOwnProperty(att)) {
						this.props.push(att);
						this.change[att] = [];
					}
					this.change[att].push(this[att]);
					this.log.push({ attrib: att, new: value, old: this[att], timestamp: Date.now() });
					this["__" + att] = value;
				}
			});
		} else {
			throw new Error("someproperty unexpected: " + prop);
		}
	}
	return this;
}

class Model {
	expect(attrib, value) {
		var valids = ["fields", "validators", "rules", "defaults"];
		var valid = true;
		var msg = "";
		if (valids.includes(attrib)) {
			switch (attrib) {
				case "fields":
					if (!Array.isArray(value)) {
						valid = false;
						msg = "fields is not an array";
					}
					break;
				case "validators":
					if (typeof value != "object") {
						valid = false;
						msg = "validators is not an object";
					}
					break;
				case "defaults":
					if (typeof value != "object") {
						valid = false;
						msg = "defaults is not an object";
					}
					break;
				case "rules":
					if (typeof value != "object") {
						valid = false;
						msg = "rules is not an object";
					}
			}
		}
		if (!valid) {
			return { valid, msg };
		} else {
			return true
		}
	}
	elements = []

	constructor(config = {}) {
		var hooks = new MHook();
		for (var hook in hooks) {
			this[hook] = hooks[hook];
		}
		for (var attrib in config) {
			var ret = this.expect(attrib, config[attrib]);
			if (ret == true) {
				this[attrib] = config[attrib];
			} else {
				throw new Error(ret.msg);
			}
		}
		this.extended = [];
		this.include = [];
		this.listeners = [];
		typeof this.defaults == "undefined" ? this.defaults = {} : "";
		typeof this.fields == "undefined" ? this.fields = [] : "";
		typeof this.rules == "undefined" ? this.rules = {} : "";
		typeof this.rules.key == "undefined" ? this.rules.key = { name: 'id', autoIncrement: true } : "";
	}

	extend(name, fn) {
		this[name] = fn;
		this.extended.push(name);
	}

	include(name, fn) {
		this.include.push([name, fn]);
	}

	where(attributes) {
		var m = this;
		return this.elements.filter(function(elem) {
			var allmatch = true;
			for (attr in attributes) {
				if (elem[attr] != attributes[attr]) {
					allmatch = false
				}
			}
			return allmatch;
		})
	}

	delete(start, length = 1) {
		var elems = this.elements.splice(start, length);
		this.dispatchEvent(new MEvent("delete", { target: this, elements: elems }));
		return elems;
	}

	errors(elem) {
		return validate(elem, this.validators);
	}

	valid(elem) {
		return typeof validate(elem, this.validators) == "undefined";
	}

	exist(key) {
		return typeof this.find(key) != "undefined";
	}

	new(attributes) {
		var elem = new element(attributes, this);
		this.dispatchEvent(new MEvent("new", { target: this, element: elem }));
		return elem;
	}

	create(attributes) {
		var elem = new element(attributes, this);
		elem.save();
		return elem;
	}

	find(key) {
		var m = this;
		return this.elements.find(function(elem) {
			return elem[m.rules.key.name] == key;
		})
	}

	findIndex(key) {
		var m = this;
		return this.elements.findIndex(function(elem) {
			return elem[m.rules.key.name] == key;
		})
	}

	all() {
		return this.elements;
	}

	save(key, elem) {
		var ret = this.findIndex(key);
		var valid = this.valid(elem, this.validators);
		if (valid) {
			if (ret >= 0) {
				this.elements[elem] = elem;
				this.dispatchEvent(new MEvent("new", { target: this, element: elem, new_record: false }));
				return { saved: true, new_record: false };
			} else {
				elem[this.rules.key.name] = (typeof elem[this.rules.key.name] == "undefined" ? this.elements.length > 0 ? this.elements[this.elements.length - 1].id : 1 : elem[this.rules.key.name]);
				this.elements.push(elem);
				this.dispatchEvent(new MEvent("new", { target: this, element: elem, new_record: true }));
				return { saved: true, new_record: true };
			}
		} else {
			return { saved: false, errors: this.errors(elem) };
		}
	}
}

