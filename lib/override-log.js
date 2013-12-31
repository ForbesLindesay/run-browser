'use strict';

var inspect = require('util').inspect;

function proxy(original, color) {
  return function (msg) {
    var index = 1;
    var args = arguments;
    
    if (typeof msg === 'string') {
      msg = msg.replace(/(^|[^%])%[sd]/g, function (_, s) {
        return s + args[index++];
      });
    }
    else msg = inspect(msg);
    
    for (var i = index; i < args.length; i++) {
      msg += ' ' + inspect(args[i]);
    }
  
    var elem = document.getElementById('__testling_output');
    if (elem) {
      var span = document.createElement('span');
      var txt = document.createTextNode(msg + '\n');
      span.setAttribute('style', 'color: ' + color);
      span.appendChild(txt);
      elem.appendChild(span);
    }
    
    if (typeof original === 'function') {
      return original.apply(this, arguments);
    }
    else if (original) return original(arguments[0]);
  }
}

window.onerror = function (msg, url, line) {
  console.error(msg + '\n' + url + ':' + line);
}

if (typeof console === 'undefined') window.console = {};
console.log = proxy(console.log, 'black');
console.warn = proxy(console.warn, 'orange');
console.error = proxy(console.error, 'red');
