/*!
    isodate.js
    Parses and builds ISO dates to the uf, W3C or RFC3339 profiles
    Copyright (C) 2010 - 2012 Glenn Jones. All Rights Reserved.
    Open License: https://raw.github.com/glennjones/microformat-node/master/license.txt
*/
var utils = require('../lib/utilities.js').utilities;


function ISODate() {
    this.dY;
    this.dM = -1;
    this.dD = -1;
    this.dDDD = -1;
    this.tH;
    this.tM = -1;
    this.tS = -1;
    this.tD = -1;
    this.tzH;
    this.tzM = -1;
    this.tzPN = '+';
    this.z = false;
    this.format = 'uf' // uf or W3C or RFC3339

    if (arguments[0])
        this.Parse(arguments[0]);
}

ISODate.prototype = {

    Parse: function (dateString) {

        var dateNormalised = '', parts;
        var datePart = '', timePart = '', timeZonePart = '';
        dateString = dateString.toString().toUpperCase();


        // Break on 'T' divider or space
        if (dateString.indexOf('T') > -1) {
            parts = dateString.split('T');
            datePart = parts[0];
            timePart = parts[1];

            // Zulu UTC                 
            if (timePart.indexOf('Z') > -1){
                this.z = true;
            }

            // Timezone
            if (timePart.indexOf('+') > -1 || timePart.indexOf('-') > -1) {
                var tzArray = timePart.split('Z'); // incase of incorrect use of Z
                timePart = tzArray[0];
                timeZonePart = tzArray[1];

                // Timezone
                if (timePart.indexOf('+') > -1 || timePart.indexOf('-') > -1) {
                    var position = 0;
                    if (timePart.indexOf('+') > -1)
                        position = timePart.indexOf('+');
                    else
                        position = timePart.indexOf('-');

                    timeZonePart = timePart.substring(position, timePart.length);
                    timePart = timePart.substring(0, position);
                }
            }

        }
        else {
            datePart = dateString;
        }

        if (datePart != '') {
            this.ParseDate(datePart);
            if (timePart != '') {
                this.ParseTime(timePart);
                if (timeZonePart != '') {
                    this.ParseTimeZone(timeZonePart);
                }
            }
        }
    },


    ParseDate: function (dateString) {
        var dateNormalised = '', parts;
        // YYYY-DDD
        parts = dateString.match(/(\d\d\d\d)-(\d\d\d)/);
        if(parts){
            if (parts[1]) { this.dY = parts[1] };
            if (parts[2]) { this.dDDD = parts[2] };
        }
        
        if(this.dDDD === -1){
            // YYYY-MM-DD ie 2008-05-01 and YYYYMMDD ie 20080501
            parts = dateString.match(/(\d\d\d\d)?-?(\d\d)?-?(\d\d)?/);
            if (parts[1]) { this.dY = parts[1] };
            if (parts[2]) { this.dM = parts[2] };
            if (parts[3]) { this.dD = parts[3] };
        }

    },

    ParseTime: function (timeString) {
        var timeNormalised = '';
        // Finds timezone HH:MM:SS and HHMMSS  ie 13:30:45, 133045 and 13:30:45.0135
        var parts = timeString.match(/(\d\d)?:?(\d\d)?:?(\d\d)?.?([0-9]+)?/);
        timeSegment = timeString;
        if (parts[1]) { this.tH = parts[1] };
        if (parts[2]) { this.tM = parts[2] };
        if (parts[3]) { this.tS = parts[3] };
        if (parts[4]) { this.tD = parts[4] };
    },

    ParseTimeZone: function (timeString) {
        var timeNormalised = '';
        // Finds timezone +HH:MM and +HHMM  ie +13:30 and +1330
        var parts = timeString.match(/([-+]{1})?(\d\d)?:?(\d\d)?/);
        if (parts[1]) { this.tzPN = parts[1] };
        if (parts[2]) { this.tzH = parts[2] };
        if (parts[3]) { this.tzM = parts[3] };
    },

    // Returns datetime in W3C Note datetime profile or RFC 3339 profile
    toString: function () {
        var output = '';
        this.setFormatSep();
        if (this.dY) {
            output = this.dY;
            if (this.dM > 0 && this.dM < 13) {
                output += dsep + this.dM;
                if (this.dD > 0 && this.dD < 32) {
                    output += dsep + this.dD;
                    if (this.tH > -1 && this.tH < 25) {
                        output += 'T' + this.toTimeString(this);
                    }
                }
            }
            if(this.dDDD > -1){ output += dsep + this.dDDD }
        }else if (this.tH){
            output += this.toTimeString(this);
        }

        return output;
    },


    // returns just the time element of a ISO date
    toTimeString: function(iso){
        var out = '';
        this.setFormatSep()
        // Time and can only be created with a full date
        if (iso.tH) {
            if (iso.tH > -1 && iso.tH < 25) {
                out += iso.tH
                out += (iso.tM > -1 && iso.tM < 61)? tsep + iso.tM : tsep + '00';
                out += (iso.tS > -1 && iso.tS < 61)? tsep + iso.tS : tsep + '00';
                out += (iso.tD > -1)? '.' + iso.tD : '';
                // Time zone offset 
                if (iso.z) { 
                    out += 'Z'; 
                }else{
                    if (iso.tzH && iso.tzH > -1 && iso.tzH < 25){
                        out += iso.tzPN + iso.tzH
                        out += (iso.tzM > -1 && iso.tzM < 61)? tzsep + iso.tzM : tzsep + '00';
                    }
                }    
            }
        }
        return out;
    },

    setFormatSep: function(){
        switch(this.format){
            case 'RFC3339':
                dsep = '';
                tsep = '';
                tzsep = '';
                break;
            case 'W3C':
                dsep = '-';
                tsep = ':';
                tzsep = ':';
                break;
            default: // uf
                dsep = '-';
                tsep = ':';
                tzsep = '';
        }
    },

    hasFullDate: function(){
        return (this.dY !== -1 && this.dM !== -1 && this.dD !== -1)
    },

    hasDate: function(){
        return (this.dY !== -1)
    },

    hasTime: function(){
        return (this.tH !== -1)
    },

    hasTimeZone: function(){
        return (this.tzH !== -1)
    }


}    


/*// is str just a date without the time element
// ie YYYY-MM-DD - 2008-05-01
function isFullDate(str) {
    str = str.toLowerCase();
    if(!str.match('t') && !str.match(':')){
        var iso = new ISODate(str);
        return iso.hasFullDate()
    }
    return false
}


// is str just a time without the date element
// ie HH-MM-SS  08:43 or 15:23:00:0567 or 10:34pm
function isTime(str) {
    str = str.toLowerCase();
    // make sure it does not have the pattern of a duration or date
    if(!isDuration(str) && !str.match('-') && !str.match('t')){
        var iso = new ISODate();
        iso.ParseTime( parseAmPmTime(str) );
        return iso.hasTime();
    }
    return false
}


// is str timezone 
// ie z+-HH-MM-SS  +01:00:00 or -02:00 or z15:00 
function isTimeZone(str) {
    str = str.toLowerCase();
    // make sure it does not have the pattern of a duration or date
    if(utils.startWith(str,'-') || utils.startWith(str,'+') || utils.startWith(str,'z')){
        str = str.replace(/[z]+/g, '');
        var iso = new ISODate();
        iso.ParseTimeZone(str);
        return iso.hasTimeZone();
    }
    return false
}*/


// is str a ISO duration
// ie  PY17M or PW12
function isDuration(str) {
    str = str.toLowerCase();
    if(utils.startWith(str, 'p') && !str.match('t') && !str.match('-') && !str.match(':')){
        return true  
    }
    return false
}

// is str time or timezone
// ie HH-MM-SS  08:43 or 15:23:00:0567 or 10:34pm
// ie z+-HH-MM-SS  +01:00:00 or -02:00 or z15:00 
function isTime(str) {
    str = str.toLowerCase();
    if((str.match(':') || 
        utils.startWith(str, 'z') || 
        utils.startWith(str, '-') || 
        utils.startWith(str, '+') || 
        hasAM(str) || 
        hasPM(str)) && !str.match('t')){
        return true  
    }
    return false
}



// parses time string and turns it into a 24hr time string
// 5:34am = 05:34:00 or 1:52:04p.m. = 13:52:04
function parseAmPmTime(time){
    var out = time,
        times = [];
    // if the string has a time : or am or pm
    if(utils.isString(out)) {
        time = time.toLowerCase();
        time = time.replace(/[ ]+/g, '');

        if(time.match(':') || hasAM(time) || hasPM(time)){
        
            if(time.match(':')){
                times = time.split(':');
            }else{
                times[0] = time;
                times[0] = removeAMPM(times[0]);
            }

            if (hasAM(time)) {
                if (times[0] == '12') {
                    times[0] = '00';
                }
            }
            if (hasPM(time)) {
                if (times[0] < 12) {
                    times[0] = parseInt(times[0], 10) + 12;
                }
            }

            // add leading zero's where needed
            if (times[0] && times[0].length == 1) {times[0] = '0' + times[0];}
            if (times[0]) {time = times.join(':');}
        }
    }
    return removeAMPM(time);
}


function removeAMPM(str){
    return str.replace('pm', '').replace('p.m.', '').replace('am', '').replace('a.m.', '');
}


function hasAM(time){
    time = time.toLowerCase();
    return (time.indexOf('am') > -1 || time.indexOf('a.m.') > -1);
}


function hasPM(time){
    time = time.toLowerCase();
    return (time.indexOf('pm') > -1 || time.indexOf('p.m.') > -1 );
}


// overlays a different time on a given data
function dateTimeUnion(date, time){
    var isodate = new ISODate(date),
        isotime = new ISODate();

    isotime.ParseTime(parseAmPmTime(time)); 
    if(isodate.hasFullDate() && isotime.hasTime()){
        isodate.tH = isotime.tH;
        isodate.tM = isotime.tM;
        isodate.tS = isotime.tS;
        isodate.tD = isotime.tD;
        return isodate;
    }else{
        new ISODate();
    }
}



// passed an array of date/time string fragments 
// it creates an iso datetime string using microformat rules for value and value-title
// output comforms to the W3C ISO date profile standard
function concatFragments(arr){
    var date = '',
        time = '',
        offset = '';

    for (var i = 0; i < arr.length; i++) {
        value = arr[i].toUpperCase();
        // if the fragment already contains a full date just return it once its converted W3C profile
        if (value.match("T")) {
            return new ISODate(value);
        }
        // if it looks like a date
        if (value.charAt(4) == "-") {
            date = value;
        // if it looks like a timezone    
        } else if ((value.charAt(0) == "-") || (value.charAt(0) == "+") || (value == "Z")) {
            if (value.length == 2) {
                offset = value[0] + "0" + value[1];
            } else {
                offset = value;
            }
        } else {
            // else if could be a time 
            time = parseAmPmTime(value);
        }
    }
    
    if (date !== '') {
        return new ISODate(date + (time ? "T" : "") + time + offset);
    } else {
        var out = new ISODate(value);
        if(time != '') {out.ParseTime(time)}
        if(offset != '') {out.ParseTime(offset)}    
        return out;
    }
}






exports.ISODate = ISODate;
exports.isTime = isTime;
exports.isDuration = isDuration;
exports.dateTimeUnion = dateTimeUnion
exports.concatFragments = concatFragments;
exports.parseAmPmTime = parseAmPmTime;


