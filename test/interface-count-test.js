/*
Interface test for Microformats.count()
*/

var cheerio         = require('cheerio');
    chai            = require('chai'),
    Microformats    = require('../index.js'),
    assert          = chai.assert;
    
    
var options = {
        'baseUrl': 'http://example.com/'
    },
    result;


describe('Microformat.count', function() {
    
    
   it('count - no options', function(){
       result = Microformats.count();
       assert.deepEqual( result, {"errors": ["No options.node or options.html was provided and no document object could be found."]} );
   }); 
   
   
   it('count - emtpy options', function(){
       result = Microformats.count({});
       assert.deepEqual( result, {"errors": ["No options.node or options.html was provided and no document object could be found."]} );
   });
    
  
   it('count - options.html', function(){
        options.html = '<a class="h-card" href="http://glennjones.net"><span class="p-name">Glenn</span></a><a class="h-card" href="http://janedoe.net"><span class="p-name">Jane</span></a><a class="h-event" href="http://janedoe.net"><span class="p-name">Event</span><span class="dt-start">2015-07-01</span></a>';   

        result = Microformats.count(options);
        assert.deepEqual( result, {'h-event': 1,'h-card': 2} );
   });
   
   
   it('count - options.node', function(){
        var html = '<a class="h-card" href="http://glennjones.net"><span class="p-name">Glenn</span></a><a class="h-card" href="http://janedoe.net"><span class="p-name">Jane</span></a><a class="h-event" href="http://janedoe.net"><span class="p-name">Event</span><span class="dt-start">2015-07-01</span></a>';   
        
        var dom = cheerio.load( html );

        result = Microformats.count( {'node': dom} );
        assert.deepEqual( result, {'h-event': 1,'h-card': 2} );
   });
   
   
   it('count rels', function(){
        options.html = '<link href="http://glennjones.net/notes/atom" rel="notes alternate" title="Notes" type="application/atom+xml" /><a class="h-card" href="http://glennjones.net"><span class="p-name">Glenn</span></a><a class="h-card" href="http://janedoe.net"><span class="p-name">Jane</span></a><a class="h-event" href="http://janedoe.net"><span class="p-name">Event</span><span class="dt-start">2015-07-01</span></a>';   
            
        result = Microformats.count(options);
        assert.deepEqual( result, {'h-event': 1,'h-card': 2, 'rels': 1} );
   });
   
     
   it('count - no results', function(){
        options.html = '<span class="p-name">Jane</span>';   

        result = Microformats.count(options);
        assert.deepEqual( result, {} );
   });
   
   
   it('count - using callback', function(done){
        options.html = '<a class="h-card" href="http://glennjones.net"><span class="p-name">Glenn</span></a><a class="h-card" href="http://janedoe.net"><span class="p-name">Jane</span></a><a class="h-event" href="http://janedoe.net"><span class="p-name">Event</span><span class="dt-start">2015-07-01</span></a>';   

        Microformats.count(options, function(err, result){
            assert.equal( err, null );
            assert.deepEqual( result, {'h-event': 1,'h-card': 2} );
            done();
        });
   });
   
   
   it('count - using callback with error', function(done){
        Microformats.count({}, function(err, result){
            assert.deepEqual( err, ["No options.node or options.html was provided and no document object could be found."] );
            assert.equal( result, null );
            done();
        });
   });
   
   
});  
   
   
   
   
describe('Microformat.countAsync', function() {   
   
   
   it('count - using promise', function(done){
        options.html = '<a class="h-card" href="http://glennjones.net"><span class="p-name">Glenn</span></a><a class="h-card" href="http://janedoe.net"><span class="p-name">Jane</span></a><a class="h-event" href="http://janedoe.net"><span class="p-name">Event</span><span class="dt-start">2015-07-01</span></a>'; 
        
        Microformats.countAsync(options)
            .then(function(result){
                assert.deepEqual( result, {'h-event': 1,'h-card': 2} );
                done();
            });
   });
   
   
   it('count - using promise with error', function(done){
        Microformats.countAsync({})
            .then(function(result){
                assert.equal( result, null );
            })
            .catch(function(err){
                assert.deepEqual( err, ["No options.node or options.html was provided and no document object could be found."] );
                done();
            })
   });
   

 });