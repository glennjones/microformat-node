hresume = {
    root: 'hresume',
    name: 'h-resume',
    properties: {
    	'summary': {},
        'contact': {'map': 'p-contact', 'uf': ['h-card']},
        'education': {'map': 'p-education', 'uf': ['h-card','h-event']},
        'experience': {'map': 'p-experience', 'uf': ['h-card','h-event']},
        'skill': {'map': 'p-skill', 'uf': ['h-competency']},
        'affiliation': {'map': 'p-affiliation', 'uf': ['h-card']}
    }
}
exports.hresume = hresume;