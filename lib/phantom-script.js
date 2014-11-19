var webserver = require('webserver');
var args = require('system').args;

var url = args[1];
var port = args[2] || 8080;

var server = webserver.create();

server.listen(port, function(request, response) {
  response.statusCode = 200;
  var coverage = page.evaluate(function(){
    return window.__coverage__;
  });
  response.setHeader('Content-Type', 'application/json');
  response.write(JSON.stringify(coverage || {}));
  response.close();
});


var page = new WebPage();

page.onConsoleMessage = function (msg) {
  console.log(msg);
};

page.open(url, function (status) {});
