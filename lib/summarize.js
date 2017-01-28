var Promise = require('bluebird');

//var deviceTypes = [];

module.exports = function(param) {
  return gladys.deviceType.getByDevice({id: param.device})
  .then(function(deviceTypes) {
    sails.log.info('Teleinfo : Summarize index info for day ' + param.yesterday);
    // Get all the devicetypes for teleinfo device
    return Promise.map(deviceTypes, function(deviceType) {
      // Map each devicetype and watch if it's an index devicetype
      if(deviceType.tag.match(/^index/)) {
        // Get last day state for each index
        return gladys.deviceState.get({devicetype: deviceType.id, take: 86400})
        .then(function(data) {
          var usage = {deviceType: false, value: 0};
          for(var i = 0; i < deviceTypes.length; i++) {
            // Look for sum-index devicetype matching the index devicetype we are parsing, if so, we store it for next insertion in db
            if(deviceTypes[i].identifier ===  'sum-' + deviceType.identifier) usage.deviceType = deviceTypes[i].id;
          }

          // Does the index get states?
          if(data.length > 0) {
            y = new Date(param.yesterday);
            dayData = data.filter(function(val) {
              d = new Date(val.dateFormat);
              if(d.getDate() === y.getDate() && d.getMonth() === y.getMonth()) return val;
            });
            if (dayData.length > 0) {
              usage.value = parseInt(dayData[0].value) - parseInt(dayData[dayData.length-1].value);
            }
          }
          return Promise.resolve(usage);
        });
      } else {
        return Promise.resolve([]);
      }
    })
    .then(function(data) {
      return Promise.map(data, function(one) {
        if(one.deviceType) {
          return gladys.deviceState.create({devicetype: one.deviceType, value: one.value, datetime: param.yesterday});
        } else {
          return Promise.resolve();
        }
      });
    });
  });
};
