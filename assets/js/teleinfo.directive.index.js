(function () {
'use strict';

angular
.module('app')
.directive('indexConso', indexConso);

function indexConso(){
  var loaded = false;
  return {
    restrict: 'C',
    replace: true,
    scope: {
      items: '=',
      newitems: '='
    },
    bindToController: true,
    template: '<div id="container-realtime" style="margin: 0 auto">-</div>',
    link: function (scope, element, attrs) {
      Highcharts.setOptions({
        global : {
          useUTC : false
        }
      });
      var chart = new Highcharts.Chart({
        chart: {
          renderTo: 'container-realtime',
          zoomType: 'x',
          height: '250'
        },
        title: {
          text: 'Real time'
        },
        xAxis: {
            type: 'datetime',
            dateTimeLabelFormats: {
                day: '%H:%M:%S'
            }
        },
        yAxis: {
          title: {
            text: 'Wh'
          }
        },
        plotOptions: {
          series: {
            lineWidth: 0.2,
            radius: 0
          }
        }
      });
      scope.$watch("items", function (data) {
        if(chart.series.length === 0 ) {
          for(var key in data.data) {
            loaded = true;
            chart.addSeries({
                fillColor: {
                  linearGradient: { x1: 0, y1: 0, x2: 0, y2: 1},
                    stops: [
                      [0, data.colors[key]],
                      [1, '#f4f4f4']
                    ]
                },
                width: 0.2,
                color: data.colors[key],
                type: 'area',
                name: data.legend[key],
                data: data.data[key],
            });
          }
        }
      }, true);
      scope.$watch("newitems", function (data) {
        var a = false;
        if(data && loaded) {
          for(var i = 0; i < chart.series.length; i++) {
            if(chart.series[i].name == data.name) {
              a = true;
              chart.series[i].addPoint([data.date, data.value],true, true);
            }
          }
          if(!a) {
            chart.addSeries({
              fillColor: {
                linearGradient: { x1: 0, y1: 0, x2: 0, y2: 1},
                  stops: [
                    [0, data.color],
                    [1, '#f4f4f4']
                  ]
              },
              width: 0.2,
              color: data.color,
              type: 'area',
              name: data.name,
              data: [[data.date, data.value]]
            });
          }
        }
      }, true);
    }
  }
}
})();
