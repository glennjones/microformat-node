/*
   Cache
   Copyright (C) 2010 - 2013 Glenn Jones. All Rights Reserved.
   MIT License: https://raw.github.com/glennjones/microformat-node/master/license.txt
   
   */
'use strict';

var cacheItemLimit = 1000,
    cacheTimeLimit = 3600000,  // 3600000 = 1hr,
    active = false,
    logger = {},
    cache  = [];


function setCacheLimits (newCacheTimeLimit, newCacheItemLimit) {
  cacheTimeLimit = newCacheTimeLimit;
  cacheItemLimit = newCacheItemLimit;
}


function get (url) {
  var i = cache.length,
      x = 0;

  while (x < i) {
    if (url === cache[x].url) {
      return cache[x].data;
    }
    x++;
  }
  
  return undefined;
}


function has (url) {
  return (get(url) === undefined) ? false : true;
}


function fetch (url, callback) {
  callback(null, get(url));
}


function set (url, data) {
  // only start cache checks if something is added
  if (!active) {
      active = true;
      checkLimits();
  }

  // check we have not gone over the number items limit
  if (cache.length >= cacheItemLimit) {
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
      out.unshift(cache[x]);
    }
    x++;
  }
  cache = out;

  // close down cache checks once it empty
  if(cache.length > 0){
    setTimeout(checkLimits, 10000);
  }else{
    active = false;
  }
}




exports.get = get;
exports.has = has;
exports.set = set;
exports.fetch = fetch;
exports.setCacheLimits = setCacheLimits;

