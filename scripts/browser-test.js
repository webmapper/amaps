let host = process.env.SERVER_HOSTNAME? process.env.SERVER_HOSTNAME : 'localhost:8080'
require('../test/browser-test.js')(host).catch((e) => {
  /* eslint-disable-next-line no-console */
  console.log(e);
});
