/*
   DOM Utilities
   Copyright (C) 2010 - 2024 Glenn Jones. All Rights Reserved.
   MIT License: https://raw.github.com/glennjones/microformat-node/master/license.txt

   */


var Modules = (function (modules) {

	modules.domUtils = {


		// load blank cheerio object;
		$: cheerio.load('<html></html>',{decodeEntities: false}, false),


		/**
		 * configures what are the base DOM objects for parsing
		 *
		 * @param  {Object} options
		 * @return {DOM Node} node
		 */
		getDOMContext: function( options ){
			var rootNode;

			// if html is passed in options use it
			if(options.html){
				this.$ = cheerio.load(options.html,{decodeEntities: false}, false);
				return {document: this.$.root(), rootNode: this.$.root()[0]};
			}

			// if a cheerio document object is passed
			if(options.node){
				this.$ = options.node;
				return {document: this.$.root(), rootNode: this.$.root()[0]};
			}

			return {document: null, rootNode: null};
		},


		/**
		* gets the first DOM node from cheerio - no support for nodeType yet
		*
		* @param  {Dom Document}
		* @return {DOM Node} node
		*/
		getTopMostNode: function( node ){
			// convert top level cheerio object to DOM root i.e. document object
			if(node && modules.utils.isFunction(node.root)){
				node = node.root()[0];
			}
			// convert cheerio DOM root i.e. document object to first node object
			if( !node.type || node.type === 'root' && node.firstChild ){
				node.firstChild.parentNode = node;
				return node.firstChild;
			}else{
				return node;
			}
		},


		/**
		* abstracts DOM ownerDocument
		*
		* @param  {DOM Node} node
		* @return {Dom Document}
		*/
		ownerDocument: function(node){
			if(node && modules.utils.isFunction(node.root)){
				return node.root;
			}
		},


		/**
		* abstracts DOM textContent
		*
		* @param  {DOM Node} node
		* @return {String}
		*/
		textContent: function(node){
			return ent.decode( this.$(node).text().replace(/[\r]+/g, '') );
		},


		/**
		* abstracts DOM innerHTML
		*
		* @param  {DOM Node} node
		* @return {String}
		*/
		innerHTML: function(node){
			return this.$(node).html().replace(/[\r]+/g, '');
		},


		/**
			* abstracts DOM hasAttribute
			*
			* @param  {DOM Node} node
			* @param  {String} attributeName
			* @return {Boolean}
			*/
		hasAttribute: function(node, attributeName) {
			return(this.$(node).attr(attributeName) !== undefined) ? true : false;
		},


		/**
		* does an attribute contain a value
		*
		* @param  {DOM Node} node
		* @param  {String} attributeName
		* @param  {String} value
		* @return {Boolean}
		*/
		hasAttributeValue: function(node, attributeName, value) {
			var attList = this.getAttributeList(node, attributeName);
			return (attList.indexOf(value) > -1);
		},


		/**
		* abstracts DOM getAttribute
		*
		* @param  {DOM Node} node
		* @param  {String} attributeName
		* @return {String || null}
		*/
		getAttribute: function(node, attributeName) {
			var value = this.$(node).attr(attributeName);
			return value ? ent.decode(value) : value;
		},


		/**
		* abstracts DOM setAttribute
		*
		* @param  {DOM Node} node
		* @param  {String} attributeName
		* @param  {String} attributeValue
		*/
		setAttribute: function(node, attributeName, value) {
			return this.$(node).attr(attributeName, value);
		},


		/**
		* abstracts DOM removeAttribute
		*
		* @param  {DOM Node} node
		* @param  {String} attributeName
		*/
		removeAttribute: function(node, attributeName) {
			return this.$(node).removeAttr(attributeName);
		},


		/**
		* abstracts DOM getElementById
		*
		* @param  {DOM Node || DOM Document} node
		* @param  {String} id
		* @return {DOM Node}
		*/
		getElementById: function(docNode, id) {
			return this.$(docNode).find('#' + id);
		},


		/**
		* abstracts DOM querySelector
		*
		* @param  {DOM Node || DOM Document} node
		* @param  {String} selector
		* @return {DOM Node}
		*/
		querySelector: function(docNode, selector) {
			return this.$(docNode).find( selector );
		},


		/**
		* get value of an Node attribute as an Array
		*
		* @param  {DOM Node} node
		* @param  {String} attributeName
		* @return {Array}
		*/
		getAttributeList: function(node, attributeName) {
			var out = [],
				attList;

			attList = this.getAttribute(node, attributeName);
			if(attList && attList !== '') {
				if(attList.indexOf(' ') > -1) {
					out = attList.split(' ');
				} else {
					out.push(attList);
				}
			}
			return out;
		},



		/**
		* gets all child nodes with a given attribute
		*
		* @param  {DOM Node} node
		* @param  {String} attributeName
		* @return {NodeList}
		*/
		getNodesByAttribute: function(node, attributeName) {
			var selector = '[' + attributeName + ']';
			return this.$(node).find(selector);
		},


		/**
		* gets all child nodes with a given attribute containing a given value
		*
		* @param  {DOM Node} node
		* @param  {String} attributeName
		* @return {DOM NodeList}
		*/
		getNodesByAttributeValue: function(rootNode, name, value) {
			var arr = [],
				x = 0,
				i,
				out = [];

			arr = this.getNodesByAttribute(rootNode, name);
			if(arr) {
				i = arr.length;
				while(x < i) {
					if(this.hasAttributeValue(arr[x], name, value)) {
						out.push(arr[x]);
					}
					x++;
				}
			}
			return out;
		},


		/**
		* gets attribute value from controlled list of tags
		*
		* @param  {Array} tagNames
		* @param  {String} attributeName
		* @return {String || null}
		*/
		getAttrValFromTagList: function(node, tagNames, attributeName) {
			var i = tagNames.length;

			while(i--) {
				if(node.tagName.toLowerCase() === tagNames[i]) {
					if (this.hasAttribute(node, attributeName))
						return this.getAttribute(node, attributeName);
				}
			}
			return null;
		},

		/**
		* get node if has no siblings CSS :only-child
		*
		* @param  {DOM Node} rootNode
		* @param  {Array} tagNames
		* @return {DOM Node || null}
		*/
		getSingleDescendant: function(node){
			return this.getDescendant( node, null, false );
		},


		/**
		* get node if has no siblings of the same type  i.e. CSS :only-of-type
		*
		* @param  {DOM Node} rootNode
		* @param  {Array} tagNames
		* @return {DOM Node || null}
		*/
		getSingleDescendantOfType: function(node, tagNames){
			return this.getDescendant( node, tagNames, true );
		},


		/**
		* get child node limited by presents of siblings - either CSS :only-of-type || :only-child
		*
		* @param  {DOM Node} rootNode
		* @param  {Array} tagNames
		* @return {DOM Node || null}
		*/
		getDescendant: function( node, tagNames, onlyOfType ){

			var children = this.getChildren( node ),
				i = children.length,
				countAll = 0,
				countOfType = 0,
				child,
				out = null;

			while(i--) {
				child = children[i];
				if(child.nodeType === 1) {
					if(tagNames){
						// count just only-of-type
						if(this.hasTagName(child, tagNames)){
							out = child;
							countOfType++;
						}
					}else{
						// count all elements
						out = child;
						countAll++;
					}
				}
			}
			if(onlyOfType === true){
				return (countOfType === 1)? out : null;
			}else{
				return (countAll === 1)? out : null;
			}

		},


		/**
		* is a node one of a list of tags
		*
		* @param  {DOM Node} rootNode
		* @param  {Array} tagNames
		* @return {Boolean}
		*/
		hasTagName: function(node, tagNames){
			var i = tagNames.length;
			while(i--) {
				if(node.name === tagNames[i]) {
					return true;
				}
			}
			return false;
		},


	/**
		* abstracts DOM appendChild
		*
		* @param  {DOM Node} node
		* @param  {DOM Node} childNode
		* @return {DOM Node}
		*/
		appendChild: function(node, childNode){
			this.$(node).append(childNode);
		},


		/**
		* abstracts DOM removeChild
		*
		* @param  {DOM Node} childNode
		* @return {DOM Node || null}
		*/
		removeChild: function(childNode){
			this.$(childNode).remove();
		},


		/**
		* abstracts DOM cloneNode
		*
		* @param  {DOM Node} node
		* @return {DOM Node}
		*/
		clone: function(node) {
			var newNode = this.$(node).clone();
			newNode.removeAttr('id');
			return newNode;
		},


		/**
		 * removes all the descendant tags by name
		 *
		 * @param  {DOM Node} node
		 * @param  {Array} tagNames
		 * @return {DOM Node}
		 */
		removeDescendantsByTagName: function(node, tagNames) {
			for (var i = 0; i < tagNames.length; i++) {
				this.$(node).find(tagNames[i]).remove();
			}
			return node;
		},



		/**
		* gets the text of a node
		*
		* @param  {DOM Node} node
		* @return {String}
		*/
		getElementText: function( node ){
			return this.$(node).text().replace(/[\r]+/g, '');
		},

		/**
		* gets the attributes of a node - ordered by sequence in html
		*
		* @param  {DOM Node} node
		* @return {Array}
		*/
		getOrderedAttributes: function( node ){
			var attrs = [];
			// as cheerio keeps order we only need to convert to an array
			for (var attr in node.attribs) {
				if(node.attribs[attr] !== undefined){
					attrs.push( {'name': attr, 'value': node.attribs[attr]} );
				}
			}
			return attrs;
		},


		/**
		* decodes html entities in given text
		*
		* @param  {DOM Document} doc
		* @param  String} text
		* @return {String}
		*/
		decodeEntities: function( doc, text ){
			return text;
		},


		/**
		* clones a DOM document
		*
		* @param  {DOM Document} document
		* @return {DOM Document}
		*/
		cloneDocument: function( document ){
			return document;
		},


		/**
		* can environment clones a DOM document
		*
		* @param  {DOM Document} document
		* @return {Boolean}
		*/
		canCloneDocument: function( document ){
			return false; // we have no need to clone
		},


		/**
		* get a node's child index used to create node path
		*
		*   @param  {DOM Node} node
		*   @return {Int}
		*/
		getChildIndex: function (node) {
			var parent = node.parentNode,
				i = -1,
				child;
			while (parent && (child = parent.childNodes[++i])){
					if (child === node){
						return i;
					}
			}
			return -1;
		},


		/**
		* get a node's path
		*
		*   @param  {DOM Node} node
		*   @return {Array}
		*/
		getNodePath: function  (node) {
			var parent = node.parentNode,
				path = [],
				index = this.getChildIndex(node);

			if(parent && (path = this.getNodePath(parent))){
				if(index > -1){
					path.push(index);
				}
			}
			return path;
		},


		/**
		* get a node from a path.
		*
		*   @param  {DOM document} document
		*   @param  {Array} path
		*   @return {DOM Node}
		*/
		getNodeByPath: function (document, path) {
			var node = document.documentElement,
				i = 0,
				index;
			while ((index = path[++i]) > -1){
				node = node.childNodes[index];
			}
			return node;
		},


		/**
		* get an array of child nodes
		*
		*   @param  {DOM node} node
		*   @return {Array}
		*/
		getChildren: function( node ){
			var out = [];
			this.$(node).children().each(function(i, child) {
				out.push( child );
			});
			return out;
		},


		/**
		* create a node
		*
		*   @param  {String} tagName
		*   @return {DOM node}
		*/
		createNode: function( tagName ){
			return cheerio.load( '<' + tagName + '></' + tagName + '>',{decodeEntities: false}, false ).root()[0].children[0];
		},


		/**
		* create a node with passed text content
		*
		*   @param  {String} tagName
		*   @param  {String} text
		*   @return {DOM node}
		*/
		createNodeWithText: function( tagName, text ){
			return cheerio.load( '<' + tagName + '>' + text + '</' + tagName + '>',{decodeEntities: false}, false ).root()[0].children[0];
		}



	};

	return modules;

} (Modules || {}));



