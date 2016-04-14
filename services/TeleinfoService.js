/** 
  * Gladys Project
  * http://gladysproject.com
  * Software under licence Creative Commons 3.0 France 
  * http://creativecommons.org/licenses/by-nc-sa/3.0/fr/
  * You may not use this software for commercial purposes.
  * @author :: Jean-Philippe Danrée
  */

  
module.exports = {

  /**
  * Retourne l'intensité et la puissance maximales pour la période donnée
  * @method index
  * @param {} dateBegin
  * @param {} dateEnd
  * @param {} callback
  */
  getMax : function(db, de, callback){
    callback = callback || function(){};
    var request = 'SELECT MAX(`PAPP`) as PAPP, MAX(`IINST`) as IINST ';
    request += 'FROM teleinfo ';
    request += 'WHERE UNIX_TIMESTAMP(datetime) BETWEEN UNIX_TIMESTAMP(?) AND UNIX_TIMESTAMP(?) ';
    request += 'ORDER BY datetime';

    Teleinfo.query(request, [db, de], function(err, result){
      if(err) return callback(err);
      callback(null, result);                
    })
  },

  /**
  * Get PAPP for last n hours
  * @method  getLastHours
  * @param {} dateBegin
  * @param {} dateEnd
  * @param {} optarif
  * @param {} callback
  */

  getLastHours : function(delta, optarif, callback){
    callback = callback || function(){};
    var res = {};
    var price;
    // Get PTEC to build array per option
    var request = 'SELECT PTEC FROM teleinfo WHERE datetime >= NOW() - INTERVAL ? HOUR GROUP BY PTEC';
    Teleinfo.query(request, [delta], function(err, ps){
      if(err) return cb(err);
      async.each(ps, function(p, cb) {
        res[p.PTEC] = [];
        var request = 'SELECT UNIX_TIMESTAMP(datetime) AS date, PAPP as w, PTEC as p, IINST as i';
        request += ' FROM teleinfo ' ;
        request += ' WHERE datetime >= NOW() - INTERVAL ? HOUR ';
        request += ' ORDER BY date';
        Teleinfo.query(request, [delta], function(err, result){
          if(err) return cb(err);
          for(var j = 0; j < result.length; j++) {
            if(result[j].p == p.PTEC && result[j].i > 0) {
              res[p.PTEC].push([Number(result[j].date)*1000,Number(result[j].i)*230]);
            } else {
              res[p.PTEC].push([Number(result[j].date)*1000,null]);
            }
            if(j == result.length-1) price = (Number(result[j].w) * 24 * 365 / 1000);
          }
          return cb();
        });
      }, function(err) {
        if(err) return callback(err);
        callback(null, {data: res, price: price});
      });
    });
  },

  /**
  * Get month in history
  * @method  getMonths
  * @param {} callback
  */

  getMonths : function(next){
    var request = "SELECT DATE_FORMAT(day, '%Y-%m') as month, DATE_FORMAT(day, '%M %Y') as label FROM teleinfohistory GROUP BY DATE_FORMAT(day, '%Y-%m')";
    TeleinfoHistory.query(request, function(err, result) {
      if(err) return next(err);
      return next(null, result);
    });
  },


  /**
  * Get price for the given month 
  * @method  getKwhByMonth 
  * @param {} dateBegin
  * @param {} dateEnd
  * @param {} callback
  */

  getPriceByMonth : function(month, next){
    var request = 'SELECT sum(round(((IF((h.HCHP_FIN - h.HCHP_DEB) is null, \'0\', (h.HCHP_FIN - h.HCHP_DEB)) /1000 * p.HCHP) + ';
    request += '(IF((h.HCHC_FIN - h.HCHC_DEB) is null, \'0\', (h.HCHC_FIN - h.HCHC_DEB)) /1000 * p.HCHC) + ';
    request += '(IF((h.BBRHPJB_FIN - h.BBRHPJB_DEB) is null, \'0\', (h.BBRHPJB_FIN - h.BBRHPJB_DEB)) / 1000 * p.BBRHPJB) + ';
    request += '(IF((h.BBRHPJW_FIN - h.BBRHPJW_DEB) is null, \'0\', (h.BBRHPJW_FIN - h.BBRHPJW_DEB)) / 1000 * p.BBRHPJW) + ';
    request += '(IF((h.BBRHPJR_FIN - h.BBRHPJR_DEB) is null, \'0\', (h.BBRHPJR_FIN - h.BBRHPJR_DEB)) / 1000 * p.BBRHPJR) + ';
    request += '(IF((h.BBRHCJB_FIN - h.BBRHCJB_DEB) is null, \'0\', (h.BBRHCJB_FIN - h.BBRHCJB_DEB)) / 1000 * p.BBRHCJB)+';
    request += '(IF((h.BBRHCJW_FIN - h.BBRHCJW_DEB) is null, \'0\', (h.BBRHCJW_FIN - h.BBRHCJW_DEB)) / 1000 * p.BBRHCJW) + ';
    request += '(IF((h.BBRHCJR_FIN - h.BBRHCJR_DEB) is null, \'0\', (h.BBRHCJR_FIN - h.BBRHCJR_DEB)) / 1000 * p.BBRHCJR) + ';
    request += '(IF((h.BASE_FIN - h.BASE_DEB) is null, \'0\', (h.BASE_FIN - h.BASE_DEB)) / 1000 * p.BASE)), 2)) as price,';
    request += 'h.IMAX as max ';
    request += 'FROM teleinfohistory h ';
    request += 'LEFT JOIN teleinfocontract c ON h.contract = c.id ';
    request += 'LEFT JOIN teleinfoprices p ON p.power = c.ISOUSC * 0.2 ';
    request += ' WHERE ';
    request += 'DATE_FORMAT(day, \'%Y-%m\') = \'' + month + '\'';
    TeleinfoHistory.query(request, [], function(err, result) {
      if(err) return next(err);
      return next(null, result);
    });
  },

  /**
  * Get KwH by day forn last days
  * @method  getkWhByDay
  * @param {} dateBegin
  * @param {} dateEnd
  * @param {} callback
  */

  getKWhByDay : function(range, month, next){
    var request = 'SELECT round((h.HCHP_FIN - h.HCHP_DEB) / 1000,2) as HCHP, ';
    request += 'round((h.HCHC_FIN - h.HCHC_DEB) / 1000,2) as HCHC, ';
    request += 'round((h.BBRHPJB_FIN - h.BBRHPJB_DEB) / 1000,2) as HPJB, ';
    request += 'round((h.BBRHPJW_FIN - h.BBRHPJW_DEB) / 1000,2) as HPJW, ';
    request += 'round((h.BBRHPJR_FIN - h.BBRHPJR_DEB) / 1000,2) as HPJR, ';
    request += 'round((h.BBRHCJB_FIN - h.BBRHCJB_DEB) / 1000,2) as HCJB, ';
    request += 'round((h.BBRHCJW_FIN - h.BBRHCJW_DEB) / 1000,2) as HCJW, ';
    request += 'round((h.BBRHCJR_FIN - h.BBRHCJR_DEB) / 1000,2) as HCJR, ';
    request += 'round((h.BASE_FIN - h.BASE_DEB) / 1000,2) as BASE, ';
    request += 'round(((IF((h.HCHP_FIN - h.HCHP_DEB) is null, \'0\', (h.HCHP_FIN - h.HCHP_DEB)) /1000 * p.HCHP) + ';
    request += '(IF((h.HCHC_FIN - h.HCHC_DEB) is null, \'0\', (h.HCHC_FIN - h.HCHC_DEB)) /1000 * p.HCHC) + ';
    request += '(IF((h.BBRHPJB_FIN - h.BBRHPJB_DEB) is null, \'0\', (h.BBRHPJB_FIN - h.BBRHPJB_DEB)) / 1000 * p.BBRHPJB) + ';
    request += '(IF((h.BBRHPJW_FIN - h.BBRHPJW_DEB) is null, \'0\', (h.BBRHPJW_FIN - h.BBRHPJW_DEB)) / 1000 * p.BBRHPJW) + ';
    request += '(IF((h.BBRHPJR_FIN - h.BBRHPJR_DEB) is null, \'0\', (h.BBRHPJR_FIN - h.BBRHPJR_DEB)) / 1000 * p.BBRHPJR) + ';
    request += '(IF((h.BBRHCJB_FIN - h.BBRHCJB_DEB) is null, \'0\', (h.BBRHCJB_FIN - h.BBRHCJB_DEB)) / 1000 * p.BBRHCJB)+';
    request += '(IF((h.BBRHCJW_FIN - h.BBRHCJW_DEB) is null, \'0\', (h.BBRHCJW_FIN - h.BBRHCJW_DEB)) / 1000 * p.BBRHCJW) + ';
    request += '(IF((h.BBRHCJR_FIN - h.BBRHCJR_DEB) is null, \'0\', (h.BBRHCJR_FIN - h.BBRHCJR_DEB)) / 1000 * p.BBRHCJR) + ';
    request += '(IF((h.BASE_FIN - h.BASE_DEB) is null, \'0\', (h.BASE_FIN - h.BASE_DEB)) / 1000 * p.BASE)), 2) as price,'; 
    request += 'h.IMAX as max, ';
    request += 'DATE_FORMAT(day, \'%Y-%m-%d\') as date ';
    request += 'FROM teleinfohistory h ';
    request += 'LEFT JOIN teleinfocontract c ON h.contract = c.id ';
    request += 'LEFT JOIN teleinfoprices p ON p.power = c.ISOUSC * 0.2 ';
    request += ' WHERE ';
    if(month) {
      request += 'DATE_FORMAT(day, \'%Y-%m\') = \'' + month + '\'';
    } else { 
      request += 'day > NOW() - INTERVAL ' + range + ' MONTH ';
    }
   
    TeleinfoHistory.query(request, [], function(err, result) {
      if(err) return next(err);
      return next(null, result); 
    });
  } 
};
