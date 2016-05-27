/*
Microformats Test Suite - Downloaded from github repo: microformats/tests version v0.1.26 
Mocha integration test from: microformats-v2/h-entry/scriptstyletags
The test was built on Fri May 27 2016 13:35:35 GMT+0100 (BST)
*/

var chai = require('chai'),
   assert = chai.assert,
   helper = require('../test/helper.js');


describe('h-entry', function() {
   var htmlFragment = "<section class=\"h-entry\">\n     <span class=\"p-name\">A post<script>x = 1</script><style>p {color: #fff};</style></span>\n     <div class=\"e-content\">text <strong>bold</strong><script>x = 1</script><style>strong {color: #fff};</style></span></div>\n</section>\n";
   var found = helper.parseHTML(htmlFragment,'http://example.com/');
   var expected = {"items":[{"type":["h-entry"],"properties":{"name":["A post"],"content":[{"value":"text bold","html":"text <strong>bold</strong><script>x = 1</script><style>strong {color: #fff};</style>"}]}}],"rels":{},"rel-urls":{}};

   it('scriptstyletags', function(){
       assert.deepEqual(found, expected);
   });
});
