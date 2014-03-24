var phantomjs = require('phantomjs');
var path = require('path');
var execFile = require('child_process').execFile;

module.exports = runPhantom;

function runPhantom(port, cb) {
    execFile(phantomjs.path, [
        path.join(__dirname, 'phantom-script.js'),
        'http://localhost:' + port + '/',
        '--debug=true'
    ], cb);
}
