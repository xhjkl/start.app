//
// Root component
//
//
import React from 'react';
import ReactDOM from 'react-dom';

export default class Root extends React.Component {

  constructor(props) {
    super(props);
    this.state = {};
  }

  render() {
    const $ = React.createElement;
    return $('div', null,
      $('h1', null, 'Hey'),
      $('div', null,
        $('a', { href: '/auth/twitter' }, 'Log in with Twitter')
      ),
      $('div', null,
        $('a', { href: '/auth/github' }, 'Log in with Github')
      ),
    );
  }
};
