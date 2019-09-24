//
//  Top-level entry point in the app bundle.
//
import { createElement } from 'react'
import { hydrate } from 'react-dom'

import Root from './root'

const start = () => {
  let root = document.querySelector('#root')
  let preservedPropsContainer = document.querySelector('head>script[type=x-data]')
  let preservedProps = (
    preservedPropsContainer != null && preservedPropsContainer.textContent != null
      ? preservedPropsContainer.textContent
      : void null
  );
  let props = preservedProps != null ? JSON.parse(preservedProps) : {}
  hydrate(createElement(Root, props), root)
}

if (document.readyState === 'complete') {
  // Ensuring async.
  setTimeout(start, 0)
} else {
  addEventListener('DOMContentLoaded', start)
}
