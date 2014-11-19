'use strict';

var phantomjs = require('phantomjs');
var path = require('path');
var spawn = require('child_process').spawn;
var finished = require('tap-finished');
var request = require('request');
var istanbul = require('istanbul');
var getPort = require('get-port');
var safeParse = require("safe-json-parse/callback");

module.exports = runPhantom;

function readArray(stream) {
    var buffer = [];

    stream.on('data', function (chunk) {
        buffer.push(String(chunk));
    });

    return buffer;
}

function runPhantom(uri, cb) {
  getPort(function (err, port) {
    if (err) {
      return cb(err);
    }

    var proc = spawn(phantomjs.path, [
      path.join(__dirname, 'phantom-script.js'),
      uri,
      port,
      '--debug=true'
    ]);

    var stdout = readArray(proc.stdout);
    var stderr = readArray(proc.stderr);

    proc.stdout.pipe(finished(function onTapFinished(results) {
      var passed = results.fail.length === 0;

      var coverageUri = 'http://localhost:' + port + '/'
      request(coverageUri, function onResponse(err, res, body) {

        if (body !== '{}') {

          var collector = new istanbul.Collector();
          var reporter = new istanbul.Reporter();
          var sync = false;

          safeParse(body, function (err, json) {
            if (err) {
              return cb(err);
            }
            collector.add(json);
            reporter.addAll([ 'lcov', 'clover', 'text' ]);
            reporter.write(collector, sync, done);
          });
        } else {
          done()
        }

        function done() {
          cb(null, {
            stdout: stdout.join(''),
            stderr: stderr.join(''),
            passed: passed
          });
        }

      });

    }));

    return proc;
  });
}
