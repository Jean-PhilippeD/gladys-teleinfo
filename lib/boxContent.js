
  // Header
  var html = `
    <!-- Box Home page -->
    <div id="teleinfo-header">
      <div class="row">
        <div class="col-lg-1 col-md-1 col-xs-1">
          <button ng-click="vm.watchMore()" data-target=".teleinfo-modal" data-toggle="modal" class="btn btn-default btn-xs"><i class="fa fa-eye"></i></button>
        </div>
        <div class="col-lg-8 col-md-9 col-xs-9"></div>
        <div class="col-lg-3 col-md-2 col-xs-2">
          <span class="badge">{{ 'CONTRACT_NUMBER' | translate}} {{ vm.teleinfo.contract}}</span>
       </div>
     </div>
    </div>
    <br>
    <div class="teleinfo-panel">
      <div class="teleinfo-content">
        <span class="teleinfo-span">
          <i class="teleinfo-icon fa fa-plug"></i>
        </span>
        <div class="teleinfo-value" ng-class="(100 * vm.teleinfo.iinst) / vm.teleinfo.isousc > 80 ? 'teleinfo-danger' : (100 * vm.teleinfo.iinst) / vm.teleinfo.isousc > 50 ? 'teleinfo-warning': 'teleinfo-normal'">
            <span class="teleinfo-text">{{ 'IINST' | translate }}</span>
            <span ng-show="vm.teleinfo.iinst" class="teleinfo-data">{{vm.teleinfo.iinst}} a</span>
            <span ng-show="!vm.teleinfo.iinst" class="teleinfo-data"><i class="fa-spinner fa fa-spin"></i></span>
        </div>
      </div>
      <div class="teleinfo-content">
        <span class="teleinfo-span">
          <i class="teleinfo-icon fa fa-flash"></i>
        </span>
        <div class="teleinfo-value" ng-class="(100 * vm.teleinfo.papp) / (vm.teleinfo.isousc *220) > 80 ? 'teleinfo-danger' : (100 * vm.teleinfo.papp) / (vm.teleinfo.isousc * 220) > 50 ? 'teleinfo-warning': 'teleinfo-normal'">
          <span class="teleinfo-text">{{ 'PAPP' | translate }}</span>
          <span ng-show="vm.teleinfo.papp" class="teleinfo-data">{{vm.teleinfo.papp}} W</span>
          <span ng-show="!vm.teleinfo.papp" class="teleinfo-data"><i class="fa-spinner fa fa-spin"></i></span>
        </div>
      </div>
      <div class="teleinfo-content">
        <span class="teleinfo-span" style="background: {{vm.teleinfo.now}}!important;">
          <i class="teleinfo-icon fa fa-calendar"></i>
        </span>
        <div class="teleinfo-value teleinfo-normal" class="teleinfo-circle">
          <span class="teleinfo-text">{{ 'TOMORROW' | translate}}</span>
          <span ng-show="vm.teleinfo.tomorrow" style="color: {{vm.teleinfo.tomorrow}}!important;">
            <i class="fa fa-circle"></i>
          </span>
          <span ng-show="!vm.teleinfo.tomorrow" class="teleinfo-data"><i class="fa-spinner fa fa-spin"></i></span>
        </div>
      </div>
      <div class="teleinfo-content">
        <span class="teleinfo-span">
          <i class="teleinfo-icon fa fa-eur"></i>
        </span>
        <div class="teleinfo-value teleinfo-normal" class="teleinfo-circle teleinfo-warning">
          <span class="teleinfo-text">{{ 'CURRENT_PRICE' | translate }}</span>
          <span ng-show="vm.dayCost.price" class="teleinfo-data">{{vm.dayCost.price | number:2}} €</span>
          <span ng-show="!vm.dayCost.price" class="teleinfo-data"><i class="fa-spinner fa fa-spin"></i></span>
      </div>
    </div>
    `;
  var footer = `
    <!-- Box Modal page -->
    <div id="modal-teleinfo" class="modal fade in teleinfo-modal" aria-hidden="false" aria-labelledby="myLargeModalLabel" role="dialog" tabindex="-1">
     <div class="modal-dialog modal-lg">
       <div class="modal-content">
         <div class="modal-header">
           <button class="close" aria-label="Close" data-dismiss="modal" type="button">
             <span aria-hidden="true">×</span>
           </button>
           <h4 id="myLargeModalLabel" class="modal-title">{{ 'TELEINFO_PLUS' | translate }}</h4>
         </div>
       <!-- Body Error -->
         <div class="modal-body">
           <div ng-show="vm.error" class="alert alert-danger">
             <i class="fa fa-ban"></i>
             <button ng-click="vm.error = !vm.error" type="button" class="close">x</button>
             {{vm.error | errorToString}}
           </div>
       <!-- Body content -->
           <div class="col-sm-12">
             <h3>{{ 'TELEINFO_WATT_LINE_TITLE' | translate}}</h3><br>
             <div style="float: right">
               <button class="btn btn-xs bg-light-blue" ng-click="vm.getWattPerHour(6)">6h</button>
               <button class="btn btn-xs bg-yellow" ng-click="vm.getWattPerHour(24)">24h</button>
               </br>
             </div>
             <i class="fa fa-spinner fa-spin fa-2x" ng-show="vm.chartWattPerHour.data.length === 0"></i>
             <canvas
               ng-show="vm.chartWattPerHour.data.length > 0"
               chart-options="vm.lineOptions"
               id="bar"
               class="chart chart-line"
               chart-data="vm.chartWattPerHour.data"
               chart-labels="vm.chartWattPerHour.labels"
               chart-colors="vm.lineColorsWattPerHour"
             >
             </canvas>
             <h3>{{ 'TELEINFO_PRICE_PER_DAY_BAR_TITLE' | translate}}</h3><br>
             <div style="float: right">
               <select ng-options="month as month for month in vm.months" ng-model="vm.selectedMonth"></select>
               <button class="btn btn-xs bg-light-blue" ng-click="vm.getKvaPerDay(vm.selectedMonth)">>></button>
               </br>
             </div>
             <i class="fa fa-spinner fa-spin fa-2x" ng-show="vm.data[2].length < 3"></i>
             <canvas
               ng-show="vm.data[2].length > 2"
               chart-options="vm.chartKvaPerDayOptions"
               chart-legend="true"
               chart-labels="vm.labels"
               chart-data="vm.data"
               id="bar"
               class="chart chart-bar"
               chart-dataset-override="vm.datasets"
             >
             </canvas>

           </div>
         </div>
         <div class="clearfix"></div>
       </div>
     </div>`;
module.exports = {
  html: html,
  footer: footer
};
