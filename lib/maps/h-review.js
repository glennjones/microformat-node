
hreview = {
    root: 'hreview',
    name: 'h-review',
    properties: {
        'summary': {'map': 'p-name'},
        'description': {},
        'item': {'map': 'p-item', 'uf': ['h-card', 'h-event']},
        'reviewer': {'map': 'p-reviewer', 'uf': ['h-card']},
        'dtreviewer': {'map': 'dt-reviewer'},
        'rating': {},
        'tags': {}
    }
};
exports.hreview = hreview;