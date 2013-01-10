/*!
    Uf2Parser.js
    A compact JavaScript cross browser microformats 2 parser by Glenn Jones. 
    Copyright (C) 2012 Glenn Jones. All Rights Reserved.
    Open License: https://raw.github.com/glennjones/microformat-node/master/license.txt
*/


var entities    = require("entities"),
    urlParser   = require("url"),
    HelperText  = require('../lib/helper-text.js').HelperText,
    ISODate     = require('../lib/helper-isodate.js'),
    isoDate     = new ISODate.ISODate(),
    helperText  = new HelperText();


function Uf2Parser(){
    this.version = '0.0.1'; 
    this.rootPrefix = 'h-';
    this.propertyPrefixes = ['p-','dt-','u-','e-'];
    this.classAttrName = 'className';
    this.baseURL = '';

    this.maps = {};
    this.add(require('../lib/maps/h-adr.js').hadr);
    this.add(require('../lib/maps/h-card.js').hcard);
    this.add(require('../lib/maps/h-competency.js').hcompetency);
    this.add(require('../lib/maps/h-entry.js').hentry);
    this.add(require('../lib/maps/h-event.js').hevent);
    this.add(require('../lib/maps/h-feed.js').hfeed);
    this.add(require('../lib/maps/h-geo.js').hgeo);
    this.add(require('../lib/maps/h-listing.js').hlisting);
    this.add(require('../lib/maps/h-media.js').hmedia);
    this.add(require('../lib/maps/h-news.js').hnews);
    this.add(require('../lib/maps/h-org.js').horg);
    this.add(require('../lib/maps/h-product.js').hproduct);
    this.add(require('../lib/maps/h-recipe.js').hrecipe);
    this.add(require('../lib/maps/h-resume.js').hresume);
    this.add(require('../lib/maps/h-review-aggregate.js').hreviewaggregate);
    this.add(require('../lib/maps/h-review.js').hreview);
    
} 


Uf2Parser.prototype = {


    // Add a new map object
    add: function(map) {
        if (!this.maps[map.name]) {
            this.maps[map.name] = map;
        }
    },


	// Returns parsed microformats
	// dom: the document object structure of the pages
    // baseURL: (optional) the URL of the orginal document to help constructed absolute URLs
    // --- $, rootNode, baseUrl, formats
    get: function(dom, rootNode, baseURL, filters) {
    	var items,
            children,
    		out = [];


        this.baseURL = baseURL;
        this.rootID = 0;

        // filters as a string of item or an array    
        if(this.isString(filters) && filters !== ''){
            if(filters.indexOf(',') > -1) {
                this.filters = filters.split(',');
            }else{
                this.filters = [filters];
            }
        } else{
            this.filters = null
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
                ufs  = [];
            while (x < i) {
                // find microformats - return as an array, there maybe more than one root on a element
                ufs = this.walkTree(dom, items[x], true);

                // loop the array
                var y   = ufs.length,
                    z   = 0;
                while (z < y) {
                    // make sure its a valid structure and apply filter if its requested  
                    if(ufs[z] 
                        && this.hasProperties(ufs[z].properties)
                        && this.shouldInclude(ufs[z], this.filters)
                        ){
                            // find any children in the microformats dom tree that are not attached toa property
                            children = this.findChildItems(dom, items[x], baseURL, ufs[z].type[0])
                            if(children.length > 0){
                                ufs[z].children = children;
                            }
                            out.push(ufs[z]);
                    }
                    z++
                }

                x++;
            }
        }
        
    	return {"items": out};
    },


    // finds uf within the tree of a parent uf but where they have on property
    findChildItems: function(dom, rootNode, baseURL, ufName){
        var items,
            out = [];
        items = this.findRootNodes(dom, rootNode, true);
        if(items){
            var i   = items.length,
                x   = 1, // 1 excludes parent
                ufs  = [];
            while (x < i) {
                var classes = this.getUfClassNames(dom, items[x], ufName);
                if(classes.root.length > 0 && classes.properties.length === 0){ 
                    ufs = this.walkTree(dom, items[x], true)
                    // loop the array
                    var y   = ufs.length,
                        z   = 0;
                    while (z < y) {
                        // make sure its a valid structure 
                        if(ufs[z] && this.hasProperties(ufs[z].properties)){
                            out.push(ufs[z]);
                        }
                        z++
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


/*    // if there is more than one root class on a element dupe out the resulting uf
    dupeAdditionalRoots: function(dom, uf, node, out){
        var classes = this.getUfClassNames(dom, node);
        var i   = classes.root.length,
            x   = 1;  // first one already exisits
        // only if the 1st and 2nd root names don't match    
        if(i > 1 && classes.root[0] !== classes.root[1]) {
            while (x < i) {
                var uf = JSON.parse(JSON.stringify(uf));
                uf.type[0] = classes.root[x];
                if(this.shouldInclude(uf, this.filters)){
                    out.push(uf)
                }
                x++;
            }
        }
    },*/


    // returns all the root nodes in a document
    findRootNodes: function(dom, rootNode, fromChildren){
        var arr = null;
            out = [],
            classList = [],
            fromChildren = (fromChildren)? fromChildren : false;

        // build any array of v1 root names    
        for (var key in this.maps) {
            classList.push(this.maps[key].root)
        }

        // get all elements that have a class attribute  
        if(fromChildren){
            arr = dom('[class]', rootNode.children);
        }else{
            arr = dom('[class]', rootNode);
        }
     
        // loop elements that have a class attribute     
        var x = 0,
        i = arr.length;  
        while(x < i){

            var items = [];

            test = this.trim( dom(arr[x]).attr('class') );
            if(test !== ''){
                // classes string into into an array
                if(test.indexOf(' ') > -1){
                    items = test.split(' ');
                }else{
                    items.push(test)
                }
            }

            // loop classes on an element
            var y = items.length;
            while(y--){
                // match v1 root names 
                if(classList.indexOf(items[y]) > -1){
                    out.push(arr[x])
                    break;
                    
                }
               // match v2 root name prefix
                if(this.startWith(items[y], 'h-')){
                    out.push(arr[x]);
                    break;
                }
            }

            x++
        }
        return out;
    },


    // starts the tree walking for a single microformat
    walkTree: function(dom, node){
        var classes = this.getUfClassNames(dom, node),
            out = [];

        // loop roots found on one element
        var i  = classes.root.length,
            x   = 0;
        while (x < i) {
            this.rootID++;
            var itemRootID  = this.rootID,
                obj = this.createUfObject( classes.root[x] );

            this.walkChildren(dom, node, obj, classes.root[x], itemRootID);
            this.impliedRules(dom, node, obj);        
            out.push(obj)
            x++;
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

        // implied date rule - temp fix
        // only apply to first date and time match
        if(uf.times.length > 0 && uf.dates.length > 0){
            var newDate = ISODate.dateTimeUnion(uf.dates[0][1],uf.times[0][1])
            uf.properties[this.removePropPrefix(uf.times[0][0])][0] = newDate.toString()
        }
        delete uf.times
        delete uf.dates



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
    walkChildren: function (dom, node, out, ufName, rootID){
        var childOut = {},
            context = this;

        dom(node).children().each(function(i, child){
            // get uf classes for this single element
            var classes = context.getUfClassNames(dom, child, ufName);
            
            // a property which is a microformat
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
                context.rootID++;
                // loop the root items
                var i       = rootItem.type.length,
                    x       = 0,
                    itemRootID  = context.rootID;
                while (x < i) {
                    context.walkChildren(dom, child, rootItem, rootItem.type[x], itemRootID);
                    x++;
                }
                context.impliedRules(dom, child, rootItem);
            }

           // a property which is NOT a microformat and has not been use for a given root element
            if(classes.root.length === 0 && 
                classes.properties.length > 0){

                var i   = classes.properties.length,
                    x   = 0;
                while (x < i) {
                    

                    var value = context.getValue(dom, child, classes.properties[x], out)
                        propertyName = context.removePropPrefix(classes.properties[x]);
                        
                    // if the value is not empty 
                    // and we have not added this value into a property with the same name already
                    if(value != '' && !context.hasRootID(dom, child, rootID, propertyName)){
                        // add the property as a an array of properties 
                        if(out.properties[propertyName]){
                            out.properties[propertyName].push(value)
                        }else{
                            out.properties[propertyName] = [value];
                        }
                        // add rootid to node so we track it use
                        context.appendRootID(dom, child, rootID, propertyName);
                    }
                    x++;
                }

                context.walkChildren(dom, child, out, ufName, rootID);
            }

            // if the node has no uf classes, see if its children have
            if(classes.root.length === 0 && classes.properties.length === 0){
                context.walkChildren(dom, child, out, ufName, rootID);
            }

        });
    
    },


    // gets the value of a property
    getValue: function(dom, node, className, uf){
        var value = '';

        if(this.startWith(className, 'p-')){
            value = this.getPValue(dom, node, true)
        }

        if(this.startWith(className, 'e-')){
            value = this.getEValue(dom, node)
        }

        if(this.startWith(className, 'u-')){
            value = this.getUValue(dom, node, true)
        }

        if(this.startWith(className, 'dt-')){
            value = this.getDTValue(dom, node, className, uf, true)
        }   
        return value;
    },


    // gets the value of node which contain 'p-' property
    getPValue: function(dom, node, valueParse){
        var out = ''
        if(valueParse){
            out = this.getValueClass(dom, node, 'p');
        }

        if(!out && valueParse){
            out = this.getValueTitle(dom, node);
        }
        
        if(!out){
            out = this.getAttributeValue(dom, node, ['abbr'], 'title');
        }
   
        if(!out){
            out = this.getAttributeValue(dom, node, ['data'], 'value');
        }

        if(node.name === 'br' || node.name === 'hr'){
            out = '';
        }

        if(!out){
            out = this.getAttributeValue(dom, node, ['img', 'area'], 'alt');
        }
        
        if(!out){
            out = helperText.getTextContent(node);
        }

        return (out)? out : '';
    },


    // get the value of node which contain 'e-' property
    getEValue: function(dom, node){
        return entities.decode(dom(node).html(),2)
        //return dom(node).html();
    },


    // get the value of node which contain 'u-' property
    getUValue: function(dom, node, valueParse){
        // not sure this should be used for u property
        var out = ''
        if(valueParse){
            out = this.getValueClass(dom, node, 'u');
        }

        if(!out && valueParse){
            out = this.getValueTitle(dom, node);
        }
  
        if(!out){
            out = this.getAttributeValue(dom, node, ['a', 'area'], 'href');
        }

        if(!out){
            out = this.getAttributeValue(dom, node, ['img'], 'src');
        }
      
        if(!out){
            out = this.getAttributeValue(dom, node, ['object'], 'data');
        }

        // if we have no protocal separator we need 
        // to turn relative url to absolute ones
        if(out && out !== '' && this.baseURL !== '' && out.indexOf(':') === -1){
            out = urlParser.resolve(this.baseURL, out)
        }   
      
        if(!out){
            out = this.getAttributeValue(dom, node, ['abbr'], 'title');
        }

        if(!out){
            out = this.getAttributeValue(dom, node, ['data'], 'value');
        }

        if(!out){
            out = helperText.getTextContent(node);
        }

        return (out)? out : '';
    },


    // get the value of node which contain 'dt-' property
    getDTValue: function(dom, node, className, uf, valueParse){
        var out = ''
        if(valueParse){
            out = this.getValueClass(dom, node, 'dt');
        }

        if(!out && valueParse){
            out = this.getValueTitle(dom, node);
        }

        if(!out){
            out = this.getAttributeValue(dom, node, ['time', 'ins', 'del'], 'datetime');
        }

        if(!out){
            out = this.getAttributeValue(dom, node, ['abbr'], 'title');
        }
 
        if(!out){
            out = this.getAttributeValue(dom, node, ['data'], 'value');
        }

        if(!out){
            out = helperText.getTextContent(node);
        }

        if(out){
            if(ISODate.isDuration(out)) {
                // just duration
                return out;
            }else if(ISODate.isTime(out)){
                // just time or time+timezone
                if(uf){ uf.times.push([className, ISODate.parseAmPmTime(out)]) }
                return ISODate.parseAmPmTime(out);
            }else{
                // returns a date - uf profile 
                if(uf){ uf.dates.push([className, new ISODate.ISODate(out).toString()]) }
                return new ISODate.ISODate(out).toString();
            }
        }else{
            return ''
        }
    },


    // appends a new rootid to a given node
    appendRootID: function(dom, node, id, propertyName){
        if(!node.rootids){
            node.rootids = [];
        } 
        node.rootids.push(id + '-' + propertyName);
        
/*        var rootids = dom(node).attr('data-rootids');
        if(rootids){
            dom(node).attr('data-rootids', rootids + ' id' + id)
        }else{
            dom(node).attr('data-rootids', 'id' + id)
        }*/
    },

    // does a given node already have a rootid
    hasRootID: function(dom, node, id, propertyName){
        if(!node.rootids){
            return false
        }else{
            return (node.rootids.indexOf(id + '-' + propertyName) > -1)
        }
/*        var rootids = dom(node).attr('data-rootids');
        if(rootids && rootids.indexOf('id' + id) > -1){
            return true
        }else{
            return false
        }*/
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
    getValueClass: function(dom, node, propertyType){
        var context = this,
            out = [];
        dom(node).children().each(function(i, child){
            var value = null;
            if(dom(child).hasClass('value')){
                switch(propertyType){
                    case 'p':
                      value = context.getPValue(dom, child, false);
                      break;
                    case 'u':
                      value = context.getUValue(dom, child, false);
                      break;
                    case 'dt':
                      value = context.getDTValue(dom, child, '', null, false);
                      break;
                }
                if(value){
                    out.push( context.trim(value) )
                }
            }
        });
        if(out.length > 0){
            if(propertyType === 'p'){
                return out.join(' ').replace(/[\t\n\r ]+/g, ' ');
            }
            if(propertyType === "u"){
                return out.join('')
            }
            if(propertyType === "dt"){
                return ISODate.concatFragments(out).toString();
            }
        }else{
            return null;
        }
    },


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
    getUfClassNames: function(dom, node, ufName){
        var out = {'root': [], 'properties': []},
            classNames = this.getAttribute(dom, node, this.classAttrName);

        if(classNames){
            var items = classNames.split(' ')
            var i  = items.length,
                x   = 0;
            while (x < i) {


                var item = this.trim(items[x]);

                // test for root prefix - v2
                if(this.startWith(item, this.rootPrefix)){
                    out.root.push(item)
                }

                // test for property prefix - v2
                var z = this.propertyPrefixes.length;
                while (z--) {
                    if(this.startWith(item, this.propertyPrefixes[z])){
                        out.properties.push(item)
                    }
                }

                // test for mapped root classnames v1
                //if(!ufName){
                    for (var key in this.maps) {
                        if(this.maps.hasOwnProperty(key)){
                            // only add a root once
                            if(this.maps[key].root === item && out.root.indexOf(key) === -1){
                                out.root.push(key)
                            }
                        }
                    }
                //}else {
                    // test for mapped property classnames v1
                    var map = this.getMapping(ufName);
                    if(map){
                        for (var key in map.properties) {
                            if(key === item){
                                var prop = map.properties[key],
                                    propName = (prop.map)? prop.map : 'p-' + key;
                                if(prop.uf){
                                    // loop all the classList make sure 
                                    //   1. this property is a root
                                    //   2. that there is not already a equivalent v2 property ie url and u-url on the same element
                                    var y   = 0;
                                    while (y < i) {
                                        var v2Name = this.getV2RootName(items[y])
                                        // add new root
                                        if(prop.uf.indexOf(v2Name) > -1 && out.root.indexOf(v2Name) === -1){
                                            out.root.push(v2Name)
                                        } 
                                        y++;   
                                    }
                                    //only add property once
                                    if(out.properties.indexOf(propName) === -1){
                                        out.properties.push(propName)
                                    }
                                }else{
                                    if(out.properties.indexOf(propName) === -1){
                                        out.properties.push(propName)
                                    }
                                }    
                            }
                        }
                    }
                //}

                x++;

            }
        }
        return out;
    },


    // given a V1 or V2 root name return V1 mapping object
    getMapping: function(name){
        for (var key in this.maps) {
            if(this.maps[key].root === name || key === name){
                return this.maps[key]
            }
        }
        return null;
    },


    // given a V1 root name returns a V2 root name ie vcard >>> h-card
    getV2RootName: function(name){
        for (var key in this.maps) {
            if(this.maps[key].root === name){
                return key
            }
        }
        return null;
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
        out.times = [];
        out.dates = [];
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
        var arr = dom('[' + name + ']', elt);
		if(!value){
	    	return arr
	    }else{
            var x = 0,
                i = arr.length,
                out = [];        

            // corrects issue with cheerio 
            // where the select is apply to containing object
            // if(arr[0] === elt){ x = 1 }
    
            while(x < i){
                if(this.hasAttributeValue(dom, arr[x], name, value)){
                    out.push(arr[x])
                }
                x++
            }
            return out;
        }
	},

    // returns whether an attribute has an item that start with the given value
    hasAttributeValue: function(dom, elt, attributeName, value){
        var test = this.getAttribute(dom, elt, attributeName),
            items =[];

        if(test && test !== ''){
            // trim and break into an array
            test = this.trim(test)
            if(test.indexOf(' ') > -1){
                items = test.split(' ');
            }else{
                items.push(test)
            }

            // loop and see if any item start with the value we are looking for
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


	// returns the string value of an attribute
	getAttribute: function(dom, elt, attributeName){
        return dom(elt).attr(attributeName);
    },


    // returns whether attribute exists
    hasAttribute: function(dom, elt, attributeName){
        return (dom(elt).attr(attributeName) != undefined) ? true :false;
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
