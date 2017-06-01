Tests
-----------------

Web server for local testing
----------------------------
The project includes a node.js web server to run the test tools locally. To run the test server download and install node.js and npm. From the command line move the project directory and excute the following commands:

```sh
    $ npm install
    $ node app
```


Client-side interface and standards tests
--------------------------------------
The page below run the full [microfomats test suite](https://github.com/microformats/tests) as well as the libraries own unit test for each modules interface.
The tests are created in [mocha](http://mochajs.org/)


Client-side debugging tools
---------------------------
There are also a number of other debugging and tests tools:

* http://0.0.0.0:3000/testrunner.html (clients side version microfomats test suite testrunner)
* http://0.0.0.0:3000/parse.html (clients side form to for parsing and debugging)
* http://0.0.0.0:3000/count.html (clients side form to test count function)


Mocha test
--------------------------------------
You can run mocha directly in the commandline with:
```sh
    $ mocha --reporter list
```


Pulling [microfomats test suite](https://github.com/microformats/tests) updates
-------------------------------------------------------------------------------
There is a script to pull updated set of tests from microfomats test suite and rebuild all the test files.

```sh
    $ node update-test
```

Within this file you can configure the github repo you pull from so forks of [microfomats test suite](https://github.com/microformats/tests) can also be used.



Exernal links
-------------

* https://travis-ci.org/glennjones/microformat-node
