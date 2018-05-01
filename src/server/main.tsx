//
//  Entry point for the server side
//
import * as path from 'path'
import * as http from 'http'

// We can not use static imports in the main module
// because we want to populate the env before loading the deps.
const dotenv = require('dotenv')
const { parsed: parsedDotenv, error: dotenvError } = dotenv.config()
if (dotenvError != null) {
  console.error('check dotenv:', dotenvError)
  process.exit(3)
}

const express = require('express')

const db = require('./db').default
const auth = require('./auth').default
const attachWebsocketEndpoint = require('./websocket').default

const serveComponent = require('./serve-component').default
const Root = require('../client/root').default
const Frame = require('../client/frame').default

const StaticDir = 'static'
const BuildDir = 'build'

let app = express()
app.disable('x-powered-by')

app.use(express.static(path.resolve(__dirname, '..', '..', StaticDir)))
app.use(express.static(path.resolve(__dirname, '..', '..', BuildDir)))

auth.setRoutes(app)

app.get('/', (req, res) => {
  let user = (req.session.passport && req.session.passport.user) || null

  serveComponent(
    res,
    Frame, { title: 'insert something meaningful here' },
    Root, { loggedIn: (user != null) },
  )
})

app.use((req, res) => {
  res.status(404).sendFile('notfound.html', { root: path.resolve(__dirname, '..', 'client') })
})

let server = http.createServer(app)
attachWebsocketEndpoint({ server, cookie: auth.cookie, sessionStore: auth.sessionStore })

// Go
db.check((error) => {
  if (error != null) {
    console.error(error)
    process.exit(3)
  }

  server.listen(process.env.PORT || 31337, () => {
    console.log(server.address())
  })
})
