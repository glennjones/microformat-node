/*
Microformats Test Suite - Downloaded from github repo: glennjones/tests version v0.1.21 
Mocha integration test from: microformats-v1/hcard/justahyperlink
The test was built on Tue Sep 01 2015 10:27:28 GMT+0100 (BST)
*/

var chai = require('chai'),
   assert = chai.assert,
   helper = require('../test/helper.js');


describe('hcard', function() {
   var htmlFragment = "<a class=\"vcard\" href=\"http://benward.me/\">Ben Ward</a>";
   var found = helper.parseHTML(htmlFragment,'http://example.com/');
   var expected = {"items":[{"type":["h-card"],"properties":{}}],"rels":{},"rel-urls":{}};

   it('justahyperlink', function(){
       assert.deepEqual(found, expected);
   });
});
