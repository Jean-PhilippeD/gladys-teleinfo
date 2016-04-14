/** 
  * Gladys Project
  * http://gladysproject.com
  * Software under licence Creative Commons 3.0 France 
  * http://creativecommons.org/licenses/by-nc-sa/3.0/fr/
  * You may not use this software for commercial purposes.
  * @author :: Jean-Philippe Danrée
  */
  
/**
* TeleinfoPrices.js
*
* @description :: Model for Teleinfo prics
* @docs        :: http://sailsjs.org/#!documentation/models
*/

module.exports = {
  attributes: {
    power: {
      type:'integer',
      required:true,
      unique: true,
      primaryKey: true,
    },
    HCHP:{
      type:'float',
    },
    HCHC:{
      type:'float',
    },
    BBRHPJB:{
      type:'float',
    },
    BBRHCJB:{
      type:'float',
    },
    BBRHPJW:{
      type:'float',
    },
    BBRHCJW:{
      type:'float',
    },
    BBRHPJR:{
      type:'float',
    },
    BBRHCJR:{
      type:'float',
    },
    EJPHPM:{
      type:'float',
    },
    EJPHPN:{
      type:'float',
    },
    BASE:{
      type:'string'
    },
    aboBase: {
      type:'float'
    },
    aboHC: {
      type:'float'
    },
    aboBBR: {
      type:'float'
    }
  }
};

