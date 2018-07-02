import 'babel-polyfill';
import 'whatwg-fetch';
import { nlmaps } from '../nlmaps/dist/nlmaps.es.js';
import {callchain, requestFormatter, responseFormatter } from './mora/index.js';
import { chainWrapper } from './utils.js';
import emitonoff from 'emitonoff';
import observe from 'callbag-observe';
const mora = {};
emitonoff(mora);

mora.createMap = function(config) {
  //create map
  let nlmapsconf = {
    target: config.target,
    layer: config.layer,
    marker: config.marker,
    search: config.search,
    zoom: config.zoom
  };
  let map = nlmaps.createMap(nlmapsconf);

  //setup click and feature handlers
  let clicks = nlmaps.clickProvider(map);
  let singleMarker =  nlmaps.singleMarker(map);
  let featureQuery = nlmaps.queryFeatures(
    clicks,
    "https://api.data.amsterdam.nl/bag/nummeraanduiding/?format=json&locatie=",
    requestFormatter,
    responseFormatter
  );
  const finalResponse = chainWrapper(featureQuery, callchain);
  observe(data => mora.emit('query-results', data))(finalResponse);
  observe(data => mora.emit('mapclick', data))(clicks);


  //attach user-supplied event handlers
  if (typeof config.clickHandlers === 'function') {
    mora.on('mapclick', config.clickHandlers);
  } else if (Array.isArray(config.clickHandlers)) {
    config.clickHandlers.forEach((f) =>{
      if (typeof f === 'function') {
        mora.on('mapclick', f);
      }
    })
  }
  if (typeof config.onQueryResult === 'function') {
   mora.on('query-results', config.onQueryResult);
  } else if (Array.isArray(config.onQueryResult)) {
    config.onQueryResult.forEach((f) =>{
      if (typeof f === 'function') {
        mora.on('query-results', f);
      }
    })
  }
  //this is the only private subscription we do here, since it belongs to the map viewport.
  clicks.subscribe(singleMarker);
  return map;
}

export default mora
