/*
    Copyright (C) 2010 - 2013 Glenn Jones. All Rights Reserved.
    MIT License: https://raw.github.com/glennjones/microformat-node/master/license.txt
    
  */
  
var hitem = {
	root: 'item',
	name: 'h-item',
	subTree: false,
	properties: {
		'fn': {
			'map': 'p-name'
		},
		'url': {
			'map': 'u-url'
		},
		'photo': {
			'map': 'u-photo'
		}
	}
};
exports.hitem = hitem;