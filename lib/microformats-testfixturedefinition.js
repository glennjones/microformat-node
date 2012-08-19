/*! 
test-fixture
Copyright (C) 2012 Glenn Jones. All Rights Reserved.
License: http://microformatshiv.com/license/ 
Version 0.2
*/

/* 
This definition has not been test to see if it fully conforms to the wiki specification
*/


if (ufShiv) {

    // Keep out of global scope
    (function () {


        var testSuite = {
            className: "test-suite",
            properties: {
                test: {
                   subproperties: {
                        url: {
                            datatype: "anyURI"
                        },
                        format: {},
                        description: {}
                   },
                   plural: true
                }
            }
        };
        ufShiv.add("test-suite", testSuite);



        var testFixture = {
            className: "test-fixture",
            properties: {
                "summary":{},
                "description":{},
                "format":{},
                "author": {
                    datatype: "microformat",
                    microformat: "hCard"
                 },
                "output" :{
                     subproperties: {
                        "type": {
                            types: ['JSON','XML']
                        }, 
                        "value":{},
                    },
                    plural: true
                },
                "assert":{
                    subproperties: {
                        "test":{},
                        "result":{},
                        "comment":{}
                    },
                    plural: true
                },
                "history": {
                    datatype: "microformat",
                    microformat: "hCalendar",
                    plural: true
                 },
            }
        };
        ufShiv.add("test-fixture", testFixture);


    })();
}
