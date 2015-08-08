/*
Microformats Test Suite - Downloaded from github repo: glennjones/tests version v0.1.17 
Mocha integration test from: microformats-v2/h-entry/justaname
The test was built on Sun Jun 14 2015 10:55:15 GMT+0100 (BST)
*/

var chai = require('chai'),
   assert = chai.assert,
   helper = require('../test/helper.js');


describe('h-entry', function() {
   var htmlFragment = "<p class=\"h-entry\" lang=\"se\"><div class=\"e-content\" lang=\"en\">microformats.org at 7</div></p>";
   var found = helper.parseHTML(htmlFragment,'http://example.com/');
   var expected = {"items":[{"type":["h-entry"],"lang":"se","properties":{"content":[{"lang":"en","value":"microformats.org at 7","html":"microformats.org at 7"}],"name":["microformats.org at 7"]}}],"rels":{},"rel-urls":{}};

   it('lang', function(){
       assert.deepEqual(found, expected);
   });
});
