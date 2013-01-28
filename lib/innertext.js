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

var entities    = require('entities'),
    utils       = require('../lib/utilities.js').utilities;


function InnerText(){
    this.data = '';
    this.textFormat = 'normalised'; // normalised or whitespace
    this.blockLevelTags = ['h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'p', 'hr', 'pre', 'table',
        'address', 'article', 'aside', 'blockquote', 'caption', 'col', 'colgroup', 'dd', 'div', 
        'dt', 'dir', 'fieldset', 'figcaption', 'figure', 'footer', 'form',  'header', 'hgroup', 'hr', 
        'li', 'map', 'menu', 'nav', 'optgroup', 'option', 'section', 'tbody', 'testarea', 
        'tfoot', 'th', 'thead', 'tr', 'td', 'ul', 'ol', 'dl', 'details'];

    this.excludeTags = ['noframe', 'noscript', 'script', 'style', 'frames', 'frameset'];

    // optional node should be a dom node
    if(arguments.length === 3) {
       this.parse(arguments[0], arguments[1], arguments[2]);
    }
} 


InnerText.prototype = {

    // gets the text from dom node 
    parse: function(dom, node, textFormat){
        if(node){
            this.node = node;
        }

        this.textFormat = (textFormat)? textFormat : this.textFormat;

        if(this.textFormat === 'normalised'){
            var out = this.walkTreeForText( this.node );
            if(out !== undefined){
                out = out.replace( /&nbsp;/g, ' ') ;    // exchanges html entity for space into space char
                out = utils.removeWhiteSpace( out );    // removes linefeeds, tabs and addtional spaces
                out = entities.decode( out, 2 );        // decode HTML entities
                out = out.replace( '–', '-' );          // correct dash decoding
                this.data = utils.trim( out );
            }else{
                this.data = undefined;
            }
        }else{
           this.data = dom(node).text(); 

        }
        return this.data;
    },


    // returns the current plain text string
    toString: function(){
        return this.data;
    },


    // extracts the text nodes in the tree
    walkTreeForText: function( node ) {
        var out = '',
            j = 0;

        if(this.excludeTags.indexOf( node.name ) > -1){
            return out;
        }

        // if node is a text node get its text
        if(node.type && node.type === 'text'){
            out += this.getElementText( node ); 
        }

        // get the text of the child nodes
        if(node.children && node.children.length > 0){
            for (j = 0; j < node.children.length; j++) {
                var text = this.walkTreeForText( node.children[j] );
                if(text !== undefined){
                    out += text;
                }
            }
        }

        // if its a block level tag add an additional space at the end
        if(this.blockLevelTags.indexOf( node.name ) !== -1){
            out += ' ';
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


exports.InnerText = InnerText;