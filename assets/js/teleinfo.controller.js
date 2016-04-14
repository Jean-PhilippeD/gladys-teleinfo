(function () {
'use strict';

angular
.module('app')
.controller('teleinfoController', teleinfoController);

teleinfoController.$inject = ['teleinfoService','$timeout','$scope'];

function teleinfoController(teleinfoService, $timeout, $scope){
  /* jshint validthis: true */
  var vm = this;

  /* Method */
  vm.update = update;
  vm.destroy = destroy;
  vm.add = add;
  vm.showMore = showMore;
  vm.isEmpty = isEmpty;
  
  /* Infos */
  vm.rangeSelected = false;
  vm.monthSelected = false;
  vm.modal = false;
  vm.graphical = false;
  vm.error = {};
  vm.indexItems;
  vm.kWhByDay = [];
  vm.newItems;
  vm.priceForMonth = 0;
  vm.updating;
  vm.devices = [];
  vm.conso = {};
  vm.colorOfToday;
  vm.colorOfTomorrow = false;
  vm.priceForPeriod = 0;
  vm.rangeSelector = [1,2,3,4,5,6,7,8,9,10,11,12];

  function activate() {
    instantWH();
    subscribe();
    devices();
    color();
    getMonths();
  }

  activate();

  io.socket.on('update', function (msg) {
    $scope.$apply(function() {
      vm.newItems = {date: msg.date, value: msg.data, name: msg.name, color: msg.color};
    });
  });

  io.socket.on('diff', function (msg) {
    $scope.$apply(function() {
      for(var key in msg) {
        if(msg[key].value > 0) {
          vm.conso[key] = {
            value : msg[key].value,
            price : msg[key].price,
            color : msg[key].color
          } 
          vm.priceForMonth = vm.priceForMonth + (msg[key].price - vm.conso[key].price);
        }
      }
    });
  });

  function getMonths() {
    return teleinfoService.months()
    .then(function(data) {
      vm.months = data;
    });
  }

  function showMore(month, range) {
    var b = {};
    var d = [];
    vm.priceForPeriod = 0;
    vm.graphical = true;
    return teleinfoService.getKWHbyDay(month, range)
    .then(function(data) {
      for(var i = 0; i < data.values.length; i++) {
        vm.priceForPeriod += data.values[i].price;
        d[i] = data.values[i]['date'];
        for(var key in data.values[i]) {
          if(!b[key]) b[key] = {data: [], color: data.colors[key], legend: data.legend[key]};
          b[key].data.push(data.values[i][key]);
        }
      } 
      vm.kWhByDay = {x:d,y:b};
      vm.monthSelected = false;
      vm.rangeSelected = false;
    })
    .catch(function(err) {
      vm.error.global = err;
    })
  }

  function instantWH(){
    return teleinfoService.getCurrent()
      .then(function(data){
        vm.indexItems = {
          data: data.data,
          legend: data.legend,
          colors: data.colors
        }
        teleinfoService.getPriceForMonth()
        .then(function(data) {
          vm.priceForMonth = data[0].price;
        });
      });
  }

  function subscribe(){
    teleinfoService.subscribe();
  }

  function devices() {
    teleinfoService.devices()
    .then(function(data) {
      vm.devices = data;
    })
    .catch(function(err) {
      vm.error.configure = err;
    });
  }

  function update(id, data) {
    vm.updating = {id: id, what: data};
  }

  function save(id, val, what) {
    var data = {id: id, data: val, what: what};
    return teleinfoService.update(data)
    .then(function() {
      vm.updating = {};
    })
    .catch(function(err) {
      vm.error.configure = err;
    });
  }

  function destroy(id) {
    return teleinfoService.destroy(id)
    .then(function() {
      for(var i = 0; i < vm.devices.length; i++) {
        if(vm.devices[i].id = id) {
          vm.devices.splices(i,1);
        }
      }
    })
    .catch(function(err) {
      vm.error.configure = err;
    });
  }

  function add(dev) {
    var data = {
      step: dev.step,
      tty: dev.tty
    }

    return teleinfoService.add(data)
    .then(function(data) {
      vm.devices.push(data)
      vm.new = {};
    })
    .catch(function(err) {
      vm.error.configure = err;
    });
  }

  function setError(key, err){
    vm.error[key] = err;
  }

  function isEmpty(obj) { 
    return Object.keys(obj).length === 0; 
  }

  function color() {
    return teleinfoService.color()
    .then(function(data) {
      vm.colorOfToday = data.today;
      vm.colorOfTomorrow = data.tomorrow;
    });
  }
}
})();
