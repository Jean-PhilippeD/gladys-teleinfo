/** 
  * Gladys Project
  * http://gladysproject.com
  * Software under licence Creative Commons 3.0 France 
  * http://creativecommons.org/licenses/by-nc-sa/3.0/fr/
  * You may not use this software for commercial purposes.
  * @author :: Jean-Philippe Danrée
  */
  
/**
* TeleinfoContract.js
*
* @description :: Model for Teleinfo contract info
* @docs        :: http://sailsjs.org/#!documentation/models
*/

module.exports = {

  attributes: {
    ADCO:{
      type:'string',
      required:true
    },
    OPTARIF:{
      type:'string',
      required:true
    },
    ISOUSC:{
      type:'integer',
      required:true,
    }
  }
};

