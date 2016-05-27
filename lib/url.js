/*
   url
   Where possible use the modern window.URL API if its not available use the DOMParser method.

   Copyright (C) 2010 - 2015 Glenn Jones. All Rights Reserved.
   MIT License: https://raw.github.com/glennjones/microformat-shiv/master/license.txt
*/

var Modules = (function (modules) {


	modules.url = {


		/**
		 * not needed from node version
		 */
        init: function(){
        },


		/**
		 * resolves url to absolute version using baseUrl
		 *
		 * @param  {String} url
		 * @param  {String} baseUrl
		 * @return {String}
		 */
		resolve: function(url, baseUrl) {
			// use modern URL web API where we can
			if(modules.utils.isString(url) && modules.utils.isString(baseUrl) && url.indexOf('://') === -1){
                return urlParser.resolve(baseUrl, url);
			}else{
				if(modules.utils.isString(url)){
					return url;
				}
				return '';
			}
		},

	};

	return modules;

} (Modules || {}));
