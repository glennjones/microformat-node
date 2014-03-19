/*
    HTML Parser 
    extracts HTML from DOM nodes
    Copyright (C) 2010 - 2013 Glenn Jones. All Rights Reserved.
    MIT License: https://raw.github.com/glennjones/microformat-node/master/license.txt

    Used to create a HTML string from DOM, rather than .html().
    Was created to get around issue of not been able to remove nodes with 'data-include' attr

    */

'use strict';

var domUtils    = require('./domutils.js'),
    utils       = require('./utilities.js');

function Html(){
    this.voidElt = ['area', 'base', 'br', 'col', 'hr', 'img', 'input', 'link', 'meta', 'param', 'command', 'keygen', 'source'];
} 


module.exports.parse = function(dom, node, textFormat){
    var html = new Html();
    return html.parse(dom, node, textFormat);
};





Html.prototype = {

    // gets the text from dom node 
    parse: function(dom, node ){
        var out = this.walkTreeForHtml( dom, node );
        if(out !== undefined){
            return utils.trim( out );
        }else{
            return undefined;
        }
    },



    // extracts the text nodes in the tree
    walkTreeForHtml: function( dom, node ) {
        var out = '',
            j = 0;

        // if node is a text node get its text
        if(node.type && node.type === 'text'){
            out += this.getElementText( node ); 
        }

    
        // exclude text which has been added with uf include pattern  - 
        if(node.type && node.type === 'tag' && domUtils.hasAttribute(dom, node, 'data-include') === false){

            // begin tag
            out += '<' + node.name;  

            // add attributes
            for (var key in node.attribs) {
              if(node.attribs.hasOwnProperty(key)){
                out += ' ' + key +  '=' + '"' + node.attribs[key] + '"';
              }
            }

            if(this.voidElt.indexOf(node.name) === -1){
                out += '>';
            }

            // get the text of the child nodes
            if(node.children && node.children.length > 0){
                for (j = 0; j < node.children.length; j++) {
                    var text = this.walkTreeForHtml( dom, node.children[j] );
                    if(text !== undefined){
                        out += text;
                    }
                }
            }

            // end tag
            if(this.voidElt.indexOf(node.name) > -1){
                out = ' />'; 
            }else{
                out += '</' + node.name + '>'; 
            }
        } 
        
        return (out === '')? undefined : out;
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
