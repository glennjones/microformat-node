/*
Microformats Test Suite - Downloaded from github repo: glennjones/tests version v0.1.21 
Mocha integration test from: microformats-v2/h-geo/altitude
The test was built on Tue Sep 01 2015 10:27:28 GMT+0100 (BST)
*/

var chai = require('chai'),
   assert = chai.assert,
   helper = require('../test/helper.js');


describe('h-geo', function() {
   var htmlFragment = "<p>My favourite hill in the lakes is \n    <span class=\"h-geo\">\n        <span class=\"p-name\">Pen-y-ghent</span> \n        (Geo: <span class=\"p-latitude\">54.155278</span>,\n        <span class=\"p-longitude\">-2.249722</span>). It\n        raises to <span class=\"p-altitude\">694</span>m.\n  </span>\n</p>";
   var found = helper.parseHTML(htmlFragment,'http://example.com/');
   var expected = {"items":[{"type":["h-geo"],"properties":{"name":["Pen-y-ghent"],"latitude":["54.155278"],"longitude":["-2.249722"],"altitude":["694"]}}],"rels":{},"rel-urls":{}};

   it('altitude', function(){
       assert.deepEqual(found, expected);
   });
});
