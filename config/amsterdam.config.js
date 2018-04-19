export default {
    "version": 0.1,    
    "basemaps": {
        "defaults": {
            "crs": "EPSG:3857",
            "attr": "Kaartgegevens &copy; <a href='https://data.amsterdam.nl'>Datapunt Amsterdam</a>",
            "minZoom": 6,
            "maxZoom": 19,
            "type": "wmts",
            "format": "png",
            "url": "https://t{s}.data.amsterdam.nl/"
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
    "map": {
        "style": 'standaard',
        "center": {
            "latitude": 52.37,
            "longitude": 4.8952
        },
        "zoom": 8,
        "attribution": true,
        "extent":  [ 4.7283, 52.2771, 5.0799, 52.4324 ]
    }
}
