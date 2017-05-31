'use strict';
require('dotenv').config();
const Hapi = require('hapi');
const Joi = require('joi');
const Inert = require('inert');
const Vision = require('vision');
const Blipp = require('blipp');
const Request = require('request');
const Pack = require('./package.json');
const Microformats = require('./index.js');

// Create a server with a host and port
var server = new Hapi.Server();

server.connection({
    host: (process.env.PORT) ? '0.0.0.0' : 'localhost',
    port: parseInt(process.env.PORT, 10) || 3001,
    router: {
        stripTrailingSlash: true
    },
    routes: { cors: true }
});

var schema = {
    payload: {
        url: Joi.string(),
        html: Joi.string()
            .description('The html to parse'),
        baseUrl: Joi.string()
            .allow('')
            .description('Optional URL to help resolve relative links'),
        filters: Joi.string()
            .allow('')
            .description('Optional comma separted list of formats to filter by'),
        overlappingVersions: Joi.boolean(),
        impliedPropertiesByVersion: Joi.boolean(),
        parseLatLonGeo: Joi.boolean(),
        dateFormat: Joi.string(),
        textFormat: Joi.string()
    }
}





function parseHTML(request, reply) {

    buildOptions(request, (err, options) => {

        if(options){
            var mfObj = Microformats.get(options);
            return reply(JSON.stringify(mfObj)).type('application/json');
        }else{
            return reply({err: err}).type('application/json');
        }
    });
}


function countHTML(request, reply) {

    buildOptions(request, (err, options) => {

        const mfObj = Microformats.count(options);
        return reply(JSON.stringify(mfObj)).type('application/json');
    });
}



// create options from form input
function buildOptions(request, callback) {

    let options = {};
    let err = null;

     if (request.payload.html !== undefined) {
        options.html = request.payload.html.trim();
    }

    if (request.payload.baseUrl !== undefined) {
        options.baseUrl = request.payload.baseUrl.trim();
    }

    if (request.payload.filters !== undefined) {
        if (request.payload.filters.indexOf(',') > -1) {
            options.filters = trimArray(request.payload.filters.split(','))
        } else {
            options.filters = trimArray(request.payload.filters)
        }
        if (options.filters.length === 0) {
            delete options.filters;
        }
    }

    if (request.payload.dateFormat !== undefined) {
        options.dateFormat = request.payload.dateFormat;
    }

    if (request.payload.textFormat !== undefined) {
        options.textFormat = request.payload.textFormat;
    }

    if (request.payload.overlappingVersions !== undefined) {
        options.overlappingVersions = request.payload.overlappingVersions
    }

    if (request.payload.impliedPropertiesByVersion !== undefined) {
        options.impliedPropertiesByVersion = request.payload.impliedPropertiesByVersion
    }

    if (request.payload.parseLatLonGeo !== undefined) {
        options.parseLatLonGeo = request.payload.parseLatLonGeo
    }


    if (request.payload.url !== undefined) {

        Request(request.payload.url, function (error, response, body) {

            err = error;
            if(!err && response && response.statusCode === 200){
                options.html = body;
                callback(null, options);
            }else{
                callback(err, null);
            }
        });
    }else{
        callback(err, options);
    }

}


function trimArray(obj) {
    let out = [];
    if (Array.isArray(obj)) {
        obj.forEach(function (txt) {
            if (obj.trim() !== '') {
                out.push(obj.trim())
            }
        });
    } else {
        if (obj.trim() !== '') {
            out.push(obj.trim())
        }
    }
    return out;
}


// options for good reporting
const goodOptions = {
    ops: {
        interval: 1000
    },
    reporters: {
        myConsoleReporter: [{
            module: 'good-squeeze',
            name: 'Squeeze',
            args: [{ log: '*', response: '*' }]
        }, {
            module: 'good-console'
        }, 'stdout']
    }
}


// Register plug-in and start
server.register([
    Inert,
    Vision,
    Blipp,
    {
        register: require('good'),
        options: goodOptions
    },], function (err) {
        if (err) {
            console.error(err);
        } else {
            server.start(function () {
                console.info('Server started at ' + server.info.uri);
            });
        }
    });

// add templates support with handlebars
server.views({
    path: 'templates',
    engines: { html: require('handlebars') },
    partialsPath: './templates/withPartials',
    helpersPath: './templates/helpers',
    isCached: false
})

// setup routes to serve the test directory and file routes into other modules
server.route([{
    method: 'GET',
    path: '/',
    config: {
        handler: (request, reply) => {
            reply.view('index.html', {
                title: Pack.name,
                version: Pack.version,
            });
        }
    }
}, {
    method: 'POST',
    path: '/parse',
    config: {
        handler: parseHTML,
        validate: schema
    }
}, {
    method: 'POST',
    path: '/count',
    config: {
        handler: countHTML,
        validate: schema
    }
}, {
    method: 'GET',
    path: '/{path*}',
    handler: {
        directory: {
            path: './static'
        }
    }
}]);