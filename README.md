# microformat-node

microformat-node is a [microformats 2](http://microformats.org/wiki/microformats-2) parser built for node.js. The library can parse both versions 1 and 2 of microformats. It is built using a thoroughly tested and fast parsing engine.

Demo API - [http://glennjones.net/tools/microformats/](http://glennjones.net/tools/microformats/)

### Supported formats
h-adr, h-card, h-entry, h-event, h-geo, h-news, h-product, h-recipe, h-resume, h-review-aggregate, h-review, adr, hCard, hEntry, hEvent, geo, hNews hProduct, hRecipe, hResume, hReview-aggregate, hReview, rel=tag, rel=licence, rel=no-follow, rel=author and XFN

[![build status](https://secure.travis-ci.org/glennjones/microformat-node.png)](http://travis-ci.org/glennjones/microformat-node)


### Install
```bash
    npm install microformat-node
```    

### Use

#### using a callback
```javascript
    var microformats = require("microformat-node"),
        options = {};

    microformats.parseUrl('http://glennjones.net/about', options, function(err, data){
        // do something with data
    });
```

#### using a promise
```javascript
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
```
### Main parse function

#### parseUrl()
```javascript
    var microformats = require("microformat-node"),
        options = {};

    microformats.parseUrl('http://glennjones.net/about', options, function(err, data){
        // do something with data
    });
```
#### parseHtml()
```javascript
    var microformats = require("microformat-node"),
        options = {};

    var html = '<p class="vcard"><a class="fn url" href="http://glennjones.net">Glenn Jones</a></p>';
    microformats.parseHtml(html, options, function(err, data){
        // do something with data
    });
```

#### parseDom()
This function takes both a [Cheerio](https://github.com/MatthewMueller/cheerio) DOM and node object.
```javascript
    var microformats = require("microformat-node"),
        options = {};

    microformats.parseDom(dom, node, options function(err, data){
        // do something with data
    });
```

### Parsing options 

#### Example use of options
```javascript
    var microformats = require("microformat-node"),
        options = {'dateFormat': 'HTML5'};

    microformats.parseUrl('http://glennjones.net/about', options, function(err, data){
        // do something with data
    });
```

#### Available options
* `baseUrl` - this is used to revolve any relative URLs in the output
* `textFormat` - (string) plain text output style: `normalised`, `whitespace` or `whitespacetrimmed`. The default is `whitespacetrimmed`
* `dateFormat` - (string) ISO date profiles used in output text output style `auto`, `W3C`, `RFC3339`, `HTML`. The profile `auto` outputs the date as authored. The default is `auto`



### Response 

__Version 0.2.x upwards a was a complete rewrite of microformat-node to conform to the new version 2 specification of microformats. If you used the older 0.1.x versions of microformat-node you will find the JSON output has changed Version 0.3.x has addtional rel-url collection and some modification to the normalisation of text whitespace and ISO date structures .__

Typical data structure. This is an example of a h-card microformat.

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
        "rels": {},
        "rel-urls": {}
    }

Typical error structure. 

    {
        "errors": [{
                "error": "Error: Invalid protocol - xhttp://microformats.org/"
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
    

### Mocha test
The project has a number of test taken from [microfomats 2 test suite](https://github.com/microformats/tests). To run the test within the project type the following command.
```bash
$ mocha --reporter list
```
If you are considering sending a pull request please add tests for the functionality you add or change.

### Support or Contact

Having trouble, please raise an issue at: [https://github.com/glennjones/microformat-node/issues](https://github.com/glennjones/microformat-node/issues)


### License

The project is open sourced under MIT license. See the [license.txt](https://raw.github.com/glennjones/microformat-node/master/license.txt "license.txt") file within the project source.