var page = new WebPage();
var args = require('system').args;

page.onConsoleMessage = function (msg) {
  console.log(msg);
};

page.open(args[1], function (status) {});
