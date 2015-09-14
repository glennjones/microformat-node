/*
Interface test for Microformats.isMicroformat() 
*/


var cheerio         = require('cheerio');
    chai            = require('chai'),
    Microformats    = require('../index.js'),
    assert          = chai.assert;
    
    
var options = {
        'baseUrl': 'http://example.com/'
    };
    


describe('Microformat.isMicroformat', function() {
    
    beforeEach(function (done) { 
        delete options.filters; 
        done();
    });
        
  
   it('true - v2', function(){  
        var html = '<a class="h-card" href="http://glennjones.net"><span class="p-name">Glenn</span></a>',
            node = cheerio.load(html);
        assert.isTrue( Microformats.isMicroformat( node, options ) );
   });
   
   
   it('true - v1', function(){   
        var html = '<a class="vcard" href="http://glennjones.net"><span class="fn">Glenn</span></a>',
            node = cheerio.load(html);  
        assert.isTrue( Microformats.isMicroformat( node, options ) );
   });
   
   
   it('true - v2 filter', function(){
        var html = '<a class="h-card" href="http://glennjones.net"><span class="p-name">Glenn</span></a>',
            node = cheerio.load(html);
        options.filters = ['h-card']; 
        assert.isTrue( Microformats.isMicroformat( node, options ) );
   });
   
   
   it('true - v1 filter', function(){
        var html = '<a class="vcard" href="http://glennjones.net"><span class="fn">Glenn</span></a>',
            node = cheerio.load(html);
        options.filters = ['h-card'];   
        assert.isTrue( Microformats.isMicroformat( node, options ) );
   });
   
   
   it('false - v2 filter', function(){
        var html = '<a class="h-card" href="http://glennjones.net"><span class="p-name">Glenn</span></a>',
            node = cheerio.load(html);
        options.filters = ['h-entry'];      
        assert.isFalse( Microformats.isMicroformat( node, options ) );
   });
   
     
   it('false - property', function(){
        var html = '<span class="p-name">Glenn</span>',
            node = cheerio.load(html);  
        assert.isFalse( Microformats.isMicroformat( node, options ) );
   });
   
   
   it('false - no class', function(){
        var html = '<span>Glenn</span>',
            node = cheerio.load(html);   
        assert.isFalse( Microformats.isMicroformat( node, options ) );
        
   });
   
   
   it('false - no node', function(){
        assert.isFalse( Microformats.isMicroformat() );
   });
   
   
   it('true - using callback', function(done){
        var html = '<a class="h-card" href="http://glennjones.net"><span class="p-name">Glenn</span></a>',
            node = cheerio.load(html);   
        Microformats.isMicroformat( node, options, function(err, result){
            assert.equal( err, null );
            assert.isTrue( result );
            done();
        });
   });
   
   
   it('true - using callback no options', function(done){
        var html = '<a class="h-card" href="http://glennjones.net"><span class="p-name">Glenn</span></a>',
            node = cheerio.load(html);   
        Microformats.isMicroformat( node, function(err, result){
            assert.equal( err, null );
            assert.isTrue( result );
            done();
        });
   });
   
 });  
   
   
   
describe('Microformat.isMicroformatAsync', function() {
    
    beforeEach(function (done) { 
        delete options.filters; 
        done();
    });   
   
   
   it('true - using promise', function(done){
        var html = '<a class="h-card" href="http://glennjones.net"><span class="p-name">Glenn</span></a>',
            node = cheerio.load(html);   
        
        Microformats.isMicroformatAsync(node, options)
            .then(function(result){
                assert.isTrue( result );
                done();
            });
   });
   
   
 });
 
