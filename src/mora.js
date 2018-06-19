import { nlmaps } from '../nlmaps/dist/nlmaps.es.js';
import proj4 from 'proj4';
/* eslint-disable-next-line max-len */
proj4.defs("EPSG:28992","+proj=sterea +lat_0=52.15616055555555 +lon_0=5.38763888888889 +k=0.9999079 +x_0=155000 +y_0=463000 +ellps=bessel +towgs84=565.417,50.3319,465.552,-0.398957,0.343988,-1.8774,4.0725 +units=m +no_defs");
const transformCoords = proj4(proj4.defs('EPSG:4326'), proj4.defs('EPSG:28992'));

//user-provided function for featureQuery to format request URL
//featureQuery will call this function with the following arguments:
// baseUrl string: the base url of the API (from config)
// xy: the x,y of the clicked point on the map (longitude, latitude).
function requestFormatter(baseUrl, xy) {
  let xyRD = transformCoords.forward(xy);
  return `${baseUrl}${xyRD.x},${xyRD.y},50`
}

//user-provided function for featureQuery to parse Ajax response
function responseFormatter(res) {
  let filtered = res.results.filter(x => x.hoofdadres === true);
  return filtered.length > 0 ? filtered[0] : null;
}



//amaps is really going to be 'amaps-mora'.
const mora = {};

mora.createMap = function(config) {
  let nlmapsconf = {
    target: config.target,
    layer: config.layer,
    marker: config.marker,
    search: config.search,
    zoom: config.search
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
