const { Pool } = require('pg');

const pool = new Pool();

function query(text, params, callback) {
  return pool.query(text, params, callback);
}

/**
 * Usage:
 *  const client = await db.getClient();
 *  try {
 *    client.query('BEGIN');
 *    // One or more:
 *    //    await client.query(...);
 *    await client.query('COMMIT');
 *  } catch (err) {
 *    await client.query('ROLLBACK');
 *    throw err;
 *  } finally {
 *    client.release();
 *  }
 */
function getClient() {
  return pool.connect()
}

function end() {
  return pool.end();
}

module.exports = {
  query,
  getClient,
  end
};
