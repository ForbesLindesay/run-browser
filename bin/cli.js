#!/usr/bin/env node

'use strict';

var parseArgs = require('minimist');

var runbrowser = require('../index.js');

var args = parseArgs(process.argv.slice(2));

var filename = args._[0];
var port = Number(args.p || args.port) || 3000;
var help = args.help || args.h || args._.length === 0;
var phantom = args.b || args.phantom || args.phantomjs;

if (help) {
  console.log();
  console.log('Usage:');
  console.log();
  console.log('  run-browser test-file.js');
  console.log();
  console.log('options:');
  console.log();
  console.log('  -p --port <number> The port number to run the server on (default: 3000)');
  console.log('  -b --phantom       Use the phantom headless browser to run tests and then exit with the correct status code (if tests output TAP)');
  console.log('');
  process.exit(process.argv.length === 3 ? 0 : 1);
}

var server = runbrowser(filename);
server.listen(port);

if (!phantom) {
  console.log('Open a browser and navigate to "http://localhost:' + port + '"');
} else {
  runbrowser.runPhantom('http://localhost:' + port + '/',
    function (err, res) {
      if (err) {
        console.error(err);
        throw err;
      }

      if (res.stderr) process.stderr.write(res.stderr);
      if (res.stdout) process.stdout.write(res.stdout);

      process.exit(res.passed ? 0: 1);
    });
}

