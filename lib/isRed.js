var Promise = require('bluebird');
var colors = require('./colors.js');


module.exports = function(port, delay, historic){
    
    // set hour at 6am so we'll check if color information has been received before 6 am 
    // we should get valye before 12pm the day before but in case we missed it
    var now = new Date().setHours(6);

    return gladys.deviceType.getByDevice({deviceService: 'teleinfo', deviceIdentifier: 'teleinfo', deviceTypeIdentifier: 'tomorrow'})
    .then(function(deviceType) {
      return gladys.deviceType.getById({id:deviceType.id});
    })
    .then(function(deviceType) {
      if(deviceType.value === colos['ROUG'].value && deviceType.lastChanged <= now) {
        return false;
      } else {

  });
}

