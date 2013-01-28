/*!
	Parser
	Copyright (C) 2012 Glenn Jones. All Rights Reserved.
	MIT License: https://raw.github.com/glennjones/microformat-node/master/license.txt

	*/

var request		= require('request'),
	cheerio		= require('cheerio'),
	urlParser	= require('url'),
	when		= require('when'),
	InnerText	= require('./innertext.js').InnerText,
	ISODate		= require('./isodate.js').ISODate,
	Logger		= require('./logger.js').Logger,
	Cache		= require('./cache.js'),
	httpCodes	= require('./httpstatus.json'),
	utils		= require('./utilities.js').utilities,
	domUtils	= require('./domutils.js').domUtils,
	dates		= require('./dates.js').dates;



function Parser() {
	this.version = '0.0.1';
	this.rootPrefix = 'h-';
	this.propertyPrefixes = ['p-', 'dt-', 'u-', 'e-'];
	this.options = {
		'baseUrl': '',
		'filters': [],
		'version1': true,
		'children': true,
		'childrenRel': true,
		'rel': true,
		'textFormat': 'normalised',
		'cacheTimeLimit': 3600000,
		'cacheItemLimit': 1000,
		'useCache': false,
		'cache': Cache,
		'logLevel': 4,
		'logger': new Logger(4)
	};
	

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
}


Parser.prototype = {


	// main parse function for urls
	parseUrl: function(url, options, callback) {
		var context = this,
			deferred = when.defer(),
			errors = null,
			out = null,
			start = new Date(),
			dom,
			rootNode;
		
		this.options.logger.log('parsing microformats from url: ' + url);
		this.options.baseUrl = url;	
		this.mergeOptions(options);

		if(!url){
			this.returnData([{'error': 'No URL was passed to the parser'}], out, callback, deferred);
		}else{
			try {
				if (this.options.cache && this.options.useCache && this.options.cache.has(url)) {
					// from cache
					this.options.logger.log('fetched html from cache: ' + url); 
					dom = cheerio.load(this.options.cache.get(url));
					rootNode = dom.root();
					out = context.get(dom, rootNode, context.options);
					context.returnData(out.errors, out.data, callback, deferred, start);
				} else {
					request({
						uri: url
						}, function(requestErrors, response, body) {
							if(!requestErrors && response.statusCode === 200) {

								// add html into the cache
								if (context.options.cache) {
									context.options.cache.set(url, body); 
								}

								dom = cheerio.load(body);
								rootNode = dom.root();
								out = context.get(dom, rootNode, context.options);
								context.returnData(out.errors, out.data, callback, deferred, start);
							} else {
								errors = [{'error': requestErrors + ' - ' + url}];
								if(response && response.statusCode) {
									errors = [{'error':  'http error: ' + response.statusCode + ' (' + httpCodes[response.statusCode] + ') - ' + url}];
								}
								context.returnData(errors, out, callback, deferred);
							}
						});
				}
			}catch(err){
				this.returnData([{'error': err + ' - ' + url}], out, callback, deferred);
			}
		}
		return deferred.promise;
	},
	

	// main parse function for html fragments
	parseHtml: function(html, options, callback) {
		var deferred = when.defer(),
			errors = null,
			out = null,
			start = new Date(),
			dom,
			rootNode;

		this.options.logger.log('parsing microformats from html');
		this.mergeOptions(options);

		if(!html){
			this.returnData([{'error': 'No HTML fragment passed to the parser'}], out, callback, deferred);
		}else{
			try{
				dom = cheerio.load(html);
				rootNode = dom.root();

				out = this.get(dom, rootNode, this.options);
				this.returnData(out.errors, out.data, callback, deferred, start);
			}catch(err){
				this.returnData([{'error': err}], out, callback, deferred);
			}
		} 
		return deferred.promise;
	},


	// main parse function for Cheerio dom tree
	parseDom: function(dom, rootNode, options, callback) {
		var deferred = when.defer(),
			errors = null,
			out = null,
			start = new Date();

		this.options.logger.log('parsing microformats from cheerio dom object');
		if(!dom){
			this.returnData([{'error': 'No Cheerio DOM object passed to the parser'}], out, callback, deferred);
		}else{
			try {
				if(!rootNode){
					rootNode = dom.root();
				}
				out = this.get(dom, rootNode, options);
				this.returnData(out.errors, out.data, callback, deferred, start);
			}catch(err){
				this.returnData([{'error': err}], out, callback, deferred);
			}
		}

		return deferred.promise;
	},


	// returns date either by callback or promise
	returnData: function(errors, data, callback, deferred, start){
		if(errors){
			this.options.logger.error(JSON.stringify(errors));
		}
		if(start){
			this.options.logger.log('microformat parser took: ' + (new Date().getTime() - start.getTime()) + 'ms');
		}
		if(callback){
			callback(errors, data);
		}else{
			if(errors){
				deferred.reject(errors);
			}else{
				deferred.resolve(data);
			}
		}
	},


	// internal parse function 
	get: function(dom, rootNode, options) {
		var errors = null,
			items, 
			children, 
			data = [],
			ufs = [],
			x,
			i,
			z,			
			y,
			rels,
			baseTag,
			href;

		this.mergeOptions(options);
		this.rootID = 0;

		if(!dom || !rootNode){
			errors = [{'error': 'No DOM or rootNode given'}];
			return {'errors': errors, 'data': {}};
		}else{

			// add includes
			this.addIncludes(dom, rootNode);
			

			// find base tag to set baseUrl
			baseTag = dom('base');
			if(baseTag.length > 0) {
				href = domUtils.getAttribute(dom, baseTag, 'href');
				if(href){
					this.options.baseUrl = href;
				}
			}

			// find starts points in the DOM
			items = this.findRootNodes(dom, rootNode);
			if(items && !errors) {
				x = 0;
				i = items.length;
				while(x < i) {
					if(!domUtils.hasAttribute(dom, items[x], 'data-include')) {
						// find microformats - return as an array, there maybe more than one root on a element
						ufs = this.walkTree(dom, items[x], true);
						z = 0;
						y = ufs.length;
						while(z < y) {
							// make sure its a valid structure and apply filter if its requested  
							if(ufs[z] && utils.hasProperties(ufs[z].properties) && this.shouldInclude(ufs[z], this.options.filters)) {
								// find any children in the microformats dom tree that are not attached toa property
								if(this.options.children){
									children = this.findChildItems(dom, items[x], ufs[z].type[0]);
									if(children.length > 0) {
										ufs[z].children = children;
									}
								}
								data.push(ufs[z]);
							}
							z++;
						}
					}
					x++;
				}
			}

			// find any rel
			if(this.options.rel){
				rels = this.findRels(dom, rootNode);
				if(rels && this.shouldInclude(rels, this.options.filters)) {
					data.push(rels);
				}
			}

		}
		return {'errors': errors, 'data': {'items': data}};
	},



	// is the uf type in the filter list
	shouldInclude: function(uf, filters) {
		var i;

		if(utils.isArray(filters) && filters.length > 0) {
			i = filters.length;
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


	// finds uf within the tree of a parent uf but where they have on property
	findChildItems: function(dom, rootNode, ufName) {
		var items, 
			out = [],
			ufs = [],
			x,
			i,
			z,			
			y,
			rels;


		items = this.findRootNodes(dom, rootNode, true);
		if(items.length > 0) {
			i = items.length;
			x = 0; // 1 excludes parent
			while(x < i) {
				var classes = this.getUfClassNames(dom, items[x], ufName);
				if(classes.root.length > 0 && classes.properties.length === 0) {
					ufs = this.walkTree(dom, items[x], true);
					y = ufs.length;
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
		if(this.options.rel && this.options.childrenRel){
			rels = this.findRels(dom, rootNode);
			if(rels) {
				out.push(rels);
			}
		}

		return out;
	},





	// returns all the root nodes in a document
	findRootNodes: function(dom, rootNode, fromChildren) {
		var arr = null,			
			out = [], 
			classList = [],
			test,
			items,
			x,
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
			arr = domUtils.getNodesByAttribute(dom, rootNode.children, 'class');
		} else {
			arr = domUtils.getNodesByAttribute(dom, rootNode, 'class');
		}


		// loop elements that have a class attribute
		x = 0;    
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
		var classes,
			out = [],
			obj,
			itemRootID,
			x,
			i;

		// loop roots found on one element
		classes = this.getUfClassNames(dom, node);
		if(classes){
			x = 0;
			i = classes.root.length;
			while(x < i) {
				this.rootID++;
				itemRootID = this.rootID,
				obj = this.createUfObject(classes.root[x]);

				this.walkChildren(dom, node, obj, classes.root[x], itemRootID);
				this.impliedRules(dom, node, obj);
				out.push(obj);
				x++;
			}
		}
		return out;
	},


	// test for the need to apply the "implied rules" for name, photo and url
	impliedRules: function(dom, node, uf) {
		var context = this,
			value,
			descendant,
			newDate;


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
					value = new InnerText(dom, node, this.options.textFormat).toString();
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
			newDate = dates.dateTimeUnion(uf.dates[0][1], uf.times[0][1]);
			uf.properties[this.removePropPrefix(uf.times[0][0])][0] = newDate.toString();
		}
		delete uf.times;
		delete uf.dates;

	},


	// find child properties of microformat
	walkChildren: function(dom, node, out, ufName, rootID) {
		var context = this,
			childOut = {},
			rootItem,
			itemRootID,
			value,
			propertyName,
			i,
			x;

		dom(node).children().each(function(i, child) {
			// get uf classes for this single element
			var classes = context.getUfClassNames(dom, child, ufName);

			// a property which is a microformat
			if(classes.root.length > 0 && classes.properties.length > 0) {
				// create object with type, property and value
				rootItem = context.createUfObject(
				classes.root, new InnerText(dom, child, this.options.textFormat).toString());

				// add the microformat as an array of properties
				propertyName = context.removePropPrefix(classes.properties[0]);
				if(out.properties[propertyName]) {
					out.properties[propertyName].push(rootItem);
				} else {
					out.properties[propertyName] = [rootItem];
				}
				context.rootID++;

				x = 0;
				i = rootItem.type.length;
				itemRootID = context.rootID;
				while(x < i) {
					context.walkChildren(dom, child, rootItem, rootItem.type[x], itemRootID);
					x++;
				}
				context.impliedRules(dom, child, rootItem);
			}

			// a property which is NOT a microformat and has not been use for a given root element
			if(classes.root.length === 0 && classes.properties.length > 0) {
				
				x = 0;
				i = classes.properties.length;
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
			out = new InnerText(dom, node, this.options.textFormat).toString();
		}

		return(out) ? out : '';
	},


	// get the value of node which contain 'e-' property
	getEValue: function(dom, node) {
		return domUtils.innerHTML(dom, node);
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

		// if we have no protocal separator, turn relative url to absolute ones
		if(out && out !== '' && this.options.baseUrl !== '' && out.indexOf(':') === -1) {
			out = urlParser.resolve(this.options.baseUrl, out);
		}

		if(!out) {
			out = domUtils.getAttrValFromTagList(dom, node, ['abbr'], 'title');
		}

		if(!out) {
			out = domUtils.getAttrValFromTagList(dom, node, ['data'], 'value');
		}

		if(!out) {
			out = new InnerText(dom, node, this.options.textFormat).toString();
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
			out = new InnerText(dom, node, this.options.textFormat).toString();
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
			items,
			i,
			x;

		items = domUtils.getNodesByAttributeValue(dom, node, 'class', 'value-title');
		x = 0;
		i = items.length;		
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
			classNames,
			key,
			items,
			item,
			i,
			x,
			z,
			y,
			map,
			prop,
			propName,
			v2Name,
			impiedRel;


		classNames = domUtils.getAttribute(dom, node, 'class');
		if(classNames) {
			items = classNames.split(' ');
			x = 0;
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

				if(this.options.version1){

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
		var key;
		for(key in this.maps) {
			if(this.maps[key].root === name || key === name) {
				return this.maps[key];
			}
		}
		return null;
	},


	// given a V1 root name returns a V2 root name ie vcard >>> h-card
	getV2RootName: function(name) {
		var key;
		for(key in this.maps) {
			if(this.maps[key].root === name) {
				return key;
			}
		}
		return null;
	},


	// use to find if a subTree mapping should be a property or root
	isSubTreeRoot: function(dom, node, map, classList) {
		var out,
			hasSecondRoot,
			i,
			x;

		out = this.createUfObject(map.name);
		hasSecondRoot = false;	

		// loop the classList to see if there is a second root
		x = 0;
		i = classList.length;	
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
		var out,
			map,
			i;

		map = this.getMapping(ufName);
		if(map) {
			for(var key in map.properties) {
				var prop = map.properties[key],
					propName = (prop.map) ? prop.map : 'p-' + key,
					relCount = 0;

				// if property as an alt rel=* mapping run test
				if(prop.relAlt && domUtils.hasAttribute(dom, node, 'rel')) {
					i = prop.relAlt.length;
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
		var i;

		i = this.propertyPrefixes.length;
		while(i--) {
			var prefix = this.propertyPrefixes[i];
			if(utils.startWith(str, prefix)) {
				str = str.substr(prefix.length);
			}
		}
		return str;
	},




	findRels: function(dom, rootNode, fromChildren) {
		var uf,
			out = {},
			x,
			i,
			y,
			z,
			relList,
			items,
			item,
			key,
			value,
			arr;


		// get all elements that have a rel attribute
		fromChildren = (fromChildren) ? fromChildren : false; 
		if(fromChildren) {
			arr = domUtils.getNodesByAttribute(dom, rootNode.children, 'rel');
		} else {
			arr = domUtils.getNodesByAttribute(dom, rootNode, 'rel');
		}

		x = 0;
		i = arr.length;
		while(x < i) {
			relList = domUtils.getAttribute(dom, arr[x], 'rel');

			if(relList) {
				items = relList.split(' ');

				z = 0;
				y = items.length;
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


	// add all the includes ino the dom structure
	addIncludes: function(dom, rootNode) {
		this.addAttributeIncludes(dom, rootNode, 'itemref');
		this.addAttributeIncludes(dom, rootNode, 'headers');
		this.addClassIncludes(dom, rootNode);
	},


	// add attribute based includes ie 'itemref' and 'headers'
	addAttributeIncludes: function(dom, rootNode, attributeName) {
		var out = {},
			arr,
			idList,
			i,
			x,
			z,
			y;

		arr = domUtils.getNodesByAttribute(dom, rootNode, attributeName);
		x = 0;
		i = arr.length;
		while(x < i) {
			idList = domUtils.getAttributeList(dom, arr[x], attributeName);
			if(idList) {
				z = 0;
				y = idList.length;
				while(z < y) {
					this.apppendInclude(dom, arr[x], idList[z]);
					z++;
				}
			}
			x++;
		}
	},


	// add class based includes
	addClassIncludes: function(dom, rootNode) {
		var out = {},
			node,
			id,
			clone,
			arr,
			x = 0,
			i;

		arr = domUtils.getNodesByAttributeValue(dom, rootNode, 'class', 'include');
		i = arr.length;
		while(x < i) {
			id = domUtils.getAttrValFromTagList(dom, arr[x], ['a'], 'href');
			if(!id) {
				id = domUtils.getAttrValFromTagList(dom, arr[x], ['object'], 'data');
			}
			this.apppendInclude(dom, arr[x], id);
			x++;
		}
	},


	// appends a clone of an element into another node
	apppendInclude: function(dom, node, id){
		var include,
			clone;

		id = utils.trim(id.replace('#', ''));
		include = dom('#' + id);
		if(include) {
			clone = domUtils.clone(dom, include);
			this.markIncludeChildren(dom, clone);
			domUtils.appendChild(dom, node, clone);
		}
	},


	// add a attribute to all the child microformats roots  
	markIncludeChildren: function(dom, rootNode) {
		var arr,
			x,
			i;

		// loop the array and add the attribute
		arr = this.findRootNodes(dom, rootNode);
		x = 0;
		i = arr.length;
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
		if(this.options.logger){
			this.options.logger.setLogLevel( this.options.logLevel );
		}
		if(this.options.cache){
			this.options.cache.setCacheLimits(
				this.options.cacheTimeLimit, 
				this.options.cacheItemLimit
			); 
		}
	},

	// Add a new map object
	add: function(map) {
		if(!this.maps[map.name]) {
			this.maps[map.name] = map;
		}
	}


};

var parser = new Parser();






exports.Parser = Parser;


