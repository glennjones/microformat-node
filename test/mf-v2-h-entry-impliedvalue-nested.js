/*
Microformats Test Suite - Downloaded from github repo: microformats/tests version v0.1.23 
Mocha integration test from: microformats-v2/h-entry/impliedvalue-nested
The test was built on Wed Sep 09 2015 16:39:33 GMT+0100 (BST)
*/

var chai = require('chai'),
   assert = chai.assert,
   helper = require('../test/helper.js');


describe('h-entry', function() {
   var htmlFragment = "<div class=\"h-entry\">\n      <div class=\"u-in-reply-to h-cite\">\n            <span class=\"p-author h-card\">\n                  <span class=\"p-name\">Example Author</span>\n                  <a class=\"u-url\" href=\"http://example.com\">Home</a>\n            </span>\n            <a class=\"p-name u-url\" href=\"http://example.com/post\">Example Post</a>\n      </div>\n</div>";
   var found = helper.parseHTML(htmlFragment,'http://example.com/');
   var expected = {"items":[{"type":["h-entry"],"properties":{"in-reply-to":[{"type":["h-cite"],"properties":{"name":["Example Post"],"url":["http://example.com/post"],"author":[{"type":["h-card"],"properties":{"url":["http://example.com"],"name":["Example Author"]},"value":"Example Author"}]},"value":"http://example.com/post"}],"name":["Example Author\n                  Home\n            \n            Example Post"]}}],"rels":{},"rel-urls":{}};

   it('impliedvalue-nested', function(){
       assert.deepEqual(found, expected);
   });
});
