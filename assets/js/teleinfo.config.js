var translationsEN = {
  TELEINFO_PLUS: 'Data vue',
  TELEINFO_WATT_LINE_TITLE: 'Watt per hour',
  TELEINFO_KWH_BAR_TITLE: 'KvA per day',
  TELEINFO_PRICE_PER_DAY_BAR_TITLE: 'Price per day',
  TELEINFO_PRICE_PER_MONTH_BAR_TITLE: 'Price per month',
  CONTRACT_NUMBER: 'Contract n° ',
  TOMORROW: 'Tomorrow\'s color',
  IINST: 'Instant Intensity',
  PAPP: 'Instant Power',
  CURRENT_PRICE: 'Day price'
};
var translationsFR = {
  TELEINFO_PLUS: 'Données Téléinfo',
  TELEINFO_WATT_LINE_TITLE: 'Watt par heure',
  TELEINFO_KWH_BAR_TITLE: 'KvA par jour',
  TELEINFO_PRICE_PER_DAY_BAR_TITLE: 'Prix par jour',
  TELEINFO_PRICE_PER_MONTH_BAR_TITLE: 'Prix par mois',
  CONTRACT_NUMBER: 'Contrat n° ',
  TOMORROW: 'Couleur de Demain',
  IINST: 'Intensité instantanée',
  PAPP: 'Puissance instantanée',
  CURRENT_PRICE: 'Prix de la journée'
};

angular
.module('gladys')
.config(['$translateProvider', function ($translateProvider) {
  // add translation table
  $translateProvider.translations('en', translationsFR);
  $translateProvider.translations('en', translationsEN);
}]);

