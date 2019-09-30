import * as url from 'url'

import * as pg from 'pg'

/** Crash because of a db error. */
export const dbFailure = (error) => {
  console.error('db failure:', error)
  process.exit(33)
}

/** Crash because of a query resolution failure. */
export const queryFailure = (error, query = '') => {
  console.error('while querying:', error)
  console.error('  provoking expression:', query)
  process.exit(8)
}

const parts = url.parse(process.env.DATABASE_URI!)
const auth = parts.auth != null ? parts.auth.split(':') : ['', '']
const configuration = {
  user: auth[0],
  password: auth[1],
  host: parts.hostname,
  port: parts.port != null ? +parts.port : 5432,
  database: parts.pathname!.split('/')[1],
  ssl: (process.env.NODE_ENV === 'production')
}

export const pool = new pg.Pool(configuration)

/** Preflight smoketest. */
export const check = (done) => {
  pool.query('select true as answer', (error, re) => {
    if (error != null) {
      done(error)
      return
    }

    const { answer } = re.rows[0]
    if (answer !== true) {
      done(new Error(`db failure: expected \`true\` to be returned from db; got ${answer}`))
      return
    }

    done(null)
  })
}
