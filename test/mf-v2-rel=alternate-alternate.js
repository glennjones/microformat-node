/*
Microformats Test Suite - Downloaded from github repo: glennjones/tests version v0.1.21 
Mocha integration test from: microformats-v2/rel=alternate/alternate
The test was built on Tue Sep 01 2015 10:27:28 GMT+0100 (BST)
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
