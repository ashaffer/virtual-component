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

function factory (component, props, children) {
  if (!props) props = {}

  const render = component.render || component

  props.children = children

  if (component.transformProps) {
    props = component.transformProps(props)
  }

  return {
    props,
    type: 'Thunk',
    component,
    render (prev) {
      let vnode

      if (!prev || !isSameThunk(prev, this)) {
        this.hookKey = uid()
        execHook(component.beforeMount, props)
        return applyHook(chainThunks(render(props), this), this.hookKey, createComponentHook(component, props))
      } else if (shouldUpdate(component, prev.props, props)) {
        execHook(component.beforeUpdate, prev.props, props)
        setTimeout(() => execHook(component.afterUpdate, prev.props, props))

        vnode = chainThunks(render(props), this)
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

function chainThunks (thunk, prev) {
  if (!isThunk(thunk)) return thunk

  const prevThunk = prev.nextThunk
  prev.nextThunk = thunk
  thunk.vnode = thunk.render(prevThunk)

  return thunk.vnode
}

function isThunk (t) {
  return t && t.type === 'Thunk'
}

function applyHook (vnode, key, hook) {
  vnode.hooks = vnode.hooks || {}
  vnode.properties = vnode.properties || {}
  vnode.hooks[key] = vnode.properties[key] = hook

  return vnode
}

function isSameThunk (prev, cur) {
  return isThunk(prev) && prev.component === cur.component
}

function createComponentHook (component, props) {
  return Object.create({
    hook: () => setTimeout(() => execHook(component.afterMount, props)),
    unhook: () => execHook(component.beforeUnmount, props)
  })
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
    return action
  }
}

function dispatch (action) {
  const ev = new CustomEvent(ActionEvent, {detail: action})
  // XXX This is a temporary solution until we settle on a better way of
  // accomplishing this.  dispatchEvent is imperative and not universal.
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
