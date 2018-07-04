export default {
    "version": 0.2,
    "basemaps": {
        "defaults": {
            "attribution": "Kaartgegevens CC-BY-4.0 Gemeente Amsterdam",
            "minZoom": 12,
            "maxZoom": 21,
            "type": "tms",
            "format": "png",
            "url": "https://t1.data.amsterdam.nl"
        },
        "layers": [
            {
                "name": "standaard",
                "layerName": "topo_wm_light"
            },
            {
                "name": "zwartwit",
                "layerName": "topo_wm_zw"
            },
            {
                "name": "licht",
                "layerName": "topo_wm_light"
            },
            {
                "name": "licht",
                "layerName": "topo_wm"
            }
        ]
    },
    "wms": {
        "defaults": {
            "url": "https://map.data.amsterdam.nl/maps",
            "version": "1.1.0",
            "transparent": true,
            "format": "image/png",
            "minZoom": 0,
            "maxZoom": 24,
            "styleName": ""
        },
        "layers": [
            {
                "name": "tram",
                "layerName": "trm",
                "url": "https://map.data.amsterdam.nl/maps/trm?"
            }
        ]
    },
    "geocoder": {
        "suggestUrl": "https://geodata.nationaalgeoregister.nl/locatieserver/v3/suggest?fq=gemeentenaam:amsterdam&",
        "lookupUrl": "https://geodata.nationaalgeoregister.nl/locatieserver/v3/lookup?fq=gemeentenaam:amsterdam&"
    },
    "featureQuery": {
        "baseUrl": "https://api.data.amsterdam.nl/bag/nummeraanduiding/?format=json&locatie=",
    },
    "marker" : {
      "url": './dist/images/svg/marker.svg',
      "iconSize": [40,40],
      "iconAnchor": [20, 39]
    },
    "map": {
        "style": 'standaard',
        "center": {
            "latitude": 52.37,
            "longitude": 4.8952
        },
        "zoom": 14,
        "attribution": true,
        "extent":  [ 52.25168, 4.64034, 52.50536, 5.10737 ],
        "zoomposition": "bottomright"
    },
    "classnames": {
        'geocoderContainer': ['embed-search'],
        'geocoderSearch': ['invoer'],
        'geocoderButton': ['primary','action','embed-search__button'],
        'geocoderResultList': ['embed-search__auto-suggest'],
        'geocoderResultItem' : ['embed-search__auto-suggest__item']
    }
}
