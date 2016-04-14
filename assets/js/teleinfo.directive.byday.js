(function () {
'use strict';

angular
.module('app')
.directive('byday', byday);

function byday(){
  return {
    restrict: 'C',
    replace: true,
    scope: {
      items: '=',
    },
    template: '<div id="container-kWh-by-day" style="margin: 0 auto">-</div>',
    link: function (scope, element, attrs) {
      Highcharts.setOptions({
        global : {
          useUTC : false
        }
      });
      var chart = new Highcharts.Chart({
        chart: {
          renderTo: 'container-kWh-by-day',
          type: 'column'
        },
        title: {
          text: 'Day by day'
        },
        xAxis: {
          type: 'datetime',
          dateTimeLabelFormats: {
              day: '%d/%m/%Y'
          }
        },
        yAxis: [{
          labels: {
            format: '{value} kWh',
            style: {
              color: Highcharts.getOptions().colors[1]
            }
          },
          title: {
            text: 'Consommation kWh'
          }
        },{
          labels: {
            format: '{value} €',
            style: {
              color: Highcharts.getOptions().colors[2]
            }
          },
          title: {
            text: 'Prix'
          },
          opposite: true
        }],
        stackLabels: {
          enabled: true,
          style: {
            fontWeight: 'bold',
            color: (Highcharts.theme && Highcharts.theme.textColor) || 'gray'
          }
        },
        plotOptions: {
          column: {
            stacking: 'normal',
            dataLabels: {
              enabled: false,
              color: (Highcharts.theme && Highcharts.theme.dataLabelsColor) || 'white',
              style: {
                textShadow: '0 0 3px black, 0 0 3px black'
              }
            }
          }
        }
      });
      scope.$watch("items", function (data) {
        while(chart.series.length > 0) {
          chart.series[0].remove(true);
        }
        chart.xAxis[0].setCategories(data.x);
        for(var key in data.y) {
          var b = false;
          if(key === 'price') {
            chart.addSeries({
              type: 'spline',
              yAxis: 1,
              name: 'Prix',
              color: '#B40404',
              data: data.y[key].data
            });
          } else {
            // check if there is a non null value so I add a serie
            for(var i = 0; i < data.y[key].data.length; i++) {
              if(data.y[key].data[i] > 0 && key !== 'max') {
                b = true;
                break;
              }
            }
            if(b) {
              chart.addSeries({
                type: 'column',
                color: data.y[key].color,
                name: data.y[key].legend,
                data: data.y[key].data,
              });
            }
          }
        }
      }, true);
    }
  }
}
})();
