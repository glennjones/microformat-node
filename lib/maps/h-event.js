
hevent = {
    root: 'vevent',
    name: 'h-event',
    properties: {
    	'summary': {
            'map': 'p-name'
        },
        'dtstart': {
            'map': 'dt-start'
        },
        'dtend': {
            'map': 'dt-end'
        },
        'description': {},
        'url': {
            'map': 'u-url'
        },
		'category': {},
        'location': {
            'uf': ['h-card']
        },
        'geo': {
            'uf': ['h-geo']
        },
        'latitude': {},
        'longitude': {},
        'duration': {
            'map': 'dt-duration'
        },
        'contact': {
            'uf': ['h-card']
        },
        'organizer': {
            'uf': ['h-card']},
        'attendee': {
            'uf': ['h-card']},
        'uid': {
            'map': 'u-uid'
        },
        'attach': {
            'map': 'u-attach'
        },
        'status': {},
        'rdate': {}, 
        'rrule': {}
    }
}
exports.hevent = hevent;