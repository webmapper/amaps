import proj4 from 'proj4';
/* eslint-disable-next-line max-len */
proj4.defs("EPSG:28992","+proj=sterea +lat_0=52.15616055555555 +lon_0=5.38763888888889 +k=0.9999079 +x_0=155000 +y_0=463000 +ellps=bessel +towgs84=565.417,50.3319,465.552,-0.398957,0.343988,-1.8774,4.0725 +units=m +no_defs");
const transformCoords = proj4(proj4.defs('EPSG:4326'), proj4.defs('EPSG:28992'));

import  {map as map1, flatten, fromPromise } from 'callbag-basics';
import { wrapApiCall, query } from '../utils.js';


async function getFullObjectData(d) {
  const res = await query(d.queryResult._links.self.href);
  return {
    data: d,
    res: res
  }
}

async function getOmgevingInfo(d) {
  const res = await query(`https://api.data.amsterdam.nl/geosearch/bag/?lat=${d.data.latlng.lat}&lon=${d.data.latlng.lng}&radius=50`);
  return {
    data: d.data,
    res: res
  }
}


const callchain = [
  wrapApiCall(getFullObjectData),
  wrapApiCall(getOmgevingInfo)
//  map1(d => fromPromise(getFoo(d))),
//  map1(d => fromPromise(getFoosComments(d)))
]

//user-provided function for featureQuery to format request URL
//featureQuery will call this function with the following arguments:
// baseUrl string: the base url of the API (from config)
// xy: the x,y of the clicked point on the map (longitude, latitude).
function requestFormatter(baseUrl, xy) {
  let xyRD = transformCoords.forward(xy);
  return `${baseUrl}${xyRD.x},${xyRD.y},50`
}

//user-provided function for featureQuery to parse Ajax response
//we need:
//* query (lat/lon)
//* object
//* omgeving:
//  * dichtsbijzijnd adres
//  * buurtnaam
//  * buurtcode
//  * stadsdeelnaam
//  * stadsdeelcode
//  * buurtcombinatienaam
//  * buurtcombinatiecode
//

//So we need several of these request/responseformatter things.
//And then we chain them together.
function responseFormatter(res) {
  let filtered = res.results.filter(x => x.hoofdadres === true);
  return filtered.length > 0 ? filtered[0] : null;
}

export { callchain, getFullObjectData, getOmgevingInfo, requestFormatter, responseFormatter };


