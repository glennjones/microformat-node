hentry = {
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
            'map': 'p-author', 
            'uf': ['h-card']
        },
        'category': {},
        'geo': {
            'map': 'p-geo', 
            'uf': ['h-geo']
        },
        'latitude': {},
        'longitude': {}
    }
}
exports.hentry = hentry;