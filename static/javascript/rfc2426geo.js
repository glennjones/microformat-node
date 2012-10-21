/* RFC2426Geo
 Code is licensed under MIT License © Copyright Glenn Jones 2012. All Rights Reserved.
 -----------------------------------------------------------------------------*/


function RFC2426Geo() {
    this.latitude = 0;
    this.longitude = 0;

    if (arguments[0])
        this.Parse(arguments[0]);
}


RFC2426Geo.prototype.Parse = function (geo) {

    this.Reset();
    if (geo.indexOf(";") > 0) {
        parts = geo.split(';');

        // Make sure no more 6 decimal places
        this.latitude = parseFloat(parts[0]).toFixed(6);
        this.longitude = parseFloat(parts[1]).toFixed(6);

        // Remove trailing zero's
        this.latitude = parseFloat(this.FormatNumber(String(this.latitude)));
        this.longitude = parseFloat(this.FormatNumber(String(this.longitude)));

        if (this.latitude > 90 || this.latitude < -90)
            this.latitude = 0;

        if (this.longitude > 180 || this.longitude < -180)
            this.longitude = 0;

    }
}


RFC2426Geo.prototype.Reset = function () {
    this.latitude = 0;
    this.longitude = 0;
}


// Returns location in RFC2426 geo format
RFC2426Geo.prototype.toString = function () {
    return this.latitude + ";" + this.longitude;
}


RFC2426Geo.prototype.FormatNumber = function (geo) {

    var decPos = geo.indexOf(".")
    if (decPos > -1) {
        first = geo.substring(0, decPos);
        second = geo.substring(decPos, geo.length);

        while (second.charAt(second.length - 1) == "0")
            second = second.substring(0, second.length - 1);

        if (second.length > 1)
            return first + second;
        else
            return first;

    }
    return geo;
}


function CompareRFC2426Geo(geo1, geo2) {
    var converted1 = new RFC2426Geo(geo1).toString();
    var converted2 = new RFC2426Geo(geo2).toString();
    if ((converted1 == '') && (converted2 == '')) {
        return false;
    } else {
        if (converted1 == converted2)
            return true;
        else
            return false;
    }
}
