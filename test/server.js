/**
 * Test dependencies.
 */

var assert = require('assert');
var roof = require('roof');
var brick = require('..');


describe("server side rendering", function() {

	it('should render simple element', function() {
		var span = brick('<span>hello</span>');
		var el = span.el;
		assert.equal(el.localName, 'span');
		assert.equal(el.innerHTML, 'hello');
	});

	it('should interpolate template with data', function() {
		var span = brick('<span class="${label}">${label}</span>', {
			label: 'hello'
		});
		span.render();
		var el = span.el;
		assert.equal(el.innerHTML, 'hello');

		span.set('label', 'world');
		assert.equal(el.outerHTML, '<span class="world">world</span>');
	});
});