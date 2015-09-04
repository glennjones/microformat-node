/*
Microformats Test Suite - Downloaded from github repo: glennjones/tests version v0.1.21 
Mocha integration test from: microformats-v2/h-geo/hidden
The test was built on Tue Sep 01 2015 10:27:28 GMT+0100 (BST)
*/

var chai = require('chai'),
   assert = chai.assert,
   helper = require('../test/helper.js');


describe('h-geo', function() {
   var htmlFragment = "<p>\n    <span class=\"h-geo\">The Bricklayer's Arms\n        <span class=\"p-latitude\">\n            <span class=\"value-title\" title=\"51.513458\"> </span> \n        </span>\n        <span class=\"p-longitude\">\n            <span class=\"value-title\" title=\"-0.14812\"> </span>\n        </span>\n    </span>\n</p>";
   var found = helper.parseHTML(htmlFragment,'http://example.com/');
   var expected = {"items":[{"type":["h-geo"],"properties":{"latitude":["51.513458"],"longitude":["-0.14812"],"name":["The Bricklayer's Arms"]}}],"rels":{},"rel-urls":{}};

   it('hidden', function(){
       assert.deepEqual(found, expected);
   });
});
