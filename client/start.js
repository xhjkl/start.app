//
// Top-level entry point in the app bundle
//
// This should never be run on the server side.
//
import React from 'react';
import ReactDOM from 'react-dom';

import Root from './root';

ReactDOM.render(React.createElement(Root, null), document.querySelector('div#root'));
