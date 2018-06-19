let test = require('tape-catch');


test('a random test', function(t) {
  const mora = require('../src/mora/index.js');
  t.equals(typeof mora.requestFormatter, 'function', 'requestFormatter is a function function');
  t.equals(typeof mora.responseFormatter, 'function', 'responseFormatter is a function function');
  const testBaseUrl = 'http://example.com/api?locatie=';
  const expectedUrl = 'http://example.com/api?locatie=162659.33058684267,501372.87854900945,50';
  const inputCoords = {x:5.5,y:52.5};
  
  const outputUrl = mora.requestFormatter(testBaseUrl, inputCoords);
  
  t.equals(outputUrl, expectedUrl, 'amaps request formatter transforms Lat/Lon to RD and formats URL');

  //todo: test the response formatter. Also add parse error handling and reporting to it.
  t.end();

})

