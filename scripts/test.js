const http = require('http');
const connect = require('connect');
const serveStatic = require('serve-static');
const test = require('../test/test.js');
const app = connect().use(serveStatic('test/'));
const server = http.createServer(app).listen(8123, async () => {
  await test('localhost:8123');
  server.close()

})
