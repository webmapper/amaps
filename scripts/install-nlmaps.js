const { execSync } = require('child_process');

execSync('npm install', { cwd: 'nlmaps', stdio: [0, 1, 2] });
execSync('npm run bootstrap', { cwd: 'nlmaps', stdio: [0, 1, 2] });
