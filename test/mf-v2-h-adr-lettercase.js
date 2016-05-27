/*
Microformats Test Suite - Downloaded from github repo: microformats/tests version v0.1.26 
Mocha integration test from: microformats-v2/h-adr/lettercase
The test was built on Fri May 27 2016 13:35:35 GMT+0100 (BST)
*/

var chai = require('chai'),
   assert = chai.assert,
   helper = require('../test/helper.js');


describe('h-adr', function() {
   var htmlFragment = "<p class=\"h-adr\">\n    <span class=\"p-name\">Bricklayer's Arms</span>\n        <span class=\"p-street-address\">3 Charlotte Road</span>,\n        <span class=\"p-locality\">City of London</span>,\n        <span class=\"P-postal-code\">EC2A 3PE</span>,\n        <span class=\"p-country-Name\">UK</span>\n</p>\n<p class=\"H-adr\">\n    <span class=\"p-name\">Bricklayer's Arms</span>\n        <span class=\"p-street-address\">3 Charlotte Road</span>,\n        <span class=\"p-locality\">City of London</span>,\n        <span class=\"p-postal-code\">EC2A 3PE</span>,\n        <span class=\"p-country-name\">UK</span>\n</p>\n<p class=\"h-Adr\">\n    <span class=\"p-name\">Bricklayer's Arms</span>\n        <span class=\"p-street-address\">3 Charlotte Road</span>,\n        <span class=\"p-locality\">City of London</span>,\n        <span class=\"p-postal-code\">EC2A 3PE</span>,\n        <span class=\"p-country-name\">UK</span>\n</p>";
   var found = helper.parseHTML(htmlFragment,'http://example.com/');
   var expected = {"items":[{"type":["h-adr"],"properties":{"name":["Bricklayer's Arms"],"street-address":["3 Charlotte Road"],"locality":["City of London"]}}],"rels":{},"rel-urls":{}};

   it('lettercase', function(){
       assert.deepEqual(found, expected);
   });
});
