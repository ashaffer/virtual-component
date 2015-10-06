
# virtual-component

[![js-standard-style](https://img.shields.io/badge/code%20style-standard-brightgreen.svg?style=flat)](https://github.com/feross/standard)

Components for virtual-dom

## Installation

    $ npm install virtual-component

## Usage

virtual-component enables you to write react/deku style components in your virtual-dom application.  E.g.

```javascript
import fetch from 'declarative-fetch'

function beforeMount (props) {
  return actions.fetchStories(props.categoryId)
}

function render (props) {
  return (
    <div>
      {
        props.children.map(story => <Story story={story} />)
      }
    </div>
  )
}

export default {
  beforeMount,
  render
}
```

### Hooks

It supports the following hooks:

  * `beforeMount(props)` - Before the initial DOM element is created
  * `beforeUpdate(prevProps, nextProps)` - Before a state update (not called on initial render)
  * `afterUpdate(prevProps, nextProps)` - After a state update (not called on initial render).
  * `afterMount(props)` - After the initial DOM element is rendered
  * `beforeUnmount(props)` - Before the DOM element is removed
  * `transformProps(props)` - Transforms props before they are passed to any of the above.  Takes props as an argument, returns a new props object.

Each of these hooks takes a single argument: `props`.  And it may return a single-value, an action, which can be listened to at the top-level of your application, like so:

```javascript
import {listen} from 'virtual-component'
import store from 'my-redux-store'

listen(store.dispatch)
```

### shouldUpdate

By default your component assumes that your `props` are immutable, and will only update when there is a shallow change in your `props` object.  If you want to change this behavior, your component may export a `shouldUpdate` function:

```javascript
function shouldUpdate (nextProps, prevProps) {
  return nextProps.someKey !== prevProps.someKey
}

function render (props) {
  // ...Etc
}

export default {
  render,
  shouldUpdate
}
```

### children

The props object passed to your component has a single special property: `children`.  It consists of the child nodes (if any) of your component.  E.g.

```
function List (props) {
  return (
    <ul>
      {
        props.children.map(item => <li>{item}</li>)
      }
    </ul>
  )
}

function PrimaryColors (props) {
  return (
    <List>
      <span>red</span>
      <span>green</span>
      <span>blue</span>
    </List>
  )
}
```

### Single function component

If you don't want to use any hooks and you don't want to use `shouldUpdate`, as most of your components should, then you may just export a single function: `render`, with no object wrapper.  E.g.

```javascript
export default function render (props) {
  // Render some stuff
}
```


This works particularly well with a [redux](https://github.com/rackt/redux) store, and [vdux](https://github.com/ashaffer/vdux) bridge between [virtual-dom](https://github.com/Matt-Esch/virtual-dom) and redux.

Using [redux-effects](https://github.com/redux-effects/redux-effects), you can also keep all side-effects out of your hooks and only return pure values, but that is optional.


### Notes

  * The `window.dispatchEvent` stuff is a temporary hack until I think of a better way of doing that.

If you have any suggestions for either of these, please let me know.


## License

The MIT License

Copyright &copy; 2015, Weo.io &lt;info@weo.io&gt;

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
