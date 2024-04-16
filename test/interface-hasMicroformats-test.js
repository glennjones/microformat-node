/*
Interface test for Microformats.hasMicroformats() 
*/

var cheerio         = require('cheerio');
    chai            = require('chai'),
    Microformats    = require('../index.js'),
    assert          = chai.assert;
    
    
var options = {
        'baseUrl': 'http://example.com/'
    };


describe('Microformat.hasMicroformats', function() {
    
    
   beforeEach(function (done) {
        delete options.filters; 
        done();
   });
  
  
   it('true - v2', function(){
        var html = '<a class="h-card" href="http://glennjones.net"><span class="p-name">Glenn</span></a>',
            node = cheerio.load(html, null, false);   
        assert.isTrue( Microformats.hasMicroformats( node, options ) );
   });
   
   
   it('true - v1', function(){
        var html = '<a class="vcard" href="http://glennjones.net"><span class="fn">Glenn</span></a>',
            node = cheerio.load(html, null, false);   
        assert.isTrue( Microformats.hasMicroformats( node, options ) );
   });
   
   
   it('true - v2 filter', function(){
        var html = '<div><a class="h-card" href="http://glennjones.net"><span class="p-name">Glenn</span></a></div>',
            node = cheerio.load(html, null, false);
        options.filters = ['h-card'];       
        assert.isTrue( Microformats.hasMicroformats( node, options ) );
   });
   
   
   it('true - v1 filter', function(){
        var html = '<a class="vcard" href="http://glennjones.net"><span class="fn">Glenn</span></a>',
            node = cheerio.load(html, null, false);
        options.filters = ['h-card'];     
        assert.isTrue( Microformats.hasMicroformats( node, options ) );
   });
   
   
   it('false - v2 filter', function(){
        var html = '<a class="h-card" href="http://glennjones.net"><span class="p-name">Glenn</span></a>',
            node = cheerio.load(html, null, false); 
        options.filters = ['h-entry'];  
        assert.isFalse( Microformats.hasMicroformats( node, options ) );
   });
   
     
   it('false - property', function(){
        var html = '<span class="p-name">Glenn</span>',
            node = cheerio.load(html, null, false);   
        assert.isFalse( Microformats.hasMicroformats( node, options ) );
   });
   
   
   it('false - no class', function(){
        var html = '<span>Glenn</span>',
            node = cheerio.load(html, null, false);   
        assert.isFalse( Microformats.hasMicroformats( node, options ) );
   });
   
   
   it('false - no node', function(){
        assert.isFalse( Microformats.hasMicroformats( ) );
   });
   
   
   it('true - child', function(){ 
        var html = '<section><div><a class="h-card" href="http://glennjones.net"><span class="p-name">Glenn</span></a></div></section>',
            node = cheerio.load(html, null, false);   
        assert.isTrue( Microformats.hasMicroformats( node, options ) );
   });
   
  
   it('true - document', function(){
        var html = '<html><head></head><body><section><div><a class="h-card" href="http://glennjones.net"><span class="p-name">Glenn</span></a></div></section></body></html>',
            node = cheerio.load(html, null, false);   
        assert.isTrue( Microformats.hasMicroformats( node, options ) );
   });
   
   
   it('true - using callback', function(done){
        var html = '<a class="h-card" href="http://glennjones.net"><span class="p-name">Glenn</span></a>',
            node = cheerio.load(html, null, false);   
        Microformats.hasMicroformats( node, options, function(err, result){
            assert.equal( err, null );
            assert.isTrue( result );
            done();
        });
   });
   
   
  it('true - using callback no options', function(done){
        var html = '<a class="h-card" href="http://glennjones.net"><span class="p-name">Glenn</span></a>',
            node = cheerio.load(html, null, false);   
        Microformats.hasMicroformats( node, function(err, result){
            assert.equal( err, null );
            assert.isTrue( result );
            done();
        });
   });


 });
 
    
   
describe('Microformat.hasMicroformatsAsync', function() {
      
   beforeEach(function (done) {
        delete options.filters; 
        done();
   });

  it('true - using promise', function(done){
        var html = '<a class="h-card" href="http://glennjones.net"><span class="p-name">Glenn</span></a>',
            node = cheerio.load(html, null, false); 
        
        Microformats.hasMicroformatsAsync(node, options)
            .then(function(result){
                assert.isTrue( result );
                done();
            });
   });
   
  
   
   
 });
 
