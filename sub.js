
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


// HTTP Server -- Start

var server = http.createServer(function (request, response) {
    response.end('Hello World');
});

server.listen(port, function(){
    //Callback triggered when server is successfully listening. Hurray!
    console.log("Server listening on: %s", appURL);
});


// Rabbit MQ setup
var connOpt = {};
var context = require('rabbit.js').createContext(amqpURL, connOpt);

context.on('ready', function() {
    console.log('Connected to the Rabbit!');
    var sub = context.socket('SUB');
    //sub.pipe(process.stdout);
    sub.connect('messages', function(){
        console.log('Connected to topic [messages]');
        sub.setEncoding('utf8');
        sub.on('data', function(note) { console.log("[INSTANCE #%s]----  MSG received: < %s >", appEnv.app.instance_index ,note); });
    });
});

context.on('error', function(error){
    console.log('Some error while trying to connect to the Rabbit. %s', error);
});

context.on('close', function(error){
    console.log('connection closed');
});


