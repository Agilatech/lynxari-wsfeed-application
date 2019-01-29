
const WebSocketServer = require('websocket').server;

module.exports = class Wsfeed {
	constructor(server, security, allowed, device) {

    this.server = server;
    this.security = security;
    this.allowed = allowed;
    this.device = device;
    this.protocol = 'wsfeed-protocol';

    if (this.security.usePlatformTLS) {
      this.createServer = require('https').createServer;
      this.secure = true;
    }
    else {
      this.createServer = require('http').createServer;
      this.secure = false;
    }

    this.connections = [];
    this.connCount = 0;

    this.createHttpServer();

    this.createWsServer();

		this.startObservers();
	}

	startObservers() {

		const peersDeviceQuery = this.server.from('*').where({name:this.device.name});
		const localDeviceQuery  = this.server.where({name:this.device.name});

		const self = this;

		this.server.observe([peersDeviceQuery], function(dev) {

			self.device.values.forEach(function(value, index) {

		    dev.streams[value].on('data', function(message) {
          self.sendMessage(value, message.data, message.timestamp);
        });
			});
		});

		this.server.observe([localDeviceQuery], function(dev) {

		  self.device.values.forEach(function(value, index) {

		    dev.streams[value].on('data', function(message) {
          self.sendMessage(value, message.data, message.timestamp);
        });
			});
		});
	}

  sendMessage(name, value, timestamp) {
    this.connections.forEach(function(connection) {
      if (connection.connected) {
        connection.sendUTF('{"' + name + '": ' + value + ', "timestamp": ' + timestamp + '}');
      }
    });
  }

  createHttpServer() {
    var options = {};

    if (this.secure) {
      options.key = this.server.httpServer.server.key;
      options.cert = this.server.httpServer.server.cert;
      options.ca = this.server.httpServer.server.ca;
    }

    this.httpServer = this.createServer(options, (request, response) => {
      // shunt any http requests away
      response.writeHead(404);
      response.end();
    }).on('clientError', (err) => {
      this.server.error(`Wsfeed client: ${err}`);
    }).on('error', (err) => {
      this.server.error(`Wsfeed http server: ${err}`);
    }).listen(this.device.port, () => {
      const proto = (this.secure) ? 'wss' : 'ws';
      this.server.info(`Wsfeed is ready to serve ${proto} stream for ${this.device.name} on port ${this.device.port}`);
    });
 
  }

  createWsServer() {

    // Don't like this, but there doesn't seem a way to catch certain TLSWrap errors
    process.on('uncaughtException', (err) => {
      this.server.error(`Uncaught process exception: ${err}`);
    });

    this.wsServer = new WebSocketServer({
      httpServer: this.httpServer,
      autoAcceptConnections: this.security.autoAccept
    });

    this.wsServer.on('error', (err) => {
      this.server.error(`Wsfeed socket: ${err}`);
    }).on('request', (request) => {

      request.on('error', (err) => {
        this.server.error(`Wsfeed websocket: ${err}`);
      });

      if (!this.originIsAllowed(request.remoteAddress)) {
        request.reject(403, "Not explicitly allowed by platform configuration");
        this.server.warn('Wsfeed connection from address ' + request.remoteAddress + ' rejected.');
        return;
      }
    
      if (!this.protocolIsAllowed(request.requestedProtocols)) {
        request.reject(412, "Protocol missing or unsupported");
        this.server.warn('Wsfeed request from ' + request.remoteAddress + ' : improper protocol.');
        return;
      }

      try {
        const connection = request.accept(this.protocol, request.origin);

        connection.on('error', (err) => {
          this.server.error(`Wsfeed connection: ${err}`);
        });

        this.connCount++;
        connection.countID = this.connCount;

        this.server.info('Wsfeed connection accepted for ' + request.remoteAddress);
        
        connection.on('close', (reasonCode, description) => {
          // find and remove the connection from the connections array
          this.connections.forEach((conn, index) => {
            if (conn.countID == connection.countID) {
              this.connections.splice(index, 1);
            }
          });
          this.server.info('Wsfeed peer ' + connection.remoteAddress + ' disconnected.');
        });

        this.connections.push(connection);
      }
      catch (err) {
        this.server.error(`Wsfeed connection: ${err}`);
      }
    });
  }

  originIsAllowed(origin) {

    // going with the presumption that only the localhost has an addr of '::1'
    if (origin === '::1') {
      return true;
    }

    var allowed = false;

    this.allowed.forEach((allow) => {
      if (origin.match(allow)) {
        allowed = true;
      }
    });

    return allowed;
  }

  protocolIsAllowed(protocols) {

    var allowed = false;

    protocols.forEach((protocol) => {
      if (this.protocol.match(protocol)) {
        allowed = true;
      }
    });

    return allowed;
  }

}
