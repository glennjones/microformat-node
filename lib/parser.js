var httpCodes = require('../lib/httpstatus.json'),
    request = require('request'),
    jsdom   = require('jsdom'),
    shiv  = require('fs').readFileSync(__dirname + '/../lib/microformats-shiv.js').toString(),
    coredef  = require('fs').readFileSync(__dirname + '/../lib/microformats-coredefinition.js').toString(),
    atom  = require('fs').readFileSync(__dirname + '/../lib/microformats-hatomdefinition.js').toString(),
    hresume  = require('fs').readFileSync(__dirname + '/../lib/microformats-hresumedefinition.js').toString(),
    hreview  = require('fs').readFileSync(__dirname + '/../lib/microformats-hreviewdefinition.js').toString(),
    testfixture  = require('fs').readFileSync(__dirname + '/../lib/microformats-testfixturedefinition.js').toString(),
    allFormats ='hCard,XFN,hReview,hCalendar,hAtom,hResume,geo,adr,tag,test-suite,test-fixture'



/**
 * Parse a url for microformats
 * url: absolute url starting with protocal ie htp or https
 * options: supports option.format - format(s) you wish to parse as a single value or a comma delimited list
 * callback: a function which is passed one argument, the return parser object with data or errors 
 */
function parseUrl (url, options, callback) {
   var ufData = { 
                'microformats': {}, 
                'parser-information': {
                  'name': 'Microformat Shiv'
                }, 
              },
  statusCode = '',
  start = new Date(),
  title = '',
  version = ''

  if(url){
    request({uri: url}, function(requestErrors, response, body){

      if(!requestErrors && response.statusCode === 200){
        statusCode = response.statusCode;
        // parse html on successful requesting it
        parseHtml (body, options, callback, url, ufData, statusCode, start);

      }else{
        // add error information if we have any
        if(requestErrors || response) {
          ufData.errors = [];

          if(requestErrors) ufData.errors.push(requestErrors);
          if(response) ufData.errors.push(
            httpCodes[response.statusCode] 
            + ' ' + response.statusCode);
        }
        // create json package with errors
        addMetaData(ufData, start, title, version, statusCode, url);
        callback(ufData);
      }  
    });
  }else{
    ufData.errors = ['no url provided'];
    addMetaData(ufData, start, title, version, statusCode, url);
    callback(ufData);
  }
}



/**
 * Parse a html string for microformats
 * html: a html string
 * options: supports option.format - format(s) you wish to parse as a single value or a comma delimited list
 * callback: a function which is passed one argument, the return parser object with data or errors
 * baseUrl: a url used to resolve relative urls to absolute urls
 */
function parseHtml (html, options, callback, baseUrl){

  // parse all formats if there is no querystring for format
  options.format = options.format || allFormats;

  var ufData = arguments[4] || { 
                'microformats': {}, 
                'parser-information': {
                  'name': 'Microformat Shiv'
                }, 
              },
      statusCode = arguments[5] || '',
      start = arguments[6] || new Date(),
      title = '',
      version = ''



  jsdom.env({
    html: html,
    src: [shiv,coredef,atom,hresume,hreview,testfixture],
    done: function(jsDOMerrors, window) {

      if (!jsDOMerrors) {


        // collect meta data
        title = window.document.title.replace(/(\r\n|\n|\r)/gm,"").trim(); 
        version = window.ufShiv.version;  


        // find base tag if its exists in the header
        var baseTag = window.document.getElementsByTagName('base');
        if(baseTag.length){
          var href = baseTag[0].getAttribute('href');
          if(href)
              baseUrl = href;
        }


        // define containing/root node
        var rootNode = window.document.body;
        var urlObj = require('url').parse(baseUrl, true);
        if(urlObj.hash){
          var hashNode = window.document.getElementById(urlObj.hash.replace('#',''));
          if(hashNode) rootNode = hashNode;
        }


        // loop if we are looking for more than one format
        if(options.format.indexOf(',') > -1){
          var parts = options.format.split(',');
          var i = parts.length,
              x = 0;
          while (x < i) {
              var data = window.ufShiv.get(trim(parts[x]), rootNode, baseUrl);
              for (var key in data.microformats) {
                  if (!data.microformats.hasOwnProperty(key))
                      continue;  // skip this 
                  
                  ufData.microformats[key] = data.microformats[key]
              }
              x++;
          }
        }else{
          ufData = window.ufShiv.get(trim(options.format), rootNode, baseUrl);
        }

      } else{
        process.stdout.write('\n JSDOM error: ' + jsDOMerrors +  "\n");
        ufData.errors = [jsDOMerrors]
      } 


      // add metadata
      addMetaData(ufData, start, title, version, statusCode, baseUrl);
      callback(ufData);
      
      // release memory used by window object
      if (window) window.close();
    }
  });
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


