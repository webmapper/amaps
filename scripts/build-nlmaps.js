const { execSync } = require('child_process');

process.env.NODE_ENV = 'production';
process.env.STANDALONE = true;
/* eslint-disable-next-line max-len */
execSync('node scripts/build.js -p nlmaps -c ../config/amsterdam.config.js', { cwd: 'nlmaps', env: process.env, stdio: [0, 1, 2] });
execSync('node scripts/publish', { cwd: 'nlmaps', env: process.env, stdio: [0, 1, 2] });
