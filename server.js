var fs = require('fs');
var express = require('express');
var https = require('https');
var key = fs.readFileSync('./key.pem');
var cert = fs.readFileSync('./cert.pem')
var https_options = {
    key: key,
    cert: cert
};
var PORT = 8000;
var HOST = 'localhost';
app = express();

app.configure(function(){
    app.use(app.router);
});

server = https.createServer(https_options, app).listen(PORT, HOST);
console.log('HTTPS Server listening on %s:%s', HOST, PORT);


// routes
app.get('/hey', function(req, res) {
    res.send('HEY!');
});
app.post('/ho', function(req, res) {
    res.send('HO!');
});


var PORT = 8000;
var HOST = 'localhost';
var tls = require('tls');
var fs = require('fs');

var options = { ca: [ fs.readFileSync('./cert.pem') ] };
var client = tls.connect(PORT, HOST, options, function() {
    if (client.authorized) {

        console.log('CONNECTED AND AUTHORIZED\n');

        client.on('close', function() {
            console.log('SOCKET CLOSED\n');
            process.exit();
        });

        process.stdin.pipe(client);
        process.stdin.resume();

        // Time to make some request to the server
        // We will write straight to the socket, but recommended way is to use a client library like 'request' or 'superagent'
        client.write('GET /hey HTTP/1.1\r\n');
        client.write('\r\n');

        client.write('POST /ho HTTP/1.1\r\n');
        client.write('\r\n');

    }
    else {
        console.log('AUTH FAILED\n');
        process.exit();
    }
});
client.setEncoding('utf8');
client.on('data', function(data) {
    console.log('-------------');
    console.log(data);
});