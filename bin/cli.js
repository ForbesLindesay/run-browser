#!/usr/bin/env node

'use strict';
var process = require('process');
var console = require('console');
var parseArgs = require('minimist');

var runbrowser = require('../index.js');

var args = parseArgs(process.argv.slice(2));

var filename = args._[0];
var port = Number(args.p || args.port) || 3000;
var help = args.help || args.h || args._.length === 0;
var phantom = args.b || args.phantom || args.phantomjs;
var coverage = args.p || args.coverage || args.istanbul;
if (coverage) phantom = true;

if (help) {
  var helpText = [
    '',
    'Usage:',
    '  run-browser <file> <options>',
    '',
    'Options:',
    '  -p --port <number> The port number to run the server on (default: 3000)',
    '  -b --phantom       Use the phantom headless browser to run tests and then exit with the correct status code (if tests output TAP)',
    '  -c --coverage      Generate coverage Istanbul report (phantomjs only). Repeat for each type of coverage report desired. (default: text only)',
    '',
    'Example:',
    '  run-browser test-file.js --port 3030 --coverage text --coverage html --coverage=cobertura',
    ''
  ].join('\n');
  console.log(helpText);
  process.exit(process.argv.length === 3 ? 0 : 1);
}

var server = runbrowser(filename);
server.listen(port);

if (!phantom) {
  console.log('Open a browser and navigate to "http://localhost:' + port + '"');
} else {
  runbrowser.runPhantom('http://localhost:' + port + '/', coverage, function (err, res) {
    if (err) {
      console.error(err);
      throw err;
    }

    if (res.stderr) process.stderr.write(res.stderr);
    if (res.stdout) process.stdout.write(res.stdout);

    process.exit(res.passed ? 0 : 1);
  });
}
