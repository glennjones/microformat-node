
  
// does a string start with the test
startWith = function(str, test){
    return (str.indexOf(test) === 0)
},

// remove spaces at front and back of string
trim = function (str) {
    return str.replace(/^\s+|\s+$/g, "");
},

// is the object a string
isString = function(obj) {
    return typeof (obj) == 'string';
},

// is the object a array
isArray = function (obj) {
    return obj && !(obj.propertyIsEnumerable('length')) 
    && typeof obj === 'object' 
    && typeof obj.length === 'number';
},

// simple function to find out if a object has any properties. 
hasProperties = function (obj) {
  for (var key in obj) {
    if(obj.hasOwnProperty(key)){
      return true;
    }
  }
  return false;
},


exports.startWith = startWith;
exports.trim = trim;
exports.isString = isString;
exports.isArray = isArray;
exports.hasProperties = hasProperties;