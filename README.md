# elastic-otel-node Example

This repository holds a small Node.js app to demonstrate usage of
[`@elastic/opentelemetry-node`](https://github.com/elastic/elastic-otel-node/tree/main/packages/opentelemetry-node#readme)
in instrumenting Node.js apps for observability.

The app is a barebones shortlinks service (add a URL with a shortname, then
use the service to redirect to that URL). This implementation uses PostgreSQL
to store shortlinks (using the `pg` client package), and `express` for the
HTTP server.


## Usage

This assumes you have Docker installed.

```
git clone https://github.com/elastic/elastic-otel-node-example.git
cd elastic-otel-node-example
npm install

npm run db:start   # start Postgres in Docker
npm run db:setup   # create the DB "shortlinks" table
npm start          # start the service at http://127.0.0.1:3000/
```

The try it out, first add a shortlink:

```
curl http://127.0.0.1:3000/ -X POST -d shortname=el -d url=https://elastic.co
```

Then open <http://127.0.0.1:3000/el> in your browser.

That is mostly it.  When you are done, run `npm run db:stop` to stop the
PostgreSQL container. The data is not persisted.
Definitely *barebones*.


## Observability with `@elastic/opentelemetry-node`

TODO

