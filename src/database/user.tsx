import { pool, dbFailure } from './common'
import { Pool } from 'pg' // eslint-disable-line no-unused-vars

/** Create an empty user record and return its id. */
export const makeUser = (q: Pick<Pool, 'query'> = pool) => {
  return q.query(
    'insert into "user" default values returning "user_id"'
  ).then(
    ({ rows }) => rows[0].user_id,
    dbFailure
  )
}

/** Auth through an external provider returning user id, possibly creating a new user record. */
export const connectUser = async function (user) {
  const externalId = user.id
  if (externalId == null) {
    throw new TypeError('user id cannot be null')
  }

  // `user.username` is the callsign
  // `user.displayName` is the displayed name

  if (!['github', 'twitter'].includes(user.provider)) {
    throw new Error('unknown auth provider')
  }
  const providerTable = `user_${user.provider}`

  const client = await pool.connect()
  const res = await client.query(
    `
      select "user_id", "external_id"
      from "${providerTable}"
      where "external_id" = $1
      limit 1
    `,
    [externalId]
  )
  if (res.rowCount > 0) {
    // user exists
    client.release()
    return res.rows[0].user_id
  }

  await client.query('begin')
  const id = await makeUser(client)
  await client.query(
    `
      insert into "${providerTable}"("user_id", "external_id")
      values($1, $2)
    `,
    [id, externalId]
  ).catch(dbFailure)

  await client.query('commit')
  client.release()

  return id
}

/** Return user id by their session token, null on stale or broken token. */
export const userIdBySessionToken = async function (token) {
  return pool.query(
    `
      select "user_id"
      from "session"
      where "token" = $1
      limit 1
    `,
    [token]
  ).then((res) => {
    if (res.rowCount < 1) {
      return null
    }

    const uid = res.rows[0].user_id
    return uid
  })
}

/** Return all available info about this user. */
export const getUser = async function (uid) {
  const res = await pool.query(
    `
      select
        "user"."user_id",
        "user_email"."address" as "email",
        "user_phone"."phone_number" as "phone",
        "user_twitter"."external_id" as "twitter_id",
        "user_github"."external_id" as "github_id"
      from
        "user"
        left outer join "user_email" using ("user_id")
        left outer join "user_phone" using ("user_id")
        left outer join "user_twitter" using ("user_id")
        left outer join "user_github" using ("user_id")
      where
        "user"."user_id" = $1
      limit 1
    `,
    [uid]
  )
  if (res.rowCount < 1) {
    return null
  }

  const fetch = res.rows[0]
  return {
    id: fetch.user_id
  }
}

/** Transfer all the associated user data owned by `removeUid` to `keepUid` and drop `removeUid`. */
export const mergeUsers = async function ({ keepUid, removeUid }) {
  const client = await pool.connect()
  await client.query('begin')
  for (const table of ['user_email', 'user_phone', 'user_twitter', 'user_github']) {
    await client.query(
      `update "${table}" set "user_id" = $1 where "user_id" = $2`,
      [keepUid, removeUid]
    )
  }

  // Make it so that all the sessions on behalf of the merged-from user belong to the merged-into user.
  const replacedSessionData = { passport: { user: keepUid } }
  await client.query(
    `
      update "session"
      set
        "user_id" = $1,
        "associated_data" = "associated_data" || $3::jsonb
      where
        "user_id" = $2
    `,
    [keepUid, removeUid, JSON.stringify(replacedSessionData)]
  )
  await client.query(
    'delete from "user" where "user_id" = $1',
    [removeUid]
  )
  await client.query('commit')
  client.release()

  return keepUid
}
