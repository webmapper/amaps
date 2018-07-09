/*eslint-disable max-len */
let test = require('tape-catch');
global.fetch = require('node-fetch');

test('test query request formatter function', async function(t) {
  //test requestFormatter
  const lib = require('../src/lib.js');
  t.equals(typeof lib.requestFormatter, 'function', 'requestFormatter is a function');
  t.equals(typeof lib.responseFormatter, 'function', 'responseFormatter is a function');
  const testBaseUrl = 'http://example.com/api?locatie=';
  const expectedUrl = 'http://example.com/api?locatie=162659.33058684267,501372.87854900945,50';
  const inputCoords = {x:5.5,y:52.5};
  
  const outputUrl = lib.requestFormatter(testBaseUrl, inputCoords);
  
  t.equals(outputUrl, expectedUrl, 'amaps request formatter transforms Lat/Lon to RD and formats URL');
  t.end();
})

test('test query response formatter function', async function(t) {
  const lib = require('../src/lib.js');

  //test query and responseFormatter
  const res = await lib.query('https://api.data.amsterdam.nl/bag/nummeraanduiding/?format=json&locatie=121382.15683784202,487363.8792724314,50')
    .then( data => lib.responseFormatter(data));
  t.equals(typeof res._links.self.href, 'string', 'expected structure of return data formatted by responseFormatter for BAG')

  //test handling of empty response
  const resWithEmptyResults = {"_links":{"self":{"href":"https://api.data.amsterdam.nl/bag/nummeraanduiding/?format=json&locatie=121382.15683784202,487363.8792724314,50"},"next":{"href":"https://api.data.amsterdam.nl/bag/nummeraanduiding/?format=json&locatie=121382.15683784202%2C487363.8792724314%2C50&page=2"},"previous":{"href":null}},"count":27,"results":[]};
  const faultyResponseParsed = lib.responseFormatter(resWithEmptyResults);
  t.equals(faultyResponseParsed, null, 'responseFormatter returns null when response list is empty');

  //test throwing when no results property
  const resWithNoResults = {"_links":{"self":{"href":"https://api.data.amsterdam.nl/bag/nummeraanduiding/?format=json&locatie=121382.15683784202,487363.8792724314,50"},"next":{"href":"https://api.data.amsterdam.nl/bag/nummeraanduiding/?format=json&locatie=121382.15683784202%2C487363.8792724314%2C50&page=2"},"previous":{"href":null}},"count":27};
  const testFn = function() {
    return lib.responseFormatter(resWithNoResults)
  }
  await t.throws(testFn, 'responseFormatter throws when no results object in response');
  
  t.end();

})

test('test upstream API formatters', async function(t) {
  const lib = require('../src/lib.js');
  const testUrl = 'https://api.data.amsterdam.nl/bag/nummeraanduiding/?format=json&locatie=121509.7748003435,487489.09617943474,50';
  const bagData = await fetch(testUrl).then(res => res.json())
  const obj = {
    latlng: {
      lat: 52.37425317904484,
      lng: 4.89540696144104
    },
    queryResult: bagData.results[0]
  }
  const resObjData = await lib.getFullObjectData(obj);
  t.equals(resObjData.dichtstbijzijnd_adres.openbare_ruimte, 'Beursplein', 'expected openbareruimtenaam for this location');
  const resOmgevInfo = await lib.getOmgevingInfo(resObjData);
  t.equals(resOmgevInfo.omgevingsinfo.buurtnaam, 'Oude Kerk e.o.', 'result has buurtnaam as expected');
  t.equals(resOmgevInfo.omgevingsinfo.stadsdeelcode, 'A', 'result has stadsdeelcode as expected');
  t.end();

})

