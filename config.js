
    var bridgeXml = ['<?xml version="1.0" encoding="UTF-8"?>',
        '<root xmlns="urn:schemas-upnp-org:device-1-0">',
            '<specVersion>',
                '<major>1</major>',
                '<minor>0</minor>',
            '</specVersion>',
            '<URLBase>http://192.168.1.128:8082/</URLBase>',
            '<device>',
                '<deviceType>urn:schemas-upnp-org:device:Basic:1</deviceType>',
                '<friendlyName>Node-Red-Alexa-Bridge (192.168.1.128)</friendlyName>',
                '<manufacturer>Royal Philips Electronics</manufacturer>',
                '<manufacturerURL>http://www.philips.com</manufacturerURL>',
                '<modelDescription>Hue Emulator for Node Red</modelDescription>',
                '<modelName>Philips hue bridge 2015</modelName>',
                '<modelNumber>BSB002</modelNumber>',
                '<modelURL>http://www.meethue.com</modelURL>',
                '<serialNumber>12345</serialNumber>',
                '<UDN>uuid:88f6698f-2c83-4393-bd03-cd54a9f8595</UDN>',
                '<serviceList>',
                    '<service>',
                        '<serviceType>(null)</serviceType>',
                        '<serviceId>(null)</serviceId>',
                        '<controlURL>(null)</controlURL>',
                        '<eventSubURL>(null)</eventSubURL>',
                        '<SCPDURL>(null)</SCPDURL>',
                    '</service>',
                '</serviceList>',
                '<presentationURL>index.html</presentationURL>',
                '<iconList>',
                    '<icon>',
                        '<mimetype>image/png</mimetype>',
                        '<height>48</height>',
                        '<width>48</width>',
                        '<depth>24</depth>',
                        '<url>hue_logo_0.png</url>',
                    '</icon>',
                    '<icon>',
                        '<mimetype>image/png</mimetype>',
                        '<height>120</height>',
                        '<width>120</width>',
                        '<depth>24</depth>',
                        '<url>hue_logo_3.png</url>',
                    '</icon>',
                '</iconList>',
            '</device>',
        '</root>'].join("\n");

    var lightsJson = {
        "lights": { "idnumber1234":
        {
            "state":
            {
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
            "name": "test 1 light",
            "modelid": "LCT001",
            "manufacturername": "Philips",
            "uniqueid": "5102d46c-50d5-4bc7-a180-38623e4bbb08",
            "swversion": "65003148",
            "pointsymbol":
            {
                "1": "none",
                "2": "none",
                "3": "none",
                "4": "none",
                "5": "none",
                "6": "none",
                "7": "none",
                "8": "none"
            }
        },
        "idnumber9876":
        {
            "state":
            {"on": false,
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
            "name": "test 2 light",
            "modelid": "LCT001",
            "manufacturername": "Philips",
            "uniqueid": "69d4f390-9bef-468b-b58e-4495027ff33c",
            "swversion": "65003148",
            "pointsymbol":
            {"1": "none",
                "2": "none",
                "3": "none",
                "4": "none",
                "5": "none",
                "6": "none",
                "7": "none",
                "8": "none"}
        }
    }
    };

exports.bridgeXml = bridgeXml;
exports.lightsJson = lightsJson;
