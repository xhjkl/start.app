//
//  Separated logic for Websocket message handling
//
import { Server } from 'ws'

let onWebsocketMessage = (message, channel, user) => {
  channel.send(`hey, ${ user }`)
}

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
