//
// Root component
//
import * as React from 'react'
import { injectGlobal } from 'emotion'

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

  constructor (props) {
    super(props)
    this.state = { ...this.props }
  }

  render () {
    const { loggedIn } = this.state

    if (loggedIn) {
      return (<div>
        <h1>Hey, love</h1>
        <div>
          <a href='/death'>Log out</a>
        </div>
      </div>)
    } else {
      return (<div>
        <h1>Hey</h1>
        <div>
          <a href='/auth/twitter'>Log in with Twitter</a>
        </div>
        <div>
          <a href='/auth/github'>Log in with Github</a>
        </div>
      </div>)
    }
  }
}
