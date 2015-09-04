/*
Interface test for Microformats.get()
*/



var cheerio         = require('cheerio');
    chai            = require('chai'),
    Microformats    = require('../index.js'),
    assert          = chai.assert;
    
    
var options = {
        'baseUrl': 'http://example.com/',
        'overlappingVersions': false,
        'impliedPropertiesByVersion': true
    },
    result;


   var expected = {
        'items': [{
            'type': ['h-card'],
            'properties': {
                'name': ['Glenn Jones'],
                'url': ['http://glennjones.net']
            }
        }],
        'rels': {
            'bookmark': ['http://glennjones.net'],
            'alternate': ['http://example.com/fr'],
            'home': ['http://example.com/fr']
        },
        'rel-urls': {
            'http://glennjones.net': {
                'text': 'Glenn Jones',
                'rels': ['bookmark']
            },
            'http://example.com/fr': {
                'media': 'handheld',
                'hreflang': 'fr',
                'text': 'French mobile homepage',
                'rels': ['alternate', 'home']
            }
        },
        'alternates': [{
            'media': 'handheld',
            'hreflang': 'fr',
            'text': 'French mobile homepage',
            'url': 'http://example.com/fr',
            'rel': 'home'
        }]
    };
    html = '<div class="h-card"><a class="p-name u-url" rel="bookmark" href="http://glennjones.net">Glenn Jones</a></div><a rel="alternate home" href="http://example.com/fr" media="handheld" hreflang="fr">French mobile homepage</a>';





describe('Microformat.get', function() {
    
   beforeEach(function (done) {
        // remove
        delete options.html; 
        delete options.node; 
        delete options.filters;
        // set back to defaults
        options.textFormat = 'whitespacetrimmed';
        options.dateFormat = 'auto';
        options.baseUrl = 'http://example.com/';
        done();
   });
    
  

   it('get - no options', function(){
        result = Microformats.get();
        assert.deepEqual( result, {"items":[],"rels":{},"rel-urls":{},"errors": ["No options.node or options.html was provided and no document object could be found."]} );
   });


   it('get - empty options', function(){
        result = Microformats.get({});
        assert.deepEqual( result, {"items":[],"rels":{},"rel-urls":{},"errors": ["No options.node or options.html was provided and no document object could be found."]} );
   });
  
    
   it('get - option.html', function(){
        options.html = html;
        result = Microformats.get(options);
        assert.deepEqual( result, expected );
   });
   
   
   it('get - options.node', function(){
        options.node = cheerio.load( html );
        result = Microformats.get(options);
        assert.deepEqual( result, expected );
   });
   
   
   it('get - pass base tag', function(){
        options.html = '<base href="http://brendaneich.com/"><div class="h-card"><a class="p-name u-url" href="brendan.htm">Brendan Eich</a></div>';
        result = Microformats.get(options);
        assert.deepEqual( result.items[0].properties.url[0], 'http://brendaneich.com/brendan.htm' );
   });
   
   
   it('get - baseUrl', function(){
        options.html = '<div class="h-card"><a class="p-name u-url" href="brendan.htm">Brendan Eich</a></div>';
        options.baseUrl = 'http://brendaneich.com/';
        result = Microformats.get(options);
        assert.deepEqual( result.items[0].properties.url[0], 'http://brendaneich.com/brendan.htm' );
   });
   
   
   it('get - textFormat: normalised', function(){
        options.html = '<a class="h-card" href="http://glennjones.net">\n';
        options.html += '     <span class="p-given-name">Glenn</span>\n';
        options.html += '     <span class="p-family-name">Jones</span>\n';
        options.html += '</a>\n';

        options.textFormat = 'normalised';
        result = Microformats.get(options);
        assert.equal( result.items[0].properties.name[0], 'Glenn Jones' );
   });
   
   
   it('get - textFormat: whitespace', function(){
        options.html = '<a class="h-card" href="http://glennjones.net">\n';
        options.html += '     <span class="p-given-name">Glenn</span>\n';
        options.html += '     <span class="p-family-name">Jones</span>\n';
        options.html += '</a>\n';

        options.textFormat = 'whitespace';
        result = Microformats.get(options);
        assert.equal( result.items[0].properties.name[0], '\n     Glenn\n     Jones\n' );
   });
   
   
   it('get - textFormat: whitespacetrimmed', function(){
        options.html = '<a class="h-card" href="http://glennjones.net">\n';
        options.html += '     <span class="p-given-name">Glenn</span>\n';
        options.html += '     <span class="p-family-name">Jones</span>\n';
        options.html += '</a>\n';
     
        options.textFormat = 'whitespacetrimmed';
        result = Microformats.get(options);
        assert.equal( result.items[0].properties.name[0], 'Glenn\n     Jones' );
   });
   
   
    it('get - dateFormat: auto', function(){
        options.html = '<div class="h-event"><span class="p-name">Pub</span><span class="dt-start">2015-07-01t17:30z</span></div>';
        options.dateFormat = 'auto';   
        
        result = Microformats.get(options);
        assert.equal( result.items[0].properties.start[0], '2015-07-01t17:30z' );
        
   });
   
   
   it('get - dateFormat: w3c', function(){
        options.html = '<div class="h-event"><span class="p-name">Pub</span><span class="dt-start">2015-07-01t17:30z</span></div>';
        options.dateFormat = 'w3c';   
        
        result = Microformats.get(options);
        assert.equal( result.items[0].properties.start[0], '2015-07-01T17:30Z' ); 
   });
   
   
   it('get - dateFormat: html5', function(){
        options.html = '<div class="h-event"><span class="p-name">Pub</span><span class="dt-start">2015-07-01t17:30z</span></div>';
        options.dateFormat = 'html5'; 
        
        result = Microformats.get(options);
        assert.equal( result.items[0].properties.start[0], '2015-07-01 17:30Z' );
   });

   
   it('get - dateFormat: rfc3339', function(){
        options.html = '<div class="h-event"><span class="p-name">Pub</span><span class="dt-start">2015-07-01t17:30z</span></div>';
        options.dateFormat = 'rfc3339';
    
        result = Microformats.get(options);
        assert.equal( result.items[0].properties.start[0], '20150701T1730Z' );
   });
   
   
   it('get - filters h-card', function(){
       options.html = '<div class="h-event"><span class="p-name">Pub</span><span class="dt-start">2015-07-01t17:30z</span></div><a class="h-card" href="http://glennjones.net">Glenn Jones</a>';
        var altExpected = {   
            'items': [{
                'type': ['h-card'],
                'properties': {
                    'name': ['Glenn Jones'],
                    'url': ['http://glennjones.net']
                }
            }],
            'rels': {},
            'rel-urls': {}
        }   
       
        options.filters = ['h-card'];
        result = Microformats.get(options);
        assert.deepEqual( result, altExpected );
   });
   
      
   it('get - filters h-event', function(){
       options.html = '<div class="h-event"><span class="p-name">Pub</span><span class="dt-start">2015-07-01t17:30z</span></div><a class="h-card" href="http://glennjones.net">Glenn Jones</a>';
        var altExpected = {   
            'items': [{
                'type': ['h-event'],
                'properties': {
                    'name': ['Pub'],
                    'start': ['2015-07-01t17:30z']
                }
            }],
            'rels': {},
            'rel-urls': {}
        }

        options.filters = ['h-event'];
        result = Microformats.get(options);
        assert.deepEqual( result, altExpected );
   });
   
   
   it('get - filters h-card and h-event', function(){
        options.html = '<div class="h-event"><span class="p-name">Pub</span><span class="dt-start">2015-07-01t17:30z</span></div><a class="h-card" href="http://glennjones.net">Glenn Jones</a>';
        var altExpected = {   
                'items': [{
                    'type': ['h-event'],
                    'properties': {
                        'name': ['Pub'],
                        'start': ['2015-07-01t17:30z']
                    }
                },
                {
                    'type': ['h-card'],
                    'properties': {
                        'name': ['Glenn Jones'],
                        'url': ['http://glennjones.net']
                    }
                }],
                'rels': {},
                'rel-urls': {}
            }

        options.filters = ['h-event', 'h-card'];
        result = Microformats.get(options);
        assert.deepEqual( result, altExpected );
   });
   
   
   it('get - filters h-card no result', function(){
       options.html = '<div class="h-event"><span class="p-name">Pub</span><span class="dt-start">2015-07-01t17:30z</span></div>';
        var altExpected = {   
                'items': [],
                'rels': {},
                'rel-urls': {}
            }

        options.filters = ['h-card'];
        result = Microformats.get(options);
        assert.deepEqual( result, altExpected );
   });
   
   
    it('get - filters h-card match v1 format', function(){
        options.html = '<a class="vcard" href="http://glennjones.net"><span class="fn">Glenn Jones</span></a>';
        var altExpected = {   
                'items': [{
                    'type': ['h-card'],
                    'properties': {
                        'name': ['Glenn Jones']
                    }
                }],
                'rels': {},
                'rel-urls': {}
            }
    
        options.filters = ['h-card'];
        result = Microformats.get(options);
        assert.deepEqual( result, altExpected );
   });
   
   
   it('get - add new v1 format through options', function(){
        options.html = '<div class="hpayment">£<span class="amount">36.78</span></div>';
        var altExpected = {   
                'items': [{
                    'type': ['h-payment'],
                    'properties': {
                        'amount': ['36.78']
                    }
                }],
                'rels': {},
                'rel-urls': {}
            };
        options.maps = {
                root: 'hpayment',
                name: 'h-payment',
                properties: {
                    'amount': {}
                }
            };
    
        result = Microformats.get(options);
        assert.deepEqual( result, altExpected );
   });
   
   
   it('get - using callback', function(done){
        options.html = html;
        Microformats.get(options, function(err, result){
            assert.equal( err, null );
            assert.deepEqual( result, expected );
            done();
        });
   });
   
   
   it('get - using callback with error', function(done){
        Microformats.get({}, function(err, result){
            assert.deepEqual( err, ["No options.node or options.html was provided and no document object could be found."] );
            assert.equal( result, null );
            done();
        });
   });
   
});


 
   
describe('Microformat.getAsync', function() {
    
   beforeEach(function (done) {
        // remove
        delete options.html; 
        delete options.node; 
        delete options.filters;
        // set back to defaults
        options.textFormat = 'whitespacetrimmed';
        options.dateFormat = 'auto';
        options.baseUrl = 'http://example.com/';
        done();
   });   
   
   
   it('get - using promise', function(done){
        options.html = html;
        Microformats.getAsync(options)
            .then(function(result){
                assert.deepEqual( result, expected );
                done();
            });
   });
   
   
   it('get - using promise with error', function(done){
        Microformats.getAsync({})
            .then(function(result){
                assert.equal( result, null );
            })
            .catch(function(err){
                assert.deepEqual( err, ["No options.node or options.html was provided and no document object could be found."] );
                done();
            })
   });
   


});

