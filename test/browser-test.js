const puppeteer = require('puppeteer');
const { test } = require('tap');
const pa11y = require('pa11y');


async function runTests(host) {
  // General browser tests
  await test('The map is loaded', async (t) => {
    const browser = await puppeteer.launch({ args: ['--no-sandbox', '--disable-setuid-sandbox'] });
    const page = await browser.newPage();
    await page.goto(`http://${host}/index.html`);
    const div = await page.$eval('#mapdiv', (el) => Boolean(el));
    await t.assert(div === true, 'div is present');

    // map call occurs in browser context
    /* eslint-disable-next-line no-undef */
    const mapCenter = await page.evaluate(() => map.getCenter()).catch((e) => e);
    /* eslint-disable-next-line no-console */
    console.log(mapCenter);
    await t.assert(mapCenter.lng === 4.8952 && mapCenter.lat === 52.37, 'map is centered as expected');
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
      const layer = amaps.leaflet.bgLayer('standaard');
      return layer._url;
    }).catch((e) => e);
    /* eslint-enable no-undef */
    /* eslint-disable-next-line max-len */
    await t.assert(urlForStandard === 'https://t1.data.amsterdam.nl/topo_wm/{z}/{x}/{y}.png', 'url for created layer is as expected');
    /* no-underscore-dangle */
    await browser.close();
    t.end();
  });

  await test('searchbox filled on click', async (t) => {
    const browser = await puppeteer.launch({ args: ['--no-sandbox', '--disable-setuid-sandbox'] });
    const page = await browser.newPage();
    await page.goto(`http://${host}/pointquery.html`);
    await page.mouse.click(100, 200);
    await page.waitFor(() => document.querySelector('#nlmaps-geocoder-control-input').value !== '');
    const res = await page.evaluate(() => document.querySelector('#nlmaps-geocoder-control-input').value);
    await t.equals(res, 'Van Reigersbergenstraat 826, 1052WN Amsterdam', 'expected adres in input box after click on map');
    await browser.close();
    t.end();
  });
  //
  // Test feature clicks
  await test('clicking to select/deselect multiple features', async (t) => {
    const browser = await puppeteer.launch({ args: ['--no-sandbox', '--disable-setuid-sandbox'] });
    const page = await browser.newPage();
    await page.setViewport({
      width: 320,
      height: 480
    });
    await page.goto(`http://${host}/multiselect.html`);


    // predefine expected number of clicks on map features
    const results = [];
    const clicks = 4;
    function defer() {
      let res = null;
      let rej = null;

      const promise = new Promise((resolve, reject) => {
        res = resolve;
        rej = reject;
      });

      promise.resolve = res;
      promise.reject = rej;

      return promise;
    }
    for (let i = 0; i < clicks; i += 1) {
      results[i] = defer();
    }
    let counter = 0;
    await page.exposeFunction('onMapClick', (e) => {
      results[counter].resolve(e);
      counter += 1;
    });
    // give map time to load
    await page.waitFor(1000);
    await page.evaluate(() => {
      /* eslint-disable-next-line no-undef */
      multiselect.on('feature', (e) => {
        window.onMapClick(e);
      });
    });

    /* eslint-disable no-undef */
    /* eslint-disable no-underscore-dangle */
    await page.evaluate(() => {
      multiselect.map.setZoom(19);
    });

    // give map time to load again
    await page.waitFor(1000);


    await page.mouse.click(208, 308).then(() => page.waitFor(1000));
    const res1 = await results[0];
    await t.equals(res1.type, 'added', 'the type of event after one click is "added"');
    const store = await page.evaluate(() => multiselect.store.getStore());
    await t.equals(res1.features.length, 1, 'feature length in event data is 1 after single click');
    await t.equals(store.length, 1, 'store length  is 1 after single click');
    await page.mouse.click(227, 270).then(() => page.mouse.click(227, 270));
    // wait for third click on a feature
    const res2 = await results[2];
    const store2 = await page.evaluate(() => multiselect.store.getStore());
    await t.equals(res2.type, 'removed', 'the type of event after two clicks on object is "removed"');
    await t.equals(res2.features.length, 1, 'feature list in event data is still 1 after two clicks on another object');
    await t.equals(store2.length, 1, 'store length is still 1 after two clicks on another object');
    await page.mouse.click(244, 239);
    // wait for fourth click on a feature
    const res3 = await results[3];
    const store3 = await page.evaluate(() => multiselect.store.getStore());
    await t.equals(res3.features.length, 2, 'feature list in event data is 2 after click on a third object');
    await t.equals(store3.length, 2, 'store length is 2 after click on a third object');


    /* eslint-enable no-undef */
    /* eslint-disable-next-line max-len */
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
          '--disable-setuid-sandbox'
        ]
      }
    }).catch((e) => e);
    /* eslint-disable-next-line no-console */
    // console.log(ariares.issues.length);
    await t.assert(ariares.issues.length === 0, 'length ofissue list is 0');
    t.end();
  });
}

module.exports = runTests;
