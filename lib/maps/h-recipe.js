
hrecipe = {
  root: 'hrecipe',
  name: 'h-recipe',
  properties: {
    'fn': {
      'map': 'p-name'
    },
    'ingredient': {
      'map': 'e-ingredient'
    },
    'yield': {},
    'instructions': {
      'map': 'e-instructions'
    },
    'duration': {
      'map': 'dt-name'
    },
    'photo': {
      'map': 'u-photo'
    },
    'summary': {},
    'author': {
      'uf': ['h-card']
    },
    'published': {
      'map': 'dt-published'
    },
    'nutrition': {},
    'tag': {}
  }
}
exports.hrecipe = hrecipe;

// needs replacment for nutrition/measure and  ingredient/measure both of which can also be value/type pairs
