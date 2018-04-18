#!/bin/sh
git clone https://github.com/webmapper/nlmaps
cd nlmaps
npm install
npm run bootstrap
NODE_ENV=production node scripts/build -c ../config/amsterdam.config.js -p leaflet,openlayers,googlemaps,geolocator
NODE_ENV=production node scripts/build -c ../config/amsterdam.config.js -p nlmaps
node scripts/publish
