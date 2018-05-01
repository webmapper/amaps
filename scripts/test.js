const http = require('http');
const connect = require('connect');
const serveStatic = require('serve-static');
const test = require('../test/test.js');
const app = connect().use(serveStatic('test/'));
const server = http.createServer(app).listen(8123, async () => {
  const result = await test('localhost:8123');
  /*eslint-disable-next-line no-console*/
  console.log(result)
  server.close()

})
