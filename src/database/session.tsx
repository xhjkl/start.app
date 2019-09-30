//
//  Session keeping
//
import { Store } from 'express-session'
import { Pool } from 'pg' // eslint-disable-line no-unused-vars

import { dbFailure } from './common'

/** Pre-user data storage that uses Postgres as the backend. */
export class PGSessionStore extends Store {
  pool: Pool

  constructor ({ pool }: { pool: any }) {
    super()
    this.pool = pool
  }

  get: (sid: string, callback: (err: any, session?: Express.SessionData | null) => void) => void = (sid, fn) => {
    this.pool.query(
      `
        select "associated_data"
        from "session"
        where "token" = $1
        limit 1
      `,
      [sid]
    ).then((res) => {
      if (res.rowCount < 1) {
        // Stale or corrupted token
        return fn(null, null)
      }

      const obj = res.rows[0].associated_data
      fn(null, obj)
    }).catch(dbFailure)
  }

  set: (sid: string, session: Express.SessionData, callback?: (err?: any) => void) => void = (sid, sess, done = () => {}) => {
    const payload = JSON.stringify(sess)
    let userid = null
    if (sess.passport != null && sess.passport.user != null) {
      userid = sess.passport.user
    }
    this.pool.query(
      `
        insert into "session"("user_id", "token", "associated_data")
        values ($1, $2, $3)
        on conflict ("token") do update set "user_id" = $1, "associated_data" = $3
      `,
      [userid, sid, payload]
    ).then((res) => {
      if (res.rowCount < 1) {
        // Stale or corrupted token
        return done(null)
      }

      done(null)
    }).catch(dbFailure)
  }

  destroy: (sid: string, callback?: (err?: any) => void) => void = (sid, done = () => {}) => {
    this.pool.query(
      `
        delete from "session"
        where "token" = $1
      `,
      [sid]
    ).then(() => {
      done(null)
    }).catch(dbFailure)
  }

  clear: (callback?: (err?: any) => void) => void = (done = () => {}) => {
    this.pool.query(
      `
        delete from "session"
      `,
      []
    ).then(() => {
      done(null)
    }).catch(dbFailure)
  }

  touch: (sid: string, session: Express.SessionData, callback?: (err?: any) => void) => void = (sid, sess, done) => {
    // Relying on triggers to refresh the timestamp.
    this.set(sid, sess, done)
  }

  ids: (callback?: (err?: any, result?: any) => void) => void = (done = () => {}) => {
    this.pool.query(
      `
        select "token"
        from "session"
      `,
      []
    ).then((res) => {
      const ids = res.rows.map((row) => row.token)
      done(null, ids)
    }).catch(dbFailure)
  }

  all: (callback: (err: any, obj?: { [sid: string]: Express.SessionData; } | null) => void) => void = (done) => {
    this.pool.query(
      `
        select "token", "associated_data"
        from "session"
      `,
      []
    ).then((res) => {
      const all = Object.assign(res.rows.map(({ token, associated_data: x }) => ({ [token]: x })))
      done(null, all)
    }).catch(dbFailure)
  }
}
