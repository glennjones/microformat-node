/*
Microformats Test Suite - Downloaded from github repo: glennjones/tests version v0.1.21 
Mocha integration test from: microformats-v1/geo/simpleproperties
The test was built on Tue Sep 01 2015 10:27:28 GMT+0100 (BST)
*/

var chai = require('chai'),
   assert = chai.assert,
   helper = require('../test/helper.js');


describe('geo', function() {
   var htmlFragment = "We are meeting at \n<span class=\"geo\"> \n    <span>The Bricklayer's Arms</span>\n    (Geo: <span class=\"latitude\">51.513458</span>:\n    <span class=\"longitude\">-0.14812</span>)\n</span>";
   var found = helper.parseHTML(htmlFragment,'http://example.com/');
   var expected = {"items":[{"type":["h-geo"],"properties":{"latitude":["51.513458"],"longitude":["-0.14812"]}}],"rels":{},"rel-urls":{}};

   it('simpleproperties', function(){
       assert.deepEqual(found, expected);
   });
});
