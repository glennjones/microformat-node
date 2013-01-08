
hevent = {
    root: 'vevent',
    name: 'h-event',
    properties: {
    	'summary': {'map': 'p-name'},
        'dtstart': {'map': 'dt-start'},
        'dtend': {'map': 'dt-end'},
        'description': {},
        'url': {'map': 'u-url'},
		'category': {},
        'location': {'map': 'p-location', 'uf': ['h-card']},
        'geo': {'map': 'p-geo', 'uf': ['h-geo']},
        'latitude': {},
        'longitude': {},
        'duration': {'map': 'dt-duration'},
        'contact': {'map': 'p-contact', 'uf': ['h-card']},
        'organizer': {'map': 'p-organizer', 'uf': ['h-card']},
        'attendee': {'map': 'p-attendee', 'uf': ['h-card']},
        'uid': {'map': 'u-uid'},
        'attach': {'map': 'u-attach'},
        'status': {},
        'rdate': {}, 
        'rrule': {}
        // experimental properties  
    }
}
exports.hevent = hevent;