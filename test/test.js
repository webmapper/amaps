const puppeteer = require('puppeteer');
const tap = require('tap');
const pa11y = require('pa11y');

async function test(server) {
  // General browser tests
  await tap.test('The map is loaded', async (t) => {
    const browser = await puppeteer.launch({ args: ['--no-sandbox', '--disable-setuid-sandbox'] });
    const page = await browser.newPage();
    await page.goto('http://localhost:8123/index.html');
    const div = await page.$eval('#mapdiv', el => Boolean(el));
    await t.assert(div === true, 'div is present');
    // map call occurs in browser context
    /* eslint-disable-next-line no-undef */
    const mapCenter = await page.evaluate(() => map.getCenter());
    t.assert(mapCenter.lng === 5.9699 && mapCenter.lat === 52.2112, 'map is centered as expected');
    await browser.close();
    t.end();
  });
  // ARIA tests
  await tap.test('there are no accessibility issues', async (t) => {
    const ariares = await pa11y('http://localhost:8123/index.html', {
      allowedStandards: 'WCAG2AA',
      level: 'error',
      chromeLaunchConfig: {
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
        ],
      },
    });
    t.assert(ariares.issues.length === 0, 'length ofissue list is 0');
    t.end();
  });

  server.close();
}

module.exports = test;
