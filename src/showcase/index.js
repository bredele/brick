
//dependencies

var View = require('maple/view'),
		Event = require('event-plugin'),
		showcase = require('./showcase'),
		slide = require('scroll-to');


//init

var view = new View(),
    body = document.body;


//bindings

view.data('event', new Event({
	scroll: function() {
		slide(0, 800, {
			ease: 'in-out-expo',
			duration: 800
		});
	},
	showcase: function() {
		body.appendChild(showcase.dom);
	}
}));
view.alive(body, true);
