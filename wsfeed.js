var http = require('http');
const WebSocketServer = require('websocket').server;

module.exports = class Wsfeed {
	
	constructor(server, security, allowed, device) {

    this.server = server;
    this.security = security;
    this.allowed = allowed;
    this.device = device;

    this.connections = [];

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
    this.httpServer = http.createServer(function(request, response) {
      // shunt any http requests away
      response.writeHead(404);
      response.end();
    });

    var self = this;
    this.httpServer.listen(this.device.port, function() {
      self.server.info('Wsfeed is ready to serve stream on port ' + self.device.port);
    });
  }

  createWsServer() {
    var self = this;

    this.wsServer = new WebSocketServer({
      httpServer: this.httpServer,
      autoAcceptConnections: this.security.autoAccept
    });

    this.wsServer.on('request', function(request) {

      if (!self.originIsAllowed(request.remoteAddress)) {
        request.reject(403, "Not explicitly allowed by platform configuration");
        self.server.warn('Wsfeed connection from address ' + request.remoteAddress + ' rejected.');
        return;
      }
    
      var connection = request.accept('wsfeed-protocol', request.origin);
      
      self.server.info('Wsfeed connection accepted for ' + request.remoteAddress);

      connection.on('close', function(reasonCode, description) {
        self.server.info('Wsfeed peer ' + connection.remoteAddress + ' disconnected.');
      });

      // TODO: In theory, the connections array could grow uncontrollably and produce 
      // a kind of memory leak if many connections are requested then closed.
      // Think about providing a way to delete connections once they're closed

      self.connections.push(connection);

    });
  }

  originIsAllowed(origin) {

    // going with the presumption that only the localhost has an addr of '::1'
    if (origin === '::1') {
      return true;
    }
    
    var allowable = false;

    this.allowed.forEach(function(allow) {
      if (origin.match(allow)) {
        allowable = true;
      }
    });

    return allowable;
  }

}
