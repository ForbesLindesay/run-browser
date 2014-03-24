#!/usr/bin/env node

'use strict';

var runbrowser = require('../');
var parseArgs = require('minimist');

var args = parseArgs(process.argv.slice(2));

var filename = args._[0];
var port = Number(args.p || args.port) || 3000;
var help = args.help || args.h || args._.length === 0;

if (help) {
  console.log('Usage:');
  console.log();
  console.log('  run-browser test-file.js');
  console.log();
  console.log('  run-browser test-file.js -p 3000');
  console.log();
  process.exit(args.length === 1 ? 0 : 1);
}

var server = runbrowser(filename);
server.listen(port);
console.log('Open a browser and navigate to "http://localhost:' + port + '"');
