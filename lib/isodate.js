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
    dateString = dateString.toUpperCase();


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
                // Time and can only be created with a full date
                if (typeof (this.tH) != 'undefined') {
                    if (this.tH > -1 && this.tH < 25) {
                        output += 'T' + this.tH
                        if (this.tM > -1 && this.tM < 61) {
                            output += tsep + this.tM;
                            if (this.tS > -1 && this.tS < 61) {
                                output += tsep + this.tS;
                                if (this.tD > -1)
                                    output += '.' + this.tD;
                            }
                        }
                        // Time zone offset can only be created with a hour
                        if (this.z) { output += 'Z' };
                        if (typeof (this.tzH) != 'undefined') {
                            if (this.tzH > -1 && this.tzH < 25) {
                                output += this.tzPN + this.tzH
                                if (this.tzM > -1 && this.tzM < 61)
                                    output += tsep + this.tzM;
                            }
                        }
                    }
                }
            }
        }
    }
    return output;
}


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


exports.ISODate = ISODate;
exports.compareISODates = compareISODates;

