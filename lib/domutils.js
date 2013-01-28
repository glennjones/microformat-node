/*
   DOM Utilities
   Copyright (C) 2010 - 2013 Glenn Jones. All Rights Reserved.
   MIT License: https://raw.github.com/glennjones/microformat-node/master/license.txt
   
   */

var utils		= require('../lib/utilities.js').utilities,
	entities	= require('entities');


var domUtils = {


	innerHTML: function(dom, node){
		return entities.decode(dom(node).html(), 2);
	},


	// returns whether attribute exists
	hasAttribute: function(dom, node, attributeName) {
		return(dom(node).attr(attributeName) !== undefined) ? true : false;
	},
	

	// returns the string value of an attribute
	getAttribute: function(dom, node, attributeName) {
		return dom(node).attr(attributeName);
	},


	// returns the an array of string value of an attribute
	getAttributeList: function(dom, node, attributeName) {
		var out = [],
			attList;

		attList = dom(node).attr(attributeName);
		if(attList && attList !== '') {
			if(attList.indexOf(' ') > -1) {
				out = attList.split(' ');
			} else {
				out.push(attList);
			}
		}
		return out;
	},


	// returns whether an attribute has an item of the given value
	hasAttributeValue: function(dom, node, attributeName, value) {
		var attList = this.getAttributeList(dom, node, attributeName);
		return (attList.indexOf(value) > -1);
	},



	// returns whether an attribute has an item that start with the given value
	hasAttributeValueByPrefix: function(dom, node, attributeName, value) {
		var attList = [],
			x = 0,
			i;

		attList = this.getAttributeList(dom, node, attributeName);
		i = attList.length;
		while(x < i) {
			if(utils.startWith(utils.trim(attList[x]), value)) {
				return true;
			}
			x++;
		}
		return false;
	},


	// return an array of elements that match an attribute/value
	getNodesByAttribute: function(dom, node, name) {
		var selector = '[' + name + ']';
		return dom(selector, node);
	},


	// return an arry of elements that match an attribute/value
	getNodesByAttributeValue: function(dom, rootNode, name, value) {
		var arr = [],
			x = 0,
			i,
			out = [];

		arr = this.getNodesByAttribute(dom, rootNode, name);
		if(arr) {
			i = arr.length;
			while(x < i) {
				if(this.hasAttributeValue(dom, arr[x], name, value)) {
					out.push(arr[x]);
				}
				x++;
			}
		}
		return out;
	},


	// set the attribute value
	setAttribute: function(dom, node, name, value){
		dom(node).attr( name, value );
	},


	// returns the attribute value only if the node tagName is in the tagNames list
	getAttrValFromTagList: function(dom, node, tagNames, attributeName) {
		var i = tagNames.length;

		while(i--) {
			if(node.name === tagNames[i]) {
				var attr = domUtils.getAttribute(dom, node, attributeName);
				if(attr && attr !== '') {
					return attr;
				}
			}
		}
		return null;
	},


	// return a node if it is the only descendant and its is also in the tagNames list
	isSingleDescendant: function(dom, rootNode, tagNames) {
		var count = 0,
			out = null;

		dom(rootNode).children().each(function(i, child) {
			if(child.name) {
				i = tagNames.length;
				while(i--) {
					if(child.name === tagNames[i]) {
						out = child;
					}
				}
				count++;
			}
		});
		if(count === 1 && out) {
			return out;
		} else {
			return null;
		}
	},


	// append a child node
	appendChild: function(dom, node, childNode){
		dom(node).append(childNode);
	},



	// simple dom node cloning function 
	clone: function(dom, node) {
		var newNode = dom(node).clone();
		newNode.removeAttr('id');
		return newNode;
	}


};   

exports.domUtils = domUtils;