# About

This demo is a static file server which implements the node-ufshiv microformats
parser module.

#### Querying methods.

Start the server binary and provide the url of the web page use wish to parse for microformats. 
You also need to provide the formats you wish to parse as a single value or a comma delimited list 
E.g.

    GET http://localhost:8888/?url=http%3A%2F%2Fufxtract.com%2Ftestsuite%2Fhcard%2Fhcard1.htm&format=hCard

#### Supported formats

Currently ufshiv supports the following formats: hCard, XFN, hReview, hCalendar, hAtom, hResume, geo, adr and tag.
Its important to use the right case when specifying the format query string parameter.


#### Response 

This will return a bit of JSON

    [
        {
            "url": "http://premasagar.com",
            "title": "Premasagar :: Home :: <remixing bits of stuff & things />",
            "favicon": "http://premasagar.com/favicon.ico"
        },
        {
            "url": "http://twitter.com/premasagar",
            "title": "Premasagar Rose (@premasagar) on Twitter",
            "favicon": "http://a0.twimg.com/a/1340420023/images/favicon.ico"
        },
        ...
    ]

