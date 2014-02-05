# maple

  > work in progress

  webapp toolset

## Installation

  Install with [component](http://component.io):

    $ component install leafs/maple

## Concept

### View and Bindings


Views in Maple.js are reusable components that help you to create a DOM element from a template:

```js
var view = require('maple/view');

view()
  .html('<div id="myElement"></div>')
  .insert(document.body);
```

> A template can be a string, a DOM element or a custom function.

A view is the behavior behind this DOM element. It updates itself when the model changes, registers sophisticated bindings and control the element life cycle:

```js
view()
  .html('<div plugin>{label}</div>', {
    label: 'maple'
  })
  .plug('plugin', function(node) {
    //do something on node
  })
  .insert(document.body);
```

Plugins (method `plug`) in Maple.js are attributes that link a DOM node with a piece of JavaScript logic in a MVVM fashion. There is already plugins to handler user events, hide or show elements, repeat elements once per item into a store, etc. What's great is that you can reuse these plugins or create your own.

> see [binding](http://github.com/bredele/binding) for more information.


### Store and Emitter

### Architecture


## License

The MIT License (MIT)

Copyright (c) 2014 Olivier Wietrich <olivier.wietrich@gmail.com>

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
