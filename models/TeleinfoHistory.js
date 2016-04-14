/** 
  * Gladys Project
  * http://gladysproject.com
  * Software under licence Creative Commons 3.0 France 
  * http://creativecommons.org/licenses/by-nc-sa/3.0/fr/
  * You may not use this software for commercial purposes.
  * @author :: Jean-Philippe Danrée
  */
  
/**
* TeleinfoHistory.js
*
* @description :: Model for Teleinfo data history
* @docs        :: http://sailsjs.org/#!documentation/models
*/

module.exports = {
  migration: 'safe',
  attributes: {
    HCHP_DEB:{
      type:'integer',
    },
    HCHC_DEB:{
      type:'integer',
    },
    BBRHPJB_DEB:{
      type:'integer',
    },
    BBRHCJB_DEB:{
      type:'integer',
    },
    BBRHPJW_DEB:{
      type:'integer',
    },
    BBRHCJW_DEB:{
      type:'integer',
    },
    BBRHPJR_DEB:{
      type:'integer',
    },
    BBRHCJR_DEB:{
      type:'integer',
    },
    HPHC_DEB:{
      type:'string'
    },
    BASE_DEB:{
      type:'string'
    },
    HCHP_FIN:{
      type:'integer',
    },
    HCHC_FIN:{
      type:'integer',
    },
    BBRHPJB_FIN:{
      type:'integer',
    },
    BBRHCJB_FIN:{
      type:'integer',
    },
    BBRHPJW_FIN:{
      type:'integer',
    },
    BBRHCJW_FIN:{
      type:'integer',
    },
    BBRHPJR_FIN:{
      type:'integer',
    },
    BBRHCJR_FIN:{
      type:'integer',
    },
    HPHC_FIN:{
      type:'string'
    },
    BASE_FIN:{
      type:'string'
    },
    IMAX:{
      type: 'string'
    },
    day:{
      type: 'datetime',
      required:true
    },
    contract:{
      model:'TeleinfoContract',
      required:true
    }
  },

  beforeValidate: function (values, next) {
    // If no datetime is set, set to actual time
    if (!values.day) {
                values.day = new Date();
    }
    next();
  }

};

