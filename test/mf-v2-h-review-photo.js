/*
Microformats Test Suite - Downloaded from github repo: microformats/tests version v0.1.23 
Mocha integration test from: microformats-v2/h-review/photo
The test was built on Wed Sep 09 2015 16:39:33 GMT+0100 (BST)
*/

var chai = require('chai'),
   assert = chai.assert,
   helper = require('../test/helper.js');


describe('h-review', function() {
   var htmlFragment = "<base href=\"http://example.com\" ><img class=\"h-review\" src=\"images/photo.gif\" alt=\"Crepes on Cole\" />";
   var found = helper.parseHTML(htmlFragment,'http://example.com/');
   var expected = {"items":[{"type":["h-review"],"properties":{"name":["Crepes on Cole"],"photo":["http://example.com/images/photo.gif"]}}],"rels":{},"rel-urls":{}};

   it('photo', function(){
       assert.deepEqual(found, expected);
   });
});
