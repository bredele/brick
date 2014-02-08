var Emitter = require('./emitter'),
		binding = require('./binding'),
		each = require('./lib/utils').each;

/**
 * Expose 'View'
 */

module.exports = View;


/**
 * View constructor.
 * @api public
 */

function View() {
  this.dom = null;
  this.binding = binding();
  this.once('inserted', function() {
		this.emit('compiled');
		this.binding.apply(this.dom);
  }, this);
}


//inherit from emitter

Emitter(View.prototype);


/**
 * Insert and compile.
 * A view is only compiled once.
 * example:
 *
 *   view.el(); //compile
 *   view.el(document.body) //insert and compile
 *   
 * @param  {Element} parent 
 * @return {View}
 * @api public
 */

View.prototype.el = function(parent) {
  this.emit('inserted'); //faster to compile outside of the document
	if(parent) parent.appendChild(this.dom);
	return this;
};

function dom(str) {
	//we should may be use fragment for memory leaks
	var frag = document.createElement('div');
	frag.insertAdjacentHTML('beforeend', str);
	return frag.firstChild;
}

/**
 * Render view's dom.
 * 
 * @event {created}
 * @param  {String|Element} str
 * @param  {Object|Stire} data 
 * @return {View}
 * @api public
 */

View.prototype.html = function(str, data) {
	if(data) this.binding.data(data);
	this.dom = (typeof str === 'string') ? dom(str) : str;
	this.emit('created'); //may be rendered
	return this;
};


/**
 * Add view's plugin.
 * example:
 * 
 *   view.plug('data-event', fn);
 *   view.plug({
 *     'data-event' : fn
 *   });
 *   
 * @param  {String|Object} attr   
 * @param  {Function|Object} plugin 
 * @return {View}
 * @api public
 */

View.prototype.plug = function(attr, plugin) {
	if(typeof attr !== 'string') {
		each(attr, function(name, obj) {
			this.plug(name, obj);
		}, this);
	} else {
		this.binding.add(attr, plugin);
	}
	return this;
};


/**
 * Remove view's dom from its parent element
 * and remove bindings.
 * 
 * @event {removed}
 * @return {View}
 * @api public
 */

View.prototype.remove = function() {
	var parent = this.dom.parentElement;
	this.binding.unbind();
	if(parent) {
			this.emit('removed');
			parent.removeChild(this.dom);
	}
	return this;
};