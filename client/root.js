//
// Root component
//
import React from 'react'
import { injectGlobal } from 'styled-components'

injectGlobal`
  html, body, #root {
    font: 100% sans-serif;
    background: hsl(0, 0%, 97%);
    display: flex;
    flex-direction: column;
    min-width: 100vw;
    min-height: 100vh;
    margin: 0;
    padding: 0;
  }
`

export default class Root extends React.Component {

  constructor(props) {
    super(props)
    this.state = { ...this.props }
    this.db = null
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
