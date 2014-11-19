'use strict';
var webserver = require('webserver');
var args = require('system').args;
var webpage = require('webpage');

var url = args[1];
var port = args[2] || 8080;

var server = webserver.create();
var page = webpage.create();

page.onConsoleMessage = function (msg) {
  console.log(msg);
};

server.listen(port, function onServer(request, response) {
  response.statusCode = 200;
  var coverage = page.evaluate(function getCoverage() {
    return window.__coverage__;
  });
  response.setHeader('Content-Type', 'application/json');
  response.write(JSON.stringify(coverage || {}));
  response.close();
});

page.open(url, function (status) {});
