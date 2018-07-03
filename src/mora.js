import 'babel-polyfill';
import 'whatwg-fetch';
import { nlmaps } from '../nlmaps/dist/nlmaps.es.js';
import { requestFormatter, responseFormatter } from './mora/index.js';
import { chainWrapper, query, getFullObjectData, getOmgevingInfo  } from './utils.js';
import emitonoff from 'emitonoff';
import observe from 'callbag-observe';
const mora = {};
emitonoff(mora);

async function getBagInfo(click) {
  const xy = {
    x: click.latlng.lng,
    y: click.latlng.lat
  }
  const url = requestFormatter("https://api.data.amsterdam.nl/bag/nummeraanduiding/?format=json&locatie=", xy);
  return await  query(url).then(res => {
      let output =  {
        queryResult: responseFormatter(res),
        latlng: click.latlng
      }
      return output;
  })
}

async function chain (click) {
  try {
    const result = await getBagInfo(click) 
    .then(getFullObjectData)
    .then(getOmgevingInfo);
    mora.emit('query-results', result);
  } catch (e) {
    console.log(e);
  }
}

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
  let clicks = nlmaps.clickProvider(map);
  //subscribe chain of API calls to the nlmaps click event
  observe(chain)(clicks);


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
  //setup click and feature handlers
  let singleMarker =  nlmaps.singleMarker(map);
  clicks.subscribe(singleMarker);
  return map;
}

export default mora
