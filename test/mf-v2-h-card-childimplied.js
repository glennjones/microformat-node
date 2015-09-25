/*
Microformats Test Suite - Downloaded from github repo: microformats/tests version v0.1.24 
Mocha integration test from: microformats-v2/h-card/childimplied
The test was built on Fri Sep 25 2015 14:17:16 GMT+0100 (BST)
*/

var chai = require('chai'),
   assert = chai.assert,
   helper = require('../test/helper.js');


describe('h-card', function() {
   var htmlFragment = "<meta charset=\"utf-8\">\n<a class=\"h-card\" href=\"http://people.opera.com/howcome/\" title=\"Håkon Wium Lie, CTO Opera\">\n  <article>\n     <h2 class=\"p-name\">Håkon Wium Lie</h2>\n     <img src=\"http://upload.wikimedia.org/wikipedia/commons/thumb/9/96/H%C3%A5kon-Wium-Lie-2009-03.jpg/215px-H%C3%A5kon-Wium-Lie-2009-03.jpg\" />\n  </article>\n</a>";
   var found = helper.parseHTML(htmlFragment,'http://example.com/');
   var expected = {"items":[{"type":["h-card"],"properties":{"name":["Håkon Wium Lie"],"photo":["http://upload.wikimedia.org/wikipedia/commons/thumb/9/96/H%C3%A5kon-Wium-Lie-2009-03.jpg/215px-H%C3%A5kon-Wium-Lie-2009-03.jpg"],"url":["http://people.opera.com/howcome/"]}}],"rels":{},"rel-urls":{}};

   it('childimplied', function(){
       assert.deepEqual(found, expected);
   });
});
