# run-browser

The simplest way to run testling type tests in the browser

[![Dependency Status](https://gemnasium.com/ForbesLindesay/run-browser.png)](https://gemnasium.com/ForbesLindesay/run-browser)
[![NPM version](https://badge.fury.io/js/run-browser.png)](http://badge.fury.io/js/run-browser)

## Installation

    npm install run-browser -g


## Usage

    run-browser tests/test.js

## API Usage

Basic usage:

```js
var runBrowser = require('run-browser');

var server = runBrowser('tests/test.js');
server.listen(3000);
```

Advanced Usage:

```js
var runBrowser = require('run-browser');

var handler = runBrowser.createHandler('tests/test.js');
var server = http.createServer(function (req, res) {
  if (runBrowser.handles(req)) {
    return handler(req, res);
  }
  // any other server logic here
});
server.listen(3000);
```


## License

  MIT