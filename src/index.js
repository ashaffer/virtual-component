/**
 * Imports
 */

import shallow from 'shallow-equals'

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
    render: function (prev) {
      if (!prev) {
        hook(component.beforeMount, props)
        setTimeout(() => hook(component.afterMount, props))
        return render(props)
      }

      if (shouldUpdate(component, prev.props, props)) {
        hook(component.beforeUpdate, prev.props, props)
        setTimeout(() => hook(component.afterUpdate, prev.props, props))
        return render(props)
      } else {
        return prev.vnode
      }
    }
  }
}

function shouldUpdate (component, prevProps, nextProps) {
  if (prevProps && nextProps && shallow(prevProps.children, nextProps.children)) {
    nextProps.children = prevProps.children
  }

  return component.shouldUpdate
    ? component.shouldUpdate(prevProps, nextProps)
    : !shallow(prevProps, nextProps)
}

function hook (fn, ...args) {
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
