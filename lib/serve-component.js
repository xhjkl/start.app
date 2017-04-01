//
// Respond with a pre-rendered root component
//
import React from 'react';
import ReactDOM from 'react-dom/server';

// Bake `compo` in a string and end the `res` with it
export default function serveComponent(res, compo, { title }) {

  let rendered = ReactDOM.renderToString(compo);

  let markup = '<!doctype html>\n';
  if (title != null) {
    markup += `<title>${ title }</title>`;
  }
  markup += '<meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no">';
  markup += '<link rel=stylesheet href="/style.css">';
  markup += '<script async src="/app.js"></script>';
  markup += `<div id=root>${ rendered }`;

  res.end(markup);
};
