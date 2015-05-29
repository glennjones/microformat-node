/*
    InnerText Parser 
    extracts plain text from DOM nodes
    Copyright (C) 2010 - 2013 Glenn Jones. All Rights Reserved.
    MIT License: https://raw.github.com/glennjones/microformat-node/master/license.txt

    The text parser works like textContent but with five additional parsing rules 
    * It excluded the content from tag in the "excludeTags" list ie noframes script etc
    * It adds a single space behind the text string of any node considered block level
    * It removes all line return/feeds and tabs
    * It turns all whitespace into single spaces
    * It trims the final output

    */

'use strict';

var entities    = require('entities'),
    domUtils    = require('./domutils.js'),
    utils       = require('./utilities.js');


function parse(dom, node, textFormat){
    var text = new Text();
    return text.parse(dom, node, textFormat);
};

function textContent( htmlStr, textFormat ){
    var text = new Text();
    return text.textContent( htmlStr, textFormat );
};

exports.parse = parse;
exports.textContent = textContent;




function Text(){
    this.textFormat = 'whitespacetrimmed'; // normalised or whitespace or whitespacetrimmed - used as default
    this.blockLevelTags = ['h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'p', 'hr', 'pre', 'table',
        'address', 'article', 'aside', 'blockquote', 'caption', 'col', 'colgroup', 'dd', 'div', 
        'dt', 'dir', 'fieldset', 'figcaption', 'figure', 'footer', 'form',  'header', 'hgroup', 'hr', 
        'li', 'map', 'menu', 'nav', 'optgroup', 'option', 'section', 'tbody', 'textarea', 
        'tfoot', 'th', 'thead', 'tr', 'td', 'ul', 'ol', 'dl', 'details'];

    this.excludeTags = ['noframe', 'noscript', 'script', 'style', 'frames', 'frameset'];
} 


Text.prototype = {

    // gets the text from dom node 
    parse: function(dom, node, textFormat){
        var out;

        this.textFormat = (textFormat)? textFormat : this.textFormat;
        if(this.textFormat === 'normalised'){
            out = this.walkTreeForText( dom, node );
            if(out !== undefined){
                out = out.replace( /&nbsp;/g, ' ') ;    // exchanges html entity for space into space char
                out = utils.removeWhiteSpace( out );    // removes linefeeds, tabs and addtional spaces
                out = entities.decode( out, 2 );        // decode HTML entities
                out = out.replace( '–', '-' );          // correct dash decoding
                return utils.trim( out );
            }else{
                return undefined;
            }
        }else{
            return this.textContent( dom(node).html(), {textFormat: this.textFormat} );
        }
    },
    
    
    // strip tags from html like textContent
    textContent: function( text, textFormat ){
       this.textFormat = (textFormat)? textFormat : this.textFormat;
       if(text){
          var out = '',
              regex = /(<([^>]+)>)/ig;
            
          out = text.replace(regex, "");   
          if(this.textFormat === 'whitespacetrimmed') {    
             out = this.trimEnds( out );
          }
          
          return entities.decode( out, 2 );
       }else{
          return text; 
       }
    },
    
    
    // removes whitespace, tabs and returns from start and end of text
    trimEnds: function( text ){
        if(text && text.length){
            var i = text.length,
                x = 0;
            
            // turn all whitespace chars at end into spaces
            while (i--) {
                if(utils.isOnlyWhiteSpace(text[i])){
                    text[i] = ' ';
                }else{
                    break;
                }
            }
            
            // turn all whitespace chars at start into spaces
            i = text.length;
            while (x < i) {
                if(utils.isOnlyWhiteSpace(text[x])){
                    text[x] = ' ';
                }else{
                    break;
                }
                x++;
            }
        }
        return utils.trim(text);
    },



    // extracts the text nodes in the tree
    walkTreeForText: function( dom, node ) {
        var out = '',
            j = 0;

        if(node && this.excludeTags.indexOf( node.name ) > -1){
            return out;
        }

        // if node is a text node get its text
        if(node.type && node.type === 'text'){
            out += this.getElementText( node ); 
        }

        // exclude text which has been added with uf include pattern
        if(node.type && node.type === 'tag' && domUtils.hasAttributeValue(dom, node, 'data-include', 'true') !== -1){
            
            // get the text of the child nodes
            if(node.children && node.children.length > 0){
                for (j = 0; j < node.children.length; j++) {
                    var text = this.walkTreeForText( dom, node.children[j] );
                    if(text !== undefined){
                        out += text;
                    }
                }
            }

            // if its a block level tag add an additional space at the end
            if(this.blockLevelTags.indexOf( node.name ) !== -1){
                out += ' ';
            }
        } 
        
        return (out === '')? undefined : out ;
    },    


    // get the text from a node in the dom
    getElementText: function( node ){
        if(node.data){
            return node.data;
        }else{
            return '';
        }
    }

};

