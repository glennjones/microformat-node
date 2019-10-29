	
   function addV1(parser, options){
		if(options && options.maps){
			if(Array.isArray(options.maps)){
				parser.add(options.maps);
			}else{
				parser.add([options.maps]);
			}
		}
    }
    
    function getCallback( args ){
       // second argument is callback 
       if(args.length === 2 && modules.utils.isFunction(args[1])){
           return args[1];
       }
       // thrid argument is callback 
       if(args.length === 3 && modules.utils.isFunction(args[2])){
           return args[2];
       } 
        return null;
    }
    
    
    // external interface
	var External = {
        version: modules.version,
        livingStandard: modules.livingStandard
    };
    
    
    External.get = function( options ){
    	var parser = new modules.Parser();
        addV1(parser, options);
        
        if(arguments.length === 2 && modules.utils.isFunction(arguments[1])){
            // if callback is passed call with standard node pattern
            var mfData = parser.get( options );
            if(mfData.errors){
                arguments[1](mfData.errors, null);
            }else{
                arguments[1](null, mfData);
            }
        }else{
            // if no callback is passed just return data
            return parser.get( options );
        }
    };
    
    
    External.count = function(options){
    	var parser = new modules.Parser();
        addV1(parser, options);
        
        if(arguments.length === 2 && modules.utils.isFunction(arguments[1])){
            // if callback is passed
            var mfData = parser.count( options );
            if(mfData.errors){
                arguments[1](mfData.errors, null);
            }else{
                arguments[1](null, mfData);
            }
        }else{
            return parser.count( options );
        }
    };
    
    
    External.isMicroformat = function( node, options ){
        var parser = new modules.Parser(),
            callback = getCallback( arguments );
            
        if(modules.utils.isFunction(arguments[1])){
            options = {};
        }
        addV1(parser, options);
        if(callback !== null){
            var mfData = parser.isMicroformat( node, options );
            callback(null, mfData);
        }else{
            return parser.isMicroformat( node, options );
        }
    };
    
    
    External.hasMicroformats = function( node, options ){
        var parser = new modules.Parser(),
            callback = getCallback( arguments );
            
        if(modules.utils.isFunction(arguments[1])){
            options = {};
        }
        addV1(parser, options);
        if(callback !== null){
            var mfData = parser.hasMicroformats( node, options );
            callback(null, mfData);
        }else{
            return parser.hasMicroformats( node, options );
        }
    };
    
    

    
    
    return External;

} (Modules || {}));


// export for node
module.exports = { 
    version: Modules.version,
    livingStandard: Modules.version,
    get: Modules.get,
    count: Modules.count,
    isMicroformat: Modules.isMicroformat,
    hasMicroformats: Modules.hasMicroformats,
    // Promise versions
    getAsync: util.promisify(Modules.get),
    countAsync: util.promisify(Modules.count),
    isMicroformatAsync: util.promisify(Modules.isMicroformat),
    hasMicroformatsAsync: util.promisify(Modules.hasMicroformats)
}