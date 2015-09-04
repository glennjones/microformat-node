/*
Microformats Test Suite - Downloaded from github repo: glennjones/tests version v0.1.21 
Mocha integration test from: microformats-v1/hreview/item
The test was built on Tue Sep 01 2015 10:27:28 GMT+0100 (BST)
*/

var chai = require('chai'),
   assert = chai.assert,
   helper = require('../test/helper.js');


describe('hreview', function() {
   var htmlFragment = "<base href=\"http://example.com\">\n<div class=\"hreview\">\n    <p class=\"item\">\n        <img class=\"photo\" src=\"images/photo.gif\" />\n        <a class=\"fn url\" href=\"http://example.com/crepeoncole\">Crepes on Cole</a>\n    </p>\n    <p><span class=\"rating\">5</span> out of 5 stars</p>\n</div>";
   var found = helper.parseHTML(htmlFragment,'http://example.com/');
   var expected = {"items":[{"type":["h-review"],"properties":{"item":[{"value":"Crepes on Cole","type":["h-item"],"properties":{"photo":["http://example.com/images/photo.gif"],"name":["Crepes on Cole"],"url":["http://example.com/crepeoncole"]}}],"rating":["5"]}}],"rels":{},"rel-urls":{}};

   it('item', function(){
       assert.deepEqual(found, expected);
   });
});
