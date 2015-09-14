/*
Microformats Test Suite - Downloaded from github repo: microformats/tests version v0.1.23 
Mocha integration test from: microformats-v1/hresume/skill
The test was built on Wed Sep 09 2015 16:39:33 GMT+0100 (BST)
*/

var chai = require('chai'),
   assert = chai.assert,
   helper = require('../test/helper.js');


describe('hresume', function() {
   var htmlFragment = "<div class=\"hresume\"> \n    <p>\n        <span class=\"contact vcard\"><span class=\"fn\">Tim Berners-Lee</span></span>, \n        <span class=\"summary\">invented the World Wide Web</span>.\n    </p>\n    Skills:     \n    <ul>\n        <li><a class=\"skill\" rel=\"tag\" href=\"http://example.com/skills/informationsystems\">information systems</a></li>\n        <li><a class=\"skill\" rel=\"tag\" href=\"http://example.com/skills/advocacy\">advocacy</a></li>\n        <li><a class=\"skill\" rel=\"tag\" href=\"http://example.com/skills/leadership\">leadership</a></li>\n    </ul>\n</div>";
   var found = helper.parseHTML(htmlFragment,'http://example.com/');
   var expected = {"items":[{"type":["h-resume"],"properties":{"contact":[{"value":"Tim Berners-Lee","type":["h-card"],"properties":{"name":["Tim Berners-Lee"]}}],"summary":["invented the World Wide Web"],"skill":["information systems","advocacy","leadership"]}}],"rels":{"tag":["http://example.com/skills/informationsystems","http://example.com/skills/advocacy","http://example.com/skills/leadership"]},"rel-urls":{"http://example.com/skills/informationsystems":{"text":"information systems","rels":["tag"]},"http://example.com/skills/advocacy":{"text":"advocacy","rels":["tag"]},"http://example.com/skills/leadership":{"text":"leadership","rels":["tag"]}}};

   it('skill', function(){
       assert.deepEqual(found, expected);
   });
});
