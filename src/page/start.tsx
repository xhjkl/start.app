//
//  Top-level entry point in the app bundle.
//
import { createElement } from 'react'
import { hydrate } from 'react-dom'

import Root from '../component/Root'

const start = () => {
  const root = document.querySelector('#root')
  const preservedPropsContainer = document.querySelector('head>script[type=x-data]')
  const preservedProps = (
    preservedPropsContainer != null && preservedPropsContainer.textContent != null
      ? preservedPropsContainer.textContent
      : null
  )
  const props = preservedProps != null ? JSON.parse(preservedProps) : {}
  hydrate(createElement(Root, props), root)
}

if (document.readyState === 'complete') {
  // Ensuring async.
  setTimeout(start, 0)
} else {
  addEventListener('DOMContentLoaded', start) // eslint-disable-line no-undef
}
