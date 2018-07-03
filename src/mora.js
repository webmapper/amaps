import 'babel-polyfill';
import 'whatwg-fetch';
import { nlmaps } from '../nlmaps/dist/nlmaps.es.js';
import { pointQueryChain } from './lib.js';
import emitonoff from 'emitonoff';
import observe from 'callbag-observe';
const mora = {};
emitonoff(mora);



mora.createMap = async function(config) {
  //create map
  let nlmapsconf = {
    target: config.target,
    layer: config.layer,
    marker: config.marker,
    search: config.search,
    zoom: config.zoom
  };
  let map = nlmaps.createMap(nlmapsconf);
  //subscribe chain of API calls to the nlmaps click event
 nlmaps.on('mapclick', async function(click) {
    const result = await pointQueryChain(click);
    mora.emit('query-results', result);
  });

  //attach user-supplied event handlers
  if (typeof config.clickHandlers === 'function') {
    nlmaps.on('mapclick', config.clickHandlers);
  } else if (Array.isArray(config.clickHandlers)) {
    config.clickHandlers.forEach((f) =>{
      if (typeof f === 'function') {
        nlmaps.on('mapclick', f);
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
  //setup click and feature handlers
  let clicks = nlmaps.clickProvider(map);
  let singleMarker =  nlmaps.singleMarker(map);
  clicks.subscribe(singleMarker);
  return map;
}

export default mora
