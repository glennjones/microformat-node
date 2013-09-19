
  var fs          = require('fs'),
      path        = require('path'),
      request     = require('request'),
      cheerio     = require('cheerio'),
      entities    = require('entities'),
      Parser      = require('../lib/parser.js').Parser,
      parser      = new Parser();

      urls = ['http://localhost:8888/test/h-adr.html',
              'http://localhost:8888/test/h-card.html',
              'http://localhost:8888/test/h-event.html',
              'http://localhost:8888/test/h-entry.html',
              'http://localhost:8888/test/h-geo.html',
              'http://localhost:8888/test/h-news.html',
              'http://localhost:8888/test/h-org.html',
              'http://localhost:8888/test/h-product.html',
              'http://localhost:8888/test/h-recipe.html',
              'http://localhost:8888/test/h-resume.html',
              'http://localhost:8888/test/h-review-aggregate.html',
              'http://localhost:8888/test/h-review.html',
              'http://localhost:8888/test/rel.html',
              'http://localhost:8888/test/url.html',
              'http://localhost:8888/test/includes.html',

              'http://localhost:8888/test/adr.html',
              'http://localhost:8888/test/geo.html',
              'http://localhost:8888/test/hcalendar.html',
              'http://localhost:8888/test/hcard.html',
              'http://localhost:8888/test/hnews.html',
              'http://localhost:8888/test/hproduct.html',
              'http://localhost:8888/test/hentry.html',
              'http://localhost:8888/test/hresume.html',
              'http://localhost:8888/test/hreview-aggregate.html',
              'http://localhost:8888/test/hreview.html',
              'http://localhost:8888/test/mixed-versions.html']

      /*  urls = ['http://localhost:8888/test/h-news.html']*/

           

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
                  json = parseTestFixtures(html, ''),
                  date = new Date().toString()
                  out1 = '/*\r\nMocha integration test from: ' + fileName + '\r\nThe test was built on ' + date + '\r\n*/\r\n\r\n';
                  out2 = '/*\r\nMocha integration test from: ' + fileName + '\r\nThe test was built on ' + date + '\r\n*/\r\n\r\n';

                out1 += "var chai = require('chai'),\r\n   assert = chai.assert,\r\n   helper = require('../test/helper.js');\r\n\r\n\r\n" 
                out2 += "var assert = chai.assert;\r\n\r\n\r\n" 
                var tests = getTests(json);
                out1 += tests;
                out2 += tests;        

                // write the test file for node and the browser
                var filePath1 = '../test/' + fileName.replace('.html','-test.js');
                var filePath2 = '../static/javascript/' + fileName.replace('.html','-test.js');
                console.log(filePath1)
                writeFile(path.resolve(__dirname, filePath1), out1);
                writeFile(path.resolve(__dirname, filePath2), out2);

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
    var dom, rootNode, options;
    options = {
      baseUrl: url,
      filters: ['h-x-test-fixture'],
      includes: false
    }
    dom = cheerio.load(html);
    rootNode = dom.root();

    return parser.get(dom, rootNode, options).data;
  }


  function parseFragment(htmlFragment){
    var dom, rootNode, options;
    options = {
      baseUrl: 'http://example.com/'
    }
    dom = cheerio.load(html);
    rootNode = dom.root();

    return parser.get(dom, rootNode, options).data;
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
          //console.log(json)

          // need to decode html from pre/code block
          var expected = JSON.parse( json.replace(/&lt;/g,"<").replace(/&gt;/g,">") );

          var out = "describe('" + p.name  + "', function() {\r\n"
          out += "   var htmlFragment = " + JSON.stringify(html) + "\r\n";
          out += "   var found = helper.parseHTML(htmlFragment,'http://example.com/')\r\n";
          out += "   var expected = " + JSON.stringify(expected) + "\r\n\r\n"


  /*        if(expected.items[0]){

            if(expected.items[0].value){
              out += getAssertsStr(expected.items[0].value, 'found.items[0].value');
            } 

            if(expected.items[0].type){
              out += getAssertsArr(expected.items[0].type, 'found.items[0].type');
            }

            if(expected.items[0].properties){
              out += getAssertsObj(expected.items[0].properties, 'found.items[0].properties');
            }
          }

          if(expected.items[0].children){

            if(expected.items[0].children.value){
              out += getAssertsStr(expected.items[0].children[0].value, 'found.items[0].children[0].value');
            }

            if(expected.items[0].children.type){
              out += getAssertsArr(expected.items[0].children[0].type, 'found.items[0].children[0].type');
            }

            if(expected.items[0].children.properties){
              out += getAssertsObj(expected.items[0].children[0].properties, 'found.items[0].children[0].properties');
            }
          }*/

          out += getAssertsForRootUF(expected.items[0], 'found.items[0]') + "})\r\n\r\n\r\n\r\n\r\n";
        }
      }else{
        console.log('test-fixture is empty')
      }
      return out;
  }



  function getAssertsForRootUF(expected, path){
    var out = '';

    if(expected){

      if(expected.value){
        out += getAssertsStr(expected.value, path + '.value');
      } 

      if(expected.type){
        out += getAssertsArr(expected.type, path + '.type');
      }

      if(expected.properties){
        out += getAssertsObj(expected.properties, path + '.properties');
      }
    

      if(expected.children){

        if(expected.children.value){
          out += getAssertsStr(expected.children[0].value, path + '.children[0].value');
        }

        if(expected.children.type){
          out += getAssertsArr(expected.children[0].type, path + '.children[0].type');
        }

        if(expected.children.properties){
          out += getAssertsObj(expected.children[0].properties, path + '.children[0].properties');
        }
      }

    }

    return out;
  }



  // creates all the asserts for an object of properties
  function getAssertsObj(properties, path){
    var out = '';
    for (var key in properties) {
       var  arr = properties[key]
            i  = arr.length,
            x   = 0;
        while (x < i) {
          // if item has an array of string i.e. is not an embedded microformat
          if(isString(arr[x])){
            var pathRef = path.replace(/"/g, "'") + "['" + key + "'][" + x + "]";
            var assert =  '   it("' + pathRef + '", function(){\r\n' +
                          '      assert.equal(' + path + '["' + key + '"][' +  x  + '].toString(), "' + escapeText(arr[x]) + '");\r\n' +
                          '   })\r\n'
              out += assert + '\r\n';
          }else{
            // if its an embeded microformat 
            out +=  getAssertsForRootUF(arr[x], path + '["' + key + '"][' +  x  + ']');
          }
          x++;
        }
    }
    return out;
  }


  // creates all the asserts for an array
  function getAssertsArr(arr, path){
    var out = '',
        i   = arr.length,
        x   = 0;

        while (x < i) {
            var pathRef = path.replace(/"/g, "'") + "[" + x + "]";
            var assert =  '   it("' + pathRef + '", function(){\r\n' +
                          '      assert.equal(' + path + '[' +  x  + '].toString(), "' + escapeText(arr[x]) + '");\r\n' +
                          '   })\r\n'
              out += assert + '\r\n';
          x++;
        }
    return out;
  }


  // creates an assert for a string
  function getAssertsStr(str, path){
    var out = '';
        
    var pathRef = path.replace(/"/g, "'");
    var assert =  '   it("' + pathRef + '", function(){\r\n' +
                  '      assert.equal(' + path + ', "' + escapeText(str) + '");\r\n' +
                  '   })\r\n'
      out += assert + '\r\n';
  
    return out;
  }



  // replaces quotes and return chars to escape string for javascript
  function escapeText(str){
      var out = JSON.stringify(str);
      return out.substr(1,out.length-2);
  }



  function isString(obj) {
      return typeof (obj) == 'string';
  };

  exports.updateTests = updateTests;
