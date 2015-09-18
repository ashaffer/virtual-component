/**
 * Imports
 */

import shallow from 'shallow-equals'

/**
 * Virtual component
 */

function component (comp, props) {
  if (typeof comp === 'function') {
    comp = {render: comp}
  }

  const shouldUpdate = comp.shouldUpdate || notEqual

  return {
    props,
    type: 'Thunk',
    render(prev) {
      if (!prev) return comp.render(props)

      if (shallow(props.children, prev.props.children)) {
        props.children = prev.props.children
      }

      return shouldUpdate(props, prev.props)
        ? comp.render(props)
        : prev.vnode
    }
  }
}

function notEqual (cur, prev) {
  return !shallow(cur, prev)
}

/**
 * Exports
 */

export default component
