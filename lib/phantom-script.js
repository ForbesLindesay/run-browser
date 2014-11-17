var webserver = require('webserver');

var server = webserver.create();

server.listen(8081, function(request, response) {
  response.statusCode = 200;
  var coverage = page.evaluate(function(){
    return window.__coverage__;
  });
  response.setHeader('Content-Type', 'application/json');
  response.write(JSON.stringify(coverage));
  response.close();
});

var page = new WebPage();
var args = require('system').args;

page.onConsoleMessage = function (msg) {
  console.log(msg);
};

page.open(args[1], function (status) {});


