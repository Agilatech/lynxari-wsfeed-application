![Lynxari IoT Platform](https://agilatech.com/images/lynxari/lynxari200x60.png) **IoT Platform**
## Lynxari WSFeed Application

### Install
```
$> npm install @agilatech/lynxari-wsfeed-application
```
Install in the same directory in which lynxari is installed. Create a config.json file to suit.


### Purpose
The purpose of this application is to create a Websocket for allowed servers to connect to and receive data from devices.


### Usage
This application runs on the [Agilatech®](https://agilatech.com) Lynxari IoT platform.  As such, it is not applicable for other environments.

To use it with Lynxari, simply insert its object definition as an element in the apps array in the _applist.json_ file. On startup, the Lynxari server reads _applist.json_ and starts all applications found there.

A _config.json_ configuration file must be present in the module's main directory. For this module, that will be within the Lynxari home directory in _node\_modules/@agilatech/lynxari-wsfeed-application/config.json_


### Configuration
The _config.json_ file contains objects which define the security parameters, what hosts are allowed to connect, and the devices which are monitored. 

First, the security object:
1. **autoAccept** : **true** | **false** Boolean setting whether or not to check validity of self-signed certificates. Always set this to false except for development testing.
2. **usePlatformTLS** : **true** | **false** Boolean setting whether or not to use the Lynxari TLS security, including passwords and signing authority.

Next is an array of allowed hosts. If the hostname or IP address is not a member of the array, then it's request will be ignored. Only those hosts which appear in the **allow** array will be served.

The devices array contains device definitions which will be served to Websocket receivers. 
1. **name** : The name of the device -- this is used to query the platform for a connected device of the name. The query will fail if the name is not found.
2. **port** : The unix port on the local host on which to listen for requests. By convention, ports in the 8000 range are typically used, but this can be any valid port number up to 65535.
3. **values** : An array of device values to served. A message will be sent for every new value for every device to every requestor.

Note that each device starts its own server, and listens on the given port. 

There is no limit to the number of device objects which may appear in the **devices** array. The config.json file must be valid JSON.

A sample config file:
```
{
    "security": {
        "autoAccept": false,
        "usePlatformTLS": false
    },
    "allow": [
        "192.168.44.100",
        "192.168.44.155",
        "agilatech.com",
        "10.0.248.*"
    ],
    "devices": [
        {
            "name": "VL6180",
            "port": 8082,
            "values": ["range"]
        },
        {
            "name": "MPU9250",
            "port": 8084,
            "values": ["accelx", "accely", "accelz"]
        }
    ]
}
```

### Copyright
Copyright © 2018 [Agilatech®](https://agilatech.com). All Rights Reserved.

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
