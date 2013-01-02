var cheerio     = require('cheerio'),
    request     = require('request'),
    Uf2Parser   = require('../lib/uf2parser.js').Uf2Parser;

var uf2Parser = new Uf2Parser();

// given html returns uf sjon from version 2 parser
function parseHTML(html, baseUrl){
	var $,
        baseTag,
        href,
        rootNode,
        ownerDocument;


    if(html.indexOf('<html') === -1){
      html = '<html>' + html + '</html>';
    }    

	$ = cheerio.load(html); 
    // find base tag if its exists in the header
    baseTag = $('base');
    if(baseTag.length > 0){
      href = $(baseTag).attr('href');
      if(href)
          baseUrl = href;
    }



    // define containing/root node - take hash from url
    rootNode = ownerDocument = $('html');
    return uf2Parser.get($, rootNode, baseUrl, ownerDocument, null);
}

exports.parseHTML = parseHTML;
