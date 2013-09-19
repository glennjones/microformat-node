/*
Mocha integration test from: rel.html
The test was built on Thu Sep 19 2013 11:29:32 GMT+0100 (BST)
*/

var assert = chai.assert;


describe('A rel=license (rel=license parsing test)', function() {
   var htmlFragment = "\n<a rel=\"license\" href=\"http://creativecommons.org/licenses/by/2.5/\">cc by 2.5</a>\n"
   var found = helper.parseHTML(htmlFragment,'http://example.com/')
   var expected = {"items":[],"rels":{"license":["http://creativecommons.org/licenses/by/2.5/"]}}

})




describe('A rel=nofollow (rel=nofollow parsing test)', function() {
   var htmlFragment = "\n<a rel=\"nofollow\" href=\"http://microformats.org/wiki/microformats:copyrights\">Copyrights</a>\n"
   var found = helper.parseHTML(htmlFragment,'http://example.com/')
   var expected = {"items":[],"rels":{"nofollow":["http://microformats.org/wiki/microformats:copyrights"]}}

})




describe('A xfn elsewhere list (xfn parsing test)', function() {
   var htmlFragment = "\n<ul>\n    <li><a rel=\"me\" href=\"http://twitter.com/glennjones\">twitter</a></li>\n    <li><a rel=\"me\" href=\"http://delicious.com/glennjonesnet/\">delicious</a></li>\n    <li><a rel=\"me\" href=\"https://plus.google.com/u/0/105161464208920272734/about\">google+</a></li>\n    <li><a rel=\"me\" href=\"http://lanyrd.com/people/glennjones/\">lanyrd</a></li>\n    <li><a rel=\"me\" href=\"http://github.com/glennjones\">github</a></li>\n    <li><a rel=\"me\" href=\"http://www.flickr.com/photos/glennjonesnet/\">flickr</a></li>\n    <li><a rel=\"me\" href=\"http://www.linkedin.com/in/glennjones\">linkedin</a></li>\n    <li><a rel=\"me\" href=\"http://www.slideshare.net/glennjones/presentations\">slideshare</a></li>\n</ul>\n"
   var found = helper.parseHTML(htmlFragment,'http://example.com/')
   var expected = {"items":[],"rels":{"me":["http://twitter.com/glennjones","http://delicious.com/glennjonesnet/","https://plus.google.com/u/0/105161464208920272734/about","http://lanyrd.com/people/glennjones/","http://github.com/glennjones","http://www.flickr.com/photos/glennjonesnet/","http://www.linkedin.com/in/glennjones","http://www.slideshare.net/glennjones/presentations"]}}

})




describe('A xfn all properties (xfn parsing test)', function() {
   var htmlFragment = "\n<ul>\n    <li><a rel=\"friend\" href=\"http://example.com/profile/jane\">jane</a></li>\n    <li><a rel=\"acquaintance\" href=\"http://example.com/profile/jeo\">jeo</a></li>\n    <li><a rel=\"contact\" href=\"http://example.com/profile/lily\">lily</a></li>\n    <li><a rel=\"met\" href=\"http://example.com/profile/oliver\">oliver</a></li>\n    <li><a rel=\"co-worker\" href=\"http://example.com/profile/emily\">emily</a></li>\n    <li><a rel=\"colleague\" href=\"http://example.com/profile/jack\">jack</a></li>\n    <li><a rel=\"neighbor\" href=\"http://example.com/profile/isabella\">isabella</a></li>\n    <li><a rel=\"child\" href=\"http://example.com/profile/harry\">harry</a></li>\n    <li><a rel=\"parent\" href=\"http://example.com/profile/sophia\">sophia</a></li>\n    <li><a rel=\"sibling\" href=\"http://example.com/profile/charlie\">charlie</a></li>\n    <li><a rel=\"spouse\" href=\"http://example.com/profile/olivia\">olivia</a></li>\n    <li><a rel=\"kin\" href=\"http://example.com/profile/james\">james</a></li>\n    <li><a rel=\"muse\" href=\"http://example.com/profile/ava\">ava</a></li>\n    <li><a rel=\"crush\" href=\"http://example.com/profile/joshua\">joshua</a></li>\n    <li><a rel=\"date\" href=\"http://example.com/profile/chloe\">chloe</a></li>\n    <li><a rel=\"sweetheart\" href=\"http://example.com/profile/alfie\">alfie</a></li>\n    <li><a rel=\"me\" href=\"http://example.com/profile/isla\">isla</a></li>\n</ul>\n"
   var found = helper.parseHTML(htmlFragment,'http://example.com/')
   var expected = {"items":[],"rels":{"friend":["http://example.com/profile/jane"],"acquaintance":["http://example.com/profile/jeo"],"contact":["http://example.com/profile/lily"],"met":["http://example.com/profile/oliver"],"co-worker":["http://example.com/profile/emily"],"colleague":["http://example.com/profile/jack"],"neighbor":["http://example.com/profile/isabella"],"child":["http://example.com/profile/harry"],"parent":["http://example.com/profile/sophia"],"sibling":["http://example.com/profile/charlie"],"spouse":["http://example.com/profile/olivia"],"kin":["http://example.com/profile/james"],"muse":["http://example.com/profile/ava"],"crush":["http://example.com/profile/joshua"],"date":["http://example.com/profile/chloe"],"sweetheart":["http://example.com/profile/alfie"],"me":["http://example.com/profile/isla"]}}

})




describe('A rel=alternate (rel=alternate parsing test)', function() {
   var htmlFragment = "\n<link rel=\"updates alternate\" type=\"application/atom+xml\" href=\"updates.atom\">\n"
   var found = helper.parseHTML(htmlFragment,'http://example.com/')
   var expected = {"items":[],"alternates":[{"url":"http://tantek.com/updates.atom","type":"application/atom+xml","rel":"updates"}]}

})




