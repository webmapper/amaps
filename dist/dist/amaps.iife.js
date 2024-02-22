var amaps = (function () {
	'use strict';

	var commonjsGlobal = typeof globalThis !== 'undefined' ? globalThis : typeof window !== 'undefined' ? window : typeof global !== 'undefined' ? global : typeof self !== 'undefined' ? self : {};

	function unwrapExports (x) {
		return x && x.__esModule && Object.prototype.hasOwnProperty.call(x, 'default') ? x['default'] : x;
	}

	function createCommonjsModule(fn, module) {
		return module = { exports: {} }, fn(module, module.exports), module.exports;
	}

	var emitonoff = createCommonjsModule(function (module) {
	  var EmitOnOff = module.exports = function (thing) {
	    if (!thing) thing = {};

	    thing._subs = [];
	    thing._paused = false;
	    thing._pending = [];

	    /**
	     * Sub of pubsub
	     * @param  {String}   name name of event
	     * @param  {Function} cb   your callback
	     */
	    thing.on = function (name, cb) {
	      thing._subs[name] = thing._subs[name] || [];
	      thing._subs[name].push(cb);
	    };

	    /**
	     * remove sub of pubsub
	     * @param  {String}   name name of event
	     * @param  {Function} cb   your callback
	     */
	    thing.off = function (name, cb) {
	      if (!thing._subs[name]) return;
	      for (var i in thing._subs[name]) {
	        if (thing._subs[name][i] === cb) {
	          thing._subs[name].splice(i);
	          break;
	        }
	      }
	    };

	    /**
	     * Pub of pubsub
	     * @param  {String}   name name of event
	     * @param  {Mixed}    data the data to publish
	     */
	    thing.emit = function (name) {
	      if (!thing._subs[name]) return;

	      var args = Array.prototype.slice.call(arguments, 1);

	      if (thing._paused) {
	        thing._pending[name] = thing._pending[name] || [];
	        thing._pending[name].push(args);
	        return;
	      }

	      for (var i in thing._subs[name]) {
	        thing._subs[name][i].apply(thing, args);
	      }
	    };

	    thing.pause = function () {
	      thing._paused = true;
	    };

	    thing.resume = function () {
	      thing._paused = false;

	      for (var name in thing._pending) {
	        for (var i = 0; i < thing._pending[name].length; i++) {
	          thing.emit(name, thing._pending[name][i]);
	        }
	      }
	    };

	    return thing;
	  };
	});

	var config = {
	  version: 0.2,
	  basemaps: {
	    defaults: {
	      attribution: 'Kaartgegevens CC-BY-4.0 Gemeente Amsterdam',
	      minZoom: 12,
	      maxZoom: 21,
	      type: 'tms',
	      format: 'png',
	      url: 'https://t1.data.amsterdam.nl'
	    },
	    layers: [{
	      name: 'standaard',
	      layerName: 'topo_wm'
	    }, {
	      name: 'zwartwit',
	      layerName: 'topo_wm_zw'
	    }, {
	      name: 'licht',
	      layerName: 'topo_wm_light'
	    }, {
	      name: 'donker',
	      layerName: 'topo_wm'
	    }]
	  },
	  wms: {
	    defaults: {
	      url: 'https://map.data.amsterdam.nl/maps',
	      version: '1.1.0',
	      transparent: true,
	      format: 'image/png',
	      minZoom: 0,
	      maxZoom: 24,
	      styleName: ''
	    },
	    layers: [{
	      name: 'tram',
	      layerName: 'trm',
	      url: 'https://map.data.amsterdam.nl/maps/trm?'
	    }]
	  },
	  geocoder: {
	    suggestUrl: 'https://api.pdok.nl/bzk/locatieserver/search/v3_1/suggest?fq=gemeentenaam:amsterdam&fq=type:adres&',
	    lookupUrl: 'https://api.pdok.nl/bzk/locatieserver/search/v3_1/lookup?fq=gemeentenaam:amsterdam&fq=type:adres&',
	    placeholder: 'Kies adres...'
	  },
	  featureQuery: {
	    baseUrl: 'https://api.data.amsterdam.nl/bag/v1.1/nummeraanduiding/?format=json&locatie='
	  },
	  marker: {
	    url: '/dist/images/svg/marker.svg',
	    iconSize: [40, 40],
	    iconAnchor: [20, 39]
	  },
	  map: {
	    style: 'standaard',
	    center: {
	      latitude: 52.37,
	      longitude: 4.8952
	    },
	    zoom: 14,
	    attribution: true,
	    extent: [52.25168, 4.64034, 52.50536, 5.10737],
	    zoomposition: 'bottomright'
	  },
	  classnames: {
	    geocoderContainer: ['embed-search'],
	    geocoderSearch: ['embed-search__form'],
	    geocoderButton: ['primary', 'action', 'embed-search__button'],
	    geocoderResultList: ['embed-search__auto-suggest'],
	    geocoderResultItem: ['embed-search__auto-suggest__item'],
	    geocoderResultSelected: ['embed-search__auto-suggest__item--active']
	  }
	};

	var CONFIG = {};

	CONFIG.BASE_DEFAULTS = {
	    crs: "EPSG:3857",
	    attr: "",
	    minZoom: 0,
	    maxZoom: 19,
	    type: "wmts",
	    format: "png",
	    url: ""
	};
	CONFIG.WMS_DEFAULTS = {
	    url: "",
	    version: "1.1.1",
	    transparent: true,
	    format: "image/png",
	    minZoom: 0,
	    maxZoom: 24,
	    styleName: ""
	};
	CONFIG.BASEMAP_PROVIDERS = {};
	CONFIG.WMS_PROVIDERS = {};
	CONFIG.GEOCODER = {};
	CONFIG.MAP = {
	    "zoomposition": "bottomleft"
	};
	CONFIG.MARKER = {};
	CONFIG.CLASSNAMES = {
	    'geocoderContainer': ['nlmaps-geocoder-control-container'],
	    'geocoderSearch': ['nlmaps-geocoder-control-search'],
	    'geocoderButton': ['nlmaps-geocoder-control-button'],
	    'geocoderResultList': ['nlmaps-geocoder-result-list'],
	    'geocoderResultItem': ['nlmaps-geocoder-result-item']
	};

	function err(err) {
	    throw err;
	}

	if (config.version !== 0.2) {
	    err('unsupported config version');
	}

	function mergeConfig(defaults, config$$1) {
	    return Object.assign({}, defaults, config$$1);
	}

	function parseBase(basemaps) {
	    var defaults = mergeConfig(CONFIG.BASE_DEFAULTS, basemaps.defaults);
	    if (!basemaps.layers || basemaps.layers.length < 0) {
	        err('no basemap defined, please define a basemap in the configuration');
	    }
	    basemaps.layers.forEach(function (layer) {
	        if (!layer.name || CONFIG.BASEMAP_PROVIDERS[layer.name] !== undefined) {
	            err('basemap names need to be defined and unique: ' + layer.name);
	        }
	        CONFIG.BASEMAP_PROVIDERS[layer.name] = formatBasemapUrl(mergeConfig(defaults, layer));
	    });
	}
	function parseWMS(wms) {
	    var defaults = mergeConfig(CONFIG.WMS_DEFAULTS, wms.defaults);
	    if (wms.layers) {
	        wms.layers.forEach(function (layer) {
	            if (!layer.name || CONFIG.WMS_PROVIDERS[layer.name] !== undefined) {
	                err('wms names need to be defined and unique: ' + layer.name);
	            }
	            CONFIG.WMS_PROVIDERS[layer.name] = applyTemplate(mergeConfig(defaults, layer));
	        });
	    }
	}
	function parseGeocoder(geocoder) {
	    CONFIG.GEOCODER.lookupUrl = geocoder.lookupUrl;
	    CONFIG.GEOCODER.suggestUrl = geocoder.suggestUrl;
	    CONFIG.GEOCODER.placeholder = geocoder.placeholder;
	}
	function parseMap(map) {
	    CONFIG.MAP = mergeConfig(CONFIG.MAP, map);
	}

	function formatBasemapUrl(layer) {
	    switch (layer.type) {
	        case 'wmts':
	            layer.url = layer.url + "/" + layer.type + "/" + layer.layerName + "/" + layer.crs + "/{z}/{x}/{y}." + layer.format;
	            break;
	        case 'tms':
	            layer.url = layer.url + "/" + layer.layerName + "/{z}/{x}/{y}." + layer.format;
	            break;
	        default:
	            layer.url = layer.url + "/" + layer.type + "/" + layer.layerName + "/" + layer.crs + "/{z}/{x}/{y}." + layer.format;
	    }
	    return layer;
	}

	function applyTemplate(layer) {
	    //Check if the url is templated
	    var start = layer.url.indexOf('{');
	    if (start > -1) {
	        var end = layer.url.indexOf('}');
	        var template = layer.url.slice(start + 1, end);
	        if (template.toLowerCase() === "workspacename") {
	            layer.url = layer.url.slice(0, start) + layer.workSpaceName + layer.url.slice(end + 1, -1);
	        } else {
	            err('only workspacename templates are supported for now');
	        }
	    }
	    return layer;
	}

	function parseFeatureQuery(baseUrl) {
	    CONFIG.FEATUREQUERYBASEURL = baseUrl;
	}

	function parseClasses(classes) {
	    CONFIG.CLASSNAMES = mergeConfig(CONFIG.CLASSNAMES, classes);
	}

	function parseMarker(marker) {
	    CONFIG.MARKER = marker;
	}

	if (config.featureQuery !== undefined) parseFeatureQuery(config.featureQuery.baseUrl);
	if (config.map !== undefined) parseMap(config.map);
	parseBase(config.basemaps);
	if (config.wms !== undefined) parseWMS(config.wms);
	if (config.geocoder !== undefined) parseGeocoder(config.geocoder);
	if (config.marker !== undefined) parseMarker(config.marker);
	if (config.classnames !== undefined) parseClasses(config.classnames);

	var geocoder = CONFIG.GEOCODER;

	function httpGetAsync(url) {
	    // eslint-disable-next-line no-unused-vars
	    return new Promise(function (resolve, reject) {
	        var xmlHttp = new XMLHttpRequest();
	        xmlHttp.onreadystatechange = function () {
	            // eslint-disable-next-line eqeqeq
	            if (xmlHttp.readyState == 4 && xmlHttp.status == 200) {
	                resolve(JSON.parse(xmlHttp.responseText));
	            }
	        };
	        xmlHttp.open("GET", url, true); // true for asynchronous
	        xmlHttp.send(null);
	    });
	}

	function wktPointToGeoJson(wktPoint) {
	    if (!wktPoint.includes('POINT')) {
	        throw TypeError('Provided WKT geometry is not a point.');
	    }
	    var coordinateTuple = wktPoint.split('(')[1].split(')')[0];
	    var x = parseFloat(coordinateTuple.split(' ')[0]);
	    var y = parseFloat(coordinateTuple.split(' ')[1]);

	    return {
	        type: 'Point',
	        coordinates: [x, y]
	    };
	}

	geocoder.resultList = [];
	geocoder.selectedResult = -1;
	/**
	 * Make a call to PDOK locatieserver v3 suggest service. This service is meant for geocoder autocomplete functionality. For
	 * additional documentation, check https://github.com/PDOK/locatieserver/wiki/API-Locatieserver.
	 * @param {string} searchTerm The term which to search for
	 */
	geocoder.doSuggestRequest = function (searchTerm) {
	    return httpGetAsync(this.suggestUrl + 'q=' + encodeURIComponent(searchTerm));
	};

	/**
	 * Make a call to PDOK locatieserver v3 lookup service. This service provides information about objects found through the suggest service. For additional
	 * documentation, check: https://github.com/PDOK/locatieserver/wiki/API-Locatieserver
	 * @param {string} id The id of the feature that is to be looked up.
	 */
	geocoder.doLookupRequest = function (id) {
	    return httpGetAsync(this.lookupUrl + 'id=' + encodeURIComponent(id)).then(function (lookupResult) {
	        // A lookup request should always return 1 result
	        var geocodeResult = lookupResult.response.docs[0];
	        geocodeResult.centroide_ll = wktPointToGeoJson(geocodeResult.centroide_ll);
	        geocodeResult.centroide_rd = wktPointToGeoJson(geocodeResult.centroide_rd);
	        return geocodeResult;
	    });
	};

	geocoder.createControl = function (zoomFunction, map, nlmaps) {
	    var _this = this;

	    this.zoomTo = zoomFunction;
	    this.map = map;
	    this.nlmaps = nlmaps;
	    var container = document.createElement('div');
	    var searchDiv = document.createElement('form');
	    var input = document.createElement('input');
	    var button = document.createElement('button');
	    var results = document.createElement('div');

	    parseClasses$1(container, CONFIG.CLASSNAMES.geocoderContainer);
	    parseClasses$1(searchDiv, CONFIG.CLASSNAMES.geocoderSearch);
	    container.addEventListener('click', function (e) {
	        return e.stopPropagation();
	    });
	    container.addEventListener('dblclick', function (e) {
	        return e.stopPropagation();
	    });

	    input.id = 'nlmaps-geocoder-control-input';
	    input.placeholder = geocoder.placeholder;

	    input.setAttribute('aria-label', geocoder.placeholder);
	    input.setAttribute('type', 'text');
	    input.setAttribute('autocapitalize', 'off');
	    input.setAttribute('autocomplete', 'off');
	    input.setAttribute('autocorrect', 'off');
	    input.setAttribute('spellcheck', 'false');

	    input.addEventListener('keydown', function (e) {
	        var results = _this.resultList;
	        if (_this.resultList.length > 0) {
	            if (e.code === 'ArrowDown' || e.keyCode === 40) {
	                if (_this.selectedResult < _this.resultList.length - 1) {
	                    _this.selectedResult++;
	                }
	                _this.showLookupResult(results[_this.selectedResult]);
	            }
	            if (e.code === 'ArrowUp' || e.keyCode === 38) {
	                if (_this.selectedResult > 0) {
	                    _this.selectedResult--;
	                }
	                _this.showLookupResult(results[_this.selectedResult]);
	            }
	            if (e.code === 'Escape') {

	                _this.clearSuggestResults(true);
	            }
	        }
	    });
	    input.addEventListener('input', function (e) {

	        _this.suggest(e.target.value);
	    });
	    input.addEventListener('focus', function (e) {
	        _this.suggest(e.target.value);
	    });
	    button.setAttribute('type', 'submit');
	    searchDiv.addEventListener('submit', function (e) {
	        e.preventDefault();
	        if (_this.resultList.length > 0) {
	            _this.lookup(_this.resultList[_this.selectedResult < 0 ? 0 : _this.selectedResult].id);
	        }
	    });
	    button.setAttribute('aria-label', geocoder.placeholder);
	    parseClasses$1(button, CONFIG.CLASSNAMES.geocoderButton);

	    results.id = 'nlmaps-geocoder-control-results';
	    parseClasses$1(results, CONFIG.CLASSNAMES.geocoderResultList);
	    results.classList.add('nlmaps-hidden');
	    container.appendChild(searchDiv);
	    searchDiv.appendChild(input);
	    searchDiv.appendChild(button);
	    container.appendChild(results);

	    return container;
	};

	geocoder.suggest = function (query) {
	    var _this2 = this;

	    if (query.length < 3) {
	        this.clearSuggestResults();
	        return;
	    }

	    this.doSuggestRequest(query).then(function (results) {
	        _this2.resultList = results.response.docs;
	        _this2.showSuggestResults(_this2.resultList);
	    });
	};

	geocoder.lookup = function (id) {
	    var _this3 = this;

	    this.doLookupRequest(id).then(function (result) {
	        _this3.zoomTo(result.centroide_ll, _this3.map);
	        _this3.nlmaps.emit('search-select', { location: result.weergavenaam, latlng: result.centroide_ll, resultObject: result });
	        _this3.showLookupResult(result);
	        _this3.clearSuggestResults();
	    });
	};

	geocoder.clearSuggestResults = function (input) {
	    this.selectedResult = -1;
	    if (input) document.getElementById('nlmaps-geocoder-control-input').value = '';
	    document.getElementById('nlmaps-geocoder-control-results').innerHTML = '';
	    document.getElementById('nlmaps-geocoder-control-results').classList.add('nlmaps-hidden');
	};

	geocoder.showLookupResult = function (result) {
	    var resultNodes = document.getElementsByClassName(CONFIG.CLASSNAMES.geocoderResultItem);
	    Array.prototype.map.call(resultNodes, function (i) {
	        return i.classList.remove(CONFIG.CLASSNAMES.geocoderResultSelected);
	    });
	    var resultNode = document.getElementById(result.id);
	    if (resultNode) resultNode.classList.add(CONFIG.CLASSNAMES.geocoderResultSelected);
	    document.getElementById('nlmaps-geocoder-control-input').value = result.weergavenaam;
	};

	function parseClasses$1(el, classes) {
	    classes.forEach(function (classname) {
	        el.classList.add(classname);
	    });
	}

	geocoder.showSuggestResults = function (results) {
	    var _this4 = this;

	    this.clearSuggestResults();
	    if (results.length > 0) {
	        var resultList = document.createElement('ul');
	        results.forEach(function (result) {

	            var li = document.createElement('li');
	            var a = document.createElement('a');
	            a.innerHTML = result.weergavenaam;
	            a.id = result.id;
	            parseClasses$1(a, CONFIG.CLASSNAMES.geocoderResultItem);
	            a.setAttribute('href', '#');
	            a.addEventListener('click', function (e) {
	                e.preventDefault();
	                _this4.lookup(e.target.id);
	            });
	            li.appendChild(a);
	            resultList.appendChild(li);
	        });
	        document.getElementById('nlmaps-geocoder-control-results').classList.remove('nlmaps-hidden');
	        document.getElementById('nlmaps-geocoder-control-results').appendChild(resultList);
	    }
	};

	/*parts copied from maps.stamen.com: https://github.com/stamen/maps.stamen.com/blob/master/js/tile.stamen.js
	 * copyright (c) 2012, Stamen Design
	 * under BSD 3-Clause license: https://github.com/stamen/maps.stamen.com/blob/master/LICENSE
	 */

	function getMarker() {
	  return CONFIG.MARKER;
	}

	function getExtent() {
	  return CONFIG.MAP.extent;
	}

	/*
	 * Get the named provider, or throw an exception if it doesn't exist.
	 **/
	function getProvider(name) {
	  if (name in CONFIG.BASEMAP_PROVIDERS) {
	    var provider = CONFIG.BASEMAP_PROVIDERS[name];

	    // eslint-disable-next-line no-console
	    if (provider.deprecated && console && console.warn) {
	      // eslint-disable-next-line no-console
	      console.warn(name + " is a deprecated style; it will be redirected to its replacement. For performance improvements, please change your reference.");
	    }

	    return provider;
	  } else {
	    // eslint-disable-next-line no-console
	    console.error('NL Maps error: You asked for a style which does not exist! Available styles: ' + Object.keys(PROVIDERS).join(', '));
	  }
	}

	/*
	 * Get the named wmsProvider, or throw an exception if it doesn't exist.
	 **/
	function getWmsProvider(name, options) {
	  var wmsProvider = void 0;
	  if (name in CONFIG.WMS_PROVIDERS) {
	    wmsProvider = CONFIG.WMS_PROVIDERS[name];

	    // eslint-disable-next-line no-console
	    if (wmsProvider.deprecated && console && console.warn) {
	      // eslint-disable-next-line no-console
	      console.warn(name + " is a deprecated wms; it will be redirected to its replacement. For performance improvements, please change your reference.");
	    }
	  } else {
	    wmsProvider = Object.assign({}, CONFIG.WMS_DEFAULTS, options);
	    // eslint-disable-next-line no-console
	    console.log('NL Maps: You asked for a wms which does not exist! Available wmses: ' + Object.keys(CONFIG.WMS_PROVIDERS).join(', ') + '. Provide an options object to make your own WMS.');
	  }
	  return wmsProvider;
	}

	function mapPointerStyle(map) {
	  var classList = map._container.classList;
	  classList.add('nlmaps-marker-cursor');
	}

	var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) {
	  return typeof obj;
	} : function (obj) {
	  return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;
	};

	function extentLeafletFormat() {
	  var extent = getExtent();
	  var lowerLeft = L.latLng(extent[0], extent[1]);
	  var upperRight = L.latLng(extent[2], extent[3]);
	  var bounds = L.latLngBounds(lowerLeft, upperRight);
	  return bounds;
	}

	//TODO 'standaard' vervangen door eerste layer van baselayers
	if (typeof L !== 'undefined' && (typeof L === 'undefined' ? 'undefined' : _typeof(L)) === 'object') {
	  L.NlmapsBgLayer = L.TileLayer.extend({
	    initialize: function initialize() {
	      var name = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 'standaard';
	      var options = arguments[1];

	      var provider = getProvider(name);
	      var opts = L.Util.extend({}, options, {
	        'minZoom': provider.minZoom,
	        'maxZoom': provider.maxZoom,
	        'scheme': 'xyz',
	        'attribution': provider.attribution,
	        'subdomains': provider.subdomains ? provider.subdomains : 'abc',
	        sa_id: name
	      });
	      L.TileLayer.prototype.initialize.call(this, provider.url, opts);
	    }
	  });

	  /*
	   * Factory function for consistency with Leaflet conventions
	   **/
	  L.nlmapsBgLayer = function (options, source) {
	    return new L.NlmapsBgLayer(options, source);
	  };

	  L.NlmapsOverlayLayer = L.TileLayer.WMS.extend({
	    initialize: function initialize() {
	      var name = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : '';
	      var options = arguments[1];

	      var wmsProvider = getWmsProvider(name, options);
	      var url = wmsProvider.url;
	      delete wmsProvider.url;
	      var wmsParams = L.Util.extend({}, options, {
	        layers: wmsProvider.layerName,
	        maxZoom: 24,
	        minZoom: 1,
	        styles: wmsProvider.styleName,
	        version: wmsProvider.version,
	        transparent: wmsProvider.transparent,
	        format: wmsProvider.format
	      });
	      L.TileLayer.WMS.prototype.initialize.call(this, url, wmsParams);
	    }
	  });

	  /*
	   * Factory function for consistency with Leaflet conventions
	   **/
	  L.nlmapsOverlayLayer = function (options, source) {
	    return new L.NlmapsOverlayLayer(options, source);
	  };

	  L.Control.GeoLocatorControl = L.Control.extend({
	    options: {
	      position: 'topright'
	    },
	    initialize: function initialize(options) {
	      // set default options if nothing is set (merge one step deep)
	      for (var i in options) {
	        if (_typeof(this.options[i]) === 'object') {
	          L.extend(this.options[i], options[i]);
	        } else {
	          this.options[i] = options[i];
	        }
	      }
	    },

	    onAdd: function onAdd(map) {
	      var div = L.DomUtil.create('div');
	      div.id = 'nlmaps-geolocator-control';
	      div.className = 'nlmaps-geolocator-control';
	      var img = document.createElement('img');
	      div.append(img);
	      if (this.options.geolocator.isStarted()) {
	        L.DomUtil.addClass(div, 'started');
	      }
	      function moveMap(position) {
	        map.panTo([position.coords.latitude, position.coords.longitude]);
	      }
	      L.DomEvent.on(div, 'click', function () {
	        this.options.geolocator.start();
	        L.DomUtil.addClass(div, 'started');
	      }, this);
	      this.options.geolocator.on('position', function (d) {
	        L.DomUtil.removeClass(div, 'started');
	        L.DomUtil.addClass(div, 'has-position');
	        moveMap(d);
	      });
	      return div;
	    },
	    onRemove: function onRemove(map) {
	      return map;
	    }
	  });

	  L.geoLocatorControl = function (geolocator) {
	    return new L.Control.GeoLocatorControl({ geolocator: geolocator });
	  };
	}
	function markerLayer(latLngObject) {
	  if (typeof L !== 'undefined' && (typeof L === 'undefined' ? 'undefined' : _typeof(L)) === 'object') {
	    var lat = void 0;
	    var lng = void 0;
	    // LatLngObject should always be defined when it is called from the main package.
	    // eslint-disable-next-line eqeqeq
	    if (typeof latLngObject == 'undefined') {
	      var center = getMapCenter(map);
	      lat = center.latitude;
	      lng = center.longitude;
	    } else {
	      lat = latLngObject.latitude;
	      lng = latLngObject.longitude;
	    }
	    return new L.marker([lat, lng], {
	      alt: 'marker',
	      icon: new L.icon({
	        iconUrl: getMarker().url,
	        iconSize: getMarker().iconSize,
	        iconAnchor: getMarker().iconAnchor
	      })
	    });
	  }
	}

	function bgLayer(name) {
	  if (typeof L !== 'undefined' && (typeof L === 'undefined' ? 'undefined' : _typeof(L)) === 'object') {
	    return L.nlmapsBgLayer(name);
	  }
	}

	function overlayLayer(name, options) {
	  if (typeof L !== 'undefined' && (typeof L === 'undefined' ? 'undefined' : _typeof(L)) === 'object') {
	    return L.nlmapsOverlayLayer(name, options);
	  }
	}

	function geoLocatorControl(geolocator) {
	  if (typeof L !== 'undefined' && (typeof L === 'undefined' ? 'undefined' : _typeof(L)) === 'object') {
	    return L.geoLocatorControl(geolocator);
	  }
	}
	function zoomTo(point, map) {
	  map.fitBounds(L.geoJSON(point).getBounds(), { maxZoom: 18 });
	}

	function geocoderControl(map, nlmaps) {
	  var control = geocoder.createControl(zoomTo, map, nlmaps);
	  map.getContainer().parentElement.insertBefore(control, map.getContainer().parentElement[0]);
	}

	function getMapCenter(map) {
	  var latLngObject = map.getCenter();
	  return {
	    latitude: latLngObject.lat,
	    longitude: latLngObject.lng
	  };
	}

	function bgLayer$1() {
	  var name = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 'standaard';

	  var provider = getProvider(name);
	  //replace leaflet style subdomain to OL style
	  if (provider.subdomains) {
	    var sub = provider.subdomains;
	    provider.url = provider.url.replace('{s}', '{' + sub.slice(0, 1) + '-' + sub.slice(-1) + '}');
	  }
	  if ((typeof ol === 'undefined' ? 'undefined' : _typeof(ol)) === "object") {
	    return new ol.layer.Tile({
	      source: new ol.source.XYZ({
	        url: provider.url,
	        attributions: [new ol.Attribution({
	          html: provider.attribution
	        })]
	      })
	    });
	  } else {
	    throw 'openlayers is not defined';
	  }
	}
	function markerLayer$1(latLngObject) {
	  var markerStyle = new ol.style.Style({
	    image: new ol.style.Icon({
	      anchor: [32, 63],
	      anchorXUnits: 'pixels',
	      anchorYUnits: 'pixels',
	      src: getMarker().url,
	      scale: 1
	    })
	  });
	  var lat = void 0;
	  var lng = void 0;

	  // eslint-disable-next-line eqeqeq
	  if (typeof latLngObject == 'undefined') {
	    var mapCenter = getMapCenter$1(map);
	    lat = mapCenter.latitude;
	    lng = mapCenter.longitude;
	  } else {
	    lat = latLngObject.latitude;
	    lng = latLngObject.longitude;
	  }

	  var center = ol.proj.fromLonLat([lng, lat]);

	  var markerFeature = new ol.Feature({
	    geometry: new ol.geom.Point(center),
	    name: 'marker'
	  });

	  markerFeature.setStyle(markerStyle);

	  var markerSource = new ol.source.Vector({
	    features: [markerFeature]
	  });
	  return new ol.layer.Vector({
	    source: markerSource
	  });
	}

	function overlayLayer$1(name, options) {
	  var wmsProvider = getWmsProvider(name, options);
	  if ((typeof ol === 'undefined' ? 'undefined' : _typeof(ol)) === "object") {
	    return new ol.layer.Tile({
	      source: new ol.source.TileWMS({
	        url: wmsProvider.url,
	        serverType: 'geoserver',
	        params: {
	          LAYERS: wmsProvider.layerName,
	          VERSION: wmsProvider.version,
	          STYLES: wmsProvider.styleName
	        }
	      })
	    });
	  } else {
	    throw 'openlayers is not defined';
	  }
	}

	function geoLocatorControl$1(geolocator, map) {
	  var myControlEl = document.createElement('div');
	  myControlEl.className = 'nlmaps-geolocator-control ol-control';

	  myControlEl.addEventListener('click', function () {
	    geolocator.start();
	  });

	  function moveMap(d) {
	    var map = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : map;

	    var oldZoom = map.getView().getZoom();
	    var view = new ol.View({
	      center: ol.proj.fromLonLat([d.coords.longitude, d.coords.latitude]),
	      zoom: oldZoom
	    });
	    map.setView(view);
	  }
	  geolocator.on('position', function (d) {
	    moveMap(d, map);
	  });
	  var control = new ol.control.Control({ element: myControlEl });
	  return control;
	}

	function zoomTo$1(point, map) {
	  var newCenter = ol.proj.fromLonLat(point.coordinates);
	  map.getView().setCenter(newCenter);
	  map.getView().setZoom(18);
	}

	function getMapCenter$1(map) {
	  var EPSG3857Coords = map.getView().getCenter();
	  var lngLatCoords = ol.proj.toLonLat(EPSG3857Coords);
	  return {
	    longitude: lngLatCoords[0],
	    latitude: lngLatCoords[1]
	  };
	}

	function geocoderControl$1(map) {
	  var control = geocoder.createControl(zoomTo$1, map);
	  control = new ol.control.Control({ element: control });
	  map.addControl(control);
	}

	function AttributionControl(controlDiv, attrControlText) {
	  if ((typeof google === 'undefined' ? 'undefined' : _typeof(google)) === 'object' && _typeof(google.maps) === 'object') {
	    var controlUI = document.createElement('div');
	    controlUI.style.backgroundColor = '#fff';
	    controlUI.style.opacity = '0.7';
	    controlUI.style.border = '2px solid #fff';
	    controlUI.style.cursor = 'pointer';
	    controlDiv.appendChild(controlUI);

	    // Set CSS for the control interior.
	    var controlText = document.createElement('div');
	    controlText.style.color = 'rgb(25,25,25)';
	    controlText.style.fontFamily = 'Roboto,Arial,sans-serif';
	    controlText.style.fontSize = '10px';
	    controlText.innerHTML = attrControlText;
	    controlUI.appendChild(controlText);

	    controlDiv.index = 1;
	    return controlDiv;
	  } else {
	    var error = 'google is not defined';
	    throw error;
	  }
	}

	function geoLocatorControl$2(geolocator, map) {
	  var controlUI = document.createElement('div');
	  controlUI.id = 'nlmaps-geolocator-control';
	  controlUI.style.backgroundColor = '#fff';
	  controlUI.style.cursor = 'pointer';
	  controlUI.style.boxShadow = '0 1px 5px rgba(0, 0, 0, 0.65)';
	  controlUI.style.height = '26px';
	  controlUI.style.width = '26px';
	  controlUI.style.borderRadius = '26px 26px';
	  controlUI.style.margin = '.5em';
	  controlUI.addEventListener('click', function () {
	    geolocator.start();
	  }, this);
	  geolocator.on('position', function (position) {
	    map.setCenter({ lat: position.coords.latitude, lng: position.coords.longitude });
	  });
	  return controlUI;
	}

	function zoomTo$2(point, map) {
	  map.setCenter({ lat: point.coordinates[1], lng: point.coordinates[0] });
	  map.setZoom(18);
	}

	function indexOfMapControl(controlArray, control) {
	  return controlArray.getArray().indexOf(control);
	}

	function toggleAttrControl(attrControl, map) {
	  var currentMapId = map.getMapTypeId();
	  var controlArray = map.controls[google.maps.ControlPosition.BOTTOM_RIGHT];
	  var indexToRemove = indexOfMapControl(controlArray, attrControl);
	  if (currentMapId === 'roadmap' || currentMapId === 'hybrid' || currentMapId === 'sattelite') {
	    if (indexToRemove > -1) {
	      controlArray.removeAt(indexToRemove);
	    }
	  } else {
	    if (indexToRemove === -1) {
	      controlArray.push(attrControl);
	    }
	  }
	}

	function makeGoogleAttrControl() {
	  var map = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : map;
	  var attr = arguments[1];

	  var attrControlDiv = document.createElement('div');
	  var attrControlText = attr;
	  var attrControl = new AttributionControl(attrControlDiv, attrControlText);
	  map.controls[google.maps.ControlPosition.BOTTOM_RIGHT].push(attrControl);
	  map.addListener('maptypeid_changed', function () {
	    return toggleAttrControl(attrControl, map);
	  });
	}

	function makeGoogleLayerOpts(provider) {
	  return {
	    getTileUrl: function getTileUrl(coord, zoom) {
	      var url = provider.bare_url + '/' + zoom + '/' + coord.x + '/' + coord.y + '.png';
	      return url;
	    },
	    tileSize: new google.maps.Size(256, 256),
	    isPng: true,
	    name: provider.name,
	    maxZoom: provider.maxZoom,
	    minZoom: provider.minZoom
	  };
	}

	function getWmsTiledOptions(wmsProvider) {
	  return {
	    baseUrl: wmsProvider.url,
	    layers: wmsProvider.layers,
	    styles: wmsProvider.styles,
	    format: wmsProvider.format,
	    transparent: wmsProvider.transparent,
	    // todo maybe: add opacity to wmsProvider params
	    opacity: 0.7
	  };
	}

	function bgLayer$2(map) {
	  var name = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 'standaard';

	  if ((typeof google === 'undefined' ? 'undefined' : _typeof(google)) === 'object' && _typeof(google.maps) === 'object') {
	    var provider = getProvider(name);
	    var GoogleLayerOpts = makeGoogleLayerOpts(provider);
	    var layer = new google.maps.ImageMapType(GoogleLayerOpts);
	    // warning: tight coupling with nlmaps.createMap
	    var ourmap = map || this.map || 'undefined';
	    if (typeof ourmap !== 'undefined') {
	      makeGoogleAttrControl(ourmap, provider.attribution);
	    }
	    return layer;
	  } else {
	    var error = 'google is not defined';
	    throw error;
	  }
	}

	function toMercator(coord) {
	  var lat = coord.lat();
	  var lng = coord.lng();
	  if (Math.abs(lng) > 180 || Math.abs(lat) > 90) return;

	  var num = lng * 0.017453292519943295;
	  var x = 6378137.0 * num;
	  var a = lat * 0.017453292519943295;

	  var merc_lon = x;
	  var merc_lat = 3189068.5 * Math.log((1.0 + Math.sin(a)) / (1.0 - Math.sin(a)));

	  return { x: merc_lon, y: merc_lat };
	}

	function WMSTiled(mapObject, wmsTiledOptions) {
	  var options = {
	    getTileUrl: function getTileUrl(coord, zoom) {
	      var proj = mapObject.getProjection();
	      var zfactor = Math.pow(2, zoom);

	      var top = proj.fromPointToLatLng(new google.maps.Point(coord.x * 256 / zfactor, coord.y * 256 / zfactor));
	      var bot = proj.fromPointToLatLng(new google.maps.Point((coord.x + 1) * 256 / zfactor, (coord.y + 1) * 256 / zfactor));

	      var ne = toMercator(top);
	      var sw = toMercator(bot);
	      var bbox = ne.x + ',' + sw.y + ',' + sw.x + ',' + ne.y;

	      var url = wmsTiledOptions.baseUrl;
	      url += 'SERVICE=WMS&VERSION=1.1.1&REQUEST=GetMap&SRS=EPSG:3857';
	      url += '&WIDTH=256';
	      url += '&HEIGHT=256';
	      url += '&LAYERS=' + wmsTiledOptions.layers;
	      url += '&STYLES=' + wmsTiledOptions.styles;
	      url += '&BBOX=' + bbox;
	      url += '&FORMAT=' + wmsTiledOptions.format;
	      url += '&TRANSPARENT=' + wmsTiledOptions.transparent;
	      return url;
	    },
	    tileSize: new google.maps.Size(256, 256),
	    isPng: true
	  };
	  var layer = new google.maps.ImageMapType(options);
	  layer.setOpacity(wmsTiledOptions.opacity);
	  return mapObject.overlayMapTypes.push(layer);
	}

	function overlayLayer$2() {
	  var map = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : map;
	  var name = arguments[1];
	  var options = arguments[2];

	  var wmsProvider = getWmsProvider(name, options);
	  var wmsTiledOptions = getWmsTiledOptions(wmsProvider);
	  var wmsLayer = new WMSTiled(map, wmsTiledOptions);
	  wmsLayer.name = 'wms';

	  return wmsLayer;
	}

	function markerLayer$2(latLngObject) {
	  var lat = void 0;
	  var lng = void 0;
	  // eslint-disable-next-line eqeqeq
	  if (typeof latLngObject == 'undefined') {
	    var mapCenter = getMapCenter$2(map);
	    lat = mapCenter.latitude;
	    lng = mapCenter.longitude;
	  } else {
	    lat = latLngObject.latitude;
	    lng = latLngObject.longitude;
	  }

	  var markerLocationLatLng = new google.maps.LatLng(lat, lng);
	  var marker = new google.maps.Marker({
	    title: 'marker',
	    position: markerLocationLatLng,
	    icon: getMarker().url
	  });
	  return marker;
	}

	function getMapCenter$2(map) {
	  return {
	    latitude: map.getCenter().lat(),
	    longitude: map.getCenter().lng()
	  };
	}

	function geocoderControl$2(map) {
	  var control = geocoder.createControl(zoomTo$2, map);
	  map.getDiv().appendChild(control);
	}

	var emitonoff$1 = createCommonjsModule(function (module) {
	  var EmitOnOff = module.exports = function (thing) {
	    if (!thing) thing = {};

	    thing._subs = [];
	    thing._paused = false;
	    thing._pending = [];

	    /**
	     * Sub of pubsub
	     * @param  {String}   name name of event
	     * @param  {Function} cb   your callback
	     */
	    thing.on = function (name, cb) {
	      thing._subs[name] = thing._subs[name] || [];
	      thing._subs[name].push(cb);
	    };

	    /**
	     * remove sub of pubsub
	     * @param  {String}   name name of event
	     * @param  {Function} cb   your callback
	     */
	    thing.off = function (name, cb) {
	      if (!thing._subs[name]) return;
	      for (var i in thing._subs[name]) {
	        if (thing._subs[name][i] === cb) {
	          thing._subs[name].splice(i);
	          break;
	        }
	      }
	    };

	    /**
	     * Pub of pubsub
	     * @param  {String}   name name of event
	     * @param  {Mixed}    data the data to publish
	     */
	    thing.emit = function (name) {
	      if (!thing._subs[name]) return;

	      var args = Array.prototype.slice.call(arguments, 1);

	      if (thing._paused) {
	        thing._pending[name] = thing._pending[name] || [];
	        thing._pending[name].push(args);
	        return;
	      }

	      for (var i in thing._subs[name]) {
	        thing._subs[name][i].apply(thing, args);
	      }
	    };

	    thing.pause = function () {
	      thing._paused = true;
	    };

	    thing.resume = function () {
	      thing._paused = false;

	      for (var name in thing._pending) {
	        for (var i = 0; i < thing._pending[name].length; i++) {
	          thing.emit(name, thing._pending[name][i]);
	        }
	      }
	    };

	    return thing;
	  };
	});

	var geoLocateDefaultOpts = {
	  follow: false

	  /* eslint-disable-next-line no-unused-vars */
	};
	function positionHandler(position) {
	  this.emit('position', position);
	}
	function positionErrorHandler(error) {
	  this.emit('error', error);
	}

	var GeoLocator = function GeoLocator(opts) {
	  var state = Object.assign({}, geoLocateDefaultOpts, opts);

	  return {
	    start: function start() {
	      state.started = true;
	      navigator.geolocation.getCurrentPosition(positionHandler.bind(this), positionErrorHandler.bind(this), { maximumAge: 60000 });
	      return this;
	    },
	    stop: function stop() {
	      state.started = false;
	      return this;
	    },
	    isStarted: function isStarted() {
	      return state.started;
	    },
	    log: function log() {
	      // eslint-disable-next-line no-console
	      console.log(state);
	      return this;
	    }
	  };
	};

	function geoLocator(opts) {
	  var navigator = typeof window !== 'undefined' ? window.navigator || {} : {};
	  if (typeof navigator !== 'undefined' && 'geolocation' in navigator) {
	    var geolocator = emitonoff$1(GeoLocator(opts));
	    geolocator.on('position', function () {
	      this.stop();
	    });
	    return geolocator;
	  } else {
	    var error = 'geolocation is not available in your browser.';
	    throw error;
	  }
	}

	function query(url) {
	  var promise = new Promise(function (resolve, reject) {
	    fetch(url).then(function (res) {
	      return resolve(res.json());
	    }).catch(function (err) {
	      return reject(err);
	    });
	  });
	  return promise;
	}

	//transforming operator
	//returns an object with original latlng and queryResult:
	// {
	//   queryResult: {},
	//   latlng: d.latlng
	// }
	// user-supplied responseFormatter is used to create queryResult.
	var pointToQuery = function pointToQuery(url, requestFormatter, responseFormatter) {
	  return function (inputSource) {
	    return function outputSource(start, outputSink) {
	      if (start !== 0) return;
	      inputSource(0, function (t, d) {
	        if (t === 1) {
	          var queryUrl = requestFormatter(url, { x: d.latlng.lng, y: d.latlng.lat });
	          query(queryUrl).then(function (res) {
	            var output = {
	              queryResult: responseFormatter(res),
	              latlng: d.latlng
	            };
	            outputSink(1, output);
	          });
	        } else {
	          outputSink(t, d);
	        }
	      });
	    };
	  };
	};

	//constructor to create a 'clickpricker' in one go.
	var queryFeatures = function queryFeatures(source, baseUrl, requestFormatter, responseFormatter) {
	  var querier = pointToQuery(baseUrl, requestFormatter, responseFormatter)(source);
	  querier.subscribe = function (callback) {
	    querier(0, callback);
	  };
	  return querier;
	};

	var markerStore = {
	  markers: [],
	  removeMarker: function removeMarker(marker) {
	    var idx = markerStore.markers.findIndex(function (x) {
	      return x === marker;
	    });
	    markerStore.markers[idx].remove();
	    markerStore.markers.splice(idx, 1);
	  },
	  addMarker: function addMarker(marker) {
	    var remove = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : false;

	    markerStore.markers.push(marker);
	    if (remove) {
	      marker.on('click', function () {
	        markerStore.removeMarker(marker);
	      });
	    }
	  }
	};

	function createAndAddMarker(map, d, popupCreator, unclickable) {
	  var newmarker = L.marker([d.latlng.lat, d.latlng.lng], {
	    alt: 'marker',
	    icon: new L.icon({
	      iconUrl: getMarker().url,
	      iconSize: getMarker().iconSize,
	      iconAnchor: getMarker().iconAnchor
	    })
	  });
	  newmarker.addTo(map);
	  if (popupCreator) {
	    var div = popupCreator.call(markerStore, d, newmarker);
	    var popup = L.popup({ offset: [0, -50] }).setContent(div);
	    newmarker.bindPopup(popup).openPopup();
	    markerStore.addMarker(newmarker);
	  } else if (unclickable) {
	    markerStore.addMarker(newmarker);
	  } else {
	    markerStore.addMarker(newmarker, true);
	  }
	}
	//TODO: discuss the various function parameters
	function singleMarker(map, popupCreator, unclickable) {
	  mapPointerStyle(map);
	  return function (t, d, p, u) {
	    if (t === 1) {
	      if (markerStore.markers[0]) {
	        markerStore.removeMarker(markerStore.markers[0]);
	      }
	      createAndAddMarker(map, d, popupCreator, u);
	    }
	  };
	}

	function multiMarker(map, popupCreator, unclickable) {
	  mapPointerStyle(map);
	  return function (t, d) {
	    if (t === 1) {
	      createAndAddMarker(map, d, popupCreator, unclickable);
	    }
	  };
	}

	var nlmaps = {
	  leaflet: {
	    bgLayer: bgLayer,
	    overlayLayer: overlayLayer,
	    markerLayer: markerLayer,
	    geocoderControl: geocoderControl,
	    geoLocatorControl: geoLocatorControl
	  },
	  openlayers: {
	    bgLayer: bgLayer$1,
	    overlayLayer: overlayLayer$1,
	    markerLayer: markerLayer$1,
	    geocoderControl: geocoderControl$1,
	    geoLocatorControl: geoLocatorControl$1
	  },
	  googlemaps: {
	    bgLayer: bgLayer$2,
	    overlayLayer: overlayLayer$2,
	    markerLayer: markerLayer$2,
	    geoLocatorControl: geoLocatorControl$2,
	    geocoderControl: geocoderControl$2
	  }
	};

	//set nlmaps up as event bus
	emitonoff(nlmaps);

	//for future use
	var geoLocateDefaultOpts$1 = {};

	function testWhichLib() {
	  var defined = [];
	  if ((typeof L === 'undefined' ? 'undefined' : _typeof(L)) === 'object') {
	    defined.push('leaflet');
	  }
	  if ((typeof google === 'undefined' ? 'undefined' : _typeof(google)) === 'object' && _typeof(google.maps) === 'object') {
	    defined.push('googlemaps');
	  }
	  if ((typeof ol === 'undefined' ? 'undefined' : _typeof(ol)) === 'object') {
	    defined.push('openlayers');
	  }
	  if (defined.length > 1) {
	    return 'too many libs';
	  } else if (defined.length === 0) {
	    return 'too few libs';
	  } else {
	    return defined[0];
	  }
	}

	function initMap(lib, opts) {
	  var map = void 0,
	      rootdiv = void 0,
	      el = void 0,
	      options = void 0;
	  switch (lib) {
	    case 'leaflet':
	      //work-around to prevent mapdragging at text selection
	      rootdiv = document.getElementById(opts.target);
	      rootdiv.style.position = 'relative';
	      rootdiv.style.padding = '0px';
	      rootdiv.style.margin = '0px';
	      options = {};
	      if (!opts.attribution) {
	        options.attributionControl = false;
	      }
	      el = L.DomUtil.create('div');
	      el.style.height = '100%';
	      rootdiv.appendChild(el);
	      options.maxBounds = extentLeafletFormat();
	      map = L.map(el, options).setView([opts.center.latitude, opts.center.longitude], opts.zoom);
	      if (opts.attribution) {
	        map.attributionControl.setPrefix(false);
	      }
	      map.zoomControl.setPosition(CONFIG.MAP.zoomposition);
	      break;
	    case 'googlemaps':
	      map = new google.maps.Map(document.getElementById(opts.target), {
	        center: { lat: opts.center.latitude, lng: opts.center.longitude },
	        zoom: opts.zoom,
	        zoomControl: true,
	        zoomControlOptions: {
	          position: google.maps.ControlPosition.LEFT_BOTTOM
	        },
	        fullscreenControl: false
	      });

	      break;
	    case 'openlayers':
	      map = new ol.Map({
	        view: new ol.View({
	          center: ol.proj.fromLonLat([opts.center.longitude, opts.center.latitude]),
	          zoom: opts.zoom
	        }),
	        target: el
	      });
	      map.getTargetElement().getElementsByClassName('ol-zoom')[0].style.cssText = "left: 5px !important; bottom: 5px !important";
	      map.getTargetElement().getElementsByClassName('ol-zoom')[0].classList.remove('ol-zoom');
	      break;
	  }
	  return map;
	}

	function addGoogleLayer(layer, map) {
	  // Markers are not considered to be a layer in google maps. Therefore, they must be added differently.
	  // It is important that a layer has the title 'marker' in order to be recognized as a layer.
	  if (layer.title === 'marker') {
	    layer.setMap(map);
	    return;
	  }

	  var mapTypeIds = [layer.name, 'roadmap'];

	  if (layer.name === 'wms') {
	    map.setOptions({
	      mapTypeControl: true,
	      mapTypeControlOptions: {
	        mapTypeIds: mapTypeIds,
	        position: google.maps.ControlPosition.BOTTOM_LEFT
	      }
	    });
	    return;
	  }

	  map.setOptions({
	    mapTypeControl: true,
	    mapTypeControlOptions: {
	      mapTypeIds: mapTypeIds,
	      position: google.maps.ControlPosition.BOTTOM_LEFT
	    }
	  });

	  map.mapTypes.set(layer.name, layer);
	  map.setMapTypeId(layer.name);
	}

	function addLayerToMap(lib, layer, map) {
	  switch (lib) {
	    case 'leaflet':
	      map.addLayer(layer);
	      break;
	    case 'googlemaps':
	      addGoogleLayer(layer, map);
	      break;
	    case 'openlayers':
	      map.addLayer(layer);
	      break;
	  }
	}
	function createBackgroundLayer(lib, map, name) {
	  var bgLayer$$1 = void 0;
	  switch (lib) {
	    case 'leaflet':
	      bgLayer$$1 = nlmaps.leaflet.bgLayer(name);
	      break;
	    case 'googlemaps':
	      bgLayer$$1 = nlmaps.googlemaps.bgLayer(map, name);
	      break;
	    case 'openlayers':
	      bgLayer$$1 = nlmaps.openlayers.bgLayer(name);
	      break;
	  }
	  return bgLayer$$1;
	}

	function createOverlayLayer(lib, map, name) {
	  var overlayLayer$$1 = void 0;
	  switch (lib) {
	    case 'leaflet':
	      overlayLayer$$1 = nlmaps.leaflet.overlayLayer(name);
	      break;
	    case 'googlemaps':
	      overlayLayer$$1 = nlmaps.googlemaps.overlayLayer(map, name);
	      break;
	    case 'openlayers':
	      overlayLayer$$1 = nlmaps.openlayers.overlayLayer(name);
	      break;
	  }
	  return overlayLayer$$1;
	}

	function createMarkerLayer(lib, map, latLngObject) {
	  var markerLayer$$1 = void 0;
	  switch (lib) {
	    case 'leaflet':
	      markerLayer$$1 = nlmaps.leaflet.markerLayer(latLngObject);
	      break;
	    case 'googlemaps':
	      markerLayer$$1 = nlmaps.googlemaps.markerLayer(latLngObject);
	      break;
	    case 'openlayers':
	      markerLayer$$1 = nlmaps.openlayers.markerLayer(latLngObject);
	      break;
	  }
	  return markerLayer$$1;
	}

	function getMapCenter$3(lib, map) {
	  var mapCenter = void 0;
	  switch (lib) {
	    case 'leaflet':
	      mapCenter = getMapCenter(map);
	      break;
	    case 'googlemaps':
	      mapCenter = getMapCenter$2(map);
	      break;
	    case 'openlayers':
	      mapCenter = getMapCenter$1(map);
	      break;
	  }
	  return mapCenter;
	}

	function mergeOpts(defaultopts, useropts) {
	  return Object.assign({}, defaultopts, useropts);
	}

	nlmaps.lib = testWhichLib();

	nlmaps.createMap = function () {
	  var useropts = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

	  var opts = mergeOpts(CONFIG.MAP, useropts);
	  try {
	    if (nlmaps.lib == 'too many libs' || nlmaps.lib === 'too few libs') {
	      throw { message: 'one and only one map library can be defined. Please Refer to the documentation to see which map libraries are supported.' };
	    }
	  } catch (e) {
	    // eslint-disable-next-line no-console
	    console.error(e.message);
	  }
	  var map = initMap(nlmaps.lib, opts);
	  // Background layer
	  var backgroundLayer = createBackgroundLayer(nlmaps.lib, map, opts.style);
	  addLayerToMap(nlmaps.lib, backgroundLayer, map, opts.style);

	  // Geocoder
	  if (opts.search) {
	    addGeocoderControlToMap(nlmaps.lib, map);
	  }

	  // Marker layer
	  if (opts.marker) {
	    var markerLocation = opts.marker;
	    if (typeof opts.marker === "boolean") {
	      markerLocation = getMapCenter$3(nlmaps.lib, map);
	    }
	    var marker = createMarkerLayer(nlmaps.lib, map, markerLocation);

	    markerStore.addMarker(marker, true);
	    addLayerToMap(nlmaps.lib, marker, map);
	  }

	  // Overlay layer
	  if (opts.overlay && opts.overlay !== 'false') {
	    var overlayLayer$$1 = createOverlayLayer(nlmaps.lib, map, opts.overlay);
	    addLayerToMap(nlmaps.lib, overlayLayer$$1, map);
	  }
	  //add click event passing through L click event
	  if (map !== undefined) {
	    map.on('click', function (e) {
	      nlmaps.emit('mapclick', e);
	    });
	  }
	  return map;
	};

	function addGeoLocControlToMap(lib, geolocator, map) {
	  var control = void 0;
	  switch (lib) {
	    case 'leaflet':
	      nlmaps[lib].geoLocatorControl(geolocator).addTo(map);
	      break;
	    case 'googlemaps':
	      control = nlmaps[lib].geoLocatorControl(geolocator, map);
	      map.controls[google.maps.ControlPosition.TOP_RIGHT].push(control);
	      break;
	    case 'openlayers':
	      control = nlmaps[lib].geoLocatorControl(geolocator, map);
	      map.addControl(control);
	      break;
	  }
	}

	function addGeocoderControlToMap(lib, map) {
	  nlmaps[lib].geocoderControl(map, nlmaps);
	}

	nlmaps.geoLocate = function (map) {
	  var useropts = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

	  var opts = mergeOpts(geoLocateDefaultOpts$1, useropts);
	  var geolocator = geoLocator(opts);
	  addGeoLocControlToMap(nlmaps.lib, geolocator, map);
	};

	nlmaps.clickProvider = function (map) {
	  mapPointerStyle(map);
	  var clickSource = function clickSource(start, sink) {
	    if (start !== 0) return;
	    map.on('click', function (e) {
	      sink(1, e);
	    });
	    var talkback = function talkback(t, d) {};
	    sink(0, talkback);
	  };
	  clickSource.subscribe = function (callback) {
	    clickSource(0, callback);
	  };
	  return clickSource;
	};

	nlmaps.queryFeatures = queryFeatures;
	nlmaps.singleMarker = singleMarker;
	nlmaps.multiMarker = multiMarker;

	var leaflet_markerclusterSrc = createCommonjsModule(function (module, exports) {
		/*
	  * Leaflet.markercluster 1.5.3+master.e5124b2,
	  * Provides Beautiful Animated Marker Clustering functionality for Leaflet, a JS library for interactive maps.
	  * https://github.com/Leaflet/Leaflet.markercluster
	  * (c) 2012-2017, Dave Leaver, smartrak
	  */
		(function (global, factory) {
			factory(exports);
		})(commonjsGlobal, function (exports) {

			/*
	   * L.MarkerClusterGroup extends L.FeatureGroup by clustering the markers contained within
	   */

			var MarkerClusterGroup = L.MarkerClusterGroup = L.FeatureGroup.extend({

				options: {
					maxClusterRadius: 80, //A cluster will cover at most this many pixels from its center
					iconCreateFunction: null,
					clusterPane: L.Marker.prototype.options.pane,

					spiderfyOnEveryZoom: false,
					spiderfyOnMaxZoom: true,
					showCoverageOnHover: true,
					zoomToBoundsOnClick: true,
					singleMarkerMode: false,

					disableClusteringAtZoom: null,

					// Setting this to false prevents the removal of any clusters outside of the viewpoint, which
					// is the default behaviour for performance reasons.
					removeOutsideVisibleBounds: true,

					// Set to false to disable all animations (zoom and spiderfy).
					// If false, option animateAddingMarkers below has no effect.
					// If L.DomUtil.TRANSITION is falsy, this option has no effect.
					animate: true,

					//Whether to animate adding markers after adding the MarkerClusterGroup to the map
					// If you are adding individual markers set to true, if adding bulk markers leave false for massive performance gains.
					animateAddingMarkers: false,

					// Make it possible to provide custom function to calculate spiderfy shape positions
					spiderfyShapePositions: null,

					//Increase to increase the distance away that spiderfied markers appear from the center
					spiderfyDistanceMultiplier: 1,

					// Make it possible to specify a polyline options on a spider leg
					spiderLegPolylineOptions: { weight: 1.5, color: '#222', opacity: 0.5 },

					// When bulk adding layers, adds markers in chunks. Means addLayers may not add all the layers in the call, others will be loaded during setTimeouts
					chunkedLoading: false,
					chunkInterval: 200, // process markers for a maximum of ~ n milliseconds (then trigger the chunkProgress callback)
					chunkDelay: 50, // at the end of each interval, give n milliseconds back to system/browser
					chunkProgress: null, // progress callback: function(processed, total, elapsed) (e.g. for a progress indicator)

					//Options to pass to the L.Polygon constructor
					polygonOptions: {}
				},

				initialize: function initialize(options) {
					L.Util.setOptions(this, options);
					if (!this.options.iconCreateFunction) {
						this.options.iconCreateFunction = this._defaultIconCreateFunction;
					}

					this._featureGroup = L.featureGroup();
					this._featureGroup.addEventParent(this);

					this._nonPointGroup = L.featureGroup();
					this._nonPointGroup.addEventParent(this);

					this._inZoomAnimation = 0;
					this._needsClustering = [];
					this._needsRemoving = []; //Markers removed while we aren't on the map need to be kept track of
					//The bounds of the currently shown area (from _getExpandedVisibleBounds) Updated on zoom/move
					this._currentShownBounds = null;

					this._queue = [];

					this._childMarkerEventHandlers = {
						'dragstart': this._childMarkerDragStart,
						'move': this._childMarkerMoved,
						'dragend': this._childMarkerDragEnd
					};

					// Hook the appropriate animation methods.
					var animate = L.DomUtil.TRANSITION && this.options.animate;
					L.extend(this, animate ? this._withAnimation : this._noAnimation);
					// Remember which MarkerCluster class to instantiate (animated or not).
					this._markerCluster = animate ? L.MarkerCluster : L.MarkerClusterNonAnimated;
				},

				addLayer: function addLayer(layer) {

					if (layer instanceof L.LayerGroup) {
						return this.addLayers([layer]);
					}

					//Don't cluster non point data
					if (!layer.getLatLng) {
						this._nonPointGroup.addLayer(layer);
						this.fire('layeradd', { layer: layer });
						return this;
					}

					if (!this._map) {
						this._needsClustering.push(layer);
						this.fire('layeradd', { layer: layer });
						return this;
					}

					if (this.hasLayer(layer)) {
						return this;
					}

					//If we have already clustered we'll need to add this one to a cluster

					if (this._unspiderfy) {
						this._unspiderfy();
					}

					this._addLayer(layer, this._maxZoom);
					this.fire('layeradd', { layer: layer });

					// Refresh bounds and weighted positions.
					this._topClusterLevel._recalculateBounds();

					this._refreshClustersIcons();

					//Work out what is visible
					var visibleLayer = layer,
					    currentZoom = this._zoom;
					if (layer.__parent) {
						while (visibleLayer.__parent._zoom >= currentZoom) {
							visibleLayer = visibleLayer.__parent;
						}
					}

					if (this._currentShownBounds.contains(visibleLayer.getLatLng())) {
						if (this.options.animateAddingMarkers) {
							this._animationAddLayer(layer, visibleLayer);
						} else {
							this._animationAddLayerNonAnimated(layer, visibleLayer);
						}
					}
					return this;
				},

				removeLayer: function removeLayer(layer) {

					if (layer instanceof L.LayerGroup) {
						return this.removeLayers([layer]);
					}

					//Non point layers
					if (!layer.getLatLng) {
						this._nonPointGroup.removeLayer(layer);
						this.fire('layerremove', { layer: layer });
						return this;
					}

					if (!this._map) {
						if (!this._arraySplice(this._needsClustering, layer) && this.hasLayer(layer)) {
							this._needsRemoving.push({ layer: layer, latlng: layer._latlng });
						}
						this.fire('layerremove', { layer: layer });
						return this;
					}

					if (!layer.__parent) {
						return this;
					}

					if (this._unspiderfy) {
						this._unspiderfy();
						this._unspiderfyLayer(layer);
					}

					//Remove the marker from clusters
					this._removeLayer(layer, true);
					this.fire('layerremove', { layer: layer });

					// Refresh bounds and weighted positions.
					this._topClusterLevel._recalculateBounds();

					this._refreshClustersIcons();

					layer.off(this._childMarkerEventHandlers, this);

					if (this._featureGroup.hasLayer(layer)) {
						this._featureGroup.removeLayer(layer);
						if (layer.clusterShow) {
							layer.clusterShow();
						}
					}

					return this;
				},

				//Takes an array of markers and adds them in bulk
				addLayers: function addLayers(layersArray, skipLayerAddEvent) {
					if (!L.Util.isArray(layersArray)) {
						return this.addLayer(layersArray);
					}

					var fg = this._featureGroup,
					    npg = this._nonPointGroup,
					    chunked = this.options.chunkedLoading,
					    chunkInterval = this.options.chunkInterval,
					    chunkProgress = this.options.chunkProgress,
					    l = layersArray.length,
					    offset = 0,
					    originalArray = true,
					    m;

					if (this._map) {
						var started = new Date().getTime();
						var process = L.bind(function () {
							var start = new Date().getTime();

							// Make sure to unspiderfy before starting to add some layers
							if (this._map && this._unspiderfy) {
								this._unspiderfy();
							}

							for (; offset < l; offset++) {
								if (chunked && offset % 200 === 0) {
									// every couple hundred markers, instrument the time elapsed since processing started:
									var elapsed = new Date().getTime() - start;
									if (elapsed > chunkInterval) {
										break; // been working too hard, time to take a break :-)
									}
								}

								m = layersArray[offset];

								// Group of layers, append children to layersArray and skip.
								// Side effects:
								// - Total increases, so chunkProgress ratio jumps backward.
								// - Groups are not included in this group, only their non-group child layers (hasLayer).
								// Changing array length while looping does not affect performance in current browsers:
								// http://jsperf.com/for-loop-changing-length/6
								if (m instanceof L.LayerGroup) {
									if (originalArray) {
										layersArray = layersArray.slice();
										originalArray = false;
									}
									this._extractNonGroupLayers(m, layersArray);
									l = layersArray.length;
									continue;
								}

								//Not point data, can't be clustered
								if (!m.getLatLng) {
									npg.addLayer(m);
									if (!skipLayerAddEvent) {
										this.fire('layeradd', { layer: m });
									}
									continue;
								}

								if (this.hasLayer(m)) {
									continue;
								}

								this._addLayer(m, this._maxZoom);
								if (!skipLayerAddEvent) {
									this.fire('layeradd', { layer: m });
								}

								//If we just made a cluster of size 2 then we need to remove the other marker from the map (if it is) or we never will
								if (m.__parent) {
									if (m.__parent.getChildCount() === 2) {
										var markers = m.__parent.getAllChildMarkers(),
										    otherMarker = markers[0] === m ? markers[1] : markers[0];
										fg.removeLayer(otherMarker);
									}
								}
							}

							if (chunkProgress) {
								// report progress and time elapsed:
								chunkProgress(offset, l, new Date().getTime() - started);
							}

							// Completed processing all markers.
							if (offset === l) {

								// Refresh bounds and weighted positions.
								this._topClusterLevel._recalculateBounds();

								this._refreshClustersIcons();

								this._topClusterLevel._recursivelyAddChildrenToMap(null, this._zoom, this._currentShownBounds);
							} else {
								setTimeout(process, this.options.chunkDelay);
							}
						}, this);

						process();
					} else {
						var needsClustering = this._needsClustering;

						for (; offset < l; offset++) {
							m = layersArray[offset];

							// Group of layers, append children to layersArray and skip.
							if (m instanceof L.LayerGroup) {
								if (originalArray) {
									layersArray = layersArray.slice();
									originalArray = false;
								}
								this._extractNonGroupLayers(m, layersArray);
								l = layersArray.length;
								continue;
							}

							//Not point data, can't be clustered
							if (!m.getLatLng) {
								npg.addLayer(m);
								continue;
							}

							if (this.hasLayer(m)) {
								continue;
							}

							needsClustering.push(m);
						}
					}
					return this;
				},

				//Takes an array of markers and removes them in bulk
				removeLayers: function removeLayers(layersArray) {
					var i,
					    m,
					    l = layersArray.length,
					    fg = this._featureGroup,
					    npg = this._nonPointGroup,
					    originalArray = true;

					if (!this._map) {
						for (i = 0; i < l; i++) {
							m = layersArray[i];

							// Group of layers, append children to layersArray and skip.
							if (m instanceof L.LayerGroup) {
								if (originalArray) {
									layersArray = layersArray.slice();
									originalArray = false;
								}
								this._extractNonGroupLayers(m, layersArray);
								l = layersArray.length;
								continue;
							}

							this._arraySplice(this._needsClustering, m);
							npg.removeLayer(m);
							if (this.hasLayer(m)) {
								this._needsRemoving.push({ layer: m, latlng: m._latlng });
							}
							this.fire('layerremove', { layer: m });
						}
						return this;
					}

					if (this._unspiderfy) {
						this._unspiderfy();

						// Work on a copy of the array, so that next loop is not affected.
						var layersArray2 = layersArray.slice(),
						    l2 = l;
						for (i = 0; i < l2; i++) {
							m = layersArray2[i];

							// Group of layers, append children to layersArray and skip.
							if (m instanceof L.LayerGroup) {
								this._extractNonGroupLayers(m, layersArray2);
								l2 = layersArray2.length;
								continue;
							}

							this._unspiderfyLayer(m);
						}
					}

					for (i = 0; i < l; i++) {
						m = layersArray[i];

						// Group of layers, append children to layersArray and skip.
						if (m instanceof L.LayerGroup) {
							if (originalArray) {
								layersArray = layersArray.slice();
								originalArray = false;
							}
							this._extractNonGroupLayers(m, layersArray);
							l = layersArray.length;
							continue;
						}

						if (!m.__parent) {
							npg.removeLayer(m);
							this.fire('layerremove', { layer: m });
							continue;
						}

						this._removeLayer(m, true, true);
						this.fire('layerremove', { layer: m });

						if (fg.hasLayer(m)) {
							fg.removeLayer(m);
							if (m.clusterShow) {
								m.clusterShow();
							}
						}
					}

					// Refresh bounds and weighted positions.
					this._topClusterLevel._recalculateBounds();

					this._refreshClustersIcons();

					//Fix up the clusters and markers on the map
					this._topClusterLevel._recursivelyAddChildrenToMap(null, this._zoom, this._currentShownBounds);

					return this;
				},

				//Removes all layers from the MarkerClusterGroup
				clearLayers: function clearLayers() {
					//Need our own special implementation as the LayerGroup one doesn't work for us

					//If we aren't on the map (yet), blow away the markers we know of
					if (!this._map) {
						this._needsClustering = [];
						this._needsRemoving = [];
						delete this._gridClusters;
						delete this._gridUnclustered;
					}

					if (this._noanimationUnspiderfy) {
						this._noanimationUnspiderfy();
					}

					//Remove all the visible layers
					this._featureGroup.clearLayers();
					this._nonPointGroup.clearLayers();

					this.eachLayer(function (marker) {
						marker.off(this._childMarkerEventHandlers, this);
						delete marker.__parent;
					}, this);

					if (this._map) {
						//Reset _topClusterLevel and the DistanceGrids
						this._generateInitialClusters();
					}

					return this;
				},

				//Override FeatureGroup.getBounds as it doesn't work
				getBounds: function getBounds() {
					var bounds = new L.LatLngBounds();

					if (this._topClusterLevel) {
						bounds.extend(this._topClusterLevel._bounds);
					}

					for (var i = this._needsClustering.length - 1; i >= 0; i--) {
						bounds.extend(this._needsClustering[i].getLatLng());
					}

					bounds.extend(this._nonPointGroup.getBounds());

					return bounds;
				},

				//Overrides LayerGroup.eachLayer
				eachLayer: function eachLayer(method, context) {
					var markers = this._needsClustering.slice(),
					    needsRemoving = this._needsRemoving,
					    thisNeedsRemoving,
					    i,
					    j;

					if (this._topClusterLevel) {
						this._topClusterLevel.getAllChildMarkers(markers);
					}

					for (i = markers.length - 1; i >= 0; i--) {
						thisNeedsRemoving = true;

						for (j = needsRemoving.length - 1; j >= 0; j--) {
							if (needsRemoving[j].layer === markers[i]) {
								thisNeedsRemoving = false;
								break;
							}
						}

						if (thisNeedsRemoving) {
							method.call(context, markers[i]);
						}
					}

					this._nonPointGroup.eachLayer(method, context);
				},

				//Overrides LayerGroup.getLayers
				getLayers: function getLayers() {
					var layers = [];
					this.eachLayer(function (l) {
						layers.push(l);
					});
					return layers;
				},

				//Overrides LayerGroup.getLayer, WARNING: Really bad performance
				getLayer: function getLayer(id) {
					var result = null;

					id = parseInt(id, 10);

					this.eachLayer(function (l) {
						if (L.stamp(l) === id) {
							result = l;
						}
					});

					return result;
				},

				//Returns true if the given layer is in this MarkerClusterGroup
				hasLayer: function hasLayer(layer) {
					if (!layer) {
						return false;
					}

					var i,
					    anArray = this._needsClustering;

					for (i = anArray.length - 1; i >= 0; i--) {
						if (anArray[i] === layer) {
							return true;
						}
					}

					anArray = this._needsRemoving;
					for (i = anArray.length - 1; i >= 0; i--) {
						if (anArray[i].layer === layer) {
							return false;
						}
					}

					return !!(layer.__parent && layer.__parent._group === this) || this._nonPointGroup.hasLayer(layer);
				},

				//Zoom down to show the given layer (spiderfying if necessary) then calls the callback
				zoomToShowLayer: function zoomToShowLayer(layer, callback) {

					var map = this._map;

					if (typeof callback !== 'function') {
						callback = function callback() {};
					}

					var showMarker = function showMarker() {
						// Assumes that map.hasLayer checks for direct appearance on map, not recursively calling
						// hasLayer on Layer Groups that are on map (typically not calling this MarkerClusterGroup.hasLayer, which would always return true)
						if ((map.hasLayer(layer) || map.hasLayer(layer.__parent)) && !this._inZoomAnimation) {
							this._map.off('moveend', showMarker, this);
							this.off('animationend', showMarker, this);

							if (map.hasLayer(layer)) {
								callback();
							} else if (layer.__parent._icon) {
								this.once('spiderfied', callback, this);
								layer.__parent.spiderfy();
							}
						}
					};

					if (layer._icon && this._map.getBounds().contains(layer.getLatLng())) {
						//Layer is visible ond on screen, immediate return
						callback();
					} else if (layer.__parent._zoom < Math.round(this._map._zoom)) {
						//Layer should be visible at this zoom level. It must not be on screen so just pan over to it
						this._map.on('moveend', showMarker, this);
						this._map.panTo(layer.getLatLng());
					} else {
						this._map.on('moveend', showMarker, this);
						this.on('animationend', showMarker, this);
						layer.__parent.zoomToBounds();
					}
				},

				//Overrides FeatureGroup.onAdd
				onAdd: function onAdd(map) {
					this._map = map;
					var i, l, layer;

					if (!isFinite(this._map.getMaxZoom())) {
						throw "Map has no maxZoom specified";
					}

					this._featureGroup.addTo(map);
					this._nonPointGroup.addTo(map);

					if (!this._gridClusters) {
						this._generateInitialClusters();
					}

					this._maxLat = map.options.crs.projection.MAX_LATITUDE;

					//Restore all the positions as they are in the MCG before removing them
					for (i = 0, l = this._needsRemoving.length; i < l; i++) {
						layer = this._needsRemoving[i];
						layer.newlatlng = layer.layer._latlng;
						layer.layer._latlng = layer.latlng;
					}
					//Remove them, then restore their new positions
					for (i = 0, l = this._needsRemoving.length; i < l; i++) {
						layer = this._needsRemoving[i];
						this._removeLayer(layer.layer, true);
						layer.layer._latlng = layer.newlatlng;
					}
					this._needsRemoving = [];

					//Remember the current zoom level and bounds
					this._zoom = Math.round(this._map._zoom);
					this._currentShownBounds = this._getExpandedVisibleBounds();

					this._map.on('zoomend', this._zoomEnd, this);
					this._map.on('moveend', this._moveEnd, this);

					if (this._spiderfierOnAdd) {
						//TODO FIXME: Not sure how to have spiderfier add something on here nicely
						this._spiderfierOnAdd();
					}

					this._bindEvents();

					//Actually add our markers to the map:
					l = this._needsClustering;
					this._needsClustering = [];
					this.addLayers(l, true);
				},

				//Overrides FeatureGroup.onRemove
				onRemove: function onRemove(map) {
					map.off('zoomend', this._zoomEnd, this);
					map.off('moveend', this._moveEnd, this);

					this._unbindEvents();

					//In case we are in a cluster animation
					this._map._mapPane.className = this._map._mapPane.className.replace(' leaflet-cluster-anim', '');

					if (this._spiderfierOnRemove) {
						//TODO FIXME: Not sure how to have spiderfier add something on here nicely
						this._spiderfierOnRemove();
					}

					delete this._maxLat;

					//Clean up all the layers we added to the map
					this._hideCoverage();
					this._featureGroup.remove();
					this._nonPointGroup.remove();

					this._featureGroup.clearLayers();

					this._map = null;
				},

				getVisibleParent: function getVisibleParent(marker) {
					var vMarker = marker;
					while (vMarker && !vMarker._icon) {
						vMarker = vMarker.__parent;
					}
					return vMarker || null;
				},

				//Remove the given object from the given array
				_arraySplice: function _arraySplice(anArray, obj) {
					for (var i = anArray.length - 1; i >= 0; i--) {
						if (anArray[i] === obj) {
							anArray.splice(i, 1);
							return true;
						}
					}
				},

				/**
	    * Removes a marker from all _gridUnclustered zoom levels, starting at the supplied zoom.
	    * @param marker to be removed from _gridUnclustered.
	    * @param z integer bottom start zoom level (included)
	    * @private
	    */
				_removeFromGridUnclustered: function _removeFromGridUnclustered(marker, z) {
					var map = this._map,
					    gridUnclustered = this._gridUnclustered,
					    minZoom = Math.floor(this._map.getMinZoom());

					for (; z >= minZoom; z--) {
						if (!gridUnclustered[z].removeObject(marker, map.project(marker.getLatLng(), z))) {
							break;
						}
					}
				},

				_childMarkerDragStart: function _childMarkerDragStart(e) {
					e.target.__dragStart = e.target._latlng;
				},

				_childMarkerMoved: function _childMarkerMoved(e) {
					if (!this._ignoreMove && !e.target.__dragStart) {
						var isPopupOpen = e.target._popup && e.target._popup.isOpen();

						this._moveChild(e.target, e.oldLatLng, e.latlng);

						if (isPopupOpen) {
							e.target.openPopup();
						}
					}
				},

				_moveChild: function _moveChild(layer, from, to) {
					layer._latlng = from;
					this.removeLayer(layer);

					layer._latlng = to;
					this.addLayer(layer);
				},

				_childMarkerDragEnd: function _childMarkerDragEnd(e) {
					var dragStart = e.target.__dragStart;
					delete e.target.__dragStart;
					if (dragStart) {
						this._moveChild(e.target, dragStart, e.target._latlng);
					}
				},

				//Internal function for removing a marker from everything.
				//dontUpdateMap: set to true if you will handle updating the map manually (for bulk functions)
				_removeLayer: function _removeLayer(marker, removeFromDistanceGrid, dontUpdateMap) {
					var gridClusters = this._gridClusters,
					    gridUnclustered = this._gridUnclustered,
					    fg = this._featureGroup,
					    map = this._map,
					    minZoom = Math.floor(this._map.getMinZoom());

					//Remove the marker from distance clusters it might be in
					if (removeFromDistanceGrid) {
						this._removeFromGridUnclustered(marker, this._maxZoom);
					}

					//Work our way up the clusters removing them as we go if required
					var cluster = marker.__parent,
					    markers = cluster._markers,
					    otherMarker;

					//Remove the marker from the immediate parents marker list
					this._arraySplice(markers, marker);

					while (cluster) {
						cluster._childCount--;
						cluster._boundsNeedUpdate = true;

						if (cluster._zoom < minZoom) {
							//Top level, do nothing
							break;
						} else if (removeFromDistanceGrid && cluster._childCount <= 1) {
							//Cluster no longer required
							//We need to push the other marker up to the parent
							otherMarker = cluster._markers[0] === marker ? cluster._markers[1] : cluster._markers[0];

							//Update distance grid
							gridClusters[cluster._zoom].removeObject(cluster, map.project(cluster._cLatLng, cluster._zoom));
							gridUnclustered[cluster._zoom].addObject(otherMarker, map.project(otherMarker.getLatLng(), cluster._zoom));

							//Move otherMarker up to parent
							this._arraySplice(cluster.__parent._childClusters, cluster);
							cluster.__parent._markers.push(otherMarker);
							otherMarker.__parent = cluster.__parent;

							if (cluster._icon) {
								//Cluster is currently on the map, need to put the marker on the map instead
								fg.removeLayer(cluster);
								if (!dontUpdateMap) {
									fg.addLayer(otherMarker);
								}
							}
						} else {
							cluster._iconNeedsUpdate = true;
						}

						cluster = cluster.__parent;
					}

					delete marker.__parent;
				},

				_isOrIsParent: function _isOrIsParent(el, oel) {
					while (oel) {
						if (el === oel) {
							return true;
						}
						oel = oel.parentNode;
					}
					return false;
				},

				//Override L.Evented.fire
				fire: function fire(type, data, propagate) {
					if (data && data.layer instanceof L.MarkerCluster) {
						//Prevent multiple clustermouseover/off events if the icon is made up of stacked divs (Doesn't work in ie <= 8, no relatedTarget)
						if (data.originalEvent && this._isOrIsParent(data.layer._icon, data.originalEvent.relatedTarget)) {
							return;
						}
						type = 'cluster' + type;
					}

					L.FeatureGroup.prototype.fire.call(this, type, data, propagate);
				},

				//Override L.Evented.listens
				listens: function listens(type, propagate) {
					return L.FeatureGroup.prototype.listens.call(this, type, propagate) || L.FeatureGroup.prototype.listens.call(this, 'cluster' + type, propagate);
				},

				//Default functionality
				_defaultIconCreateFunction: function _defaultIconCreateFunction(cluster) {
					var childCount = cluster.getChildCount();

					var c = ' marker-cluster-';
					if (childCount < 10) {
						c += 'small';
					} else if (childCount < 100) {
						c += 'medium';
					} else {
						c += 'large';
					}

					return new L.DivIcon({ html: '<div><span>' + childCount + '</span></div>', className: 'marker-cluster' + c, iconSize: new L.Point(40, 40) });
				},

				_bindEvents: function _bindEvents() {
					var map = this._map,
					    spiderfyOnMaxZoom = this.options.spiderfyOnMaxZoom,
					    showCoverageOnHover = this.options.showCoverageOnHover,
					    zoomToBoundsOnClick = this.options.zoomToBoundsOnClick,
					    spiderfyOnEveryZoom = this.options.spiderfyOnEveryZoom;

					//Zoom on cluster click or spiderfy if we are at the lowest level
					if (spiderfyOnMaxZoom || zoomToBoundsOnClick || spiderfyOnEveryZoom) {
						this.on('clusterclick clusterkeypress', this._zoomOrSpiderfy, this);
					}

					//Show convex hull (boundary) polygon on mouse over
					if (showCoverageOnHover) {
						this.on('clustermouseover', this._showCoverage, this);
						this.on('clustermouseout', this._hideCoverage, this);
						map.on('zoomend', this._hideCoverage, this);
					}
				},

				_zoomOrSpiderfy: function _zoomOrSpiderfy(e) {
					var cluster = e.layer,
					    bottomCluster = cluster;

					if (e.type === 'clusterkeypress' && e.originalEvent && e.originalEvent.keyCode !== 13) {
						return;
					}

					while (bottomCluster._childClusters.length === 1) {
						bottomCluster = bottomCluster._childClusters[0];
					}

					if (bottomCluster._zoom === this._maxZoom && bottomCluster._childCount === cluster._childCount && this.options.spiderfyOnMaxZoom) {

						// All child markers are contained in a single cluster from this._maxZoom to this cluster.
						cluster.spiderfy();
					} else if (this.options.zoomToBoundsOnClick) {
						cluster.zoomToBounds();
					}

					if (this.options.spiderfyOnEveryZoom) {
						cluster.spiderfy();
					}

					// Focus the map again for keyboard users.
					if (e.originalEvent && e.originalEvent.keyCode === 13) {
						this._map._container.focus();
					}
				},

				_showCoverage: function _showCoverage(e) {
					var map = this._map;
					if (this._inZoomAnimation) {
						return;
					}
					if (this._shownPolygon) {
						map.removeLayer(this._shownPolygon);
					}
					if (e.layer.getChildCount() > 2 && e.layer !== this._spiderfied) {
						this._shownPolygon = new L.Polygon(e.layer.getConvexHull(), this.options.polygonOptions);
						map.addLayer(this._shownPolygon);
					}
				},

				_hideCoverage: function _hideCoverage() {
					if (this._shownPolygon) {
						this._map.removeLayer(this._shownPolygon);
						this._shownPolygon = null;
					}
				},

				_unbindEvents: function _unbindEvents() {
					var spiderfyOnMaxZoom = this.options.spiderfyOnMaxZoom,
					    showCoverageOnHover = this.options.showCoverageOnHover,
					    zoomToBoundsOnClick = this.options.zoomToBoundsOnClick,
					    spiderfyOnEveryZoom = this.options.spiderfyOnEveryZoom,
					    map = this._map;

					if (spiderfyOnMaxZoom || zoomToBoundsOnClick || spiderfyOnEveryZoom) {
						this.off('clusterclick clusterkeypress', this._zoomOrSpiderfy, this);
					}
					if (showCoverageOnHover) {
						this.off('clustermouseover', this._showCoverage, this);
						this.off('clustermouseout', this._hideCoverage, this);
						map.off('zoomend', this._hideCoverage, this);
					}
				},

				_zoomEnd: function _zoomEnd() {
					if (!this._map) {
						//May have been removed from the map by a zoomEnd handler
						return;
					}
					this._mergeSplitClusters();

					this._zoom = Math.round(this._map._zoom);
					this._currentShownBounds = this._getExpandedVisibleBounds();
				},

				_moveEnd: function _moveEnd() {
					if (this._inZoomAnimation) {
						return;
					}

					var newBounds = this._getExpandedVisibleBounds();

					this._topClusterLevel._recursivelyRemoveChildrenFromMap(this._currentShownBounds, Math.floor(this._map.getMinZoom()), this._zoom, newBounds);
					this._topClusterLevel._recursivelyAddChildrenToMap(null, Math.round(this._map._zoom), newBounds);

					this._currentShownBounds = newBounds;
					return;
				},

				_generateInitialClusters: function _generateInitialClusters() {
					var maxZoom = Math.ceil(this._map.getMaxZoom()),
					    minZoom = Math.floor(this._map.getMinZoom()),
					    radius = this.options.maxClusterRadius,
					    radiusFn = radius;

					//If we just set maxClusterRadius to a single number, we need to create
					//a simple function to return that number. Otherwise, we just have to
					//use the function we've passed in.
					if (typeof radius !== "function") {
						radiusFn = function radiusFn() {
							return radius;
						};
					}

					if (this.options.disableClusteringAtZoom !== null) {
						maxZoom = this.options.disableClusteringAtZoom - 1;
					}
					this._maxZoom = maxZoom;
					this._gridClusters = {};
					this._gridUnclustered = {};

					//Set up DistanceGrids for each zoom
					for (var zoom = maxZoom; zoom >= minZoom; zoom--) {
						this._gridClusters[zoom] = new L.DistanceGrid(radiusFn(zoom));
						this._gridUnclustered[zoom] = new L.DistanceGrid(radiusFn(zoom));
					}

					// Instantiate the appropriate L.MarkerCluster class (animated or not).
					this._topClusterLevel = new this._markerCluster(this, minZoom - 1);
				},

				//Zoom: Zoom to start adding at (Pass this._maxZoom to start at the bottom)
				_addLayer: function _addLayer(layer, zoom) {
					var gridClusters = this._gridClusters,
					    gridUnclustered = this._gridUnclustered,
					    minZoom = Math.floor(this._map.getMinZoom()),
					    markerPoint,
					    z;

					if (this.options.singleMarkerMode) {
						this._overrideMarkerIcon(layer);
					}

					layer.on(this._childMarkerEventHandlers, this);

					//Find the lowest zoom level to slot this one in
					for (; zoom >= minZoom; zoom--) {
						markerPoint = this._map.project(layer.getLatLng(), zoom); // calculate pixel position

						//Try find a cluster close by
						var closest = gridClusters[zoom].getNearObject(markerPoint);
						if (closest) {
							closest._addChild(layer);
							layer.__parent = closest;
							return;
						}

						//Try find a marker close by to form a new cluster with
						closest = gridUnclustered[zoom].getNearObject(markerPoint);
						if (closest) {
							var parent = closest.__parent;
							if (parent) {
								this._removeLayer(closest, false);
							}

							//Create new cluster with these 2 in it

							var newCluster = new this._markerCluster(this, zoom, closest, layer);
							gridClusters[zoom].addObject(newCluster, this._map.project(newCluster._cLatLng, zoom));
							closest.__parent = newCluster;
							layer.__parent = newCluster;

							//First create any new intermediate parent clusters that don't exist
							var lastParent = newCluster;
							for (z = zoom - 1; z > parent._zoom; z--) {
								lastParent = new this._markerCluster(this, z, lastParent);
								gridClusters[z].addObject(lastParent, this._map.project(closest.getLatLng(), z));
							}
							parent._addChild(lastParent);

							//Remove closest from this zoom level and any above that it is in, replace with newCluster
							this._removeFromGridUnclustered(closest, zoom);

							return;
						}

						//Didn't manage to cluster in at this zoom, record us as a marker here and continue upwards
						gridUnclustered[zoom].addObject(layer, markerPoint);
					}

					//Didn't get in anything, add us to the top
					this._topClusterLevel._addChild(layer);
					layer.__parent = this._topClusterLevel;
					return;
				},

				/**
	    * Refreshes the icon of all "dirty" visible clusters.
	    * Non-visible "dirty" clusters will be updated when they are added to the map.
	    * @private
	    */
				_refreshClustersIcons: function _refreshClustersIcons() {
					this._featureGroup.eachLayer(function (c) {
						if (c instanceof L.MarkerCluster && c._iconNeedsUpdate) {
							c._updateIcon();
						}
					});
				},

				//Enqueue code to fire after the marker expand/contract has happened
				_enqueue: function _enqueue(fn) {
					this._queue.push(fn);
					if (!this._queueTimeout) {
						this._queueTimeout = setTimeout(L.bind(this._processQueue, this), 300);
					}
				},
				_processQueue: function _processQueue() {
					for (var i = 0; i < this._queue.length; i++) {
						this._queue[i].call(this);
					}
					this._queue.length = 0;
					clearTimeout(this._queueTimeout);
					this._queueTimeout = null;
				},

				//Merge and split any existing clusters that are too big or small
				_mergeSplitClusters: function _mergeSplitClusters() {
					var mapZoom = Math.round(this._map._zoom);

					//In case we are starting to split before the animation finished
					this._processQueue();

					if (this._zoom < mapZoom && this._currentShownBounds.intersects(this._getExpandedVisibleBounds())) {
						//Zoom in, split
						this._animationStart();
						//Remove clusters now off screen
						this._topClusterLevel._recursivelyRemoveChildrenFromMap(this._currentShownBounds, Math.floor(this._map.getMinZoom()), this._zoom, this._getExpandedVisibleBounds());

						this._animationZoomIn(this._zoom, mapZoom);
					} else if (this._zoom > mapZoom) {
						//Zoom out, merge
						this._animationStart();

						this._animationZoomOut(this._zoom, mapZoom);
					} else {
						this._moveEnd();
					}
				},

				//Gets the maps visible bounds expanded in each direction by the size of the screen (so the user cannot see an area we do not cover in one pan)
				_getExpandedVisibleBounds: function _getExpandedVisibleBounds() {
					if (!this.options.removeOutsideVisibleBounds) {
						return this._mapBoundsInfinite;
					} else if (L.Browser.mobile) {
						return this._checkBoundsMaxLat(this._map.getBounds());
					}

					return this._checkBoundsMaxLat(this._map.getBounds().pad(1)); // Padding expands the bounds by its own dimensions but scaled with the given factor.
				},

				/**
	    * Expands the latitude to Infinity (or -Infinity) if the input bounds reach the map projection maximum defined latitude
	    * (in the case of Web/Spherical Mercator, it is 85.0511287798 / see https://en.wikipedia.org/wiki/Web_Mercator#Formulas).
	    * Otherwise, the removeOutsideVisibleBounds option will remove markers beyond that limit, whereas the same markers without
	    * this option (or outside MCG) will have their position floored (ceiled) by the projection and rendered at that limit,
	    * making the user think that MCG "eats" them and never displays them again.
	    * @param bounds L.LatLngBounds
	    * @returns {L.LatLngBounds}
	    * @private
	    */
				_checkBoundsMaxLat: function _checkBoundsMaxLat(bounds) {
					var maxLat = this._maxLat;

					if (maxLat !== undefined) {
						if (bounds.getNorth() >= maxLat) {
							bounds._northEast.lat = Infinity;
						}
						if (bounds.getSouth() <= -maxLat) {
							bounds._southWest.lat = -Infinity;
						}
					}

					return bounds;
				},

				//Shared animation code
				_animationAddLayerNonAnimated: function _animationAddLayerNonAnimated(layer, newCluster) {
					if (newCluster === layer) {
						this._featureGroup.addLayer(layer);
					} else if (newCluster._childCount === 2) {
						newCluster._addToMap();

						var markers = newCluster.getAllChildMarkers();
						this._featureGroup.removeLayer(markers[0]);
						this._featureGroup.removeLayer(markers[1]);
					} else {
						newCluster._updateIcon();
					}
				},

				/**
	    * Extracts individual (i.e. non-group) layers from a Layer Group.
	    * @param group to extract layers from.
	    * @param output {Array} in which to store the extracted layers.
	    * @returns {*|Array}
	    * @private
	    */
				_extractNonGroupLayers: function _extractNonGroupLayers(group, output) {
					var layers = group.getLayers(),
					    i = 0,
					    layer;

					output = output || [];

					for (; i < layers.length; i++) {
						layer = layers[i];

						if (layer instanceof L.LayerGroup) {
							this._extractNonGroupLayers(layer, output);
							continue;
						}

						output.push(layer);
					}

					return output;
				},

				/**
	    * Implements the singleMarkerMode option.
	    * @param layer Marker to re-style using the Clusters iconCreateFunction.
	    * @returns {L.Icon} The newly created icon.
	    * @private
	    */
				_overrideMarkerIcon: function _overrideMarkerIcon(layer) {
					var icon = layer.options.icon = this.options.iconCreateFunction({
						getChildCount: function getChildCount() {
							return 1;
						},
						getAllChildMarkers: function getAllChildMarkers() {
							return [layer];
						}
					});

					return icon;
				}
			});

			// Constant bounds used in case option "removeOutsideVisibleBounds" is set to false.
			L.MarkerClusterGroup.include({
				_mapBoundsInfinite: new L.LatLngBounds(new L.LatLng(-Infinity, -Infinity), new L.LatLng(Infinity, Infinity))
			});

			L.MarkerClusterGroup.include({
				_noAnimation: {
					//Non Animated versions of everything
					_animationStart: function _animationStart() {
						//Do nothing...
					},
					_animationZoomIn: function _animationZoomIn(previousZoomLevel, newZoomLevel) {
						this._topClusterLevel._recursivelyRemoveChildrenFromMap(this._currentShownBounds, Math.floor(this._map.getMinZoom()), previousZoomLevel);
						this._topClusterLevel._recursivelyAddChildrenToMap(null, newZoomLevel, this._getExpandedVisibleBounds());

						//We didn't actually animate, but we use this event to mean "clustering animations have finished"
						this.fire('animationend');
					},
					_animationZoomOut: function _animationZoomOut(previousZoomLevel, newZoomLevel) {
						this._topClusterLevel._recursivelyRemoveChildrenFromMap(this._currentShownBounds, Math.floor(this._map.getMinZoom()), previousZoomLevel);
						this._topClusterLevel._recursivelyAddChildrenToMap(null, newZoomLevel, this._getExpandedVisibleBounds());

						//We didn't actually animate, but we use this event to mean "clustering animations have finished"
						this.fire('animationend');
					},
					_animationAddLayer: function _animationAddLayer(layer, newCluster) {
						this._animationAddLayerNonAnimated(layer, newCluster);
					}
				},

				_withAnimation: {
					//Animated versions here
					_animationStart: function _animationStart() {
						this._map._mapPane.className += ' leaflet-cluster-anim';
						this._inZoomAnimation++;
					},

					_animationZoomIn: function _animationZoomIn(previousZoomLevel, newZoomLevel) {
						var bounds = this._getExpandedVisibleBounds(),
						    fg = this._featureGroup,
						    minZoom = Math.floor(this._map.getMinZoom()),
						    i;

						this._ignoreMove = true;

						//Add all children of current clusters to map and remove those clusters from map
						this._topClusterLevel._recursively(bounds, previousZoomLevel, minZoom, function (c) {
							var startPos = c._latlng,
							    markers = c._markers,
							    m;

							if (!bounds.contains(startPos)) {
								startPos = null;
							}

							if (c._isSingleParent() && previousZoomLevel + 1 === newZoomLevel) {
								//Immediately add the new child and remove us
								fg.removeLayer(c);
								c._recursivelyAddChildrenToMap(null, newZoomLevel, bounds);
							} else {
								//Fade out old cluster
								c.clusterHide();
								c._recursivelyAddChildrenToMap(startPos, newZoomLevel, bounds);
							}

							//Remove all markers that aren't visible any more
							//TODO: Do we actually need to do this on the higher levels too?
							for (i = markers.length - 1; i >= 0; i--) {
								m = markers[i];
								if (!bounds.contains(m._latlng)) {
									fg.removeLayer(m);
								}
							}
						});

						this._forceLayout();

						//Update opacities
						this._topClusterLevel._recursivelyBecomeVisible(bounds, newZoomLevel);
						//TODO Maybe? Update markers in _recursivelyBecomeVisible
						fg.eachLayer(function (n) {
							if (!(n instanceof L.MarkerCluster) && n._icon) {
								n.clusterShow();
							}
						});

						//update the positions of the just added clusters/markers
						this._topClusterLevel._recursively(bounds, previousZoomLevel, newZoomLevel, function (c) {
							c._recursivelyRestoreChildPositions(newZoomLevel);
						});

						this._ignoreMove = false;

						//Remove the old clusters and close the zoom animation
						this._enqueue(function () {
							//update the positions of the just added clusters/markers
							this._topClusterLevel._recursively(bounds, previousZoomLevel, minZoom, function (c) {
								fg.removeLayer(c);
								c.clusterShow();
							});

							this._animationEnd();
						});
					},

					_animationZoomOut: function _animationZoomOut(previousZoomLevel, newZoomLevel) {
						this._animationZoomOutSingle(this._topClusterLevel, previousZoomLevel - 1, newZoomLevel);

						//Need to add markers for those that weren't on the map before but are now
						this._topClusterLevel._recursivelyAddChildrenToMap(null, newZoomLevel, this._getExpandedVisibleBounds());
						//Remove markers that were on the map before but won't be now
						this._topClusterLevel._recursivelyRemoveChildrenFromMap(this._currentShownBounds, Math.floor(this._map.getMinZoom()), previousZoomLevel, this._getExpandedVisibleBounds());
					},

					_animationAddLayer: function _animationAddLayer(layer, newCluster) {
						var me = this,
						    fg = this._featureGroup;

						fg.addLayer(layer);
						if (newCluster !== layer) {
							if (newCluster._childCount > 2) {
								//Was already a cluster

								newCluster._updateIcon();
								this._forceLayout();
								this._animationStart();

								layer._setPos(this._map.latLngToLayerPoint(newCluster.getLatLng()));
								layer.clusterHide();

								this._enqueue(function () {
									fg.removeLayer(layer);
									layer.clusterShow();

									me._animationEnd();
								});
							} else {
								//Just became a cluster
								this._forceLayout();

								me._animationStart();
								me._animationZoomOutSingle(newCluster, this._map.getMaxZoom(), this._zoom);
							}
						}
					}
				},

				// Private methods for animated versions.
				_animationZoomOutSingle: function _animationZoomOutSingle(cluster, previousZoomLevel, newZoomLevel) {
					var bounds = this._getExpandedVisibleBounds(),
					    minZoom = Math.floor(this._map.getMinZoom());

					//Animate all of the markers in the clusters to move to their cluster center point
					cluster._recursivelyAnimateChildrenInAndAddSelfToMap(bounds, minZoom, previousZoomLevel + 1, newZoomLevel);

					var me = this;

					//Update the opacity (If we immediately set it they won't animate)
					this._forceLayout();
					cluster._recursivelyBecomeVisible(bounds, newZoomLevel);

					//TODO: Maybe use the transition timing stuff to make this more reliable
					//When the animations are done, tidy up
					this._enqueue(function () {

						//This cluster stopped being a cluster before the timeout fired
						if (cluster._childCount === 1) {
							var m = cluster._markers[0];
							//If we were in a cluster animation at the time then the opacity and position of our child could be wrong now, so fix it
							this._ignoreMove = true;
							m.setLatLng(m.getLatLng());
							this._ignoreMove = false;
							if (m.clusterShow) {
								m.clusterShow();
							}
						} else {
							cluster._recursively(bounds, newZoomLevel, minZoom, function (c) {
								c._recursivelyRemoveChildrenFromMap(bounds, minZoom, previousZoomLevel + 1);
							});
						}
						me._animationEnd();
					});
				},

				_animationEnd: function _animationEnd() {
					if (this._map) {
						this._map._mapPane.className = this._map._mapPane.className.replace(' leaflet-cluster-anim', '');
					}
					this._inZoomAnimation--;
					this.fire('animationend');
				},

				//Force a browser layout of stuff in the map
				// Should apply the current opacity and location to all elements so we can update them again for an animation
				_forceLayout: function _forceLayout() {
					//In my testing this works, infact offsetWidth of any element seems to work.
					//Could loop all this._layers and do this for each _icon if it stops working

					L.Util.falseFn(document.body.offsetWidth);
				}
			});

			L.markerClusterGroup = function (options) {
				return new L.MarkerClusterGroup(options);
			};

			var MarkerCluster = L.MarkerCluster = L.Marker.extend({
				options: L.Icon.prototype.options,

				initialize: function initialize(group, zoom, a, b) {

					L.Marker.prototype.initialize.call(this, a ? a._cLatLng || a.getLatLng() : new L.LatLng(0, 0), { icon: this, pane: group.options.clusterPane });

					this._group = group;
					this._zoom = zoom;

					this._markers = [];
					this._childClusters = [];
					this._childCount = 0;
					this._iconNeedsUpdate = true;
					this._boundsNeedUpdate = true;

					this._bounds = new L.LatLngBounds();

					if (a) {
						this._addChild(a);
					}
					if (b) {
						this._addChild(b);
					}
				},

				//Recursively retrieve all child markers of this cluster
				getAllChildMarkers: function getAllChildMarkers(storageArray, ignoreDraggedMarker) {
					storageArray = storageArray || [];

					for (var i = this._childClusters.length - 1; i >= 0; i--) {
						this._childClusters[i].getAllChildMarkers(storageArray, ignoreDraggedMarker);
					}

					for (var j = this._markers.length - 1; j >= 0; j--) {
						if (ignoreDraggedMarker && this._markers[j].__dragStart) {
							continue;
						}
						storageArray.push(this._markers[j]);
					}

					return storageArray;
				},

				//Returns the count of how many child markers we have
				getChildCount: function getChildCount() {
					return this._childCount;
				},

				//Zoom to the minimum of showing all of the child markers, or the extents of this cluster
				zoomToBounds: function zoomToBounds(fitBoundsOptions) {
					var childClusters = this._childClusters.slice(),
					    map = this._group._map,
					    boundsZoom = map.getBoundsZoom(this._bounds),
					    zoom = this._zoom + 1,
					    mapZoom = map.getZoom(),
					    i;

					//calculate how far we need to zoom down to see all of the markers
					while (childClusters.length > 0 && boundsZoom > zoom) {
						zoom++;
						var newClusters = [];
						for (i = 0; i < childClusters.length; i++) {
							newClusters = newClusters.concat(childClusters[i]._childClusters);
						}
						childClusters = newClusters;
					}

					if (boundsZoom > zoom) {
						this._group._map.setView(this._latlng, zoom);
					} else if (boundsZoom <= mapZoom) {
						//If fitBounds wouldn't zoom us down, zoom us down instead
						this._group._map.setView(this._latlng, mapZoom + 1);
					} else {
						this._group._map.fitBounds(this._bounds, fitBoundsOptions);
					}
				},

				getBounds: function getBounds() {
					var bounds = new L.LatLngBounds();
					bounds.extend(this._bounds);
					return bounds;
				},

				_updateIcon: function _updateIcon() {
					this._iconNeedsUpdate = true;
					if (this._icon) {
						this.setIcon(this);
					}
				},

				//Cludge for Icon, we pretend to be an icon for performance
				createIcon: function createIcon() {
					if (this._iconNeedsUpdate) {
						this._iconObj = this._group.options.iconCreateFunction(this);
						this._iconNeedsUpdate = false;
					}
					return this._iconObj.createIcon();
				},
				createShadow: function createShadow() {
					return this._iconObj.createShadow();
				},

				_addChild: function _addChild(new1, isNotificationFromChild) {

					this._iconNeedsUpdate = true;

					this._boundsNeedUpdate = true;
					this._setClusterCenter(new1);

					if (new1 instanceof L.MarkerCluster) {
						if (!isNotificationFromChild) {
							this._childClusters.push(new1);
							new1.__parent = this;
						}
						this._childCount += new1._childCount;
					} else {
						if (!isNotificationFromChild) {
							this._markers.push(new1);
						}
						this._childCount++;
					}

					if (this.__parent) {
						this.__parent._addChild(new1, true);
					}
				},

				/**
	    * Makes sure the cluster center is set. If not, uses the child center if it is a cluster, or the marker position.
	    * @param child L.MarkerCluster|L.Marker that will be used as cluster center if not defined yet.
	    * @private
	    */
				_setClusterCenter: function _setClusterCenter(child) {
					if (!this._cLatLng) {
						// when clustering, take position of the first point as the cluster center
						this._cLatLng = child._cLatLng || child._latlng;
					}
				},

				/**
	    * Assigns impossible bounding values so that the next extend entirely determines the new bounds.
	    * This method avoids having to trash the previous L.LatLngBounds object and to create a new one, which is much slower for this class.
	    * As long as the bounds are not extended, most other methods would probably fail, as they would with bounds initialized but not extended.
	    * @private
	    */
				_resetBounds: function _resetBounds() {
					var bounds = this._bounds;

					if (bounds._southWest) {
						bounds._southWest.lat = Infinity;
						bounds._southWest.lng = Infinity;
					}
					if (bounds._northEast) {
						bounds._northEast.lat = -Infinity;
						bounds._northEast.lng = -Infinity;
					}
				},

				_recalculateBounds: function _recalculateBounds() {
					var markers = this._markers,
					    childClusters = this._childClusters,
					    latSum = 0,
					    lngSum = 0,
					    totalCount = this._childCount,
					    i,
					    child,
					    childLatLng,
					    childCount;

					// Case where all markers are removed from the map and we are left with just an empty _topClusterLevel.
					if (totalCount === 0) {
						return;
					}

					// Reset rather than creating a new object, for performance.
					this._resetBounds();

					// Child markers.
					for (i = 0; i < markers.length; i++) {
						childLatLng = markers[i]._latlng;

						this._bounds.extend(childLatLng);

						latSum += childLatLng.lat;
						lngSum += childLatLng.lng;
					}

					// Child clusters.
					for (i = 0; i < childClusters.length; i++) {
						child = childClusters[i];

						// Re-compute child bounds and weighted position first if necessary.
						if (child._boundsNeedUpdate) {
							child._recalculateBounds();
						}

						this._bounds.extend(child._bounds);

						childLatLng = child._wLatLng;
						childCount = child._childCount;

						latSum += childLatLng.lat * childCount;
						lngSum += childLatLng.lng * childCount;
					}

					this._latlng = this._wLatLng = new L.LatLng(latSum / totalCount, lngSum / totalCount);

					// Reset dirty flag.
					this._boundsNeedUpdate = false;
				},

				//Set our markers position as given and add it to the map
				_addToMap: function _addToMap(startPos) {
					if (startPos) {
						this._backupLatlng = this._latlng;
						this.setLatLng(startPos);
					}
					this._group._featureGroup.addLayer(this);
				},

				_recursivelyAnimateChildrenIn: function _recursivelyAnimateChildrenIn(bounds, center, maxZoom) {
					this._recursively(bounds, this._group._map.getMinZoom(), maxZoom - 1, function (c) {
						var markers = c._markers,
						    i,
						    m;
						for (i = markers.length - 1; i >= 0; i--) {
							m = markers[i];

							//Only do it if the icon is still on the map
							if (m._icon) {
								m._setPos(center);
								m.clusterHide();
							}
						}
					}, function (c) {
						var childClusters = c._childClusters,
						    j,
						    cm;
						for (j = childClusters.length - 1; j >= 0; j--) {
							cm = childClusters[j];
							if (cm._icon) {
								cm._setPos(center);
								cm.clusterHide();
							}
						}
					});
				},

				_recursivelyAnimateChildrenInAndAddSelfToMap: function _recursivelyAnimateChildrenInAndAddSelfToMap(bounds, mapMinZoom, previousZoomLevel, newZoomLevel) {
					this._recursively(bounds, newZoomLevel, mapMinZoom, function (c) {
						c._recursivelyAnimateChildrenIn(bounds, c._group._map.latLngToLayerPoint(c.getLatLng()).round(), previousZoomLevel);

						//TODO: depthToAnimateIn affects _isSingleParent, if there is a multizoom we may/may not be.
						//As a hack we only do a animation free zoom on a single level zoom, if someone does multiple levels then we always animate
						if (c._isSingleParent() && previousZoomLevel - 1 === newZoomLevel) {
							c.clusterShow();
							c._recursivelyRemoveChildrenFromMap(bounds, mapMinZoom, previousZoomLevel); //Immediately remove our children as we are replacing them. TODO previousBounds not bounds
						} else {
							c.clusterHide();
						}

						c._addToMap();
					});
				},

				_recursivelyBecomeVisible: function _recursivelyBecomeVisible(bounds, zoomLevel) {
					this._recursively(bounds, this._group._map.getMinZoom(), zoomLevel, null, function (c) {
						c.clusterShow();
					});
				},

				_recursivelyAddChildrenToMap: function _recursivelyAddChildrenToMap(startPos, zoomLevel, bounds) {
					this._recursively(bounds, this._group._map.getMinZoom() - 1, zoomLevel, function (c) {
						if (zoomLevel === c._zoom) {
							return;
						}

						//Add our child markers at startPos (so they can be animated out)
						for (var i = c._markers.length - 1; i >= 0; i--) {
							var nm = c._markers[i];

							if (!bounds.contains(nm._latlng)) {
								continue;
							}

							if (startPos) {
								nm._backupLatlng = nm.getLatLng();

								nm.setLatLng(startPos);
								if (nm.clusterHide) {
									nm.clusterHide();
								}
							}

							c._group._featureGroup.addLayer(nm);
						}
					}, function (c) {
						c._addToMap(startPos);
					});
				},

				_recursivelyRestoreChildPositions: function _recursivelyRestoreChildPositions(zoomLevel) {
					//Fix positions of child markers
					for (var i = this._markers.length - 1; i >= 0; i--) {
						var nm = this._markers[i];
						if (nm._backupLatlng) {
							nm.setLatLng(nm._backupLatlng);
							delete nm._backupLatlng;
						}
					}

					if (zoomLevel - 1 === this._zoom) {
						//Reposition child clusters
						for (var j = this._childClusters.length - 1; j >= 0; j--) {
							this._childClusters[j]._restorePosition();
						}
					} else {
						for (var k = this._childClusters.length - 1; k >= 0; k--) {
							this._childClusters[k]._recursivelyRestoreChildPositions(zoomLevel);
						}
					}
				},

				_restorePosition: function _restorePosition() {
					if (this._backupLatlng) {
						this.setLatLng(this._backupLatlng);
						delete this._backupLatlng;
					}
				},

				//exceptBounds: If set, don't remove any markers/clusters in it
				_recursivelyRemoveChildrenFromMap: function _recursivelyRemoveChildrenFromMap(previousBounds, mapMinZoom, zoomLevel, exceptBounds) {
					var m, i;
					this._recursively(previousBounds, mapMinZoom - 1, zoomLevel - 1, function (c) {
						//Remove markers at every level
						for (i = c._markers.length - 1; i >= 0; i--) {
							m = c._markers[i];
							if (!exceptBounds || !exceptBounds.contains(m._latlng)) {
								c._group._featureGroup.removeLayer(m);
								if (m.clusterShow) {
									m.clusterShow();
								}
							}
						}
					}, function (c) {
						//Remove child clusters at just the bottom level
						for (i = c._childClusters.length - 1; i >= 0; i--) {
							m = c._childClusters[i];
							if (!exceptBounds || !exceptBounds.contains(m._latlng)) {
								c._group._featureGroup.removeLayer(m);
								if (m.clusterShow) {
									m.clusterShow();
								}
							}
						}
					});
				},

				//Run the given functions recursively to this and child clusters
				// boundsToApplyTo: a L.LatLngBounds representing the bounds of what clusters to recurse in to
				// zoomLevelToStart: zoom level to start running functions (inclusive)
				// zoomLevelToStop: zoom level to stop running functions (inclusive)
				// runAtEveryLevel: function that takes an L.MarkerCluster as an argument that should be applied on every level
				// runAtBottomLevel: function that takes an L.MarkerCluster as an argument that should be applied at only the bottom level
				_recursively: function _recursively(boundsToApplyTo, zoomLevelToStart, zoomLevelToStop, runAtEveryLevel, runAtBottomLevel) {
					var childClusters = this._childClusters,
					    zoom = this._zoom,
					    i,
					    c;

					if (zoomLevelToStart <= zoom) {
						if (runAtEveryLevel) {
							runAtEveryLevel(this);
						}
						if (runAtBottomLevel && zoom === zoomLevelToStop) {
							runAtBottomLevel(this);
						}
					}

					if (zoom < zoomLevelToStart || zoom < zoomLevelToStop) {
						for (i = childClusters.length - 1; i >= 0; i--) {
							c = childClusters[i];
							if (c._boundsNeedUpdate) {
								c._recalculateBounds();
							}
							if (boundsToApplyTo.intersects(c._bounds)) {
								c._recursively(boundsToApplyTo, zoomLevelToStart, zoomLevelToStop, runAtEveryLevel, runAtBottomLevel);
							}
						}
					}
				},

				//Returns true if we are the parent of only one cluster and that cluster is the same as us
				_isSingleParent: function _isSingleParent() {
					//Don't need to check this._markers as the rest won't work if there are any
					return this._childClusters.length > 0 && this._childClusters[0]._childCount === this._childCount;
				}
			});

			/*
	  * Extends L.Marker to include two extra methods: clusterHide and clusterShow.
	  * 
	  * They work as setOpacity(0) and setOpacity(1) respectively, but
	  * don't overwrite the options.opacity
	  * 
	  */

			L.Marker.include({
				clusterHide: function clusterHide() {
					var backup = this.options.opacity;
					this.setOpacity(0);
					this.options.opacity = backup;
					return this;
				},

				clusterShow: function clusterShow() {
					return this.setOpacity(this.options.opacity);
				}
			});

			L.DistanceGrid = function (cellSize) {
				this._cellSize = cellSize;
				this._sqCellSize = cellSize * cellSize;
				this._grid = {};
				this._objectPoint = {};
			};

			L.DistanceGrid.prototype = {

				addObject: function addObject(obj, point) {
					var x = this._getCoord(point.x),
					    y = this._getCoord(point.y),
					    grid = this._grid,
					    row = grid[y] = grid[y] || {},
					    cell = row[x] = row[x] || [],
					    stamp = L.Util.stamp(obj);

					this._objectPoint[stamp] = point;

					cell.push(obj);
				},

				updateObject: function updateObject(obj, point) {
					this.removeObject(obj);
					this.addObject(obj, point);
				},

				//Returns true if the object was found
				removeObject: function removeObject(obj, point) {
					var x = this._getCoord(point.x),
					    y = this._getCoord(point.y),
					    grid = this._grid,
					    row = grid[y] = grid[y] || {},
					    cell = row[x] = row[x] || [],
					    i,
					    len;

					delete this._objectPoint[L.Util.stamp(obj)];

					for (i = 0, len = cell.length; i < len; i++) {
						if (cell[i] === obj) {

							cell.splice(i, 1);

							if (len === 1) {
								delete row[x];
							}

							return true;
						}
					}
				},

				eachObject: function eachObject(fn, context) {
					var i,
					    j,
					    k,
					    len,
					    row,
					    cell,
					    removed,
					    grid = this._grid;

					for (i in grid) {
						row = grid[i];

						for (j in row) {
							cell = row[j];

							for (k = 0, len = cell.length; k < len; k++) {
								removed = fn.call(context, cell[k]);
								if (removed) {
									k--;
									len--;
								}
							}
						}
					}
				},

				getNearObject: function getNearObject(point) {
					var x = this._getCoord(point.x),
					    y = this._getCoord(point.y),
					    i,
					    j,
					    k,
					    row,
					    cell,
					    len,
					    obj,
					    dist,
					    objectPoint = this._objectPoint,
					    closestDistSq = this._sqCellSize,
					    closest = null;

					for (i = y - 1; i <= y + 1; i++) {
						row = this._grid[i];
						if (row) {

							for (j = x - 1; j <= x + 1; j++) {
								cell = row[j];
								if (cell) {

									for (k = 0, len = cell.length; k < len; k++) {
										obj = cell[k];
										dist = this._sqDist(objectPoint[L.Util.stamp(obj)], point);
										if (dist < closestDistSq || dist <= closestDistSq && closest === null) {
											closestDistSq = dist;
											closest = obj;
										}
									}
								}
							}
						}
					}
					return closest;
				},

				_getCoord: function _getCoord(x) {
					var coord = Math.floor(x / this._cellSize);
					return isFinite(coord) ? coord : x;
				},

				_sqDist: function _sqDist(p, p2) {
					var dx = p2.x - p.x,
					    dy = p2.y - p.y;
					return dx * dx + dy * dy;
				}
			};

			/* Copyright (c) 2012 the authors listed at the following URL, and/or
	  the authors of referenced articles or incorporated external code:
	  http://en.literateprograms.org/Quickhull_(Javascript)?action=history&offset=20120410175256
	  	Permission is hereby granted, free of charge, to any person obtaining
	  a copy of this software and associated documentation files (the
	  "Software"), to deal in the Software without restriction, including
	  without limitation the rights to use, copy, modify, merge, publish,
	  distribute, sublicense, and/or sell copies of the Software, and to
	  permit persons to whom the Software is furnished to do so, subject to
	  the following conditions:
	  	The above copyright notice and this permission notice shall be
	  included in all copies or substantial portions of the Software.
	  	THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
	  EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
	  MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
	  IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY
	  CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT,
	  TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE
	  SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
	  	Retrieved from: http://en.literateprograms.org/Quickhull_(Javascript)?oldid=18434
	  */

			(function () {
				L.QuickHull = {

					/*
	     * @param {Object} cpt a point to be measured from the baseline
	     * @param {Array} bl the baseline, as represented by a two-element
	     *   array of latlng objects.
	     * @returns {Number} an approximate distance measure
	     */
					getDistant: function getDistant(cpt, bl) {
						var vY = bl[1].lat - bl[0].lat,
						    vX = bl[0].lng - bl[1].lng;
						return vX * (cpt.lat - bl[0].lat) + vY * (cpt.lng - bl[0].lng);
					},

					/*
	     * @param {Array} baseLine a two-element array of latlng objects
	     *   representing the baseline to project from
	     * @param {Array} latLngs an array of latlng objects
	     * @returns {Object} the maximum point and all new points to stay
	     *   in consideration for the hull.
	     */
					findMostDistantPointFromBaseLine: function findMostDistantPointFromBaseLine(baseLine, latLngs) {
						var maxD = 0,
						    maxPt = null,
						    newPoints = [],
						    i,
						    pt,
						    d;

						for (i = latLngs.length - 1; i >= 0; i--) {
							pt = latLngs[i];
							d = this.getDistant(pt, baseLine);

							if (d > 0) {
								newPoints.push(pt);
							} else {
								continue;
							}

							if (d > maxD) {
								maxD = d;
								maxPt = pt;
							}
						}

						return { maxPoint: maxPt, newPoints: newPoints };
					},

					/*
	     * Given a baseline, compute the convex hull of latLngs as an array
	     * of latLngs.
	     *
	     * @param {Array} latLngs
	     * @returns {Array}
	     */
					buildConvexHull: function buildConvexHull(baseLine, latLngs) {
						var convexHullBaseLines = [],
						    t = this.findMostDistantPointFromBaseLine(baseLine, latLngs);

						if (t.maxPoint) {
							// if there is still a point "outside" the base line
							convexHullBaseLines = convexHullBaseLines.concat(this.buildConvexHull([baseLine[0], t.maxPoint], t.newPoints));
							convexHullBaseLines = convexHullBaseLines.concat(this.buildConvexHull([t.maxPoint, baseLine[1]], t.newPoints));
							return convexHullBaseLines;
						} else {
							// if there is no more point "outside" the base line, the current base line is part of the convex hull
							return [baseLine[0]];
						}
					},

					/*
	     * Given an array of latlngs, compute a convex hull as an array
	     * of latlngs
	     *
	     * @param {Array} latLngs
	     * @returns {Array}
	     */
					getConvexHull: function getConvexHull(latLngs) {
						// find first baseline
						var maxLat = false,
						    minLat = false,
						    maxLng = false,
						    minLng = false,
						    maxLatPt = null,
						    minLatPt = null,
						    maxLngPt = null,
						    minLngPt = null,
						    maxPt = null,
						    minPt = null,
						    i;

						for (i = latLngs.length - 1; i >= 0; i--) {
							var pt = latLngs[i];
							if (maxLat === false || pt.lat > maxLat) {
								maxLatPt = pt;
								maxLat = pt.lat;
							}
							if (minLat === false || pt.lat < minLat) {
								minLatPt = pt;
								minLat = pt.lat;
							}
							if (maxLng === false || pt.lng > maxLng) {
								maxLngPt = pt;
								maxLng = pt.lng;
							}
							if (minLng === false || pt.lng < minLng) {
								minLngPt = pt;
								minLng = pt.lng;
							}
						}

						if (minLat !== maxLat) {
							minPt = minLatPt;
							maxPt = maxLatPt;
						} else {
							minPt = minLngPt;
							maxPt = maxLngPt;
						}

						var ch = [].concat(this.buildConvexHull([minPt, maxPt], latLngs), this.buildConvexHull([maxPt, minPt], latLngs));
						return ch;
					}
				};
			})();

			L.MarkerCluster.include({
				getConvexHull: function getConvexHull() {
					var childMarkers = this.getAllChildMarkers(),
					    points = [],
					    p,
					    i;

					for (i = childMarkers.length - 1; i >= 0; i--) {
						p = childMarkers[i].getLatLng();
						points.push(p);
					}

					return L.QuickHull.getConvexHull(points);
				}
			});

			//This code is 100% based on https://github.com/jawj/OverlappingMarkerSpiderfier-Leaflet
			//Huge thanks to jawj for implementing it first to make my job easy :-)

			L.MarkerCluster.include({

				_2PI: Math.PI * 2,
				_circleFootSeparation: 25, //related to circumference of circle
				_circleStartAngle: 0,

				_spiralFootSeparation: 28, //related to size of spiral (experiment!)
				_spiralLengthStart: 11,
				_spiralLengthFactor: 5,

				_circleSpiralSwitchover: 9, //show spiral instead of circle from this marker count upwards.
				// 0 -> always spiral; Infinity -> always circle

				spiderfy: function spiderfy() {
					if (this._group._spiderfied === this || this._group._inZoomAnimation) {
						return;
					}

					var childMarkers = this.getAllChildMarkers(null, true),
					    group = this._group,
					    map = group._map,
					    center = map.latLngToLayerPoint(this._latlng),
					    positions;

					this._group._unspiderfy();
					this._group._spiderfied = this;

					//TODO Maybe: childMarkers order by distance to center

					if (this._group.options.spiderfyShapePositions) {
						positions = this._group.options.spiderfyShapePositions(childMarkers.length, center);
					} else if (childMarkers.length >= this._circleSpiralSwitchover) {
						positions = this._generatePointsSpiral(childMarkers.length, center);
					} else {
						center.y += 10; // Otherwise circles look wrong => hack for standard blue icon, renders differently for other icons.
						positions = this._generatePointsCircle(childMarkers.length, center);
					}

					this._animationSpiderfy(childMarkers, positions);
				},

				unspiderfy: function unspiderfy(zoomDetails) {
					/// <param Name="zoomDetails">Argument from zoomanim if being called in a zoom animation or null otherwise</param>
					if (this._group._inZoomAnimation) {
						return;
					}
					this._animationUnspiderfy(zoomDetails);

					this._group._spiderfied = null;
				},

				_generatePointsCircle: function _generatePointsCircle(count, centerPt) {
					var circumference = this._group.options.spiderfyDistanceMultiplier * this._circleFootSeparation * (2 + count),
					    legLength = circumference / this._2PI,
					    //radius from circumference
					angleStep = this._2PI / count,
					    res = [],
					    i,
					    angle;

					legLength = Math.max(legLength, 35); // Minimum distance to get outside the cluster icon.

					res.length = count;

					for (i = 0; i < count; i++) {
						// Clockwise, like spiral.
						angle = this._circleStartAngle + i * angleStep;
						res[i] = new L.Point(centerPt.x + legLength * Math.cos(angle), centerPt.y + legLength * Math.sin(angle))._round();
					}

					return res;
				},

				_generatePointsSpiral: function _generatePointsSpiral(count, centerPt) {
					var spiderfyDistanceMultiplier = this._group.options.spiderfyDistanceMultiplier,
					    legLength = spiderfyDistanceMultiplier * this._spiralLengthStart,
					    separation = spiderfyDistanceMultiplier * this._spiralFootSeparation,
					    lengthFactor = spiderfyDistanceMultiplier * this._spiralLengthFactor * this._2PI,
					    angle = 0,
					    res = [],
					    i;

					res.length = count;

					// Higher index, closer position to cluster center.
					for (i = count; i >= 0; i--) {
						// Skip the first position, so that we are already farther from center and we avoid
						// being under the default cluster icon (especially important for Circle Markers).
						if (i < count) {
							res[i] = new L.Point(centerPt.x + legLength * Math.cos(angle), centerPt.y + legLength * Math.sin(angle))._round();
						}
						angle += separation / legLength + i * 0.0005;
						legLength += lengthFactor / angle;
					}
					return res;
				},

				_noanimationUnspiderfy: function _noanimationUnspiderfy() {
					var group = this._group,
					    map = group._map,
					    fg = group._featureGroup,
					    childMarkers = this.getAllChildMarkers(null, true),
					    m,
					    i;

					group._ignoreMove = true;

					this.setOpacity(1);
					for (i = childMarkers.length - 1; i >= 0; i--) {
						m = childMarkers[i];

						fg.removeLayer(m);

						if (m._preSpiderfyLatlng) {
							m.setLatLng(m._preSpiderfyLatlng);
							delete m._preSpiderfyLatlng;
						}
						if (m.setZIndexOffset) {
							m.setZIndexOffset(0);
						}

						if (m._spiderLeg) {
							map.removeLayer(m._spiderLeg);
							delete m._spiderLeg;
						}
					}

					group.fire('unspiderfied', {
						cluster: this,
						markers: childMarkers
					});
					group._ignoreMove = false;
					group._spiderfied = null;
				}
			});

			//Non Animated versions of everything
			L.MarkerClusterNonAnimated = L.MarkerCluster.extend({
				_animationSpiderfy: function _animationSpiderfy(childMarkers, positions) {
					var group = this._group,
					    map = group._map,
					    fg = group._featureGroup,
					    legOptions = this._group.options.spiderLegPolylineOptions,
					    i,
					    m,
					    leg,
					    newPos;

					group._ignoreMove = true;

					// Traverse in ascending order to make sure that inner circleMarkers are on top of further legs. Normal markers are re-ordered by newPosition.
					// The reverse order trick no longer improves performance on modern browsers.
					for (i = 0; i < childMarkers.length; i++) {
						newPos = map.layerPointToLatLng(positions[i]);
						m = childMarkers[i];

						// Add the leg before the marker, so that in case the latter is a circleMarker, the leg is behind it.
						leg = new L.Polyline([this._latlng, newPos], legOptions);
						map.addLayer(leg);
						m._spiderLeg = leg;

						// Now add the marker.
						m._preSpiderfyLatlng = m._latlng;
						m.setLatLng(newPos);
						if (m.setZIndexOffset) {
							m.setZIndexOffset(1000000); //Make these appear on top of EVERYTHING
						}

						fg.addLayer(m);
					}
					this.setOpacity(0.3);

					group._ignoreMove = false;
					group.fire('spiderfied', {
						cluster: this,
						markers: childMarkers
					});
				},

				_animationUnspiderfy: function _animationUnspiderfy() {
					this._noanimationUnspiderfy();
				}
			});

			//Animated versions here
			L.MarkerCluster.include({

				_animationSpiderfy: function _animationSpiderfy(childMarkers, positions) {
					var me = this,
					    group = this._group,
					    map = group._map,
					    fg = group._featureGroup,
					    thisLayerLatLng = this._latlng,
					    thisLayerPos = map.latLngToLayerPoint(thisLayerLatLng),
					    svg = L.Path.SVG,
					    legOptions = L.extend({}, this._group.options.spiderLegPolylineOptions),
					    // Copy the options so that we can modify them for animation.
					finalLegOpacity = legOptions.opacity,
					    i,
					    m,
					    leg,
					    legPath,
					    legLength,
					    newPos;

					if (finalLegOpacity === undefined) {
						finalLegOpacity = L.MarkerClusterGroup.prototype.options.spiderLegPolylineOptions.opacity;
					}

					if (svg) {
						// If the initial opacity of the spider leg is not 0 then it appears before the animation starts.
						legOptions.opacity = 0;

						// Add the class for CSS transitions.
						legOptions.className = (legOptions.className || '') + ' leaflet-cluster-spider-leg';
					} else {
						// Make sure we have a defined opacity.
						legOptions.opacity = finalLegOpacity;
					}

					group._ignoreMove = true;

					// Add markers and spider legs to map, hidden at our center point.
					// Traverse in ascending order to make sure that inner circleMarkers are on top of further legs. Normal markers are re-ordered by newPosition.
					// The reverse order trick no longer improves performance on modern browsers.
					for (i = 0; i < childMarkers.length; i++) {
						m = childMarkers[i];

						newPos = map.layerPointToLatLng(positions[i]);

						// Add the leg before the marker, so that in case the latter is a circleMarker, the leg is behind it.
						leg = new L.Polyline([thisLayerLatLng, newPos], legOptions);
						map.addLayer(leg);
						m._spiderLeg = leg;

						// Explanations: https://jakearchibald.com/2013/animated-line-drawing-svg/
						// In our case the transition property is declared in the CSS file.
						if (svg) {
							legPath = leg._path;
							legLength = legPath.getTotalLength() + 0.1; // Need a small extra length to avoid remaining dot in Firefox.
							legPath.style.strokeDasharray = legLength; // Just 1 length is enough, it will be duplicated.
							legPath.style.strokeDashoffset = legLength;
						}

						// If it is a marker, add it now and we'll animate it out
						if (m.setZIndexOffset) {
							m.setZIndexOffset(1000000); // Make normal markers appear on top of EVERYTHING
						}
						if (m.clusterHide) {
							m.clusterHide();
						}

						// Vectors just get immediately added
						fg.addLayer(m);

						if (m._setPos) {
							m._setPos(thisLayerPos);
						}
					}

					group._forceLayout();
					group._animationStart();

					// Reveal markers and spider legs.
					for (i = childMarkers.length - 1; i >= 0; i--) {
						newPos = map.layerPointToLatLng(positions[i]);
						m = childMarkers[i];

						//Move marker to new position
						m._preSpiderfyLatlng = m._latlng;
						m.setLatLng(newPos);

						if (m.clusterShow) {
							m.clusterShow();
						}

						// Animate leg (animation is actually delegated to CSS transition).
						if (svg) {
							leg = m._spiderLeg;
							legPath = leg._path;
							legPath.style.strokeDashoffset = 0;
							//legPath.style.strokeOpacity = finalLegOpacity;
							leg.setStyle({ opacity: finalLegOpacity });
						}
					}
					this.setOpacity(0.3);

					group._ignoreMove = false;

					setTimeout(function () {
						group._animationEnd();
						group.fire('spiderfied', {
							cluster: me,
							markers: childMarkers
						});
					}, 200);
				},

				_animationUnspiderfy: function _animationUnspiderfy(zoomDetails) {
					var me = this,
					    group = this._group,
					    map = group._map,
					    fg = group._featureGroup,
					    thisLayerPos = zoomDetails ? map._latLngToNewLayerPoint(this._latlng, zoomDetails.zoom, zoomDetails.center) : map.latLngToLayerPoint(this._latlng),
					    childMarkers = this.getAllChildMarkers(null, true),
					    svg = L.Path.SVG,
					    m,
					    i,
					    leg,
					    legPath,
					    legLength,
					    nonAnimatable;

					group._ignoreMove = true;
					group._animationStart();

					//Make us visible and bring the child markers back in
					this.setOpacity(1);
					for (i = childMarkers.length - 1; i >= 0; i--) {
						m = childMarkers[i];

						//Marker was added to us after we were spiderfied
						if (!m._preSpiderfyLatlng) {
							continue;
						}

						//Close any popup on the marker first, otherwise setting the location of the marker will make the map scroll
						m.closePopup();

						//Fix up the location to the real one
						m.setLatLng(m._preSpiderfyLatlng);
						delete m._preSpiderfyLatlng;

						//Hack override the location to be our center
						nonAnimatable = true;
						if (m._setPos) {
							m._setPos(thisLayerPos);
							nonAnimatable = false;
						}
						if (m.clusterHide) {
							m.clusterHide();
							nonAnimatable = false;
						}
						if (nonAnimatable) {
							fg.removeLayer(m);
						}

						// Animate the spider leg back in (animation is actually delegated to CSS transition).
						if (svg) {
							leg = m._spiderLeg;
							legPath = leg._path;
							legLength = legPath.getTotalLength() + 0.1;
							legPath.style.strokeDashoffset = legLength;
							leg.setStyle({ opacity: 0 });
						}
					}

					group._ignoreMove = false;

					setTimeout(function () {
						//If we have only <= one child left then that marker will be shown on the map so don't remove it!
						var stillThereChildCount = 0;
						for (i = childMarkers.length - 1; i >= 0; i--) {
							m = childMarkers[i];
							if (m._spiderLeg) {
								stillThereChildCount++;
							}
						}

						for (i = childMarkers.length - 1; i >= 0; i--) {
							m = childMarkers[i];

							if (!m._spiderLeg) {
								//Has already been unspiderfied
								continue;
							}

							if (m.clusterShow) {
								m.clusterShow();
							}
							if (m.setZIndexOffset) {
								m.setZIndexOffset(0);
							}

							if (stillThereChildCount > 1) {
								fg.removeLayer(m);
							}

							map.removeLayer(m._spiderLeg);
							delete m._spiderLeg;
						}
						group._animationEnd();
						group.fire('unspiderfied', {
							cluster: me,
							markers: childMarkers
						});
					}, 200);
				}
			});

			L.MarkerClusterGroup.include({
				//The MarkerCluster currently spiderfied (if any)
				_spiderfied: null,

				unspiderfy: function unspiderfy() {
					this._unspiderfy.apply(this, arguments);
				},

				_spiderfierOnAdd: function _spiderfierOnAdd() {
					this._map.on('click', this._unspiderfyWrapper, this);

					if (this._map.options.zoomAnimation) {
						this._map.on('zoomstart', this._unspiderfyZoomStart, this);
					}
					//Browsers without zoomAnimation or a big zoom don't fire zoomstart
					this._map.on('zoomend', this._noanimationUnspiderfy, this);

					if (!L.Browser.touch) {
						this._map.getRenderer(this);
						//Needs to happen in the pageload, not after, or animations don't work in webkit
						//  http://stackoverflow.com/questions/8455200/svg-animate-with-dynamically-added-elements
						//Disable on touch browsers as the animation messes up on a touch zoom and isn't very noticable
					}
				},

				_spiderfierOnRemove: function _spiderfierOnRemove() {
					this._map.off('click', this._unspiderfyWrapper, this);
					this._map.off('zoomstart', this._unspiderfyZoomStart, this);
					this._map.off('zoomanim', this._unspiderfyZoomAnim, this);
					this._map.off('zoomend', this._noanimationUnspiderfy, this);

					//Ensure that markers are back where they should be
					// Use no animation to avoid a sticky leaflet-cluster-anim class on mapPane
					this._noanimationUnspiderfy();
				},

				//On zoom start we add a zoomanim handler so that we are guaranteed to be last (after markers are animated)
				//This means we can define the animation they do rather than Markers doing an animation to their actual location
				_unspiderfyZoomStart: function _unspiderfyZoomStart() {
					if (!this._map) {
						//May have been removed from the map by a zoomEnd handler
						return;
					}

					this._map.on('zoomanim', this._unspiderfyZoomAnim, this);
				},

				_unspiderfyZoomAnim: function _unspiderfyZoomAnim(zoomDetails) {
					//Wait until the first zoomanim after the user has finished touch-zooming before running the animation
					if (L.DomUtil.hasClass(this._map._mapPane, 'leaflet-touching')) {
						return;
					}

					this._map.off('zoomanim', this._unspiderfyZoomAnim, this);
					this._unspiderfy(zoomDetails);
				},

				_unspiderfyWrapper: function _unspiderfyWrapper() {
					/// <summary>_unspiderfy but passes no arguments</summary>
					this._unspiderfy();
				},

				_unspiderfy: function _unspiderfy(zoomDetails) {
					if (this._spiderfied) {
						this._spiderfied.unspiderfy(zoomDetails);
					}
				},

				_noanimationUnspiderfy: function _noanimationUnspiderfy() {
					if (this._spiderfied) {
						this._spiderfied._noanimationUnspiderfy();
					}
				},

				//If the given layer is currently being spiderfied then we unspiderfy it so it isn't on the map anymore etc
				_unspiderfyLayer: function _unspiderfyLayer(layer) {
					if (layer._spiderLeg) {
						this._featureGroup.removeLayer(layer);

						if (layer.clusterShow) {
							layer.clusterShow();
						}
						//Position will be fixed up immediately in _animationUnspiderfy
						if (layer.setZIndexOffset) {
							layer.setZIndexOffset(0);
						}

						this._map.removeLayer(layer._spiderLeg);
						delete layer._spiderLeg;
					}
				}
			});

			/**
	   * Adds 1 public method to MCG and 1 to L.Marker to facilitate changing
	   * markers' icon options and refreshing their icon and their parent clusters
	   * accordingly (case where their iconCreateFunction uses data of childMarkers
	   * to make up the cluster icon).
	   */

			L.MarkerClusterGroup.include({
				/**
	    * Updates the icon of all clusters which are parents of the given marker(s).
	    * In singleMarkerMode, also updates the given marker(s) icon.
	    * @param layers L.MarkerClusterGroup|L.LayerGroup|Array(L.Marker)|Map(L.Marker)|
	    * L.MarkerCluster|L.Marker (optional) list of markers (or single marker) whose parent
	    * clusters need to be updated. If not provided, retrieves all child markers of this.
	    * @returns {L.MarkerClusterGroup}
	    */
				refreshClusters: function refreshClusters(layers) {
					if (!layers) {
						layers = this._topClusterLevel.getAllChildMarkers();
					} else if (layers instanceof L.MarkerClusterGroup) {
						layers = layers._topClusterLevel.getAllChildMarkers();
					} else if (layers instanceof L.LayerGroup) {
						layers = layers._layers;
					} else if (layers instanceof L.MarkerCluster) {
						layers = layers.getAllChildMarkers();
					} else if (layers instanceof L.Marker) {
						layers = [layers];
					} // else: must be an Array(L.Marker)|Map(L.Marker)
					this._flagParentsIconsNeedUpdate(layers);
					this._refreshClustersIcons();

					// In case of singleMarkerMode, also re-draw the markers.
					if (this.options.singleMarkerMode) {
						this._refreshSingleMarkerModeMarkers(layers);
					}

					return this;
				},

				/**
	    * Simply flags all parent clusters of the given markers as having a "dirty" icon.
	    * @param layers Array(L.Marker)|Map(L.Marker) list of markers.
	    * @private
	    */
				_flagParentsIconsNeedUpdate: function _flagParentsIconsNeedUpdate(layers) {
					var id, parent;

					// Assumes layers is an Array or an Object whose prototype is non-enumerable.
					for (id in layers) {
						// Flag parent clusters' icon as "dirty", all the way up.
						// Dumb process that flags multiple times upper parents, but still
						// much more efficient than trying to be smart and make short lists,
						// at least in the case of a hierarchy following a power law:
						// http://jsperf.com/flag-nodes-in-power-hierarchy/2
						parent = layers[id].__parent;
						while (parent) {
							parent._iconNeedsUpdate = true;
							parent = parent.__parent;
						}
					}
				},

				/**
	    * Re-draws the icon of the supplied markers.
	    * To be used in singleMarkerMode only.
	    * @param layers Array(L.Marker)|Map(L.Marker) list of markers.
	    * @private
	    */
				_refreshSingleMarkerModeMarkers: function _refreshSingleMarkerModeMarkers(layers) {
					var id, layer;

					for (id in layers) {
						layer = layers[id];

						// Make sure we do not override markers that do not belong to THIS group.
						if (this.hasLayer(layer)) {
							// Need to re-create the icon first, then re-draw the marker.
							layer.setIcon(this._overrideMarkerIcon(layer));
						}
					}
				}
			});

			L.Marker.include({
				/**
	    * Updates the given options in the marker's icon and refreshes the marker.
	    * @param options map object of icon options.
	    * @param directlyRefreshClusters boolean (optional) true to trigger
	    * MCG.refreshClustersOf() right away with this single marker.
	    * @returns {L.Marker}
	    */
				refreshIconOptions: function refreshIconOptions(options, directlyRefreshClusters) {
					var icon = this.options.icon;

					L.setOptions(icon, options);

					this.setIcon(icon);

					// Shortcut to refresh the associated MCG clusters right away.
					// To be used when refreshing a single marker.
					// Otherwise, better use MCG.refreshClusters() once at the end with
					// the list of modified markers.
					if (directlyRefreshClusters && this.__parent) {
						this.__parent._group.refreshClusters(this);
					}

					return this;
				}
			});

			exports.MarkerClusterGroup = MarkerClusterGroup;
			exports.MarkerCluster = MarkerCluster;

			Object.defineProperty(exports, '__esModule', { value: true });
		});
		
	});

	unwrapExports(leaflet_markerclusterSrc);

	/*amaps is just nlmaps built with Amsterdam's config. So let's rename it amaps.*/
	var amaps = nlmaps;

	return amaps;

}());
//# sourceMappingURL=amaps.iife.js.map
