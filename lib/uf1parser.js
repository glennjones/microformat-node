/*!
    UfParser.js
    A compact JavaScript cross browser microformats parser by Glenn Jones. Based
    on the Mozilla Labs Operator microformats parser created by Michael Kaply
    Copyright (C) 2010 - 2012 Glenn Jones. All Rights Reserved.
    Open License: https://raw.github.com/glennjones/microformat-node/master/license.txt
*/

var ISODate = require('../lib/helper-isodate.js').ISODate,
    urlParser = require('url');


function Uf1Parser(){
    this.version = '0.3.0'; // 0.3 was the move to cheerio
} 


Uf1Parser.prototype = {

    // Returns parsed microformats
    // name: A string of the microformat to look for
    // element: A HTML DOM element which contains the microformat
    get: function($, element, baseURL, ownerDocument, name) {
        var data = [];
        var nodes = [];
        var uf = this[name];

        this.$ = $;
        this.baseURL = baseURL;
        this.ownerDocument = ownerDocument;

        if (!uf || !element) {
            data.push({
                'type': ['error'],
                'properties': {
                    'message': 'Sorry either the format or element was not found. ' + name
                }
            });
            return data;
        }

        if (uf.className) {
            var re = new RegExp(uf.className, "gi");
            if (re.test(this.getAttribute(element, 'className'))) {
                nodes = new Array(element);
            } else {
                nodes = this.getElementsByClassName(element, uf.className);
            }
            if ((nodes.length === 0) && uf.alternateClassName) {
                var altClass = this.getElementsByClassName(element, uf.alternateClassName);
                if (altClass.length > 0) {
                    nodes.push(element);
                }
            }
        } else if (uf.attributeValues) {
            nodes = this.getElementsByAttribute(element, uf.attributeName, uf.attributeValues);
        }

        for (var x = 0; x < nodes.length; x++) {
            var props = this.removeAllSuffixs(this.getMicroformat(nodes[x], name))
            var version =  this.getUFVersion(name);
            if(this[name].altName){
                data.push({'type': [this[name].altName], 'properties': props});
            }else{
                data.push({'type': [name], 'properties': props});
            }
        }


        if (name == 'XFN')
            data = this.compressXFN(data);


        return {"items": data};
    },

    // Add a new defination object
    add: function(name, object) {
        if (!this[name]) {
            this[name] = object;
        }
    },


    pack: function (data, error, version) {
        // UfJSON - Add reporting
        // var pack = { 'microformats': data };
        // pack['parser-information'] = {};
        // pack['parser-information'].name = 'Microformat Shiv';
        // pack['parser-information'].version = version;
        // if (!error && error !== '') {
        //     pack.errors = [error];
        // }
        ///return pack;
        return {'x':'y'}
    },

    removeAllSuffixs: function (obj){
        var out = {}
        for(var prop in obj) {
            if(obj.hasOwnProperty(prop)){
                out[this.removeSuffix(prop)] = obj[prop]
            }
        }
        return out;
    },

    removeSuffix: function (str){
        return str.replace('p-','').replace('u-','').replace('dt-','');
    },


    getUFVersion: function (name){
        return (this[name].ufVersion) ? this[name].ufVersion : null;
    },


    getMicroformat: function (node, microformat) {
        var data = {};
        for (var i in this[microformat].properties) {
            var item = this.getMicroformatProperty(node, microformat, i);
            if (item != undefined)
                data[i] = item;
        }
        // Add microformats 2 implied properties postprocessing
        if(this[microformat].postProcess)
            this[microformat].postProcess(this, node, data);
        
        return data;
    },


    // in_mfnode: The node containing the microformat
    // mfname: The name a microformat definition
    // propname: The names of the current property definition
    getMicroformatProperty: function (in_mfnode, mfname, propname) {

        var mfnode = in_mfnode;

        // If the node has not been preprocessed, the requested microformat
        // is a class based microformat and the passed in node is not the
        // entire document, preprocess it. Preprocessing the node involves
        // creating a duplicate of the node and taking care of things like
        // the include and header design patterns
        if (!in_mfnode.hasBeenPreProcess && this[mfname].className) {
            mfnode = this.preProcessMicroformat(in_mfnode);
        }

        // propobj is the corresponding property object in the microformat
        var propobj;

        // If there is a corresponding property in the microformat, use it
        if (this[mfname].properties[propname]) {
            propobj = this[mfname].properties[propname];
        } else {
            // If we didn't get a property, bail
            return undefined;
        }

        // Query the correct set of nodes (rel or class) based on the setting
        // in the property
        var propnodes;
        if (propobj.rel === true) {
            propnodes = this.getElementsByAttribute(mfnode, "rel", propname);
        } else {
            propnodes = this.getElementsByClassName(mfnode, propname);
        }


        // Remove embeded agent hCards that should not be a child of this object
        if (mfname == 'hCard') {
            var items = [];
            for (var i = 0; i < propnodes.length; i++) {
                var found = this.findParentByClass(propnodes[i], 'vcard');
                // Found == null means it was added through an include process
                if (mfnode == found) {
                    items.push(propnodes[i]);
                }
            }
            propnodes = items;
        }


        if (propnodes.length > 0) {
            var resultArray = [];
            for (var y = 0; y < propnodes.length; y++) {
                var subresult = this.getPropertyInternal(propnodes[y], mfnode, propobj, propname, mfnode);
                if (subresult != undefined) {
                    resultArray.push(subresult);
                    // If we're not a plural property, don't bother getting more
                    /*if (!propobj.plural) {
                        return resultArray[0];
                    }*/
                }
            }
            if (resultArray.length > 0) {
                return resultArray;
            }
        } else {
            // If we didn't find any class nodes, check to see if this property
            // is virtual and if so, call getPropertyInternal again
            if (propobj.virtual) {
                return this.getPropertyInternal(mfnode, null,
                                                     propobj, propname, mfnode);
            }
        }
        return undefined;
    },


    getPropertyInternal: function (propnode, parentnode, propobj, propname, mfnode) {
        var result;
        if (propobj.subproperties) {
            for (var subpropname in propobj.subproperties) {
                var subpropnodes;
                var subpropobj = propobj.subproperties[subpropname];
                if (subpropobj.rel === true) {
                    subpropnodes = this.getElementsByAttribute(propnode, "rel", subpropname);
                } else {
                    subpropnodes = this.getElementsByClassName(propnode, subpropname);
                }
                var resultArray = [];
                var subresult;
                for (var i = 0; i < subpropnodes.length; i++) {
                    subresult = this.getPropertyInternal(subpropnodes[i], propnode,
                                                            subpropobj,
                                                            subpropname, mfnode);
                    if (subresult != undefined) {
                        resultArray.push(subresult);
                        // If we're not a plural property, don't bother getting more
                        /*if (!subpropobj.plural) {
                            break;
                        }*/
                    }
                }
                if (resultArray.length === 0) {
                    subresult = this.getPropertyInternal(propnode, null, subpropobj, subpropname, mfnode);
                    if (subresult != undefined) {
                        resultArray.push(subresult);
                    }
                }
                if (resultArray.length > 0) {
                    result = result || {};
                    /*if (subpropobj.plural) {*/
                        result[subpropname] = resultArray;
                  /*  } else {
                        result[subpropname] = resultArray[0];
                    }*/
                }
            }
        }
        if (!parentnode || ((result == undefined) && propobj.subproperties)) {
            if (propobj.virtual) {
                if (propobj.virtualGetter) {
                    // Passes this context because Firefox issue
                    result = propobj.virtualGetter(this, mfnode || propnode, propnode);
                } else {
                    result = this.datatypeHelper(propobj, propnode);
                }
            }
        } else if (result == undefined) {
            result = this.datatypeHelper(propobj, propnode, parentnode);
            if ((result == undefined) && !propobj.subproperties) {
                if (propobj.virtual && propobj.virtualGetter) {
                    result = propobj.virtualGetter(this, parentnode, propnode);
                }
            }
        }
        return result;
    },


    /**
    Internal parser API used to resolve includes and headers. Includes are
    resolved by simply cloning the node and replacing it in a clone of the
    original DOM node. Headers are resolved by creating a span and then copying
    the innerHTML and the class name.

    @param  in_mfnode The node to preProcess.
    @return If the node had includes or headers, a cloned node otherwise
    the original node. You can check to see if the node was cloned
    by looking for .origNode in the new node.
    */
    preProcessMicroformat: function (in_mfnode) {
        
        var mfnode;
        in_mfnode.hasBeenPreProcess = true;
       
        if ((in_mfnode.name == "td") && (this.getAttribute(in_mfnode,"headers"))) {
            if(!in_mfnode.hasInclude){
                var headers = this.getAttribute(in_mfnode,"headers").split(" ");
                for (var i = 0; i < headers.length; i++) {
                    var item = this.getElementById(this.ownerDocument, headers[i]);
                    if (item) {
                        var className = this.getAttribute(item, 'className');
                        this.appendChild(in_mfnode, '<span class="' + className + '">'
                            + item.html() + '</span>');
                    }
                }
            }
            in_mfnode.hasInclude = 'header';
        } else {
            mfnode = in_mfnode;
        } 


        var includes = this.getElementsByClassName(mfnode, "include");
        if (includes.length > 0) {
            includes = this.getElementsByClassName(mfnode, "include");
            var includeId;
            for (var y = includes.length - 1; y >= 0; y--) {
                if (includes[y].name == "a") {
                    includeId = this.getAttribute(includes[y],"href").substr(1);
                }
                if (includes[y].name == "object") {
                    includeId = this.getAttribute(includes[y], "data").substr(1);
                }
                if(includes[y].parent.hasInclude !== includeId){
                    if (this.getElementById(this.ownerDocument, includeId)) {
                        var item = this.getElementById(this.ownerDocument,includeId)
                        var itemHtml = this.$(item).html();
                        this.appendChild(includes[y].parent,itemHtml);
                        includes[y].parent.hasInclude = includeId;
                    }
                }
                var a = includes[y].parent;
            }
        }   

        return mfnode;
    },


    defaultGetter: function (propnode, parentnode, datatype) {
        function collapseWhitespace(instring) {
            instring = instring.replace(/[\t\n\r ]+/g, " ");
            if (instring.charAt(0) == " ")
                instring = instring.substring(1, instring.length);
            if (instring.charAt(instring.length - 1) == " ")
                instring = instring.substring(0, instring.length - 1);
            return instring;
        }

        if ((propnode.name == "abbr") && (this.getAttribute(propnode, "title"))) {
            return this.getAttribute(propnode, "title");
        } else if ((propnode.name == "time") && (this.getAttribute(propnode, "datetime"))) {
            return this.getAttribute(propnode, "datetime");
        } else if ((propnode.name == "img") && (this.getAttribute(propnode, "alt"))) {
            return this.getAttribute(propnode, "alt");
        } else if ((propnode.name == "area") && (this.getAttribute(propnode, "alt"))) {
            return this.getAttribute(propnode, "alt");
        } else if ((propnode.name == "textarea") ||
             (propnode.name == "select") ||
             (propnode.name == "input")) {
            return propnode.value;
        } else {
            var valueTitles = this.getElementsByClassName(propnode, "value-title");
            for (var i = valueTitles.length - 1; i >= 0; i--) {
                if (valueTitles[i].parentNode != propnode) {
                    //valueTitles.splice(i, 1);
                    valueTitles = this.splice(valueTitles, i, 1);
                }
            }
            if (valueTitles.length > 0) {
                var valueTitle = "";
                for (var j = 0; j < valueTitles.length; j++) {
                    valueTitle += this.getAttribute(valueTitles[j],"title");
                }
                return collapseWhitespace(valueTitle);
            }
            var values = this.getElementsByClassName(propnode, "value");
            if(values){
                //Verify that values are children of the propnode
                for (var x = values.length - 1; x >= 0; x--) {
                    if (values[x].parentNode != propnode) {
                        //values.splice(x, 1);
                        values = this.splice(values, x, 1);
                    }
                }
            }
            if (values.length > 0) {
                var value = "";
                for (var z = 0; z < values.length; z++) {
                    value += this.defaultGetter(values[z], propnode, datatype);
                }
                return collapseWhitespace(value);
            }
            var s;
            if (datatype === "HTML" && propnode.html) {
                s = propnode.html();
            } else {
                s = this.getTextContent(propnode);
            }
            // If we are processing a value node, don't remove whitespace now
            // (we'll do it later)
            if (!this.matchClass(propnode, "value")) {
                if(s)
                    s = collapseWhitespace(s);
            }
            if (s && s.length > 0) {
                return s;
            }
        }
        return undefined;
    },


    dateTimeGetter: function (propnode, parentnode, raw) {
        function parseTime(time) {
            if (time.match("am") || time.match("a.m.")) {
                time = time.replace("am", "");
                time = time.replace("a.m.", "");
                var times = time.split(":");
                if (times[0] == "12") {
                    times[0] = "00";
                }
                if (times[0].length == 1) {
                    times[0] = "0" + times[0];
                }
                if (times.length > 1) {
                    time = times.join(":");
                } else {
                    time = times[0] + ":00:00";
                }
                if (times.length == 2) {
                    time += ":00";
                }
            }
            if (time.match("pm") || time.match("p.m.")) {
                time = time.replace("pm", "");
                time = time.replace("p.m.", "");
                times = time.split(":");
                if (times[0] < 12) {
                    times[0] = parseInt(times[0], 10) + 12;
                }
                if (times[0].length == 1) {
                    times[0] = "0" + times[0];
                }
                if (times.length > 1) {
                    time = times.join(":");
                } else {
                    time = times[0] + ":00:00";
                }
                if (times.length == 2) {
                    time += ":00";
                }
            }
            return time;
        }


        var valueTitles = this.getElementsByClassName(propnode, "value-title");
        if (valueTitles.length > 0) {
            var time = "";
            var date = "";
            var value = "";
            var offset = "";
            for (var i = 0; i < valueTitles.length; i++) {
                value = this.getAttribute(valueTitles[i], "title");
                if (value.match("T")) {
                    return this.normalizeISO8601(value);
                }
                if (value.charAt(4) == "-") {
                    date = value;
                } else if ((value.charAt(0) == "-") || (value.charAt(0) == "+") || (value == "Z")) {
                    if (value.length == 2) {
                        offset = value[0] + "0" + value[1];
                    } else {
                        offset = value;
                    }
                } else {
                    time = value;
                }
            }
            time = parseTime(time);
            if (raw) {
                return date + (time ? "T" : "") + time + offset;
            } else if (date) {
                return this.normalizeISO8601(date + (time ? "T" : "") + time + offset);
            } else {
                return undefined;
            }
        }


        var values = this.getElementsByClassName(propnode, "value");
        // Verify that values are children of the propnode
        // Remove any that aren't
        for (var z = values.length - 1; z >= 0; z--) {
            if (values[z].parentNode != propnode) {
                //values.splice(z, 1);
                values = this.splice(values, z, 1);
            }
        }
        if (values.length > 0) {
            var time = "";
            var date = "";
            var value = "";
            var offset = "";
            for (var y = 0; y < values.length; y++) {
                value = this.defaultGetter(values[y], propnode);
                if (value.match("T")) {
                    return this.normalizeISO8601(value);
                }
                if (value.charAt(4) == "-") {
                    date = value;
                } else if ((value.charAt(0) == "-") || (value.charAt(0) == "+") || (value == "Z")) {
                    if (value.length == 2) {
                        offset = value[0] + "0" + value[1];
                    } else {
                        offset = value;
                    }
                } else {
                    time = value;
                }
            }
            time = parseTime(time);
            if (raw) {
                return date + (time ? "T" : "") + time + offset;
            } else if (date) {
                return this.normalizeISO8601(date + (time ? "T" : "") + time + offset);
            } else {
                return undefined;
            }
        } else {
            var date;
            var testDate;
            if (this.hasAttribute(propnode, "title")) {
                date = this.getAttribute(propnode, "title");
                testDate = this.normalizeISO8601(date);
            }
            if (!testDate) {
                date = this.textGetter(propnode, parentnode);
            }
            if (date) {
                if (raw) {
                    /* It's just a time */
                    return parseTime(date);
                } else {
                    return this.normalizeISO8601(date);
                }
            }
        }
        return undefined;
    },


    uriGetter: function (propnode, parentnode) {
        var pairs = { "a": "href", "img": "src", "object": "data", "area": "href" };
        var name = propnode.name;
        if (pairs.hasOwnProperty(name)) {
            // node[href] returns the wrong value
            var href = this.getAttribute(propnode, pairs[name]);
            return this.getAbsoluteUrl(this.baseURL, href);
        }
        return this.textGetter(propnode, parentnode);
    },


    telGetter: function (propnode, parentnode) {

        if(!parentnode && propnode.parent)
            parentnode = propnode.parent;

        var pairs = { "a": "href", "object": "data", "area": "href" };
        var name = propnode.name;
        if (pairs.hasOwnProperty(name)) {
            var protocol;
            var attrValue = this.$(propnode).attr(pairs[name]);
            if (attrValue && attrValue.indexOf("tel:") === 0) {
                protocol = "tel:";
            }
            if (attrValue && attrValue.indexOf("fax:") === 0) {
                protocol = "fax:";
            }
            if (attrValue && attrValue.indexOf("modem:") === 0) {
                protocol = "modem:";
            }
            if (protocol) {
                if (attrValue.indexOf('?') > 0) {
                    return unescape(attrValue.substring(protocol.length, attrValue.indexOf('?')));
                } else {
                    return unescape(attrValue.substring(protocol.length));
                }
            }
        }
        // Special case - if this node is a value, use the parent node to get all the values
        if (this.matchClass(propnode, "value")) {
            return this.textGetter(propnode, parentnode);
        } else {
            // Virtual case
            if (!parentnode && (this.getElementsByClassName(propnode, "type").length > 0)) {
                var tempNode = propnode.clone();
                var typeNodes = this.getElementsByClassName(tempNode, "type");
                for (var i = 0; i < typeNodes.length; i++) {
                    this.removeChild(typeNodes[i].parent(),typeNodes[i]);
                }
                return this.textGetter(tempNode);
            }
            return this.textGetter(propnode, parentnode);
        }
    },


    emailGetter: function (propnode, parentnode) {
        if ((propnode.name == "a") || (propnode.name == "area")) {
            var mailto = this.getAttribute(propnode, 'href');
            if (mailto.indexOf('?') > 0) {
                return unescape(mailto.substring("mailto:".length, mailto.indexOf('?')));
            } else {
                return unescape(mailto.substring("mailto:".length));
            }
        } else {
            // Special case - if this node is a value, use the parent node to get all the values
            // If this case gets executed, per the value design pattern, the result
            // will be the EXACT email address with no extra parsing required
            if (this.matchClass(propnode, "value")) {
                return this.textGetter(propnode, parentnode);
            } else {
                // Virtual case
                if (!parentnode && (this.getElementsByClassName(propnode, "type").length > 0)) {
                    var tempNode = propnode.clone();
                    var typeNodes = this.getElementsByClassName(tempNode, "type");
                    for (var i = 0; i < typeNodes.length; i++) {
                        this.removeChild(typeNodes[i].parent(), typeNodes[i]);
                    }
                    return this.textGetter(tempNode);
                }
                return this.textGetter(propnode, parentnode);
            }
        }
    },


    textGetter: function (propnode, parentnode) {
        return this.defaultGetter(propnode, parentnode, "text");
    },


    htmlGetter: function (propnode, parentnode) {
        return this.defaultGetter(propnode, parentnode, "HTML");
    },


    // This function normalizes an ISO8601 date by adding punctuation and
    // ensuring that hours and seconds have values
    // Swap to ISODate version to resolve parse issues
    normalizeISO8601: function normalizeISO8601(string) {
        return isodate = new ISODate(string).toString();
    },


    datatypeHelper: function (prop, node, parentnode) {
        var result;
        var datatype = prop.datatype;
        switch (datatype) {
            case "dateTime":
                result = this.dateTimeGetter(node, parentnode);
                break;
            case "anyURI":
                result = this.uriGetter(node, parentnode);
                break;
            case "email":
                result = this.emailGetter(node, parentnode);
                break;
            case "tel":
                result = this.telGetter(node, parentnode);
                break;
            case "HTML":
                result = this.htmlGetter(node, parentnode);
                break;
            case "float":
                var asText = this.textGetter(node, parentnode);
                if (!isNaN(asText)) {
                    result = parseFloat(asText);
                }
                break;
            case "custom":
                result = prop.customGetter(this, node, parentnode);
                break;
            case "microformat":
                try {
                    result = {}
                    result.value = []
                    result.type = ['h-' + prop.microformat]
                    result.properties = [this.getMicroformat(node, prop.microformat)];
                } catch (ex) {
                    /* There are two reasons we get here, one because the node is not
                    a microformat and two because the node is a microformat and
                    creation failed. If the node is not a microformat, we just fall
                    through and use the default getter since there are some cases
                    (location in hCalendar) where a property can be either a microformat
                    or a string. If creation failed, we break and simply don't add the
                    microformat property to the parent microformat */
                    if (ex != "Node is not a microformat (" + prop.microformat + ")") {
                        break;
                    }
                }
                if (result !== undefined && this.hasProperties(result)) {
                    break;
                }
            default:
                result = this.textGetter(node, parentnode);
                break;
        }
        // This handles the case where one property implies another property
        // For instance, org by itself is actually org.organization-name
        if (prop.values && (result != undefined)) {
            var validType = false;
            for (var value in prop.values) {
                if (result.toLowerCase() == prop.values[value]) {
                    result = result.toLowerCase();
                    validType = true;
                    break;
                }
            }
            if (!validType) {
                return undefined;
            }
        }
        return result;
    },



    getAttribute: function(element, attributeName){
        return this.$(element).attr(attributeName);
    },


    hasAttribute: function(element, attributeName){
        return (this.$(element).attr(attributeName) != undefined) ? true :false;
    },


    getElementById: function (rootNode, id) {
        return this.$(rootNode).find('#' + id);
    },


    getElementsByClassName: function (rootNode, className) {
        return this.$(rootNode).find('.' + className);
    },


    getElementsByAttribute: function (rootNode, attributeName, attributeValues) {
        var attributeList = attributeValues.split(" "),
            selector = '';

        for (var i = 0; i < attributeList.length; i++) {
            selector += '[' + attributeName + '*= "' + attributeList[i] + '"], ';
        }
        return  this.$(rootNode).find(selector.substring(0, selector.length - 2));
    },


    //Returns first ancestor of required class or a null
    findParentByClass: function (node, className) {

        if (arguments.length == 2) {
            if (node.name != "html" && node.parent){
                return this.findParentByClass(node.parent, className, 1);
            }else{
                return null;
            }
        }

        if (node !== null && node !== undefined) {
            if(this.$(node).hasClass(className)){
                return node;
            } else {
                if (node.name != "html" && node.parent){
                    return this.findParentByClass(node.parent, className, 1);
                }else{
                    return null;
                }
            }
        }
        

        
    },


    // Returns the descendant count by class name
    childernCountByClass: function (node, className) {
        var nodes = this.getElementsByClassName(node, className);
        if (nodes.length)
            return nodes.length;
        else
            return 0;
    },


    // Extended to find text nodes with downstream tree
    getTextContent: function (element) {
        var out = '';
        if(element.type){
            if(element.type === 'text'){
                if(element.data !== undefined)
                    out = element.data;
            }
            if(element.children && element.children.length > 0){
                for (var j = 0; j < element.children.length; j++) {
                    out += this.getTextContent(element.children[j]);
                }
            }
        }
        return (out === '')? undefined : out;
    },


    appendChild: function(parentNode, childNode){
        this.$(parentNode).append(childNode);
    },


    removeChild: function(parentNode, childNode){
        childNode.addClass('ufparser-remove-item')
        this.$(parentNode).remove('.ufparser-remove-item');
    },


    // Is a given class name assigned in the node class property
    matchClass: function (node, className) {
        return this.$(node).hasClass(className);
    },


    // Simple function to find out if a object has properties
    hasProperties: function (obj) {
        for (var i in obj) {
            return true;
        }
        return false;
    },


    trim:  function(str) {
        return str.replace(/^\s+|\s+$/g, "");
    },


    // Compress object structure down to ufJSON standard
    compressXFN: function (returnArray) {
        var newArray = [];
        for (var j = 0; j < returnArray.length; j++) {
            var obj = returnArray[j];
            var newObj = {};
            newObj.rel = '';
            for (var i in obj) {
                if (obj[i]) {
                    var name = String(i);
                    if (name != 'text' && name != 'link') {
                        newObj.rel += name + ' ';
                    } else {
                        newObj[i] = obj[i];
                    }
                }
            }
            if (newObj.rel !== '')
                newObj.rel = newObj.rel.substring(0, newObj.rel.length - 1);

            newArray.push(newObj);
        }
        return newArray;
    },

    getAbsoluteUrl: function(base, href){
        if(href === undefined) {return undefined};
        if(href.indexOf('http') === 0){
            return href;
        }else{
            return urlParser.resolve(base, href);
        }
    },

    // part replacement for splice as nodelist in jsdom does not support splice
    splice: function(array, index, num){
        var out = [];
        var i = array.length;
        var x = 0;
        while (x < i) {
            if(x < index || x > (index+num))
                out.push(array[x]);
            x++;
        }
        return out;
    },


    // is an object a string
    isString: function (obj) {
        return typeof (obj) == 'string';
    }
}


exports.Uf1Parser = Uf1Parser;


