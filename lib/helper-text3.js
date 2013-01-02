var entities = require("entities");

This


function HelperText(){

	// these tags require a line return before and after the content
	this.spacedTags = ["h1", "h2", "h3", "h4", "h5", "h6", "p", "hr", "pre", "table"];

	// these tags require a line return after the content
	this.blockTags = ["address", "article", "aside", "blockquote", "caption", "col", "colgroup", "dd", "div", 
		"dt", "dir", "fieldset", "figcaption", "figure", "footer", "form",  "header", "hgroup", "hr", 
		"li", "map", "menu", "nav", "optgroup", "option", "section", "tbody", "testarea", 
		"tfoot", "th", "thead", "tr", "td", "ul", "ol", "dl", "details"];

	// these tags require not additional whitespace
	this.inlineTags = ["a","abbr","acronym", "applet", "area", "audio", "b", "big", "basefont", "bdi", "bdo", "bgsound", 
		"blink", "button", "canvas", "cite", "code", "command", "data", "datalist", "del", "dfn", "em", "embed",
	    "i", "iframe", "img", "input", "ins", "kbd", "keygen", "label", "legend", "listing", "mark",
	    "marquee", "meter", "nobr", "object", "output", "param", "progress", "q", "rp", "rt", "ruby", "s", 
	    "samp", "select", "source", "small", "span", "strike", "strong", 
	    "sub", "summary", "sup", "time","tt", "track", "u", "var", "video" ];

	// the contents of these tag should be excluded
	this.excludeTags = ["noframe", "noscript", "script", "style", "frames", "frameset"];

} 


HelperText.prototype = {

	options: {
		formatLists: true,
		spacedTags: true,
		blockTags: true,
		preserveTags: true
	},


	getTextContent: function (element) {
		var isPre = (element.name === 'pre');

		var out = this.walkTreeForText1(element, isPre)
		if(out !== undefined){
			out = out.replace(/[ ]+/g, ' '); // remove double spaces
			out = out.replace(/\r /g, '\r'); // remove any space direcly after a line return
			out = out.replace(/\r{3,}/g, '\r\r'); // remove anything more than double line return
			return this.trim(entities.decode(out,2)) // decode HTML entities
		}else{
			return undefined
		}
	},


	// Extended to find text nodes with downstream tree
	walkTreeForText1: function (element, isPre) {
	    var out = '',
	    	child,
	    	text;

	    if(this.excludeTags.indexOf(element.name) > -1){
	    	return out;
	    }

	    if(element.name === 'br'){
	    	return '\r';
	    }
	   
        // if element is a text node get its text
        if(element.type && element.type === 'text'){
            var textItem = this.getEltText(element)
            if(this.trim(textItem) !== '') {
            	textItem = entities.decode(textItem,2)
            	if(isPre){
            		out = textItem.replace(/ /g, '&nbsp;');
            	}else{
	            	out = this.trim( this.removeWhiteSpace(textItem), ' ', ' ');
	            }
	        }
        }


        // get the text of the child nodes
        if(element.children && element.children.length > 0){
            for (var j = 0; j < element.children.length; j++) {

            	child = element.children[j];
            	if(child.name === 'pre'){
            		isPre = true;
            	}
                text = this.walkTreeForText1(child, isPre);

                if(text !== undefined){
                	if(this.spacedTags.indexOf(child.name) > -1){
                		out += '\r' + text + '\r';

                	} else if(this.blockTags.indexOf(child.name) > -1){
                		out += text + '\r';

                	} else {
                    	out += text;
                	}
                }

            }
        }
	    
	    return (out === '')? undefined : out ;
	},    


	getEltText: function( elt ){
	    if(elt.data){
	        return elt.data;
	    }else{
	        return '';
	    }
	},


	// remove spaces at front and back of string
    trim: function (str, startChar, endChar) {
    	if(!startChar) {startChar = ''}
    	if(!endChar) {endChar = ''}
    	str = str.replace(/^\s+/, startChar);
    	return str.replace(/\s+$/, endChar);
    },


   	// remove excess spaces chars from a string string
    ramoveSpace: function (str) {
    	return str.replace(/[ ]+/g, ' ');
    },


    // remove excess spaces, tab and return chars from a string
    removeWhiteSpace: function( str ){
    	return  str.replace(/[\t\n\r ]+/g, ' ');
    }
  

}


exports.HelperText = HelperText;