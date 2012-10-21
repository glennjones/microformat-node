/*
ufdefinitions.js
A compact JavaScript cross browser microformats parser by Glenn Jones. Based
on the Mozilla Labs Operator microformats parser created by Michael Kaply
Copyright (C) 2010 Glenn Jones. All Rights Reserved.
Open License: https://raw.github.com/glennjones/microformat-node/master/license.txt
*/


var adr = {
    className: "adr",
    properties: {
        "type": {
            plural: true,
            values: ["work", "home", "pref", "postal", "dom", "intl", "parcel", "dom"]
        },
        "post-office-box": {},
        "street-address": {
            plural: true
        },
        "extended-address": {
            plural: true
        },
        "locality": {},
        "region": {},
        "postal-code": {},
        "country-name": {}
    }
};



var hcard = {
    className: "vcard",
    properties: {
        "adr": {
            plural: true,
            datatype: "microformat",
            microformat: "adr"
        },
        "agent": {
            plural: true,
            datatype: "microformat",
            microformat: "hCard"
        },
        "bday": {
            datatype: "dateTime"
        },
        "class": {},
        "category": {
            plural: true,
            datatype: "microformat",
            microformat: "tag",
            microformat_property: "tag"
        },
        "email": {
            subproperties: {
                "type": {
                    plural: true,
                    values: ["internet", "x400", "pref"]
                },
                "value": {
                    datatype: "email",
                    virtual: true
                }
            },
            plural: true
        },
        "fn": {
            virtual: true,
            virtualGetter: function (context, mfnode) {
                // Changed to DOM based query - Glenn Jones 
                if (context) {
                    if (context.getTextContent) {
                        var givenName = context.getElementsByClassName(mfnode, "given-name");
                        var additionalName = context.getElementsByClassName(mfnode, "additional-name");
                        var familyName = context.getElementsByClassName(mfnode, "family-name");
                        var fn = '';

                        if (context.getTextContent(givenName) != undefined)
                            fn += givenName + ' ';

                        if (context.getTextContent(additionalName) != undefined)
                            fn += additionalName + ' ';

                        if (context.getTextContent(familyName) != undefined)
                            fn += familyName + ' ';
                    }
                }
            }
        },
        "geo": {
            datatype: "microformat",
            microformat: "geo"
        },
        "key": {
            plural: true
        },
        "label": {
            plural: true
        },
        "logo": {
            plural: true,
            datatype: "anyURI"
        },
        "mailer": {
            plural: true
        },
        "n": {
            subproperties: {
                "honorific-prefix": {
                    plural: true
                },
                "given-name": {
                    plural: true
                },
                "additional-name": {
                    plural: true
                },
                "family-name": {
                    plural: true
                },
                "honorific-suffix": {
                    plural: true
                }
            },
            virtual: true,
            // Implied "n" Optimization 
            // http://microformats.org/wiki/hcard#Implied_.22n.22_Optimization 
            virtualGetter: function (context, mfnode) {
                var fn = context.getMicroformatProperty(mfnode, "hCard", "fn");
                var orgs = context.getMicroformatProperty(mfnode, "hCard", "org");
                var given_name = [];
                var family_name = [];
                if (fn && (!orgs || (orgs.length > 1) || (fn != orgs[0]["organization-name"]))) {
                    var fns = fn.split(" ");
                    if (fns.length === 2) {
                        if (fns[0].charAt(fns[0].length - 1) == ',') {
                            given_name[0] = fns[1];
                            family_name[0] = fns[0].substr(0, fns[0].length - 1);
                        } else if (fns[1].length == 1) {
                            given_name[0] = fns[1];
                            family_name[0] = fns[0];
                        } else if ((fns[1].length == 2) && (fns[1].charAt(fns[1].length - 1) == '.')) {
                            given_name[0] = fns[1];
                            family_name[0] = fns[0];
                        } else {
                            given_name[0] = fns[0];
                            family_name[0] = fns[1];
                        }
                        return { "given-name": given_name, "family-name": family_name };
                    }
                }
                return undefined;
            }
        },
        "nickname": {
            plural: true,
            virtual: true,
            /* Implied "nickname" Optimization */
            /* http://microformats.org/wiki/hcard#Implied_.22nickname.22_Optimization */
            virtualGetter: function (context, mfnode) {
                var fn = context.getMicroformatProperty(mfnode, "hCard", "fn");
                var orgs = context.getMicroformatProperty(mfnode, "hCard", "org");
                var given_name;
                var family_name;
                if (fn && (!orgs || (orgs.length) > 1 || (fn != orgs[0]["organization-name"]))) {
                    var fns = fn.split(" ");
                    if (fns.length === 1) {
                        return [fns[0]];
                    }
                }
                return undefined;
            }
        },
        "note": {
            plural: true,
            datatype: "HTML"
        },
        "org": {
            subproperties: {
                "organization-name": {
                    virtual: true
                },
                "organization-unit": {
                    plural: true
                }
            },
            plural: true
        },
        "photo": {
            plural: true,
            datatype: "anyURI"
        },
        "rev": {
            datatype: "dateTime"
        },
        "role": {
            plural: true
        },
        "sequence": {},
        "sort-string": {},
        "sound": {
            plural: true
        },
        "title": {
            plural: true
        },
        "tel": {
            subproperties: {
                "type": {
                    plural: true,
                    values: ["msg", "home", "work", "pref", "voice", "fax", "cell", "video", "pager", "bbs", "modem", "car", "isdn", "pcs", "PCS"]
                },
                "value": {
                    datatype: "tel",
                    virtual: true
                }
            },
            plural: true
        },
        "tz": {},
        "uid": {
            datatype: "anyURI"
        },
        "url": {
            plural: true,
            datatype: "anyURI"
        }
    }
};



var hcalendar = {
    className: "vevent",
    properties: {
        "category": {
            plural: true,
            datatype: "microformat",
            microformat: "tag",
            microformat_property: "tag"
        },
        "class": {
            values: ["public", "private", "confidential"]
        },
        "description": {
            datatype: "HTML"
        },
        "dtstart": {
            datatype: "dateTime"
        },
        "dtend": {
            datatype: "dateTime",
            virtual: true,
            /* This will only be called in the virtual case */
            /* If we got here, we have a dtend time without date */
            virtualGetter: function (context, mfnode) {
                var dtends = context.getElementsByClassName(mfnode, "dtend");
                if (dtends.length === 0) {
                    return undefined;
                }
                var dtend = context.dateTimeGetter(dtends[0], mfnode, true);
                var dtstarts = context.getElementsByClassName(mfnode, "dtstart");
                if (dtstarts.length > 0) {
                    var dtstart = context.dateTimeGetter(dtstarts[0], mfnode);
                    if (dtstart.match("T")) {
                        return context.normalizeISO8601(dtstart.split("T")[0] + "T" + dtend);
                    }
                }
                return undefined;
            }
        },
        "dtstamp": {
            datatype: "dateTime"
        },
        "duration": {
        },
        "geo": {
            datatype: "microformat",
            microformat: "geo"
        },
        "location": {
            datatype: "microformat",
            microformat: "hCard"
        },
        "status": {
            values: ["tentative", "confirmed", "cancelled"]
        },
        "summary": {},
        "transp": {
            values: ["opaque", "transparent"]
        },
        "uid": {
            datatype: "anyURI"
        },
        "url": {
            datatype: "anyURI"
        },
        "last-modified": {
            datatype: "dateTime"
        },
        "rrule": {
            subproperties: {
                "interval": {
                    virtual: true,
                    /* This will only be called in the virtual case */
                    virtualGetter: function (context, mfnode, node) {
                        return context.hCalendar.properties.rrule.retrieve(context, node, "interval");
                    }
                },
                "freq": {
                    virtual: true,
                    /* This will only be called in the virtual case */
                    virtualGetter: function (context, mfnode, node) {
                        return context.hCalendar.properties.rrule.retrieve(context, node, "freq");
                    }
                },
                "bysecond": {
                    virtual: true,
                    /* This will only be called in the virtual case */
                    virtualGetter: function (context, mfnode, node) {
                        return context.hCalendar.properties.rrule.retrieve(context, node, "bysecond");
                    }
                },
                "byminute": {
                    virtual: true,
                    /* This will only be called in the virtual case */
                    virtualGetter: function (context, mfnode, node) {
                        return context.hCalendar.properties.rrule.retrieve(context, node, "byminute");
                    }
                },
                "byhour": {
                    virtual: true,
                    /* This will only be called in the virtual case */
                    virtualGetter: function (context, mfnode, node) {
                        return context.hCalendar.properties.rrule.retrieve(context, node, "byhour");
                    }
                },
                "bymonthday": {
                    virtual: true,
                    /* This will only be called in the virtual case */
                    virtualGetter: function (context, mfnode, node) {
                        return context.hCalendar.properties.rrule.retrieve(context, node, "bymonthday");
                    }
                },
                "byyearday": {
                    virtual: true,
                    /* This will only be called in the virtual case */
                    virtualGetter: function (context, mfnode, node) {
                        return context.hCalendar.properties.rrule.retrieve(context, node, "byyearday");
                    }
                },
                "byweekno": {
                    virtual: true,
                    /* This will only be called in the virtual case */
                    virtualGetter: function (context, mfnode, node) {
                        return context.hCalendar.properties.rrule.retrieve(context, node, "byweekno");
                    }
                },
                "bymonth": {
                    virtual: true,
                    /* This will only be called in the virtual case */
                    virtualGetter: function (context, mfnode, node) {
                        return context.hCalendar.properties.rrule.retrieve(context, node, "bymonth");
                    }
                },
                "byday": {
                    virtual: true,
                    /* This will only be called in the virtual case */
                    virtualGetter: function (context, mfnode, node) {
                        return context.hCalendar.properties.rrule.retrieve(context, node, "byday");
                    }
                },
                "until": {
                    virtual: true,
                    /* This will only be called in the virtual case */
                    virtualGetter: function (context, mfnode, node) {
                        return context.hCalendar.properties.rrule.retrieve(context, node, "until");
                    }
                },
                "count": {
                    virtual: true,
                    /* This will only be called in the virtual case */
                    virtualGetter: function (context, mfnode, node) {
                        return context.hCalendar.properties.rrule.retrieve(context, node, "count");
                    }
                }
            },
            retrieve: function (context, node, property) {
                var value = context.defaultGetter(node);
                var rrule;
                rrule = value.split(';');
                for (var i = 0; i < rrule.length; i++) {
                    if (rrule[i].match(property)) {
                        return rrule[i].split('=')[1];
                    }
                }
                return undefined;
            }
        }, 
        "rdate": {},   
        "tzid": {},            
        "contact": {
            datatype: "microformat",
            microformat: "hCard"
        },
        "organizer": {
            plural: true,
            datatype: "microformat",
            microformat: "hCard"
        },
        "attendee": {
            plural: true,
            datatype: "microformat",
            microformat: "hCard"
        },
    }
};



var geo = {
    className: "geo",
    properties: {
        "latitude": {
            datatype: "float",
            virtual: true,
            /* This will only be called in the virtual case */
            virtualGetter: function (context, mfnode) {
                var value = context.textGetter(mfnode);
                var latlong;
                if (value && value.match(';')) {
                    latlong = value.split(';');
                    if (latlong[0]) {
                        if (!isNaN(latlong[0])) {
                            return parseFloat(latlong[0]);
                        }
                    }
                }
                return undefined;
            }
        },
        "longitude": {
            datatype: "float",
            virtual: true,
            /* This will only be called in the virtual case */
            virtualGetter: function (context, mfnode) {
                var value = context.textGetter(mfnode);
                var latlong;
                if (value && value.match(';')) {
                    latlong = value.split(';');
                    if (latlong[1]) {
                        if (!isNaN(latlong[1])) {
                            return parseFloat(latlong[1]);
                        }
                    }
                }
                return undefined;
            }
        }
    }
};




var tag = {
    altName: "tag",
    attributeName: "rel",
    attributeValues: "tag",
    properties: {
        "tag": {
            virtual: true,
            virtualGetter: function (context, mfnode) {
                if (context.$(mfnode).attr('href')) {
                    var href = context.$(mfnode).attr('href').split("?")[0].split("#")[0];
                    var url_array = href.split("/");
                    for (var i = url_array.length - 1; i > 0; i--) {
                        if (url_array[i] !== "") {
                            var tag = context.tag.validTagName(url_array[i].replace(/\+/g, ' '));
                            if (tag) {
                                try {
                                    return decodeURIComponent(tag);
                                } catch (ex) {
                                    return unescape(tag);
                                }
                            }
                        }
                    }
                }
                return null;
            }
        },
        "link": {
            virtual: true,
            datatype: "anyURI"
        },
        "text": {
            virtual: true
        }
    },
    validTagName: function (tag) {
        var returnTag = tag;
        if (tag.indexOf('?') != -1) {
            if (tag.indexOf('?') === 0) {
                return false;
            } else {
                returnTag = tag.substr(0, tag.indexOf('?'));
            }
        }
        if (tag.indexOf('#') != -1) {
            if (tag.indexOf('#') === 0) {
                return false;
            } else {
                returnTag = tag.substr(0, tag.indexOf('#'));
            }
        }
        if (tag.indexOf('.html') != -1) {
            if (tag.indexOf('.html') == tag.length - 5) {
                return false;
            }
        }
        return returnTag;
    }
};



var xfn = {
    altName: "xfn",
    attributeName: "rel",
    attributeValues: "contact acquaintance friend met co-worker colleague " +
                       "co-resident neighbor child parent sibling spouse kin " +
                       "muse crush date sweetheart me",
    properties: {
        "contact": {
            virtual: true,
            virtualGetter: function (context, propnode) {
                return context.XFN.getXFN(context, propnode, "contact");
            }
        },
        "acquaintance": {
            virtual: true,
            virtualGetter: function (context, propnode) {
                return context.XFN.getXFN(context, propnode, "acquaintance");
            }
        },
        "friend": {
            virtual: true,
            virtualGetter: function (context, propnode) {
                return context.XFN.getXFN(context, propnode, "friend");
            }
        },
        "met": {
            virtual: true,
            virtualGetter: function (context, propnode) {
                return context.XFN.getXFN(context, propnode, "met");
            }
        },
        "co-worker": {
            virtual: true,
            virtualGetter: function (context, propnode) {
                return context.XFN.getXFN(context, propnode, "co-worker");
            }
        },
        "colleague": {
            virtual: true,
            virtualGetter: function (context, propnode) {
                return context.XFN.getXFN(context, propnode, "colleague");
            }
        },
        "co-resident": {
            virtual: true,
            virtualGetter: function (context, propnode) {
                return context.XFN.getXFN(context, propnode, "co-resident");
            }
        },
        "neighbor": {
            virtual: true,
            virtualGetter: function (context, propnode) {
                return context.XFN.getXFN(context, propnode, "neighbor");
            }
        },
        "child": {
            virtual: true,
            virtualGetter: function (context, propnode) {
                return context.XFN.getXFN(context, propnode, "child");
            }
        },
        "parent": {
            virtual: true,
            virtualGetter: function (context, propnode) {
                return context.XFN.getXFN(context, propnode, "parent");
            }
        },
        "sibling": {
            virtual: true,
            virtualGetter: function (context, propnode) {
                return context.XFN.getXFN(context, propnode, "sibling");
            }
        },
        "spouse": {
            virtual: true,
            virtualGetter: function (context, propnode) {
                return context.XFN.getXFN(context, propnode, "spouse");
            }
        },
        "kin": {
            virtual: true,
            virtualGetter: function (context, propnode) {
                return context.XFN.getXFN(context, propnode, "kin");
            }
        },
        "muse": {
            virtual: true,
            virtualGetter: function (context, propnode) {
                return context.XFN.getXFN(context, propnode, "muse");
            }
        },
        "crush": {
            virtual: true,
            virtualGetter: function (context, propnode) {
                return context.XFN.getXFN(context, propnode, "crush");
            }
        },
        "date": {
            virtual: true,
            virtualGetter: function (context, propnode) {
                return context.XFN.getXFN(context, propnode, "date");
            }
        },
        "sweetheart": {
            virtual: true,
            virtualGetter: function (context, propnode) {
                return context.XFN.getXFN(context, propnode, "sweetheart");
            }
        },
        "me": {
            virtual: true,
            virtualGetter: function (context, propnode) {
                return context.XFN.getXFN(context, propnode, "me");
            }
        },
        "link": {
            virtual: true,
            datatype: "anyURI"
        },
        "text": {
            virtual: true
        }
    },
    getXFN: function (context, propnode, relationship) {
        var rel = context.getAttribute(propnode, "rel");
        if (rel.match("(^|\\s)" + relationship + "(\\s|$)")) {
            return true;
        }
        return false;
    }
};



var hentry = {

  className: "hentry",
  properties: {
    "author": {
        plural: true,
        datatype: "microformat",
        microformat: "hCard"
    },
    "bookmark" : {
      subproperties: {
        "link" : {
          virtual: true,
          datatype: "anyURI"
        },
        "text" : {
          virtual: true
        }
      },
      rel: true
    },
    "entry-title" : {},
    "entry-content" : {
      plural: true
    },
    "entry-summary" : {
      plural: true
    },
    "published" : {
      datatype: "dateTime"
    },
    "updated" : {
      virtual: true,
      datatype: "dateTime",
      virtualGetter: function(context, mfnode) {
          return context.getMicroformatProperty(mfnode, "hEntry", "published");
      }
    },
    "tag": {
    plural: true,
      rel: true,
      datatype: "microformat",
      microformat: "tag"
    }
  }
};

var hfeed = {

  className: "hfeed",
  alternateClassName: "hentry",
  properties: {
    "author" : {
      plural: true,
      datatype: "microformat",
      microformat: "hCard"
    },
    "tag": {
    plural: true,
      rel: true,
      datatype: "microformat",
      microformat: "tag"
    }
  }
};


var hresume = {
  className: "hresume",
  properties: {
    "contact": {
        datatype: "microformat",
        microformat: "hCard",
        plural: false
    },
    "summary" : {},
    "affiliation" : {
        plural: true,
        datatype: "microformat",
        microformat: "hCard"
    },
    "education" : {
        plural: true,
        datatype: "microformat",
        microformat: "hCalendar",
        subproperties: deepMerge(hcard.properties, hcalendar.properties)
    },
    "experience" : {
        datatype: "microformat",
        microformat: "hCalendar",
        plural: true,
        subproperties: deepMerge(hcard.properties, hcalendar.properties)
    },
    "skill": {
        plural: true,
        datatype: "microformat",
        microformat: "tag",
        microformat_property: "tag"
    },
    "competency": {
         subproperties: {
            "skill": {
                plural: true,
                datatype: "microformat",
                microformat: "tag",
                microformat_property: "tag"
            },
            "proficiency": {}
        },
        plural: true
    },
  }
};



var hreview = {

    className: "hreview",
    properties: {
        "dtreviewed": {
            datatype: "dateTime"
        },
        "description": {
        },
        "item": {
            datatype: "custom",
            customGetter: function (context, propnode) {
                var item;
                if (propnode.className.match("(^|\\s)" + "vcard" + "(\\s|$)")) {
                    item = context.getMicroformat(propnode, 'hCard');
                } else if (propnode.className.match("(^|\\s)" + "vevent" + "(\\s|$)")) {
                    item = context.getMicroformat(propnode, 'hCalendar');
                } else {
                    item = {};
                    var fns = context.getElementsByClassName(propnode, "fn");
                    if (fns.length > 0) {
                        item.fn = context.defaultGetter(fns[0]);
                    }
                    var urls = context.getElementsByClassName(propnode, "url");
                    if (urls.length > 0) {
                         item.url = context.uriGetter(urls[0]);
                    }
                    var photos = context.getElementsByClassName(propnode, "photo");
                    if (photos.length > 0) {
                        item.photo = context.uriGetter(photos[0]);
                    }
                }
                /* Only return item if it has stuff in it */
                for (var i in item) {
                    return item;
                }
                return item;
            }
            },
            "rating": {
                datatype: "float"
            },
            "best": {
                datatype: "float"
            },
            "worst": {
                datatype: "float"
            },
            "reviewer": {
                datatype: "microformat",
                microformat: "hCard"
            },
            "summary": {
        },
        "type": {
            types: ["product", "business", "event", "person", "place", "website", "url"]
        },
        "tag": {
            plural: true,
            rel: true,
            datatype: "microformat",
            microformat: "tag"
        },
        "version": {
        }
    }
};


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


// used to bring together two definations into one
function deepMerge(foo, bar) {
  var merged = {};
  for (var each in bar) {
    if (each in foo) {
      if (typeof(foo[each]) == "object" && typeof(bar[each]) == "object") {
        merged[each] = deepMerge(foo[each], bar[each]);
      } else {
        merged[each] = [foo[each], bar[each]];
      }
    } else {
      merged[each] = bar[each];
    }
  }
  for (var each in foo) {
    if (!(each in bar)) {
      merged[each] = foo[each];
    }
  }
  return merged;
}


exports.adr = adr;
exports.hcard = hcard;
exports.hcalendar = hcalendar;
exports.geo = geo;
exports.tag = tag;
exports.xfn = xfn;
exports.hentry = hentry;
exports.hfeed = hfeed;
exports.hresume = hresume;
exports.hreview = hreview;
exports.testSuite = testSuite;
exports.testFixture = testFixture;