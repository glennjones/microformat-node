/*
    Copyright (C) 2010 - 2013 Glenn Jones. All Rights Reserved.
    MIT License: https://raw.github.com/glennjones/microformat-node/master/license.txt
    
  */
  
var hreviewaggregate = {
    root: 'hreview-aggregate',
    name: 'h-review-aggregate',
    properties: {
        'summary': {
            'map': 'p-name'
        },
        'item': {
            'map': 'p-item',
            'uf': ['h-item', 'h-geo', 'h-adr', 'h-card', 'h-event', 'h-product']
        },
        'rating': {},
        'average': {},
        'best': {},
        'worst': {},       
        'count': {},
        'votes': {},
        'category': {
            'map': 'p-category',
            'relAlt': ['tag']
        },
        'url': {
            'map': 'u-url',
            'relAlt': ['self', 'bookmark']
        }
    }
};

exports.hreviewaggregate = hreviewaggregate;
