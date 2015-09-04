/*
Microformats Test Suite - Downloaded from github repo: glennjones/tests version v0.1.21 
Mocha integration test from: microformats-v1/hresume/affiliation
The test was built on Tue Sep 01 2015 10:27:28 GMT+0100 (BST)
*/

var chai = require('chai'),
   assert = chai.assert,
   helper = require('../test/helper.js');


describe('hresume', function() {
   var htmlFragment = "<div class=\"hresume\">\n    <p>\n        <span class=\"contact vcard\"><span class=\"fn\">Tim Berners-Lee</span></span>, \n        <span class=\"summary\">invented the World Wide Web</span>.\n    </p>\n    Belongs to following groups:\n    <p>   \n        <a class=\"affiliation vcard\" href=\"http://www.w3.org/\">\n            <img class=\"fn photo\" alt=\"W3C\" src=\"http://www.w3.org/Icons/WWW/w3c_home_nb.png\" />\n        </a>\n    </p>   \n</div>";
   var found = helper.parseHTML(htmlFragment,'http://example.com/');
   var expected = {"items":[{"type":["h-resume"],"properties":{"contact":[{"value":"Tim Berners-Lee","type":["h-card"],"properties":{"name":["Tim Berners-Lee"]}}],"summary":["invented the World Wide Web"],"affiliation":[{"type":["h-card"],"properties":{"name":["W3C"],"photo":["http://www.w3.org/Icons/WWW/w3c_home_nb.png"]}}]}}],"rels":{},"rel-urls":{}};

   it('affiliation', function(){
       assert.deepEqual(found, expected);
   });
});
