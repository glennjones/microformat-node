/*!
    Copyright (C) 2010 - 2012 Glenn Jones. All Rights Reserved.
    Open License: https://raw.github.com/glennjones/microformat-node/master/license.txt
*/

module.exports = {

  /*global options*/

  // The level at which to log
  //  error  1
  //  warn   2
  //  info   3
  //  log    4
  logLevel: 3,

  // The amount of time items are keep in the
  // cache for before they are discarded. Time in 
  // milliseconds.
  cacheTimeLimit: 3600000,  // 3600000 = 1hr

  // The number of items to keep in cache before
  // some are discarded. Use to limit memory use
  cacheItemLimit: 1000,



  /*single parse options*/

  // Weather a request used cache
  useCache: false,

  // The default formats list. The comma delimited 
  // list talls the parser which microformats to 
  // parse. The names are case sent case sensitive.   
  formats: 'h-card,h-adr,h-geo,h-tag,h-event,h-resume,h-feed,h-entry,hCard,XFN,hReview,hCalendar,hAtom,hResume,geo,adr,tag,test-fixture,test-suite,h-x-test-suite,h-x-test-fixture,h-x-assert'


}