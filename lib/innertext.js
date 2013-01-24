/*
    InnerText parser for microformat-node - extracts plain text from DOM nodes
    Copyright (C) 2010 - 2012 Glenn Jones. All Rights Reserved.
    Open License: https://raw.github.com/glennjones/microformat-node/master/license.txt

    The text parser works like textContent but with five additional parsing rules 
    * It excluded the content from tag in the "excludeTags" list ie noframes script etc
    * It adds a single space behind the text string of any element considered block level
    * It removes all line return/feeds and tabs
    * It turns all whitespace into single spaces
    * It trims the final output

    */

var entities    = require('entities'),
    utils       = require('../lib/utilities.js').utilities;


function InnerText(){
    this.data = '';
    this.blockLevelTags = ['h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'p', 'hr', 'pre', 'table',
        'address', 'article', 'aside', 'blockquote', 'caption', 'col', 'colgroup', 'dd', 'div', 
        'dt', 'dir', 'fieldset', 'figcaption', 'figure', 'footer', 'form',  'header', 'hgroup', 'hr', 
        'li', 'map', 'menu', 'nav', 'optgroup', 'option', 'section', 'tbody', 'testarea', 
        'tfoot', 'th', 'thead', 'tr', 'td', 'ul', 'ol', 'dl', 'details'];

    this.excludeTags = ['noframe', 'noscript', 'script', 'style', 'frames', 'frameset'];

    // optional element should be a dom node
    if(arguments[0]) {
       this.parse(arguments[0]);
    }
} 


InnerText.prototype = {

    // gets the text from dom node 
    parse: function(element){
        if(element){
            this.element = element;
        }

        var out = this.walkTreeForText( this.element );

        if(out !== undefined){
            out = out.replace( /&nbsp;/g, ' ') ;    // exchanges html entity for space into space char
            out = utils.removeWhiteSpace( out );    // removes linefeeds, tabs and addtional spaces
            out = entities.decode( out, 2 );        // decode HTML entities
            out = out.replace( '–', '-' );          // correct dash decoding
            this.data = utils.trim( out );
        }else{
            this.data = undefined;
        }
        return this.data;
    },


    // returns the current plain text string
    toString: function(){
        return this.data;
    },


    // extracts the text nodes in the tree
    walkTreeForText: function( element ) {
        var out = '',
            j = 0;

        if(this.excludeTags.indexOf( element.name ) > -1){
            return out;
        }

        // if element is a text node get its text
        if(element.type && element.type === 'text'){
            out += this.getElementText( element ); 
        }

        // get the text of the child nodes
        if(element.children && element.children.length > 0){
            for (j = 0; j < element.children.length; j++) {
                var text = this.walkTreeForText( element.children[j] );
                if(text !== undefined){
                    out += text;
                }
            }
        }

        // if its a block level tag add an additional space at the end
        if(this.blockLevelTags.indexOf( element.name ) !== -1){
            out += ' ';
        } 
        
        return (out === '')? undefined : out ;
    },    


    // get the text from a node in the dom
    getElementText: function( elt ){
        if(elt.data){
            return elt.data;
        }else{
            return '';
        }
    }

};


exports.InnerText = InnerText;