const shell = require('shelljs');
const { execSync } = require('child_process');

execSync('node scripts/build.js -p leaflet,googlemaps,openlayers,geolocator -c ../config/amsterdam.config.js', {cwd: 'nlmaps', env: {NODE_ENV: 'production'}, stdio: [0,1,2]});
execSync('node scripts/build.js -p nlmaps -c ../config/amsterdam.config.js', {cwd: 'nlmaps', env: {NODE_ENV: 'production'}, stdio: [0,1,2]})
execSync('node scripts/publish', {cwd: 'nlmaps', env: {NODE_ENV: 'production'}, stdio: [0,1,2]})

