/* PhoneNumber 
 Code is licensed under MIT License © Copyright Glenn Jones 2012. All Rights Reserved.
 -----------------------------------------------------------------------------*/

function PhoneNumber() {
    this.raw = "";
    this.canonicalisation = "";
    if (arguments[0])
        this.Parse(arguments[0]);
}


PhoneNumber.prototype.Reset = function () {
    this.raw = "";
    this.canonicalisation = "";
}


PhoneNumber.prototype.Parse = function (text) {
    this.Reset();
    this.raw = text;
    text = text.replace(" ", "");
    var parts
    parts = text.match(/[0-9\+]/g);
    if (this.isArray(parts)) {
        if (this.isArray(parts)) {
            for (var i = 0; i < parts.length; i++) {
                this.canonicalisation += parts[i];
            }
        }
    }
}


PhoneNumber.prototype.toString = function () {
    return this.canonicalisation;
}

// Is an object a array
PhoneNumber.prototype.isArray = function(obj) {
    return obj && !(obj.propertyIsEnumerable('length')) 
        && typeof obj === 'object' 
        && typeof obj.length === 'number';
}


function ComparePhoneNumbers(phoneNumber1, phoneNumber2) {
    var test1 = new PhoneNumber(phoneNumber1).toString();
    var test2 = new PhoneNumber(phoneNumber2).toString();
    if ((test1 == '') && (test2 == '')) {
        return false;
    } else {
        if (test1 == test2)
            return true;
        else
            return false;
    }
}