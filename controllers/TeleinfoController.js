/** 
  * Gladys Project
  * http://gladysproject.com
  * Software under licence Creative Commons 3.0 France 
  * http://creativecommons.org/licenses/by-nc-sa/3.0/fr/
  * You may not use this software for commercial purposes.
  * @author :: Jean-Philippe Danrée
  */

prices = require('../external/edf.js');
  
module.exports = {

  /**
  * Return prices host
  */
  getPrices: function(req, res, next){
    return res.json(prices);
  },
}

