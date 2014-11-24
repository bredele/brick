# Brick

Brick reduces boilerplate by implementing amongst others, reactive one way binding.

```js
brick('<div>Hello ${ name }</div>', {
  name: 'olivier'
}).to(document.body);
```
see [live example]()

Brick doesn't stop there though. Despite its small size (2kb) it has a fair bit of power under the hood and a ridiculously small learning curve. 

## Learn BRICK in 5 minutes

<!-- ## Brick is your living data -->

### brick is a [datastore](http://github.com/bredele/datastore)

A brick is a datastore, a bloat-free layer to manipulate your data.

```js
var user = brick();
user.set('name','olivier');
user.set('age', 26);
user.get('name'); // => olivier
user.compute('birthday', function() {
  return this.name + 'is ' + this.age;
});
```
see [datastore](http://github.com/bredele/datastore) for full API.

### brick is an [emitter](http://github.com/component/emitter)

A brick is an observable. it allows you to publish/subscribe events and also to get notified when there has been a change of data or in its [state]().

```js
user.on('change birthday', function(val) { 
  // => olivier is 27
});
user.set('age', 27);
```

This notifications allows the brick to produce updated output and HTML.

see [emitter](http://github.com/component/emitter) for full API.

<!-- ## Brick is your living dom -->

### brick is reactive 

Brick updates your HTML whenever the underlying data changes.

```js
var birthday = brick('<div>${name} is ${age}</div>');
birthday.set('name', 'olivier');
birthday.set('age', 27);
```

It eliminates DOM manipulation from the list of things you have to worry about.

Did you see the expressions surrounded by ```${}```? That's the template engine provided by Brick also called data interpolation. It works on every DOM and SVG nodes and is basically a subset of JavaScript:

```html
<div class="twitter ${theme}">
	<p>${text}</p>
	<span>${ text.length } character${text.length > 0 ? 's' : ''}</span>
</div>
```


## License

The MIT License (MIT)

Copyright (c) 2014 Olivier Wietrich <olivier.wietrich@gmail.com>

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
