/** 
  * Gladys Project
  * http://gladysproject.com
  * Software under licence Creative Commons 3.0 France 
  * http://creativecommons.org/licenses/by-nc-sa/3.0/fr/
  * You may not use this software for commercial purposes.
  * @author :: Jean-Philippe Danrée
  */
  
/**
* TeleinfoConfig.js
*
* @description :: Model for Teleinfo configuration
* @docs        :: http://sailsjs.org/#!documentation/models
*/

module.exports = {
  attributes: {
    tty: {
      type: 'string',
      required: true,
      unique: true
    },
    step: {
      type: 'integer',
      required: true
    },
    retention: {
      type: 'integer',
      required: true
    }
  }
};

