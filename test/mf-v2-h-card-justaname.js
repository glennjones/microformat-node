/*
Microformats Test Suite - Downloaded from github repo: glennjones/tests version v0.1.21 
Mocha integration test from: microformats-v2/h-card/justaname
The test was built on Tue Sep 01 2015 10:27:28 GMT+0100 (BST)
*/

var chai = require('chai'),
   assert = chai.assert,
   helper = require('../test/helper.js');


describe('h-card', function() {
   var htmlFragment = "<p class=\"h-card\">Frances Berriman</p>";
   var found = helper.parseHTML(htmlFragment,'http://example.com/');
   var expected = {"items":[{"type":["h-card"],"properties":{"name":["Frances Berriman"]}}],"rels":{},"rel-urls":{}};

   it('justaname', function(){
       assert.deepEqual(found, expected);
   });
});
