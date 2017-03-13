//
// Database operations
//

const pg = require('pg').native || require('pg');
const url = require('url');

let dbFailure = (error) => {
  console.error('db failure:', error.message, error.stack);
  process.exit(33);
};

const parts = url.parse(process.env.DATABASE_URL);
const auth = parts.auth != null? parts.auth.split(':'): ['', ''];
const configuration = {
  user: auth[0],
  password: auth[1],
  host: parts.hostname,
  port: parts.port,
  database: parts.pathname != null? parts.pathname.split('/')[1]: null,
  ssl: true,
};

let db = {};
db.pool = new pg.Pool(configuration);
db.connect = db.pool.connect.bind(db.pool);

// Create an empty user record and return its id
db.makeUser = (client) => {
  client = client || db.pool;
  return client.query(`
    insert into "user" default values returning "user_id"`)
  .then((res) => {
    return res.rows[0].user_id;
  }, dbFailure);
};

// Auth through an external provider returning user id,
// possibly creating a new user record
db.connectUser = async function(user) {
  let externalId = user.id;
  if (externalId == null) {
    throw new TypeError('user id cannot be null');
  }
  let callsign = user.username;
  let displayName = user.displayName;

  if (!['github', 'twitter'].includes(user.provider)) {
    return Promise.reject(new Error('unknown auth provider'));
  }
  let providerTable = `user_${user.provider}`;

  let client = await db.pool.connect();
  let res = await client.query(`
    select "user_id", "external_id"
    from "${providerTable}"
    where "external_id" = $1
    limit 1`,
    [externalId]
  );
  if (res.rowCount > 0) {
    // user exists
    client.release();
    return res.rows[0].user_id;
  }

  await client.query('begin');
  let id = await db.makeUser(client);
  await client.query(`
    insert into "${providerTable}"("user_id", "external_id")
    values($1, $2)`,
    [id, externalId]
  ).then(() => id, dbFailure);

  await client.query('commit');
  client.release();

  return id;
};

// Return newly generated authtoken for this user id
db.issueAuthToken = async function(id, client) {
  client = client || db.pool;
  let res = await client.query(`
    insert into "authtoken"("user_id")
    values($1)
    returning "token"`,
    [id]
  );
  return res.rows[0].token;
};

// Return user info by their auth token,
// null on stale or broken token
db.rememberUser = async function(token) {
  return db.pool.query(`
    select "user_id"
    from "authtoken"
    where "token" = $1
    limit 1`,
    [token]
  ).then((res) => {
    if (res.rowCount < 1) {
      return null;
    }

    let uid = res.rows[0].user_id;
    return db.getUser(uid);
  });
};

// Return all available info about this user
db.getUser = async function(uid) {
  let res = await db.pool.query(`
    select
      "user"."user_id",
      "user_email"."address" as "email",
      "user_phone"."phone_number" as "phone",
      "user_twitter"."external_id" as "twitter_id",
      "user_github"."external_id" as "github_id"
    from "user"
    left outer join "user_email" using ("user_id")
    left outer join "user_phone" using ("user_id")
    left outer join "user_twitter" using ("user_id")
    left outer join "user_github" using ("user_id")
    where "user"."user_id" = $1
    limit 1`,
    [uid]
  );
  if (res.rowCount < 1) {
    return null;
  }

  let fetch = res.rows[0];
  return {
    id: fetch.user_id,
  };
};

// Compactify UUID
db.encodeToken = (uuid) => {
  if (uuid == null) {
    throw new TypeError('expected first argument to be defined');
  }

  let strippedUuid = uuid.replace(/-/g, '');
  let encoded = Buffer.from(strippedUuid, 'hex').toString('base64');
  return encoded;
};

// Restore UUID to its original form
db.decodeToken = (encoded) => {
  if (encoded == null) {
    throw new TypeError('expected first argument to be defined');
  }

  let decoded = Buffer.from(encoded, 'base64').toString('hex');
  return decoded;
};

export default db;
