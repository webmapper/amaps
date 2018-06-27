import { nlmaps } from '../nlmaps/dist/nlmaps.es.js';
//import {callchain, requestFormatter, responseFormatter } from './tvm/index.js';
import { chainWrapper } from './utils.js';
/* eslint-disable-next-line max-len */
const URL = 'https://map.data.amsterdam.nl/maps/parkeervakken?REQUEST=GetFeature&SERVICE=wfs&OUTPUTFORMAT=application/json;%20subtype=geojson;%20charset=utf-8&Typename=fiscaal_parkeervakken&version=1.1.0&srsname=urn:ogc:def:crs:EPSG::4326';
const tvm = {};

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

function parkeerVakkenEach(feature, layer) {
  layer.on('mouseover', e => layer.setStyle(hoverStyleParkeerVakken));
  layer.on('mouseout', e => layer.setStyle(defaultStyleParkeerVakken));
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
  } else {
    layers.forEach(lyr => lyr.remove());
    this.parkeervakken.clearLayers();
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
  
  parkeervakken.on('remove',x => {
    map.off('moveend', reloadWfs, this);
  })
  return map;
}

export default tvm;
