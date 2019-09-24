//
// Respond with a pre-rendered root component
//
import * as React from 'react'
import { renderToString, renderToStaticNodeStream } from 'react-dom/server'
import { renderStylesToString } from 'emotion-server'

export default (res, frameClass, frameProps, mainClass, mainProps) => {
  const mainCompo = React.createElement(mainClass, mainProps)
  const mainMarkup = renderStylesToString(renderToString(mainCompo))

  const frameCompo = React.createElement(frameClass, {
    ...frameProps,
    ...{ mainMarkup, mainProps }
  })

  const markup = renderToStaticNodeStream(frameCompo)

  res.setHeader('Content-Type', 'text/html; charset=utf-8')
  res.write('<!doctype html>\n')
  markup.pipe(res, { end: true })
}
