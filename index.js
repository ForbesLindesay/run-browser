'use strict';

var http = require('http');
var fs = require('fs');
var inspect = require('util').inspect;
var path = require('path');
var browserify = require('browserify');
var glob = require('glob');

var html = fs.readFileSync(__dirname + '/lib/test-page.html', 'utf8');

module.exports = createServer;
function createServer(filename) {
  return http.createServer(function (req, res) {
    if (req.url === '/') {
      res.setHeader('Content-Type', 'text/html');
      return res.end(html);
    }
    var match;
    if (match = /^\/tests-bundle.js$/.test(req.url)) {
      var sent = false;
      return glob(filename, function (err, files) {
        if (err || files.length === 0) {
          res.setHeader('Content-Type', 'application/javascript');
          var e = JSON.stringify((err || 'No files found matching ' + inspect(filename)).toString());
          res.end('document.getElementById("__testling_output").textContent = ' + e + ';console.error(' + e + ');');
          if (err) console.error(err.stack || err.message || err);
          return;
        }
        files = files.map(function (p) { return path.resolve(p); });
        files.unshift(__dirname + '/lib/override-log.js');
        return browserify(files).bundle({debug: true}, function (err, src) {
          if (sent) return;
          sent = true;
          res.setHeader('Content-Type', 'application/javascript');
          if (err) {
            var e = JSON.stringify(err.toString());
            res.end('document.getElementById("__testling_output").textContent = ' + e + ';console.error(' + e + ');');
            console.error(err.stack || err.message || err);
          } else {
            res.end(src);
          }
        });
      });
    }
    res.statusCode = 404;
    res.end('404: Path not found');
  });
}
