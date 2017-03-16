//
// Parts reusable across db submodules
//

const pg = require('pg').native || require('pg');
const url = require('url');

// Crash because of db error
export let dbFailure = (error) => {
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

export let pool = new pg.Pool(configuration);
export let connect = pool.connect.bind(pool);
