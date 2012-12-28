/*!
    isodate.js
    Copyright (C) 2010 - 2012 Glenn Jones. All Rights Reserved.
    Open License: https://raw.github.com/glennjones/microformat-node/master/license.txt
*/

function ISODate() {
    this.dY;
    this.dM = -1;
    this.dD = -1;
    this.z = false;
    this.tH;
    this.tM = -1;
    this.tS = -1;
    this.tD = -1;
    this.tzH;
    this.tzM = -1;
    this.tzPN = '+';
    this.z = false;
    this.format = 'W3C' // W3C or RFC3339

    if (arguments[0])
        this.Parse(arguments[0]);
}

ISODate.prototype.Parse = function (dateString) {

    var dateNormalised = '', parts;
    var datePart = '', timePart = '', timeZonePart = '';
    dateString = dateString.toString().toUpperCase();


    // Break on 'T' divider or space
    if (dateString.indexOf('T') > -1) {
        parts = dateString.split('T');
        datePart = parts[0];
        timePart = parts[1];

        // Zulu UTC and time zone break
        if (timePart.indexOf('Z') > -1 || timePart.indexOf('+') > -1 || timePart.indexOf('-') > -1) {
            var tzArray = timePart.split('Z');
            timePart = tzArray[0];
            timeZonePart = tzArray[1];
            this.z = true;

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
}


ISODate.prototype.ParseDate = function (dateString) {
    var dateNormalised = '', parts;
    // YYYY-MM-DD ie 2008-05-01 and YYYYMMDD ie 20080501
    parts = dateString.match(/(\d\d\d\d)?-?(\d\d)?-?(\d\d)?/);
    if (parts[1]) { this.dY = parts[1] };
    if (parts[2]) { this.dM = parts[2] };
    if (parts[3]) { this.dD = parts[3] };
}

ISODate.prototype.ParseTime = function (timeString) {
    var timeNormalised = '';
    // Finds timezone HH:MM:SS and HHMMSS  ie 13:30:45, 133045 and 13:30:45.0135
    var parts = timeString.match(/(\d\d)?:?(\d\d)?:?(\d\d)?.?([0-9]+)?/);
    timeSegment = timeString;
    if (parts[1]) { this.tH = parts[1] };
    if (parts[2]) { this.tM = parts[2] };
    if (parts[3]) { this.tS = parts[3] };
    if (parts[4]) { this.tD = parts[4] };
}

ISODate.prototype.ParseTimeZone = function (timeString) {
    var timeNormalised = '';
    // Finds timezone +HH:MM and +HHMM  ie +13:30 and +1330
    var parts = timeString.match(/([-+]{1})?(\d\d)?:?(\d\d)?/);
    if (parts[1]) { this.tzPN = parts[1] };
    if (parts[2]) { this.tzH = parts[2] };
    if (parts[3]) { this.tzM = parts[3] };
}

// Returns datetime in W3C Note datetime profile or RFC 3339 profile
ISODate.prototype.toString = function () {
    if (this.format == 'W3C') {
        dsep = '-';
        tsep = ':';
    }
    if (this.format == 'RFC3339') {
        dsep = '';
        tsep = '';
    }

    var output = '';
    if (typeof (this.dY) != 'undefined') {
        output = this.dY;
        if (this.dM > 0 && this.dM < 13) {
            output += dsep + this.dM;
            if (this.dD > 0 && this.dD < 32) {
                output += dsep + this.dD;
                if (this.tH > -1 && this.tH < 25) {
                    output += 'T' + getTimeString(this);
                }
            }
        }
    }else if (typeof (this.tH) != 'undefined'){
        output += getTimeString(this);
    }

    // returns just the time element of a ISO date
    function getTimeString(iso){
        var out = '';
        // Time and can only be created with a full date
        if (typeof (iso.tH) != 'undefined') {
            if (iso.tH > -1 && iso.tH < 25) {
                out += iso.tH
                if (iso.tM > -1 && iso.tM < 61) {
                    out += tsep + iso.tM;
                    if (iso.tS > -1 && iso.tS < 61) {
                        out += tsep + iso.tS;
                        if (iso.tD > -1)
                            out += '.' + iso.tD;
                    }
                }
                // Time zone offset can only be created with a hour
                if (iso.z) { out += 'Z' };
                if (typeof (iso.tzH) != 'undefined') {
                    if (iso.tzH > -1 && iso.tzH < 25) {
                        out += iso.tzPN + iso.tzH
                        if (iso.tzM > -1 && iso.tzM < 61)
                            out += tsep + iso.tzM;
                    }
                }
            }
        }
        return out;
    }

    return output;
}



// used to compare to dates
function compareISODates(date1, date2) {
    var iso1 = new ISODate(date1).toString().replace(/:00/g, "");
    var iso2 = new ISODate(date2).toString().replace(/:00/g, "");
    if ((iso1 == '') && (iso2 == '')) {
        return false;
    } else {
        if (iso1 == iso2)
            return true;
        else
            return false;
    }
}


// is str just a full date without the time element
// ie YYYY-MM-DD - 2008-05-01
function isDate(str) {
    if(!str.match('t') && !str.match(':')){
        var iso = new ISODate();
        iso.ParseDate(str)
        if(this.dY && this.dM > -1 && this.dD > -1){
            return true
        }
    }
    return false
}


// parses time string and turns them into a 24hr 
// 5:34am = 05:34:00 or 1:52:4p.m. = 13:52:04
function parseMeridiemTimes(time){
    time = time.toLowerCase();
    if (time.match("am") || time.match("a.m.")) {
        time = time.replace("am", "");
        time = time.replace("a.m.", "");
        var times = time.split(":");
        if (times[0] == "12") {
            times[0] = "00";
        }
        if (times[0].length == 1) {
            times[0] = "0" + times[0];
        }
        if (times.length > 1) {
            time = times.join(":");
        } else {
            time = times[0] + ":00:00";
        }
        if (times.length == 2) {
            time += ":00";
        }
    }
    if (time.match("pm") || time.match("p.m.")) {
        time = time.replace("pm", "");
        time = time.replace("p.m.", "");
        times = time.split(":");
        if (times[0] < 12) {
            times[0] = parseInt(times[0], 10) + 12;
        }
        if (times[0].length == 1) {
            times[0] = "0" + times[0];
        }
        if (times.length > 1) {
            time = times.join(":");
        } else {
            time = times[0] + ":00:00";
        }
        if (times.length == 2) {
            time += ":00";
        }
    }
    return time;
}





// passed an array of date/time fragments it creates 
// an iso datetime string using microformat rules for value and value-title
function concatFragments(arr){
    var date = '',
        time = '',
        offset = '';
    for (var i = 0; i < arr.length; i++) {
        value = arr[i]
        if (value.match("T")) {
            return this.normalizeISO8601(value);
        }
        if (value.charAt(4) == "-") {
            date = value;
        } else if ((value.charAt(0) == "-") || (value.charAt(0) == "+") || (value == "Z")) {
            if (value.length == 2) {
                offset = value[0] + "0" + value[1];
            } else {
                offset = value;
            }
        } else {
            time = value;
        }
    }
    time = parseMeridiemTimes(time);
    if (date !== '') {
        return new ISODate(date + (time ? "T" : "") + time + offset).toString();
    } else {
        return time + offset;
    }
}








exports.ISODate = ISODate;
exports.isDate = isDate;
exports.concatFragments = concatFragments;
exports.parseMeridiemTimes = parseMeridiemTimes;
exports.compareISODates = compareISODates;

