var Promise = require('bluebird');

//var deviceTypes = [];

module.exports = function(param) {
  return gladys.eventType.getByCategory({category: 'device'})
  .then((eventtypes) => {
    return [eventtypes[0].id, gladys.deviceType.getByDevice({id: param.device})];
  })
  .spread((eventtype, deviceTypes) => {
    // prepare an array of promises to purge data older than 15 days
    var promises = [];
    var stateDays = 15;
    var eventDays = 1;
    sails.log.info('Teleinfo : Purge state data older than ' + stateDays + ' days and event data older than ' + eventDays + ' days.');
    for(var i = 0 ; i < deviceTypes.length; i++) {
      if(deviceTypes[i].tag.match(/^tomorrow|sum|isousc/)) {
        // We don't purge Color and Sum info, subscribed intensity
        continue;
      }
      // then we purge anything else
      promises.push(gladys.deviceState.purge({devicetype: deviceTypes[i].id, days: stateDays}));
      promises.push(gladys.event.purge({eventtype: eventtype, value: deviceTypes[i].id, days: eventDays}));
    }
    return Promise.all(promises);
  });
};
