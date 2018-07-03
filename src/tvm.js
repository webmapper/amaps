import 'babel-polyfill';
import 'whatwg-fetch';
import { nlmaps } from '../nlmaps/dist/nlmaps.es.js';
import { pointQueryChain } from './lib.js';
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

const defaultStyleSelection = {
  "color": "#ec0000",
  "weight": 2,
  "opacity": 1,
  "fillOpacity": 0.5,
  "fillColor": "#ec0000"
};

const hoverStyleSelection = {
  "color": "#ec0000",
  "weight": 3,
  "opacity": 1,
  "fillOpacity": 0.3,
  "fillColor": '#ec0000'
}

function selectionLayer() {
  let selection = L.geoJson(null, {
    style: selectionStyle,
    onEachFeature: selectionEach
  })
  return selection;
}

function selectionEach(feature, layer) {
  layer.on('mouseover', () => layer.setStyle(hoverStyleSelection));
  layer.on('mouseout', () => layer.setStyle(defaultStyleSelection));
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
  const zoom = this.map.getZoom();
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

async function combinePointAndFeatureInfo(click, feature){
  const result = await pointQueryChain(click, tvm);
  result.object = feature;
  return result;
}


tvm.store = {
  store: [],
  addFeature: async function(feature, e) {
    tvm.selection.addData(feature);
    const result = await combinePointAndFeatureInfo({latlng: e.latlng}, feature);
    this.store.push(result);
    tvm.emit('feature',{features: this.store, type: 'added', added: result});
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



tvm.createMap = async function(config) {
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
