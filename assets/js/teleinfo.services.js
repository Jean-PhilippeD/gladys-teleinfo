(function () {
  'use strict';
  angular
    .module('app')
    .factory('teleinfoService', teleinfoService);

    teleinfoService.$inject = ['$http','$q'];

    function teleinfoService($http, $q) {
      return {
        getCurrent : getCurrent,
        subscribe : subscribe,
        update : update,
        add: add,
        destroy : destroy,
        devices : devices,
        getKWHbyDay : getKWHbyDay,
        color: color,
        months: months,
        getPriceForMonth: getPriceForMonth
      };

      function request(method, url, data){
        var deferred = $q.defer();

        $http({method: method, url: '/teleinfo' + url, data: data})
          .success(function(data, status, headers, config){
              deferred.resolve(data);
          })
          .error(function(data, status, headers, config){
            if(status === 400 || status === 403){
              deferred.reject(data);
            }
          });

        return deferred.promise;
       
      }

      function getKWHbyDay(month, range){
        if(!range) var range = 'default';
        if(!month) var month = 'current';
        return request('GET', '/kwh/' + month + '/' + range, {});
      }

      function getCurrent(){
        return request('GET', '/index', {});
      }

      function subscribe(callback) {
        io.socket.get('/teleinfo/subscribe');
      }

      function getPriceForMonth() {
        return request('GET', '/price', {});
      }

      function update(data) {
        return request('PUT', '/update', {data: data});
      }

      function destroy(id) {
        return request('DELETE', '/destroy', {id: id});
      }

      function add(data) {
        return request('POST', '/add', {data: data});
      }
  
      function devices() {
        return request('GET', '/devices', {});
      }

      function color() {
        return request('GET', '/color', {});
      }

      function months() {
        return request('GET', '/months', {});
      }
  }
})();
