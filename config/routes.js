/**
 * Routes rules
 * @doc http://sailsjs.org/documentation/concepts/routes
 */

module.exports.routes = {
  '/teleinfo/index': 'TeleinfoController.index',
  '/teleinfo/subscribe' : 'TeleinfoController.subscribe',
  '/teleinfo/update' : 'TeleinfoController.update',
  '/teleinfo/destroy' : 'TeleinfoController.destroy',
  '/teleinfo/devices' : 'TeleinfoController.devices',
  '/teleinfo/kwh/:month/:range' : 'TeleinfoController.kWhByDay',
  '/teleinfo/color' : 'TeleinfoController.getColorOfDay',
  '/teleinfo/months' : 'TeleinfoController.getMonths',
  '/teleinfo/price' : 'TeleinfoController.priceForCurrentMonth'
};
