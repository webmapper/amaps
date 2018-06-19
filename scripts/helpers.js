const ArgumentParser = require('argparse').ArgumentParser;

const parser = new ArgumentParser({
  version: '0.0.1',
  addHelp:true,
  description: 'Argparse example'
});
parser.addArgument(
  [ '-w', '--watch' ],
  {
    action: 'storeTrue',
    defaultValue: false,
    help: 'start rollup in watch mode (only used for build script).'
  }
);

const args = parser.parseArgs();

module.exports = {
  args: args
}
