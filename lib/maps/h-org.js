/*
    Copyright (C) 2010 - 2012 Glenn Jones. All Rights Reserved.
    Open License: https://raw.github.com/glennjones/microformat-node/master/license.txt
    
  */
  
var horg = {
    root: 'h-x-org',  // drop this from v1 as it causes issue with fn org hcard pattern
    name: 'h-org',
    properties: {
        'organization-name': {},
        'organization-unit': {}
    }
};
exports.horg = horg;

