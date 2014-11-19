'use strict';

var phantomjs = require('phantomjs');
var path = require('path');
var spawn = require('child_process').spawn;
var finished = require('tap-finished');
var request = require('request');
var istanbul = require('istanbul');
var getPort = require('get-port');
var safeParse = require('safe-json-parse/callback');

module.exports = runPhantom;

function readArray(stream) {
  var buffer = [];

  stream.on('data', function pushChunk(chunk) {
    buffer.push(String(chunk));
  });

  return buffer;
}

function runPhantom(uri, reports, cb) {
  getPort(function spawnPhantom(err, port) {
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

    proc.stdout.pipe(finished(onTapFinished));

    function onTapFinished(results) {
      var passed = results.fail.length === 0;
      var coverageUri = 'http://localhost:' + port + '/';
      request(coverageUri, onResponse);

      function onResponse(err, res, body) {
        if (err) {
          return cb(err);
        }

        if (body !== '{}') {
          safeParse(body, addCoverageReportAndWriteReports);
        } else {
          done();
        }
      }

      function addCoverageReportAndWriteReports(err, json) {
        if (err) {
          return cb(err);
        }
        var collector = new istanbul.Collector();
        var reporter = new istanbul.Reporter();
        var sync = false;
        collector.add(json);
        reporter.addAll(reports);
        reporter.write(collector, sync, done);
      }

      function done() {
        cb(null, {
          stdout: stdout.join(''),
          stderr: stderr.join(''),
          passed: passed
        });
      }
    }

    return proc;
  });
}
