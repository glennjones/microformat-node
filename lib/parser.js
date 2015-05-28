/*!
	Parser
	Copyright (C) 2012 Glenn Jones. All Rights Reserved.
	MIT License: https://raw.github.com/glennjones/microformat-node/master/license.txt

	*/

'use strict';



var request		= require('request'),
	cheerio		= require('cheerio'),
	urlParser	= require('url'),
	when		= require('when'),
	entities    = require('entities'),
	text		= require('./text.js'),
	html		= require('./html.js'),
	ISODate		= require('./isodate.js').ISODate,
	logger		= require('./logger.js'),
	cache		= require('./cache.js'),
	httpCodes	= require('./httpstatus.json'),
	utils		= require('./utilities.js'),
	domUtils	= require('./domutils.js'),
	dates		= require('./dates.js'),
	pack        = require('../package');

var version = pack.version; 

// main parse function for urls
function parseUrl(url, options, callback) {
	var parser = new Parser(),
		logger = parser.options.logger,
		deferred = when.defer(),
		errors = null,
		out = null,
		start = new Date(),
		dom,
		rootNode;
	
	logger.log('parsing microformats from url: ' + url);

	// if we given no base URL then use the page URL
	if(!options.baseUrl || utils.trim(options.baseUrl) === ''){
		var u = urlParser.parse(url);
		options.baseUrl = u.protocol + '//' + u.host + u.path;
	}

	// hash to select node by id
	if(url.indexOf('#') > -1){
		var parts = url.split('#');
		options.selector = '#' + parts[1];
	}

	parser.mergeOptions(options);



	if(!url){
		returnData([{'error': 'No URL was passed to the parser'}], out, callback, deferred, logger);
	}else{
		try {
			if (parser.options.cache && parser.options.useCache && parser.options.cache.has(url)) {
				// from cache
				parser.options.logger.log('fetched html from cache: ' + url); 
				dom = cheerio.load(parser.options.cache.get(url), {xmlMode: true});
				rootNode = dom.root();		
				out = parser.get(dom, rootNode, parser.options);
				returnData(out.errors, out.data, callback, deferred, logger, start);
			} else {
				request({
					uri: url
					}, function(requestErrors, response, body) {
						if(!requestErrors && response.statusCode === 200) {

							// add html into the cache
							if (parser.options.cache) {
								parser.options.cache.set(url, body); 
							}

							dom = cheerio.load(body, {xmlMode: true});
							rootNode =  dom.root().first();

							var xix = dom(rootNode).find('.p-like');

							out = parser.get(dom, rootNode, parser.options);
							returnData(out.errors, out.data, callback, deferred, logger, start);
						} else {
							errors = [{'error': requestErrors + ' - ' + url}];
							if(response && response.statusCode) {
								errors = [{'error':  'http error: ' + response.statusCode + ' (' + httpCodes[response.statusCode] + ') - ' + url}];
							}
							returnData(errors, out, callback, deferred, logger);
						}
					});
			}
		}catch(err){
			returnData([{'error': err + ' - ' + url}], out, callback, deferred, logger);
		}
	}
	//return deferred.promise;
}
	

// main parse function for html fragments
function parseHtml(html, options, callback) {
	var parser = new Parser(),
		logger = parser.options.logger,
		deferred = when.defer(),
		errors = null,
		out = null,
		start = new Date(),
		dom,
		rootNode;

	logger.log('parsing microformats from html');
	parser.mergeOptions(options);

	if(!html){
		returnData([{'error': 'No HTML fragment passed to the parser'}], out, callback, deferred, logger);
	}else{
		try{
			dom = cheerio.load(html, {xmlMode: true});
			rootNode = dom.root();

			out = parser.get(dom, rootNode, parser.options);
			returnData(out.errors, out.data, callback, deferred, logger, start);
		}catch(err){
			returnData([{'error': err}], out, callback, deferred, logger);
		}
	} 
	return deferred.promise;
}


// main parse function for Cheerio dom tree
function parseDom(dom, rootNode, options, callback) {
	var parser = new Parser(),
		logger = parser.options.logger,
		deferred = when.defer(),
		errors = null,
		out = null,
		start = new Date();

	logger.log('parsing microformats from cheerio dom object');
	parser.mergeOptions(options);

	if(!dom){
		this.returnData([{'error': 'No Cheerio DOM object passed to the parser'}], out, callback, deferred);
	}else{
		try {
			if(!rootNode){
				rootNode = dom.root();
			}
			out = parser.get(dom, rootNode, parser.options);
			returnData(out.errors, out.data, callback, deferred, logger, start);
		}catch(err){
			returnData([{'error': err}], out, callback, deferred, logger);
		}
	}

	return deferred.promise;
}


// returns date either by callback or promise
function returnData(errors, data, callback, deferred, logger, start){
	if(errors){
		logger.error(JSON.stringify(errors));
	}
	if(start){
		logger.log('microformat parser took: ' + (new Date().getTime() - start.getTime()) + 'ms');
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
}











function Parser() {
	this.version = pack.version;
	this.rootPrefix = 'h-';
	this.propertyPrefixes = ['p-', 'dt-', 'u-', 'e-'];
	this.options = {
		'baseUrl': '',
		'filters': [],
		'selector': '',
		'version1': true,
		'children': true,
		'rel': true,
		'includes': true,
		'textFormat': 'normalised',
		'protocals': ['http','https','ftp','ftps','mailto','tel','sms'],
		'cacheTimeLimit': 3600000,
		'cacheItemLimit': 1000,
		'useCache': false,
		'cache': cache,
		'logLevel': 4,
		'logger': logger
	};
	 

	// add maps for the v1 schema's
	this.maps = {};
	this.add(require('../lib/maps/h-adr.js').hadr);
	this.add(require('../lib/maps/h-card.js').hcard);
	this.add(require('../lib/maps/h-feed.js').hfeed);
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
	this.flatArray = [];
}



Parser.prototype = {
	
	// internal parse function 
	get: function(dom, rootNode, options) {
		var errors = null,
			out,
			docNode,
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
		this.flatArray = [];

		if(!dom || !rootNode){
			errors = [{'error': 'No DOM or rootNode given'}];
			return {'errors': errors, 'data': {}};
		}else{

			// select part of the document - only works with ids at moment
			docNode = rootNode;
			if(this.options.selector && this.options.selector.indexOf('#') === 0){
				rootNode = dom( this.options.selector );
			}

			// add includes
			if(this.options.includes){
				this.addIncludes(dom, docNode);
			}
			

			// find base tag to set baseUrl
			baseTag = dom('base');
			if(baseTag.length > 0) {
				href = domUtils.getAttribute(dom, baseTag, 'href');
				if(href){
					this.options.baseUrl = href;
				}
			}

			
			if(this.options.filters.length > 0){
				// parse flat list of items
				var struct = this.findFilterNodes(dom, rootNode, this.options.filters);
				data = this.walkRoot(struct[0], struct[1]);
			}else{
				// parse whole document from root
				data = this.walkRoot(dom, rootNode);
			}
			out = {'errors': errors, 'data': {'items': data}};


			// find any rel
			if(this.options.rel){
				rels = this.findRels(dom, rootNode);
				out.data.rels = rels;
				if(rels.alternate){
					out.data.alternates = rels.alternate;
					delete out.data.rels.alternate;
				}
			}

		}
		return out;
	},



	// find uf's of a given type and return a dom and node structure of just that type of ufs
	findFilterNodes: function(dom, rootNode, filters) {
		var newDom = cheerio.load('<div></div>', {xmlMode: true}),
			newRootNode = dom.root(),
			items = this.findRootNodes(dom, rootNode),
			i = 0,
			x = 0,
			y = 0;

		newRootNode.html('');

		if(items){
			i = items.length;		
			while(x < i) {
				var y = filters.length;
				while (y--) {
					if(domUtils.hasAttributeValue(dom, items[x], 'class', filters[y])){
						var clone = domUtils.clone(dom, items[x]);
						domUtils.appendChild(newDom, newRootNode, clone);
					}
				}
				x++;
			}
		}	

		return [newDom, newRootNode];
	},





	// finds uf within the tree of a parent uf - used to create childern list
	findChildItems: function(dom, rootNode, ufNameArr) {
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
				var classes = this.getUfClassNames(dom, items[x], ufNameArr);
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
			var nodes;
			if(utils.isArray(rootNode.children)){
				nodes = rootNode.children;
			}else{
				nodes = rootNode.children();
			}
			arr = domUtils.getNodesByAttribute(dom, nodes, 'class');
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


	// starts the tree walk to find microformats
	walkRoot: function(dom, node){
		var context = this,
			classes,
			items = [],
			out = [];

		classes = this.getUfClassNames(dom, node);
		// if a root uf node
		if(classes && classes.root.length > 0){
			items = this.walkTree(dom, node)

			if(items.length > 0){
				out = out.concat(items);
			}
		}else{
			// check if there are children and one of the children has a root uf
			if(node && node.children && node.children.length > 0 && this.findRootNodes(dom, node, true).length > -1){
				dom(node).children().each(function(i, child) {
					items = context.walkRoot(dom, child);
					if(items.length > 0){
						out = out.concat(items);
					}
				});
			}
		}
		return out
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
		if(classes && classes.root.length && classes.root.length > 0){

			this.rootID++;
			itemRootID = this.rootID;
			obj = this.createUfObject(classes.root);

			this.walkChildren(dom, node, obj, classes.root, itemRootID);
			this.impliedRules(dom, node, obj);
			out.push(obj);
		
			
		}
		return out;
	},


	// test for the need to apply the "implied rules" for name, photo and url
	impliedRules: function(dom, node, uf) {
		var context = this,
			value,
			child,
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
			/*
				img.h-x[alt]
				abbr.h-x[title] 
				.h-x>img:only-node[alt] 
				.h-x>abbr:only-node[title] 
				.h-x>:only-node>img:only-node[alt]
				.h-x>:only-node>abbr:only-node[title] 
			*/

			if(!uf.properties.name) {
				// img.h-x[alt] or abbr.h-x[title]
				value = getNameAttr(dom, node);

				if(!value) {
					// single descendant that is a img or abbr i.e. .h-x>img[alt]:only-node
					descendant = domUtils.isSingleDescendant(dom, node, ['img', 'abbr']);
					if(descendant){
						value = getNameAttr(dom, descendant);
					}

					// has a single child that has a single descendant that is a img or object i.e. .h-x>:only-child>img[alt]:only-node
					if(node.children.length > 0){
						child = domUtils.isSingleDescendant(dom, node);
						if(child){
							descendant = domUtils.isSingleDescendant(dom, child, ['img', 'abbr']);
							if(descendant){
								value = getNameAttr(dom, descendant);
							}
						}
					}
				}
				if(!value) {
					value = text.parse(dom, node, this.options.textFormat);
				}
				if(value) {
					//uf.properties.name = [utils.trim(value).replace(/[\t\n\r ]+/g, ' ')];
					uf.properties.name = [text.textContent(value)];
				}
			}


			// implied photo rule
			/*
				img.h-x[src] 
				object.h-x[data] 
				.h-x>img[src]:only-of-type
				.h-x>object[data]:only-of-type 
				.h-x>:only-child>img[src]:only-of-type 
				.h-x>:only-child>object[data]:only-of-type 
			*/

			if(!uf.properties.photo) {
				// is a img or object i.e. img.h-x[src]
				value = getPhotoAttr(dom, node);
				if(!value) {
					// has a single descendant that is a img or object i.e. .h-x>img[src]:only-of-type
					descendant = domUtils.isOnlySingleDescendantOfType(dom, node, ['img', 'object']);
					if(descendant){
						value = getPhotoAttr(dom, descendant);
					}
					// has a single child that has a single descendant that is a img or object i.e. .h-x>:only-child>img[src]:only-of-type
					if(node.children.length > 0){
						child = domUtils.isSingleDescendant(dom, node);
						if(child){
							descendant = domUtils.isOnlySingleDescendantOfType(dom, child, ['img', 'object']);
							if(descendant){
								value = getPhotoAttr(dom, descendant);
							}
						}
					}

				}
				if(value) {
					// relative to absolute URL
					if(value && value !== '' && this.options.baseUrl !== '' && value.indexOf(':') === -1) {
						value = urlParser.resolve(this.options.baseUrl, value);
					}
					uf.properties.photo = [utils.trim(value)];
				}
			}


			// implied url rule
			if(!uf.properties.url) {
				value = domUtils.getAttrValFromTagList(dom, node, ['a'], 'href');
				if(value) {
					// relative to absolute URL
					if(value !== '' && this.options.baseUrl !== '' && value.indexOf(':') === -1) {
						value = urlParser.resolve(this.options.baseUrl, value);
					}
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
	walkChildren: function(dom, node, out, ufNameArr, rootID) {
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
			var classes = context.getUfClassNames(dom, child, ufNameArr);

			// a property which is a microformat
			if(classes.root.length > 0 && classes.properties.length > 0 && !child.addedAsRoot) {
				// create object with type, property and value
				rootItem = context.createUfObject(
					classes.root, 
					text.parse(dom, child, context.options.textFormat)
				);

				// add the microformat as an array of properties
				propertyName = context.removePropPrefix(classes.properties[0]);
				if(out.properties[propertyName]) {
					out.properties[propertyName].push(rootItem);
				} else {
					out.properties[propertyName] = [rootItem];
				}
				context.rootID++;
				// used to stop duplication in heavily nested structures
				child.addedAsRoot = true;

				x = 0;
				i = rootItem.type.length;
				itemRootID = context.rootID;
				while(x < i) {
					context.walkChildren(dom, child, rootItem, rootItem.type, itemRootID);
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

				context.walkChildren(dom, child, out, ufNameArr, rootID);
			}


			// if the node has no uf classes, see if its children have
			if(classes.root.length === 0 && classes.properties.length === 0) {
				context.walkChildren(dom, child, out, ufNameArr, rootID);
			}


			// if the node is child root that should be add to children tree
			if(context.options.children){
				if(classes.root.length > 0 && classes.properties.length === 0) {
		
					// create object with type, property and value
					rootItem = context.createUfObject(
						classes.root, 
						text.parse(dom, child, context.options.textFormat)
					);

					// add the microformat as an array of properties
					if(!out.children){
						out.children =  [];
					}

					if(!context.hasRootID(dom, child, rootID, 'child-root')) {
						out.children.push(rootItem);
						context.appendRootID(dom, child, rootID, 'child-root');
						context.rootID++;
					}

					x = 0;
					i = rootItem.type.length;
					itemRootID = context.rootID;
					while(x < i) {
						context.walkChildren(dom, child, rootItem, rootItem.type, itemRootID);
						x++;
					}
					context.impliedRules(dom, child, rootItem);
				}
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
			out = text.parse(dom, node, this.options.textFormat);
		}

		return(out) ? out : '';
	},


	// get the value of node which contain 'e-' property
	getEValue: function(dom, node) {
		// console.log('fired: getEValue',  new Date().getTime() - this.started.getTime())
		var out = {value: '', html: ''};

		expandUrls(dom, node, 'src', this.options.baseUrl);
		expandUrls(dom, node, 'href', this.options.baseUrl);

		// replace all relative links with absolute ones where it can
		function expandUrls(dom, node, attrName, baseUrl){
			var i,
				nodes,
				attr;

			nodes = domUtils.getNodesByAttribute(dom, node, attrName);
			i = nodes.length;
			while (i--) {
				try{
					// the url parser can blow up if the format is not right
					attr = domUtils.getAttribute(dom, nodes[i], attrName);
					if(attr && attr !== '' && baseUrl !== '' && attr.indexOf(':') === -1) {
						attr = urlParser.resolve(baseUrl, attr);
						domUtils.setAttribute(dom, nodes[i], attrName, attr);
					}	
				}catch(err){
					// do nothing convert only the urls we can leave the rest as they where
				}
			}
		}

		// clone a copy without includes insertions
		//node = domUtils.removeIncludedDOMElts(dom, node)

		out.value = text.parse(dom, node, this.options.textFormat);
		//out.html = domUtils.innerHTML(dom, node);
		out.html = html.parse(dom, node);

		return out;
	},


	// get the value of node which contain 'u-' property
	getUValue: function(dom, node, valueParse) {
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
			out = text.parse(dom, node, this.options.textFormat);
		}

		return(out) ? out : '';
	},


	// get the value of node which contain 'dt-' property
	getDTValue: function(dom, node, className, uf, valueParse) {
		var out = '',
			format = 'uf';

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
			out = text.parse(dom, node, this.options.textFormat);
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
				if(out.indexOf(' ') > 0){
					format = 'HTML5';
				} 
				if(uf) {
					uf.dates.push([className, new ISODate(out).toString( format )]);
				}
				return new ISODate(out).toString( format );
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
	getUfClassNames: function(dom, node, ufNameArr) {
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
			impiedRel,
			ufName;


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

					if(ufNameArr){
						for (var a = 0; a < ufNameArr.length; a++) {
							ufName = ufNameArr[a];
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
					}
				}
				x++;

			}
		}

		if(ufNameArr){
			for (var a = 0; a < ufNameArr.length; a++) {
				ufName = ufNameArr[a];
				impiedRel = this.findRelImpied(dom, node, ufName);
				if(impiedRel && out.properties.indexOf(impiedRel) === -1) {
					out.properties.push(impiedRel);
				}
			}
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
		// add type ie ["h-card", "h-org"]
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

				if(relList.toLowerCase().indexOf('alternate') > -1){	
					// if its an alternate add object with 4 properties
					var obj = {};
					if(domUtils.hasAttribute(dom, arr[x], 'href')){
						var url = domUtils.getAttribute(dom, arr[x], 'href');
						if(url){
							obj.url = urlParser.resolve(this.options.baseUrl, url );
						}
					}
					if(domUtils.hasAttribute(dom, arr[x], 'media')){
						obj.media = domUtils.getAttribute(dom, arr[x], 'media');
					}
					if(domUtils.hasAttribute(dom, arr[x], 'type')){
						obj.type = domUtils.getAttribute(dom, arr[x], 'type');
					}
					if(items.length > 1){
						if(domUtils.hasAttribute(dom, arr[x], 'rel')){
							obj.rel = utils.trim( relList.toLowerCase().replace('alternate','') );
						}
					}
					// create the key
					if(!out['alternate']) {
						out['alternate'] = [];
					}
					out['alternate'].push( obj );
				}else{

					z = 0;
					y = items.length;
					while(z < y) {
						item = utils.trim(items[z]);

						// get rel value
						value = domUtils.getAttrValFromTagList(dom, arr[x], ['a', 'area'], 'href');
						if(!value) {
							value = domUtils.getAttrValFromTagList(dom, arr[x], ['link'], 'href');
						}

						// create the key
						if(!out[item]) {
							out[item] = [];
						}

						if(typeof this.options.baseUrl == 'string' && typeof value === 'string') {
							out[item].push( urlParser.resolve(this.options.baseUrl, value) );
						}
						z++;
					}
				}


		
			}
			x++;
		}
		return out;
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
					this.appendInclude(dom, rootNode, arr[x], idList[z]);
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
			this.appendInclude(dom, rootNode, arr[x], id);
			x++;
		}
	},


	// appends a clone of an element into another node
	appendInclude: function(dom, rootNode, node, id){
		var include,
			clone;

		if(id && utils.isValidHTMLID(id)){

			id = utils.trim(id);

			// if it does not started with a hash split it
			if(id.indexOf('#') > -1 && !utils.startWith(id, '#')){
				id = id.split('#')[1];
			}else{
				id = id.replace('#', '');
			}

			include = dom(rootNode).find('#' + id);
			if(include) {
				// issue with dupes
				if(include.length){
					include = include[0];
				}
				clone = domUtils.clone(dom, include);
				this.markIncludeChildren(dom, clone);
				domUtils.appendChild(dom, node, clone);
			}
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


exports.Parser = Parser;
exports.parseUrl = parseUrl;
exports.parseHtml = parseHtml;
exports.parseDom = parseDom;
exports.version = version;

