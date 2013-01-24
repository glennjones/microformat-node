/*
    Copyright (C) 2010 - 2012 Glenn Jones. All Rights Reserved.
    Open License: https://raw.github.com/glennjones/microformat-node/master/license.txt
    
  */
  
var hcard = {
	root: 'vcard',
	name: 'h-card',
	properties: {
		'fn': {
			'map': 'p-name'
		},
		'adr': {
			'uf': ['h-adr']
		},
		'agent': {
			'uf': ['h-card']
		},
		'bday': {
			'map': 'dt-bday'
		},
		'class': {},
		'category': {
			'map': 'p-category',
			'relAlt': ['tag']
		},
		'email': {
			'map': 'u-email'
		},
		'geo': {
			'map': 'p-geo', 
			'uf': ['h-geo']
		},
		'key': {},
		'label': {},
		'logo': {
			'map': 'u-logo'
		},
		'mailer': {},
		'honorific-prefix': {},
		'given-name': {},
		'additional-name': {},
		'family-name': {},
		'honorific-suffix': {},
		'nickname': {},
		'note': {}, // could be html i.e. e-note
		'org': {},
		'p-organization-name': {},
		'p-organization-unit': {},
		'photo': {
			'map': 'u-photo'
		},
		'rev': {
			'map': 'dt-rev'
		},
		'role': {},
		'sequence': {},
		'sort-string': {},
		'sound': {
			'map': 'u-sound'
		},
		'title': {},
		'tel': {},
		'tz': {},
		'uid': {
			'map': 'u-uid'
		},
		'url': {
			'map': 'u-url'
		}
	}
};
exports.hcard = hcard;