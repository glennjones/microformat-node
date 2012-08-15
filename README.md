node-socialgraph
================

This project aims to replicate the functionality of the Google Social Graph API. 

You provide it with a URL and the Grapher with crawl it for `rel=me` links; it then 
follows any links it find and crawls those too.

Once all crawled links have been followed the Grapher will return a _graph_ of what 
it found as an object.

Setup
----------------

Once you've cloned node-socialgraph and you're in its directory run

    npm install

    
Usage
----------------

```JavaScript
var grapher = require('node-socialgraph').grapher
```

Demo
----------------

To run the example server run

    bin/node-socialgraph
