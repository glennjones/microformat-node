/*
Microformats Test Suite - Downloaded from github repo: microformats/tests version v0.1.23 
Mocha integration test from: microformats-v2/h-card/impliedphoto
The test was built on Wed Sep 09 2015 16:39:33 GMT+0100 (BST)
*/

var chai = require('chai'),
   assert = chai.assert,
   helper = require('../test/helper.js');


describe('h-card', function() {
   var htmlFragment = "<img class=\"h-card\" alt=\"Jane Doe\" src=\"jane.jpeg\"/>\n<object class=\"h-card\" data=\"jane.jpeg\"/>Jane Doe</object>\n\n<div class=\"h-card\"><img alt=\"Jane Doe\" src=\"jane.jpeg\"/></div> \n<div class=\"h-card\"><object data=\"jane.jpeg\"/>Jane Doe</object></div> \n\n<div class=\"h-card\"><span><img alt=\"Jane Doe\" src=\"jane.jpeg\"/></span></div> \n<div class=\"h-card\"><span><object data=\"jane.jpeg\"/>Jane Doe</object></span></div> \n\n<div class=\"h-card\"><img class=\"h-card\" alt=\"Jane Doe\" src=\"jane.jpeg\"/>Jane Doe</div> \n<div class=\"h-card\"><span class=\"h-card\"><object data=\"jane.jpeg\"/>Jane Doe</object></span></div> ";
   var found = helper.parseHTML(htmlFragment,'http://example.com/');
   var expected = {"items":[{"type":["h-card"],"properties":{"name":["Jane Doe"],"photo":["http://example.com/jane.jpeg"]}},{"type":["h-card"],"properties":{"name":["Jane Doe"],"photo":["http://example.com/jane.jpeg"]}},{"type":["h-card"],"properties":{"name":["Jane Doe"],"photo":["http://example.com/jane.jpeg"]}},{"type":["h-card"],"properties":{"name":["Jane Doe"],"photo":["http://example.com/jane.jpeg"]}},{"type":["h-card"],"properties":{"name":["Jane Doe"],"photo":["http://example.com/jane.jpeg"]}},{"type":["h-card"],"properties":{"name":["Jane Doe"],"photo":["http://example.com/jane.jpeg"]}},{"type":["h-card"],"properties":{"name":["Jane Doe"]},"children":[{"type":["h-card"],"properties":{"name":["Jane Doe"],"photo":["http://example.com/jane.jpeg"]}}]},{"type":["h-card"],"properties":{"name":["Jane Doe"]},"children":[{"value":"Jane Doe","type":["h-card"],"properties":{"name":["Jane Doe"],"photo":["http://example.com/jane.jpeg"]}}]}],"rels":{},"rel-urls":{}};

   it('impliedphoto', function(){
       assert.deepEqual(found, expected);
   });
});
