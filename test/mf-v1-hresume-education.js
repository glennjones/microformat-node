/*
Microformats Test Suite - Downloaded from github repo: microformats/tests version v0.1.26 
Mocha integration test from: microformats-v1/hresume/education
The test was built on Fri May 27 2016 13:35:35 GMT+0100 (BST)
*/

var chai = require('chai'),
   assert = chai.assert,
   helper = require('../test/helper.js');


describe('hresume', function() {
   var htmlFragment = "<div class=\"hresume\">\n    <div class=\"contact vcard\">\n        <p class=\"fn\">Tim Berners-Lee</p>\n        <p class=\"title\">Director of the World Wide Web Foundation</p>\n    </div>\n    <p class=\"summary\">Invented the World Wide Web.</p><hr />\n    <p class=\"education vevent vcard\">\n        <span class=\"fn summary org\">The Queen's College, Oxford University</span>, \n        <span class=\"description\">BA Hons (I) Physics</span> \n        <time class=\"dtstart\" datetime=\"1973-09\">1973</time> –\n        <time class=\"dtend\" datetime=\"1976-06\">1976</time>\n    </p>\n</div>";
   var found = helper.parseHTML(htmlFragment,'http://example.com/');
   var expected = {"items":[{"type":["h-resume"],"properties":{"contact":[{"value":"Tim Berners-Lee","type":["h-card"],"properties":{"name":["Tim Berners-Lee"],"job-title":["Director of the World Wide Web Foundation"]}}],"summary":["Invented the World Wide Web."],"education":[{"value":"The Queen's College, Oxford University","type":["h-event","h-card"],"properties":{"name":["The Queen's College, Oxford University"],"org":["The Queen's College, Oxford University"],"description":["BA Hons (I) Physics"],"start":["1973-09"],"end":["1976-06"]}}]}}],"rels":{},"rel-urls":{}};

   it('education', function(){
       assert.deepEqual(found, expected);
   });
});
