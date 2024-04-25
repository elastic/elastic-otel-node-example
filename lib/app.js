const bodyParser = require('body-parser');
const express = require('express');
const Router = require('express-promise-router');
const db = require('./db');

/**
 * Shortnames:
 * - 1 to 128 word chars (a-z, A-Z, 0-9, _)
 * - hyphens are allowed, but not at the start or end
 *
 * Normalization:
 * - Shortnames are case-insensitive, so they will be lowercased.
 * - Hyphens are internally dropped, so "chat-logs" and "chatlogs" resolve to
 *   same link.
 */
const MAX_SHORTNAME_LEN = 128;
const VALID_SHORTNAME = /^(\w|\w[\w-]*\w)$/;

function normalizeShortname(rawShortname) {
    if (typeof rawShortname !== 'string') {
        throw new Error('invalid shortname: must be a string');
    }
    let normShortname = rawShortname.trim();
    if (normShortname.length === 0) {
        throw new Error('invalid shortname: cannot be the empty string');
    }
    if (!VALID_SHORTNAME.test(normShortname)) {
        throw new Error('invalid shortname: must match /[A-Za-z0-9_-]+/, cannot start or end with a hyphen');
    }
    normShortname = normShortname.toLowerCase().replace(/-/g, '');
    if (normShortname.length > MAX_SHORTNAME_LEN) {
        throw new Error(`invalid shortname: too long (max ${MAX_SHORTNAME_LEN} chars)`);
    }
    return normShortname;
}

function normalizeUrl(rawUrl) {
    if (typeof rawUrl !== 'string') {
        throw new Error('invalid url: must be a string');
    }
    var url = new URL(rawUrl);
    return url;
}

// ---- mainline

const app = express();
app.disable('x-powered-by');
app.set('json spaces', 2);
app.use(bodyParser.urlencoded({ extended: false })) // application/x-www-form-urlencoded
app.use(bodyParser.json()) // application/json

const router = new Router()

/**
 * GET /
 * Return a list of recent shortlinks.
 */
router.get('/', async (req, res, next) => {
    const recentLinks = await db.query(`
        SELECT * FROM shortlinks
        ORDER BY created_at DESC
        LIMIT 10;
    `);
    res.send(recentLinks.rows)
})

/**
 * POST /
 * Create a shortlink.
 *
 * curl -i localhost:3000/ -X POST -d shortname=el -d url=https://elastic.co
 * curl -i localhost:3000/ -X POST -d '{"shortname": "el", "url": "https://elastic.co"}' -H content-type:application/json
 */
router.post('/', async (req, res, next) => {
    let shortname;
    let url;
    try {
        if (!('shortname' in req.body)) {
            throw new Error('missing "shortname" parameter');
        }
        if (!('url' in req.body)) {
            throw new Error('missing "url" parameter');
        }
        shortname = normalizeShortname(req.body.shortname);
        url = normalizeUrl(req.body.url);
    } catch (err) {
        res.status(400);
        res.json({ok: false, error: err.message});
        return;
    }

    let q;
    try {
        q = await db.query(
            'INSERT INTO shortlinks(shortname, url) VALUES($1, $2) RETURNING *',
            [shortname, url.href]);
    } catch (insertErr) {
        // 23505 unique_violation https://www.postgresql.org/docs/current/errcodes-appendix.html
        if (insertErr.code == '23505') {
            res.status(400);
            res.json({ok: false, error: `shortname '${shortname}' already exists`});
            return;
        }
        throw insertErr;
    }

    res.status(201);
    res.json({
        ok: true,
        shortlink: {
            shortname: q.rows[0].shortname,
            url: q.rows[0].url,
        }
    });
})

/**
 * GET /:shortname
 * Follow a shortlink.
 */
router.get('/:shortname', async (req, res, next) => {
    let shortname;
    try {
        shortname = normalizeShortname(req.params.shortname);
    } catch (err) {
        res.status(404);
        res.send('404 Not Found');
        return;
    }

    const q = await db.query('SELECT * FROM shortlinks WHERE shortname = $1', [shortname]);
    if (q.rowCount === 0) {
        res.status(404);
        res.send('404 Not Found');
        return;
    }

    res.redirect(q.rows[0].url);
})

app.use(router);

app.use(function onError(err, req, res, next) {
    console.log('app err:', err);
    res.status(500);
    res.send('internal error');
});

const server = app.listen(3000, '127.0.0.1', function () {
    const addr = server.address();
    const base = `http://${addr.address}:${addr.port}`
    console.log(`Shortlinks service listening at: ${base}/`);
    console.log('Try:');
    console.log(`  curl ${base}/  # list recent shortlinks`);
    console.log(`  curl ${base}/ -X POST -d shortname=el -d url=https://elastic.co`);
    console.log(`  open ${base}/el`);
});
