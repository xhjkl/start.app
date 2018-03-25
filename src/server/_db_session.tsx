//
//  Session keeping
//
import { dbFailure } from './_db_common'

// Class factory accepts `express-session` module
export let createSessionStore = (session) => {
  const Store = session.Store

  return class PGSessionStore extends Store {

    constructor({ pool }) {
      super()
      this.pool = pool
    }

    get(sid, fn) {
      this.pool.query(`
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

        let obj = res.rows[0].associated_data
        fn(null, obj)
      }).catch(dbFailure)
    }

    set(sid, sess, fn) {
      let payload = JSON.stringify(sess)
      let userid = null
      if (sess.passport != null && sess.passport.user != null) {
        userid = sess.passport.user
      }
      this.pool.query(`
        insert into "session"("user_id", "token", "associated_data")
        values ($1, $2, $3)
        on conflict ("token") do update set "user_id" = $1, "associated_data" = $3
        `,
        [userid, sid, payload]
      ).then((res) => {
        if (res.rowCount < 1) {
          // Stale or corrupted token
          return fn(null)
        }

        fn(null)
      }).catch(dbFailure)
    }

    destroy(sid, fn) {
      this.pool.query(`
        delete from "session"
        where "token" = $1
        `,
        [sid]
      ).then((res) => {
        fn(null)
      }).catch(dbFailure)
    }

    clear(sid, fn) {
      this.pool.query(`
        delete from "session"
        `,
        []
      ).then((res) => {
        fn(null)
      }).catch(dbFailure)
    }

    touch(sid, sess, fn) {
      // We rely on triggers to refresh the timestamp
      this.set(sid, sess, fn)
    }

    ids(fn) {
      this.pool.query(`
        select "token"
        from "session"
        `,
        []
      ).then((res) => {
        let ids = res.rows.map((row) => row.token)
        fn(null, ids)
      }).catch(dbFailure)
    }

    all(fn) {
      this.pool.query(`
        select "associated_data"
        from "session"
        `,
        []
      ).then((res) => {
        let all = res.rows.map((row) => all.associated_data)
        fn(null, all)
      }).catch(dbFailure)
    }
  }
}
