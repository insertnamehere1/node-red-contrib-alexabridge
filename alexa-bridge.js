var configuration = require('./config');
var http = require('http');
var ssdp = require("peer-ssdp");
var WebSocketServer = require('websocket').server;
var connectedLights;

// keep a count and store clients
var count = 0;
var clients = {};

module.exports = function(RED) {

    function AlexaBridge(config) {
        RED.nodes.createNode(this, config);

        var node = this;
        var ssdpPeer = ssdp.createPeer();
        var server = http.createServer(handleRequest);
        const PORT = config.port;

        // json containing list of connected lights
        connectedLights = {};
        connectedLights["lights"] = {};

        // handle ssdpPeer ready event.
        ssdpPeer.on("ready", function () {
            node.log("UPNP Discovery server listening on port 1900.");
        });

        // handle SSDP M-SEARCH messages.
        // param headers is JSON object containing the headers of the SSDP M-SEARCH message as key-value-pair.
        // param address is the socket address of the sender
        ssdpPeer.on("search", function (headers, address) {

            if (headers.ST && headers.MAN == '"ssdp:discover"') {
                ssdpPeer.reply({
                    NT: "urn:schemas-upnp-org:device:basic:1",
                    SERVER: "node.js/0.10.28 UPnP/1.1",
                    ST: "urn:schemas-upnp-org:device:basic:1",
                    USN: "uuid:Socket-1_0-221438K0100073::urn:Belkin:device:**",
                    LOCATION: "http://{{networkInterfaceAddress}}:" + PORT + "/description.xml"
                }, address);
            }
        });

        // Start ssdpPeer, when ready the `ready` event will be emitted.
        ssdpPeer.start();

        node.on('close', function() {
            ssdpPeer.close();
            server.close();
            sServer.close();
            wsServer.shutDown();
        });

        // Start the local server listening for connections
        server.listen(PORT, function () {
            node.log("UPNP Configuration server listening on: http://localhost:" + PORT);
        });

        var sServer = http.createServer(function(request, response) {});
        sServer.listen(8080, function() {
            node.log("WebSocket server listening on port 8080");
        });

        wsServer = new WebSocketServer({
            httpServer: sServer
        });

        wsServer.on('request', function(req) {
            // code here to run on connection
            var connection = req.accept('echo-protocol', req.origin);

            // Specific id for this client & increment count
            var id = count++;

            // Store the connection method so we can loop through & contact all clients
            clients[id] = connection;

            // Create event listener
            connection.on('message', function (message) {

                // The string message that was sent to us
                parseDevices(message.utf8Data);
            });

            connection.on('close', function () {
                delete clients[id];
            });

        });

    }
    RED.nodes.registerType("Alexa-Bridge",AlexaBridge);

    function parseDevices(configMessage) {
        var jsonDevices = JSON.parse(configMessage);

        if(jsonDevices.type = "lights")
            connectedLights["lights"][jsonDevices.uuid] = jsonDevices.data;
    }

    function handleRequest(request, response) {
        //node.log(request.method, request.url);
        var lightMatch = /^\/api\/(\w*)\/lights\/([\w\-]*)/.exec(request.url);

        if (lightMatch) {

            // request to turn light on or off
            if (request.method == 'PUT') {
                request.on('data', function (chunk) {
                    request.data = JSON.parse(chunk);
                });
                request.on('end', function () {

                    processRequestData(lightMatch[2], request.data);

                    response.writeHead(200, "OK", {'Content-Type': 'application/json'});
                    var responseStr = '[{"success":{"/lights/' + lightMatch[2] + '/state/on":' + JSON.stringify(request.data) + '}}]';

                    response.end(responseStr);
                });

            // request for individual light state
            } else {
                //node.log("Sending light ", lightMatch[2]);
                response.writeHead(200, {'Content-Type': 'application/json'});
                response.end(JSON.stringify(connectedLights.lights[lightMatch[2]]));
            }

        } else {

            // api request for configuration of lights connected to the bridge
            if (/^\/api/.exec(request.url)) {
                //node.log("Sending light details");
                response.writeHead(200, {'Content-Type': 'application/json'});
                response.end(JSON.stringify(connectedLights));

            // request for description.xml which is bridge configuration
            } else if (request.url == '/description.xml') {
                var setup = configuration.bridgeXml;
                response.writeHead(200, {'Content-Type': 'application/xml'});
                response.end(setup);
            }
        }
    }

    function processRequestData(light, requestData) {

        // update the connectedLights data
        if(requestData.hasOwnProperty('on')) {
            connectedLights.lights[light]["state"]["on"] = requestData.on;
        }

        if(requestData.hasOwnProperty('bri')) {
            connectedLights.lights[light]["state"]["bri"] = requestData.bri;
        }

        //return data
        var result = {};
        result["data"] = {};
        result["data"]["on"] = connectedLights.lights[light]["state"]["on"];
        result["data"]["bri"] = connectedLights.lights[light]["state"]["bri"];
        result["uuid"] = light;

        // send to all clients
        for(var i in clients){
            clients[i].sendUTF(JSON.stringify(result));
        }
    }
};
