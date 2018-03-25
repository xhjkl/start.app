//
//  Entry point for the server side
//
const path = require('path')
const http = require('http')

const dotenv = require('dotenv').config()
if (dotenv.error != null) {
  console.error('check dotenv:', dotenv.error)
  process.exit(3)
}
const express = require('express')

require('babel-register')

const { default: db } = require('./lib/db')
const { default: auth } = require('./lib/auth')
const { default: attachWebsocketEndpoint } = require('./lib/websocket')

const { default: serveComponent } = require('./lib/serve-component')
const Root = require('./client/root').default
const Frame = require('./client/frame').default

const StaticDir = 'static'

let app = express()
app.disable('x-powered-by')

app.use(express.static(path.resolve(__dirname, StaticDir)))

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
  res.status(404).sendFile('notfound.html', { root: __dirname })
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
