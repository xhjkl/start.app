//
// Respond with a pre-rendered root component
//
import * as React from 'react'
import { renderToString, renderToStaticNodeStream } from 'react-dom/server'
import { renderStylesToString } from 'emotion-server'

export default (res, frameClass, frameProps, mainClass, mainProps) => {

  let mainCompo = React.createElement(mainClass, mainProps)
  let mainMarkup = renderStylesToString(renderToString(mainCompo))

  let frameCompo = React.createElement(frameClass, {
    ...frameProps,
    ...{ mainMarkup, mainProps }
  })

  let markup = renderToStaticNodeStream(frameCompo)

  res.setHeader('Content-Type', 'text/html; charset=utf-8')
  res.write('<!doctype html>\n')
  markup.pipe(res, { end: true })
}
