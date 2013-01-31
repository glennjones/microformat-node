var cheerio     = require('cheerio'),
    Parser      = require('../lib/parser.js').Parser;

var parser = new Parser();

// given html returns uf sjon from version 2 parser
function parseHTML(html, baseUrl){
	var dom,
      rootNode,
      options;

  options = {
    'baseUrl': baseUrl,
    'filters': [],
    'version1': true,
    'children': true,
    'childrenRel': true,
    'rel': true,
    'textFormat': 'normalised',
  };

  // not sure we need this ?
  if(html.indexOf('<html') === -1){
    html = '<html>' + html + '</html>';
  }    

  // get dom
  dom = cheerio.load(html);
  rootNode = dom.root();


  return parser.get(dom, rootNode, options).data;
}

exports.parseHTML = parseHTML;
