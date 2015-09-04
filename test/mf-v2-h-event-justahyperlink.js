/*
Microformats Test Suite - Downloaded from github repo: glennjones/tests version v0.1.21 
Mocha integration test from: microformats-v2/h-event/justahyperlink
The test was built on Tue Sep 01 2015 10:27:28 GMT+0100 (BST)
*/

var chai = require('chai'),
   assert = chai.assert,
   helper = require('../test/helper.js');


describe('h-event', function() {
   var htmlFragment = "<a class=\"h-event\" href=\"http://indiewebcamp.com/2012\">IndieWebCamp 2012</a>";
   var found = helper.parseHTML(htmlFragment,'http://example.com/');
   var expected = {"items":[{"type":["h-event"],"properties":{"name":["IndieWebCamp 2012"],"url":["http://indiewebcamp.com/2012"]}}],"rels":{},"rel-urls":{}};

   it('justahyperlink', function(){
       assert.deepEqual(found, expected);
   });
});
