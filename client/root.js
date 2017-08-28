//
// Root component
//
import React from 'react'

export default class Root extends React.Component {

  constructor(props) {
    super(props)
    this.state = {
      loggedIn: this.props.loggedIn,
    }
  }

  render() {
    const $ = React.createElement
    const { loggedIn } = this.state

    let all = []
    if (loggedIn) {
      all = [
        $('h1', null, 'Hey, love'),
        $('div', null,
          $('a', { href: '/deauth' }, 'Log out')
        ),
      ]
    } else {
      all = [
        $('h1', null, 'Hey'),
        $('div', null,
          $('a', { href: '/auth/twitter' }, 'Log in with Twitter')
        ),
        $('div', null,
          $('a', { href: '/auth/github' }, 'Log in with Github')
        ),
      ]
    }

    return $('div', null,
      ...all
    )
  }
}
