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
  console.log(querier);
  querier.subscribe = function(callback) {
    querier(0, callback)
  }
  return querier;
}

export { apiCallChainer, query, wrapApiCall, chainWrapper };
