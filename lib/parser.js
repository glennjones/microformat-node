/*!
    Copyright (C) 2010 - 2012 Glenn Jones. All Rights Reserved.
    Open License: https://raw.github.com/glennjones/microformat-node/master/license.txt
*/

var httpCodes       = require('../lib/httpstatus.json'),
    request         = require('request'),
    cheerio         = require('cheerio'),
    _               = require('underscore')._,
    UfParser        = require('./ufparser.js').UfParser,
    definitions     = require('./ufdefinitions.js'),
    internalLogger  = require('./logger.js'),
    internalCache   = require('./cache.js'),
    internalOptions = require('./options.js');
    parserOption    = _.clone(internalOptions);
    
_.mixin(require('underscore.Deferred'));


// init option, logger and cache on start up
setParserOptions(internalOptions);


// build a ufParser and add definitions
function initParser(options){
  // build ufparser
  var ufParser = new UfParser();

  // add format definition to ufpaser
  ufParser.add('adr',         definitions.adr);
  ufParser.add('hCard',       definitions.hcard);
  ufParser.add('hCalendar',   definitions.hcalendar);
  ufParser.add('geo',         definitions.geo);
  ufParser.add('tag',         definitions.tag);
  ufParser.add('XFN',         definitions.xfn);
  ufParser.add('hEntry',      definitions.hfeed);
  ufParser.add('hAtom',       definitions.hentry);
  ufParser.add('hResume',     definitions.hresume);
  ufParser.add('hReview',     definitions.hreview);
  ufParser.add('test-suite',  definitions.testSuite);
  ufParser.add('test-fixture',definitions.testFixture);
  return ufParser;
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
    var ufData  = { 
                  'microformats': {}, 
                  'parser-information': {
                    'name': 'Microformats Node'
                  }, 
                },
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
              addMetaData(ufData, start, title, version, statusCode, url);
              parserOption.logger.error(err);

              if (callback) { callback(err, ufData); };
              deferred.resolve(err, ufData);

            }  
          });
        }

      }else{
        var err = 'no url provided' + ' - ' + url;
        ufData.errors = [err];
        addMetaData(ufData, start, title, version, statusCode, url);
        parserOption.logger.error(err);

        if (callback) { callback(err, ufData); };
        deferred.resolve(err, ufData);
      }
    }
    catch(err)
    {
      err = err + ' - ' + url
      ufData.errors = [err];
      addMetaData(ufData, start, title, version, statusCode, url);
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
        ufParser    = initParser(),
        title       = '',
        version     = '';

    // check options for new formats override
    if(options){
        if(options.formats){ formats = options.formats};
    }


    // if promise is not passsed in create one
    if(!deferred){
      deferred = _.Deferred();
      var promise = deferred.promise();
    }

    // start logging if function called externaly 
    if(arguments.length == 4){
      parserOption.logger.info('microformats-node started - with html');
    }


    var startedDOMParse = new Date();
    var $ = cheerio.load(html); 


    // collect meta data
    title = $('title').text().replace(/(\r\n|\n|\r)/gm,"").trim(); 
    version = ufParser.version;  


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

    // log DOM parse time
    var msDOM = new Date().getTime() - startedDOMParse.getTime();
    parserOption.logger.log('time to parse DOM: ' + msDOM + 'ms - ' + baseUrl);
    var startedUFParse = new Date();


    // loop if we are looking for more than one formats
    if(formats.indexOf(',') > -1){
      var parts = formats.split(',');
      var i = parts.length,
          x = 0;
      while (x < i) {
          var format = trim(parts[x]);
          if(ufParser[trim(parts[x])] === undefined){
            parserOption.logger.warn('microformat not found/surported: ' + format);
          }else{
            var data = ufParser.get($, format, rootNode, baseUrl, ownerDocument);
            for (var key in data.microformats) {
                if (!data.microformats.hasOwnProperty(key))
                    continue;  // skip this 
                
                ufData.microformats[key] = data.microformats[key]
            }
          }
          x++;
      }
    }else{
      ufData = ufParser.get($, trim(formats), rootNode, baseUrl, ownerDocument);
    }

    // log uf parse time
    var msUF = new Date().getTime() - startedUFParse.getTime();
    parserOption.logger.log('time to parse microformats: ' + msUF + 'ms - ' + baseUrl);


    // add metadata
    addMetaData(ufData, start, title, version, statusCode, baseUrl);


    // log total time taken
    var msTotal = new Date().getTime() - start.getTime();
    parserOption.logger.info('total time taken to parse time: ' + msTotal + 'ms - ' + baseUrl);


    // callback or promise
    if (callback) { callback(null, ufData); };
    deferred.resolve(null, ufData);

    return promise;
        
  }




// adds parser meta data to returned ufData object
function addMetaData(ufData, start, title, version, statusCode, url){
  var parseInfo = ufData['parser-information']
  if(version !== '') parseInfo['version'] = version;        
  if(title !== '') parseInfo['page-title'] = title; 
  parseInfo['time'] =  new Date().getTime() - start.getTime() + 'ms';      
  parseInfo['page-http-status'] = statusCode;
  parseInfo['page-url'] = url;
}


// removes unwanted whitespace from start and end of a string
function trim(str) {
  return str.replace(/^\s+|\s+$/g, "");
}




exports.parseUrl = parseUrl;
exports.parseHtml = parseHtml;
exports.setParserOptions = setParserOptions;

