/*
Mocha integration test from: hreview.html
The test was built on Tue Jan 08 2013 16:10:57 GMT+0000 (GMT)
*/

var assert = chai.assert;


describe('Just a name (hreview parsing test)', function() {
   var htmlFragment = "\n<p class=\"hreview\">Crepes on Cole</p>\n"
   var found = helper.parseHTML(htmlFragment,'http://example.com/')
   var expected = {"items":[{"type":["h-review"],"properties":{"name":["Crepes on Cole"]}}]}

   it("found.items[0].type[0]", function(){
      assert.equal(found.items[0].type[0].toString(), "h-review");
   })

   it("found.items[0].properties['name'][0]", function(){
      assert.equal(found.items[0].properties["name"][0].toString(), "Crepes on Cole");
   })

})




describe('Broken into properties (hreview parsing test)', function() {
   var htmlFragment = "\n<div class=\"hreview\">\n    <span><span class=\"rating\">5</span> out of 5 stars</span>\n    <h4 class=\"summary\">Crepes on Cole is awesome</h4>\n    <span class=\"reviewer vcard\">\n        Reviewer: <span class=\"fn\">Tantek</span> - \n    </span>\n    <time class=\"reviewed\" datetime=\"2005-04-18\">April 18, 2005</time>\n    <div class=\"description\">\n        <p class=\"item vcard\">\n        <span class=\"fn org\">Crepes on Cole</span> is one of the best little \n        creperies in <span class=\"adr\"><span class=\"locality\">San Francisco</span></span>.\n        Excellent food and service. Plenty of tables in a variety of sizes \n        for parties large and small.  Window seating makes for excellent \n        people watching to/from the N-Judah which stops right outside.  \n        I've had many fun social gatherings here, as well as gotten \n        plenty of work done thanks to neighborhood WiFi.\n        </p>\n    </div>\n    <p>Visit date: <span>April 2005</span></p>\n    <p>Food eaten: <span>Florentine crepe</span></p>\n</div>\n\n"
   var found = helper.parseHTML(htmlFragment,'http://example.com/')
   var expected = {"items":[{"type":["h-review"],"properties":{"rating":["5"],"name":["Crepes on Cole is awesome"],"reviewer":[{"value":"Reviewer: Tantek -","type":["h-card"],"properties":{"name":["Tantek"]}}],"description":["Crepes on Cole is one of the best little creperies in San Francisco. Excellent food and service. Plenty of tables in a variety of sizes for parties large and small. Window seating makes for excellent people watching to/from the N-Judah which stops right outside. I've had many fun social gatherings here, as well as gotten plenty of work done thanks to neighborhood WiFi."],"item":[{"value":"Crepes on Cole is one of the best little creperies in San Francisco. Excellent food and service. Plenty of tables in a variety of sizes for parties large and small. Window seating makes for excellent people watching to/from the N-Judah which stops right outside. I've had many fun social gatherings here, as well as gotten plenty of work done thanks to neighborhood WiFi.","type":["h-card"],"properties":{"name":["Crepes on Cole"],"org":["Crepes on Cole"],"adr":[{"value":"San Francisco","type":["h-adr"],"properties":{"locality":["San Francisco"],"name":["San Francisco"]}}]}}]}}]}

   it("found.items[0].type[0]", function(){
      assert.equal(found.items[0].type[0].toString(), "h-review");
   })

   it("found.items[0].properties['rating'][0]", function(){
      assert.equal(found.items[0].properties["rating"][0].toString(), "5");
   })

   it("found.items[0].properties['name'][0]", function(){
      assert.equal(found.items[0].properties["name"][0].toString(), "Crepes on Cole is awesome");
   })

   it("found.items[0].properties['reviewer'][0].value", function(){
      assert.equal(found.items[0].properties["reviewer"][0].value, "Reviewer: Tantek -");
   })

   it("found.items[0].properties['reviewer'][0].type[0]", function(){
      assert.equal(found.items[0].properties["reviewer"][0].type[0].toString(), "h-card");
   })

   it("found.items[0].properties['reviewer'][0].properties['name'][0]", function(){
      assert.equal(found.items[0].properties["reviewer"][0].properties["name"][0].toString(), "Tantek");
   })

   it("found.items[0].properties['description'][0]", function(){
      assert.equal(found.items[0].properties["description"][0].toString(), "Crepes on Cole is one of the best little creperies in San Francisco. Excellent food and service. Plenty of tables in a variety of sizes for parties large and small. Window seating makes for excellent people watching to/from the N-Judah which stops right outside. I've had many fun social gatherings here, as well as gotten plenty of work done thanks to neighborhood WiFi.");
   })

   it("found.items[0].properties['item'][0].value", function(){
      assert.equal(found.items[0].properties["item"][0].value, "Crepes on Cole is one of the best little creperies in San Francisco. Excellent food and service. Plenty of tables in a variety of sizes for parties large and small. Window seating makes for excellent people watching to/from the N-Judah which stops right outside. I've had many fun social gatherings here, as well as gotten plenty of work done thanks to neighborhood WiFi.");
   })

   it("found.items[0].properties['item'][0].type[0]", function(){
      assert.equal(found.items[0].properties["item"][0].type[0].toString(), "h-card");
   })

   it("found.items[0].properties['item'][0].properties['name'][0]", function(){
      assert.equal(found.items[0].properties["item"][0].properties["name"][0].toString(), "Crepes on Cole");
   })

   it("found.items[0].properties['item'][0].properties['org'][0]", function(){
      assert.equal(found.items[0].properties["item"][0].properties["org"][0].toString(), "Crepes on Cole");
   })

   it("found.items[0].properties['item'][0].properties['adr'][0].value", function(){
      assert.equal(found.items[0].properties["item"][0].properties["adr"][0].value, "San Francisco");
   })

   it("found.items[0].properties['item'][0].properties['adr'][0].type[0]", function(){
      assert.equal(found.items[0].properties["item"][0].properties["adr"][0].type[0].toString(), "h-adr");
   })

   it("found.items[0].properties['item'][0].properties['adr'][0].properties['locality'][0]", function(){
      assert.equal(found.items[0].properties["item"][0].properties["adr"][0].properties["locality"][0].toString(), "San Francisco");
   })

   it("found.items[0].properties['item'][0].properties['adr'][0].properties['name'][0]", function(){
      assert.equal(found.items[0].properties["item"][0].properties["adr"][0].properties["name"][0].toString(), "San Francisco");
   })

})




