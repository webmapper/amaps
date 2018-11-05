const { spawn } = require('child_process');
const shell = require('shelljs');
const helpers = require('./helpers');

const tasks = ['index', 'pointquery', 'multiselect'];


if (helpers.args.production) {
  process.env.NODE_ENV = 'production';
}

/* eslint-disable no-console */

// run each package's rollup command from the package's directory
// and capture/log output
tasks.forEach((task) => {
  const rollupArgs = ['-c', `rollup.${task}.js`];
  // if user passed watch flag to wrapper, use rollup's watch mode
  if (helpers.args.watch) {
    rollupArgs.unshift('--watch');
  }
  console.log(rollupArgs);
  const build = spawn('node_modules/rollup/bin/rollup', rollupArgs, { env: process.env });

  build.stdout.on('data', (data) => {
    console.log(`${data}`);
  });

  build.stderr.on('data', (data) => {
    console.log(`${data}`);
  });

  build.on('close', (code) => {
    console.log(`child process for ${task} exited with code ${code}`);
  });
});

const assetdest = helpers.args.production ? 'dist' : 'test';
function fmtDst(path) {
  return `${assetdest}/${path}`;
}

shell.mkdir('-p', fmtDst('nlmaps/dist/assets'));
shell.mkdir('-p', fmtDst('dist'));
shell.cp('-rf', 'nlmaps/packages/assets/*', fmtDst('nlmaps/dist/assets/'));
shell.cp('-rf', 'node_modules/amsterdam-stijl/dist/*', fmtDst('dist/'));
shell.cp('-rf', 'node_modules/babel-polyfill/dist/polyfill.min.js', fmtDst('dist/'));
