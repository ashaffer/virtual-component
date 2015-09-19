/**
 * Imports
 */

import shallow from 'shallow-equals'
import uid from 'get-uid'

/**
 * Action event name
 */

const ActionEvent = 'virtual-component-action'

/**
 * Virtual component
 */

function factory (component, props) {
  const render = component.render || component

  return {
    props,
    type: 'Thunk',
    component,
    render (prev) {
      if (!prev || !isSameThunk(prev, this)) {
        this.hookKey = uid()
        return applyHook(render(props), this.hookKey, createComponentHook(component, props))
      } else if (shouldUpdate(component, prev.props, props)) {
        execHook(component.beforeUpdate, prev.props, props)
        setTimeout(() => execHook(component.afterUpdate, prev.props, props))

        const vnode = render(props)
        this.hookKey = prev.hookKey
        vnode.properties[this.hookKey] = prev.vnode.properties[this.hookKey]
        vnode.properties[this.hookKey].props = this.props
        return vnode
      } else {
        this.hookKey = prev.hookKey
        prev.vnode.properties[this.hookKey].props = this.props
        return prev.vnode
      }
    }
  }
}

function applyHook (vnode, key, hook) {
  vnode.hooks = vnode.hooks || {}
  vnode.properties = vnode.properties || {}
  vnode.hooks[key] = vnode.properties[key] = hook

  return vnode
}

function isSameThunk (prev, cur) {
  return prev.type === 'Thunk' && prev.component === cur.component
}

function createComponentHook (component, props) {
  const hook = createHook(
    function hook () {
      execHook(component.beforeMount, this.props)
      setTimeout(() => execHook(component.afterMount, this.props))
    },
    function unhook () {
      execHook(component.beforeUnmount, this.props)
    }
  )

  hook.props = props
  return hook
}

function createHook (hook, unhook) {
  return Object.create({hook, unhook})
}

function shouldUpdate (component, prevProps, nextProps) {
  if (prevProps && nextProps && shallow(prevProps.children, nextProps.children)) {
    nextProps.children = prevProps.children
  }

  return component.shouldUpdate
    ? component.shouldUpdate(prevProps, nextProps)
    : !shallow(prevProps, nextProps)
}

function execHook (fn, ...args) {
  if (fn) {
    const action = fn(...args)
    action && dispatch(action)
  }
}

function dispatch (action) {
  const ev = new CustomEvent(ActionEvent, {detail: action})
  setTimeout(() => window.dispatchEvent(ev))
}

function listen (fn) {
  window.addEventListener(ActionEvent, listener, true)
  return () => window.removeEventListener(ActionEvent, listener, true)

  function listener (e) {
    fn(e.detail)
  }
}

/**
 * Exports
 */

export default factory
export {listen}
