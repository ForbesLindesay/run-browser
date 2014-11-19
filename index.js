'use strict';

var http = require('http');
var fs = require('fs');
var inspect = require('util').inspect;
var path = require('path');
var browserify = require('browserify');
var glob = require('glob');
var istanbulTransform = require('browserify-istanbul');
var stream = require('stream');

var runPhantom = require('./lib/run-phantom.js')
var html = fs.readFileSync(__dirname + '/lib/test-page.html', 'utf8');

var coverage = false;

module.exports = createServer;
module.exports.runPhantom = function(uri, reports, cb) {
  if (typeof reports === 'function') {
    cb = reports;
    reports = false;
  }

  if (reports) coverage = true;

  if (typeof reports === 'boolean') reports = [ 'text' ];
  else if (Array.isArray(reports)) reports = reports;
  else if (typeof reports === 'string') reports = [ reports ];

  runPhantom(uri, reports, cb);
}

module.exports.createHandler = createHandler;
module.exports.handles = handles;

function createServer(filename, coverage) {
  var handler = createHandler(filename, coverage);
  return http.createServer(handler);
}

function getTransform(coverage) {
  return coverage ? istanbulTransform({
    ignore: [
      '**/node_modules/**',
      '**/test/**',
      '**/tests/**',
      '**/run-browser/**'
    ],
    defaultIgnore: true
  }) : pass;

  function pass(file) {
    return new stream.PassThrough();
  }
}

function createHandler(filename) {
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

        return browserify(files)
          .transform(getTransform(coverage))
          .bundle({debug: true}, onBrowserifySrc);

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
    res.statusCode = 404;
    res.end('404: Path not found');
  }
}

function handles(req) {
  return req.url === '/' || req.url === '/tests-bundle.js';
}
