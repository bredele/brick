var Store = require('./store'),
    trim = require('./lib/utils').trim,
    subs = require('./lib/subs');

/**
 * Expose 'Binding'
 */

module.exports = Binding;


/**
 * Binding constructor.
 * @api public
 */

function Binding(model) {
	if(!(this instanceof Binding)) return new Binding(model);
	this.model = new Store(model);
	this.plugins = {};
}

//todo: make better parser and more efficient
function parser(str) {
    //str = str.replace(/ /g,'');
    var phrases = str ? str.split(';') : ['main'];
    var results = [];
    for(var i = 0, l = phrases.length; i < l; i++) {
      var expr = phrases[i].split(':');

      var params = [];
      var name = expr[0];

      if(expr[1]) {
        var args = expr[1].split(',');
        for(var j = 0, h = args.length; j < h; j++) {
          params.push(trim(args[j]));
        }
      } else {
        name = 'main'; //doesn't do anything
      }

      results.push({
        method: trim(expr[0]),
        params: params
      });
    }
    return results;
  }

/**
 * Bind object as function.
 * @api private
 */

function binder(obj) {
  return function(el, expr) {
    var formats = parser(expr);
    for(var i = 0, l = formats.length; i < l; i++) {
      var format = formats[i];
      format.params.splice(0, 0, el);
      obj[format.method].apply(obj, format.params);
    }
  };
}


/**
 * Add binding by name
 * @param {String} name  
 * @param {Object} plugin 
 * @api public
 */

Binding.prototype.add = function(name, plugin) {
  if(typeof plugin === 'object') plugin = binder(plugin);
  this.plugins[name] = plugin;
  return this;
};


/**
 * Attribute binding.
 * @param  {HTMLElement} node 
 * @api private
 */

Binding.prototype.bindAttrs = function(node) {
  var attrs = node.attributes;
  for(var i = 0, l = attrs.length; i < l; i++) {
    var attr = attrs[i],
        plugin = this.plugins[attr.nodeName];

    if(plugin) {
      plugin.call(this.model, node, attr.nodeValue);
    } else {
      subs(attr, this.model);
    }
  }
};


/**
 * Apply bindings on a single node
 * @param  {DomElement} node 
 * @api private
 */

Binding.prototype.bind = function(node) {
  var type = node.nodeType;
  //dom element
  if (type === 1) return this.bindAttrs(node);
  // text node
  if (type === 3) subs(node, this.model);
};


/**
 * Apply bindings on nested DOM element.
 * @param  {DomElement} node 
 * @api public
 */

Binding.prototype.apply = function(node) {
  var nodes = node.childNodes;
  this.bind(node);
  for (var i = 0, l = nodes.length; i < l; i++) {
    this.apply(nodes[i]);
  }
};