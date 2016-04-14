/**
 * Controller
 * @doc http://sailsjs.org/documentation/concepts/controllers
 */

//  required module
var teleinfo = require('teleinfo');

// Variables can me modify in table through gui
var tty = '/dev/null'; // devices sytem
var step = 15; // step to get trame
var retention = 4 // in weeks

// variables
var timestamp = new Date().getTime();
var lasttimestamp;
var contracts = [];

var format = function formatDate(date) {
  var d = new Date(date),
  month = '' + (d.getMonth() + 1),
  day = '' + d.getDate(),
  year = d.getFullYear();
  if (month.length < 2) month = '0' + month;
  if (day.length < 2) day = '0' + day;
  return [year, month, day].join('-');
}

// on sails ready, get the device info and start listening on it
sails.config.Event.on('sailsReady', function() {
  TeleinfoConfig.find({})
  .limit(1)
  .exec(function(err, config) {
    if(err) {
      sails.log.error(err);
      return;
    }
    if(config[0].tty) {
      tty = config[0].tty;
      lasttimestamp = timestamp - step*1000;
    } else {
      sails.log.warn('Teleinfo : You really should define the Teleinfo Device as /dev/ttyXX in database if you want to collect data!');
      return;
    }

    (!config[0].step) ? sails.log.warn('Teleinfo: choosing default step : ' + step + 's') : step = config[0].step;
    (!config[0].retention) ? sails.log.warn('Teleinfo: choosing default retention : ' + retention + ' week(s)') : retention = config[0].retention;

    var trameEvents = teleinfo(tty);

    trameEvents.on('error', function (data) {
      sails.log.warn('Teleinfo : Error Checksum');
    });
  
    TeleinfoContract.query('SELECT `id` as id , `ADCO` as num FROM `teleinfocontract` GROUP BY `ADCO`', [], function(err, ids) {
      if(err) return err;
      contracts = ids;
    
      trameEvents.on('tramedecodee', function (data) {
        timestamp = new Date().getTime(); 
    
        // If step reached, we add the package
        if((timestamp - lasttimestamp) >= step*1000) {
  
          // CONTRACT INFO
          // Verify the contract information has changed, if so add a new row
          contract = {
            ADCO : data.ADCO,
            OPTARIF : data.OPTARIF,
            ISOUSC : data.ISOUSC
          }
    
          TeleinfoContract.find({})
          .sort('updatedAt ASC')
          .limit(1)
          .exec(function callBack(err, result) {
            if(err) {
              sails.log.warn('Teleinfo : Could not find contract information in database , error : ' + err);
              return;
            }
            if(!result[0]){
              TeleinfoContract.create(contract, function(err, res) {
                if(err) sails.log.warn('Teleinfo : Contract information has changed but Gladys has failed to add a row, error: ' + err);
                sails.log.info('Teleinfo : populating contract table.');
              })
            } else if(result[0].ADCO != contract.ADCO || result[0].OPTARIF != contract.OPTARIF || result[0].ISOUSC != contract.ISOUSC) { 
              TeleinfoContract.create(contract, function(err, res) {
                if(err) sails.log.warn('Teleinfo : Contract information has changed but Gladys has failed to add a row, error: ' + err);
                sails.log.info('Teleinfo : Contract information has changed, populating contract table.');
              });
            } else {
              // VALUES
              // Add a row into table 
              value = {
                HCHP: data.HCHP,
                HCHC: data.HCHC,
                BBRHPJB: data.BBRHPJB,
                BBRHCJB: data.BBRHCJB,
                BBRHPJW: data.BBRHPJW,
                BBRHCJW: data.BBRHCJW,
                BBRHPJR: data.BBRHPJR,
                BBRHCJR: data.BBRHCJR,
                HHPC: data.HHPC,
                BASE: data.BASE,
                PTEC: data.PTEC,
                PAPP: data.PAPP,
                IINST: data.IINST,
                IMAX: data.IMAX,
                contract: result[0].id
              }

              Teleinfo.create(value)
              .exec(function(err) {
                if(err) sails.log.warn('Teleinfo : Gladys failed to insert new datas, error : ' + err);
                // launch parallel tasks...
                // Push data history 
                histo(value, data.ISOUSC, function(err, diff) { 
                  if(err) {
                    sails.log.warn('Teleinfo : Historization : ' + err);
                  } else {
                    sails.sockets.broadcast('teleinfo', 'diff', diff);
                    purge(value.contract, retention, function(err) {
                      if(err) sails.log.warn('Teleinfo : Purge : ' + err);
                    });
                  }
                  
                });
              });
        
              // If BBR contract, add Tomorrow color
              if(data.OPTARIF.match(/^BBR/)) {
                var tomorrow = new Date(new Date().getTime() + 24 * 60 * 60 * 1000);
                var dd = tomorrow.getDate();
                var mm = tomorrow.getMonth()+1; //January is 0!
                var hour = tomorrow.getHours();
                var yyyy = tomorrow.getFullYear();
      
                if(dd<10){
                  dd='0'+dd
                } 
                if(mm<10){
                  mm='0'+mm
                } 
                var tomorrow = yyyy+'-'+mm+'-'+dd
      
                TeleinfoColor.find({date: tomorrow}, function(err, color) {
                  if(err) {
                    sails.log.warn('Teleinfo : Could not get color of tomorrow, error : ' + err);
                    return err;
                  }
                  if(!color[0] && data.DEMAIN != '----' && hour > 6) { // verify we are at least at 6am (cause the DEMAIN data seems to appears after midnight
                    TeleinfoColor.create({date: tomorrow, color:data.DEMAIN}, function(err, ok){
                      if(err) sails.log.warn('Teleinfo : Could not insert color of tomorrow, error : ' + err);
                    });
                  }
                });
              }
              // add new timestamp info
              lasttimestamp = new Date().getTime();
    
              // Then broadcast to socket.io on room teleinfo
              var today = new Date().getTime();
              sails.sockets.broadcast('teleinfo', 'update', {data: data.IINST*230, date: today, name: sails.config.teleinfo.legend[data.PTEC], color: sails.config.teleinfo.colors[data.PTEC]});
            }
          });
        }
      });
    });
  });
});


function histo(value, isousc, next) {
  TeleinfoContract.findOne({id: value.contract}, function(err, contract) {
    if(err) return next(err);
    var field;
    if(contract.OPTARIF.match(/BBR/g)) {
      if(value.PTEC.match(/HCJB/g)) field = 'BBRHCJB';
      if(value.PTEC.match(/HPJB/g)) field = 'BBRHPJB'; 
      if(value.PTEC.match(/HCJW/g)) field = 'BBRHCJW';
      if(value.PTEC.match(/HPJW/g)) field = 'BBRHPJW'; 
      if(value.PTEC.match(/HCJR/g)) field = 'BBRHCJR'; 
      if(value.PTEC.match(/HPJR/g)) field = 'BBRHPJR';
    }
    if(contract.OPTARIF.match(/HCHP/g)) {
      field = contract.OPTARIF;
    }

    var request = "SELECT id, IMAX, " + field + "_DEB as last ";
    request += "FROM gladys.teleinfohistory ";
    request += "WHERE contract = " + contract.id + " AND DATE_FORMAT(day, '%Y-%m-%d') = '" + format(new Date()) + "' ";
    request += "ORDER BY day DESC ";
    request += "LIMIT 1";
    // Get last field inserted
    Teleinfo.query(request, [], function(err, result) {
      if(err) return next(err);
      // first entry in histo table
      if(!result[0]) {
         var hist = {
          HCHP_DEB : value.HCHP,
          HCHC_DEB : value.HCHC,
          BBRHPJB_DEB : value.BBRHPJB,
          BBRHPJW_DEB : value.BBRHPJW,
          BBRHPJR_DEB : value.BBRHPJR,
          BBRHCJB_DEB : value.BBRHCJB,
          BBRHCJW_DEB : value.BBRHCJW,
          BBRHCJR_DEB : value.BBRHCJR,
          BASE_DEB : value.base,
          IMAX : value.IINST,
          contract : value.contract
        }
        TeleinfoHistory.create(hist, function(err) {
          if(err) return next(err);
          return next();
        });
      } else if (!result[0].last) {  // first entry for the date
        var hist = {
          HCHP_DEB : value.HCHP,
          HCHC_DEB : value.HCHC,
          BBRHPJB_DEB : value.BBRHPJB,
          BBRHPJW_DEB : value.BBRHPJW,
          BBRHPJR_DEB : value.BBRHPJR,
          BBRHCJB_DEB : value.BBRHCJB,
          BBRHCJW_DEB : value.BBRHCJW,
          BBRHCJR_DEB : value.BBRHCJR,
          BASE_DEB : value.base,
          IMAX : value.IINST,
          contract : value.contract
        }
        TeleinfoHistory.create(hist, function(err) {
          if(err) return next(err); 
          return next();
        });
      } else { // already an entry for the day so updating the row
        var hist = {
          HCHP_FIN : value.HCHP,
          HCHC_FIN : value.HCHC,
          BBRHPJB_FIN : value.BBRHPJB,
          BBRHPJW_FIN : value.BBRHPJW,
          BBRHPJR_FIN : value.BBRHPJR,
          BBRHCJB_FIN : value.BBRHCJB,
          BBRHCJW_FIN : value.BBRHCJW,
          BBRHCJR_FIN : value.BBRHCJR,
          BASE_FIN : value.base,
          contract : value.contract
        } 
        if(value.IINST > result[0].IMAX) hist.IMAX = value.IINST;
   
        // Get prices from table by KvA
        TeleinfoPrices.find({power: (isousc * 0.2)}, function(err, tarifs) {
          if(err) return next(err);
          TeleinfoHistory.update({id: result[0].id}, hist, function(err, data) {
            if(err) return next(err);
            diff = {
              HPJB: {
                color: sails.config.teleinfo.colors.HPJB,
                value: parseInt(data[0].BBRHPJB_FIN) - parseInt(data[0].BBRHPJB_DEB),
                price: (parseInt(data[0].BBRHPJB_FIN) - parseInt(data[0].BBRHPJB_DEB)) /1000 * tarifs[0].BBRHPJB
              }, 
              HPJW: {
                color: sails.config.teleinfo.colors.HPJW,
                value: parseInt(data[0].BBRHPJW_FIN) - parseInt(data[0].BBRHPJW_DEB),
                price: (parseInt(data[0].BBRHPJW_FIN) - parseInt(data[0].BBRHPJW_DEB))  /1000 *  tarifs[0].BBRHPJW
              },
              HPJR: {
                color: sails.config.teleinfo.colors.HPJR,
                value: parseInt(data[0].BBRHPJR_FIN) - parseInt(data[0].BBRHPJR_DEB),
                price: (parseInt(data[0].BBRHPJR_FIN) - parseInt(data[0].BBRHPJR_DEB))  /1000 *  tarifs[0].BBRHPJR
              },
              HCJB: {
                color: sails.config.teleinfo.colors.HCJB,
                value: parseInt(data[0].BBRHCJB_FIN) - parseInt(data[0].BBRHCJB_DEB),
                price: (parseInt(data[0].BBRHCJB_FIN) - parseInt(data[0].BBRHCJB_DEB))  /1000 *  tarifs[0].BBRHCJB
              },
              HCJW: {
                color: sails.config.teleinfo.colors.HCJW,
                value: parseInt(data[0].BBRHCJW_FIN) - parseInt(data[0].BBRHCJW_DEB),
                price: (parseInt(data[0].BBRHCJW_FIN) - parseInt(data[0].BBRHCJW_DEB))  /1000 *  tarifs[0].BBRHCJW
              },
              HCJR: {
                color: sails.config.teleinfo.colors.HCJR,
                value: parseInt(data[0].BBRHCJR_FIN) - parseInt(data[0].BBRHCJR_DEB),
                price: (parseInt(data[0].BBRHCJR_FIN) - parseInt(data[0].BBRHCJR_DEB))  /1000 *  tarifs[0].BBRHCJR
              },
              HCHC: {
                color: sails.config.teleinfo.colors.HCHC,
                value: parseInt(data[0].HCHC_FIN) - parseInt(data[0].HCHC_DEB),
                price: (parseInt(data[0].HCHC_FIN) - parseInt(data[0].HCHC_DEB))  /1000 *  tarifs[0].HCHC
              },
              HCHP: {
                color: sails.config.teleinfo.colors.HCHP,
                value: parseInt(data[0].HCHP_FIN) - parseInt(data[0].HCHP_DEB),
                price: (parseInt(data[0].HCHP_FIN) - parseInt(data[0].HCHP_DEB))  /1000 *  tarifs[0].HCHP
              },
              BASE: {
                color: sails.config.teleinfo.colors.HCHP,
                value: parseInt(data[0].BASE_FIN) - parseInt(result.BASE_DEB),
                price: (parseInt(data[0].BASE_FIN) - parseInt(result.BASE_DEB))  /1000 *  tarifs[0].BASE
              }
            }
            return next(null, diff);
          });
        });
      }
    });
  });
}

function purge(contract, retention, next) {
  if(!contract || !retention) return next('missing parameters');
  var request = "DELETE FROM gladys.teleinfo ";
  request += " WHERE contract = ? ";
  request += " AND id >= 0 ";
  request += " AND DATE_FORMAT(datetime, '%Y-%m-%d') < NOW() - INTERVAL ? WEEK";

  Teleinfo.query(request, [contract, retention], function(err, deleted) {
    if(err) return next(err);
    next();
  });
}

module.exports = {

  /**
  * Get all values in order to show it in a XY chart 
  * @method index
  * @param req
  * @param res
  * @param next
  */
  index : function(req, res, next){
    TeleinfoService.getLastHours(6, 'BBR', function(err, values) {
      if(err) return res.json(400, err);
      res.json({data:values.data, price: values.price, legend: sails.config.teleinfo.legend, colors: sails.config.teleinfo.colors});
    });
  },

  /**
  * Get all devices configured
  * @method devices
  * @param req
  * @param res
  * @param next
  */
  devices : function(req, res, next){
    TeleinfoConfig.find({}, function(err, data) {
      if(err) return res.send(400, err);
      res.json(data);
    });
  },


  /**
  * Subscribe to teleinfo room
  * @method subscribe
  * @param req
  * @param res
  */

  subscribe : function(req, res) {
    if(!req.isSocket) return res.json(400, err);
    sails.sockets.join(req.socket, 'teleinfo');
    var message = 'Teleinfo: ' + req.session.User.firstname + ' ' + req.session.User.lastname + ' successfuly connected to teleinfo room';
    sails.log.info(message);
    res.json({message: message});
  },

  update : function(req, res) {
    if(req.param('data').what === 'step') var data = {step : req.param('data').val};
    if(req.param('data').what === 'retention') var data = {retention : req.param('data').val};
    if(req.param('data').what === 'tty') var data = {tty : req.param('data').val};
    TeleinfoConfig.update({id: req.param('data').id}, data, function(err) {
      if(err) return res.send(400, err);
    });
  },

  destroy : function(req, res) {
    if(!req.param('id')) return res.json(400,null);
    TeleinfoConfig.findOne({id: req.param('id')})
    .exec(function(err, data) {
      if(err) return res.json(400, err);
      if(!data) return res.json(400, "Unknown id");
      TeleinfoConfig.destroy({id: data.id}, function(err, value){
        if(err) return res.json(400, err);
        sails.log.info('Teleinfo: ' + req.session.User.firstname + ' ' + req.session.User.lastname + '  has deleted the config : ' + data.tty + ' - ' + data.step);
        return res.json();
      });
    });
  },

  add: function(req, res) {
    TeleinfoConfig.create(req.param('data'), function(err, data) {
      if(err) return res.json(400, err);
      res.json(data);
    });
  },

  /**
  * Get kWH by day
  * @method kwHbyDay 
  * @param req
  * @param res
  */

  kWhByDay : function(req, res) {
    range = 1;
    month = false;
    if(req.param('range') != 'default') range = req.param('range');
    if(req.param('month') != 'current') month = req.param('month');

    TeleinfoService.getKWhByDay(range, month, function(err, result) {
      if(err) return res.send(400, err);
      return res.json({values: result, legend: sails.config.teleinfo.legend, colors: sails.config.teleinfo.colors});
    });
  },

  /**
  * Get price by month
  * @method kwhForCurrentMonth
  * @param req
  * @param res
  */

  priceForCurrentMonth : function(req, res) {
    date =  new Date(new Date().getTime() + 24 * 60 * 60 * 1000);
    var month = date.getMonth()+1; 
    if(month < 10) month = '0' + month;
    var year = date.getFullYear();
    TeleinfoService.getPriceByMonth(year + '-' + month, function(err, result) {
      if(err) return res.send(400, err);
      return res.json(result);
    });
  },

  /**
  * Get color of the  day
  * @method getColorOfDay 
  * @param req
  * @param res
  */

  getColorOfDay : function(req, res) {
    var today = new Date();
    var result = {today: false, tomorrow: false};
    TeleinfoColor.query("SELECT color FROM teleinfocolor WHERE date >= '" + format(today) + "'", function(err, data) {
      if(err) return res.send(400, err);
      // Get color of tomorrow if exist
      if(data[1]) {
        switch(data[1].color) {
          case 'BLAN':
            result.tomorrow = sails.config.teleinfo.colors.HPJW;
            break;
          case 'BLEU':
            result.tomorrow = sails.config.teleinfo.colors.HPJB;
            break;
          case 'ROUG':
            result.tomorrow = sails.config.teleinfo.colors.HPJR;
          default:
            result.tomorrow = '#eee';
        }
      }
      // Get color of today
      switch(data[0].color) {
        case 'BLAN':
          result.today = sails.config.teleinfo.colors.HPJW; 
          break;
        case 'BLEU':
          result.today = sails.config.teleinfo.colors.HPJB;
          break;
        case 'ROUG':
          result.today = sails.config.teleinfo.colors.HPJR;
        default:
          result.today = '#eee';
      }
      return res.json(result);
    });
  },

  /*
  * getMonths
  * Get months of history
  */

  getMonths : function(req, res) {
    TeleinfoService.getMonths(function(err, months) {
      if(err) return res.send(400, err);
      return res.json(months);
    });
  },
};
