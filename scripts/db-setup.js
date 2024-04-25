require('dotenv').config({path: ['.env', 'defaults.env']});

const db = require('../lib/db');

async function main() {
    console.log('db-setup.js: setting up shortlinks table')
    // await db.query('DROP TABLE IF EXISTS shortlinks');
    const createSchema = `
        CREATE TABLE IF NOT EXISTS shortlinks(
            shortname VARCHAR(128) PRIMARY KEY,
            -- 2048 chars should be enough for any URL, right?
            url VARCHAR(2048) NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    `;
    await db.query(createSchema);
    await db.end()
}

main();
