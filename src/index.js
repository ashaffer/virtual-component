/**
 * Imports
 */

import shallow from 'shallow-equals'

/**
 * Virtual component
 */

class Component {
  constructor (component, props) {
    if (typeof component === 'function') {
      component = {render: component}
    }

    this.type = 'Thunk'
    this._shouldUpdate = component.shouldUpdate || notEqual
    this.component = component
    this.props = props
  }

  shouldUpdate (prev) {
    if (shallow(this.props.children, prev.children)) {
      this.props.children = prev.children
    }

    return this._shouldUpdate(this.props, prev)
  }

  dispatch (name, action) {
    const ev = new CustomEvent(name, {detail: action})
    window.dispatchEvent(ev)
  }

  beforeMount () {
    if (this.component.beforeMount) {
      this.dispatch(this.component.beforeMount(this.props))
    }
  }

  beforeRender () {
    if (this.component.beforeRender) {
      this.dispatch(this.component.beforeRender(this.props))
    }
  }

  render (prev) {
    if (!prev) {
      this.beforeMount()
      setTimeout(() => this.afterMount())
    }

    if (!prev || this.shouldUpdate(prev.props)) {
      this.beforeRender()
      setTimeout(() => this.afterRender())
      return this.component.render(this.props)
    } else {
      return prev.vnode
    }
  }

  afterRender () {
    if (this.component.afterRender) {
      this.dispatch(this.component.afterRender(this.props))
    }
  }

  afterMount () {
    if (this.component.afterMount) {
      this.dispatch(this.component.afterMount(this.props))
    }
  }
}

function notEqual (cur, prev) {
  return !shallow(cur, prev)
}

/**
 * Exports
 */

export default Component
