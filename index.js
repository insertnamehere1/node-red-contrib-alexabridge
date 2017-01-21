var fs = require('fs');
var http = require('http');
var ssdp = require("peer-ssdp");
var ssdpPeer = ssdp.createPeer();

// handle ssdpPeer ready event.
ssdpPeer.on("ready",function(){
    console.log("UPNP server listening on port 1900.");
});

// handle ssdpPeer close event. This event will be emitted after `ssdpPeer.close()` is called.
ssdpPeer.on("close",function(){
    console.log("UPNP server Closing.");
});

// handle SSDP M-SEARCH messages.
// param headers is JSON object containing the headers of the SSDP M-SEARCH message as key-value-pair.
// param address is the socket address of the sender
ssdpPeer.on("search",function(headers, address){

    console.log("SEARCH:",headers,address);

    if (headers.ST && headers.MAN=='"ssdp:discover"') {
        ssdpPeer.reply({
            NT: "urn:schemas-upnp-org:device:basic:1",
            SERVER: "node.js/0.10.28 UPnP/1.1",
            ST: "urn:schemas-upnp-org:device:basic:1",
            USN: "uuid:Socket-1_0-221438K0100073::urn:Belkin:device:**",
            LOCATION: "http://{{networkInterfaceAddress}}:8082/description.xml"
        }, address);
    }
});

// Start ssdpPeer, when ready the `ready` event will be emitted.
ssdpPeer.start();

// load the file containing connected devices list
var connectedDevices = JSON.parse(fs.readFileSync('lights.json'));

const PORT=8082;

function handleRequest(request, response){

    console.log(request.method, request.url);

    var lightMatch = /^\/api\/(\w*)\/lights\/([\w\-]*)/.exec(request.url);

    if (lightMatch) {

        // request to turn light on or off
        if (request.method == 'PUT') {
            request.on('data', function(chunk) {
                console.log("Received PUT data:",chunk.toString());
                request.data = JSON.parse(chunk);
            });
            request.on('end', function() {
                response.writeHead(200, "OK", {'Content-Type': 'application/json'});
                var responseStr='[{"success":{"/lights/'+lightMatch[2]+'/state/on":'+request.data.on+'}}]';
                console.log("Sending response:",responseStr);
                response.end(responseStr);
            });

        // request for individual light state
        } else {
            console.log("Sending light ", lightMatch[2]);
            response.writeHead(200, {'Content-Type': 'application/json'});
            response.end(JSON.stringify(connectedDevices.lights[lightMatch[2]]));
        }

    } else {

        // api request for configuration of lights connected to the bridge
        if (/^\/api/.exec(request.url)) {
            console.log("Sending lights.json");
            response.writeHead(200, {'Content-Type': 'application/json'});
            response.end(JSON.stringify(connectedDevices));

        // request for description.xml which is bridge configuration
        } else if (request.url == '/description.xml') {
            var setup = fs.readFileSync('bridgeConfig.xml');
            console.log("Sending bridgeConfig.xml");
            response.writeHead(200, {'Content-Type': 'application/xml'});
            response.end(setup);
        }
    }
}

var server = http.createServer(handleRequest);

// Start the local server listening for connections
server.listen(PORT, function(){
    console.log("Hue Bridge listening on: http://localhost:%s", PORT);
});
