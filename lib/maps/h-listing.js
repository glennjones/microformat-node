/*
    Copyright (C) 2010 - 2012 Glenn Jones. All Rights Reserved.
    Open License: https://raw.github.com/glennjones/microformat-node/master/license.txt
    
  */
  
var hlisting = {
  root: 'hlisting',
  name: 'h-listing',
  properties: {
    'version': {},
    'lister': {
      'uf': ['h-card']
    },
    'dtlisted': {
      'map': 'dt-listed'
    },
    'dtexpired': {
      'map': 'dt-expired'
    },
    'location': {},
    'price': {},
    'item': {
      'uf': ['h-card','a-adr','h-geo']
    },
    'summary': {
      'map': 'p-name'
    },
    'description': {
      'map': 'e-description'
    },
    'listing': {}
  }
};
exports.hlisting = hlisting;