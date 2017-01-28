var Promise = require('bluebird');

//var deviceTypes = [];

module.exports = function(param) {
  return gladys.deviceType.getByDevice({id: param.device})
  .then(function(deviceTypes) {
    // prepare an array of promises to purge data older than 15 days
    var promises = [];
    var days = 15;
    sails.log.info('Teleinfo : Purge data older than ' + days + ' days');
    for(var i = 0 ; i < deviceTypes.length; i++) {
      if(deviceTypes[i].tag.match(/^tomorrow|sum|isousc/)) {
        // We don't purge Color and Sum info, subscribed intensity
        continue;
      }
      // then we purge anything else
      promises.push(gladys.deviceState.purge({devicetype: deviceTypes[i].id, days: days}));
    }
    return Promise.all(promises);
  });
};
