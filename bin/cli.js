#!/usr/bin/env node

'use strict'

var runbrowser = require('../');

var args = process.argv.slice(2);

var filename;
var port = 3000;
var help = false;

if (args.length === 1 && args[0] !== '--help' && args[0] !== '-h') {
  filename = args[0];
} else if (args.length === 3) {
  if (args[0] === '-p') {
    port = args[1];
    filename = args[2];
  } else if (args[1] === '-p') {
    port = args[2];
    filename = args[0];
  } else {
    help = true;
  }
} else {
  help = true;
}

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
