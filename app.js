var Hapi                = require('hapi'),
    Joi                 = require('joi'),
    Microformats        = require('./index.js');

// Create a server with a host and port
var server = new Hapi.Server();

server.connection({
    host: (process.env.PORT)? '0.0.0.0' : 'localhost',
    port: parseInt(process.env.PORT, 10) || 3001
});

var schema = { 
        payload: {
            html: Joi.string()
                .required()
                .description('The html to parse'),
            baseUrl: Joi.string()
                .allow('')
                .description('Optional URL to help resolve relative links'),
            filters: Joi.string()
                .allow('')
                .description('Optional comma separted list of formats to filter by'),
            overlappingVersions:  Joi.boolean(),
            impliedPropertiesByVersion: Joi.boolean(),
            parseLatLonGeo: Joi.boolean(),
            dateFormat: Joi.string(),
            textFormat: Joi.string()
        }
    }


// setup routes to serve the test directory and file routes into other modules
server.route([{
	method: 'GET',
	path: '/{path*}',
	handler: {
		directory: {
			path: './static',
			listing: true,
		}
	}
},{
    method: 'POST',
    path: '/parse/',
    config: {
        handler: parseHTML,
        validate: schema
    }
},{
    method: 'POST',
    path: '/count/',
    config: {
        handler: countHTML,
        validate: schema
    }
}]);

function parseHTML(request, reply){
   var options = buildOptions( request );

   var mfObj = Microformats.get( options );
   return reply(JSON.stringify(mfObj))
        .type('application/json');
}

function countHTML(request, reply){
    var options = buildOptions( request );

    var mfObj = Microformats.count( options  );
    return reply(JSON.stringify(mfObj))
        .type('application/json');
}


function buildOptions( request ){
    var options = {};

   if(request.payload.html !== undefined){
      options.html = request.payload.html.trim();
   }

   if(request.payload.baseUrl !== undefined){
       options.baseUrl = request.payload.baseUrl.trim();
   }

   if(request.payload.filters !== undefined){
       if(request.payload.filters.indexOf(',') > -1){
           options.filters = trimArray(request.payload.filters.split(','))
       }else{
           options.filters = trimArray(request.payload.filters)
       }
       if(options.filters.length === 0){
           delete options.filters;
       }
   }

   if(request.payload.dateFormat !== undefined){
       options.dateFormat = request.payload.dateFormat;
   }

   if(request.payload.textFormat !== undefined){
       options.textFormat = request.payload.textFormat;
   }

   if(request.payload.overlappingVersions !== undefined){
       options.overlappingVersions = request.payload.overlappingVersions
   }

   if(request.payload.impliedPropertiesByVersion !== undefined){
       options.impliedPropertiesByVersion = request.payload.impliedPropertiesByVersion
   }

   if(request.payload.parseLatLonGeo !== undefined){
       options.parseLatLonGeo = request.payload.parseLatLonGeo
   }

   return options
}


function trimArray( obj ){
    var out = [];
    if(Array.isArray( obj )){
        obj.forEach( function(txt){
            if(obj.trim() !== ''){
                out.push( obj.trim() )
            }
        });
    }else{
        if(obj.trim() !== ''){
            out.push( obj.trim() )
        }
    }
    return out;
}


// log repsonses data to console
var goodOptions = {
    opsInterval: 1000,
    reporters: [{
        reporter: require('good-console'),
        events: { log: '*', response: '*' }
    }]
};


// Register plug-in and start
server.register([{
    register: require('good'),
    options: goodOptions
  },{
    register: require('blipp'),
  }], function (err) {
      if (err) {
          console.error(err);
      }else {
          server.start(function () {
              console.info('Server started at ' + server.info.uri);
          });
      }
  });
