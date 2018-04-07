var Promise = require('bluebird');

module.exports = function(sails) {

    var setup = require('./lib/setup.js');
    var initialize = require('./lib/initialize.js');
    var teleinfo = require('./lib/teleinfo.js');
    var buffer = require('./lib/buffer.js');

    gladys.on('ready', function(){
      var object = {
        getTTY: gladys.param.getValue('TELEINFO_TTY'),
        getDelay: gladys.param.getValue('TELEINFO_DELAY'),
        getHistoric: gladys.param.getValue('TELEINFO_HISTORIC')
      }

      Promise.props(Object.keys(object).reduce(function(newObject, key) {
        newObject[key] = object[key].reflect();
        return newObject;
      }, {})).then(function(object) {
        if (object.getTTY.isFulfilled()) var tty = object.getTTY.value();
        if (object.getDelay.isFulfilled()) var delay = object.getDelay.value();
        if (object.getHistoric.isFulfilled()) var historic = object.getHistoric.value();
        teleinfo(tty, delay, historic);
      });

    });

    return {
      setup: setup,
      initialize: initialize,
      isNotRed: buffer.isNotRed
    };
};
