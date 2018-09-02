//
//  Parts reusable across datastore submodules
//
import * as url from 'url'

import * as pg from 'pg'

// Crash because of db error
export let dbFailure = (error) => {
  console.error('db failure:', error)
  process.exit(33)
}

// Crash because of query resolution failure
export let queryFailure = (error, query = '') => {
  console.error('while querying:', error)
  console.error('  provoking expression:', query)
  process.exit(8)
}

const parts = url.parse(process.env.DATABASE_URL)
const auth = parts.auth != null ? parts.auth.split(':') : ['', '']
const configuration = {
  user: auth[0],
  password: auth[1],
  host: parts.hostname,
  port: parts.port,
  database: parts.pathname != null ? parts.pathname.split('/')[1] : null,
  ssl: (process.env.NODE_ENV === 'production'),
}

export let pool = new pg.Pool(configuration)
export let connect = pool.connect.bind(pool)

// Preflight smoketest
export let check = (done) => {
  pool.query('select true as answer', (error, re) => {
    if (error != null) {
      done(error)
      return
    }

    let { answer } = re.rows[0]
    if (answer !== true) {
      done(new Error(`db failure: expected true to be returned from db; got ${ answer }`))
      return
    }

    done(null)
  })
}
