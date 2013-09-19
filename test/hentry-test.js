/*
Mocha integration test from: hentry.html
The test was built on Thu Sep 19 2013 15:09:18 GMT+0100 (BST)
*/

var chai = require('chai'),
   assert = chai.assert,
   helper = require('../test/helper.js');


describe('Just a name (hentry parsing test)', function() {
   var htmlFragment = "\n<a class=\"hentry\" href=\"http://microformats.org/2012/06/25/microformats-org-at-7\">microformats.org at 7</a>\n"
   var found = helper.parseHTML(htmlFragment,'http://example.com/')
   var expected = {"items":[{"type":["h-entry"],"properties":{"name":["microformats.org at 7"],"url":["http://microformats.org/2012/06/25/microformats-org-at-7"]}}]}

   it("found.items[0].type[0]", function(){
      assert.equal(found.items[0].type[0].toString(), "h-entry");
   })

   it("found.items[0].properties['name'][0]", function(){
      assert.equal(found.items[0].properties["name"][0].toString(), "microformats.org at 7");
   })

   it("found.items[0].properties['url'][0]", function(){
      assert.equal(found.items[0].properties["url"][0].toString(), "http://microformats.org/2012/06/25/microformats-org-at-7");
   })

})




describe('Just a hyperlink (hentry parsing test)', function() {
   var htmlFragment = "\n<a class=\"hentry\" href=\"http://microformats.org/2012/06/25/microformats-org-at-7\">microformats.org at 7</a>\n"
   var found = helper.parseHTML(htmlFragment,'http://example.com/')
   var expected = {"items":[{"type":["h-entry"],"properties":{"name":["microformats.org at 7"],"url":["http://microformats.org/2012/06/25/microformats-org-at-7"]}}]}

   it("found.items[0].type[0]", function(){
      assert.equal(found.items[0].type[0].toString(), "h-entry");
   })

   it("found.items[0].properties['name'][0]", function(){
      assert.equal(found.items[0].properties["name"][0].toString(), "microformats.org at 7");
   })

   it("found.items[0].properties['url'][0]", function(){
      assert.equal(found.items[0].properties["url"][0].toString(), "http://microformats.org/2012/06/25/microformats-org-at-7");
   })

})




describe('Entry with summary and content (hentry parsing test)', function() {
   var htmlFragment = "\n<div class=\"hentry\">\n    <h1><a class=\"entry-title\" href=\"http://microformats.org/2012/06/25/microformats-org-at-7\">microformats.org at 7</a></h1>\n    <div class=\"entry-content\">\n        <p class=\"entry-summary\">Last week the microformats.org community \n            celebrated its 7th birthday at a gathering hosted by Mozilla in \n            San Francisco and recognized accomplishments, challenges, and \n            opportunities.</p>\n\n        <p>The microformats tagline &#8220;humans first, machines second&#8221; \n            forms the basis of many of our \n            <a href=\"http://microformats.org/wiki/principles\">principles</a>, and \n            in that regard, we&#8217;d like to recognize a few people and \n            thank them for their years of volunteer service </p>\n    </div>  \n    <p>Updated \n        <time class=\"updated\" datetime=\"2012-06-25T17:08:26\">June 25th, 2012</time> by\n        <a class=\"author vcard\" href=\"http://tantek.com/\">Tantek</a>\n    </p>\n</div>\n"
   var found = helper.parseHTML(htmlFragment,'http://example.com/')
   var expected = {"items":[{"type":["h-entry"],"properties":{"name":["microformats.org at 7"],"content":[{"value":"Last week the microformats.org community celebrated its 7th birthday at a gathering hosted by Mozilla in San Francisco and recognized accomplishments, challenges, and opportunities. The microformats tagline “humans first, machines second” forms the basis of many of our principles, and in that regard, we’d like to recognize a few people and thank them for their years of volunteer service","html":"\n        <p class=\"entry-summary\">Last week the microformats.org community \n            celebrated its 7th birthday at a gathering hosted by Mozilla in \n            San Francisco and recognized accomplishments, challenges, and \n            opportunities.</p>\n\n        <p>The microformats tagline &#8220;humans first, machines second&#8221; \n            forms the basis of many of our \n            <a href=\"http://microformats.org/wiki/principles\">principles</a>, and \n            in that regard, we&#8217;d like to recognize a few people and \n            thank them for their years of volunteer service </p>\n    "}],"summary":["Last week the microformats.org community celebrated its 7th birthday at a gathering hosted by Mozilla in San Francisco and recognized accomplishments, challenges, and opportunities."],"updated":["2012-06-25T17:08:26"],"author":[{"value":"Tantek","type":["h-card"],"properties":{"name":["Tantek"],"url":["http://tantek.com/"]}}]}},{"type":["h-card"],"properties":{"name":["Tantek"],"url":["http://tantek.com/"]}}]}

   it("found.items[0].type[0]", function(){
      assert.equal(found.items[0].type[0].toString(), "h-entry");
   })

   it("found.items[0].properties['name'][0]", function(){
      assert.equal(found.items[0].properties["name"][0].toString(), "microformats.org at 7");
   })

   it("found.items[0].properties['content'][0].value", function(){
      assert.equal(found.items[0].properties["content"][0].value, "Last week the microformats.org community celebrated its 7th birthday at a gathering hosted by Mozilla in San Francisco and recognized accomplishments, challenges, and opportunities. The microformats tagline “humans first, machines second” forms the basis of many of our principles, and in that regard, we’d like to recognize a few people and thank them for their years of volunteer service");
   })

   it("found.items[0].properties['summary'][0]", function(){
      assert.equal(found.items[0].properties["summary"][0].toString(), "Last week the microformats.org community celebrated its 7th birthday at a gathering hosted by Mozilla in San Francisco and recognized accomplishments, challenges, and opportunities.");
   })

   it("found.items[0].properties['updated'][0]", function(){
      assert.equal(found.items[0].properties["updated"][0].toString(), "2012-06-25T17:08:26");
   })

   it("found.items[0].properties['author'][0].value", function(){
      assert.equal(found.items[0].properties["author"][0].value, "Tantek");
   })

   it("found.items[0].properties['author'][0].type[0]", function(){
      assert.equal(found.items[0].properties["author"][0].type[0].toString(), "h-card");
   })

   it("found.items[0].properties['author'][0].properties['name'][0]", function(){
      assert.equal(found.items[0].properties["author"][0].properties["name"][0].toString(), "Tantek");
   })

   it("found.items[0].properties['author'][0].properties['url'][0]", function(){
      assert.equal(found.items[0].properties["author"][0].properties["url"][0].toString(), "http://tantek.com/");
   })

})




