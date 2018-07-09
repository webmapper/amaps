const helpers = require('./helpers');
const { spawn } = require('child_process')
const shell = require('shelljs');

const tasks = ['index', 'mora', 'tvm'];


if (helpers.args.production) {
    process.env.NODE_ENV = 'production';
}

/* eslint-disable no-console */

//run each package's rollup command from the package's directory
//and capture/log output
tasks.forEach(task => {
  const rollup_args = ['-c', 'rollup.' + task + '.js'];
  //if user passed watch flag to wrapper, use rollup's watch mode
  if (helpers.args.watch) {
    rollup_args.unshift('--watch')
  }
  console.log(rollup_args)
  const build = spawn('node_modules/rollup/bin/rollup', rollup_args, {env: process.env});
  
  build.stdout.on('data', (data) => {
    console.log(`${data}`);
  });
  
  build.stderr.on('data', (data) => {
    console.log(`${data}`);
  });
  
  build.on('close', (code) => {
    console.log(`child process for ${task} exited with code ${code}`);
  });
})

const assetdest = helpers.args.production ? 'dist' : 'test';
function fmtDst(path) {
  return assetdest + '/' + path;
}

shell.mkdir('-p', fmtDst('nlmaps/dist/assets'));
shell.mkdir('-p', fmtDst('dist'));
shell.cp( '-rf', 'nlmaps/packages/assets/*', fmtDst('nlmaps/dist/assets/'));
shell.cp( '-rf', 'node_modules/stijl/dist/*', fmtDst('dist/'));
shell.cp( '-rf', 'node_modules/babel-polyfill/dist/polyfill.min.js', fmtDst('dist/'));
