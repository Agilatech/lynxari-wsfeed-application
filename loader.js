module.exports = function(server) {
  
  const config = require('./config');
  const wsfeed = require('./wsfeed');

  var fileDevice = {};

  config.devices.forEach(function(device) {
  	fileDevice[device.name] = new wsfeed(server, config.security, config.allow, device);    
  });
  
}
