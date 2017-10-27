//
// Respond with a pre-rendered root component
//
import React from 'react'
import { renderToString, renderToStaticNodeStream } from 'react-dom/server'
import { ServerStyleSheet } from 'styled-components'

// Serve component
export default function serveComponent(res, frameClass, frameProps, mainClass, mainProps) {

  let sheet = new ServerStyleSheet()
  let mainCompo = React.createElement(mainClass, mainProps)
  let mainMarkup = renderToString(sheet.collectStyles(mainCompo))

  let styles = sheet.getStyleElement()

  let frame = React.createElement(frameClass, { ...frameProps, ...{ mainMarkup, mainProps, styles } })

  let markup = renderToStaticNodeStream(frame)

  res.setHeader('Content-Type', 'text/html; charset=utf-8')
  res.write('<!doctype html>\n')
  markup.pipe(res, { end: true })
}
