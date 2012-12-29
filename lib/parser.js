/*!
    Copyright (C) 2010 - 2012 Glenn Jones. All Rights Reserved.
    Open License: https://raw.github.com/glennjones/microformat-node/master/license.txt
*/

var httpCodes       = require('../lib/httpstatus.json'),
    request         = require('request'),
    cheerio         = require('cheerio'),
    _               = require('underscore')._,
    Uf1Parser       = require('./uf1parser.js').Uf1Parser,
    Uf2Parser       = require('./uf2parser.js').Uf2Parser,
    definitions     = require('./ufdefinitions.js'),
    internalLogger  = require('./logger.js'),
    internalCache   = require('./cache.js'),
    internalOptions = require('./options.js');
    parserOption    = _.clone(internalOptions);
    
_.mixin(require('underscore.Deferred'));


var HelperText = require('../lib/helper-text1.js').HelperText,
    helperText = new HelperText();


// init option, logger and cache on start up
setParserOptions(internalOptions);
var uf2Parser = new Uf2Parser();

// build a Uf1Parser and add definitions
function initParser(options){
  // build Uf1Parser
  var uf1Parser = new Uf1Parser();
  

  // add format definition to ufpaser
  uf1Parser.add('adr',         definitions.adr);
  uf1Parser.add('hCard',       definitions.hcard);
  uf1Parser.add('hCalendar',   definitions.hcalendar);
  uf1Parser.add('geo',         definitions.geo);
  uf1Parser.add('tag',         definitions.tag);
  uf1Parser.add('XFN',         definitions.xfn);
  uf1Parser.add('hEntry',      definitions.hfeed);
  uf1Parser.add('hAtom',       definitions.hentry);
  uf1Parser.add('hResume',     definitions.hresume);
  uf1Parser.add('hReview',     definitions.hreview);
  uf1Parser.add('test-suite',  definitions.testSuite);
  uf1Parser.add('test-fixture',definitions.testFixture);

  uf1Parser.add('h-resume',      definitions.hresume2);
  uf1Parser.add('h-entry',       definitions.hentry2);
  uf1Parser.add('h-adr',         definitions.hadr);
  uf1Parser.add('h-geo',         definitions.hgeo);
  uf1Parser.add('h-card',        definitions.hcard2);
  uf1Parser.add('h-event',       definitions.hevent);
  uf1Parser.add('h-x-test-suite',definitions.htestSuite);
  uf1Parser.add('h-x-test-fixture',definitions.htestFixture);
  uf1Parser.add('h-x-assert',      definitions.hassert);

  return uf1Parser;
}



  /**
   * Set options for the parser
   * options: can contain logLevel, logger and cache
   */
  function setParserOptions(options){
    options = options || {};


    // setup logLevel, cache and logger
    parserOption.cache = options.cache || internalCache;  
    parserOption.logger = options.logger || internalLogger;
    parserOption.logLevel = options.logLevel || parserOption.logLevel;

    // set cache and logger internal properties
    if(parserOption.logger.setLogLevel){
      parserOption.logger.setLogLevel( parserOption.logLevel );
    }
    if(parserOption.cache.setCacheLimits){
      parserOption.cache.setCacheLimits( parserOption.cacheTimeLimit, parserOption.cacheItemLimit, parserOption.logger );
    }
  }


  /**
   * Parse a url for microformats
   * url: absolute url starting with protocal ie htp or https
   * options: supports option.formats - format(s) you wish to parse as a single value or a comma delimited list
   *                   option.useCache - waether to use cache in this request
   * callback: a function which is passed one argument, the return parser object with data or errors 
   */
  function parseUrl(url, options, callback) {
    var ufData  = {},
        statusCode      = '',
        start           = new Date(),
        title           = '',
        version         = '',
        formats         = internalOptions.formats,
        useCache        = internalOptions.useCache,
        deferred        = _.Deferred(),
        promise         = deferred.promise();
    

    // check options for new formats and useCache overrides
    if(options){
        if(options.formats){ formats = options.formats };
        if(options.useCache){ useCache = options.useCache };
    }


    try{
      if(url){
        parserOption.logger.info('microformats-node started - with url: ' + url);

        if (useCache && parserOption.cache && parserOption.cache.has(url)) {
          // from cache
          parserOption.logger.log('fetched html from cache: ' + url); 
          parseHtml(parserOption.cache.get(url), options, url, callback, ufData, 200, start, deferred, formats);
        } else {
          request({uri: url}, function(requestErrors, response, body){
            if(!requestErrors && response.statusCode === 200){

              // add html into the cache
              if (parserOption.cache && useCache) {
                parserOption.cache.set(url, body) 
              };

              var ended = new Date();
              var ms = ended.getTime() - start.getTime();
              parserOption.logger.log('fetched html from page: ' + ms + 'ms - ' + url);

              statusCode = response.statusCode;
              // parse html on successful requesting it
              parseHtml (body, options, url, callback, ufData, statusCode, start, deferred, formats);

            }else{
              // add error information
              var err = requestErrors + ' - ' + url;
              if(response && response.statusCode){
                err = 'http error: '  + response.statusCode 
                + ' (' + httpCodes[response.statusCode] + ') - ' + url;
              }
              
              ufData.errors = [err];
              //addMetaData(ufData, start, title, version, statusCode, url);
              parserOption.logger.error(err);

              if (callback) { callback(err, ufData); };
              deferred.resolve(err, ufData);

            }  
          });
        }

      }else{
        var err = 'no url provided' + ' - ' + url;
        ufData.errors = [err];
        //addMetaData(ufData, start, title, version, statusCode, url);
        parserOption.logger.error(err);

        if (callback) { callback(err, ufData); };
        deferred.resolve(err, ufData);
      }
    }
    catch(err)
    {
      err = err + ' - ' + url
      ufData.errors = [err];
      //addMetaData(ufData, start, title, version, statusCode, url);
      parserOption.logger.error(err);

      if (callback) { callback(err, ufData); };
      deferred.resolve(err, ufData);
    }

    return promise;
  }





  /**
   * Parse a html string for microformats
   * html: a html string
   * options: supports option.formats - format(s) you wish to parse as a single value or a comma delimited list
   *                   option.useCache - waether to use cache in this request
   * callback: a function which is passed one argument, the return parser object with data or errors
   * baseUrl: a url used to resolve relative urls to absolute urls
   */
  function parseHtml(html, options, baseUrl, callback){

    var ufData = arguments[4] || { 
                  'microformats': {}, 
                  'parser-information': {
                    'name': 'Microformat Node'
                  }, 
                },
        statusCode  = arguments[5] || '',
        start       = arguments[6] || new Date(),
        deferred    = arguments[7] || null,
        formats     = arguments[8] || internalOptions.formats;
        uf1Parser    = initParser(),
        title       = '',
        version     = '',
        out         = [];

    // check options for new formats override
    if(options){
        if(options.formats){ formats = options.formats};
    }

    // if promise is not passsed in create one
    if(!deferred){
      deferred = _.Deferred();
      var promise = deferred.promise();
    }

        if(html.indexOf('<html') === -1){
      html = '<html>' + html + '</html>';
    }

    var $ = cheerio.load(html); 

    // find base tag if its exists in the header
    var baseTag = $('base');
    if(baseTag.length > 0){
      var href = $(baseTag).attr('href');
      if(href)
          baseUrl = href;
    }



    // define containing/root node - take hash from url
    var rootNode = ownerDocument = $('html');
    var urlObj = require('url').parse(baseUrl, true);
    if(urlObj.hash){
      var hashNode = $(urlObj.hash);
      if(hashNode) {rootNode = hashNode};
    }

    data2 = uf2Parser.get($, rootNode, baseUrl, ownerDocument, formats);


    // callback or promise
    if (callback) { callback(null, data2); };
    deferred.resolve(null, data2);

    return promise;
        
  }





// adds parser meta data to returned ufData object
function addMetaData(ufData, start, title, version, statusCode, url){
/*  var parseInfo = ufData['parser-information']
  if(version !== '') parseInfo['version'] = version;        
  if(title !== '') parseInfo['page-title'] = title; 
  parseInfo['time'] =  new Date().getTime() - start.getTime() + 'ms';      
  parseInfo['page-http-status'] = statusCode;
  parseInfo['page-url'] = url;*/
}


function isEmpty(obj) {
    for(var prop in obj) {
        if(obj.hasOwnProperty(prop))
            return false;
    }
    return true;
}

// removes unwanted whitespace from start and end of a string
function trim(str) {
  return str.replace(/^\s+|\s+$/g, "");
}




exports.parseUrl = parseUrl;
exports.parseHtml = parseHtml;
exports.setParserOptions = setParserOptions;


