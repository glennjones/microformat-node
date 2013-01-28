# microformat-node

microformat-node is a microformat parser built node.js. The library can parse both version 1 and 2 microformats of the specification It is built using a well tested and fast parsing engine. It can parse the following microformats:


h-adr, h-card, h-entry, h-event, h-geo, h-news, h-product, h-recipe, h-resume, h-review-aggregate, h-review, adr, hCard, hEntry, hEvent, geo, hNews hProduct, hRecipe, hResume, hReview-aggregate, hReview, rel=tag, rel=licence, rel=no-follow and XFN


Demo API - [http://microformat-node2.jit.su/](http://microformat-node2.jit.su/)


### Install

    npm install microformat-node

or

    git clone http://github.com/glennjones/microformat-node.git
    cd microformat-node
    npm link


### Use

#### using a callback

    var microformats = require("microformat-node"),
        options = {};

    microformats.parseUrl('http://glennjones.net/about', options, function(err, data){
        // do something with data
    });


#### using a promise

    var microformats = require("microformat-node"),
        options = {};

    microformats.parseUrl('http://glennjones.net/about', options)
        .then(
            function (data) {
               // do something with data
            },
            function (error) {
               // do something with error
            }
        )

### Main parse function

#### parseUrl()

    var microformats = require("microformat-node"),
        options = {};

    microformats.parseUrl('http://glennjones.net/about', options, function(err, data){
        // do something with data
    });

#### parseHtml()

    var microformats = require("microformat-node"),
        options = {};

    var html = '<p class="vcard"><a class="fn url" href="http://glennjones.net">Glenn Jones</a></p>';
    microformats.parseHtml(html, options, function(err, data){
        // do something with data
    });


#### parseDom()
This function takes a [Cheerio](https://github.com/MatthewMueller/cheerio) DOM and node objects.

    var microformats = require("microformat-node"),
        options = {};

    microformats.parseHtml(dom, node, options function(err, data){
        // do something with data
    });


### Parsing options 

#### Example use of options
    var microformats = require("microformat-node"),
        options = {'formats': 'h-card'};

    microformats.parseUrl('http://glennjones.net/about', options, function(err, data){
        // do something with data
    });

#### Available options

*  __filters__ - An array of formats to filter the output by ie ['h-card']. - default is empty which displays all formats.
*  __version1__ - Whether the output should contain version microformats. - default is true
*  __rel__ - Whether the output should contain rel=*. - default is true 
*  __children__ - Whether the output should contain children. - default is true
*  __childrenRel__ - Whether the output should contain child rel=* microformats. - default is false 
*  __textFormat__ - (default is normalised) plain text output style 'normalised' or 'whitespace'
*  __cacheTimeLimit__ - The amount of time, in milliseconds, that a web pages is kept in the cache before been discarded. - default is 3600000 ie 1 hour
*  __cacheItemLimit__ - The maximum number of items that can be kept in the cache before the oldest items are discarded. Use to limit memory. - default is 1000
*  __useCache__ - Whether a request should use the cache during a request. - default is false
*  __logLevel__ - There are 4 levels of logging: 4 - log, 3 - info, 2 - warn and 1 - error. The 4 setting gives the most granular logs, which are useful in a debugging scenario. Default: 3 (default is 4) 
*  __logger__ - An object containing the Logger interface which can overridden.
*  __cache__ - An object containing the Cache interface which can overridden.


### Response 

Typical JSON. This is an example of a h-card microformat found in a page.

    
    {
        "items": [{
            "type": ["h-card"],
             "properties": {
                "url": ["http://blog.lizardwrangler.com/"],
                "name": ["Mitchell Baker"],
                "org": ["Mozilla Foundation"],
                "note": ["Mitchell is responsible for setting the direction Mozilla ..."],
                "category": ["Strategy", "Leadership"]
             }
        }]
    }
  

### Querying demo server

Start the server binary:

    $ bin/microformat-node

Then visit the server URL

    http://localhost:8888/


### Using the server API    

You need to provide the url of the web page:

    GET http://localhost:8888/?url=http%3A%2F%2Flocalhost%3A8888%2Ftest%2F

### Viewing the unit tests

The module inculdes a page which runs the microfomats 2 test suite. 

    http://localhost:8888/test/mocha-v1.html
    http://localhost:8888/test/mocha-v2.html



### Support or Contact

Having trouble with microformat-node? Please raise an issue at: https://github.com/glennjones/microformat-node/issues


### License

The project is open sourced under MIT licenses. See the [license.txt](https://raw.github.com/glennjones/microformat-node/master/license.txt "license.txt") file within the project source.

