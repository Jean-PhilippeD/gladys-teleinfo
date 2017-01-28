var Promise = require('bluebird');
var summarize = require('./summarize.js');
var shared = require('./shared.js');
var colors = require('./colors.js');
var purge = require('./purge.js');

var buffer = {
  papp: [],
  iinst: [],
  index: {},
  ptec: false,
  tomorrow: {date: false, value: false},
  contract: shared.paramContract,
  intensity: false,
  colorOfCurrentDay: false
};

var now = false;

var Teleinfo = function(init, types) {
  this._init = init;
  this._types = types;
  buffer.contract.value = this._init.contract;
  buffer.isousc = this._init.isousc;
  buffer.tomorrow = this._init.tomorrow;
  buffer.date = new Date();
  buffer.timestamp = buffer.date.getTime();
};

var isNotRed = function() {
  if(buffer.colorOfCurrentDay === 6) return Promise.reject('Teleinfo condition not verified: red is active now');
  return Promise.resolve();
};


module.exports = {
  Teleinfo: Teleinfo,
  isNotRed: isNotRed
};

//a= new Date("2017-01-27");
//b = new Date("2017-01-26");

Teleinfo.prototype.parse = function(packet) {

  var self = this;
  now = new Date();

  if(now.getDate() !== buffer.date.getDate()) {
  //if(a.getDate() !== b.getDate()) {
    // It means the day has changed
    var tmpDate = buffer.date;
    //var tmpDate = b;
    buffer.date = now; // change date before processing cause it's too long
    //b = a;
    buffer.colorOfCurrentDay = buffer.tomorrow.value; // store the new color of day

    purge({device: self._init.device})
    .then(function() {
      return summarize({device: self._init.device, yesterday: tmpDate, today: now});
    })
    //summarize({device: self._init.device, yesterday: tmpDate, today: a})
    .catch(function() {
      sails.log.warn('Teleinfo : Failed to summarize');
    });
  }

  ptec = packet.PTEC; // current tarification
  if(packet.PTEC) buffer.index[ptec] = packet[colors.index[ptec].label]; // store value corresponding to the tarification
  if(packet.PAPP) buffer.papp.push(packet.PAPP); // push apparent power in array so we'll be able to count the median
  if(packet.IINST) buffer.iinst.push(packet.IINST); // push max instansity in array so we'll be able to get the max in the period

  if (now.getTime() > buffer.timestamp + self._init.delay) {
    var promises = [
      gladys.deviceState.create({devicetype: self._types.iinst.id, value: Math.max(...buffer.iinst)}).reflect(),
      gladys.deviceState.create({devicetype: self._types.papp.id, value: buffer.papp.map((c, i, arr) => c / arr.length).reduce((p, c) => c + p).toFixed(2)}).reflect()
    ];
    // add devicetsate create for contract if buffer is updated with new contract id
    if(!packet.ADCO.match(new RegExp(buffer.contract.value, "g"))) {
      buffer.contract.value = parseInt(packet.ADCO);
      promises.push(gladys.param.setValue(buffer.contract).reflect());
      gladys.socket.emit('newTeleinfoValue', [
        {identifier: 'contract', value: buffer.contract.value}
      ]);
    }


    if((buffer.isousc && buffer.isousc !== packet.ISOUSC) || (!buffer.isousc)) {
      buffer.isousc = packet.ISOUSC;
      promises.push(gladys.deviceState.create({devicetype: self._types.isousc.id, value: buffer.isousc}).reflect());
      gladys.socket.emit('newTeleinfoValue', [
        {identifier: 'isousc', value: buffer.isousc}
      ]);
    }

    // broadcast news to everyone
    gladys.socket.emit('newTeleinfoValue', [
      {identifier: 'iinst', value: Math.max(...buffer.iinst)},
      {identifier: 'ptec', value: packet[colors.index[ptec].label]},
      {identifier: 'papp', value: buffer.papp.map((c, i, arr) => c / arr.length).reduce((p, c) => c + p).toFixed(2)}
    ]);


    if ((!buffer.ptec && self._types.ptec.lastValue !== colors.index[ptec].value) || buffer.ptec !== colors.index[ptec].value) {
      // Ptec has hanged since last record -> update it
      buffer.ptec = colors.index[ptec].value;
      promises.push(gladys.deviceState.create({devicetype: self._types.ptec.id, value: buffer.ptec}).reflect());
    }

    if (packet.DEMAIN !== '----' &&  ((now.getHours() > 20 && buffer.tomorrow.date < now.setHours(0,0,0,0)) || !buffer.tomorrow.date)) {
      // Color of tomorrow has changed since last record -> update it
      buffer.tomorrow = {
        value: colors.tempo[packet.DEMAIN].value,
        date: now.setHours(0,0,0,0)
      };
      promises.push(gladys.deviceState.create({devicetype: self._types.tomorrow.id, value: buffer.tomorrow.value}).reflect())
      gladys.socket.emit('newTeleinfoValue', [
        {identifier: 'tomorrow', value: buffer.tomorrow.value}
      ]);
    }


    for (var key in buffer.index) {
      if (buffer.index.hasOwnProperty(key)) {
        if(self._types[key]) {
          promises.push(gladys.deviceState.create({devicetype: self._types[key].id, value: buffer.index[key]}).reflect());
        } else {
          var deviceTypeIndex = {
            name: 'Teleinfo Index ' + key,
            type: 'teleinfo',
            identifier: key,
            tag: 'index-' + key,
            sensor: true,
            min: 0,
            max: 9999999,
            display: false,
            device: self._init.device
          };

          var deviceTypeSum = {
            name: 'Teleinfo Index ' + key + ' Sum Per day',
            type: 'teleinfo',
            identifier: 'sum-' + key,
            tag: 'sum-' + key,
            sensor: true,
            min: 0,
            max: 999999,
            display: false,
            device: self._init.device
          };

          promises.push(gladys.deviceType.create(deviceTypeIndex)
           .then(function(devicetype) {
              self._types[key] = {
              id: devicetype.id,
                lastValue: false
              };
              gladys.deviceState.create({devicetype: devicetype.id, value: buffer.index[key]});
            })
          );
          promises.push(gladys.deviceType.create(deviceTypeSum).reflect());
        }
        gladys.socket.emit('newTeleinfoValue', [
          {identifier: 'index-' + key, value: buffer.index[key]}
        ]);
      }
    }
    Promise.all(promises).then(function() {
      buffer.papp = [];
      buffer.iinst = [];
      buffer.index = {};
      buffer.timestamp = new Date().getTime();
    });
  }
};
