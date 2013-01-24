/*
    Copyright (C) 2010 - 2012 Glenn Jones. All Rights Reserved.
    Open License: https://raw.github.com/glennjones/microformat-node/master/license.txt
    
  */

var rel = {
	// xfn
	//        ['link', 'a or area'] yes, no or external
	'friend': [ 'yes','external'], 
	'acquaintance': [ 'yes','external'],  
	'contact': [ 'yes','external'], 
	'met': [ 'yes','external'], 
	'co-worker': [ 'yes','external'],  
	'colleague': [ 'yes','external'], 
	'co-resident': [ 'yes','external'],  
	'neighbor': [ 'yes','external'], 
	'child': [ 'yes','external'],  
	'parent': [ 'yes','external'],  
	'sibling': [ 'yes','external'],  
	'spouse': [ 'yes','external'],  
	'kin': [ 'yes','external'], 
	'muse': [ 'yes','external'],  
	'crush': [ 'yes','external'],  
	'date': [ 'yes','external'],  
	'sweetheart': [ 'yes','external'], 
	'me': [ 'yes','external'], 

	// other rel= 
	'license': [ 'yes','yes'],
	'nofollow': [ 'no','external'],
	'tag': [ 'no','yes'],
	'self': [ 'no','external'],
	'bookmark': [ 'no','external'],
	'author': [ 'no','external'],
	'home': [ 'no','external'],
	'directory': [ 'no','external'],
	'enclosure': [ 'no','external'],
	'pronunciation': [ 'no','external'],
	'payment': [ 'no','external'],
	'principles': [ 'no','external']

};
exports.rel = rel;



