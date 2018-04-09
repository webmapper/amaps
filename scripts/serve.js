const http = require('http')
const connect = require('connect')
const serveStatic = require('serve-static')
const puppeteer = require('puppeteer');
const tap = require('tap');


// Simple server for serving static files
const app = connect().use(serveStatic('test/'))
http.createServer(app).listen(8123, () => {
  test();
})

async function test(){
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

}
