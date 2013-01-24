/*
    Copyright (C) 2010 - 2012 Glenn Jones. All Rights Reserved.
    Open License: https://raw.github.com/glennjones/microformat-node/master/license.txt
    
  */

var hproduct = {
  root: 'hproduct',
  name: 'h-product',
  properties: {
    'brand': {
      'uf': ['h-card']
    },
    'category': {
      'map': 'p-category',
      'relAlt': ['tag']
    },
    'price': {},
    'description': {
      'map': 'e-description',
    },
    'fn': {
      'map': 'p-name'
    },
    'photo': {
      'map': 'u-photo'
    },
    'url': {
      'map': 'u-url'
    },
    'review': {
      'uf': ['h-review', 'h-review-aggregate']
    },
    'listing': {
      'uf': ['h-listing']
    },
    'identifier': {
      'map': 'u-identifier'
    }
  }
};
exports.hproduct = hproduct;