---
runme:
  id: 01HVK64MPTNS966NET83RZPH17
  version: v3
---


[![MIT license](http://img.shields.io/badge/license-MIT-blue.svg?style=flat-square)](https://raw.github.com/glennjones/microformat-shic/master/license.txt)

# microformat-node

A node.js microformats parser. It is the same codebase as  [microformat-shiv](https://github.com/glennjones/microformat-shiv) project, but
used the fast HTML DOM [cheerio](https://github.com/cheeriojs/cheerio) to parse HTML. 

## Installation

```sh {"id":"01HVK64MPTNS966NET7E1G52Y1"}
$ npm i microformat-node
```

## Methods

* Parsing
   * [`get`](#get)

* Discovery
   * [`count`](#count)
   * [`isMicroformat`](#isMicroformat)
   * [`hasMicroformats`](#hasMicroformats)

## get

The `get` method parses microformats data from either a `html` string or a `cheerio` object.

Simple parse of HTML string.

```javascript {"id":"01HVK64MPTNS966NET7GGBM7F9"}
    var Microformats = require('microformat-node'),
        options = {};

    options.html = '<a class="h-card" href="http://glennjones.net">Glenn</a>';

    Microformats.get(options, function(err, data){
        // do something with data
    });
```

Simple parse of a Cheerio parsed page

```javascript {"id":"01HVK64MPTNS966NET7MF5S2S4"}
    var Microformats = require('microformat-node'),
        Cheerio = require('cheerio'),
        options = {};

    options.node = Cheerio.load('<a class="h-card" href="http://glennjones.net">Glenn</a>');
    Microformats.get(options, function(err, data){
        // do something with data
    });
```

## Options

* `html` - (String) the html to be parse
* `node` - (Cheerio DOM object) the element to be parse
* `filter` - (Array) microformats types returned - i.e. `['h-card']` - always adds `rels`
* `baseUrl` - (String) a base URL to resolve any relative URL:s to
* `textFormat` - (String) text style `whitespacetrimmed` or `normalised` default is `whitespacetrimmed`
* `dateFormat` - (String) the ISO date profile `auto`, `microformat2`, `w3c` `rfc3339` or `html5` default is `auto`
* `add` - (Array) adds microformat version 1 definitions

__I would recommended always setting `textFormat` option to `normalised`. This is not part of the microformat parsing rules, but in most cases provides more usable output.__

## Experimental Options

These options are part of ongoing specification development. They maybe removed or renamed in future.

* `lang` (Boolean) Parses and adds the language value to e-* default is false
* `parseLatLonGeo` (Boolean)  Parse geo date writen as latlon i.e. 30.267991;-97.739568
   default is `false`

## Output

JSON output. This is an example of a parsed `h-card` microformat.

```javascript {"id":"01HVK64MPTNS966NET7PAZNDKR"}
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
        }],
        "rels": {},
        "rel-urls": {}
    }
```

## Count

The `count` method returns the number of each microformat type found. It does not do a full parse so it is much quicker
than get and can be used for tasks such as adding notifications to the UI. The method can take a `options` object as a parameter.

```javascript {"id":"01HVK64MPTNS966NET7T2PRFEQ"}
    var Microformats = require('microformat-node'),
        options = {};

    options.html = '<a class="h-card" href="http://glennjones.net">Glenn</a>';
    Microformats.count(options, function(err, data){
        // do something with data
    });
```

Output

```javascript {"id":"01HVK64MPTNS966NET7W8JR2JJ"}
    {
        'h-event': 1,
        'h-card': 2,
        'rels': 6
    }
```

## isMicroformat

The `isMicroformat` method returns weather a node has a valid microformats class. It currently does not work consider
`rel=*` a microformats. The method can take a `options` object as a second parameter.

```javascript {"id":"01HVK64MPTNS966NET7WHS24N0"}
    var Microformats = require('microformat-node'),
        options = {};

    options.html = '<a class="h-card" href="http://glennjones.net">Glenn</a>';
    Microformats.isMicroformat(options, function(err, isValid){
        // do something with isValid
    });
```

## hasMicroformats

The `hasMicroformats` method returns weather a document or node has any valid microformats class. It currently does
not take rel=* microformats into account. The method can take a `options` object as a second parameter.

```javascript {"id":"01HVK64MPTNS966NET7WPZNT36"}
    var Microformats = require('microformat-node'),
        options = {};

    options.html = '<div><a class="h-card" href="http://glennjones.net">Glenn</a></div>';
    Microformats.hasMicroformats(options, function(err, isValid){
        // do something with isValid
    });
```

## using a Async calls

There are promise based version of the four public methods, each is appended with the text `Async`. So the names for promise methods are `getAsync`, `countAsync`, `isMicroformatAsync` and `hasMicroformatsAsync`.

```javascript {"id":"01HVK64MPTNS966NET7WXB2WK2"}
    var Microformats = require('microformat-node'),
        options = {};

    options.html = '<a class="h-card" href="http://glennjones.net">Glenn</a>';
    let data = await Microformats.getAsync(options)
        .then(function (data) {
            // do something with data
        })
        .catch(function(err){
            // do something with err
        })
```

## Version and livingStandard

The library has two properties to help identify now up todate it is:

* `version` (String) interanl version number
* `livingStandard` (String ISO Date) the current https://github.com/microformats/tests used.

## Microformats definitions object

The library has built-in version 1 microformats definitions, but you can add new definitions using `options.add` if you wish. Below is an example of a definitions object. Examples of existing definitions found in the directory `lib/maps`. You not need to add new definitions object if your using the microformats version 2.

```javascript {"id":"01HVK64MPTNS966NET7Z6S1XPC"}
    {
		root: 'hpayment',
		name: 'h-payment',
		properties: {
			'amount': {},
			'currency': {}
		}
	}
```

## Running simple demo page

```sh {"id":"01HVK64MPTNS966NET82E51R87"}
$ git clone https://github.com/glennjones/microformat-node.git
$ cd microformat-node
$ npm i
$ npm start
```

Then open http://0.0.0.0:3000

## License

[MIT](./License.md) © Copyright [Glenn Jones](https://github.com/glennjones)
