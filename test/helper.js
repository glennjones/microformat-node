// simple helper class for running tests
'use strict';
var Microformats = require('../index.js');

// given html returns uf json from parser
function parseHTML(html, baseUrl){
	var options;

  options = {
    'html': html,
    'baseUrl': baseUrl,
    'overlappingVersions': false,
    'impliedPropertiesByVersion': true
  };

  return Microformats.get(options);
}

exports.parseHTML = parseHTML;