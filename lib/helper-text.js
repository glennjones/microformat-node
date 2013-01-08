var entities = require("entities");

/*
 This version is like textContent but with five additional parsing rules 
 	* It excluded the content of the "exclude tags" ie noframes script etc
	* It adds a single space behind the text string of any element considered block level
	* It removes all line return/feeds and tabs
 	* It turns all whitespace into single spaces
	* It trims the final output
*/

function HelperText(){
	// these tags require additional whitespace after thier contents
	this.blockTags = ["h1", "h2", "h3", "h4", "h5", "h6", "p", "hr", "pre", "table",
		"address", "article", "aside", "blockquote", "caption", "col", "colgroup", "dd", "div", 
		"dt", "dir", "fieldset", "figcaption", "figure", "footer", "form",  "header", "hgroup", "hr", 
		"li", "map", "menu", "nav", "optgroup", "option", "section", "tbody", "testarea", 
		"tfoot", "th", "thead", "tr", "td", "ul", "ol", "dl", "details"];
	// the contents of these tag should be excluded
	this.excludeTags = ["noframe", "noscript", "script", "style", "frames", "frameset"];
} 


HelperText.prototype = {

	getTextContent: function (element) {
		var out = this.walkTreeForText(element)
		if(out !== undefined){
			out = out.replace(/&nbsp;/g, ' '); // exchanges html entity for space into char
			out = out.replace(/[\t\n\r ]+/g, ' '); // removes linefeeds, tabs and addtional spaces
			out = entities.decode(out,2) // decode HTML entities
			out = out.replace('–','-')
			return this.trim(out)
		}else{
			return undefined
		}
	},

	//expected 'The Queen\'s College, Oxford University, BA Hons (I) Physics 1973 – 1976' to equal 'The Queen\'s College, Oxford University, BA Hons (I) Physics 1973 - 1976'


	// extracts the text nodes in the tree
	walkTreeForText: function (element) {
	    var out = '';

	   	if(this.excludeTags.indexOf(element.name) > -1){
	    	return out;
	    }

        // if element is a text node get its text
        if(element.type && element.type === 'text'){
            out += this.getEltText(element) 
        }

        // get the text of the child nodes
        if(element.children && element.children.length > 0){
            for (var j = 0; j < element.children.length; j++) {
                var text = this.walkTreeForText(element.children[j]);
                if(text !== undefined){
                    out += text;
                }
            }
        }

        // if its a block level tag add an additional space at the end
        if(this.blockTags.indexOf(element.name) !== -1){
       		out += ' ';
        } 
	    
	    return (out === '')? undefined : out ;
	},    


	// get the text from a node in the dom
	getEltText: function( elt ){
	    if(elt.data){
	        return elt.data;
	    }else{
	        return '';
	    }
	},


	// remove spaces at front and back of string
    trim: function (str) {
    	return str.replace(/^\s+|\s+$/g, "");
    }


}


exports.HelperText = HelperText;