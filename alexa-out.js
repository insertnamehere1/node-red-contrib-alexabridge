var http = require('http');
var WebSocketClient = require("websocket").client;
var sha1 = require('sha1');
var WEBSOCKET_SERVER = "ws://localhost:8080/";

module.exports = function(RED) {

    function AlexaOut(config) {
        RED.nodes.createNode(this, config);

        var node = this;
        var hash = sha1(config.alexa_recognised_name);

        node.server = RED.nodes.getNode(config.server);

        if(!this.server)
            RED.log.err("Failed to aquire server for Alexa Out.");

        var message = getDescription(config.alexa_recognised_name, hash);

        var client = new WebSocketClient();

        client.on('connectFailed', function(error) {
            node.log('Connect Error: ' + error.toString());
        });

        client.on('connect', function(connection) {
            connection.on('error', function(error) {
                node.log("Connection Error: " + error.toString());
            });

            connection.on('message', function(message) {
                if (message.type === 'utf8') {

                    jsonMessage = JSON.parse(message.utf8Data);

                    if(jsonMessage.uuid === hash) {

                        var msg = {
                            topic: config.topic ? config.topic : '',
                            payload: jsonMessage["data"]
                        };
                        node.send(msg);
                    }
                }
            });

            function sendMessage() {
                if (connection.connected) {
                    connection.sendUTF(JSON.stringify(message));
                }
            }
            sendMessage();
        });
        client.connect(WEBSOCKET_SERVER, 'echo-protocol');
    }

    function getDescription(name, hash) {
        return {
            "uuid": hash,
            "type": "lights",
            "data": {
                "state": {
                    "on": true,
                    "bri": 254,
                    "hue": 15823,
                    "sat": 88,
                    "effect": "none",
                    "ct": 313,
                    "alert": "none",
                    "colormode": "ct",
                    "reachable": true,
                    "xy": [0.4255, 0.3998]
                },
                "type": "Extended color light",
                "name": name,
                "modelid": "LCT001",
                "manufacturername": "Philips",
                "uniqueid": hash,
                "swversion": "65003148",
                "pointsymbol": {
                    "1": "none",
                    "2": "none",
                    "3": "none",
                    "4": "none",
                    "5": "none",
                    "6": "none",
                    "7": "none",
                    "8": "none"
                }
            }
        };
    }

    RED.nodes.registerType("Alexa-Out", AlexaOut);
};