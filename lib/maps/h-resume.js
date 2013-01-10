hresume = {
    root: 'hresume',
    name: 'h-resume',
    properties: {
    	'summary': {},
        'contact': {
            'uf': ['h-card']
        },
        'education': {
            'uf': ['h-card','h-event']
        },
        'experience': { 
            'uf': ['h-card','h-event']
        },
        'skill': {
            'uf': ['h-competency']
        },
        'affiliation': { 
            'uf': ['h-card']
        }
    }
}
exports.hresume = hresume;