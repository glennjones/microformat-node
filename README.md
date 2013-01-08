# microformat-node

microformat-node is a microformat parser for node.js. It is built using a well tested light-weight JavaScript parsing engine, which already powers a number of browser extensions. It currently supports the following formats: hCard, XFN, hReview, hCalendar, hAtom, hResume, geo, adr and tag.


Demo API - http://microformat-node.jit.su/


### Install

    npm install microformat-node

or

    git clone http://github.com/glennjones/microformat-node.git
    cd microformat-node
    npm link


### Use

with URL

    var microformats = require("microformat-node");

    microformats.parseUrl('http://glennjones.net/about', function(err, data){
        // do something with data
    });


with URL using a promise

    var microformats = require("microformat-node");

    microformats.parseUrl('http://glennjones.net/about').then(function (err, data) {
        // do something with data
    });


or with raw html

    var microformats = require('microformat-node');

    var html = '<p class="vcard"><a class="fn url" href="http://glennjones.net">Glenn Jones</a></p>';
    shiv.parseHtml(html, function(err, data){
        // do something with data
    });


with URL with an options object defining the formats to parse ie 'hCard';

    var microformats = require("microformat-node");

    microformats.parseUrl('http://glennjones.net/about', {'format': 'hCard'}, function(err, data){
        // do something with data
    });


### Options  object for 'parseUrl' and 'parseHtml'

There are two properties for the parse methods the first is 'formats' which takes a comma delimit string of the microformats. The default setting for formats' is the full list of formats the parser can parse.

The 'useCache' causes the parser to cache the html across requests. The default cache saves in memory and limited to an hour and 1000 items.  


### Supported formats

Currently microformat-node supports the following formats: hCard, XFN, hReview, hCalendar, hAtom, hResume, geo, adr and tag. It's important to use the right case when specifying the formats query string parameter.


### Response 

This will return JSON. This is an example of two geo microformats found in a page.

    
    {
        "microformats": {
            "geo": [{
                "latitude": 37.77,
                "longitude": -122.41
            }, {
                "latitude": 37.77,
                "longitude": -122.41
            }]
        },
        "parser-information": {
            "name": "Microformat Node",
            "version": "0.3.0",
            "page-title": "geo 1 - extracting singular and paired values test",
            "time": "140ms",
            "page-http-status": 200,
            "page-url": "http://ufxtract.com/testsuite/geo/geo1.htm"
        }
    }
  

### Options for whole parser

    var microformats = require("microformat-node");
    
    microformats.setParserOptions({
        logLevel: 3,
        cacheTimeLimit: 3600000, 
        cacheItemLimit: 1000,
        useCache: false,
        formats: 'hCard,XFN,hReview,hCalendar,hAtom,hResume,geo,adr,tag',
        cache: { object containing the cache interface },
        logger: { object containing the logger interface }
    });
    
* logLevel - (int 0-4) set the level at which the parser logs events
* cacheTimeLimit - (int) the amount of time items are keep in the cache for before they are discarded. The time is set in milliseconds.
* cacheItemLimit - (int) the number of items to keep in cache before some are discarded
* useCache - (boolean) weather a parse should use the HTML cache. 
* formats - (string) a comma delimited list of formats to parse. 
* cache - (object) an object containing an interface described in the Custom cache section of the this document.
* logger - (object) an object containing an interface described in the Custom logger section of the this document. 


### Querying demo server

Start the server binary:

    $ bin/microformat-node

Then visit the server URL

    http://localhost:8888/


### Using the server API    

You need to provide the url of the web page and the format(s) you wish to parse as a single value or a comma delimited list:

    GET http://localhost:8888/?url=http%3A%2F%2Fufxtract.com%2Ftestsuite%2Fhcard%2Fhcard1.htm&format=hCard

You can also use the hash # fragment element of a url to target only part of a HTML page. The hash is used to target the HTML element with the same id. 


### Viewing the unit tests

The module inculdes a page which runs the ufxtract microfomats unit test suite. 

    http://localhost:8888/unittests/auto/


## Custom cache

microformats-node use an in-memory cache to store the HTML of web pages.

The options object contains a property called `cacheTimeLimit` that can be used to set the cache refresh time. By default, this is 3600000ms. The number of items stored in the cache can be limited using the options property `cacheItemLimit`. By default, the cache is limited to 1000 items. The 'useCache' property of options object is set to false by default.

You can replace the cache with your own, for example, to store the cached date in a database or file system. To add you own custom cache, all you need to do is provide an object containing the following interface:

    {
        function get (url) {
            // add code to get data
            returns data
        }

        function has(url) {
            // add code to check your data store
            returns true or false
        }

        function fetch (url, callback) {
            // add code to return data
            fires callback(null, data);
        }

        function set(url, data) {
            // add code to store data
            returns object
        }
    }

and then add this interface as the `cache` property of the options object passed into the `parseUrl()` or `parseHtml()` methods.


### Custom logger

Elsewhere use a simple logging system that writes to Node's console. You can replace the logger with your own, for example, to store warnings and errors in a database or log file. To add your own custom logger, all you need to do is provide an object contain the following interface:

    {
        function info (message) { /* code to pass on message */ }
        function log  (message) { /* code to pass on message */ }
        function warn (message) { /* code to pass on message */ }
        function error(message) { /* code to pass on message */ }
    }

and then add this interface to the `logger` property of the options object passed into the `parseUrl()` or `parseHtml()` methods.



### Support or Contact

Having trouble with microformat-node? Please raise an issue at: https://github.com/glennjones/microformat-node/issues


### License

The project is open sourced under MIT licenses. See the [license.txt](https://raw.github.com/glennjones/microformat-node/master/license.txt "license.txt") file within the project source.
