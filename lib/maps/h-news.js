
hnews = {
  root: 'hnews',
  name: 'h-news',
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
      'uf': ['h-card']
    },
    'category': {},
    'geo': {
      'uf': ['h-geo']
    },
    'latitude': {},
    'longitude': {},
    'source-org': {
      'uf': ['h-card']
    },
    'dateline': {
      'uf': ['h-card']
    },
    'item-license': {},
    'principles': {},
  }
}
exports.hnews = hnews;