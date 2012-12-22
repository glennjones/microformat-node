
  var fs          = require('fs'),
      path        = require('path'),
      request     = require('request'),
      cheerio     = require('cheerio'),
      Uf2Parser   = require('./uf2parser.js').Uf2Parser;


  var uf2Parser = new Uf2Parser()
      urls = ['https://raw.github.com/microformats/tests/master/h-card.html',
              'https://raw.github.com/microformats/tests/master/h-event.html',
              'https://raw.github.com/microformats/tests/master/h-entry.html']

      urls = ['http://localhost:8888/test/h-card/',
              'http://localhost:8888/test/h-event/',
              'http://localhost:8888/test/h-entry/']

  function updateTests(){

    var i  = urls.length,
    x   = 0;
    while (x < i) {
      var testUrl = urls[x];

       function writeTest(testUrl) {
          var url = testUrl;

          getTextFromRepo(url, function(err, html){
            if(html){
                var parts = url.split('/'),
                  fileName = parts[parts.length-1],
                  json = parseTestFixtures(html, url),
                  date = new Date().toString()
                  out = '/*\r Mocha integration test from: ' + fileName + '\rThe test was built on ' + date + '\r*/\r\r';

                // allow for localhost fomat
                if(parts[parts.length-1] === ''){
                  fileName = parts[parts.length-2] + '.html';
                }

                out += "var chai = require('chai'),\r   assert = chai.assert,\r   helper = require('../test/helper.js');\r\r\r" 
                out += getTests(json);        

                // write the test file
                var filePath = '../test/' + fileName.replace('.html','-test.js');
                console.log(filePath)
                writeFile(path.resolve(__dirname, filePath), out);

                // we get latest version from github replace the local copy
                filePath = '../static/' + fileName;
                if(url.indexOf('localhost') === -1){
                  writeFile(path.resolve(__dirname, filePath), html);
                }

                console.log(fileName.replace('.html','-test.js'))
              }else{
                console.log(err)
            }
          });

        }
        writeTest(testUrl);

   

        x++;
    }

  }


  function getTextFromRepo(url, callback){
    request({uri: url}, function(requestErrors, response, body){
      if(!requestErrors && response.statusCode === 200){
          callback(null, body)
        }else{
          callback(requestErrors, null)
      }  
    });
  }


  function parseTestFixtures(html, url){
    var $ = cheerio.load(html); 
    var rootNode = ownerDocument = $('html');
    return uf2Parser.get($, rootNode, url, ownerDocument, 'h-x-test-fixture');
  }


  function parseFragment(htmlFragment){
    var $ = cheerio.load(htmlFragment); 
    var rootNode = ownerDocument = $('html');
    return uf2Parser.get($, rootNode, 'http://example.com/', ownerDocument);
  }


  function writeFile(path, content){
    fs.writeFile(path, content, 'utf8', function(err) {
      if(err) {
        console.log(err);
      } else {
        console.log('The file: ' + path + ' was saved');
      }
    }); 
  }


  function getTests(json){
      var out = []
      // While loop
      var i = json.items.length;
      var x = 0;
      while (x < i) {
          out.push(getTest(json.items[x]))
          x++;
      }
      return out.join('');
  }


  function getTest(testFixture){
      var out = '';
      if(testFixture && testFixture.properties){
        var p = testFixture.properties
        console.log('writing test: ' + p.name)

        if(p['x-output'] && p['x-microformat']){
          var json = p['x-output'][0];
          var html = p['x-microformat'][0];
          console.log(json)
          var expected = JSON.parse( json );

          var out = "describe('" + p.name  + "', function() {\r"
          out += "   var htmlFragment = " + JSON.stringify(html) + "\r";
          out += "   var found = helper.parseHTML(htmlFragment,'http://example.com/')\r";
          out += "   var expected = " + JSON.stringify(expected) + "\r\r"

          out += '   it("deep object match", function(){\r' +
                 '      assert.equal(JSON.stringify(found), JSON.stringify(expected), "failed object match");\r' +
                 '   })\r';

          if(expected.items[0] && expected.items[0].properties){
            out += getAsserts(expected.items[0].properties, 'found.items[0].properties');
          }

          if(expected.items[0] && expected.items[0].children){
            out += getAsserts(expected.items[0].children[0].properties, 'found.items[0].children[0].properties');
          }

          out += "})\r\r\r\r\r";
        }
      }else{
        console.log('test-fixture is empty')
      }
      return out;
  }


  // creates all the asserts for an array of properties
  function getAsserts(properties, path){
    var out = '';
    for (var key in properties) {
       var  arr = properties[key]
            i  = arr.length,
            x   = 0;
        while (x < i) {

          // if item has an array of string ie is not an embedded microformat
          if(isString(arr[x])){
            var pathRef = path.replace(/"/g, "'") + '.' + key + '[' + x + ']';
            var assert =  '   it("' + pathRef + '", function(){\r' +
                          '      assert.equal(' + path + '["' + key + '"][' +  x  + '].toString(), "' + escapeText(arr[x]) + '");\r' +
                          '   })\r'
              out += assert + '\r';
          }else{
            out += getAsserts(arr[x].properties, path + '["' + key + '"][' +  x  + '].properties');
          }
          x++;
        }
    }
    return out;
  }



  // replaces quotes and return chars to escape string for javascript
  function escapeText(str){
      return JSON.stringify(str).substr(1,str.length);
  }

  function isString(obj) {
      return typeof (obj) == 'string';
  };

  exports.updateTests = updateTests;
