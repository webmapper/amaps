Amaps applications
==================

General
-------

Include in your webpage or script:

* Leaflet js
* Leaflet css
* the javascript build of your application. e.g. `mora.iife.js` for the Mora app in the browser, or `mora.es.js` if you are using a transpilation step.
* `dist/nlmaps/assets/nlmaps.css`
* `dist/dist/css/ams-stijl.css`

Then you will have an object named for the application available, which you can use to create a map. For example, for TVM:

      //example handler function
      function handler(features){
        console.log(features)
      }

      //create map and register event handlers
      let map = tvm.createMap({target: 'mapdiv',
        layer: 'standaard',
        marker: false,
        search: true,
        zoom: 14,
        onFeatures: handler
      });

The options object passed to `createMap` consists of the options for `nlmaps.createMap` (see [here](https://github.com/webmapper/nlmaps#nlmapscreatemapoptionsobject), plus the handler for the feature select update.

The signature of these handler functions for all application is: `handler(data) { ...}`

You can pass a single function, or an array of functions to subscribe multiple handlers: `onFeatures: [handler1, handler2]`

See also [nlmaps](https://github.com/webmapper/nlmaps#events) for other events you can listen to.

#### Return data
The data passed to the handlers for all applications is a JSON object or array of objects of the following format (see [here](../schema.json) for full example)

    {
      query: {}     //the latitude and longitude of the original click on the map
      object:{}     //the object which has been selected (if applicable)
      omgeving: {}  //closest address and further area information, such as neighbourhood.
    }

      

App-specific functionality
-------------

### Mora (single click on the map)

Click on the map to place a marker and query for address/locality information. Clicking elsewhere will place the marker there; click on the marker to remove it completely.

You can listen for map click events, and for the successful return of the location adres query. You can do so by passing handlers to the options object:

    {
      onMapClick: clickHandler,
      onQueryResult: queryHandler
    }

Or by listening directly to the `mapclick` and `query-results` events (which take an identical handler function as above).

In the return data, `object` is `null` because it concerns point locations, not an object which is selected.


### TVM (select multiple features on the map)

On the map, zoom in to see parkeervakken. Click parkeervakken to select; multiple selections are possible; click again to deselect. On each select/deselect, the new list of currently selected features is returned.

You can listen for this list by passing this handler to the options object:

    {
      onFeatures: featureHandler
    }

Or by listening directly to the `features` event (which take an identical handler function as above). On the event you also get the feature that has just been removed/added.


In the return data, `object` is of type `parkeervakken` and includes the id and the geometry as a GeoJSON feature.
