import { nlmaps } from '../nlmaps/dist/nlmaps.es.js';
import {callchain, requestFormatter, responseFormatter } from './mora/index.js';
import { chainWrapper } from './utils.js';
//amaps is really going to be 'amaps-mora'.
const mora = {};

mora.createMap = function(config) {
  let nlmapsconf = {
    target: config.target,
    layer: config.layer,
    marker: config.marker,
    search: config.search,
    zoom: config.zoom
  };
  let map = nlmaps.createMap(nlmapsconf);
  let clicks = nlmaps.clickProvider(map);
  let singleMarker =  nlmaps.singleMarker(map);
  let featureQuery = nlmaps.queryFeatures(
    clicks,
    "https://api.data.amsterdam.nl/bag/nummeraanduiding/?format=json&locatie=",
    requestFormatter,
    responseFormatter
  );


  const finalResponse = chainWrapper(featureQuery, callchain);


  if (typeof config.clickHandlers === 'function') {
    clicks.subscribe(config.clickHandlers);
  } else if (Array.isArray(config.clickHandlers)) {
    config.clickHandlers.forEach((f) =>{
      if (typeof f === 'function') {
        clicks.subscribe(f)
      }
    })
  }
  if (typeof config.featureHandlers === 'function') {
    featureQuery.subscribe(config.featureHandlers);
  } else if (Array.isArray(config.featureHandlers)) {
    config.featureHandlers.forEach((f) =>{
      if (typeof f === 'function') {
        finalResponse.subscribe(f)
      }
    })
  }
  //this is the only subscription we do here, since it belongs to the map viewport.
  clicks.subscribe(singleMarker);
  return map;
}

export default mora
