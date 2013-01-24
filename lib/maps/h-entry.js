/*
    Copyright (C) 2010 - 2012 Glenn Jones. All Rights Reserved.
    Open License: https://raw.github.com/glennjones/microformat-node/master/license.txt
    
  */

var hentry = {
	root: 'hentry',
	name: 'h-entry',
	properties: {
		'entry-title': {
			'map': 'p-name'
		},
		'entry-summary': {
			'map': 'p-summary'
		},
		'entry-content': {
			'map': 'e-content'
		},
		'published': {
			'map': 'dt-published'
		},
		'updated': {
			'map': 'dt-updated'
		},
		'author': { 
			'uf': ['h-card']
		},
		'category': {
			'map': 'p-category',
			'relAlt': ['tag']
		},
		'geo': {
			'map': 'p-geo', 
			'uf': ['h-geo']
		},
		'latitude': {},
		'longitude': {}
	}
};
exports.hentry = hentry;