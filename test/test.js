const puppeteer = require('puppeteer');
const { test } = require('tap');
const pa11y = require('pa11y');


async function runTests(host) {
  // General browser tests
  await test('The map is loaded', async (t) => {
    const browser = await puppeteer.launch({ args: ['--no-sandbox', '--disable-setuid-sandbox'] });
    const page = await browser.newPage();
    await page.goto(`http://${host}/index.html`);
    const div = await page.$eval('#mapdiv', el => Boolean(el));
    await t.assert(div === true, 'div is present');

    // map call occurs in browser context
    /* eslint-disable-next-line no-undef */
    const mapCenter = await page.evaluate(() => map.getCenter());
    await t.assert(mapCenter.lng === 4.8952 && mapCenter.lat ===  52.37, 'map is centered as expected');
    await browser.close();
    t.end();
  });
  await test('correct config is loaded', async (t) => {
    const browser = await puppeteer.launch({ args: ['--no-sandbox', '--disable-setuid-sandbox'] });
    const page = await browser.newPage();
    await page.goto(`http://${host}/index.html`);

    /* eslint-disable no-undef */
    /* eslint-disable no-underscore-dangle */
    const urlForStandard = await page.evaluate(() => {
      const layer = nlmaps.leaflet.bgLayer('standaard');      
      return layer._url;
    });
    /* eslint-enable no-undef */    
    /* eslint-disable-next-line max-len */
    await t.assert(urlForStandard === 'https://t1.data.amsterdam.nl/topo_wm_zw/{z}/{x}/{y}.png', 'url for created layer is as expected');
    /* no-underscore-dangle */
    await browser.close();
    t.end();
  });
  // ARIA tests
  await test('there are no accessibility issues', async (t) => {
    const ariares = await pa11y(`http://${host}/index.html`, {
      allowedStandards: 'WCAG2AA',
      level: 'error',
      chromeLaunchConfig: {
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
        ],
      },
    });    
    await t.assert(ariares.issues.length === 0, 'length ofissue list is 0');
    t.end();
  });
}

module.exports = runTests;
