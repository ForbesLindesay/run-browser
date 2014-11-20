'use strict';

var http = require('http');
var fs = require('fs');
var inspect = require('util').inspect;
var path = require('path');
var browserify = require('browserify');
var glob = require('glob');
var istanbulTransform = require('browserify-istanbul');
var JSONStream = require('jsonstream2');
var istanbul = require('istanbul');

var runPhantom = require('./lib/run-phantom.js')
var html = fs.readFileSync(__dirname + '/lib/test-page.html', 'utf8');

module.exports = createServer;
module.exports.runPhantom = runPhantom;
module.exports.createHandler = createHandler;
module.exports.handles = handles;

function createServer(filename, reports, phantom) {
  var handler = createHandler(filename, reports, phantom);
  return http.createServer(handler);
}

function instrumentTransform() {
  return istanbulTransform({
    ignore: [
      '**/node_modules/**',
      '**/test/**',
      '**/tests/**',
      '**/run-browser/**'
    ],
    defaultIgnore: true
  });
}

function createHandler(filename, reports, phantom) {

  if (typeof reports === 'boolean' && reports) reports = [ 'text' ];
  else if (Array.isArray(reports)) reports = reports;
  else if (typeof reports === 'string') reports = [ reports ];

  return function (req, res) {
    if (req.url === '/') {
      res.setHeader('Content-Type', 'text/html');
      return res.end(html);
    }
    if ('/tests-bundle.js' === req.url) {
      var sent = false;
      return glob(filename, function (err, files) {
        if (err || files.length === 0) {
          res.setHeader('Content-Type', 'application/javascript');
          var e = JSON.stringify((err || 'No files found matching ' +
            inspect(filename)).toString());
          res.end('document.getElementById("__testling_output").textContent = ' + 
            e + ';console.error(' + e + ');');
          if (err) console.error(err.stack || err.message || err);
          return;
        }
        files = files.map(normalizePath);
        files.unshift(__dirname + '/lib/override-log.js');

        var b = browserify(files);
        if (reports) b.transform(instrumentTransform());
        return b.bundle({debug: true}, onBrowserifySrc)

        function onBrowserifySrc(err, src) {
          if (sent) return;
          sent = true;
          res.setHeader('Content-Type', 'application/javascript');
          if (err) {
            var e = JSON.stringify(err.toString());
            res.end('document.getElementById("__testling_output").textContent = ' + e
                    + ';console.error(' + e + ');');
            console.error(err.stack || err.message || err);
          } else {
            res.end(src);
          }
        }

        function normalizePath(p) {
          return path.resolve(p);
        }
      });
    }
    if ('/results' === req.url && req.method === 'POST') {
      return req.pipe(JSONStream.parse('*')).once('data', function (results) {

        console.log(results.consoleLog);

        if (results.coverage) {
          var collector = new istanbul.Collector();
          var reporter = new istanbul.Reporter();
          var sync = false;
          collector.add(results.coverage);
          reporter.addAll(reports);
          reporter.write(collector, sync, done);
        }
        else {
          done();
        }

        function done(err) {
          res.statusCode === 200;
          res.end('OK');
          var passed = results.tap.fail.length === 0;
          if (phantom) process.exit(res.passed ? 0 : 1);
        }
      })
    }
    res.statusCode = 404;
    res.end('404: Path not found');
  }
}

function handles(req) {
  return req.url === '/' || req.url === '/tests-bundle.js';
}
