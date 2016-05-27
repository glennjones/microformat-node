/*
Microformats Test Suite - Downloaded from github repo: microformats/tests version v0.1.26 
Mocha integration test from: microformats-v2/h-entry/encoding
The test was built on Fri May 27 2016 13:35:35 GMT+0100 (BST)
*/

var chai = require('chai'),
   assert = chai.assert,
   helper = require('../test/helper.js');


describe('h-entry', function() {
   var htmlFragment = "<div class=\"h-entry\">\n    <div class=\"p-name e-content\">x&lt;y AT&amp;T &lt;b&gt;NotBold&lt;/b&gt; <b>Bold</b></div>\n</div>";
   var found = helper.parseHTML(htmlFragment,'http://example.com/');
   var expected = {"items":[{"type":["h-entry"],"properties":{"name":["x<y AT&T <b>NotBold</b> Bold"],"content":[{"value":"x<y AT&T <b>NotBold</b> Bold","html":"x&lt;y AT&amp;T &lt;b&gt;NotBold&lt;/b&gt; <b>Bold</b>"}]}}],"rels":{},"rel-urls":{}};

   it('encoding', function(){
       assert.deepEqual(found, expected);
   });
});
