
function UfHelpers(){} 


UfHelpers.prototype = {

	blockTags : ["address","article","aside", "audio", "blockquote", "body", "br", "canvas", "caption", 
	    "col", "colgroup", "dd", "div", "dl", "dt", "embed", "fieldset", "figcaption", "figure", 
	    "footer", "form", "h1", "h2", "h3", "h4", "h5", "h6", "h7", "header", "hgroup", "hr", "li", 
	    "map", "object", "ol", "output", "p", "pre", "progress", "section", "table", "tbody", 
	    "testarea", "tfoot", "th", "thead", "tr", "td", "ul", "video" ],

	inline : ["a","abbr","acronym", "b", "big", "cite", "code", "dfn", "em", 
	    "i", "img", "input", "label", "q", "samp", "select", "small", "span", "strong", 
	    "sub", "sup", "tt", "details", "mark", "time" ],


	preserveTags : ["pre", "code", "textarea"], 



	getTextContent: function (element) {
		var out = this.walkTreeForText(element)
		if(out !== undefined){
			out = out.replace(/[\t\n\r ]+/g, ' ');
			return this.trim(out)
		}else{
			return undefined
		}
	},


	// Extended to find text nodes with downstream tree
	walkTreeForText: function (element) {
	    var out = '';


       	if(this.inline.indexOf(element.name) === -1){
       		out += ' ';
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
    trim: function (str) {
    	return str.replace(/^\s+|\s+$/g, "");
    },


  

}


exports.UfHelpers = UfHelpers;