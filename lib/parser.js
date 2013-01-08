/*!
    Copyright (C) 2010 - 2012 Glenn Jones. All Rights Reserved.
    Open License: https://raw.github.com/glennjones/microformat-node/master/license.txt
*/

var httpCodes    = require('../lib/httpstatus.json'),
    request      = require('request'),
    cheerio      = require('cheerio'),
    UfParser    = require('./ufparser.js').Uf2Parser,
    ufParser    = new UfParser();



  /**
   * Parse a url for microformats
   * url: absolute url starting with protocal ie htp or https
   * options: supports option.formats - format(s) you wish to parse as a single value or a comma delimited list
   *                   option.useCache - waether to use cache in this request
   * callback: a function which is passed one argument, the return parser object with data or errors 
   */
  function parseUrl(url, options, callback) {
    var ufData      = {},
        formats     = '';

    if(options && options.formats){
      formats = options.formats 
    }

    try{
      if(url){
        request({uri: url}, function(requestErrors, response, body){
          if(!requestErrors && response.statusCode === 200){
            parseHtml (body, options, url, callback);
          }else{
            var err = requestErrors + ' - ' + url;
            if(response && response.statusCode){
              err = 'http error: '  + response.statusCode 
              + ' (' + httpCodes[response.statusCode] + ') - ' + url;
            }
            ufData.errors = [err];
            if (callback) { callback(err, ufData); };
          }  
        });
      }else{
        var err = 'no url provided' + ' - ' + url;
        ufData.errors = [err];
        if (callback) { callback(err, ufData); };
      }
    }
    catch(err)
    {
      err = err + ' - ' + url
      ufData.errors = [err];
      if (callback) { callback(err, ufData); };
    }
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

    var ufData = {},
        title       = '',
        version     = '',
        out         = [],
        formats     = '';

    if(options && options.formats){
      formats = options.formats 
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
    var rootNode = $.root();
    var urlObj = require('url').parse(baseUrl, true);
    if(urlObj.hash){
      var hashNode = $(urlObj.hash);
      if(hashNode) {rootNode = hashNode};
    }

    data = ufParser.get($, rootNode, baseUrl, formats);
    if (callback) { callback(null, data); };
    
  }




exports.parseUrl = parseUrl;
exports.parseHtml = parseHtml;


