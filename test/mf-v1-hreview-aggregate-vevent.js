/*
Microformats Test Suite - Downloaded from github repo: microformats/tests version v0.1.23 
Mocha integration test from: microformats-v1/hreview-aggregate/vevent
The test was built on Wed Sep 09 2015 16:39:33 GMT+0100 (BST)
*/

var chai = require('chai'),
   assert = chai.assert,
   helper = require('../test/helper.js');


describe('hreview-aggregate', function() {
   var htmlFragment = "<div class=\"hreview-aggregate\">\n    <div class=\"item vevent\">\n        <h3 class=\"summary\">Fullfrontal</h3>\n        <p class=\"description\">A one day JavaScript Conference held in Brighton</p>\n        <p><time class=\"dtstart\" datetime=\"2012-11-09\">9th November 2012</time></p>    \n    </div> \n    \n    <p class=\"rating\">\n        <span class=\"average value\">9.9</span> out of \n        <span class=\"best\">10</span> \n        based on <span class=\"count\">62</span> reviews\n    </p>\n</div>";
   var found = helper.parseHTML(htmlFragment,'http://example.com/');
   var expected = {"items":[{"type":["h-review-aggregate"],"properties":{"item":[{"value":"Fullfrontal","type":["h-item","h-event"],"properties":{"name":["Fullfrontal"],"description":["A one day JavaScript Conference held in Brighton"],"start":["2012-11-09"]}}],"rating":["9.9"],"average":["9.9"],"best":["10"],"count":["62"]}}],"rels":{},"rel-urls":{}};

   it('vevent', function(){
       assert.deepEqual(found, expected);
   });
});
