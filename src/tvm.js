import 'babel-polyfill';
import 'whatwg-fetch';
import { nlmaps } from '../nlmaps/dist/nlmaps.es.js';
import { callchain, requestFormatter, responseFormatter } from './mora/index.js';
import { chainWrapper } from './utils.js';
import makeSubject from 'callbag-subject';
import { combine } from 'callbag-basics';
import toAwaitable from 'callbag-to-awaitable';
import emitonoff from 'emitonoff';
/* eslint-disable-next-line max-len */
const URL = 'https://map.data.amsterdam.nl/maps/parkeervakken?REQUEST=GetFeature&SERVICE=wfs&OUTPUTFORMAT=application/json;%20subtype=geojson;%20charset=utf-8&Typename=fiscaal_parkeervakken&version=1.1.0&srsname=urn:ogc:def:crs:EPSG::4326';
const tvm = {};
emitonoff(tvm);


function parkeerVakken() {
  let parkeervakken = L.geoJson(null, {
    style: defaultStyleParkeerVakken,
    onEachFeature: parkeerVakkenEach

  })
  return parkeervakken;
}

const defaultStyleParkeerVakken = {
  "color": "#000",
  "weight": 2,
  "opacity": 1,
  "fillOpacity": 0
};

const hoverStyleParkeerVakken = {
  "color": "#000",
  "weight": 3,
  "opacity": 1,
  "fillOpacity": 1,
  "fillColor": '#ccc'

}

const selectionStyle = {
  "color": "#ec0000",
  "weight": 2,
  "opacity": 1,
  "fillOpacity": 0.5,
  "fillColor": "#ec0000"
};

function selectionLayer() {
  let selection = L.geoJson(null, {
    style: selectionStyle,
    onEachFeature: selectionEach
  })
  return selection;
}

function selectionEach(feature, layer) {
  layer.on('click', e => {
    e.originalEvent.preventDefault();
    tvm.store.removeFeature(feature, layer);
  })
}

function parkeerVakkenEach(feature, layer) {
  layer.on('mouseover', () => layer.setStyle(hoverStyleParkeerVakken));
  layer.on('mouseout', () => layer.setStyle(defaultStyleParkeerVakken));
  layer.on('click', e => {
    e.originalEvent.preventDefault();
    tvm.store.addFeature(feature, e)
  });
}

function formatWfsUrl(bounds) {
  const ll = {x: bounds._southWest.lng, y: bounds._southWest.lat};
  const ur = {x: bounds._northEast.lng, y: bounds._northEast.lat};
  return `${URL}&bbox=${ll.x},${ll.y},${ur.x},${ur.y}`
}


async function reloadWfs() {
  const zoom = map.getZoom();
  let layers = this.parkeervakken.getLayers();
  if (zoom > 16) {
    const bounds = this.map.getBounds();
    const data = await fetch(formatWfsUrl(bounds)).then(res => res.json());
    layers.forEach(lyr => lyr.remove());
    this.parkeervakken.clearLayers();
    this.parkeervakken.addData(data);
    tvm.selection.bringToFront();
  } else {
    layers.forEach(lyr => lyr.remove());
    this.parkeervakken.clearLayers();
  }
}

const ClickProvider = function() {
  const sinks = [];
  return function(type, data) {
    if (type === 1) {
      sinks.forEach(sink => sink(1, data));
      return;
    }
    const clickSource = function (start, sink) {
      if (start !== 0) return;
      sinks.push(sink);
      const talkback = () => {};
      sink(0, talkback);
    };

    clickSource.subscribe = function (callback) {
      clickSource(0, callback)
    }
    return clickSource;
  }
}
const clickProvider = ClickProvider();
const clickSource = clickProvider(0);
const featureQuery = nlmaps.queryFeatures(clickSource,
    "https://api.data.amsterdam.nl/bag/nummeraanduiding/?format=json&locatie=",
    requestFormatter,
    responseFormatter
);
const response = chainWrapper(featureQuery, callchain)

const subject = makeSubject();
const result =  toAwaitable(combine(response, subject));

tvm.store = {
  store: [],
  addFeature: async function(feature, e) {
    tvm.selection.addData(feature);
    clickProvider(1, {latlng: e.latlng});
    subject(1, feature);
    const res = await(result);
    res[0].object = {
      type: 'parkeervak',
      id: res[1].properties.id,
      geometry: res[1].geometry
    };
    this.store.push(res[0]);
    tvm.emit('feature',{features: this.store, type: 'added', added: res[0]});
  },
  removeFeature: function(feature, layer) {
    const idx = this.store.findIndex(item => item.object.id === feature.properties.id);
    const removed = this.store[idx];
    this.store.splice(idx, 1);
    tvm.selection.removeLayer(layer);
    
    tvm.emit('feature', {features: this.store, type: 'removed', removed: removed});
  },
  getStore: function() {
    return this.store
  }
}



tvm.createMap = function(config) {
  let nlmapsconf = {
    target: config.target,
    layer: config.layer,
    marker: config.marker,
    search: config.search,
    zoom: config.zoom
  };
  let map = nlmaps.createMap(nlmapsconf);
  this.map = map;
  let parkeervakken = parkeerVakken();
  this.parkeervakken = parkeervakken;
  parkeervakken.addTo(map);
  map.on('moveend', reloadWfs, this);
  
  parkeervakken.on('remove', () => {
    map.off('moveend', reloadWfs, this);
  })

  tvm.selection = selectionLayer();
  tvm.selection.addTo(map);

  if (typeof config.onFeatures === 'function') {
    tvm.on('feature', data => {
      config.onFeatures(data.features);
    });
  } else if (Array.isArray(config.onFeatures)) {
    config.onFeatures.forEach((f) =>{
      if (typeof f === 'function') {
        tvm.on('feature', data => {
          f(data.features);
        });
      }
    })
  }

  return map;
}

export default tvm;
