
/**
 * Require the given path.
 *
 * @param {String} path
 * @return {Object} exports
 * @api public
 */

function require(path, parent, orig) {
  var resolved = require.resolve(path);

  // lookup failed
  if (null == resolved) {
    orig = orig || path;
    parent = parent || 'root';
    var err = new Error('Failed to require "' + orig + '" from "' + parent + '"');
    err.path = orig;
    err.parent = parent;
    err.require = true;
    throw err;
  }

  var module = require.modules[resolved];

  // perform real require()
  // by invoking the module's
  // registered function
  if (!module._resolving && !module.exports) {
    var mod = {};
    mod.exports = {};
    mod.client = mod.component = true;
    module._resolving = true;
    module.call(this, mod.exports, require.relative(resolved), mod);
    delete module._resolving;
    module.exports = mod.exports;
  }

  return module.exports;
}

/**
 * Registered modules.
 */

require.modules = {};

/**
 * Registered aliases.
 */

require.aliases = {};

/**
 * Resolve `path`.
 *
 * Lookup:
 *
 *   - PATH/index.js
 *   - PATH.js
 *   - PATH
 *
 * @param {String} path
 * @return {String} path or null
 * @api private
 */

require.resolve = function(path) {
  if (path.charAt(0) === '/') path = path.slice(1);

  var paths = [
    path,
    path + '.js',
    path + '.json',
    path + '/index.js',
    path + '/index.json'
  ];

  for (var i = 0; i < paths.length; i++) {
    var path = paths[i];
    if (require.modules.hasOwnProperty(path)) return path;
    if (require.aliases.hasOwnProperty(path)) return require.aliases[path];
  }
};

/**
 * Normalize `path` relative to the current path.
 *
 * @param {String} curr
 * @param {String} path
 * @return {String}
 * @api private
 */

require.normalize = function(curr, path) {
  var segs = [];

  if ('.' != path.charAt(0)) return path;

  curr = curr.split('/');
  path = path.split('/');

  for (var i = 0; i < path.length; ++i) {
    if ('..' == path[i]) {
      curr.pop();
    } else if ('.' != path[i] && '' != path[i]) {
      segs.push(path[i]);
    }
  }

  return curr.concat(segs).join('/');
};

/**
 * Register module at `path` with callback `definition`.
 *
 * @param {String} path
 * @param {Function} definition
 * @api private
 */

require.register = function(path, definition) {
  require.modules[path] = definition;
};

/**
 * Alias a module definition.
 *
 * @param {String} from
 * @param {String} to
 * @api private
 */

require.alias = function(from, to) {
  if (!require.modules.hasOwnProperty(from)) {
    throw new Error('Failed to alias "' + from + '", it does not exist');
  }
  require.aliases[to] = from;
};

/**
 * Return a require function relative to the `parent` path.
 *
 * @param {String} parent
 * @return {Function}
 * @api private
 */

require.relative = function(parent) {
  var p = require.normalize(parent, '..');

  /**
   * lastIndexOf helper.
   */

  function lastIndexOf(arr, obj) {
    var i = arr.length;
    while (i--) {
      if (arr[i] === obj) return i;
    }
    return -1;
  }

  /**
   * The relative require() itself.
   */

  function localRequire(path) {
    var resolved = localRequire.resolve(path);
    return require(resolved, parent, path);
  }

  /**
   * Resolve relative to the parent.
   */

  localRequire.resolve = function(path) {
    var c = path.charAt(0);
    if ('/' == c) return path.slice(1);
    if ('.' == c) return require.normalize(p, path);

    // resolve deps by returning
    // the dep in the nearest "deps"
    // directory
    var segs = parent.split('/');
    var i = lastIndexOf(segs, 'deps') + 1;
    if (!i) i = 0;
    path = segs.slice(0, i + 1).join('/') + '/deps/' + path;
    return path;
  };

  /**
   * Check if module is defined at `path`.
   */

  localRequire.exists = function(path) {
    return require.modules.hasOwnProperty(localRequire.resolve(path));
  };

  return localRequire;
};

require.register("bredele-maple/maple.js", Function("exports, require, module",
"\n\
/**\n\
 * Modules dependencies. \n\
 */\n\
\n\
var App = require('./lib/app'),\n\
    utils = require('./lib/utils');\n\
\n\
\n\
var cache = [];\n\
\n\
\n\
/**\n\
 * Expose maple()\n\
 */\n\
\n\
module.exports = maple;\n\
\n\
\n\
/**\n\
 * Create a maple application.\n\
 *\n\
 * @return {Object}\n\
 * @api public\n\
 */\n\
\n\
function maple() {\n\
        var app = new App();\n\
        for(var i = 0, l = cache.length; i < l; i++) {\n\
                utils.mixin(app, cache[i]);\n\
        }\n\
        return app;\n\
}\n\
\n\
\n\
/**\n\
 * Merge every application with passed object.\n\
 * It can be really useful to extend the api (ex:superagent)\n\
 * \n\
 * @param  {Object} obj \n\
 * @api public\n\
 */\n\
\n\
maple.merge = function() {\n\
        cache = utils.array(arguments);\n\
        return this;\n\
};//@ sourceURL=bredele-maple/maple.js"
));
require.register("bredele-maple/view.js", Function("exports, require, module",
"var Binding = require('./binding'),\n\
    Store = require('./store');\n\
\n\
\n\
/**\n\
 * Expose 'View'\n\
 */\n\
\n\
module.exports = View;\n\
\n\
\n\
/**\n\
 * View constructor.\n\
 * We keep the constructor clean for override.\n\
 * @api public\n\
 */\n\
\n\
function View(){\n\
  this.dom = null;\n\
  this.store = null;\n\
  this.binding = new Binding();\n\
}\n\
\n\
/**\n\
 * String to DOM.\n\
 * @api pruvate\n\
 */\n\
\n\
function domify(tmpl){\n\
  //ie8 doesn't support instanceof if left assignment not an object\n\
  if(typeof tmpl !== 'string') return tmpl;\n\
  //may be by applying binding on this node we can have multiple\n\
  //children\n\
  var div = document.createElement('div');\n\
  //use component insert\n\
  div.innerHTML = tmpl;\n\
  return div.firstChild;\n\
}\n\
\n\
\n\
/**\n\
 * Turn HTML into DOM with data store.\n\
 * The template is either a string or \n\
 * an existing HTML element.\n\
 * @param  {String|HTMLElement|Function} tmpl  \n\
 * @param  {Object} store can be nothing, an object or a store\n\
 * @api public\n\
 */\n\
\n\
View.prototype.html = function(tmpl, store) { //add mixin obj?\n\
  if(typeof tmpl === 'function') {\n\
    //TODO: use component to array\n\
    this.dom = tmpl.apply(null, [].slice.call(arguments, 1));\n\
  } else {\n\
    this.store = new Store(store);\n\
    this.binding.model = this.store;\n\
    this.dom = domify(tmpl);\n\
  }\n\
  return this;\n\
};\n\
\n\
\n\
/**\n\
 * Add attribute binding plugin.\n\
 * @param  {String} name \n\
 * @param  {Object | Function} plug \n\
 * @return {View}\n\
 * @api public\n\
 */\n\
\n\
View.prototype.attr = function(name, plug) {\n\
  this.binding.add(name, plug);\n\
  return this;\n\
};\n\
\n\
\n\
/**\n\
 * Add binding plugin.\n\
 * @param  {String} name \n\
 * @param  {Object | Function} plug \n\
 * @return {View}\n\
 * @api public\n\
 */\n\
\n\
View.prototype.data = function(name, plug) {\n\
  return this.attr('data-' + name, plug);\n\
};\n\
\n\
\n\
/**\n\
 * Place widget in document.\n\
 * @param {HTMLElement} node\n\
 * @api public\n\
 */\n\
\n\
View.prototype.insert = function(node) {\n\
  this.alive();\n\
  node.appendChild(this.dom);\n\
};\n\
\n\
\n\
/**\n\
 * Apply data-binding on dom.\n\
 * @param {HTMLElement} node widget's dom if undefined\n\
 * @api publi\n\
 */\n\
\n\
View.prototype.alive = function(node) {\n\
  //do we want to apply multiple times? no\n\
  if(node) this.dom = node;\n\
  this.binding.apply(this.dom);\n\
};\n\
\n\
\n\
/**\n\
 * Call the destroy method for every registered plugin.\n\
 * \n\
 * @api public\n\
 */\n\
\n\
View.prototype.destroy = function() {\n\
  var plugins = this.binding.plugins,\n\
      parent = this.dom.parentNode;\n\
  //has own properties?\n\
  for(var name in plugins) {\n\
    var plugin = plugins[name];\n\
    plugin.destroy && plugin.destroy();\n\
  }\n\
  if(parent) parent.removeChild(this.dom);\n\
\n\
};//@ sourceURL=bredele-maple/view.js"
));
require.register("bredele-maple/store.js", Function("exports, require, module",
"var Emitter = require('./emitter'),\n\
\t\tutils = require('./lib/utils'),\n\
\t\tstorage = window.localStorage;\n\
\n\
/**\n\
 * Expose 'Store'\n\
 */\n\
\n\
module.exports = Store;\n\
\n\
\n\
/**\n\
 * Store constructor\n\
 * @api public\n\
 */\n\
\n\
function Store(data) {\n\
  if(data instanceof Store) return data;\n\
  this.data = data || {};\n\
  this.formatters = {};\n\
}\n\
\n\
\n\
Emitter(Store.prototype);\n\
\n\
\n\
/**\n\
 * Set store attribute.\n\
 * \n\
 * @param {String} name\n\
 * @param {Everything} value\n\
 * @api public\n\
 */\n\
\n\
Store.prototype.set = function(name, value) {\n\
  var prev = this.data[name];\n\
  if(prev !== value) {\n\
    this.data[name] = value;\n\
    this.emit('change', name, value, prev);\n\
    this.emit('change ' + name, value, prev);\n\
  }\n\
};\n\
\n\
\n\
/**\n\
 * Get store attribute.\n\
 * @param {String} name\n\
 * @return {Everything}\n\
 * @api public\n\
 */\n\
\n\
Store.prototype.get = function(name) {\n\
  var formatter = this.formatters[name];\n\
  var value = this.data[name];\n\
  if(formatter) {\n\
    value = formatter[0].call(formatter[1], value);\n\
  }\n\
  return value;\n\
};\n\
\n\
\n\
/**\n\
 * Get store attribute.\n\
 * @param {String} name\n\
 * @return {Everything}\n\
 * @api private\n\
 */\n\
\n\
Store.prototype.has = function(name) {\n\
  return this.data.hasOwnProperty(name);\n\
};\n\
\n\
\n\
/**\n\
 * Delete store attribute.\n\
 * @param {String} name\n\
 * @return {Everything}\n\
 * @api public\n\
 */\n\
\n\
Store.prototype.del = function(name) {\n\
  //TODO:refactor this is ugly\n\
  if(this.has(name)){\n\
    if(this.data instanceof Array){\n\
      this.data.splice(name, 1);\n\
    } else {\n\
      delete this.data[name]; //NOTE: do we need to return something?\n\
    }\n\
    this.emit('deleted', name, name);\n\
    this.emit('deleted ' + name, name);\n\
  }\n\
};\n\
\n\
\n\
/**\n\
 * Compute store attributes\n\
 * @param  {String} name\n\
 * @return {Function} callback                \n\
 * @api public\n\
 */\n\
\n\
Store.prototype.compute = function(name, callback) {\n\
  var str = callback.toString();\n\
  var attrs = str.match(/this.[a-zA-Z0-9]*/g);\n\
\n\
  this.set(name, callback.call(this.data)); //TODO: refactor (may be use replace)\n\
  for(var l = attrs.length; l--;){\n\
    this.on('change ' + attrs[l].slice(5), function(){\n\
      this.set(name, callback.call(this.data));\n\
    });\n\
  }\n\
};\n\
\n\
\n\
/**\n\
 * Set format middleware.\n\
 * Call formatter everytime a getter is called.\n\
 * A formatter should always return a value.\n\
 * \n\
 * @param {String} name\n\
 * @param {Function} callback\n\
 * @param {Object} scope\n\
 * @return this\n\
 * @api public\n\
 */\n\
\n\
Store.prototype.format = function(name, callback, scope) {\n\
  this.formatters[name] = [callback,scope];\n\
  return this;\n\
};\n\
\n\
\n\
/**\n\
 * Reset store\n\
 * @param  {Object} data \n\
 * @api public\n\
 */\n\
\n\
Store.prototype.reset = function(data) {\n\
\tvar copy = utils.clone(this.data),\n\
\t    length = data.length;\n\
\n\
\tthis.data = data;\n\
\n\
\tutils.each(copy, function(key, val){\n\
\t\tif(typeof data[key] === 'undefined'){\n\
\t\t\tthis.emit('deleted', key, length);\n\
\t\t\tthis.emit('deleted ' + key, length);\n\
\t\t}\n\
\t}, this);\n\
\n\
  //set new attributes\n\
  utils.each(data, function(key, val){\n\
  \tvar prev = copy[key];\n\
  \tif(prev !== val) {\n\
  \t\tthis.emit('change', key, val, prev);\n\
  \t\tthis.emit('change ' + key, val, prev);\n\
  \t}\n\
  }, this);\n\
};\n\
\n\
\n\
/**\n\
 * Loop through store data.\n\
 * @param  {Function} cb   \n\
 * @param  {[type]}   scope \n\
 * @api public\n\
 */\n\
\n\
Store.prototype.loop = function(cb, scope) {\n\
  utils.each(this.data, cb, scope || this);\n\
};\n\
\n\
\n\
/**\n\
 * Synchronize with local storage.\n\
 * \n\
 * @param  {String} name \n\
 * @param  {Boolean} bool save in localstore\n\
 * @api public\n\
 */\n\
\n\
Store.prototype.local = function(name, bool) {\n\
  if(!bool) {\n\
    storage.setItem(name, this.toJSON());\n\
  } else {\n\
    this.reset(JSON.parse(storage.getItem(name)));\n\
  }\n\
};\n\
\n\
\n\
/**\n\
 * Use middlewares to extend store.\n\
 * A middleware is a function with the store\n\
 * as first argument.\n\
 * \n\
 * @param  {Function} fn \n\
 * @return {this}\n\
 * @api public\n\
 */\n\
\n\
Store.prototype.use = function(fn) {\n\
  fn(this);\n\
  return this;\n\
};\n\
\n\
\n\
/**\n\
 * Stringify model\n\
 * @return {String} json\n\
 * @api public\n\
 */\n\
\n\
Store.prototype.toJSON = function() {\n\
  return JSON.stringify(this.data);\n\
};//@ sourceURL=bredele-maple/store.js"
));
require.register("bredele-maple/emitter.js", Function("exports, require, module",
"\n\
/**\n\
 * Dependencies.\n\
 */\n\
\n\
var utils = require('./lib/utils');\n\
//NOTES: should we move utils to the root?\n\
\n\
/**\n\
 * Expose `Emitter`.\n\
 */\n\
\n\
module.exports = Emitter;\n\
\n\
\n\
/**\n\
 * Initialize a new `Emitter`.\n\
 *\n\
 * @api public\n\
 */\n\
\n\
function Emitter(obj) {\n\
\tif (obj) {\n\
\t\tobj.listeners = {}; //avoid listeners init in each handler\n\
\t\treturn utils.mixin(Emitter.prototype, obj);\n\
\t}\n\
  this.listeners = {};\n\
}\n\
\n\
\n\
/**\n\
 * Listen on the given `event` with `fn`.\n\
 *\n\
 * @param {String} event\n\
 * @param {Function} fn\n\
 * @api public\n\
 */\n\
\n\
Emitter.prototype.on = function(event, fn, scope){\n\
\t(this.listeners[event] = this.listeners[event] || []).push([fn, scope]);\n\
\treturn this;\n\
};\n\
\n\
\n\
/**\n\
 * Listen an `event` listener that will be executed a single\n\
 * time.\n\
 *\n\
 * @param {String} event\n\
 * @param {Function} fn\n\
 * @api public\n\
 */\n\
\n\
Emitter.prototype.once = function(event, fn, scope){\n\
\tvar on = function() {\n\
\t\tfn.apply(scope, arguments);\n\
\t\tthis.off(event, on);\n\
\t};\n\
\tthis.on(event, on, this);\n\
};\n\
\n\
\n\
/**\n\
 * Remove the given callback for `event` or all\n\
 * registered callbacks.\n\
 *\n\
 * @param {String} event\n\
 * @param {Function} fn\n\
 * @api public\n\
 */\n\
\n\
Emitter.prototype.off = function(event, fn){\n\
\tif(arguments.length === 0) this.listeners = {};\n\
\tif(!fn) {\n\
\t\tdelete this.listeners[event];\n\
\t} else {\n\
\t\tvar listeners = this.listeners[event];\n\
\t\tfor(var l = listeners.length; l--;) {\n\
\t\t\tif(listeners[l][0] === fn) listeners.splice(l,1);\n\
\t\t}\n\
\t}\n\
\n\
\n\
};\n\
\n\
\n\
/**\n\
 * Emit `event` with the given args.\n\
 *\n\
 * @param {String} event\n\
 * @param {Mixed} ...\n\
 */\n\
\n\
Emitter.prototype.emit = function(event){\n\
\tvar listeners = this.listeners[event];\n\
\tif(!listeners) return;\n\
\tfor(var i = 0, l = listeners.length; i < l; i++) {\n\
\t\tvar listener = listeners[i];\n\
\t\tlistener[0].apply(listener[1] || this, utils.toArray(arguments, 1));\n\
\t}\n\
};\n\
//@ sourceURL=bredele-maple/emitter.js"
));
require.register("bredele-maple/binding.js", Function("exports, require, module",
"var Store = require('./store'),\n\
    trim = require('./lib/utils').trim,\n\
    subs = require('./lib/subs');\n\
\n\
/**\n\
 * Expose 'Binding'\n\
 */\n\
\n\
module.exports = Binding;\n\
\n\
\n\
/**\n\
 * Binding constructor.\n\
 * @api public\n\
 */\n\
\n\
function Binding(model) {\n\
\tif(!(this instanceof Binding)) return new Binding(model);\n\
\tthis.model = new Store(model);\n\
\tthis.plugins = {};\n\
}\n\
\n\
//todo: make better parser and more efficient\n\
function parser(str) {\n\
    //str = str.replace(/ /g,'');\n\
    var phrases = str ? str.split(';') : ['main'];\n\
    var results = [];\n\
    for(var i = 0, l = phrases.length; i < l; i++) {\n\
      var expr = phrases[i].split(':');\n\
\n\
      var params = [];\n\
      var name = expr[0];\n\
\n\
      if(expr[1]) {\n\
        var args = expr[1].split(',');\n\
        for(var j = 0, h = args.length; j < h; j++) {\n\
          params.push(trim(args[j]));\n\
        }\n\
      } else {\n\
        name = 'main'; //doesn't do anything\n\
      }\n\
\n\
      results.push({\n\
        method: trim(expr[0]),\n\
        params: params\n\
      });\n\
    }\n\
    return results;\n\
  }\n\
\n\
/**\n\
 * Bind object as function.\n\
 * @api private\n\
 */\n\
\n\
function binder(obj) {\n\
  return function(el, expr) {\n\
    var formats = parser(expr);\n\
    for(var i = 0, l = formats.length; i < l; i++) {\n\
      var format = formats[i];\n\
      format.params.splice(0, 0, el);\n\
      obj[format.method].apply(obj, format.params);\n\
    }\n\
  };\n\
}\n\
\n\
\n\
/**\n\
 * Add binding by name\n\
 * @param {String} name  \n\
 * @param {Object} plugin \n\
 * @api public\n\
 */\n\
\n\
Binding.prototype.add = function(name, plugin) {\n\
  if(typeof plugin === 'object') plugin = binder(plugin);\n\
  this.plugins[name] = plugin;\n\
  return this;\n\
};\n\
\n\
\n\
/**\n\
 * Attribute binding.\n\
 * @param  {HTMLElement} node \n\
 * @api private\n\
 */\n\
\n\
Binding.prototype.bindAttrs = function(node) {\n\
  var attrs = node.attributes;\n\
  for(var i = 0, l = attrs.length; i < l; i++) {\n\
    var attr = attrs[i],\n\
        plugin = this.plugins[attr.nodeName];\n\
\n\
    if(plugin) {\n\
      plugin.call(this.model, node, attr.nodeValue);\n\
    } else {\n\
      subs(attr, this.model);\n\
    }\n\
  }\n\
};\n\
\n\
\n\
/**\n\
 * Apply bindings on a single node\n\
 * @param  {DomElement} node \n\
 * @api private\n\
 */\n\
\n\
Binding.prototype.bind = function(node) {\n\
  var type = node.nodeType;\n\
  //dom element\n\
  if (type === 1) return this.bindAttrs(node);\n\
  // text node\n\
  if (type === 3) subs(node, this.model);\n\
};\n\
\n\
\n\
/**\n\
 * Apply bindings on nested DOM element.\n\
 * @param  {DomElement} node \n\
 * @api public\n\
 */\n\
\n\
Binding.prototype.apply = function(node) {\n\
  var nodes = node.childNodes;\n\
  this.bind(node);\n\
  for (var i = 0, l = nodes.length; i < l; i++) {\n\
    this.apply(nodes[i]);\n\
  }\n\
};//@ sourceURL=bredele-maple/binding.js"
));
require.register("bredele-maple/lib/app.js", Function("exports, require, module",
"\n\
/**\n\
 * Module dependencies\n\
 */\n\
\n\
var array = require('./utils').toArray,\n\
    Store = require('../store'),\n\
    Emitter = require('../emitter');\n\
\n\
\n\
//global maple emitter\n\
\n\
var emitter = new Emitter();\n\
\n\
\n\
/**\n\
 * Expose 'App'\n\
 */\n\
\n\
module.exports = App;\n\
\n\
\n\
/**\n\
 * Application prototype\n\
 */\n\
\n\
function App(name) {\n\
        //TODO: see if we should pass constructor parameters\n\
        this.name = name || \"\";\n\
        this.sandbox = new Store();\n\
}\n\
\n\
\n\
/**\n\
 * Listen events on communication bus.\n\
 *\n\
 * Example:\n\
 *\n\
 *     app.on('auth/login', fn);\n\
 *\n\
 * @param {String} name\n\
 * @param {Function} fn \n\
 * @return {app} \n\
 */\n\
\n\
App.prototype.on = function(){\n\
        return emitter.on.apply(emitter, arguments);\n\
};\n\
\n\
\n\
/**\n\
 * Emit event on communication bus.\n\
 * \n\
 * Example:\n\
 *\n\
 *     app.emit('login', true);\n\
 *\n\
 * @param {String} name\n\
 * @return {app}\n\
 */\n\
\n\
App.prototype.emit = function(name) {\n\
        var args = [this.name + '/' + name].concat(array(arguments, 1));\n\
        return emitter.emit.apply(emitter, args);\n\
};\n\
\n\
\n\
/**\n\
 * Listen events once on communication bus.\n\
 *\n\
 * @param {String} name\n\
 * @param {Function} fn \n\
 * @return {app} \n\
 */\n\
\n\
App.prototype.once = function() {\n\
        return emitter.once.apply(emitter, arguments);\n\
};\n\
\n\
\n\
/**\n\
 * Remove event listener on communication bus.\n\
 *\n\
 * Example:\n\
 *\n\
 *     app.off('auth/login', fn);\n\
 *\n\
 * @param {String} name\n\
 * @param {Function} fn \n\
 * @return {app} \n\
 */\n\
\n\
App.prototype.off = function() {\n\
        return emitter.off.apply(emitter, arguments);\n\
};\n\
\n\
\n\
/**\n\
 * Init handler.\n\
 * \n\
 * Example:\n\
 *\n\
 *     app.init(); //emit init event\n\
 *     app.init(fn); //register init callback\n\
 *     \n\
 * @param  {Function} fn \n\
 * @api public\n\
 */\n\
\n\
App.prototype.init = function(fn) {\n\
        //TODO: should we have scope?\n\
        if(fn) return this.sandbox.on('init', fn);\n\
        this.sandbox.emit('init');\n\
};\n\
\n\
\n\
/**\n\
 * Proxy to intialize other quick apps.\n\
 *\n\
 * @param {String} name\n\
 * @param {Function|App} fn \n\
 * @return {app} for chaning api\n\
 * @api public\n\
 */\n\
\n\
App.prototype.use = function(name, fn) {\n\
        //function middleware\n\
        if(typeof name === 'function') {\n\
                name.call(null, this);\n\
        }\n\
        \n\
        //artery app\n\
        if(fn && fn.use) { //what defined an app?\n\
                fn.name = name; //TODO: should we test that name is a string?\n\
                fn.sandbox.emit('init'); //TODO: should we do once?\n\
                this.sandbox.emit('init ' + fn.name); //we could use %s\n\
        }\n\
};\n\
\n\
\n\
/**\n\
 * Configuration handler (setter/getter).\n\
 *\n\
 * Example:\n\
 *\n\
 *     app.config(); //return config data\n\
 *     app.config({type:'app'}); //set config data\n\
 *     app.config('type', 'worker'); //set config prop\n\
 *     app.config('type'); //get config prop\n\
 *     \n\
 * @api public\n\
 */\n\
\n\
App.prototype.config = function(key, value) {\n\
        //we could save the config in localstore\n\
        if(!key) return this.sandbox.data;\n\
        if(typeof key === 'object') {\n\
                this.sandbox.reset(key);\n\
                return;\n\
        }\n\
        if(!value) return this.sandbox.get(key);\n\
        this.sandbox.set(key, value);\n\
};\n\
\n\
\n\
// App.prototype.worker = function() {\n\
//         //initialize an app inside a web worker\n\
// };\n\
\n\
\n\
App.prototype.debug = function() {\n\
        //common debug bus\n\
};//@ sourceURL=bredele-maple/lib/app.js"
));
require.register("bredele-maple/lib/supplant.js", Function("exports, require, module",
"var utils = require('./utils');\n\
\n\
\n\
/**\n\
 * Variable substitution on the string.\n\
 *\n\
 * @param {String} str\n\
 * @param {Object} model\n\
 * @return {String} interpolation's result\n\
 */\n\
\n\
module.exports = function(text, model){\n\
  return text.replace(/\\{([^}]+)\\}/g, function(_, expr) {\n\
    return model[utils.trim(expr)] || '';\n\
  });\n\
};\n\
\n\
/**\n\
 * Substitutions attributes.\n\
 * \n\
 * @param  {String} text \n\
 * @return {Array}\n\
 */\n\
module.exports.attrs = function(text) {\n\
  var exprs = [];\n\
  text.replace(/\\{([^}]+)\\}/g, function(_, expr){\n\
    var val = utils.trim(expr);\n\
    if(!~utils.indexOf(exprs, val)) exprs.push(val);\n\
  });\n\
  return exprs;\n\
};//@ sourceURL=bredele-maple/lib/supplant.js"
));
require.register("bredele-maple/lib/subs.js", Function("exports, require, module",
"var supplant = require('./supplant'),\n\
    utils = require('./utils');\n\
\n\
\n\
/**\n\
 * Node text substitution constructor.\n\
 * @param {HTMLElement} node type 3\n\
 * @param {Store} store \n\
 */\n\
\n\
module.exports = function(node, store) {\n\
  var text = node.nodeValue;\n\
\n\
  if(!~ utils.indexOf(text, '{')) return;\n\
\n\
  var exprs = getProps(text),\n\
      handle = function() {\n\
        node.nodeValue = supplant(text, store.data);\n\
      };\n\
\n\
  for(var l = exprs.length; l--;) {\n\
    store.on('change ' + exprs[l], handle);\n\
  }\n\
\n\
  handle();\n\
};\n\
\n\
\n\
function getProps(text) {\n\
  var exprs = [];\n\
  \n\
  //is while and test faster?\n\
  text.replace(/\\{([^}]+)\\}/g, function(_, expr){\n\
    if(!~utils.indexOf(exprs, expr)) exprs.push(expr);\n\
  });\n\
\n\
  return exprs;\n\
}//@ sourceURL=bredele-maple/lib/subs.js"
));
require.register("bredele-maple/lib/utils.js", Function("exports, require, module",
"\n\
/**\n\
 * Mixin to objects.\n\
 * \n\
 * @param {Object} from\n\
 * @param {Object} to \n\
 * @return {Object} to\n\
 */\n\
\n\
module.exports.mixin = function(from, to) {\n\
\tfor (var key in from) {\n\
\t\tif (from.hasOwnProperty(key)) {\n\
\t\t\tto[key] = from[key];\n\
\t\t}\n\
\t}\n\
\treturn to;\n\
};\n\
\n\
\n\
/**\n\
 * toArray\n\
 *\n\
 * @param {Object}  obj Array-like or string\n\
 * @param {Number}  index slice index\n\
 * @return {Array} Empty Array if argument other than string or Object\n\
 * @api public\n\
 */\n\
\n\
module.exports.toArray = function(arg, idx) {\n\
\treturn [].slice.call(arg, idx);\n\
};\n\
\n\
\n\
/**\n\
 * Index of.\n\
 * @param {Array} arr\n\
 * @param {Object} obj \n\
 * @return {Number}\n\
 */\n\
\n\
module.exports.indexOf = function(arr, obj) {\n\
 \tif (arr.indexOf) return arr.indexOf(obj);\n\
 \tfor (var i = 0; i < arr.length; ++i) {\n\
 \t\tif (arr[i] === obj) return i;\n\
 \t}\n\
 \treturn -1;\n\
 };\n\
\n\
\n\
/**\n\
 * Trim string.\n\
 * @param {String} str \n\
 * @return {string} \n\
 */\n\
\n\
module.exports.trim = function(str){\n\
  if(str.trim) return str.trim();\n\
  return str.replace(/^\\s*|\\s*$/g, '');\n\
};\n\
\n\
\n\
/**\n\
 * Object iteration.\n\
 * @param  {Object}   obj   \n\
 * @param  {Function} fn    \n\
 * @param  {Object}   scope \n\
 */\n\
\n\
module.exports.each = function(obj, fn, scope) {\n\
\tif( obj instanceof Array) {\n\
\t\tfor(var i = 0, l = obj.length; i < l; i++){\n\
\t\t\tfn.call(scope, i, obj[i]);\n\
\t\t}\n\
\t} else if(typeof obj === 'object') {\n\
\t\tfor (var i in obj) {\n\
\t\t\tif (obj.hasOwnProperty(i)) {\n\
\t\t\t\tfn.call(scope, i, obj[i]);\n\
\t\t\t}\n\
\t\t}\n\
\t}\n\
};\n\
\n\
\n\
/**\n\
 * Clone object.\n\
 * \n\
 * @param  {Object} obj \n\
 * @api private\n\
 */\n\
\n\
module.exports.clone = function clone(obj) {\n\
\tif(obj instanceof Array) {\n\
\t\treturn obj.slice(0);\n\
\t}\n\
\tif(typeof obj === 'object') {\n\
\t\tvar copy = {};\n\
\t\tfor (var key in obj) {\n\
\t\t\tif (obj.hasOwnProperty(key)) {\n\
\t\t\t\tcopy[key] = clone(obj[key]);\n\
\t\t\t}\n\
\t\t}\n\
\t\treturn copy;\n\
\t}\n\
\treturn obj;\n\
};\n\
//@ sourceURL=bredele-maple/lib/utils.js"
));
require.register("bredele-event/index.js", Function("exports, require, module",
"\n\
/**\n\
 * Polyfill\n\
 */\n\
\n\
 var attach = window.addEventListener ? 'addEventListener' : 'attachEvent',\n\
     detach = window.removeEventListener ? 'removeEventListener' : 'detachEvent',\n\
     prefix = attach !== 'addEventListener' ? 'on' : '';\n\
\n\
/**\n\
 * Matches query selection.\n\
 * \n\
 * @param  {HTMLElement} el \n\
 * @param  {HTMLElement} target  \n\
 * @param  {String} selector \n\
 * @return {Boolean}  true if the element would be selected by the \n\
 * specified selector string\n\
 */\n\
function matches(el, target, selector) {\n\
\t//refactor with maple (childnodes indexof)\n\
\treturn [].slice.call(el.querySelectorAll(selector)).indexOf(target) > -1;\n\
}\n\
\n\
\n\
/**\n\
 * Attach Event Listener.\n\
 * \n\
 * @param  {HTMLElement}   el\n\
 * @param  {String}   str\n\
 * @param  {Function} fn \n\
 * @param  {Boolean}   capture\n\
 * @return {Array} handler to detach event      \n\
 */\n\
\n\
 exports.attach = function(el, str, fn, capture) {\n\
 \tvar filter = str.split('>'),\n\
 \t    phrase = filter[0].split(' '),\n\
 \t    topic = phrase.shift(),\n\
 \t    selector = phrase.join(' ');\n\
\n\
  //TODO: do that globally?\n\
 \tvar cb = function(ev) {\n\
 \t\tvar target = ev.target || ev.srcElement;\n\
 \t\tif(!selector || matches(el, target, selector)) {\n\
 \t\t\tvar code = filter[1] && filter[1].replace(/ /g,'');\n\
 \t\t\tif(!code || ev.keyCode.toString() === code) fn(target, ev);\n\
 \t\t}\n\
 \t};\n\
\n\
  el[attach](prefix + topic, cb, capture || false);\n\
 \treturn [topic, cb, capture];\n\
 };\n\
\n\
\n\
/**\n\
 * Detach event listener.\n\
 * \n\
 * @param  {HTMLElement}   el\n\
 * @param  {String}   str\n\
 * @param  {Function} fn\n\
 * @param  {Boolean}   capture   \n\
 */\n\
\n\
 exports.detach = function(el, str, fn, capture) {\n\
 \tel[detach](prefix + str, fn, capture || false);\n\
 };\n\
//@ sourceURL=bredele-event/index.js"
));
require.register("bredele-event-plugin/index.js", Function("exports, require, module",
"/**\n\
 * Dependencies\n\
 */\n\
\n\
var ev = require('event');\n\
\n\
/**\n\
 * Map touch events.\n\
 * @type {Object}\n\
 * @api private\n\
 */\n\
\n\
var mapper = {\n\
\t'click' : 'touchend',\n\
\t'mousedown' : 'touchstart',\n\
\t'mouseup' : 'touchend',\n\
\t'mousemove' : 'touchmove'\n\
};\n\
\n\
\n\
/**\n\
 * Expose 'Event plugin'\n\
 */\n\
\n\
module.exports = Events;\n\
\n\
\n\
/**\n\
 * Event plugin constructor\n\
 * @param {Object} view event plugin scope\n\
 * @param {Boolean} isTouch optional\n\
 * @api public\n\
 */\n\
\n\
function Events(view, isTouch){\n\
  this.view = view;\n\
  this.listeners = [];\n\
  this.isTouch = isTouch || (window.ontouchstart !== undefined);\n\
}\n\
\n\
\n\
\n\
/**\n\
 * Listen events.\n\
 * @param {HTMLElement} node \n\
 * @param {String} type event's type\n\
 * @param {String} fn view's callback name\n\
 * @param {String} capture useCapture\n\
 * @api private\n\
 */\n\
\n\
Events.prototype.on = function(node, type, fn, capture) {\n\
  var _this = this,\n\
     cb = function(target, e) {\n\
      _this.view[fn].call(_this.view, e, node); //we should pass target\n\
     };\n\
  //todo: event should return the node as well...it's too complicated\n\
  this.listeners.push([node].concat(ev.attach(node, type, cb, (capture === 'true'))));\n\
};\n\
\n\
\n\
\n\
/**\n\
 * Map events (desktop and mobile)\n\
 * @param  {String} type event's name\n\
 * @return {String} mapped event\n\
 */\n\
\n\
Events.prototype.map = function(type) {\n\
\treturn this.isTouch ? (mapper[type] || type) : type;\n\
};\n\
\n\
\n\
/**\n\
 * Remove all listeners.\n\
 * @api public\n\
 */\n\
\n\
Events.prototype.destroy = function() {\n\
  for(var l = this.listeners.length; l--;) {\n\
    var listener = this.listeners[l];\n\
    ev.detach(listener[0], listener[1], listener[2], listener[3]);\n\
  }\n\
  this.listeners = [];\n\
};\n\
\n\
//@ sourceURL=bredele-event-plugin/index.js"
));
require.register("component-indexof/index.js", Function("exports, require, module",
"module.exports = function(arr, obj){\n\
  if (arr.indexOf) return arr.indexOf(obj);\n\
  for (var i = 0; i < arr.length; ++i) {\n\
    if (arr[i] === obj) return i;\n\
  }\n\
  return -1;\n\
};//@ sourceURL=component-indexof/index.js"
));
require.register("component-classes/index.js", Function("exports, require, module",
"/**\n\
 * Module dependencies.\n\
 */\n\
\n\
var index = require('indexof');\n\
\n\
/**\n\
 * Whitespace regexp.\n\
 */\n\
\n\
var re = /\\s+/;\n\
\n\
/**\n\
 * toString reference.\n\
 */\n\
\n\
var toString = Object.prototype.toString;\n\
\n\
/**\n\
 * Wrap `el` in a `ClassList`.\n\
 *\n\
 * @param {Element} el\n\
 * @return {ClassList}\n\
 * @api public\n\
 */\n\
\n\
module.exports = function(el){\n\
  return new ClassList(el);\n\
};\n\
\n\
/**\n\
 * Initialize a new ClassList for `el`.\n\
 *\n\
 * @param {Element} el\n\
 * @api private\n\
 */\n\
\n\
function ClassList(el) {\n\
  if (!el) throw new Error('A DOM element reference is required');\n\
  this.el = el;\n\
  this.list = el.classList;\n\
}\n\
\n\
/**\n\
 * Add class `name` if not already present.\n\
 *\n\
 * @param {String} name\n\
 * @return {ClassList}\n\
 * @api public\n\
 */\n\
\n\
ClassList.prototype.add = function(name){\n\
  // classList\n\
  if (this.list) {\n\
    this.list.add(name);\n\
    return this;\n\
  }\n\
\n\
  // fallback\n\
  var arr = this.array();\n\
  var i = index(arr, name);\n\
  if (!~i) arr.push(name);\n\
  this.el.className = arr.join(' ');\n\
  return this;\n\
};\n\
\n\
/**\n\
 * Remove class `name` when present, or\n\
 * pass a regular expression to remove\n\
 * any which match.\n\
 *\n\
 * @param {String|RegExp} name\n\
 * @return {ClassList}\n\
 * @api public\n\
 */\n\
\n\
ClassList.prototype.remove = function(name){\n\
  if ('[object RegExp]' == toString.call(name)) {\n\
    return this.removeMatching(name);\n\
  }\n\
\n\
  // classList\n\
  if (this.list) {\n\
    this.list.remove(name);\n\
    return this;\n\
  }\n\
\n\
  // fallback\n\
  var arr = this.array();\n\
  var i = index(arr, name);\n\
  if (~i) arr.splice(i, 1);\n\
  this.el.className = arr.join(' ');\n\
  return this;\n\
};\n\
\n\
/**\n\
 * Remove all classes matching `re`.\n\
 *\n\
 * @param {RegExp} re\n\
 * @return {ClassList}\n\
 * @api private\n\
 */\n\
\n\
ClassList.prototype.removeMatching = function(re){\n\
  var arr = this.array();\n\
  for (var i = 0; i < arr.length; i++) {\n\
    if (re.test(arr[i])) {\n\
      this.remove(arr[i]);\n\
    }\n\
  }\n\
  return this;\n\
};\n\
\n\
/**\n\
 * Toggle class `name`, can force state via `force`.\n\
 *\n\
 * For browsers that support classList, but do not support `force` yet,\n\
 * the mistake will be detected and corrected.\n\
 *\n\
 * @param {String} name\n\
 * @param {Boolean} force\n\
 * @return {ClassList}\n\
 * @api public\n\
 */\n\
\n\
ClassList.prototype.toggle = function(name, force){\n\
  // classList\n\
  if (this.list) {\n\
    if (\"undefined\" !== typeof force) {\n\
      if (force !== this.list.toggle(name, force)) {\n\
        this.list.toggle(name); // toggle again to correct\n\
      }\n\
    } else {\n\
      this.list.toggle(name);\n\
    }\n\
    return this;\n\
  }\n\
\n\
  // fallback\n\
  if (\"undefined\" !== typeof force) {\n\
    if (!force) {\n\
      this.remove(name);\n\
    } else {\n\
      this.add(name);\n\
    }\n\
  } else {\n\
    if (this.has(name)) {\n\
      this.remove(name);\n\
    } else {\n\
      this.add(name);\n\
    }\n\
  }\n\
\n\
  return this;\n\
};\n\
\n\
/**\n\
 * Return an array of classes.\n\
 *\n\
 * @return {Array}\n\
 * @api public\n\
 */\n\
\n\
ClassList.prototype.array = function(){\n\
  var str = this.el.className.replace(/^\\s+|\\s+$/g, '');\n\
  var arr = str.split(re);\n\
  if ('' === arr[0]) arr.shift();\n\
  return arr;\n\
};\n\
\n\
/**\n\
 * Check if class `name` is present.\n\
 *\n\
 * @param {String} name\n\
 * @return {ClassList}\n\
 * @api public\n\
 */\n\
\n\
ClassList.prototype.has =\n\
ClassList.prototype.contains = function(name){\n\
  return this.list\n\
    ? this.list.contains(name)\n\
    : !! ~index(this.array(), name);\n\
};\n\
//@ sourceURL=component-classes/index.js"
));
require.register("bredele-hidden-plugin/index.js", Function("exports, require, module",
"var classes = require('classes');\n\
\n\
\n\
/**\n\
 * Conditionally add 'hidden' class.\n\
 * @param {HTMLElement} node \n\
 * @param {String} attr model's attribute\n\
 * @api public\n\
 */\n\
\n\
module.exports = function(node, attr) {\n\
\tthis.on('change ' + attr, function(val) {\n\
\t\tif(val) {\n\
\t\t\tclasses(node).remove('hidden');\n\
\t\t} else {\n\
\t\t\tclasses(node).add('hidden');\n\
\t\t}\n\
\t});\n\
};\n\
//@ sourceURL=bredele-hidden-plugin/index.js"
));
require.register("bredele-trim/index.js", Function("exports, require, module",
"\n\
/**\n\
 * Expose 'trim'\n\
 * @param  {String} str\n\
 * @api public\n\
 */\n\
module.exports = function(str){\n\
  if(str.trim) return str.trim();\n\
  return str.replace(/^\\s*|\\s*$/g, '');\n\
};//@ sourceURL=bredele-trim/index.js"
));
require.register("bredele-supplant/index.js", Function("exports, require, module",
"var indexOf = require('indexof'),\n\
    trim = require('trim'),\n\
    props = require('./lib/props');\n\
\n\
\n\
var cache = {};\n\
\n\
function scope(statement){\n\
  var result = props(statement, 'model.');\n\
  return new Function('model', 'return ' + result);\n\
};\n\
\n\
/**\n\
 * Variable substitution on the string.\n\
 *\n\
 * @param {String} str\n\
 * @param {Object} model\n\
 * @return {String} interpolation's result\n\
 */\n\
\n\
 module.exports = function(text, model){\n\
\t//TODO:  cache the function the entire text or just the expression?\n\
  return text.replace(/\\{([^}]+)\\}/g, function(_, expr) {\n\
  \tif(/[.'[+(]/.test(expr)) {\n\
  \t\tvar fn = cache[expr] = cache[expr] || scope(expr);\n\
  \t\treturn fn(model) || '';\n\
  \t}\n\
    return model[trim(expr)] || '';\n\
  });\n\
};\n\
\n\
\n\
module.exports.attrs = function(text) {\n\
  var exprs = [];\n\
  text.replace(/\\{([^}]+)\\}/g, function(_, expr){\n\
    var val = trim(expr);\n\
    if(!~indexOf(exprs, val)) exprs.push(val);\n\
  });\n\
  return exprs;\n\
};//@ sourceURL=bredele-supplant/index.js"
));
require.register("bredele-supplant/lib/props.js", Function("exports, require, module",
"var indexOf = require('indexof');\n\
\n\
/**\n\
 * Global Names\n\
 */\n\
\n\
var globals = /\\b(Array|Date|Object|Math|JSON)\\b/g;\n\
\n\
/**\n\
 * Return immediate identifiers parsed from `str`.\n\
 *\n\
 * @param {String} str\n\
 * @param {String|Function} map function or prefix\n\
 * @return {Array}\n\
 * @api public\n\
 */\n\
\n\
module.exports = function(str, fn){\n\
  var p = unique(props(str));\n\
  if (fn && 'string' == typeof fn) fn = prefixed(fn);\n\
  if (fn) return map(str, p, fn);\n\
  return p;\n\
};\n\
\n\
/**\n\
 * Return immediate identifiers in `str`.\n\
 *\n\
 * @param {String} str\n\
 * @return {Array}\n\
 * @api private\n\
 */\n\
\n\
function props(str) {\n\
  return str\n\
    .replace(/\\.\\w+|\\w+ *\\(|\"[^\"]*\"|'[^']*'|\\/([^/]+)\\//g, '')\n\
    .replace(globals, '')\n\
    .match(/[a-zA-Z_]\\w*/g)\n\
    || [];\n\
}\n\
\n\
/**\n\
 * Return `str` with `props` mapped with `fn`.\n\
 *\n\
 * @param {String} str\n\
 * @param {Array} props\n\
 * @param {Function} fn\n\
 * @return {String}\n\
 * @api private\n\
 */\n\
\n\
function map(str, props, fn) {\n\
  var re = /\\.\\w+|\\w+ *\\(|\"[^\"]*\"|'[^']*'|\\/([^/]+)\\/|[a-zA-Z_]\\w*/g;\n\
  return str.replace(re, function(_){\n\
    if ('(' == _[_.length - 1]) return fn(_);\n\
    if (!~indexOf(props, _)) return _;\n\
    return fn(_);\n\
  });\n\
}\n\
\n\
/**\n\
 * Return unique array.\n\
 *\n\
 * @param {Array} arr\n\
 * @return {Array}\n\
 * @api private\n\
 */\n\
\n\
function unique(arr) {\n\
  var ret = [];\n\
\n\
  for (var i = 0; i < arr.length; i++) {\n\
    if (~indexOf(ret, arr[i])) continue;\n\
    ret.push(arr[i]);\n\
  }\n\
\n\
  return ret;\n\
}\n\
\n\
/**\n\
 * Map with prefix `str`.\n\
 */\n\
\n\
function prefixed(str) {\n\
  return function(_){\n\
    return str + _;\n\
  };\n\
}//@ sourceURL=bredele-supplant/lib/props.js"
));
require.register("bredele-plugin-parser/index.js", Function("exports, require, module",
"var trim = require('trim');\n\
\n\
/**\n\
 * Plugin constructor.\n\
 * @api public\n\
 */\n\
\n\
module.exports = function(str) {\n\
\t//str = str.replace(/ /g,'');\n\
\tvar phrases = str ? str.split(';') : ['main'];\n\
  var results = [];\n\
  for(var i = 0, l = phrases.length; i < l; i++) {\n\
    var expr = phrases[i].split(':');\n\
\n\
    var params = [];\n\
    var name = expr[0];\n\
\n\
    if(expr[1]) {\n\
      var args = expr[1].split(',');\n\
      for(var j = 0, h = args.length; j < h; j++) {\n\
        params.push(trim(args[j]));\n\
      }\n\
    } else {\n\
      name = 'main'; //doesn't do anything\n\
    }\n\
\n\
    results.push({\n\
      method: trim(expr[0]),\n\
      params: params\n\
    });\n\
  }\n\
  return results;\n\
 };//@ sourceURL=bredele-plugin-parser/index.js"
));
require.register("bredele-binding/index.js", Function("exports, require, module",
"var subs = require('./lib/attr'),\n\
    Store = require('store'),\n\
    parser = require('plugin-parser');\n\
\n\
\n\
/**\n\
 * Expose 'data binding'\n\
 */\n\
\n\
module.exports = Binding;\n\
\n\
\n\
/**\n\
 * Intitialize a binding.\n\
 * @param {Object} model \n\
 */\n\
\n\
function Binding(model){\n\
  if(!(this instanceof Binding)) return new Binding(model);\n\
  //TODO: remove store of dependencies\n\
  this.model = new Store(model);\n\
  this.plugins = {};\n\
}\n\
\n\
\n\
/**\n\
 * Bind object as function.\n\
 * @api private\n\
 */\n\
\n\
function binder(obj) {\n\
  return function(el, expr) {\n\
    var formats = parser(expr);\n\
    for(var i = 0, l = formats.length; i < l; i++) {\n\
      var format = formats[i];\n\
      format.params.splice(0, 0, el);\n\
      obj[format.method].apply(obj, format.params);\n\
    }\n\
  };\n\
}\n\
\n\
\n\
/**\n\
 * Add binding by name\n\
 * @param {String} name  \n\
 * @param {Object} plugin \n\
 * @api public\n\
 */\n\
\n\
Binding.prototype.add = function(name, plugin) {\n\
  if(typeof plugin === 'object') plugin = binder(plugin);\n\
  this.plugins[name] = plugin;\n\
  return this;\n\
};\n\
\n\
\n\
/**\n\
 * Attribute binding.\n\
 * @param  {HTMLElement} node \n\
 * @api private\n\
 */\n\
\n\
Binding.prototype.bindAttrs = function(node) {\n\
  var attrs = node.attributes;\n\
  //reverse loop doesn't work on IE...\n\
  for(var i = 0, l = attrs.length; i < l; i++) {\n\
    var attr = attrs[i],\n\
        plugin = this.plugins[attr.nodeName];\n\
\n\
    if(plugin) {\n\
      plugin.call(this.model, node, attr.nodeValue);\n\
    } else {\n\
      subs(attr, this.model);\n\
    }\n\
  }\n\
};\n\
\n\
\n\
/**\n\
 * Apply bindings on a single node\n\
 * @param  {DomElement} node \n\
 * @api private\n\
 */\n\
\n\
Binding.prototype.bind = function(node) {\n\
  var type = node.nodeType;\n\
  //dom element\n\
  if (type === 1) return this.bindAttrs(node);\n\
  // text node\n\
  if (type === 3) subs(node, this.model);\n\
};\n\
\n\
\n\
/**\n\
 * Apply bindings on nested DOM element.\n\
 * @param  {DomElement} node \n\
 * @api public\n\
 */\n\
\n\
Binding.prototype.apply = function(node) {\n\
  var nodes = node.childNodes;\n\
  this.bind(node);\n\
  //use each?\n\
  for (var i = 0, l = nodes.length; i < l; i++) {\n\
    this.apply(nodes[i]);\n\
  }\n\
};\n\
//@ sourceURL=bredele-binding/index.js"
));
require.register("bredele-binding/lib/attr.js", Function("exports, require, module",
"var supplant = require('supplant'), //don't use supplant for attributes (remove attrs)\n\
    indexOf = require('indexof'),\n\
    props = require('supplant/lib/props'); //TODO: make component props or supplant middleware\n\
\n\
\n\
/**\n\
 * Node text substitution constructor.\n\
 * @param {HTMLElement} node type 3\n\
 * @param {Store} store \n\
 */\n\
\n\
module.exports = function(node, store) {\n\
  var text = node.nodeValue;\n\
\n\
  //TODO: it seems faster if index in index.js??\n\
  //is it enought to say that's an interpolation?\n\
  if(!~ indexOf(text, '{')) return;\n\
\n\
  var exprs = getProps(text),\n\
      handle = function() {\n\
        node.nodeValue = supplant(text, store.data);\n\
      };\n\
\n\
  for(var l = exprs.length; l--;) {\n\
    //when destroy binding, we should do off store\n\
    store.on('change ' + exprs[l], handle);\n\
  }\n\
\n\
  handle();\n\
};\n\
\n\
\n\
function getProps(text) {\n\
  var exprs = [];\n\
  \n\
  //is while and test faster?\n\
  text.replace(/\\{([^}]+)\\}/g, function(_, expr){\n\
    if(!~indexOf(exprs, expr)) exprs = exprs.concat(props(expr));\n\
  });\n\
\n\
  return exprs;\n\
}//@ sourceURL=bredele-binding/lib/attr.js"
));
require.register("component-emitter/index.js", Function("exports, require, module",
"\n\
/**\n\
 * Expose `Emitter`.\n\
 */\n\
\n\
module.exports = Emitter;\n\
\n\
/**\n\
 * Initialize a new `Emitter`.\n\
 *\n\
 * @api public\n\
 */\n\
\n\
function Emitter(obj) {\n\
  if (obj) return mixin(obj);\n\
};\n\
\n\
/**\n\
 * Mixin the emitter properties.\n\
 *\n\
 * @param {Object} obj\n\
 * @return {Object}\n\
 * @api private\n\
 */\n\
\n\
function mixin(obj) {\n\
  for (var key in Emitter.prototype) {\n\
    obj[key] = Emitter.prototype[key];\n\
  }\n\
  return obj;\n\
}\n\
\n\
/**\n\
 * Listen on the given `event` with `fn`.\n\
 *\n\
 * @param {String} event\n\
 * @param {Function} fn\n\
 * @return {Emitter}\n\
 * @api public\n\
 */\n\
\n\
Emitter.prototype.on =\n\
Emitter.prototype.addEventListener = function(event, fn){\n\
  this._callbacks = this._callbacks || {};\n\
  (this._callbacks[event] = this._callbacks[event] || [])\n\
    .push(fn);\n\
  return this;\n\
};\n\
\n\
/**\n\
 * Adds an `event` listener that will be invoked a single\n\
 * time then automatically removed.\n\
 *\n\
 * @param {String} event\n\
 * @param {Function} fn\n\
 * @return {Emitter}\n\
 * @api public\n\
 */\n\
\n\
Emitter.prototype.once = function(event, fn){\n\
  var self = this;\n\
  this._callbacks = this._callbacks || {};\n\
\n\
  function on() {\n\
    self.off(event, on);\n\
    fn.apply(this, arguments);\n\
  }\n\
\n\
  on.fn = fn;\n\
  this.on(event, on);\n\
  return this;\n\
};\n\
\n\
/**\n\
 * Remove the given callback for `event` or all\n\
 * registered callbacks.\n\
 *\n\
 * @param {String} event\n\
 * @param {Function} fn\n\
 * @return {Emitter}\n\
 * @api public\n\
 */\n\
\n\
Emitter.prototype.off =\n\
Emitter.prototype.removeListener =\n\
Emitter.prototype.removeAllListeners =\n\
Emitter.prototype.removeEventListener = function(event, fn){\n\
  this._callbacks = this._callbacks || {};\n\
\n\
  // all\n\
  if (0 == arguments.length) {\n\
    this._callbacks = {};\n\
    return this;\n\
  }\n\
\n\
  // specific event\n\
  var callbacks = this._callbacks[event];\n\
  if (!callbacks) return this;\n\
\n\
  // remove all handlers\n\
  if (1 == arguments.length) {\n\
    delete this._callbacks[event];\n\
    return this;\n\
  }\n\
\n\
  // remove specific handler\n\
  var cb;\n\
  for (var i = 0; i < callbacks.length; i++) {\n\
    cb = callbacks[i];\n\
    if (cb === fn || cb.fn === fn) {\n\
      callbacks.splice(i, 1);\n\
      break;\n\
    }\n\
  }\n\
  return this;\n\
};\n\
\n\
/**\n\
 * Emit `event` with the given args.\n\
 *\n\
 * @param {String} event\n\
 * @param {Mixed} ...\n\
 * @return {Emitter}\n\
 */\n\
\n\
Emitter.prototype.emit = function(event){\n\
  this._callbacks = this._callbacks || {};\n\
  var args = [].slice.call(arguments, 1)\n\
    , callbacks = this._callbacks[event];\n\
\n\
  if (callbacks) {\n\
    callbacks = callbacks.slice(0);\n\
    for (var i = 0, len = callbacks.length; i < len; ++i) {\n\
      callbacks[i].apply(this, args);\n\
    }\n\
  }\n\
\n\
  return this;\n\
};\n\
\n\
/**\n\
 * Return array of callbacks for `event`.\n\
 *\n\
 * @param {String} event\n\
 * @return {Array}\n\
 * @api public\n\
 */\n\
\n\
Emitter.prototype.listeners = function(event){\n\
  this._callbacks = this._callbacks || {};\n\
  return this._callbacks[event] || [];\n\
};\n\
\n\
/**\n\
 * Check if this emitter has `event` handlers.\n\
 *\n\
 * @param {String} event\n\
 * @return {Boolean}\n\
 * @api public\n\
 */\n\
\n\
Emitter.prototype.hasListeners = function(event){\n\
  return !! this.listeners(event).length;\n\
};\n\
//@ sourceURL=component-emitter/index.js"
));
require.register("bredele-clone/index.js", Function("exports, require, module",
"\n\
/**\n\
 * Expose 'clone'\n\
 * @param  {Object} obj \n\
 * @api public\n\
 */\n\
\n\
module.exports = function(obj) {\n\
  if(obj instanceof Array) {\n\
    return obj.slice(0);\n\
  }\n\
  return clone(obj);\n\
};\n\
\n\
\n\
/**\n\
 * Clone object.\n\
 * @param  {Object} obj \n\
 * @api private\n\
 */\n\
\n\
function clone(obj){\n\
  if(typeof obj === 'object') {\n\
    var copy = {};\n\
    for (var key in obj) {\n\
      if (obj.hasOwnProperty(key)) {\n\
        copy[key] = clone(obj[key]);\n\
      }\n\
    }\n\
    return copy;\n\
  }\n\
  return obj;\n\
}//@ sourceURL=bredele-clone/index.js"
));
require.register("bredele-store/index.js", Function("exports, require, module",
"var Emitter = require('emitter'),\n\
    clone = require('clone'),\n\
    each = require('each'),\n\
    storage = window.localStorage;\n\
\n\
/**\n\
 * Expose 'Store'\n\
 */\n\
\n\
module.exports = Store;\n\
\n\
\n\
/**\n\
 * Store constructor\n\
 * @api public\n\
 */\n\
\n\
function Store(data) {\n\
  if(data instanceof Store) return data;\n\
  this.data = data || {};\n\
  this.formatters = {};\n\
}\n\
\n\
\n\
Emitter(Store.prototype);\n\
\n\
/**\n\
 * Set store attribute.\n\
 * @param {String} name\n\
 * @param {Everything} value\n\
 * @api public\n\
 */\n\
\n\
Store.prototype.set = function(name, value, plugin) { //add object options\n\
  var prev = this.data[name];\n\
  if(prev !== value) {\n\
    this.data[name] = value;\n\
    this.emit('change', name, value, prev);\n\
    this.emit('change ' + name, value, prev);\n\
  }\n\
};\n\
\n\
\n\
/**\n\
 * Get store attribute.\n\
 * @param {String} name\n\
 * @return {Everything}\n\
 * @api public\n\
 */\n\
\n\
Store.prototype.get = function(name) {\n\
  var formatter = this.formatters[name];\n\
  var value = this.data[name];\n\
  if(formatter) {\n\
    value = formatter[0].call(formatter[1], value);\n\
  }\n\
  return value;\n\
};\n\
\n\
/**\n\
 * Get store attribute.\n\
 * @param {String} name\n\
 * @return {Everything}\n\
 * @api private\n\
 */\n\
\n\
Store.prototype.has = function(name) {\n\
  //NOTE: I don't know if it should be public\n\
  return this.data.hasOwnProperty(name);\n\
};\n\
\n\
\n\
/**\n\
 * Delete store attribute.\n\
 * @param {String} name\n\
 * @return {Everything}\n\
 * @api public\n\
 */\n\
\n\
Store.prototype.del = function(name) {\n\
  //TODO:refactor this is ugly\n\
  if(this.has(name)){\n\
    if(this.data instanceof Array){\n\
      this.data.splice(name, 1);\n\
    } else {\n\
      delete this.data[name]; //NOTE: do we need to return something?\n\
    }\n\
    this.emit('deleted', name, name);\n\
    this.emit('deleted ' + name, name);\n\
  }\n\
};\n\
\n\
\n\
/**\n\
 * Set format middleware.\n\
 * Call formatter everytime a getter is called.\n\
 * A formatter should always return a value.\n\
 * @param {String} name\n\
 * @param {Function} callback\n\
 * @param {Object} scope\n\
 * @return this\n\
 * @api public\n\
 */\n\
\n\
Store.prototype.format = function(name, callback, scope) {\n\
  this.formatters[name] = [callback,scope];\n\
  return this;\n\
};\n\
\n\
\n\
/**\n\
 * Compute store attributes\n\
 * @param  {String} name\n\
 * @return {Function} callback                \n\
 * @api public\n\
 */\n\
\n\
Store.prototype.compute = function(name, callback) {\n\
  //NOTE: I want something clean instaead passing the computed \n\
  //attribute in the function\n\
  var str = callback.toString();\n\
  var attrs = str.match(/this.[a-zA-Z0-9]*/g);\n\
\n\
  this.set(name, callback.call(this.data)); //TODO: refactor (may be use replace)\n\
  for(var l = attrs.length; l--;){\n\
    this.on('change ' + attrs[l].slice(5), function(){\n\
      this.set(name, callback.call(this.data));\n\
    });\n\
  }\n\
};\n\
\n\
\n\
/**\n\
 * Reset store\n\
 * @param  {Object} data \n\
 * @api public\n\
 */\n\
\n\
Store.prototype.reset = function(data) {\n\
  var copy = clone(this.data),\n\
      length = data.length;\n\
  this.data = data;\n\
\n\
\n\
    //remove undefined attributes\n\
    //TODO: we don't need to go through each items for array (only difference)\n\
    each(copy, function(key, val){\n\
      if(typeof data[key] === 'undefined'){\n\
        this.emit('deleted', key, length);\n\
        this.emit('deleted ' + key, length);\n\
      }\n\
    }, this);\n\
\n\
  //set new attributes\n\
  each(data, function(key, val){\n\
    //TODO:refactor with this.set\n\
    var prev = copy[key];\n\
    if(prev !== val) {\n\
      this.emit('change', key, val, prev);\n\
      this.emit('change ' + key, val, prev);\n\
    }\n\
  }, this);\n\
};\n\
\n\
\n\
/**\n\
 * Loop through store data.\n\
 * @param  {Function} cb   \n\
 * @param  {[type]}   scope \n\
 * @api public\n\
 */\n\
\n\
Store.prototype.loop = function(cb, scope) {\n\
  each(this.data, cb, scope || this);\n\
};\n\
\n\
\n\
/**\n\
 * Synchronize with local storage.\n\
 * \n\
 * @param  {String} name \n\
 * @param  {Boolean} bool save in localstore\n\
 * @api public\n\
 */\n\
\n\
Store.prototype.local = function(name, bool) {\n\
  //TODO: should we do a clear for .local()?\n\
  if(!bool) {\n\
    storage.setItem(name, this.toJSON());\n\
  } else {\n\
    this.reset(JSON.parse(storage.getItem(name)));\n\
  }\n\
  //TODO: should we return this?\n\
};\n\
\n\
\n\
/**\n\
 * Use middlewares to extend store.\n\
 * A middleware is a function with the store\n\
 * as first argument.\n\
 * \n\
 * @param  {Function} fn \n\
 * @return {this}\n\
 * @api public\n\
 */\n\
\n\
Store.prototype.use = function(fn) {\n\
  fn(this);\n\
  return this;\n\
};\n\
\n\
\n\
/**\n\
 * Stringify model\n\
 * @return {String} json\n\
 * @api public\n\
 */\n\
\n\
Store.prototype.toJSON = function() {\n\
  return JSON.stringify(this.data);\n\
};\n\
\n\
//TODO: localstorage middleware like//@ sourceURL=bredele-store/index.js"
));
require.register("bredele-each/index.js", Function("exports, require, module",
"\n\
/**\n\
 * Expose 'each'\n\
 */\n\
\n\
module.exports = function(obj, fn, scope){\n\
  if( obj instanceof Array) {\n\
    array(obj, fn, scope);\n\
  } else if(typeof obj === 'object') {\n\
    object(obj, fn, scope);\n\
  }\n\
};\n\
\n\
\n\
/**\n\
 * Object iteration.\n\
 * @param  {Object}   obj   \n\
 * @param  {Function} fn    \n\
 * @param  {Object}   scope \n\
 * @api private\n\
 */\n\
\n\
function object(obj, fn, scope) {\n\
  for (var i in obj) {\n\
    if (obj.hasOwnProperty(i)) {\n\
      fn.call(scope, i, obj[i]);\n\
    }\n\
  }\n\
}\n\
\n\
\n\
/**\n\
 * Array iteration.\n\
 * @param  {Array}   obj   \n\
 * @param  {Function} fn    \n\
 * @param  {Object}   scope \n\
 * @api private\n\
 */\n\
\n\
function array(obj, fn, scope){\n\
  for(var i = 0, l = obj.length; i < l; i++){\n\
    fn.call(scope, i, obj[i]);\n\
  }\n\
}//@ sourceURL=bredele-each/index.js"
));
require.register("bredele-list/index.js", Function("exports, require, module",
"var Binding = require('binding'),\n\
    Store = require('store'),\n\
    each = require('each'),\n\
    index = require('indexof');\n\
\n\
\n\
\n\
/**\n\
 * Expose 'List'\n\
 */\n\
\n\
module.exports = List;\n\
\n\
\n\
/**\n\
 * List constructor.\n\
 * \n\
 * @param {HTMLelement} el\n\
 * @param {Object} model\n\
 * @api public\n\
 */\n\
\n\
function List(store){\n\
  this.store = new Store(store);\n\
  this.items = [];\n\
}\n\
\n\
\n\
/**\n\
 * Bind HTML element with store.\n\
 * Takes the first child as an item renderer.\n\
 * \n\
 * @param  {HTMLElement} node \n\
 * @api public\n\
 */\n\
\n\
List.prototype.main =  \n\
List.prototype.list = function(node) {\n\
  var first = node.children[0],\n\
      _this = this;\n\
\n\
  this.node = node;\n\
  this.clone = first.cloneNode(true);\n\
  node.removeChild(first);\n\
\n\
\n\
  this.store.on('change', function(key, value){\n\
    var item = _this.items[key];\n\
    if(item) {\n\
      //NOTE: should we unbind in store when we reset?\n\
      item.reset(value); //do our own emitter to have scope\n\
    } else {\n\
      //create item renderer\n\
      _this.addItem(key, value);\n\
    }\n\
  });\n\
\n\
  this.store.on('deleted', function(key, idx){\n\
    _this.delItem(idx);\n\
  });\n\
\n\
  this.store.loop(this.addItem, this);\n\
};\n\
\n\
/**\n\
 * Return index of node in list.\n\
 * @param  {HTMLelement} node \n\
 * @return {Number}  \n\
 * @api public\n\
 */\n\
\n\
List.prototype.indexOf = function(node) {\n\
  return index(this.node.children, node);\n\
};\n\
\n\
\n\
/**\n\
 * Loop over the list items.\n\
 * Execute callback and pass store item.\n\
 * \n\
 * @param  {Function} cb    \n\
 * @param  {Object}   scope \n\
 * @api public\n\
 */\n\
\n\
List.prototype.loop = function(cb, scope) {\n\
  each(this.items, function(idx, item){\n\
    cb.call(scope, item.store);\n\
  });\n\
};\n\
\n\
\n\
/**\n\
 * Add list item.\n\
 * \n\
 * @param {Object} obj\n\
 * @api public\n\
 */\n\
\n\
List.prototype.add = function(obj) {\n\
  //store push?\n\
  //in the future, we could use a position\n\
  this.store.set(this.store.data.length, obj);\n\
};\n\
\n\
\n\
/**\n\
 * Set list item.\n\
 * \n\
 * @param {HTMLElement|Number} idx \n\
 * @param {Object} obj\n\
 * @api public\n\
 */\n\
\n\
List.prototype.set = function(idx, obj) {\n\
  if(idx instanceof Element) idx = this.indexOf(idx);  \n\
  // if(idx instanceof HTMLElement) idx = this.indexOf(idx);\n\
  var item = this.items[idx].store;\n\
  each(obj, function(key, val){\n\
    item.set(key, val);\n\
  });\n\
};\n\
\n\
\n\
/**\n\
 * Delete item(s) in list.\n\
 * \n\
 * @api public\n\
 */\n\
\n\
List.prototype.del = function(arg, scope) {\n\
  //we should optimize store reset\n\
  if(arg === undefined) return this.store.reset([]);\n\
  if(typeof arg === 'function') {\n\
    //could we handle that with inverse loop and store loop?\n\
    var l = this.store.data.length;\n\
    while(l--) {\n\
      if(arg.call(scope, this.items[l].store)){\n\
        this.store.del(l);\n\
      }\n\
    }\n\
  }\n\
\n\
  //ie8 doesn't support HTMLElement and instanceof with left assignment != object\n\
  this.store.del(typeof arg === 'number' ? arg : this.indexOf(arg));\n\
  //this.store.del(arg instanceof HTMLElement ? this.indexOf(arg): arg);\n\
};\n\
\n\
\n\
/**\n\
 * Create item renderer from data.\n\
 * @param  {Object} data \n\
 * @api private\n\
 */\n\
\n\
List.prototype.addItem = function(key, data) {\n\
  var item = new ItemRenderer(this.clone, data);\n\
  this.items[key] = item;\n\
  this.node.appendChild(item.dom);\n\
};\n\
\n\
\n\
/**\n\
 * Delete item.\n\
 * @param  {Number} idx index\n\
 * @api private\n\
 */\n\
\n\
List.prototype.delItem = function(idx) {\n\
    var item = this.items[idx];\n\
    item.unbind(this.node);\n\
    this.items.splice(idx, 1);\n\
    item = null; //for garbage collection\n\
};\n\
\n\
\n\
/**\n\
 * Item renderer.\n\
 * Represents the item that going to be repeated.\n\
 * @param {HTMLElement} node \n\
 * @param {Store} data \n\
 * @api private\n\
 */\n\
\n\
function ItemRenderer(node, data){\n\
  //NOTE: is it more perfomant to work with string?\n\
  this.dom = node.cloneNode(true);\n\
  this.store = new Store(data);\n\
  this.binding = new Binding(this.store); //we have to have a boolean parameter to apply interpolation &|| plugins\n\
  this.binding.apply(this.dom);\n\
}\n\
\n\
\n\
/**\n\
 * Unbind an item renderer from its ancestor.\n\
 * @param  {HTMLElement} node \n\
 * @api private\n\
 */\n\
\n\
ItemRenderer.prototype.unbind = function(node) {\n\
  //NOTE: is there something else to do to clean the memory?\n\
  this.store.off();\n\
  node.removeChild(this.dom);\n\
};\n\
\n\
\n\
/**\n\
 * Reset iten renderer.\n\
 * @param  {Object} data \n\
 * @api private\n\
 */\n\
\n\
ItemRenderer.prototype.reset = function(data) {\n\
  this.store.reset(data);\n\
};\n\
\n\
//@ sourceURL=bredele-list/index.js"
));
require.register("todo/index.js", Function("exports, require, module",
"\n\
//dependencies\n\
\n\
var View = require('maple/view'),\n\
    Store = require('maple/store'),\n\
    Events = require('event-plugin'),\n\
    List = require('list'),\n\
    html = require('./todo.html');\n\
\n\
//init\n\
\n\
var app = new View();\n\
var todos = new List([]);\n\
var store = new Store({\n\
\titems: 0,\n\
\tpending: 0\n\
}); //second arguments could be compute\n\
\n\
store.compute('completed', function() {\n\
\treturn this.items - this.pending;\n\
});\n\
\n\
//temporary\n\
store.compute('number', function() {\n\
  return '' + this.pending; \n\
});\n\
store.compute('plurial', function() {\n\
 return this.pending !== 1 ? 's' : '';\n\
});\n\
\n\
\n\
//controller \n\
\n\
function stats(cb) {\n\
\treturn function(ev) {\n\
\t\tvar count = 0,\n\
\t\t    target = ev.target || ev.srcElement;\n\
\n\
\t\tcb.call(null, target.parentElement, target); //remove ev when filter submit event\n\
\t\ttodos.loop(function(todo) {\n\
\t\t\tif(todo.get('status') === 'pending') count++;\n\
\t\t});\n\
\t\tstore.set('items', todos.store.data.length); //have size\n\
\t\tstore.set('pending', count);\n\
\t};\n\
}\n\
\n\
var controller = {\n\
\t//we should have an input plugin\n\
\tadd: stats(function(parent, target) {\n\
\t\tvar val = target.value;\n\
\t\tif(val) {\n\
\t\t\ttodos.add({\n\
\t\t\t\tstatus : 'pending',\n\
\t\t\t\tlabel : val\n\
\t\t\t});\n\
\t\t\ttarget.value = \"\";\n\
\t\t}\n\
\t}),\n\
\t\n\
\ttoggle : stats(function(node, target) {\n\
\t\ttodos.set(node, {\n\
\t\t\tstatus :  target.checked ? 'completed' : 'pending'\n\
\t\t});\n\
\t}),\n\
\n\
\ttoggleAll : stats(function(node, target) {\n\
\t\tvar status = target.checked ? 'completed' : 'pending';\n\
\t\ttodos.loop(function(todo) {\n\
\t\t\ttodo.set('status', status);\n\
\t\t});\n\
\t}),\n\
\n\
\tdelAll : stats(function() {\n\
\t\ttodos.del(function(todo) {\n\
\t\t\treturn todo.get('status') === 'completed';\n\
\t\t});\n\
\t}),\n\
\n\
\tdel : stats(function(node) {\n\
\t\ttodos.del(node);\n\
\t}),\n\
\n\
\tbenchmark: function() {\n\
\t\tvar start = new Date();\n\
\t\tfor(var l = 200; l--;) {\n\
\t\t\ttodos.add({\n\
\t\t\t\tstatus: 'pending',\n\
\t\t\t\tlabel: 'foo'\n\
\t\t\t});\n\
\t\t}\n\
\t\tconsole.log(new Date() - start);\n\
\t}\n\
};\n\
\n\
//bindings\n\
app.html(html, store);\n\
app.attr('todos', todos);\n\
app.attr('events', new Events(controller)); // could be greate to do events(controller) and events.off, etc\n\
app.attr('visible', require('hidden-plugin')); //TODO: do our own\n\
\n\
module.exports = function(dom) {\n\
\tapp.insert(dom.querySelector('.stack')); //if null it should stay in dom's view TODO\n\
};\n\
//@ sourceURL=todo/index.js"
));
require.register("showcase/index.js", Function("exports, require, module",
"\n\
/**\n\
 * Dependencies\n\
 */\n\
\n\
var View = require('maple/view'),\n\
    event = require('event'), //do with plugin\n\
    Plugin = require('event-plugin'),\n\
    html = require('./showcase.html');\n\
\n\
var fragment = document.createDocumentFragment(); //may be have a hide function\n\
\n\
//init\n\
var view = new View(); //do factory for view\n\
view.html(html);\n\
view.attr('event', new Plugin({\n\
\tclose: function() {\n\
\t\tfragment.appendChild(view.dom); //use insert instead\n\
\t}\n\
}));\n\
\n\
view.insert(fragment);\n\
\n\
//do view for click\n\
event.attach(document.querySelector('.btn'), 'click', function() {\n\
\tview.insert(document.body);\n\
\n\
  //temporary\n\
  require('todo')(view.dom);\n\
});//@ sourceURL=showcase/index.js"
));










require.register("todo/todo.html", Function("exports, require, module",
"module.exports = '<section id=\"todoapp\">\\n\
  <button class=\"benchmark\" events=\"on:click,benchmark\">200</button>\\n\
  <header id=\"header\">\\n\
    <input id=\"new-todo\" placeholder=\"What needs to be done?\" events=\"on:keypress > 13,add\" autofocus>\\n\
  </header>\\n\
  <section id=\"main\">\\n\
    <input id=\"toggle-all\" type=\"checkbox\" events=\"on:click,toggleAll\">\\n\
    <label for=\"toggle-all\">Mark all as complete</label>\\n\
    <ul id=\"todo-list\" events=\"on:click .toggle,toggle;on:click .destroy,del\" todos>\\n\
      <li class=\"{status}\">\\n\
        <input class=\"toggle\" type=\"checkbox\">\\n\
        <label class=\"label\">{label}</label>\\n\
        <button class=\"destroy todo-btn\"></button>\\n\
      </li>\\n\
    </ul>\\n\
  </section>\\n\
  <footer id=\"footer\" class=\"hidden\" visible=\"items\">\\n\
    <span id=\"todo-count\">\\n\
      <strong>{number}</strong> \\n\
      item{plurial} left\\n\
    </span>\\n\
    <button id=\"clear-completed\" class=\"todo-btn\" events=\"on:click,delAll\" visible=\"completed\">\\n\
      Clear completed ({completed})\\n\
    </button>\\n\
  </footer>\\n\
</section>';//@ sourceURL=todo/todo.html"
));
require.register("showcase/showcase.html", Function("exports, require, module",
"module.exports = '<div class=\"showcase\">\\n\
\t<header class=\"toolbar\">\\n\
\t\t<div class=\"left icon-list toolbar-btn\"></div>\\n\
\t\t<div class=\"right icon-cross toolbar-btn\" event=\"on:click,close\"></div>\\n\
\t</header>\\n\
\t<section class=\"stack\"></section>\\n\
</div>';//@ sourceURL=showcase/showcase.html"
));

require.alias("showcase/index.js", "maple/deps/showcase/index.js");
require.alias("showcase/index.js", "maple/deps/showcase/index.js");
require.alias("showcase/index.js", "showcase/index.js");
require.alias("bredele-maple/maple.js", "showcase/deps/maple/maple.js");
require.alias("bredele-maple/view.js", "showcase/deps/maple/view.js");
require.alias("bredele-maple/store.js", "showcase/deps/maple/store.js");
require.alias("bredele-maple/emitter.js", "showcase/deps/maple/emitter.js");
require.alias("bredele-maple/binding.js", "showcase/deps/maple/binding.js");
require.alias("bredele-maple/lib/app.js", "showcase/deps/maple/lib/app.js");
require.alias("bredele-maple/lib/supplant.js", "showcase/deps/maple/lib/supplant.js");
require.alias("bredele-maple/lib/subs.js", "showcase/deps/maple/lib/subs.js");
require.alias("bredele-maple/lib/utils.js", "showcase/deps/maple/lib/utils.js");
require.alias("bredele-maple/maple.js", "showcase/deps/maple/index.js");
require.alias("bredele-maple/maple.js", "bredele-maple/index.js");
require.alias("bredele-event/index.js", "showcase/deps/event/index.js");
require.alias("bredele-event/index.js", "showcase/deps/event/index.js");
require.alias("bredele-event/index.js", "bredele-event/index.js");
require.alias("bredele-event-plugin/index.js", "showcase/deps/event-plugin/index.js");
require.alias("bredele-event-plugin/index.js", "showcase/deps/event-plugin/index.js");
require.alias("bredele-event/index.js", "bredele-event-plugin/deps/event/index.js");
require.alias("bredele-event/index.js", "bredele-event-plugin/deps/event/index.js");
require.alias("bredele-event/index.js", "bredele-event/index.js");
require.alias("bredele-event-plugin/index.js", "bredele-event-plugin/index.js");
require.alias("todo/index.js", "showcase/deps/todo/index.js");
require.alias("todo/index.js", "showcase/deps/todo/index.js");
require.alias("bredele-maple/maple.js", "todo/deps/maple/maple.js");
require.alias("bredele-maple/view.js", "todo/deps/maple/view.js");
require.alias("bredele-maple/store.js", "todo/deps/maple/store.js");
require.alias("bredele-maple/emitter.js", "todo/deps/maple/emitter.js");
require.alias("bredele-maple/binding.js", "todo/deps/maple/binding.js");
require.alias("bredele-maple/lib/app.js", "todo/deps/maple/lib/app.js");
require.alias("bredele-maple/lib/supplant.js", "todo/deps/maple/lib/supplant.js");
require.alias("bredele-maple/lib/subs.js", "todo/deps/maple/lib/subs.js");
require.alias("bredele-maple/lib/utils.js", "todo/deps/maple/lib/utils.js");
require.alias("bredele-maple/maple.js", "todo/deps/maple/index.js");
require.alias("bredele-maple/maple.js", "bredele-maple/index.js");
require.alias("bredele-event-plugin/index.js", "todo/deps/event-plugin/index.js");
require.alias("bredele-event-plugin/index.js", "todo/deps/event-plugin/index.js");
require.alias("bredele-event/index.js", "bredele-event-plugin/deps/event/index.js");
require.alias("bredele-event/index.js", "bredele-event-plugin/deps/event/index.js");
require.alias("bredele-event/index.js", "bredele-event/index.js");
require.alias("bredele-event-plugin/index.js", "bredele-event-plugin/index.js");
require.alias("bredele-hidden-plugin/index.js", "todo/deps/hidden-plugin/index.js");
require.alias("bredele-hidden-plugin/index.js", "todo/deps/hidden-plugin/index.js");
require.alias("component-classes/index.js", "bredele-hidden-plugin/deps/classes/index.js");
require.alias("component-indexof/index.js", "component-classes/deps/indexof/index.js");

require.alias("bredele-hidden-plugin/index.js", "bredele-hidden-plugin/index.js");
require.alias("bredele-list/index.js", "todo/deps/list/index.js");
require.alias("bredele-list/index.js", "todo/deps/list/index.js");
require.alias("bredele-binding/index.js", "bredele-list/deps/binding/index.js");
require.alias("bredele-binding/lib/attr.js", "bredele-list/deps/binding/lib/attr.js");
require.alias("bredele-binding/index.js", "bredele-list/deps/binding/index.js");
require.alias("bredele-supplant/index.js", "bredele-binding/deps/supplant/index.js");
require.alias("bredele-supplant/lib/props.js", "bredele-binding/deps/supplant/lib/props.js");
require.alias("bredele-supplant/index.js", "bredele-binding/deps/supplant/index.js");
require.alias("component-indexof/index.js", "bredele-supplant/deps/indexof/index.js");

require.alias("bredele-trim/index.js", "bredele-supplant/deps/trim/index.js");
require.alias("bredele-trim/index.js", "bredele-supplant/deps/trim/index.js");
require.alias("bredele-trim/index.js", "bredele-trim/index.js");
require.alias("bredele-supplant/index.js", "bredele-supplant/index.js");
require.alias("bredele-plugin-parser/index.js", "bredele-binding/deps/plugin-parser/index.js");
require.alias("bredele-plugin-parser/index.js", "bredele-binding/deps/plugin-parser/index.js");
require.alias("bredele-trim/index.js", "bredele-plugin-parser/deps/trim/index.js");
require.alias("bredele-trim/index.js", "bredele-plugin-parser/deps/trim/index.js");
require.alias("bredele-trim/index.js", "bredele-trim/index.js");
require.alias("bredele-plugin-parser/index.js", "bredele-plugin-parser/index.js");
require.alias("bredele-store/index.js", "bredele-binding/deps/store/index.js");
require.alias("bredele-store/index.js", "bredele-binding/deps/store/index.js");
require.alias("component-emitter/index.js", "bredele-store/deps/emitter/index.js");

require.alias("bredele-each/index.js", "bredele-store/deps/each/index.js");
require.alias("bredele-each/index.js", "bredele-store/deps/each/index.js");
require.alias("bredele-each/index.js", "bredele-each/index.js");
require.alias("bredele-clone/index.js", "bredele-store/deps/clone/index.js");
require.alias("bredele-clone/index.js", "bredele-store/deps/clone/index.js");
require.alias("bredele-clone/index.js", "bredele-clone/index.js");
require.alias("bredele-store/index.js", "bredele-store/index.js");
require.alias("component-indexof/index.js", "bredele-binding/deps/indexof/index.js");

require.alias("bredele-binding/index.js", "bredele-binding/index.js");
require.alias("bredele-store/index.js", "bredele-list/deps/store/index.js");
require.alias("bredele-store/index.js", "bredele-list/deps/store/index.js");
require.alias("component-emitter/index.js", "bredele-store/deps/emitter/index.js");

require.alias("bredele-each/index.js", "bredele-store/deps/each/index.js");
require.alias("bredele-each/index.js", "bredele-store/deps/each/index.js");
require.alias("bredele-each/index.js", "bredele-each/index.js");
require.alias("bredele-clone/index.js", "bredele-store/deps/clone/index.js");
require.alias("bredele-clone/index.js", "bredele-store/deps/clone/index.js");
require.alias("bredele-clone/index.js", "bredele-clone/index.js");
require.alias("bredele-store/index.js", "bredele-store/index.js");
require.alias("component-indexof/index.js", "bredele-list/deps/indexof/index.js");

require.alias("bredele-each/index.js", "bredele-list/deps/each/index.js");
require.alias("bredele-each/index.js", "bredele-list/deps/each/index.js");
require.alias("bredele-each/index.js", "bredele-each/index.js");
require.alias("bredele-list/index.js", "bredele-list/index.js");
require.alias("todo/index.js", "todo/index.js");
require.alias("showcase/index.js", "showcase/index.js");