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

  //Test feature clicks
  await test('clicking to select/deselect multiple features', async (t) => {
    const browser = await puppeteer.launch({ args: ['--no-sandbox', '--disable-setuid-sandbox'], headless: false, slowMo: 250});
    const page = await browser.newPage();
    await page.setViewport({
      width: 320,
      height: 480
    })
    await page.goto(`http://${host}/multiselect.html`);


    let results = [];
    await page.exposeFunction('onMapClick', e => {
      results.push( function(){
        return () => Promise.resolve(e)
      }())
    })
    //give map time to load
    await page.waitFor(1000);
    await page.evaluate(()=> {
      multiselect.on('feature', e => {
        window.onMapClick(e)
      })
    })

    /* eslint-disable no-undef */
    /* eslint-disable no-underscore-dangle */
    await page.evaluate(() => {
      multiselect.map.setZoom(19);
    }).catch(e => console.log(e));

    //give map time to load again
    await page.waitFor(1000);

    
    await page.mouse.click(198,301).then(() => page.waitFor(1000));
    const res1 = await results[0]();
    //await t.equals(res1.type, 'added', 'the type of event is "added"');
    const store = await page.evaluate(() => {
      return multiselect.store.getStore()

    })
    await t.equals(store.length, 1, 'store length is 1 after single click');
    await page.mouse.click(223,264).then(() => page.mouse.click(223,264));
    const store2 = await page.evaluate(() => {
      return multiselect.store.getStore()
    })
    await t.equals(store2.length, 1, 'store length is still 1 after two clicks on another object');
    await  page.mouse.click(236,242);
    //really sad but seems only easy way to wait for API call
    await page.waitFor(1000);
    const res3 = await results[3]();
    const store3 = await page.evaluate(() => {
      return multiselect.store.getStore()
    })
    await t.equals(res3.features.length, 2, 'store length is 2 after click on a third object');
    await browser.close();
    t.end();
  })

    /* eslint-enable no-undef */    
    /* eslint-disable-next-line max-len */
    /* no-underscore-dangle */
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
