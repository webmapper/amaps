import { nlmaps } from '../nlmaps/dist/nlmaps.es.js';
import {flatten as flatten1,
  pipe,
  map as map1,
  forEach as cForEach,
  fromPromise } from 'callbag-basics';
import { getFoo, requestFormatter, responseFormatter } from './mora/index.js';

//utility function
function query(url) {
  const promise = new Promise((resolve, reject) => {
    fetch(url)
      .then(res => resolve(res.json()))
      .catch(err => reject(err))
  })
  return promise;

}


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


  console.log(getFoo('me')); 

  //this is a callbag-stream of all requests, in order.
  const finalQueryResults = pipe(
    featureQuery,
    map1(d => fromPromise(getFoo(d))),
    flatten1
  );
  cForEach(x => console.log(x))(finalQueryResults);
  


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
        featureQuery.subscribe(f)
      }
    })
  }
  //this is the only subscription we do here, since it belongs to the map viewport.
  clicks.subscribe(singleMarker);
  return map;
}

export default mora
