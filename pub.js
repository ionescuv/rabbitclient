
var AMQP_SERVICE = "amqp";

// Bring in the module providing the wrapper for cf env
var cfenvWr = require('./cfenv-wrapper');
// http server
var http = require('http');

// SetUp

// get the cloud foundry environment variables
var appEnv = cfenvWr.getAppEnv();
var port = appEnv.port;
var appURL = appEnv.url;

var amqpURL = appEnv.getServiceURL('amqp');

console.log('found URL: %s', amqpURL);
console.log('running on port %s', port);
console.log('running service URL: %s', appURL);



// Rabbit MQ setup
var connOpt = {};
var pub = {};
var context = require('rabbit.js').createContext(amqpURL, connOpt);

context.on('ready', function() {
    console.log('Connected to the Rabbit!');
    pub = context.socket('PUB');
    pub.connect('messages', function(){
        console.log('PUBLISHER connected to topic [messages]');
    });
});

context.on('error', function(error){
    console.log('Some error while trying to connect to the Rabbit. %s', error);
});

context.on('close', function(error){
    console.log('connection closed');
});


// HTTP Server -- Start

var server = http.createServer(function (request, response) {
    console.log('Broadcasting path <%s> across messaging queue...', request.url);
    if (pub) {
        pub.write(request.url, 'utf8');
        console.log("----  MSG sent: < %s >", request.url);
    }
    else
        console.log('publisher not yet initialized');
    response.end('It Works!! Path Hit: ' + request.url);
});

server.listen(port, function(){
    //Callback triggered when server is successfully listening. Hurray!
    console.log("Server listening on: %s", appURL);
});
