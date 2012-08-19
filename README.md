# node-microformat-shiv

A microformat parsing for node.js. 


## Install

    npm install node-microformat-shiv

or

    git clone http://github.com/glennjones/node-microformat-shiv.git
    cd node-microformat-shiv
    npm link


#### Use

with URL

    var shiv = require("node-microformat-shiv");

    shiv.parseUrl('http://glennjones.net/about', {}, function(data){
        // do something with data
    });


or with raw html

    var shiv = require('node-microformat-shiv');

    var html = '<p class="vcard"><a class="fn url" href="http://glennjones.net">Glenn Jones</a></p>';
    shiv.parseHtml(html, {}, function(data){
        // do something with data
    });

with URL for a single format

    var shiv = require("node-microformat-shiv");

    shiv.parseUrl('http://glennjones.net/about', {'format': 'XFN'}, function(data){
        // do something with data
    });


#### Supported formats

Currently node-microformat-shiv supports the following formats: hCard, XFN, hReview, hCalendar, 
hAtom, hResume, geo, adr and tag. Its important to use the right case when specifying the format 
query string parameter.


#### Response 

This will return a bit of JSON

    
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

    $ bin/node-microformat-shiv

Then visit the server URL

    http://localhost:8888/

#### Using the server API    

You need to provide the url of the web page use wish to parse and the format(s) you wish to parse 
as a single value or a comma delimited list: 


    GET http://localhost:8888/?url=http%3A%2F%2Fufxtract.com%2Ftestsuite%2Fhcard%2Fhcard1.htm&format=hCard

You can also use the hash # fragment element of a url to target an only part of a HTML page. 
The hash is used to target the HTML element with the same id. 


#### Notes for Windows install.

node-microformat-shiv using a module called 'jsdom' which in turn uses 'contextify' that requires native code build.

There are a couple of things you normally need to do to compile node code on Windows.

1. Install python 2.6 or 2.7, the build scripts use it.
2. Run npm inside a Visual Studio shell, so for me,
     Start->Programs->Microsoft Visual Studio 2010->Visual Studio
Tools->Visual Studio Command Prompt

If you have the standard release of node it will probably be x86 rather
than x64, for x64 there is a different Visual Studio shell but usally in same
place.
