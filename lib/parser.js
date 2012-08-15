var httpCodes = require('../lib/httpstatus.json'),
    request = require('request'),
    jsdom   = require('jsdom'),
    shiv  = require('fs').readFileSync(__dirname + '/../lib/microformats-shiv.js').toString(),
    coredef  = require('fs').readFileSync(__dirname + '/../lib/microformats-coredefinition.js').toString(),
    atom  = require('fs').readFileSync(__dirname + '/../lib/microformats-hatomdefinition.js').toString(),
    hresume  = require('fs').readFileSync(__dirname + '/../lib/microformats-hresumedefinition.js').toString(),
    hreview  = require('fs').readFileSync(__dirname + '/../lib/microformats-hreviewdefinition.js').toString(),
    allFormats ='hCard,XFN,hReview,hCalendar,hAtom,hResume,geo,adr,tag',
    defaultOut = { 
                'microformats': {}, 
                'parser-information': {
                  'name': 'Microformat Shiv'
                }, 
              };

/**
 * Uses 
 */
function parseUrl (url, options, callback) {
  options = options || {};
  options.format = options.format || allFormats;
  var ufData = defaultOut,
      start = new Date(),
      title = '',
      version = '',
      statusCode = ''

  if(url){

    if(url.indexOf('http://') !== 0 || url.indexOf('http://') !== 0)
      url = 'http://' + url;

    request({uri: url}, function(requestErrors, response, body){

      if(!requestErrors && response.statusCode === 200){

        statusCode = response.statusCode;

       jsdom.env({
          html: body,
          src: [shiv,coredef,atom,hresume,hreview],
          done: function(jsDOMerrors, window) {

            if (!jsDOMerrors) {
              // collect meta data
              title = window.document.title.replace(/(\r\n|\n|\r)/gm,"").trim(); 
              version = window.ufShiv.version;  

              // loop if we are looking for more than one format
              if(options.format.indexOf(',') > -1){
                var parts = options.format.split(',');
                var i = parts.length,
                    x = 0;
                while (x < i) {
                    var data = window.ufShiv.get(parts[x],window.document.body);
                    for (var key in data.microformats) {
                        if (!data.microformats.hasOwnProperty(key))
                            continue;  // skip this 
                        
                        ufData.microformats[key] = data.microformats[key]
                    }
                    x++;
                }
              }else{
                ufData = window.ufShiv.get(options.format,window.document.body);
              }

            } else{
              process.stdout.write('\n JSDOM error: ' + jsDOMerrors +  "\n");
              ufData.errors = [jsDOMerrors]
            } 

            
            addMetaData(ufData, start, title, version, statusCode, url);
            if(callback)
                callback(ufData);
            
            // release memory used by window object
            if (window) window.close();
          }
        });

     }else{
        // add error information if we have any
        if(requestErrors || response) {
          ufData.errors = [];

          if(requestErrors) 
            ufData.errors.push(requestErrors);

          if(response)
            ufData.errors.push(httpCodes[response.statusCode] + ' ' + response.statusCode);
        }

        addMetaData(ufData, start, title, version, statusCode, url);
        if(callback)
            callback(ufData);

     }
    });

  }

}


function addMetaData(ufData, start, title, version, statusCode, url){
  // add meta data to returned object
  var parseInfo = ufData['parser-information']
  if(version !== '') parseInfo['version'] = version;        
  if(title !== '') parseInfo['page-title'] = title; 
  parseInfo['time'] = start.getTime() - new Date().getTime() + 'ms';      
  parseInfo['page-http-status'] = statusCode;
  parseInfo['page-url'] = url;
}




exports.parseUrl = parseUrl;


