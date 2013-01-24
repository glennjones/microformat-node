/*!
	Parser.js
	Copyright (C) 2012 Glenn Jones. All Rights Reserved.
	Open License: https://raw.github.com/glennjones/microformat-node/master/license.txt

	*/

var request 	= require('request'),
  	cheerio 	= require('cheerio'),
	urlParser	= require('url'),
	httpCodes	= require('../lib/httpstatus.json'),
	utils		= require('../lib/utilities.js').utilities,
	domUtils	= require('../lib/domutils.js').domUtils,
	InnerText	= require('../lib/innertext.js').InnerText,
	ISODate		= require('../lib/isodate.js').ISODate,
	dates		= require('../lib/dates.js').dates;



function Parser() {
	this.version = '0.0.1';
	this.rootPrefix = 'h-';
	this.propertyPrefixes = ['p-', 'dt-', 'u-', 'e-'];

	// add maps for the v1 schema's
	this.maps = {};
	this.add(require('../lib/maps/h-adr.js').hadr);
	this.add(require('../lib/maps/h-card.js').hcard);
	this.add(require('../lib/maps/h-entry.js').hentry);
	this.add(require('../lib/maps/h-event.js').hevent);
	this.add(require('../lib/maps/h-geo.js').hgeo);
	this.add(require('../lib/maps/h-listing.js').hlisting);
	this.add(require('../lib/maps/h-news.js').hnews);
	this.add(require('../lib/maps/h-product.js').hproduct);
	this.add(require('../lib/maps/h-recipe.js').hrecipe);
	this.add(require('../lib/maps/h-resume.js').hresume);
	this.add(require('../lib/maps/h-review-aggregate.js').hreviewaggregate);
	this.add(require('../lib/maps/h-review.js').hreview);
	this.add(require('../lib/maps/h-item.js').hitem);

	// add rel maps
	this.rels = require('../lib/maps/rel.js').rel;

	this.options = {
		baseURL: '',
		filters: [],
		useIncludes: true,
		parseVerion1: true,
		addChildren: true,
		addRel: true,
		textFormat: 'normalised' // normalised or whitespace
	};
}


Parser.prototype = {


	// Add a new map object
	add: function(map) {
		if(!this.maps[map.name]) {
			this.maps[map.name] = map;
		}
	},


	// Returns parsed microformats
	// dom: the document object structure of the pages
	// baseURL: (optional) the URL of the orginal document to help constructed absolute URLs
	// --- $, rootNode, baseUrl, formats
	get: function(dom, rootNode, baseURL, filters, options) {
		var items, children, out = [];

		this.mergeOptions(options);
		this.options.baseURL = baseURL;
		this.rootID = 0;

		if(this.options.useIncludes) {
			this.findIncludes(dom, rootNode);
		}


		// filters as a string of item or an array    
		if(utils.isString(filters) && filters !== '') {
			if(filters.indexOf(',') > -1) {
				this.filters = filters.split(',');
			} else {
				this.filters = [filters];
			}
		} else {
			this.filters = null;
		}


		// find starts points in the DOM
		items = this.findRootNodes(dom, rootNode);
		if(items) {
			var i = items.length,
				x = 0,
				ufs = [];
			while(x < i) {
				if(!domUtils.hasAttribute(dom, items[x], 'data-include')) {
					// find microformats - return as an array, there maybe more than one root on a element
					ufs = this.walkTree(dom, items[x], true);

					// loop the array
					var y = ufs.length,
						z = 0;
					while(z < y) {
						// make sure its a valid structure and apply filter if its requested  
						if(ufs[z] && utils.hasProperties(ufs[z].properties) && this.shouldInclude(ufs[z], this.filters)) {
							// find any children in the microformats dom tree that are not attached toa property
							children = this.findChildItems(dom, items[x], baseURL, ufs[z].type[0]);
							if(children.length > 0) {
								ufs[z].children = children;
							}
							out.push(ufs[z]);
						}
						z++;
					}
				}
				x++;
			}
		}

		// find any rel
		var rels = this.findRels(dom, rootNode);
		if(rels && this.shouldInclude(rels, this.filters)) {
			out.push(rels);
		}

		return {
			'items': out
		};
	},


	// finds uf within the tree of a parent uf but where they have on property
	findChildItems: function(dom, rootNode, baseURL, ufName) {
		var items, out = [];
		items = this.findRootNodes(dom, rootNode, true);
		if(items) {
			var i = items.length,
				x = 1,
				// 1 excludes parent
				ufs = [];
			while(x < i) {
				var classes = this.getUfClassNames(dom, items[x], ufName);
				if(classes.root.length > 0 && classes.properties.length === 0) {
					ufs = this.walkTree(dom, items[x], true);
					// loop the array
					var y = ufs.length,
						z = 0;
					while(z < y) {
						// make sure its a valid structure 
						if(ufs[z] && utils.hasProperties(ufs[z].properties)) {
							out.push(ufs[z]);
						}
						z++;
					}
				}
				x++;
			}
		}

		// find any rel add them as child even if the node a property
		var rels = this.findRels(dom, rootNode);
		if(rels) {
			out.push(rels);
		}

		return out;
	},


	// is the uf type in the filter list
	shouldInclude: function(uf, filters) {
		if(utils.isArray(filters) && filters.length > 0) {
			var i = filters.length;
			while(i--) {
				if(uf.type[0] === filters[i]) {
					return true;
				}
			}
			return false;
		} else {
			return true;
		}
	},



	// returns all the root nodes in a document
	findRootNodes: function(dom, rootNode, fromChildren) {
		var arr = null,			
			out = [], 
			classList = [],
			test,
			items,
			x = 0,
			i,
			y,
			key;


		// build any array of v1 root names    
		for(key in this.maps) {
			classList.push(this.maps[key].root);
		}

		// get all elements that have a class attribute  
		fromChildren = (fromChildren) ? fromChildren : false;
		if(fromChildren) {
			arr = domUtils.getNodesByAttribute(dom, rootNode.children, 'class')
		} else {
			arr = domUtils.getNodesByAttribute(dom, rootNode, 'class')
		}


		// loop elements that have a class attribute     
		i = arr.length;
		while(x < i) {

			items = domUtils.getAttributeList(dom, arr[x], 'class');

			// loop classes on an element
			y = items.length;
			while(y--) {
				// match v1 root names 
				if(classList.indexOf(items[y]) > -1) {
					out.push(arr[x]);
					break;

				}
				// match v2 root name prefix
				if(utils.startWith(items[y], 'h-')) {
					out.push(arr[x]);
					break;
				}
			}

			x++;
		}
		return out;
	},


	// starts the tree walking for a single microformat
	walkTree: function(dom, node) {
		var classes = this.getUfClassNames(dom, node),
			out = [];

		// loop roots found on one element
		var i = classes.root.length,
			x = 0;
		while(x < i) {
			this.rootID++;
			var itemRootID = this.rootID,
				obj = this.createUfObject(classes.root[x]);

			this.walkChildren(dom, node, obj, classes.root[x], itemRootID);
			this.impliedRules(dom, node, obj);
			out.push(obj);
			x++;
		}

		return out;
	},


	// test for the need to apply the "implied rules" for name, photo and url
	impliedRules: function(dom, node, uf) {
		var context = this,
			value = '',
			descendant = null;


		function getNameAttr(dom, node) {
			var value = domUtils.getAttrValFromTagList(dom, node, ['img'], 'alt');
			if(!value) {
				value = domUtils.getAttrValFromTagList(dom, node, ['abbr'], 'title');
			}
			return value;
		}

		function getPhotoAttr(dom, node) {
			var value = domUtils.getAttrValFromTagList(dom, node, ['img'], 'src');
			if(!value) {
				value = domUtils.getAttrValFromTagList(dom, node, ['object'], 'data');
			}
			return value;
		}


		if(uf && uf.properties) {
			// implied name rule
			if(!uf.properties.name) {
				value = getNameAttr(dom, node);
				if(!value) {
					descendant = domUtils.isSingleDescendant(dom, node, ['img', 'abbr']);
					if(descendant){
						value = getNameAttr(dom, descendant);
					}
				}
				if(!value) {
					value = new InnerText(node).toString();
				}
				if(value) {
					uf.properties.name = [utils.trim(value).replace(/[\t\n\r ]+/g, ' ')];
				}
			}
			// implied photo rule
			if(!uf.properties.photo) {
				value = getPhotoAttr(dom, node);
				if(!value) {
					descendant = domUtils.isSingleDescendant(dom, node, ['img', 'object']);
					if(descendant){
						value = getPhotoAttr(dom, descendant);
					}
				}
				if(value) {
					uf.properties.photo = [utils.trim(value)];
				}
			}
			// implied url rule
			if(!uf.properties.url) {
				value = domUtils.getAttrValFromTagList(dom, node, ['a'], 'href');
				if(value) {
					uf.properties.url = [utils.trim(value)];
				}
			}

		}

		// implied date rule - temp fix
		// only apply to first date and time match
		if(uf.times.length > 0 && uf.dates.length > 0) {
			var newDate = dates.dateTimeUnion(uf.dates[0][1], uf.times[0][1]);
			uf.properties[this.removePropPrefix(uf.times[0][0])][0] = newDate.toString();
		}
		delete uf.times;
		delete uf.dates;



	},


	// find child properties of microformat
	walkChildren: function(dom, node, out, ufName, rootID) {
		var childOut = {},
			context = this,
			rootItem,
			itemRootID,
			value,
			propertyName,
			i = 0,
			x = 0;

		dom(node).children().each(function(i, child) {
			// get uf classes for this single element
			var classes = context.getUfClassNames(dom, child, ufName);

			// a property which is a microformat
			if(classes.root.length > 0 && classes.properties.length > 0) {
				// create object with type, property and value
				rootItem = context.createUfObject(
				classes.root, new InnerText(child).toString());

				// add the microformat as an array of properties
				propertyName = context.removePropPrefix(classes.properties[0]);
				if(out.properties[propertyName]) {
					out.properties[propertyName].push(rootItem);
				} else {
					out.properties[propertyName] = [rootItem];
				}
				context.rootID++;
				// loop the root items
				i = rootItem.type.length;
				x = 0;
				itemRootID = context.rootID;
				while(x < i) {
					context.walkChildren(dom, child, rootItem, rootItem.type[x], itemRootID);
					x++;
				}
				context.impliedRules(dom, child, rootItem);
			}

			// a property which is NOT a microformat and has not been use for a given root element
			if(classes.root.length === 0 && classes.properties.length > 0) {

				i = classes.properties.length;
				x = 0;
				while(x < i) {

					value = context.getValue(dom, child, classes.properties[x], out);
					propertyName = context.removePropPrefix(classes.properties[x]);

					// if the value is not empty 
					// and we have not added this value into a property with the same name already
					if(value !== '' && !context.hasRootID(dom, child, rootID, propertyName)) {
						// add the property as a an array of properties 
						if(out.properties[propertyName]) {
							out.properties[propertyName].push(value);
						} else {
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
			if(classes.root.length === 0 && classes.properties.length === 0) {
				context.walkChildren(dom, child, out, ufName, rootID);
			}

		});

	},


	// gets the value of a property
	getValue: function(dom, node, className, uf) {
		var value = '';

		if(utils.startWith(className, 'p-')) {
			value = this.getPValue(dom, node, true);
		}

		if(utils.startWith(className, 'e-')) {
			value = this.getEValue(dom, node);
		}

		if(utils.startWith(className, 'u-')) {
			value = this.getUValue(dom, node, true);
		}

		if(utils.startWith(className, 'dt-')) {
			value = this.getDTValue(dom, node, className, uf, true);
		}
		return value;
	},


	// gets the value of node which contain 'p-' property
	getPValue: function(dom, node, valueParse) {
		var out = '';
		if(valueParse) {
			out = this.getValueClass(dom, node, 'p');
		}

		if(!out && valueParse) {
			out = this.getValueTitle(dom, node);
		}

		if(!out) {
			out = domUtils.getAttrValFromTagList(dom, node, ['abbr'], 'title');
		}

		if(!out) {
			out = domUtils.getAttrValFromTagList(dom, node, ['data'], 'value');
		}

		if(node.name === 'br' || node.name === 'hr') {
			out = '';
		}

		if(!out) {
			out = domUtils.getAttrValFromTagList(dom, node, ['img', 'area'], 'alt');
		}

		if(!out) {
			out = new InnerText(node).toString();
		}

		return(out) ? out : '';
	},


	// get the value of node which contain 'e-' property
	getEValue: function(dom, node) {
		return domUtils.innerHTML(dom, node)
	},


	// get the value of node which contain 'u-' property
	getUValue: function(dom, node, valueParse) {
		// not sure this should be used for u property
		var out = '';
		if(valueParse) {
			out = this.getValueClass(dom, node, 'u');
		}

		if(!out && valueParse) {
			out = this.getValueTitle(dom, node);
		}

		if(!out) {
			out = domUtils.getAttrValFromTagList(dom, node, ['a', 'area'], 'href');
		}

		if(!out) {
			out = domUtils.getAttrValFromTagList(dom, node, ['img'], 'src');
		}

		if(!out) {
			out = domUtils.getAttrValFromTagList(dom, node, ['object'], 'data');
		}

		// if we have no protocal separator we need 
		// to turn relative url to absolute ones
		if(out && out !== '' && this.options.baseURL !== '' && out.indexOf(':') === -1) {
			out = urlParser.resolve(this.options.baseURL, out);
		}

		if(!out) {
			out = domUtils.getAttrValFromTagList(dom, node, ['abbr'], 'title');
		}

		if(!out) {
			out = domUtils.getAttrValFromTagList(dom, node, ['data'], 'value');
		}

		if(!out) {
			out = new InnerText(node).toString();
		}

		return(out) ? out : '';
	},


	// get the value of node which contain 'dt-' property
	getDTValue: function(dom, node, className, uf, valueParse) {
		var out = '';
		if(valueParse) {
			out = this.getValueClass(dom, node, 'dt');
		}

		if(!out && valueParse) {
			out = this.getValueTitle(dom, node);
		}

		if(!out) {
			out = domUtils.getAttrValFromTagList(dom, node, ['time', 'ins', 'del'], 'datetime');
		}

		if(!out) {
			out = domUtils.getAttrValFromTagList(dom, node, ['abbr'], 'title');
		}

		if(!out) {
			out = domUtils.getAttrValFromTagList(dom, node, ['data'], 'value');
		}

		if(!out) {
			out = new InnerText(node).toString();
		}

		if(out) {
			if(dates.isDuration(out)) {
				// just duration
				return out;
			} else if(dates.isTime(out)) {
				// just time or time+timezone
				if(uf) {
					uf.times.push([className, dates.parseAmPmTime(out)]);
				}
				return dates.parseAmPmTime(out);
			} else {
				// returns a date - uf profile 
				if(uf) {
					uf.dates.push([className, new ISODate(out).toString()]);
				}
				return new ISODate(out).toString();
			}
		} else {
			return '';
		}
	},


	// appends a new rootid to a given node
	appendRootID: function(dom, node, id, propertyName) {
		if(!node.rootids) {
			node.rootids = [];
		}
		node.rootids.push(id + '-' + propertyName);
	},


	// does a given node already have a rootid
	hasRootID: function(dom, node, id, propertyName) {
		if(!node.rootids) {
			return false;
		} else {
			return(node.rootids.indexOf(id + '-' + propertyName) > -1);
		}
	},



	// gets the text of any child nodes with the class value
	getValueClass: function(dom, node, propertyType) {
		var context = this,
			out = [];
		dom(node).children().each(function(i, child) {
			var value = null;
			if(domUtils.hasAttributeValue(dom, child, 'class', 'value')) {
				switch(propertyType) {
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
				if(value) {
					out.push(utils.trim(value));
				}
			}
		});
		if(out.length > 0) {
			if(propertyType === 'p') {
				return out.join(' ').replace(/[\t\n\r ]+/g, ' ');
			}
			if(propertyType === 'u') {
				return out.join('');
			}
			if(propertyType === 'dt') {
				return dates.concatFragments(out).toString();
			}
		} else {
			return null;
		}
	},


	// returns a single string of the 'title' attr from all 
	// the child nodes with the class 'value-title' 
	getValueTitle: function(dom, node) {
		var out = [],
			items = domUtils.getNodesByAttributeValue(dom, node, 'class', 'value-title'),
			i = items.length,
			x = 0;
		while(x < i) {
			if(domUtils.hasAttribute(dom, items[x], 'title')) {
				out.push(domUtils.getAttribute(dom, items[x], 'title'));
			}
			x++;
		}
		return out.join('');
	},



	// returns any uf root and property assigned to a single element
	getUfClassNames: function(dom, node, ufName) {
		var out = {
				'root': [],
				'properties': []
			},
			classNames = domUtils.getAttribute(dom, node, 'class'),
			key,
			items,
			item,
			i = 0,
			x = 0,
			z = 0,
			y = 0,
			map,
			prop,
			propName,
			v2Name,
			impiedRel;


		if(classNames) {
			items = classNames.split(' ');
			i = items.length;

			while(x < i) {

				item = utils.trim(items[x]);

				// test for root prefix - v2
				if(utils.startWith(item, this.rootPrefix)) {
					out.root.push(item);
				}

				// test for property prefix - v2
				z = this.propertyPrefixes.length;
				while(z--) {
					if(utils.startWith(item, this.propertyPrefixes[z])) {
						out.properties.push(item);
					}
				}

				// test for mapped root classnames v1
				for(key in this.maps) {
					if(this.maps.hasOwnProperty(key)) {
						// only add a root once
						if(this.maps[key].root === item && out.root.indexOf(key) === -1) {
							// if root map has subTree set to true
							// test to see if we should create a property or root
							if(this.maps[key].subTree && this.isSubTreeRoot(dom, node, this.maps[key], items) === false) {
								out.properties.push('p-' + this.maps[key].root);
							} else {
								out.root.push(key);
							}
						}
					}
				}

				// test for mapped property classnames v1
				map = this.getMapping(ufName);
				if(map) {
					for(key in map.properties) {
						prop = map.properties[key];
						propName = (prop.map) ? prop.map : 'p-' + key;

						if(key === item) {
							if(prop.uf) {
								// loop all the classList make sure 
								//   1. this property is a root
								//   2. that there is not already a equivalent v2 property ie url and u-url on the same element
								y = 0;
								while(y < i) {
									v2Name = this.getV2RootName(items[y]);
									// add new root
									if(prop.uf.indexOf(v2Name) > -1 && out.root.indexOf(v2Name) === -1) {
										out.root.push(v2Name);
									}
									y++;
								}
								//only add property once
								if(out.properties.indexOf(propName) === -1) {
									out.properties.push(propName);
								}
							} else {
								if(out.properties.indexOf(propName) === -1) {
									out.properties.push(propName);
								}
							}
						}

					}
				}
				x++;

			}
		}

		impiedRel = this.findRelImpied(dom, node, ufName);
		if(impiedRel && out.properties.indexOf(impiedRel) === -1) {
			out.properties.push(impiedRel);
		}

		return out;
	},



	// given a V1 or V2 root name return mapping object
	getMapping: function(name) {
		for(var key in this.maps) {
			if(this.maps[key].root === name || key === name) {
				return this.maps[key];
			}
		}
		return null;
	},


	// given a V1 root name returns a V2 root name ie vcard >>> h-card
	getV2RootName: function(name) {
		for(var key in this.maps) {
			if(this.maps[key].root === name) {
				return key;
			}
		}
		return null;
	},


	// use to find if a subTree mapping should be a property or root
	isSubTreeRoot: function(dom, node, map, classList) {
		var out = this.createUfObject(map.name);
		var hasSecondRoot = false;
		var i = classList.length,
			x = 0;

		// loop the classList to see if there is a second root
		while(x < i) {
			var item = utils.trim(classList[x]);
			for(var key in this.maps) {
				if(this.maps.hasOwnProperty(key)) {
					if(this.maps[key].root === item && this.maps[key].root !== map.root) {
						hasSecondRoot = true;
						break;
					}
				}
			}
			x++;
		}

		// walk the sub tree for properties that match this subTree
		this.walkChildren(dom, node, out, map.name, null);

		if(utils.hasProperties(out.properties) && hasSecondRoot === false) {
			return true;
		} else {
			return false;
		}
	},


	// finds any alt rel=* mappings for a given node/microformat
	findRelImpied: function(dom, node, ufName) {
		var out = null,
			map = this.getMapping(ufName);
		if(map) {
			for(var key in map.properties) {
				var prop = map.properties[key],
					propName = (prop.map) ? prop.map : 'p-' + key,
					relCount = 0;

				// if property as an alt rel=* mapping run test
				if(prop.relAlt && domUtils.hasAttribute(dom, node, 'rel')) {
					var i = prop.relAlt.length;
					while(i--) {
						if(domUtils.hasAttributeValue(dom, node, 'rel', prop.relAlt[i])) {
							relCount++;
						}
					}
					if(relCount === prop.relAlt.length) {
						out = propName;
					}
				}
			}
		}
		return out;
	},


	// creates a blank uf object
	createUfObject: function(names, value) {
		var out = {};
		if(value) {
			out.value = value;
		}
		if(utils.isArray(names)) {
			out.type = names;
		} else {
			out.type = [names];
		}
		out.properties = {};
		out.times = [];
		out.dates = [];
		return out;
	},




	// removes uf property prefixs from a string
	removePropPrefix: function(str) {
		var i = this.propertyPrefixes.length;
		while(i--) {
			var prefix = this.propertyPrefixes[i];
			if(utils.startWith(str, prefix)) {
				str = str.substr(prefix.length);
			}
		}
		return str;
	},




	findRels: function(dom, rootNode, fromChildren) {
		var uf = null,
			out = {},
			x = 0,
			i = 0,
			y = 0,
			z = 0,
			relList,
			items,
			item,
			key,
			value,
			arr;


		// get all elements that have a rel attribute
		fromChildren = (fromChildren) ? fromChildren : false; 
		if(fromChildren) {
			arr = domUtils.getNodesByAttribute(dom, rootNode.children, 'rel')
		} else {
			arr = domUtils.getNodesByAttribute(dom, rootNode, 'rel')
		}

		x = 0;
		i = arr.length;
		while(x < i) {
			relList = domUtils.getAttribute(dom, arr[x], 'rel');

			if(relList) {
				items = relList.split(' ');
				y = items.length;
				z = 0;
				while(z < y) {
					item = utils.trim(items[z]);
					for(key in this.rels) {
						if(key === item) {
							value = domUtils.getAttrValFromTagList(dom, arr[x], ['a', 'area'], 'href');
							if(!value) {
								value = domUtils.getAttrValFromTagList(dom, arr[x], ['link'], 'href');
							}
							if(!out[key]) {
								out[key] = [];
							}
							out[key].push(value);
						}
					}
					z++;
				}
			}
			x++;
		}

		if(utils.hasProperties(out)) {
			uf = this.createUfObject('rel');
			delete uf.times;
			delete uf.dates;
			uf.properties = out;
		}
		return uf;
	},


	findIncludes: function(dom, rootNode) {
		var out = {},
			arr,
			x = 0,
			i;

		// loop the nodes with itemref attributes  
		arr = domUtils.getNodesByAttribute(dom, rootNode, 'itemref');
		i = arr.length;
		while(x < i) {
			var itemList = domUtils.getAttribute(dom, arr[x], 'itemref');

			if(itemList) {
				var items = itemList.split(' '),
					y = items.length,
					z = 0;

				// loop each item to include
				while(z < y) {
					var item = utils.trim(items[z]),
						node = dom('#' + item, rootNode);

					// if we have found the element with the right id add to the dom
					if(node) {
						clone = domUtils.clone(dom, node);
						domUtils.appendChild(dom, arr[x], clone);
					}

					z++;
				}
			}
			x++;
		}

		this.findHeaderIncludes(dom, rootNode);
		this.findClassIncludes(dom, rootNode);
	},


	findHeaderIncludes: function(dom, rootNode) {
		var out = {},
			arr,
			i,
			x = 0;

		arr = domUtils.getNodesByAttribute(dom, rootNode, 'headers');

		// loop the nodes with headers attributes  
		i = arr.length;
		while(x < i) {
			var itemList = domUtils.getAttribute(dom, arr[x], 'headers');

			if(itemList) {
				var items = itemList.split(' '),
					y = items.length,
					z = 0;

				// loop each item to include
				while(z < y) {
					var item = utils.trim(items[z]),
						node = dom('#' + item, rootNode);

					// if we have found the element with the right id add to the dom
					if(node) {
						clone = domUtils.clone(dom, node);
						domUtils.appendChild(dom, arr[x], clone);
					}

					z++;
				}
			}
			x++;
		}
	},


	findClassIncludes: function(dom, rootNode) {
		var out = {},
			node,
			value,
			clone,
			arr,
			x = 0,
			i;


		arr = domUtils.getNodesByAttributeValue(dom, rootNode, 'class', 'include');

		// loop the nodes with headers attributes 
		i = arr.length;
		while(x < i) {

			value = domUtils.getAttrValFromTagList(dom, arr[x], ['a'], 'href');
			if(!value) {
				value = domUtils.getAttrValFromTagList(dom, arr[x], ['object'], 'data');
			}

			if(value) {
				value = utils.trim(value.replace('#', ''));
				node = dom('#' + value, rootNode);
				if(node) {
					clone = domUtils.clone(dom, node);
					this.markIncludeChildren(dom, clone);
					domUtils.appendChild(dom, arr[x], clone);
				}
			}
			x++;
		}
	},


	markIncludeChildren: function(dom, rootNode) {
		var arr = this.findRootNodes(dom, rootNode);
		var x = 0,
			i = arr.length;

		// loop the array and add the attribute
		domUtils.setAttribute(dom, rootNode, 'data-include', 'true');
		while(x < i) {
			domUtils.setAttribute(dom, arr[x], 'data-include', 'true');
			x++;
		}
	},


	// merges passed and default options -single level clone of properties
	mergeOptions: function(options) {
		var key;
		for(key in options) {
			if(options.hasOwnProperty(key)) {
				this.options[key] = options[key];
			}
		}
	},


};

var parser = new Parser();


/**
 * Parse a html string for microformats
 * html: a html string
 * options: supports option.formats - format(s) you wish to parse as a single value or a comma delimited list
 *                   option.useCache - waether to use cache in this request
 * callback: a function which is passed one argument, the return parser object with data or errors
 * baseUrl: a url used to resolve relative urls to absolute urls
 */

function parseHtml(html, options, baseUrl, callback) {

  var ufData = {},
    title = '',
    version = '',
    out = [],
    formats = '',
    data,
    useIncludes = false;

  if(options && options.formats) {
    formats = options.formats;
  }

  if(options && options.useIncludes) {
    useIncludes = (options.useIncludes === 'true') ? true : false;
  }

  var $ = cheerio.load(html);

  // find base tag if its exists in the header
  var baseTag = $('base');
  if(baseTag.length > 0) {
    var href = $(baseTag).attr('href');
    if(href){
      baseUrl = href;
    }
  }

  // define containing/root node - take hash from url
  var rootNode = $.root();
  var urlObj = require('url').parse(baseUrl, true);
  if(urlObj.hash) {
    var hashNode = $(urlObj.hash);
    if(hashNode) {
      rootNode = hashNode;
    }
  }

  data = parser.get($, rootNode, baseUrl, formats);
  if(callback) {
    callback(null, data);
  }

}




/**
 * Parse a url for microformats
 * url: absolute url starting with protocal ie htp or https
 * options: supports option.formats - format(s) you wish to parse as a single value or a comma delimited list
 *                   option.useCache - waether to use cache in this request
 * callback: a function which is passed one argument, the return parser object with data or errors
 */

function parseUrl(url, options, callback) {
  var ufData = {},
    formats = '';

  if(options && options.formats) {
    formats = options.formats;
  }

  try {
    if(url) {
      request({
        uri: url
      }, function(requestErrors, response, body) {
        if(!requestErrors && response.statusCode === 200) {
          parseHtml(body, options, url, callback);
        } else {
          var err = requestErrors + ' - ' + url;
          if(response && response.statusCode) {
            err = 'http error: ' + response.statusCode + ' (' + httpCodes[response.statusCode] + ') - ' + url;
          }
          ufData.errors = [err];
          if(callback) {
            callback(err, ufData);
          }
        }
      });
    } else {
      var err = 'no url provided' + ' - ' + url;
      ufData.errors = [err];
      if(callback) {
        callback(err, ufData);
      }
    }
  } catch(err) {
    var error =  err + ' - ' + url;
    ufData.errors = [error];
    if(callback) {
      callback(error, ufData);
    }
  }
}


exports.Parser = Parser;
exports.parseUrl = parseUrl;
exports.parseHtml = parseHtml;

