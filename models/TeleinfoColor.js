/** 
  * Gladys Project
  * http://gladysproject.com
  * Software under licence Creative Commons 3.0 France 
  * http://creativecommons.org/licenses/by-nc-sa/3.0/fr/
  * You may not use this software for commercial purposes.
  * @author :: Jean-Philippe Danrée
  */
  
/**
* TeleinfoColor.js
*
* @description :: Model for Teleinfo color if EJP
* @docs        :: http://sailsjs.org/#!documentation/models
*/

module.exports = {

  attributes: {
    date: {
      type:'date',
      required:true
    },
    color:{
      type:'string',
      required:true,
    }
  }
};

