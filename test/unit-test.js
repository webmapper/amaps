let test = require('tape-catch');
global.fetch = require('node-fetch');

test('test query formatter functions', function(t) {
  const mora = require('../src/mora/index.js');
  t.equals(typeof mora.requestFormatter, 'function', 'requestFormatter is a function');
  t.equals(typeof mora.responseFormatter, 'function', 'responseFormatter is a function');
  const testBaseUrl = 'http://example.com/api?locatie=';
  const expectedUrl = 'http://example.com/api?locatie=162659.33058684267,501372.87854900945,50';
  const inputCoords = {x:5.5,y:52.5};
  
  const outputUrl = mora.requestFormatter(testBaseUrl, inputCoords);
  
  t.equals(outputUrl, expectedUrl, 'amaps request formatter transforms Lat/Lon to RD and formats URL');

  //todo: test the response formatter. Also add parse error handling and reporting to it.
  t.end();

})

test('test upstream API formatters', async function(t) {
  const mora = require('../src/mora/index.js');
  const testUrl = 'https://api.data.amsterdam.nl/bag/nummeraanduiding/?format=json&locatie=121382.15683784202,487363.8792724314,50';
  const firstQuery = await fetch(testUrl).then(res => res.json())
  const obj = {
    latlng: {
      lat: 52.373120020295296,
      lng: 4.8935455083847055
    },
    queryResult: firstQuery.results[0]
  }
  const res = await mora.getFullObjectData(obj);
  t.equals(res.dichtsbijzijnd_adres.openbare_ruimte, 'Beursplein', 'expected openbareruimtenaam for this location');
  const res2 = await mora.getOmgevingInfo(res);
  t.equals(res2.omgevingsinfo.buurtnaam, 'Oude Kerk e.o.', 'result has buurtnaam as expected');
  t.equals(res2.omgevingsinfo.stadsdeelcode, 'A', 'result has stadsdeelcode as expected');
  t.end();

})

