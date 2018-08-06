import 'whatwg-fetch';
import tress from 'tress';
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
    style: defaultStyleSelection,
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


//store uses a queue so that clicks on the map will be handled in order
//and no race conditions will ensue in the store.
tvm.store = {
  store: [],
  queue: tress(async (job, done) => {
    if (job.type === 'add') {
      tvm.selection.addData(job.feature);
      const result = await combinePointAndFeatureInfo({latlng: job.e.latlng}, job.feature);
      tvm.store.store.push(result);
      tvm.emit('feature',{features: tvm.store.store, type: 'added', added: result});
      done(null, 'added')
    } else if (job.type === 'remove') {
      const idx = tvm.store.store.findIndex(item => item.object.id === job.feature.properties.id);
      const removed = tvm.store.store[idx];
      tvm.store.store.splice(idx, 1);
      tvm.selection.removeLayer(job.layer);
      tvm.emit('feature', {features: tvm.store.store, type: 'removed', removed: removed});
      done(null, 'removed');
    }

  }),
  addFeature: async function(feature, e) {
    this.queue.push({type: 'add', feature: feature, e: e})
  },
  removeFeature: function(feature, layer) {
    this.queue.push({type: 'remove', feature: feature, layer: layer});
    
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
