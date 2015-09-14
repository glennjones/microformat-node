/*
Microformats Test Suite - Downloaded from github repo: microformats/tests version v0.1.23 
Mocha integration test from: microformats-v2/rel=alternate/alternate
The test was built on Wed Sep 09 2015 16:39:33 GMT+0100 (BST)
*/

var chai = require('chai'),
   assert = chai.assert,
   helper = require('../test/helper.js');


describe('rel=alternate', function() {
   var htmlFragment = "<base href=\"http://example.com\">\n<link rel=\"updates alternate\" type=\"application/atom+xml\" href=\"updates.atom\" />";
   var found = helper.parseHTML(htmlFragment,'http://example.com/');
   var expected = {"items":[],"rels":{"alternate":["http://example.com/updates.atom"],"updates":["http://example.com/updates.atom"]},"rel-urls":{"http://example.com/updates.atom":{"type":"application/atom+xml","rels":["updates","alternate"]}},"alternates":[{"type":"application/atom+xml","url":"http://example.com/updates.atom","rel":"updates"}]};

   it('alternate', function(){
       assert.deepEqual(found, expected);
   });
});
