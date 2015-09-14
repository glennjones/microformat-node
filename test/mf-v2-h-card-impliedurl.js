/*
Microformats Test Suite - Downloaded from github repo: microformats/tests version v0.1.23 
Mocha integration test from: microformats-v2/h-card/impliedurl
The test was built on Wed Sep 09 2015 16:39:33 GMT+0100 (BST)
*/

var chai = require('chai'),
   assert = chai.assert,
   helper = require('../test/helper.js');


describe('h-card', function() {
   var htmlFragment = "<a class=\"h-card\" href=\"jane.html\">Jane Doe</a>\n<area class=\"h-card\" href=\"jane.html\" alt=\"Jane Doe\"/ >\n<div class=\"h-card\" ><a href=\"jane.html\">Jane Doe</a><p></p></div> \n<div class=\"h-card\" ><area href=\"jane.html\">Jane Doe</area><p></p></div>\n<div class=\"h-card\" ><a class=\"h-card\" href=\"jane.html\">Jane Doe</a><p></p></div> ";
   var found = helper.parseHTML(htmlFragment,'http://example.com/');
   var expected = {"items":[{"type":["h-card"],"properties":{"name":["Jane Doe"],"url":["http://example.com/jane.html"]}},{"type":["h-card"],"properties":{"name":["Jane Doe"],"url":["http://example.com/jane.html"]}},{"type":["h-card"],"properties":{"name":["Jane Doe"],"url":["http://example.com/jane.html"]}},{"type":["h-card"],"properties":{"name":["Jane Doe"],"url":["http://example.com/jane.html"]}},{"type":["h-card"],"properties":{"name":["Jane Doe"]},"children":[{"value":"Jane Doe","type":["h-card"],"properties":{"name":["Jane Doe"],"url":["http://example.com/jane.html"]}}]}],"rels":{},"rel-urls":{}};

   it('impliedurl', function(){
       assert.deepEqual(found, expected);
   });
});
