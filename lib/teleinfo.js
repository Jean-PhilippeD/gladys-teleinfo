var Promise = require('bluebird');
var tty = require('./tty.js');
var buffer = require('./buffer.js');
var shared = require('./shared.js');

module.exports = function(port, delay, historic){
  delay = typeof delay !== 'undefined' ? delay : 15000;
  historic = typeof historic !== 'undefined' ? historic : 365;
  return new Promise(function(resolve, reject){

    if(!port) reject(new Error('NoDevTTYProvided'));

    var deviceType = {};

    gladys.device.getByIdentifier({identifier: 'teleinfo', service: 'teleinfo'})
    .then(function(device) {
      return [gladys.deviceType.getByDevice(device), device.id];
    })
    .spread(function(deviceTypes, device) {
      for(var i = 0; i < deviceTypes.length; i++) {
        deviceType[deviceTypes[i].identifier] = {
          id: deviceTypes[i].id,
          lastValue: deviceTypes[i].lastValue
        }
      }
      return [device, deviceType, gladys.param.getValue(shared.paramContract.name)];
    })
    .spread(function(device, deviceType, contract) {
      return [device, deviceType, contract, gladys.deviceState.get({devicetype: deviceType.isousc.id})];
    })
    .spread(function(device, deviceType, contract, isousc) {
      if(isousc.length > 0) {
        isousc = isousc[0].value;
      } else {
        isousc = false;
      }
      return [device, deviceType, contract, isousc, gladys.deviceState.get({devicetype: deviceType.tomorrow.id})];
    })
    .spread(function(device, deviceType, contract, isousc, tomorrow) {
      if(tomorrow.length > 0) {
        tomorrow = {
          value: tomorrow[0].value,
          date: new Date(tomorrow[0].dateFormat).setHours(0,0,0,0)
        }
      } else {
        tomorrow = {value: false, date: false};
      }

      var trameEvents = tty(port);
      var teleinfo = new buffer.Teleinfo({delay: delay, historic: historic, device: device, isousc: isousc, contract: contract, tomorrow: tomorrow}, deviceType);

      trameEvents.on('error', function (data) {
        sails.log.warn(data);
      });

      trameEvents.on('tramedecodee', function(data) {
        // Work on data
        teleinfo.parse(data);

      });
    })
    .catch(function(err) {
      sails.log.warn('Buffer : An error occured during module installation which prevent data parsing.');
      sails.log.warn(err);
    });
  });
}

