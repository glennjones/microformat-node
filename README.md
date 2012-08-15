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
    ]

