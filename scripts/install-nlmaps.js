const shell = require('shelljs');
const { execSync } = require('child_process');

console.log('npm install ...');
execSync('npm install', {cwd: 'nlmaps', stdio: [0,1,2]});
console.log('npm run bootstrap ...');
execSync('npm run bootstrap', {cwd: 'nlmaps', stdio: [0,1,2]});
