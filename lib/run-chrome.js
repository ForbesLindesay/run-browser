'use strict';

var chrome = require('karma-chrome-laucnher');
var path = require('path');
var spawn = require('child_process').spawn;

module.exports = runChrome;

function runChrome(uri) {
  var proc = spawn(chrome.path, [
    path.join(__dirname, 'chrome-script.js'),
    uri,
    '--debug=true'
  ]);
  return proc;
}
