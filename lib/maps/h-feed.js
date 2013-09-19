/*
    Copyright (C) 2010 - 2013 Glenn Jones. All Rights Reserved.
    MIT License: https://raw.github.com/glennjones/microformat-node/master/license.txt
    
  */
  
var hfeed = {
	root: 'hfeed',
	name: 'h-feed',
	properties: {
		'entry': { 
			'uf': ['h-entry']
		},
		'author': { 
			'uf': ['h-card']
		},
		'category': {
			'map': 'p-category',
			'relAlt': ['tag']
		},
		'url': {
            'map': 'u-url'
        },
        'photo': {
			'map': 'u-photo'
		},
	}
};
exports.hfeed = hfeed;