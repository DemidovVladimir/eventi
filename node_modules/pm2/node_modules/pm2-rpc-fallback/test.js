
var fallback = require('.').fallback;

fallback({
  DUMP_FILE_PATH : 'test.dump',
  DAEMON_RPC_PORT : 6666
}, function(err, data) {
  console.log('end', err, data);
});
