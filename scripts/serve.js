const http = require('http')
const connect = require('connect')
const serveStatic = require('serve-static')
const puppeteer = require('puppeteer');
const tap = require('tap');
const pa11y = require('pa11y');


// Simple server for serving static files
const app = connect().use(serveStatic('test/'))
const server = http.createServer(app).listen(8123, () => {
  test(server);
})

async function test(server){
  await tap.test('there is a map div present', async function(t) {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.goto('http://localhost:8123/test.html');
    const div = await page.$eval('#mapdiv', el => el ? true : false);
    t.assert(div === true, 'div is present');
    const map = await page.evaluate(() => map.getCenter());
    t.assert(map.lng === 5.9699 && map.lat=== 52.2112, 'map is centered as expected')
    await browser.close();
    t.end()
  })
  await tap.test('there are no accessibility issues', async function(t) {
    const ariares = await pa11y('http://localhost:8123/test.html');
    t.assert(ariares.issues.length === 0, 'issue length is 0')
    t.end()
    
  })

  server.close();



}
