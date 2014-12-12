'use strict';
var test = require('tape');
var timers = require('timers');
var setTimeout = timers.setTimeout;
var clearTimeout = timers.clearTimeout;
var fmt = require('util').format;
var global = require('global');

var window = global.window;

window.__globalTestTimer;

if (__testTimeout < Infinity) {
  window.__globalTestTimer = setTimeout(function(){
    test('Global test timeout', function(t) {
      t.fail(fmt('Global timeout of %dms exceeded', __testTimeout));
    });
  }, __testTimeout);
}
