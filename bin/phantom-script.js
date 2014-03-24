var page = new WebPage();
var args = require('system').args;

page.onConsoleMessage = function (msg) {
    console.log(msg);

    if (msg === '# ok' || msg.substr(0, 6) === '# fail') {
        phantom.exit(msg === '# ok' ? 0 : 63);
    }
};

page.open(args[1], function (status) {});
