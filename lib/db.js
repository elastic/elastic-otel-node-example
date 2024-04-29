/*
 * Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
 * or more contributor license agreements. See the NOTICE file distributed with
 * this work for additional information regarding copyright
 * ownership. Elasticsearch B.V. licenses this file to you under
 * the Apache License, Version 2.0 (the "License"); you may
 * not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *	http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */

const {Pool} = require('pg');

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
    return pool.connect();
}

function end() {
    return pool.end();
}

module.exports = {
    query,
    getClient,
    end,
};
