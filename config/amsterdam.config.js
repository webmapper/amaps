export default {
    "version": 0.1,    
    "basemaps": {
        "defaults": {
            "attr": "Kaartgegevens &copy; <a href='https://data.amsterdam.nl'>Datapunt Amsterdam</a>",
            "minZoom": 11,
            "maxZoom": 21,
            "type": "tms",
            "format": "png",
            "url": "https://t1.data.amsterdam.nl"
        },
        "layers": [
            {
                "name": "standaard",
                "urlname": "topo_wm_zw"                
            },
            {
                "name": "licht",
                "urlname": "topo_wm_light"
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
            "maxZoom": 24
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
    "map": {
        "style": 'standaard',
        "center": {
            "latitude": 52.37,
            "longitude": 4.8952
        },
        "zoom": 12,
        "attribution": true,
        "extent":  [ 4.7283, 52.2771, 5.0799, 52.4324 ]
    }
}
