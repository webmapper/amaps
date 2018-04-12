const http = require('http');
const connect = require('connect');
const serveStatic = require('serve-static');
const test = require('../test/test.js');
// Simple server for serving static files with test in callback
const app = connect().use(serveStatic('test/'));
const server = http.createServer(app).listen(8123, () => {
  test(server);
});
