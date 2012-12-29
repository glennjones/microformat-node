/*!
    Uf2Parser.js
    A compact JavaScript cross browser microformats 2 parser by Glenn Jones. 
    Copyright (C) 2012 Glenn Jones. All Rights Reserved.
    Open License: https://raw.github.com/glennjones/microformat-node/master/license.txt
*/


var HelperText = require('../lib/helper-text1.js').HelperText,
    ISODate = require('../lib/helper-isodate.js'),
    isoDate = new ISODate.ISODate(),
    helperText = new HelperText();


function Uf2Parser(){
    this.version = '0.0.1'; 
    this.rootPrefix = 'h-';
    this.propertyPrefixes = ['p-','dt-','u-','e-'];
    this.classAttrName = 'className';
} 


Uf2Parser.prototype = {

	// Returns parsed microformats
	// dom: the document object structure of the pages
    // baseURL: (optional) the URL of the orginal document to help constructed absolute URLs
    // ownerDocument: (optional)
    // --- $, rootNode, baseUrl, ownerDocument, formats
    get: function(dom, rootNode, baseURL, ownerDocument, filters) {
    	var items,
            children,
    		out = [];

        // filters as a string of item or an array    
        if(this.isString(filters) && filters !== ''){
            if(filters.indexOf(',') > -1) {
                filters = filters.split(',');
            }else{
                filters = [filters];
            }
        } else{
            filters = null
        }  

    	if(!this.isCorrectDOM(dom)){
    		// maybe throw this ?
    		return [{'error': 'The object DOM has the wrong structure. There are different DOM models for node.js and browsers.'}]
    	}
        this.initDOM(dom);


        // find starts points in the DOM
    	items = this.findRootNodes(dom, rootNode);
    	if(items){
            var i   = items.length,
                x   = 0,
                uf  = {};
            while (x < i) {
                uf = this.walkTree(dom, items[x], true)
                if(uf 
                    && this.hasProperties(uf.properties)
                    && this.shouldInclude(uf, filters)
                    ){
                        out.push(uf);
                        this.dupeAdditionalRoots(dom, uf, items[x], out);

                        children = this.findChildItems(dom, items[x], baseURL, ownerDocument)
                        if(children.length > 0){
                            uf.children = children;
                        }
                }

                x++;
            }
        }
        
    	return {"items": out};
    },


    // finds uf within the tree of a parent uf but where they have on property
    findChildItems: function(dom, rootNode, baseURL, ownerDocument){
        var items,
            out = [];
        items = this.findRootNodes(dom, rootNode);
        if(items){
            var i   = items.length,
                x   = 1, // 1 excludes parent
                uf  = {};
            while (x < i) {
                var classes = this.getUfClassNames(dom, items[x]);
                if(classes.root.length > 0 && classes.properties.length === 0){ 
                    uf = this.walkTree(dom, items[x], true)
                    if(uf && this.hasProperties(uf.properties)){
                        out.push(uf);
                        this.dupeAdditionalRoots(dom, uf, items[x], out)
                    }
                }
                x++;
            }
        }
        return out;
    },


    // is the uf type in the filter list
    shouldInclude: function(uf, filters){
       if(this.isArray(filters) && filters.length > 0){
            var i  = filters.length;
            while(i--){
                if(uf.type[0] === filters[i]){
                    return true;
                }
            }
            return false;
        }else{
            return true;
       }
    },


    // if there is more than one root class on a element dupe out the resulting uf
    dupeAdditionalRoots: function(dom, uf, node, out){
        var classes = this.getUfClassNames(dom, node);
        var i   = classes.root.length,
            x   = 1;
        if(i > 1) {
            while (x < i) {
                var item = JSON.parse(JSON.stringify(uf));
                item.type[0] = classes.root[x];
                out.push(item)
                x++;
            }
        }
    },


    // returns all the root nodes for uf2 in a document
    findRootNodes: function(dom, rootNode){
    	return this.getElementsByAttribute(dom, rootNode, this.classAttrName, this.rootPrefix);
    },


    // starts the tree walking for a single microformat
    walkTree: function(dom, node){
        var classes = this.getUfClassNames(dom, node),
            out = null;

        // add starting root
        if(classes.root.length !== 0){
            out = this.createUfObject( classes.root[0] );
            this.walkChildren(dom, node, out);
            this.impliedRules(dom, node, out);
        }

        

        return out;
    },


    // test for the need to apply the "implied rules" for name, photo and url
    impliedRules: function(dom, node, uf){
        var context = this;

        if(uf && uf.properties){
            // implied name rule
            if(!uf.properties.name){
                var value = getNameAttr(dom, node)
                if(!value){
                    var descendant = this.getSingleDescendant(dom, node, ['img','abbr']);
                    if(descendant)
                        value = getNameAttr(dom, descendant)
                }
                if(!value){
                    value = helperText.getTextContent(node);
                }
                if(value){ 
                    uf.properties.name = [this.trim(value).replace(/[\t\n\r ]+/g, ' ')];
                }
            }
            // implied photo rule
            if(!uf.properties.photo){
                var value = getPhotoAttr(dom, node)
                if(!value){
                    var descendant = this.getSingleDescendant(dom, node, ['img','object']);
                    if(descendant)
                        value = getPhotoAttr(dom, descendant)
                }
                if(value){ 
                    uf.properties.photo = [this.trim(value)];
                }
            }
            // implied url rule
            if(!uf.properties.url){
                var value = this.getAttributeValue(dom, node, ['a'], 'href');
                if(value){ 
                    uf.properties.url = [this.trim(value)];
                }
            }
        }

        function getNameAttr(dom, node){
            var value = context.getAttributeValue(dom, node, ['img'], 'alt');
            if(!value){ 
                value = context.getAttributeValue(dom, node, ['abbr'], 'title');
            }
            return value;
        }

        function getPhotoAttr(dom, node){
            var value = context.getAttributeValue(dom, node, ['img'], 'src');
            if(!value){ 
                value = context.getAttributeValue(dom, node, ['object'], 'data');
            }
            return value;
        }
    },


    // find child properties of microformat
    walkChildren: function (dom, node, out){
        var childOut = {},
            context = this;

        dom(node).children().each(function(i, child){
            // get uf classes for this single element
            var classes = context.getUfClassNames(dom, child);
            
            // if we have an property which use a microformat as it value
            if(classes.root.length > 0 && classes.properties.length > 0){ 
                // create object with type, property and value
                var rootItem = context.createUfObject( 
                    classes.root,
                    helperText.getTextContent(child) 
                );
         
                // add the microformat as an array of properties
                var propertyName = context.removePropPrefix(classes.properties[0])
                if(out.properties[propertyName]){
                  out.properties[propertyName].push(rootItem);   
                }else{
                  out.properties[propertyName] = [rootItem];  
                }

                context.walkChildren(dom, child, rootItem);
                context.impliedRules(dom, child, rootItem);
            }

           // if we have a property which does not have a microformat as it value
            if(classes.root.length === 0 && classes.properties.length > 0){
                var i   = classes.properties.length,
                    x   = 0;
                while (x < i) {
                    var value = context.getValue(dom, child, classes.properties[x])
                        propertyName = context.removePropPrefix(classes.properties[x]);

                    // add the property as a an array of properties
                    if(out.properties[propertyName]){
                        out.properties[propertyName].push(value)
                    }else{
                        out.properties[propertyName] = [value];
                    }
                    x++;
                }

                context.walkChildren(dom, child, out);
            }

            // if the node has no uf classes, see if its children have
            if(classes.root.length === 0 && classes.properties.length === 0){
                context.walkChildren(dom, child, out);
            }

        });
    
    },


    // gets the value of a property
    getValue: function(dom, node, className){
        var value = '';

        if(this.startWith(className, 'p-')){
            value = this.getPValue(dom, node)
        }

        if(this.startWith(className, 'e-')){
            value = this.getEValue(dom, node)
        }

        if(this.startWith(className, 'u-')){
            value = this.getUValue(dom, node)
        }

        if(this.startWith(className, 'dt-')){
            value = this.getDTValue(dom, node)
        }   
        return value;
    },


    // gets the value of node which contain 'p-' property
    getPValue: function(dom, node){

        var valueClass = this.getValueClass(dom, node, true, false)
        if(valueClass) {return valueClass}

        var valueTitle = this.getValueTitle(dom, node)
        if(valueTitle) {return valueTitle}          

        var title = this.getAttributeValue(dom, node, ['abbr'], 'title');
        if(title){ return title }

        var value = this.getAttributeValue(dom, node, ['data'], 'value');
        if(value){ return value }

        if(node.name === 'br' || node.name === 'hr'){
            return '';
        }

        var alt = this.getAttributeValue(dom, node, ['img', 'area'], 'alt');
        if(alt){ return alt }

        return helperText.getTextContent(node);
    },


    // get the value of node which contain 'e-' property
    getEValue: function(dom, node){
        return dom(node).html();
    },


    // get the value of node which contain 'u-' property
    getUValue: function(dom, node){

        // not sure this should be used for u property
        var valueClass = this.getValueClass(dom, node, false, false)
        if(valueClass) {return valueClass} 

        var valueTitle = this.getValueTitle(dom, node)
        if(valueTitle) {return valueTitle}      

        var href = this.getAttributeValue(dom, node, ['a', 'area'], 'href');
        if(href){ return href }

        var src = this.getAttributeValue(dom, node, ['img'], 'src');
        if(src){ return src }

        var data = this.getAttributeValue(dom, node, ['object'], 'data');
        if(data){ return data }

        var title = this.getAttributeValue(dom, node, ['abbr'], 'title');
        if(title){ return title }

        var value = this.getAttributeValue(dom, node, ['data'], 'value');
        if(value){ return value }

        // need to add code to turn relative url to absolute ones
        // **********************************************     

        return helperText.getTextContent(node);
    },


    // get the value of node which contain 'dt-' property
    getDTValue: function(dom, node){

        var valueClass = this.getValueClass(dom, node, false, true)
        if(valueClass && valueClass != '') {return  valueClass}

        var valueTitle = this.getValueTitle(dom, node)
        if(valueTitle) {return this.normalizeISO8601( valueTitle ) }

        var datetime = this.getAttributeValue(dom, node, ['time', 'ins', 'del'], 'datetime');
        if(datetime){ return this.normalizeISO8601( datetime ) }

        var title = this.getAttributeValue(dom, node, ['abbr'], 'title');
        if(title){ return this.normalizeISO8601( title ) }

        var value = this.getAttributeValue(dom, node, ['data'], 'value');
        if(value){ return this.normalizeISO8601( value ) }

        return this.normalizeISO8601( helperText.getTextContent(node) );
    },



    // returns a W3C profile ISO8601 date by adding punctuation and
    // ensuring that hours and seconds have values
    normalizeISO8601: function normalizeISO8601(str) {
        return new ISODate.ISODate(str).toString();
    },


    // get the attrbute value from a set of defined elements
    getAttributeValue: function(dom, node, tagNames, attributeName){
        var i = tagNames.length;
        while(i--){
            if(node.name === tagNames[i]){
                var attr = this.getAttribute(dom, node, attributeName)
                if(attr && attr != ''){
                    return attr
                }
            }
        }
        return null;
    },


    // gets the text of any child nodes with the class value
    getValueClass: function(dom, node, normaliseWS, isDateTime){
        var context = this,
            out = [];
        dom(node).children().each(function(i, child){
            if(context.hasClass(dom, child, 'value')){
                var value = context.getAttributeValue(dom, child, ['img', 'area'], 'alt');
                if(!value){
                    value = context.getAttributeValue(dom, child, ['time', 'ins', 'del'], 'datetime');
                }
                if(!value){
                    value = context.getAttributeValue(dom, child, ['data'], 'value');
                }
                if(!value){
                    value = context.getAttributeValue(dom, child, ['abbr'], 'title');
                }
                if(!value){
                    value = helperText.getTextContent(child);
                }
                if(value){
                    out.push( context.trim(value) )
                }
            }
        });
        if(out.length > 0){
            if(normaliseWS){
                return out.join(' ').replace(/[\t\n\r ]+/g, ' ');
            }else{
                if(isDateTime){
                    return ISODate.concatFragments(out);
                }else{
                    return out.join()
                } 
            }
        }else{
            return null;
        }
    },

/*    // concats an array of date/time parts
    // tries to make sure parts are valid and converted correctly
    joinDateParts: function(arr){
        if(arr.length > 1){
            if(ISODate.isDate(arr[0])){
                return arr[0] + 'T' + arr[1]
            }
        }
        reurn arr.join('')
    }*/

    // returns a single string of the 'title' attr from all 
    // the child nodes with the class 'value-title' 
    getValueTitle: function(dom, node){
        var out = [],
            items = this.getElementsByClassName(dom, node, 'value-title'),
            i = items.length,
            x = 0;
        while (x < i) {
            if(this.hasAttribute(dom, items[x], 'title')){
                out.push(this.getAttribute(dom, items[x], 'title'));
            }
            x++;
        }
        return out.join('');
    },


    // return a node if it is only descendant and also has a defined tag name
    getSingleDescendant: function(dom, node, tagNames){
        var count = 0,
            out = null;
        dom(node).children().each(function(i, child){
            if(child.name){
                i = tagNames.length
                while(i--){
                    if(child.name === tagNames[i]){
                        out = child;
                    }
                }
                count ++;
            }
        });
        if(count === 1 && out){
            return out;
        }else{
            return null
        }  
    },



    // returns any uf root and property assigned to a single element
    getUfClassNames: function(dom, node){
        var out = {'root': [], 'properties': []},
            classNames = this.getAttribute(dom, node, this.classAttrName);

        if(classNames){
            var items = classNames.split(' ')
            var i = items.length;
            while (i--) {
                var item = this.trim(items[i]);

                // test for root prefix
                if(this.startWith(item, this.rootPrefix)){
                    out.root.push(item)
                }

                // test for property prefix
                var z = this.propertyPrefixes.length;
                while (z--) {
                    if(this.startWith(item, this.propertyPrefixes[z])){
                        out.properties.push(item)
                    }
                }
            }
        }
        return out;
    },


    // creates a blank uf object
    createUfObject: function(names, value){
        var out = {};
        if(value){ out.value = value; }
        if(this.isArray(names)){
            out.type = names;
        }else{
            out.type = [names]
        }
        out.properties = {};
        return out;
    },


    // removes all uf prefixes from object property names
    // obj: is an property object from the output array of uf
    removeAllPrefix: function (obj){
        var out = {}
        for(var prop in obj) {
            if(obj.hasOwnProperty(prop)){
                out[this.removePropPrefix(prop)] = obj[prop]
            }
        }
        return out;
    },


    // removes uf property prefixs from a string
    removePropPrefix: function (str){
		var i = this.propertyPrefixes.length;
    	while (i--) {
		    str = str.replace(this.propertyPrefixes[i], '');
    	}
        return str;
    },

    // removes uf root prefixs from a string
    removeRootPrefix: function (str){
        return str.replace(this.rootPrefix, '');
    },
  
    // does a string start with the test
    startWith: function(str, test){
        return (str.indexOf(test) === 0)
    },

    // remove spaces at front and back of string
    trim: function (str) {
        return str.replace(/^\s+|\s+$/g, "");
    },

    // is the object a string
    isString: function(obj) {
        return typeof (obj) == 'string';
    },

    // is the object a array
    isArray: function (obj) {
        return obj && !(obj.propertyIsEnumerable('length')) 
        && typeof obj === 'object' 
        && typeof obj.length === 'number';
    },

    // simple function to find out if a object has properties. 
    hasProperties: function (obj) {
      for (var key in obj) {
        if(obj.hasOwnProperty(key)){
          return true;
        }
      }
      return false;
    },





	// make sure the passed DOM is a cheerio object
	isCorrectDOM: function(dom){
		return (dom && dom(dom) && dom(dom)['cheerio']);
	},

    // modification for this DOMs structure
    initDOM: function(dom){
        // the string for the class attribute for this DOM
        this.classAttrName = 'class';
    },


	// returns any child elements with a className - implied document order
	getElementsByClassName: function (dom, node, className) {
	    return dom('.' + className, node);
	},

    // does a node have a given class
    hasClass: function(dom, node, className){
        var classes = this.getAttribute(dom, node, this.classAttrName)
        if (classes) {
            return classes.match(
                new RegExp('(\\s|^)' + className + '(\\s|$)'));
        } else {
            return false;
        }
    },

    // returns any child elements with a className - implied tree order ie depth first and document second
    getElementsByTreeOrder: function(elt, classNames) {
        return []
    }, 

    // return an arry of elements that match an attribute/value
	getElementsByAttribute: function (dom, elt, name, value) {
		if(!value){
	    	return dom('[' + name + ']', elt);
	    }else{
            var arr = dom('[' + name + ']', elt),
                x = 0,
                i = arr.length,
                out = [];

            while(x < i){
                if(this.hasAttributeValue(dom, arr[x], name, value)){
                    out.push(arr[x])
                }
                x++
            }
            return out;
        }
	},



	// returns the string value of an attribute
	getAttribute: function(dom, elt, attributeName){
        return dom(elt).attr(attributeName);
    },


    // returns whether attribute exists
    hasAttribute: function(dom, elt, attributeName){
        return (dom(elt).attr(attributeName) != undefined) ? true :false;
    },


    // returns whether an attribute has an item that start with the given value
    hasAttributeValue: function(dom, elt, attributeName, value){
        var test = this.getAttribute(dom, elt, attributeName),
            items =[];

        if(test && test !== ''){
            test = this.trim(test)
            if(test.indexOf(' ') > -1){
                items = test.split(' ');
            }else{
                items.push(test)
            }

            var x = 0,
            i = items.length;
            while(x < i){
                if(this.startWith(this.trim(items[x]), value)){
                    return true
                }
                x++
            }
        }
        return false
    },


    getText: function(dom, elt){

    },

    isAllWhiteSpace: function ( elt ){
        return !(/[^\t\n\r ]/.test(elt.data));
    },

    hasNoText: function( elt ) {
        return ( elt.nodeType == 8) || // A comment node
            ( (elt.nodeType == 3) && this.isAllWhiteSpace(elt) ); // a text node, all ws
    },

    getEltText: function( elt ){
        if(elt.data){
            var data = elt.data;
            return this.trim( data.replace(/[\t\n\r ]+/g, " ") );
        }else{
            return '';
        }
    }

}


exports.Uf2Parser = Uf2Parser;
