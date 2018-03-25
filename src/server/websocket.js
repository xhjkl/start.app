//
//  Separated logic for Websocket message handling
//
import { Server } from 'ws'

import db from './db'

// Respond to a Websocket message
//
//  The client side could use Graphql to retrieve data of interest.
//
//  Within this channel, each message is interpreted as a Graphql request,
//  which shall be immediately responded to.
//
//  Currently this is the only way the Websocket connection is used.
//  If there appear other applications of Websocket, it would be a good idea to assign a route to each one,
//  and distinguish them by `upgradeReq.url`.
//
let onWebsocketMessage = (message, channel, user) => {
  const query = '' + message
  db.query(query, { user }).then((response) => {
    channel.send(JSON.stringify(response))
  }).catch((error) => db.queryFailure(error, query))
}

// Make Websocket work
//
//  server -- `http.Server` instance
//  cookie -- cookie parser instance
//  sessionStore -- session store
//
export default ({ server, cookie, sessionStore }) => {
  let wsServer = new Server({ server })
  wsServer.on('connection', (channel, upgradeReq) => {
    cookie(upgradeReq, null, (error) => {
      if (error != null) {
        console.error(error)
        return
      }

      let sessionId = upgradeReq.signedCookies.a
      sessionStore.get(sessionId, (error, sessionData) => {
        if (error != null) {
          console.error(error)
          return
        }

        let user = (sessionData.passport && sessionData.passport.user) || null
        channel.on('message', (message) => onWebsocketMessage(message, channel, user))
      })
    })
  })
}
