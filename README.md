# microformat-node

A microformat parsing for node.js. 


## Install

    npm install microformat-node

or

    git clone http://github.com/glennjones/microformat-node.git
    cd microformat-node
    npm link


#### Use

with URL

    var shiv = require("microformat-node");

    shiv.parseUrl('http://glennjones.net/about', {}, function(data){
        // do something with data
    });


or with raw html

    var shiv = require('microformat-node');

    var html = '<p class="vcard"><a class="fn url" href="http://glennjones.net">Glenn Jones</a></p>';
    shiv.parseHtml(html, {}, function(data){
        // do something with data
    });

with URL for a single format

    var shiv = require("microformat-node");

    shiv.parseUrl('http://glennjones.net/about', {'format': 'XFN'}, function(data){
        // do something with data
    });


#### Supported formats

Currently microformat-node supports the following formats: hCard, XFN, hReview, hCalendar, 
hAtom, hResume, geo, adr and tag. Its important to use the right case when specifying the format 
query string parameter.


#### Response 

This will return JSON. This is example of two geo microformats found in page.

    
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
            "name": "Microformat Shiv",
            "version": "0.2.4",
            "page-title": "geo 1 - extracting singular and paired values test",
            "time": "-140ms",
            "page-http-status": 200,
            "page-url": "http://ufxtract.com/testsuite/geo/geo1.htm"
        }
    }
    


#### Querying demo server.

Start the server binary:

    $ bin/microformat-node

Then visit the server URL

    http://localhost:8888/

#### Using the server API    

You need to provide the url of the web page use wish to parse and the format(s) you wish to parse 
as a single value or a comma delimited list: 


    GET http://localhost:8888/?url=http%3A%2F%2Fufxtract.com%2Ftestsuite%2Fhcard%2Fhcard1.htm&format=hCard

You can also use the hash # fragment element of a url to target an only part of a HTML page. 
The hash is used to target the HTML element with the same id. 

#### Viewing the unit tests

The module inculdes a page which runs the ufxtract microfomats unit test suite. 

http://localhost:8888/unit-tests/


## Notes for Windows install.

microformat-node using a module called 'jsdom' which in turn uses 'contextify' that requires native code build.

There are a couple of things you normally need to do to compile node code on Windows.

1. Install python 2.6 or 2.7, the build scripts use it.
2. Run npm inside a Visual Studio shell, so for me,
     Start->Programs->Microsoft Visual Studio 2010->Visual Studio
Tools->Visual Studio Command Prompt

If you have the standard release of node it will probably be x86 rather
than x64, for x64 there is a different Visual Studio shell but usally in same
place.
