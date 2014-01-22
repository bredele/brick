
/**
 * Dependencies
 */

var binding = require('./binding'),
    utils = require('./lib/utils');


/**
 * Expose 'View'
 */

module.exports = View;


/**
 * View constructor.
 * 
 * @param {Object} mixin
 * @api public
 */

function View(mixin) {
  if(mixin) return utils.mixin(View.prototype, mixin);
  if(!(this instanceof View)) return new View(mixin);
  this.binding = binding();
}


/**
 * query selector.
 * @api private
 */

function query(el) {
	if(typeof el === 'string') el = document.querySelector(el);
	return el;
}


/**
 * Set or render view's dom.
 * example:
 *
 *   view.html('#maple',data);
 *   view.html('<button>maple</button>',data);
 *   view.html(node,data); //with node HTMLElement
 *
 * @param {String|Element} tmpl
 * @param {Object} data 
 * @return {View}
 * @api public
 */

View.prototype.html = function(tmpl, data) {
	if(data) this.binding.data(data);
	if(typeof tmpl === 'string') {
		if(!~utils.indexOf(tmpl, '<')) {
			this.dom = query(tmpl);
		} else {
			var frag = document.createElement('div');
			frag.insertAdjacentHTML('beforeend', tmpl);
			this.dom = frag.firstChild;
		}
		return this;
	}
	this.dom = tmpl;
	return this;
};


/**
 * Plug/bind logic to the dom.
 * example:
 *
 *   view.plug('data-event', function(){});
 *   view.plug({
 *     'data-event' : function(){},
 *     'required' : function(){}
 *   });
 *   
 * @param  {String|Object} attr   
 * @param  {Function|Object} plugin 
 * @return {View}
 * @api public
 */

View.prototype.plug = function(attr, plugin) {
	if(typeof attr !== 'string') {
		utils.each(attr, function(name, obj) {
			this.plug(name, obj);
		}, this);
	} else {
		this.binding.add(attr, plugin);
	}
	return this;
};


/**
 * Insert view's dom in HTML Element.
 * Applies bindings it it hasn't been done yet.
 * example:
 *
 *   view.insert('#maple');
 *   view.insert(node); //with node HTML Element
 * 
 * @param  {Element|string} el   
 * @param  {Boolean} bool true to apply only the plugins (not inteprolation)
 * @api public
 */

View.prototype.insert = function(el, bool) {
	//NOTE: should we do 2 level query selection for insert and html?
	this.alive(this.dom, bool); //we should apply only once!
	query(el).appendChild(this.dom);
};


/**
 * Apply bindings on passed HTML Element.
 * example:
 *
 *   view.alive(); //apply on view.dom
 *   view.alive(node); //apply in node
 *   view.alive('#maple');
 *   
 * @param  {Empty|Element} node 
 * @param  {Boolean} bool 
 * @return {View}
 * @api public
 */

View.prototype.alive = function(node, bool) {
	//TODO:??when we call alive from insert we do this.dom = this.dom
	if(node) this.dom = query(node);
	this.binding.apply(this.dom, bool);
	return this;
};


/**
 * Destroy bindings and view's dom.
 * 
 * @api public
 */

View.prototype.destroy = function() {
  var parent = this.dom.parentNode;
  this.binding.unbind();
  if(parent) parent.removeChild(this.dom);
};
