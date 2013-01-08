/*!
    Copyright (C) 2010 - 2012 Glenn Jones. All Rights Reserved.
    Open License: https://raw.github.com/glennjones/microformat-node/master/license.txt
*/

var cacheItemLimit = 0,
    cacheTimeLimit = 0,
    logger = {},
    cache   = [];


function setCacheLimits(newCacheTimeLimit, newCacheItemLimit, alogger){
  cacheTimeLimit = newCacheTimeLimit;
  cacheItemLimit = newCacheItemLimit;
  logger = alogger;
}


function get (url) {
  var i = cache.length;
  var x = 0;
  while (x < i) {
    if(url === cache[x].url){
      return cache[x].data;
    }
    x++;
  }
  return undefined;
}


function has(url) {
  return (get(url) === undefined)? false : true;
}


function fetch (url, callback) {
  callback(null, get(url));
}


function set (url, data) {
  if(cache.length >= cacheItemLimit){
    if(logger.log){'over cache item limit - removed item ' + cache.length}
    cache.pop();
  }
  return cache.unshift( {
    url : url,
    time : new Date().getTime(),
    data : data
  });
}


function checkLimits () {
  var time = new Date().getTime(),
      i,
      x =0,
      out =[];

  i = cache.length;
  while (x < i) {
      if ((time - cache[x].time) < cacheTimeLimit) {
          if(logger.log){'out of date cache item - removed: ' + cache[x].url}
          out.unshift(cache[x]);
      }
      x++;
  }
  cache = out;


  setTimeout(checkLimits, 10000);
}

checkLimits ();

exports.get = get;
exports.has = has;
exports.set = set;
exports.fetch = fetch;
exports.setCacheLimits = setCacheLimits;