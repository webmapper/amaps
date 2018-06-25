import proj4 from 'proj4';
/* eslint-disable-next-line max-len */
proj4.defs("EPSG:28992","+proj=sterea +lat_0=52.15616055555555 +lon_0=5.38763888888889 +k=0.9999079 +x_0=155000 +y_0=463000 +ellps=bessel +towgs84=565.417,50.3319,465.552,-0.398957,0.343988,-1.8774,4.0725 +units=m +no_defs");
const transformCoords = proj4(proj4.defs('EPSG:4326'), proj4.defs('EPSG:28992'));

import { wrapApiCall, query } from '../utils.js';


//chain of API requests for single-click
//1. feature/bag adres query comes from nlmaps.featureQuery.
//2. after that, we need to get the full object data.
//   we'll request this from another api, and reformat
//   our queryResult with new data.
async function getFullObjectData(data) {
  //d: {
  //  latlng: {},
  //  queryResult: {},
  //}
  let dichtsbijzijnd_adres = {};
  if (data.queryResult !== null) {
    const res = {};
    try {
        const res = await query(data.queryResult._links.self.href);
        dichtsbijzijnd_adres = {
          openbare_ruimte: res.openbare_ruimte._display,
          huisnummer: res.huisnummer,
          huisletter: res.huisletter,
          huisnummer_toevoeging: res.huisnummer_toevoeging,
          postcode: res.postcode,
          woonplaats: res.woonplaats._display
        }
    } catch (e) {
        console.log('error!');
        console.log(e)
    }
  } else {
    dichtsbijzijnd_adres = null;
  }
  return {
    query: {
      latitude: data.latlng.lat,
      longitude: data.latlng.lng
    },
    dichtsbijzijnd_adres: dichtsbijzijnd_adres,
    object: null, //no object for an address search

  }
}


function findOmgevingFeature(features, type) {
  let feature = features.find(feat => feat.properties.type === type);
  if (feature === undefined) return null;
  return feature.properties;
}

async function getOmgevingInfo(data) {
  const res = await query(`https://api.data.amsterdam.nl/geosearch/bag/?lat=${data.query.latitude}&lon=${data.query.longitude}&radius=50`);
  let buurtinfo = findOmgevingFeature(res.features, 'gebieden/buurt');
  let stadsdeelinfo = findOmgevingFeature(res.features, 'gebieden/stadsdeel');
  data.omgevingsinfo = {
      buurtnaam: buurtinfo !== undefined ? buurtinfo.display : null,
    buurtcode: buurtinfo !== undefined ? buurtinfo.vollcode : null,
    stadsdeelnaam: stadsdeelinfo !== undefined ? stadsdeelinfo.display : null,
    stadsdeelcode: stadsdeelinfo !== undefined ? stadsdeelinfo.code : null
  }
  return data;
}


const callchain = [
  wrapApiCall(getFullObjectData),
  wrapApiCall(getOmgevingInfo)
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


