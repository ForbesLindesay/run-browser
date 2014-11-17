'use strict';

var phantomjs = require('phantomjs');
var path = require('path');
var spawn = require('child_process').spawn;
var finished = require('tap-finished');
var request = require('request');
var istanbul = require('istanbul');

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

    request('http://localhost:8081/', function(err, res, body) {

      if (body) {
        var collector = new istanbul.Collector();
        var reporter = new istanbul.Reporter();
        var sync = false;

        collector.add(JSON.parse(body));
        
        reporter.addAll([ 'lcov', 'clover', 'text' ]);
        reporter.write(collector, sync, function () {
          cb(null, {
            stdout: stdout.join(''),
            stderr: stderr.join(''),
            passed: passed
          });
        });
      } else {
        cb(null, {
          stdout: stdout.join(''),
          stderr: stderr.join(''),
          passed: passed
        });
      }


    });

  }));

  return proc;
}
