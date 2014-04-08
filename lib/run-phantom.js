'use strict';

var phantomjs = require('phantomjs');
var path = require('path');
var spawn = require('child_process').spawn;
var finished = require('tap-finished');

module.exports = runPhantom;

function readArray(stream) {
    var buffer = [];

    stream.on('data', function (chunk) {
        buffer.push(String(chunk));
    });

    return buffer;
}

function runPhantom(uri, cb) {
  var proc = spawn(phantomjs.path, [
    path.join(__dirname, 'phantom-script.js'),
    uri,
    '--debug=true'
  ]);

  var stdout = readArray(proc.stdout);
  var stderr = readArray(proc.stderr);

  proc.stdout.pipe(finished(function (results) {
    var passed = results.fail.length === 0;

    cb(null, {
      stdout: stdout.join(''),
      stderr: stderr.join(''),
      passed: passed
    });
  }));

  return proc;
}
