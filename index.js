'use strict';

var http = require('http');
var fs = require('fs');
var browserify = require('browserify');

var html = fs.readFileSync(__dirname + '/lib/test-page.html', 'utf8');
var overrideLog = fs.readFileSync(__dirname + '/lib/override-log.js', 'utf8');

module.exports = createServer;
function createServer(filename) {
  return http.createServer(function (req, res) {
    if (req.url === '/') {
      res.setHeader('Content-Type', 'text/html');
      return res.end(html);
    }
    if (req.url === '/logging.js') {
      res.setHeader('Content-Type', 'application/javascript');
      return res.end(overrideLog);
    }
    var match;
    if (match = /^\/tests.js$/.test(req.url)) {
      var sent = false;
      return fs.stat(filename, function (err) {
        if (err) {
          res.setHeader('Content-Type', 'application/javascript');
          res.end('console.error(' + JSON.stringify(err.toString()) + ');');
          console.error(err.stack || err.message || err);
          return;
        }
        return browserify(filename).bundle({debug: true}, function (err, src) {
          if (sent) return;
          sent = true;
          res.setHeader('Content-Type', 'application/javascript');
          if (err) {
            res.end('console.error(' + JSON.stringify(err.toString()) + ');');
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
