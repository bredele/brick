var Emitter = require('./emitter'),
		utils = require('./lib/utils'),
		storage = window.localStorage;

/**
 * Expose 'Store'
 */

module.exports = Store;


/**
 * Store constructor
 * @api public
 */

function Store(data) {
  if(data instanceof Store) return data;
  this.data = data || {};
  this.formatters = {};
}


Emitter(Store.prototype);


/**
 * Set store attribute.
 * 
 * @param {String} name
 * @param {Everything} value
 * @api public
 */

Store.prototype.set = function(name, value) {
  var prev = this.data[name];
  if(prev !== value) {
    this.data[name] = value;
    this.emit('change', name, value, prev);
    this.emit('change ' + name, value, prev);
  }
};


/**
 * Get store attribute.
 * @param {String} name
 * @return {Everything}
 * @api public
 */

Store.prototype.get = function(name) {
  var formatter = this.formatters[name];
  var value = this.data[name];
  if(formatter) {
    value = formatter[0].call(formatter[1], value);
  }
  return value;
};


/**
 * Get store attribute.
 * @param {String} name
 * @return {Everything}
 * @api private
 */

Store.prototype.has = function(name) {
  return this.data.hasOwnProperty(name);
};


/**
 * Delete store attribute.
 * @param {String} name
 * @return {Everything}
 * @api public
 */

Store.prototype.del = function(name) {
  //TODO:refactor this is ugly
  if(this.has(name)){
    if(this.data instanceof Array){
      this.data.splice(name, 1);
    } else {
      delete this.data[name]; //NOTE: do we need to return something?
    }
    this.emit('deleted', name, name);
    this.emit('deleted ' + name, name);
  }
};


/**
 * Compute store attributes
 * @param  {String} name
 * @return {Function} callback                
 * @api public
 */

Store.prototype.compute = function(name, callback) {
  var str = callback.toString();
  var attrs = str.match(/this.[a-zA-Z0-9]*/g);

  this.set(name, callback.call(this.data)); //TODO: refactor (may be use replace)
  for(var l = attrs.length; l--;){
    this.on('change ' + attrs[l].slice(5), function(){
      this.set(name, callback.call(this.data));
    });
  }
};


/**
 * Set format middleware.
 * Call formatter everytime a getter is called.
 * A formatter should always return a value.
 * 
 * @param {String} name
 * @param {Function} callback
 * @param {Object} scope
 * @return this
 * @api public
 */

Store.prototype.format = function(name, callback, scope) {
  this.formatters[name] = [callback,scope];
  return this;
};


/**
 * Reset store
 * @param  {Object} data 
 * @api public
 */

Store.prototype.reset = function(data) {
	var copy = utils.clone(this.data),
	    length = data.length;

	this.data = data;

	utils.each(copy, function(key, val){
		if(typeof data[key] === 'undefined'){
			this.emit('deleted', key, length);
			this.emit('deleted ' + key, length);
		}
	}, this);

  //set new attributes
  utils.each(data, function(key, val){
  	var prev = copy[key];
  	if(prev !== val) {
  		this.emit('change', key, val, prev);
  		this.emit('change ' + key, val, prev);
  	}
  }, this);
};


/**
 * Loop through store data.
 * @param  {Function} cb   
 * @param  {[type]}   scope 
 * @api public
 */

Store.prototype.loop = function(cb, scope) {
  utils.each(this.data, cb, scope || this);
};


/**
 * Synchronize with local storage.
 * 
 * @param  {String} name 
 * @param  {Boolean} bool save in localstore
 * @api public
 */

Store.prototype.local = function(name, bool) {
  if(!bool) {
    storage.setItem(name, this.toJSON());
  } else {
    this.reset(JSON.parse(storage.getItem(name)));
  }
};


/**
 * Stringify model
 * @return {String} json
 * @api public
 */

Store.prototype.toJSON = function() {
  return JSON.stringify(this.data);
};