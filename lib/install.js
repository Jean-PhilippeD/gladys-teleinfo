var Promise = require('bluebird');
var box = require('./boxContent.js');
var shared = require('./shared.js');

module.exports = function() {
  var boxType = {
    uuid: 'a9d1a72e-5add-47be-aeb3-2760ab2ce633',
    title: 'Conso EDF',
    ngcontroller: 'teleinfoCtrl as vm',
    html: box.html,
    footer: box.footer,
    icon: 'fa fa-flash',
    type: 'box box-primary',
    view: 'dashboard'
  }

  var state = {
    uuid: '04a2565d-a0e1-40f8-a227-f1b45c27d9b7',
    name: "Edf Tarif Rouge",
    description: "Si le tarif EDF Tempo rouge n'est pas en cours",
    service: "teleinfo",
    function: "isNotRed",
  }
   
  // Create the box type
  gladys.boxType.create(boxType)
  .then(function() {
    return gladys.device.create({device: shared.device, types: shared.deviceTypes});
  })
  .then(function() {
    return gladys.param.setValue(shared.paramContract);
  })
  .then(function() {
    return gladys.stateType.create(state);
  })
  .then(function() {
    sails.log.info('Teleinfo : Module installed');
    return new Promise.resolve();
  })
  .catch(function(err) {
    sails.log.warn('Teleinfo : Failed to install module');
    sails.log.warn(err);
  });
}

