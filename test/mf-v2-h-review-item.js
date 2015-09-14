/*
Microformats Test Suite - Downloaded from github repo: microformats/tests version v0.1.23 
Mocha integration test from: microformats-v2/h-review/item
The test was built on Wed Sep 09 2015 16:39:33 GMT+0100 (BST)
*/

var chai = require('chai'),
   assert = chai.assert,
   helper = require('../test/helper.js');


describe('h-review', function() {
   var htmlFragment = "<base href=\"http://example.com\" >\n<div class=\"h-review\">\n    <p class=\"p-item h-item\">\n        <img class=\"u-photo\" src=\"images/photo.gif\" />\n        <a class=\"p-name u-url\" href=\"http://example.com/crepeoncole\">Crepes on Cole</a>\n    </p>\n    <p><span class=\"p-rating\">5</span> out of 5 stars</p>\n</div>";
   var found = helper.parseHTML(htmlFragment,'http://example.com/');
   var expected = {"items":[{"type":["h-review"],"properties":{"item":[{"value":"Crepes on Cole","type":["h-item"],"properties":{"photo":["http://example.com/images/photo.gif"],"name":["Crepes on Cole"],"url":["http://example.com/crepeoncole"]}}],"rating":["5"],"name":["Crepes on Cole\n    \n    5 out of 5 stars"]}}],"rels":{},"rel-urls":{}};

   it('item', function(){
       assert.deepEqual(found, expected);
   });
});
