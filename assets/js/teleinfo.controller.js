(function () {
  'use strict';

  angular
  .module('gladys')
  .controller('teleinfoCtrl', teleinfoCtrl);

  teleinfoCtrl.$inject = ['teleinfoService', 'deviceService', 'paramService', '$scope', '$q', 'moment'];

  function teleinfoCtrl(teleinfoService, deviceService, paramService, $scope, $q, moment){
    /* jshint validthis: true */
    var vm = this;

    var color = {
      "0": {color: "#3366ff", title: "Heure pleine", tag: "HCHP"},
      "1": {color: "#99ccff", title: "Heure creuse", tag: "HCHC"},
      "2": {color: "#3366ff", title: "Heure pleine bleue", tag: "HPJB"},
      "3": {color: "#99ccff", title: "Heure creuse bleue", tag: "HCJB"},
      "4": {color: "#c9cccf", title: "Heure pleine blanche", tag: "HPJW"},
      "5": {color: "#f1f2f3", title: "Heure creuse blanche", tag: "HCJW"},
      "6": {color: "#cc0000", title: "Heure pleine rouge", tag: "HPJR"},
      "7": {color: "#ff6666", title: "Heure creuse rouge", tag: "HCJR"},
      "8": {color: "#3366ff", title: "Base", tag: "BASE"}
    };
    vm.delay = 15000;
    vm.teleinfo = {};
    vm.deviceTypes = {sum:[], index: []};
    vm.months = [];
    vm.selectedMonth = false;

    /* Method */
    vm.watchMore = watchMore;
    vm.getWattPerHour = getWattPerHour;
    vm.getKvaPerDay = getKvaPerDay;

    activate();

    function activate() {
      getGenericData();
      watchForNewValue();
    }

    function watchForNewValue(){

      io.socket.on('newTeleinfoValue', function (deviceStates) {

        $scope.$apply(function(){
          for(var i = 0; i < deviceStates.length; i++) {
            if(deviceStates[i].identifier.match(/index/)) {
              for(var j = 0; j < vm.deviceTypes.index.length; j++) {
                if(vm.deviceTypes.index[j].tag === deviceStates[i].identifier) {
                  vm.dayCost.value += deviceStates[i].value - vm.deviceTypes.index[j].last;
                  vm.dayCost.price = vm.dayCost.value * vm.dayCost.kwh;
                  vm.deviceTypes.index[j].last = deviceStates[i].value;
                }
              }
            } else {
              vm.teleinfo[deviceStates[i].identifier] = Math.round(deviceStates[i].value);
           }
          }
        });
      });
    }

    function getGenericData() {
      // Get params about teleinfo
      paramService.get()
      .then(function(params) {
        for(var i = 0 ; i < params.data.length; i++) {
          if(params.data[i].name === 'TELEINFO_DELAY') vm.delay = params.data[i].value;
          if(params.data[i].name === 'Contrat EDF') vm.teleinfo.contract = params.data[i].value;
        }
        vm.numberOfTick = 120000 / parseFloat(vm.delay);
        vm.hoursToShow = 10800000 / parseFloat(vm.delay);
        return true;
      })
      // Get device teleinfo
      .then(function() {
        return deviceService.get();
      })
      .then(function(devices) {
        devices = devices.data;
        var dev;
        for(var i = 0; i < devices.length; i++) {
          if(devices[i].service === 'teleinfo') dev = devices[i].id;
        }
        return dev;
      })
      // Get device types for teleinfo device
      .then(function(device) {
        return deviceService.getDeviceTypesDevice(device);
      })
      .then(function(deviceTypes) {
        for(var i = 0; i < deviceTypes.data.length; i++) {
          if(deviceTypes.data[i].tag === 'papp') vm.deviceTypes.papp = deviceTypes.data[i].id;
          if(deviceTypes.data[i].tag === 'ptec') vm.deviceTypes.ptec = deviceTypes.data[i].id;
          if(deviceTypes.data[i].tag === 'isousc') vm.deviceTypes.isousc = deviceTypes.data[i].id;
          if(deviceTypes.data[i].tag === 'iinst') vm.deviceTypes.iinst = deviceTypes.data[i].id;
          if(deviceTypes.data[i].tag === 'tomorrow') vm.deviceTypes.tomorrow= deviceTypes.data[i].id;
          if(deviceTypes.data[i].tag.match(/sum/)) vm.deviceTypes.sum.push({id: deviceTypes.data[i].id, data: deviceTypes.data[i].tag});
          if(deviceTypes.data[i].tag.match(/index/)) vm.deviceTypes.index.push({id: deviceTypes.data[i].id, data: deviceTypes.data[i].tag});
        }

        return deviceService.getStates(vm.deviceTypes.papp);
      })
      .then(function(papp) {
        // Get papp value
        vm.teleinfo.papp = papp.data[0].value;
        return deviceService.getStates(vm.deviceTypes.iinst);
      })
      .then(function(iinst) {
        // get iinst value
        vm.teleinfo.iinst = iinst.data[0].value;
        return deviceService.getStates(vm.deviceTypes.isousc); // let the default value for number of data in result (25... could be a problem if user has changed more than 25 times the subscribed intensity)
      })
      .then(function(isousc) {
        // Get isousc values (keep the array to know when the user changed intensity
        vm.teleinfo.isousc = isousc.data;
        return deviceService.getStates(vm.deviceTypes.tomorrow);
      })
      .then(function(result) {
        // Get color of today and tomorrow
        var now = new Date().setHours(0,0,0,0);
        if(new Date(result.data[0].dateFormat).setHours(0,0,0,0) >= now) {
          vm.teleinfo.tomorrow = color[result.data[0].value.toString()].color;
          vm.teleinfo.now = color[result.data[1].value.toString()].color;
        } else {
          vm.teleinfo.tomorrow = "#777";
          vm.teleinfo.now = color[result.data[0].value.toString()].color;
        }
        return teleinfoService.getPrices();
      })
      .then(function(prices) {
        // Get prcies array
        vm.prices = prices;
        vm.dayCost = {value: 0, price: 0};
        var today = new Date().setHours(0,0,0,0);
        angular.forEach(vm.deviceTypes.index, function(index) {
          var p;
          for(var key in color) {
            if(index.data.match(new RegExp(color[key].tag, "g"))) {
              p = key;
            }
          }
          deviceService.getStates(index.id, 0, 10000)
          .then(function(values) {
            getPtecPrice(today, p)
            .then(function(price) {
              index.last = values.data.reverse().reduce(function(a,b,i) {
                var da = new Date(a.dateFormat).setHours(0,0,0,0) ;
                var db = new Date(b.dateFormat).setHours(0,0,0,0);
                if(da < today && db === today) vm.dayCost.value = a.value;
                if(da === today && db > today) vm.dayCost.value = b.value - vm.dayCost.value;
                if(da === today && i === values.data.length-1 && db === today) vm.dayCost.value = b.value - vm.dayCost.value;
                return b;
              });
              vm.dayCost.price += vm.dayCost.value /1000 * price.kwh / 100;
              vm.dayCost.kwh = price.kwh/100;
            });
          });
        });
      });
    }



    function watchMore() {
      getWattPerHour();
      getKvaPerDay();
    }

    function getWattPerHour(h) {
      if(h)  vm.hoursToShow = h * 60 * 60 * 1000 / parseFloat(vm.delay);
      vm.lineColorsWattPerHour = [];
      vm.chartWattPerHour = {data:[], labels: []};
      var ptecColor = [];

      deviceService.getStates(vm.deviceTypes.ptec, 0, vm.hoursToShow)
      .then(function(ptec) {
        ptec.data.reverse().reduce(function(a, b) {
          if(a.value !== b.value) {
            ptecColor.push(b);
          }
          return b;
        });
        return ptecColor;
      })
      .then(function(ptecColor) {
        vm.lineOptions = {
          pointHitDetectionRadius : 0.8,
          pointRadius: 0,
          borderWidth:0,
          showLine: false,
          tooltips: {
            enabled: true,
            mode: 'single',
            callbacks: {
              label: function(tooltipItem, data) {
                var label = data.labels[tooltipItem.index];
                var datasetLabel = data.datasets[tooltipItem.datasetIndex].data[tooltipItem.index];
                 return datasetLabel + ' Watt';
               }
            }
          },
          scales: {
            xAxes: [{
              ticks: {
                display: false
              },
              gridLines: {
                display: false
              }
            }],
           yAxes: [{
              gridLines: {
                display: false
              }
            }]
          }
        };

        deviceService.getStates(vm.deviceTypes.papp, 0, vm.hoursToShow)
        .then(function(result) {
          var tmpChart = {"0": [], "1": [], "2": [], "3": [], "4": [], "5": [], "6": [], "7": [], "8": []};
          var tmpColor;
          vm.chartWattPerHour.labels = [];
          vm.chartWattPerHour.datasets = [];

          var i = 0;
          var tmpVal = 0;
          result.data.reverse().map(function(a) {
            ptecColor.reduce(function(c, d) {
              if(a.dateFormat > c.dateFormat && a.dateFormat < d.dateFormat) {
                // get the current color
                tmpColor = c.value;
              } else if(a.dateFormat >= d.dateFormat) {
                tmpColor = d.value;
              }
              return d;
            });

            i++;
            tmpVal += parseFloat(a.value);

            if(i === vm.numberOfTick) {
              vm.chartWattPerHour.labels.push(a.dateFormat);
              tmpChart[tmpColor].push(tmpVal/vm.numberOfTick);

              for(var key in tmpChart) {
                if(parseInt(key) !== parseInt(tmpColor)) {
                  tmpChart[key].push(false);
                }
              }
              i = 0;
              tmpVal = 0;
            }
          });
          for (var key in tmpChart) {
            var a = tmpChart[key].reduce(function(a, b) {
              return a+b;
            });
            if(a > 0) {
              vm.lineColorsWattPerHour.push(color[key].color);
              vm.chartWattPerHour.data.push(
                tmpChart[key]
              );
            }
          }
        });
      });
    }

    function getKvaPerDay(period) {
      vm.chartKvaPerDayOptions = {
        responsive: true,
        elements: {
          line: {
            fill: false
          }
        },
        scales: {
          xAxes: [{
            display: true,
            gridLines: {
              display: false
            },
            labels: {
              show: true,
            },
            stacked: true
          }],
          yAxes: [{
            type: "linear",
            display: true,
            position: "left",
            id: "y-axis-1",
            gridLines:{
              display: false
            },
            labels: {
              show:true,
           },
            stacked: true,
          },
          {
            type: "linear",
            display: true,
            position: "right",
            id: "y-axis-2",
            gridLines:{
              display: false
            },
            labels: {
              show:true,
            }
          }]
        }
      };

      vm.labels = [];
      vm.colors= [];
      vm.data = [[],[]];

      vm.datasets = [
        {
          type: 'line',
          label: '€',
          borderWidth: 2,
          fill: false,
          data: [],
          yAxisID: 'y-axis-1',
          borderColor: '#EC932F',
          backgroundColor: '#EC932F',
          pointBorderColor: '#EC932F',
          pointBackgroundColor: '#EC932F',
          pointHoverBackgroundColor: '#EC932F',
          pointHoverBorderColor: '#EC932F'
        },
        {
          type: 'line',
          label: 'KvA',
          borderWidth: 2,
          fill: false,
          yAxisID: 'y-axis-2',
          borderColor: '#71B37C',
          backgroundColor: '#71B37C',
          pointBorderColor: '#71B37C',
          pointBackgroundColor: '#71B37C',
          pointHoverBackgroundColor: '#71B37C',
          pointHoverBorderColor: '#71B37C'
        }
      ];

      if(!period) period = moment().format('MMMM YYYY');

      angular.forEach(vm.deviceTypes.sum, function(index) {
        var datasets = {
          type: 'bar',
          borderWidth: 1,
          fill: false,
          yAxisID: 'y-axis-1',
          id: index.id
        };

        vm.data.push([]);
        vm.datasets.push(datasets);

        var idx = vm.datasets.indexOf(datasets);

        deviceService.getStates(index.id, 0, 1000)
        .then(function(result) {
          result = result.data.reverse();
          if(result.length > 0) {

            var p = {key: false};

            for(var key in color) {
              if(index.data.match(new RegExp(color[key].tag, "g"))) {
                p.key = key;
                vm.datasets[idx].label = color[key].title + ' (€)';
                vm.datasets[idx].backgroundColor = color[key].color;
                vm.datasets[idx].borderColor = color[key].color;
                vm.datasets[idx].hoverBackgroundColor = color[key].color;
                vm.datasets[idx].hoverBorderColor = color[key].color;
              }
            }
          }
          var i=0;
          var j=-1;

          angular.forEach(result,function(kva) {
            // Build months array for select option
            if(vm.months.indexOf(moment(kva.dateFormat).format('MMMM YYYY')) === -1) {
              vm.months.push(moment(kva.dateFormat).format('MMMM YYYY'));
            }
            if(moment(kva.dateFormat).format('MMMM YYYY') === period) {
              if(!vm.labels[i]) {
                vm.labels[i] = moment(kva.dateFormat).format('dddd Do MMMM');
                i++;
              }


              getPtecPrice(kva.dateFormat, p.key)
              .then(function(prices) {
                p.prices = prices;
                var euro = (kva.value/1000*p.prices.kwh/100);
                vm.data[idx].push(Number(euro.toFixed(2)));
                j++;
                if(!vm.data[0][j]) vm.data[0][j] = 0;
                if(!vm.data[1][j]) vm.data[1][j] = 0;
                vm.data[1][j] += Number(kva.value);
                vm.data[0][j] += Number(euro.toFixed(2));
              });
            }
          });
        });
      });
    }

    function getPtecPrice(date, period) {
      return $q(function(resolve, reject) {
        var tmp = false;
        var is = false;
        var tmpDate = new Date('1970-01-01');
        for(var j = 0; j < vm.teleinfo.isousc.length; j++) {
          if((new Date(date) >= new Date(vm.teleinfo.isousc[j].dateFormat)) &&  (new Date(date) >= tmpDate)) {
            tmpDate = new Date(vm.teleinfo.isousc[j].dateFormat);
            is = vm.teleinfo.isousc[j].value;
          }
        }
        tmpDate = new Date('1970-01-01');
        for(var timestamp in vm.prices) {
          if((new Date(date) >= new Date(timestamp)) && (new Date(date) >= tmpDate)) {
            tmpDate = new Date(timestamp);
            tmp = vm.prices[timestamp];
          }
        }
        for(var per in tmp) {
          if(per === period) {
            tmp = tmp[period];
          }
        }
        for(var isousc in tmp) {
          if(parseInt(isousc) === is) {
            tmp = tmp[isousc];
          }
        }
        return resolve(tmp);
      });
    }
  }
})();
