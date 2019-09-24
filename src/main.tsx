//
//  Entry point for the server side.
//
import * as path from 'path'
import * as http from 'http'

import * as express from 'express'

import * as db from './database'
import auth from './server/auth'
import attachWebsocketEndpoint from './server/websocket'

import serveComponent from './server/serve-component'

import Root from './component/root'
import Frame from './component/frame'

const StaticDir = 'static'
const BuildDir = 'build'

const app = express()
app.disable('x-powered-by')

app.use(express.static(path.resolve(__dirname, '..', '..', StaticDir)))
app.use(express.static(path.resolve(__dirname, '..', '..', BuildDir)))

auth.setRoutes(app)

app.get('/', (req, res) => {
  const user = (req.session.passport && req.session.passport.user) || null

  serveComponent(
    res,
    Frame, { title: 'insert something meaningful here' },
    Root, { loggedIn: (user != null) }
  )
})

app.use((req, res) => {
  res.status(404).sendFile(
    'notfound.html',
    { root: path.resolve(__dirname, '..', '..', 'src', 'client') }
  )
})

const server = http.createServer(app)
attachWebsocketEndpoint({
  db,
  server,
  cookie: auth.cookie,
  sessionStore: auth.sessionStore
})

// Go.
db.check((error) => {
  if (error != null) {
    console.error(error)
    process.exit(3)
  }

  server.listen(process.env.PORT || 31337, () => {
    console.log(server.address())
  })
})
