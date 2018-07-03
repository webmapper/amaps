//helper functions shared between different amaps wrapper apps

import {map as map1, fromPromise, flatten as flatten1, pipe} from 'callbag-basics';


//utility function
function query(url) {
  const promise = new Promise((resolve, reject) => {
    fetch(url)
      .then(res => resolve(res.json()))
      .catch(err => reject(err))
  })
  return promise;

}

//utility function to wrap API requests in callbag-promise-maps
function wrapApiCall(f) {
  return map1(d => fromPromise(f(d)))
}


//intersperse callchain with flatten calls to handle promises.
function flattenCallChain(callchain) {
  let newchain = [];
  for (var i = 0; i < callchain.length; i++ ) {
    newchain.push(callchain[i], flatten1);
  }
  return newchain
}

//returns a callbag-stream of all requests in callchain, in order.
//source is the callbag source of featurequeries, clicks or such.
//callchain is an array of callbag-compatible operators. (typically map fromPromise)
function apiCallChainer (source, callchain) {
  let expanded_chain = flattenCallChain(callchain);
  return pipe (
    source,
    ...expanded_chain
  )
}


function chainWrapper (source, callchain) {
  const querier =  apiCallChainer(source, callchain);
  querier.subscribe = function(callback) {
    querier(0, callback)
  }
  return querier;
}

async function getFullObjectData(data) {
  //d: {
  //  latlng: {},
  //  queryResult: {},
  //}
  let dichtstbijzijnd_adres = {};
  if (data.queryResult !== null) {
    try {
        const res = await query(data.queryResult._links.self.href);
        dichtstbijzijnd_adres = {
          openbare_ruimte: res.openbare_ruimte._display,
          huisnummer: res.huisnummer,
          huisletter: res.huisletter,
          huisnummer_toevoeging: res.huisnummer_toevoeging,
          postcode: res.postcode,
          woonplaats: res.woonplaats._display
        }
    } catch (e) {
      /* eslint-disable no-console */
        console.log('error!');
        console.log(e)
      /* eslint-enable no-console */
    }
  } else {
    dichtstbijzijnd_adres = null;
  }
  return {
    query: {
      latitude: data.latlng.lat,
      longitude: data.latlng.lng
    },
    dichtstbijzijnd_adres: dichtstbijzijnd_adres,
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

export { apiCallChainer, query, wrapApiCall, chainWrapper, getFullObjectData, getOmgevingInfo };
