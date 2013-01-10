
hreview = {
    root: 'hreview',
    name: 'h-review',
    properties: {
        'summary': {
            'map': 'p-name'
        },
        'description': {},
        'item': {
            'uf': ['h-card', 'h-event']
        },
        'reviewer': {
            'uf': ['h-card']
        },
        'dtreviewer': {
            'map': 'dt-reviewer'
        },
        'rating': {},
        'tags': {}
    }
};
exports.hreview = hreview;