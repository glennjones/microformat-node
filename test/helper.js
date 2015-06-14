// simple helper class for running tests
'use strict';

var cheerio     = require('cheerio'),
    Parser      = require('../lib/parser.js').Parser;

var parser = new Parser();

// given html returns uf json from parser
function parseHTML(html, baseUrl){
	var dom,
      rootNode,
      options;

  options = {
    'baseUrl': baseUrl
  };

  // get dom
  dom = cheerio.load(html);
  rootNode = dom.root();

  return parser.get(dom, rootNode, options).data;
}

exports.parseHTML = parseHTML;
