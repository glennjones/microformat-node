/*
Microformats Test Suite - Downloaded from github repo: glennjones/tests version v0.1.21 
Mocha integration test from: microformats-v2/rel/varying-text-duplicate-rels
The test was built on Tue Sep 01 2015 10:27:28 GMT+0100 (BST)
*/

var chai = require('chai'),
   assert = chai.assert,
   helper = require('../test/helper.js');


describe('rel', function() {
   var htmlFragment = "This is a contrived example - not found links like this in the wild:\n<a href=\"http://ma.tt/category/asides/\" rel=\"category tag\">Asides</a>\n<a href=\"http://ma.tt/category/asides/\" rel=\"category tag\">B-sides</a>\n<a href=\"http://ma.tt/category/asides/\" rel=\"category tag\">seasides</a>";
   var found = helper.parseHTML(htmlFragment,'http://example.com/');
   var expected = {"rels":{"category":["http://ma.tt/category/asides/"],"tag":["http://ma.tt/category/asides/"]},"items":[],"rel-urls":{"http://ma.tt/category/asides/":{"rels":["category","tag"],"text":"Asides"}}};

   it('varying-text-duplicate-rels', function(){
       assert.deepEqual(found, expected);
   });
});
