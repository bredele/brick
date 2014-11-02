
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
  });

  it("should have the following API", function() {
    assert(obj.dom);
    assert(obj.freeze);
    assert(obj.register);
    assert(obj.build);
    assert(obj.attr);
    assert(obj.use);
  });
  
});

describe("Basic rendering", function() {

  var obj;
  beforeEach(function() {
    obj = brick();
  });


  it("should render string into dom", function() {
    obj.dom('<button>hello</button>');
    assert.equal(obj.el.innerHTML, 'hello');
    assert.equal(obj.el.nodeName, 'BUTTON');
  });

  it("should render from existing dom", function() {
    var div = document.createElement('ul');
    obj.dom(div);
    
    assert.equal(obj.el.nodeName, 'UL');
  });

  it('should render from query selection', function() {
    document.body.insertAdjacentHTML('beforeend', '<section class="brick-test">');
    obj.dom('.brick-test');

    assert.equal(obj.el.nodeName, 'SECTION');
    assert.equal(obj.el.getAttribute('class'), 'brick-test');
  });

});

describe("Attribute bindings", function() {
  
  var obj;
  beforeEach(function() {
    obj = brick();
    obj.dom('<section class="section" data-test="hello">content</section>');
  });

  it("should apply binding", function(done) {
    obj.attr('data-test', function(node, content) {
      if(content === 'hello') done();
    });
    obj.build();
  });

  it('should scope binding with itself', function(done) {
    obj.set('name', 'olivier');
    obj.attr('data-test', function(node, content) {
      if(this.get('name') === 'olivier') done();
    });
    obj.build();
  });

  it('should apply multiple bindings', function() {
    var result = '';
    obj.attr({
      'data-test' : function(node, content) {
        result += content;
      },
      'class' : function(node, content) {
        result += content;
      }
    });
    obj.build();
    assert.equal(result, 'sectionhello');
  });

});

describe("Constructor", function() {

  it("should set template", function() {
    var obj = brick('<button>hello</button>');
    assert.equal(obj.el.innerHTML, 'hello');
    assert.equal(obj.el.nodeName, 'BUTTON');
  });
  
  it("should set model", function() {
    var obj = brick('<button>hello</button>', {
      name: 'olivier'
    });
    assert.equal(obj.get('name'), 'olivier');

  });
});

describe("Freeze", function() {
  
  it("should return a new brick", function() {
    var obj = brick('<section class="section">')
      .use('section', function(node, content) {
        node.innerHTML = content;
      });

    var other = obj.freeze();
    other.build();

    assert.equal(obj.el.innerHTML, '');
    assert.equal(other.el.innerHTML = 'section');
  });
  
});



