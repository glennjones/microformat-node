/*
Microformats Test Suite - Downloaded from github repo: glennjones/tests version v0.1.21 
Mocha integration test from: microformats-v2/rel/nofollow
The test was built on Tue Sep 01 2015 10:27:28 GMT+0100 (BST)
*/

var chai = require('chai'),
   assert = chai.assert,
   helper = require('../test/helper.js');


describe('rel', function() {
   var htmlFragment = "<a rel=\"nofollow\" href=\"http://microformats.org/wiki/microformats:copyrights\">Copyrights</a>";
   var found = helper.parseHTML(htmlFragment,'http://example.com/');
   var expected = {"items":[],"rels":{"nofollow":["http://microformats.org/wiki/microformats:copyrights"]},"rel-urls":{"http://microformats.org/wiki/microformats:copyrights":{"text":"Copyrights","rels":["nofollow"]}}};

   it('nofollow', function(){
       assert.deepEqual(found, expected);
   });
});
