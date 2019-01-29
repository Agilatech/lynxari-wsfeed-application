![Lynxari IoT Platform](https://agilatech.com/images/lynxari/lynxari200x60.png) **IoT Platform**
## Lynxari Websocket Feed Application

### Install
```
$> npm install @agilatech/lynxari-wsfeed-application
```
Install in the same directory in which lynxari is installed. Create a config.json file to suit.


### Purpose
The purpose of this application is to feed data from devices to a websocket. Remote clients which are allowed by the app configuration may connect to the websocket to receive the data feed. This provides a more direct method to get data while at the same time having such data data automatically pushed to the client.


### Usage
This application runs on the [Agilatech®](https://agilatech.com) Lynxari IoT platform.  As such, it is not applicable for other environments.

To use it with Lynxari, simply insert its object definition as an element in the apps array in the _applist.json_ file. On startup, the Lynxari server reads _applist.json_ and starts all applications found there.

A _config.json_ configuration file must be present in the module's main directory. For this module, that will be within the Lynxari home directory in _node\_modules/@agilatech/lynxari-wsfeed-application/config.json_


### Configuration
The _config.json_ file contains objects which define the security parameters, what hosts are allowed to connect, and the devices which are monitored.  A sample config file is provided to give an example.

First, the security object:
1. **autoAccept** : **true** | **false** Boolean setting whether or not to check validity of self-signed certificates. Always set this to false except for development testing.
2. **usePlatformTLS** : **true** | **false** Boolean setting whether or not to use the Lynxari TLS security, which includes the platform certificates. If set to true, then the initial connection will be via https, and the websocket will use the wss protocol.

Next is an array of allowed clients. If the hostname or IP address is not a member of the array, then it's request will be ignored. Only those clients whose domain or IP appear in the **allow** array will be served.

The devices array contains device definitions which will be served to Websocket receivers. 
1. **name** : The name of the device -- this is used to query the platform for a connected device of the name. The query will fail if the name is not found.
2. **port** : The unix port on the local host on which to listen for requests. By convention, ports in the 8000 range are typically used, but this can be any valid port number up to 65535.
3. **values** : An array of device values to served. A message will be sent for every new value for every device to every requestor.

Note that each device starts its own server, and listens on the given port. Devices may be duplicated with different ports.

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

### Client Websocket connection
A typical minimum client-side program might look like this:
```
<script>
    const wss = new WebSocket(`wss://localhost:8082`, 'wsfeed-protocol');

    wss.onmessage = function(evt) {
        console.log(`Received new wss data ${evt.data}`);
        const data = JSON.parse(evt.data);
        message.innerHTML = data.value;
    }
</script>    
```
Note that the Lynxari wsfeed app uses the protocol 'wsfeed-protocol'. This protocol string must be present in the websocket constructor.  If missing or different, the connection will be refused by the server.


### Certificate Authority trust issues
Unless the secure certificate loaded into Lynxari is signed by an industry trusted certificate authority contained in the Web broswer, a client-side Web program connecting to a wss websocket will likely fail.  To overcome this error, the signing authority certificate must be loaded into the browser and trusted. Different browsers have different mechanisms for doing this, and the top three are covered here:

#### Safari
macOS Utilities contains a Keychain Access program which handles all the certificates for the operating system. Safari uses this system-wide access rather than loading certificates into the browswer itself.
To load an Certificate Authority certificate in the Keychain Access:
1. Launch the Keychain Access program from the Applications->Utilities folder 
2. Click on the 'System' Keychain in the upper-left sidebar.
3. From the menu, select File->Import Items
4. In the file dropdown, navigate to your Certificate Authority certificate and click 'Oopen'
5. Since you are modifying the system keychain, the program will ask for your password.
6. Provide your password and click 'Modify Keychain'.
7. The CA certificate will now be saved in the system, but it is not trusted. (notice the red X)
8. Right-click on the CA entry with the red X, and select 'Get Info' from the drop-down.
9. In the pop-up window, there will be a collapsed list entitled 'Trust'. Click its arrow to expand.
10. Select as many of the items to turst, but at a minimum, select the option 'Always Trust' for Secure Sockets Layet (SSL).
11. Close the window, and you will again be asked for your password due to making changes to the System Certificate Trust Settings.
12. Provide your password and click 'Update Settings'. The CA certificate entry should now show a blue X next to it.
13. Safari will now trust the CA certificate, and thereby allow the server certificate to be used for TLS https communications.
 
#### Google Chrome
On a Mac, Google Chrome accesses the system keychain, so the above instructions for Safari also apply when running Chrome on macOS.
On other systems:
1. Open Preferences
2. Scroll to bottom, expand 'Advanced'
3. In 'Privacy and Security' section, find 'Manage Certificates', and click on 'Manage HTTPS/SSL certificates and settings'.
4. Follow the instructions for your OS.

#### Firefox
1. Open Preferences
2. Select 'Privacy & Security' on the sidebar
3. Scoll down to bottom, to the 'Certificates' section
4. Click the 'View Certificates' button -- this will bring up a 'Certificate Manager' dialog box
5. Select 'Authorities' tab
6. Press 'Import' buttom at the bottom of the dialog box
7. Navigate the filesystem dialog to your signing authority CA certificate and click 'Open'
8. A dialog box asks how this certificate shall be trusted, select 'Trust this CA to identify websites." and select 'OK'
9. Now select 'OK' to close the 'Certificate Manager' dialog box.


### Copyright
Copyright © 2018-2019 [Agilatech®](https://agilatech.com). All Rights Reserved.

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
