
/**
 * Dependencies.
 */

var utils = require('./lib/utils');
//NOTES: should we move utils to the root?

/**
 * Expose `Emitter`.
 */

module.exports = Emitter;


/**
 * Initialize a new `Emitter`.
 *
 * @api public
 */

function Emitter(obj) {
  if (obj) return utils.mixin(Emitter.prototype, obj);
}


/**
 * Listen on the given `event` with `fn`.
 *
 * @param {String} event
 * @param {Function} fn
 * @api public
 */

Emitter.prototype.on = function(event, fn, scope){
	this.listeners = this.listeners || {};
	(this.listeners[event] = this.listeners[event] || []).push([fn, scope]);
	return this;
};


/**
 * Listen an `event` listener that will be executed a single
 * time.
 *
 * @param {String} event
 * @param {Function} fn
 * @api public
 */

Emitter.prototype.once = function(event, fn, scope){
	this.listeners = this.listeners || {};
	var on = function() {
		fn.apply(scope, arguments);
		this.off(event, on);
	};
	this.on(event, on, this);
};


/**
 * Remove the given callback for `event` or all
 * registered callbacks.
 *
 * @param {String} event
 * @param {Function} fn
 * @api public
 */

Emitter.prototype.off = function(event, fn){
	this.listeners = this.listeners || {};
	if(arguments.length === 0) this.listeners = {};
	if(!fn) {
		delete this.listeners[event];
	} else {
		var listeners = this.listeners[event];
		for(var l = listeners.length; l--;) {
			if(listeners[l][0] === fn) listeners.splice(l,1);
		}
	}


};


/**
 * Emit `event` with the given args.
 *
 * @param {String} event
 * @param {Mixed} ...
 */

Emitter.prototype.emit = function(event){
	this.listeners = this.listeners || {};
	var listeners = this.listeners[event];
	if(!listeners) return;
	for(var i = 0, l = listeners.length; i < l; i++) {
		var listener = listeners[i];
		listener[0].apply(listener[1], utils.toArray(arguments, 1));
	}
};
