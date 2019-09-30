//
//  Entry point for the server side.
//
import * as path from 'path'
import * as http from 'http'

import * as express from 'express'

import * as db from './database'
import createAuthRouter, { cookie, sessionStore, getUserFromRequest } from './server/auth'
import attachWebsocketEndpoint from './server/websocket'

import serveComponent from './server/serve-component'

import Root from './component/Root'
import Frame from './component/Frame'

const StaticDir = 'static'

const app = express()
app.disable('x-powered-by')

app.use(express.static(path.resolve(__dirname, '..', StaticDir)))

app.use(createAuthRouter())

app.get('/', (req: any, res: any) => {
  const user = getUserFromRequest(req)

  serveComponent(
    res,
    Frame, { title: 'insert something meaningful here' },
    Root, { loggedIn: (user != null) }
  )
})

app.use((_req, res) => {
  res.status(404).sendFile(
    'notfound.html',
    { root: path.resolve(__dirname, 'page') }
  )
})

const server = http.createServer(app)
attachWebsocketEndpoint({
  db,
  server,
  cookie,
  sessionStore
})

// Go.
db.check((error: Error) => {
  if (error != null) {
    console.error(error)
    process.exit(3)
  }

  server.listen(process.env.PORT || 31337, () => {
    console.log(server.address())
  })
})
