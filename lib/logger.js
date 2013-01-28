/*
   Logger
   Copyright (C) 2010 - 2013 Glenn Jones. All Rights Reserved.
   MIT License: https://raw.github.com/glennjones/microformat-node/master/license.txt
   
   */

function Logger(logLevel){
	this.logLevel = logLevel;
}

Logger.prototype = {

	// logLevel - 4	
	// log - the finest logging level. Can be used to log very specific 
	// information that is only relevant in a true debugging scenario
	log: function (msg){
		if(this.logLevel > 3){
			console.log('log: ' + msg);
		}
	},


	// logLevel - 3
	// info - General application flow, such as "Starting app" and "registering ...". 
	// in short, information which should help any observer understand what the 
	// application is doing in general.
	info: function (msg){
		if(this.logLevel > 2){
			console.info('info: ' + msg);
		}
	},


	// logLevel - 2
	// warn - warns of errors that can be recovered. Such as failing to 
	// parse a date or using an unsafe routine.
	warn: function (msg){
		if(this.logLevel > 1){
			console.warn('warn: ' + msg);
		}
	},


	// logLevel - 1
	// error - warns of errors that can be recovered. Such as failing to 
	// parse a date or using an unsafe routine.
	error: function (msg){
		if(this.logLevel > 0){
			console.error('error: ' + msg);
		}
	},


	setLogLevel: function(newLogLevel){
		this.logLevel = newLogLevel;
	}

};

exports.Logger = Logger;