/** 
  * Gladys Project
  * http://gladysproject.com
  * Software under licence Creative Commons 3.0 France 
  * http://creativecommons.org/licenses/by-nc-sa/3.0/fr/
  * You may not use this software for commercial purposes.
  * @author :: Jean-Philippe Danrée
  */
  
/**
* Teleinfo.js
*
* @description :: Model for Teleinfo data
* @docs        :: http://sailsjs.org/#!documentation/models
*/

module.exports = {
  migration: 'safe',
  attributes: {
    HCHP:{
      type:'integer',
    },
    HCHC:{
      type:'integer',
    },
    BBRHPJB:{
      type:'integer',
    },
    BBRHCJB:{
      type:'integer',
    },
    BBRHPJW:{
      type:'integer',
    },
    BBRHCJW:{
      type:'integer',
    },
    BBRHPJR:{
      type:'integer',
    },
    BBRHCJR:{
      type:'integer',
    },
    HHPHC:{
      type:'string'
    },
    BASE:{
      type:'string'
    },
    PTEC:{
      type:'string'
    },
    PAPP:{
      type:'string'
    },
    IINST:{
      type:'string'
    },
    IMAX:{
      type:'integer'
    },
    datetime:{
      type:'datetime',
      required:true
    },
    contract:{
      model:'TeleinfoContract',
      required:true
    }
  },

  beforeValidate: function (values, next) {
    // If no datetime is set, set to actual time
    if (!values.datetime) {
                values.datetime = new Date();
    }
    next();
  }
 
};

