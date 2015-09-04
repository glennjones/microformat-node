/*
Microformats Test Suite - Downloaded from github repo: glennjones/tests version v0.1.21 
Mocha integration test from: microformats-v1/hreview-aggregate/justahyperlink
The test was built on Tue Sep 01 2015 10:27:28 GMT+0100 (BST)
*/

var chai = require('chai'),
   assert = chai.assert,
   helper = require('../test/helper.js');


describe('hreview-aggregate', function() {
   var htmlFragment = "<p class=\"hreview-aggregate\">\n    <span class=\"item\">\n        <a class=\"fn url\" href=\"http://example.com/mediterraneanwraps\">Mediterranean Wraps</a>\n    </span> - Rated: \n    <span class=\"rating\">4.5</span> out of 5 (<span class=\"count\">6</span> reviews)\n</p>";
   var found = helper.parseHTML(htmlFragment,'http://example.com/');
   var expected = {"items":[{"type":["h-review-aggregate"],"properties":{"item":[{"value":"Mediterranean Wraps","type":["h-item"],"properties":{"name":["Mediterranean Wraps"],"url":["http://example.com/mediterraneanwraps"]}}],"rating":["4.5"],"count":["6"]}}],"rels":{},"rel-urls":{}};

   it('justahyperlink', function(){
       assert.deepEqual(found, expected);
   });
});
