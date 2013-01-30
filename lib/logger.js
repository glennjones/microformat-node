/*
   Logger
   Copyright (C) 2010 - 2013 Glenn Jones. All Rights Reserved.
   MIT License: https://raw.github.com/glennjones/microformat-node/master/license.txt
   
   */

var logLevel = 0;

// logLevel - 4	
// log - the finest logging level. Can be used to log very specific 
// information that is only relevant in a true debugging scenario
function log(msg){
	if(logLevel > 3){
		console.log('log: ' + msg);
	}
}


// logLevel - 3
// info - General application flow, such as "Starting app" and "registering ...". 
// in short, information which should help any observer understand what the 
// application is doing in general.
function info(msg){
	if(logLevel > 2){
		console.info('info: ' + msg);
	}
}


// logLevel - 2
// warn - warns of errors that can be recovered. Such as failing to 
// parse a date or using an unsafe routine.
function warn(msg){
	if(logLevel > 1){
		console.warn('warn: ' + msg);
	}
}


// logLevel - 1
// error - warns of errors that can be recovered. Such as failing to 
// parse a date or using an unsafe routine.
function error(msg){
	if(logLevel > 1){
		console.error('error: ' + msg);
	}
}


function setLogLevel(newLogLevel){
	logLevel = newLogLevel;
}

// logLevel - 0 means no logging


exports.log = log;
exports.info = info;
exports.warn = warn;
exports.error = error;
exports.setLogLevel = setLogLevel;

