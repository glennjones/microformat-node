var chai 	= require('chai'),
    assert  = chai.assert,
    helper  = require('../test/helper.js');

/*
To run these tests you need mocha and chia modules install on your computer
*/


describe('get page', function(){
    var data = [];

    before( function (done) {
        var url = "http://microformat2-node.jit.su/h-card.html"
        data = helper.parseHTML('<p class="h-card">Frances Berriman</p>','http://example.com/')
        done();
    });


    describe('#indexOf()', function(){
        it('json should have items property', function(){
            assert(data.items);
        })
    })
})


// describe('uf2Parser', function() {

// 	describe('#findRootNodes()', function() {
// 	    it('should remove a single root h-card node', function() {
// 		    assert.equal(uf2Parser.findRootNodes(dom), 'name');
// 	    })
// 	})


// 	describe('#removeAllPrefix()', function() {
// 	    it('should remove p- e- u- dt- from front any property name of given object', function() {
// 	    	var test = uf2Parser.removeAllPrefix(properties)
// 		    assert.equal(test.bday[0], '2012-04-01');
// 		    assert.equal(test.name[0], 'Mitchell Baker');
// 			assert.equal(test.note[0], 'Mitchell is responsible for setting the direction and scope of the Mozilla Foundation and its activities.');
// 			assert.equal(test.url[0], 'http://blog.lizardwrangler.com/');
// 	    })
// 	})

// 	describe('#removePrefix()', function() {
// 	    it('should remove p- e- u- dt- from the front of given string', function() {
// 		    assert.equal(uf2Parser.removePrefix('p-name'), 'name');
// 		    assert.equal(uf2Parser.removePrefix('e-content'), 'content');
// 			assert.equal(uf2Parser.removePrefix('u-photo'), 'photo');
// 			assert.equal(uf2Parser.removePrefix('dt-created'), 'created');
// 	    })
// 	})
// })






// // mock data
// // ------------------------------
// var properties = {
// 	"dt-bday": ["2012-04-01"],
//     "p-category": ["Strategy", "Leadership"],
//     "p-name": ["Mitchell Baker"],
//     "e-note": ["Mitchell is responsible for setting the direction and scope of the Mozilla Foundation and its activities."],
//     "p-org": ["Mozilla Foundation"],
//     "u-photo": ["http://blog.mozilla.org/press/files/2012/04/mitchell-baker.jpg"],
//     "u-url": ["http://blog.lizardwrangler.com/", "https://twitter.com/MitchellBaker"]
// }


// var hcard = [
//     {
//         "type": ["h-card"],
//         "properties": {
//             "category": ["Strategy", "Leadership"],
//             "name": ["Mitchell Baker"],
//             "note": ["Mitchell is responsible for setting the direction and scope of the Mozilla Foundation and its activities."],
//             "org": ["Mozilla Foundation"],
//             "photo": ["http://blog.mozilla.org/press/files/2012/04/mitchell-baker.jpg"],
//             "url": ["http://blog.lizardwrangler.com/", "https://twitter.com/MitchellBaker"]
//         }
//     }
// ]


// var html = '<div class="h-card"><img class="u-photo" alt="photo of Mitchell" src="http://blog.mozilla.org/press/files/2012/04/mitchell-baker.jpg"><p><a class="p-name u-url" href="http://blog.lizardwrangler.com/">Mitchell Baker</a> (<a class="u-url" href="https://twitter.com/MitchellBaker">@MitchellBaker</a>) <span class="p-org">Mozilla Foundation</span></p><p class="p-note">Mitchell is responsible for setting the direction and scope of the Mozilla Foundation and its activities.</p><p><span class="p-category">Strategy</span> and <span class="p-category">Leadership</span></p></div></div>';
// var dom = cheerio.load(html); 
