//
// Respond with a pre-rendered root component
//
import React from 'react';
import { renderToString } from 'react-dom/server';
import { ServerStyleSheet } from 'styled-components';

// Instantiate `componentClass` with `props`, bake it in a string, and end the `res` with it
export default function serveComponent(res, componentClass, props) {

  let compo = React.createElement(componentClass, props);
  let sheet = new ServerStyleSheet();
  let rendered = renderToString(sheet.collectStyles(compo));
  let preservedProps = JSON.stringify(props);

  let markup = '<!doctype html>\n';
  if (res.title != null) {
    markup += `<title>${ res.title }</title>`;
  }
  markup += `<script type=x-data>${ preservedProps }</script>`;
  markup += '<meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no">';
  markup += sheet.getStyleTags();
  markup += '<script async src="/app.js"></script>';
  markup += `<div id=root>${ rendered }`;

  res.setHeader('Content-Type', 'text/html; charset=utf-8');

  res.end(markup);
}
