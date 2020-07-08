var express = require('express'); // Get the module
var moment = require('moment');
var app = express();
var http = require('http').Server(app);
var https = require('https');
var fs = require('fs');
var lastModified = null;
const BinaryPath = '/Users/orencollaco/esp32-vscode-workspace/esp32-ledcontroller/build/app-template.bin';

var options = {
    key: fs.readFileSync('ca_key.pem'),
    cert: fs.readFileSync('ca_cert.pem')
};

app.use(express.static('public'));

app.get('/app-template.bin', function (request, result) {
    console.log('Updated binary requested...');
    checkIfModified(function (res) {
        if (res) {
            console.log('Updated binary available')
            result.status(200);
            result.sendFile(BinaryPath);
        } else {
            console.log('Binary is unchanged');
            result.redirect();
        }
    });
});

var IsFirstTime = true;

function checkIfModified(callback) {
    if(IsFirstTime){
        IsFirstTime = false;
        return callback(true);
    }
    var res;
    fs.open(BinaryPath, 'r', (err, fd) => {
        if (err) throw err;
        fs.stat(BinaryPath, function (err, data) {
            if (err) throw err;
            //console.log('check if file/folder last modified date, was it after my last check ');
            if (lastModified == null) {
                lastModified = data.mtime.toISOString();
            }
            //I use moment module to compare dates
            let previousLMM = moment(lastModified);
            console.log(previousLMM);
            let folderLMM = moment(data.mtime.toISOString());
            console.log(folderLMM);
            res = !(folderLMM.isSame(previousLMM, 'second')); //seconds granularity
            lastModified = data.mtime.toISOString();
            fs.close(fd, function () {
                if (err) throw err;
                console.log(res);
                return callback(res);
            });
        });
    });
}

http.listen(8080, function () {
    console.log('listening on *:80');
});

https.createServer(options, app).listen(443, function () {
    console.log('listening on *:443');
});