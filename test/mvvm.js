
/**
 * Test dependencies.
 */

var assert = require('assert');
var brick = require('..');


describe("API", function() {

  var obj;
  beforeEach(function() {
    obj = brick();
  });
  

  it("should be a component/emitter", function() {
    assert(obj.emit);
    assert(obj.on);
    assert(obj.once);
    assert(obj.off);
  });
  
  it('should be a bredele/datastore', function() {
    assert(obj.set);
    assert(obj.get);
    assert(obj.del);
    assert(obj.reset);
    assert(obj.compute);
    assert(obj.use);
  });

  it("should be a bredele/cement", function() {
    assert(obj.from);
    assert(obj.attr);
    assert(obj.node);
    assert(obj.query);
  });

  it("should add the following api", function() {
    assert(obj.tag);
    //assert(obj.hook);
    assert(obj.bind);
  });
  
});

// describe("#hook", function() {

//   var obj;
//   beforeEach(function() {
//     obj = brick();
//   });

//   it('should have an initial state', function() {
//     assert.equal(obj.state, 'created');
//   });

//   it("should add transition", function(done) {
//     obj.hook('created', 'lock', function() {
//       done();
//     }, 'locked');
//     obj.emit('lock');
//   });

//   it("should set current state", function() {
//     obj.hook('created', 'lock', function(){}, 'locked');
//     obj.emit('lock');
//     assert.equal(obj.state, 'locked');
//   });

//   it('should not change current state', function() {
//     obj.hook('created', 'lock', function(){});
//     obj.emit('lock');
//     assert.equal(obj.state, 'created');
//   });

//   it('should always change state', function() {
//     obj.hook('created', 'lock', null, 'locked');
//     obj.emit('lock');
//     assert.equal(obj.state, 'locked');
//   });

//   it('should perform transition without callback', function() {
//     obj.hook('created', 'lock', 'locked');
//     obj.emit('lock');
//     assert.equal(obj.state, 'locked');
//   });

//   it('should pass arguments', function(done) {
//     obj.hook('created', 'lock', function(hello, world){
//       if(hello === 'hello') done();
//     });
//     obj.emit('lock', 'hello');
//   });

// });


describe("#from", function() {

  var obj;
  beforeEach(function() {
    obj = brick();
  });

  it("should render string into dom", function() {
    obj.from('<button>hello</button>');
    assert.equal(obj.el.innerHTML, 'hello');
    assert.equal(obj.el.nodeName, 'BUTTON');
  });

  it("should render from existing dom", function() {
    var div = document.createElement('ul');
    obj.from(div);
    
    assert.equal(obj.el.nodeName, 'UL');
  });

  it('should render from query selection', function() {
    document.body.insertAdjacentHTML('beforeend', '<section class="brick-test">');
    obj.from('.brick-test');

    assert.equal(obj.el.nodeName, 'SECTION');
    assert.equal(obj.el.getAttribute('class'), 'brick-test');
  });

  it('should render from other template engine', function(done) {
    obj.from(function(data) {
      if(data === obj) done();
    });
  });

});


describe('bind', function() {

  var obj;
  beforeEach(function() {
    obj = brick();
  });

  it("should bind dom with data", function() {
    obj.from('<button>${name}</button>');
    obj.set('name', 'olivier');
    obj.bind();
    assert.equal(obj.el.outerHTML, '<button>olivier</button>');
  });

  it("should update dom when data change", function() {
    obj.from('<button>${name}</button>');
    obj.set('name', 'olivier');
    obj.bind();
    obj.set('name', 'bruno');
    assert.equal(obj.el.outerHTML, '<button>bruno</button>');
  });
})

describe('#tag', function() {

  it("should replace custom tag with brick", function() {
    var list = brick('<ul><user></user></ul>');
    var user = brick('<h1>user</h1>');

    list.tag('user', user);
    list.bind();

    assert.equal(list.el.innerHTML, '<h1>user</h1>');
  });

  // note: une brick peut elle etre un custom element?
  // dans ce cas on doit verifier le this.el (c pk il faudrait
  // peut etre mettre la brick dans unf ragment par defaut)
  //var list = brick('<user><span>hello world!</span></user>');

  it('should replace the content of a custom element with 1 node', function() {
    var list = brick('<div><user>  <button>hello</button></user></div>');
    var user = brick('<div><content></content></div>');

    list.tag('user', user);
    list.bind();

    // note on doit utiliser un fragment 
    // ce sera plus rapide
    assert.equal(user.el.innerHTML, '  <button>hello</button>');
  });


  it('should replace the content of a custom element with multiple nodes', function() {
    var list = brick('<div><user>  <h1>hello</h1><button>world</button></user></div>');
    var user = brick('<div><h2>brick</h2><content></content></div>');

    list.tag('user', user);
    list.bind();

    // note on doit utiliser un fragment 
    // ce sera plus rapide
    assert.equal(user.el.innerHTML, '<h2>brick</h2>  <h1>hello</h1><button>world</button>');
  });

  it('should replace the content of a custom element with query selection', function() {
    var list = brick('<div><user><h1>hello</h1><button>world</button></user></div>');
    var user = brick('<div><content select="button"></content></div>');

    list.tag('user', user);
    list.bind();

    // note on doit utiliser un fragment 
    // ce sera plus rapide
    assert.equal(user.el.innerHTML, '<button>world</button>');
  });

  it('should bind a custom element inner content', function() {
    var list = brick('<div><user>${name}</user></div>', {
      name: 'olivier'
    });
    var user = brick('<div>${name} and <content></content></div>', {
      name: 'bruno'
    });

    list.tag('user', user);

    list.bind();

    assert.equal(user.el.innerHTML, 'bruno and olivier');

    list.set('name', 'bredele');

    assert.equal(user.el.innerHTML, 'bruno and bredele');

    user.set('name', 'amy');
    assert.equal(user.el.innerHTML, 'amy and bredele');

  });

});

// describe("#append", function() {

//   var doc, obj;
//   beforeEach(function() {
//     doc = document.createElement('div');
//     obj = brick('<button class="${name}">', {
//       name: 'olivier'
//     });
//   });

//   it("should append a brick into a dom element", function() {
//     obj.to(doc);
//     assert.equal(doc.firstChild, obj.el);
//   });

//   it("should also build a brick", function() {
//     obj.to(doc);
//     assert.equal(obj.el.className, 'olivier');
//   });
  
//   it("should query select a dom element and append the brick to it", function() {
//     document.body.insertAdjacentHTML('beforeend', '<article class="article">');
//     obj.to('.article');
//     assert.equal(document.querySelector('.article').firstChild, obj.el);
//   });

// });


// describe('constructor', function() {

//   it('should ', function() {
//     var div = document.createElement('div');
//     var lego = brick('<button>hello</button>', div);
//     assert.equal(div.innerHTML, '<button>hello</button>');
//   });


// });