var chai 	= require('chai'),
    assert  = chai.assert,
    lib = require('../lib/isodate.js');
    dates = require('../lib/dates.js');

/*
To run these tests you need mocha and chia modules install on your computer
*/


describe('ISO datetime helper -', function(){

	describe('Parse W3C profile datetimes and return same value', function(){
	    it('2007', function(){
	        assert.equal(new lib.ISODate('2007').toString(), "2007");
	    });
	    it('2007-05', function(){
        	assert.equal(new lib.ISODate('2007-05').toString(), "2007-05");
        });
        it('2007-05-01', function(){
        	assert.equal(new lib.ISODate('2007-05-01').toString(), "2007-05-01");
        });
        it('2007-05-01T21:30', function(){
        	assert.equal(new lib.ISODate('2007-05-01T21:30').toString(), "2007-05-01T21:30:00");
        });
        it('2007-05-01T21:30Z', function(){
        	assert.equal(new lib.ISODate('2007-05-01T21:30Z').toString(), "2007-05-01T21:30:00Z");
        });
        it('2007-05-01T21:30:00Z', function(){
        	assert.equal(new lib.ISODate('2007-05-01T21:30:00Z').toString(), "2007-05-01T21:30:00Z");
        });
        it('2007-05-01T21:30:00Z02:00', function(){
        	assert.equal(new lib.ISODate('2007-05-01T21:30:00+02:00').toString(), "2007-05-01T21:30:00+0200"); 
        });
        it('2007-05-01T21:30+08:00', function(){
        	assert.equal(new lib.ISODate('2007-05-01T21:30+08:00').toString(), "2007-05-01T21:30:00+0800"); 
        });
        it('2007-05-01T21:30:00+08:00', function(){
        	assert.equal(new lib.ISODate('2007-05-01T21:30:00+08:00').toString(), "2007-05-01T21:30:00+0800");  
        });
        it('2007-05-01T21:30:00.0150', function(){
        	assert.equal(new lib.ISODate('2007-05-01T21:30:00.0150').toString(), "2007-05-01T21:30:00.0150");
        });
    })


    describe('Parse RFC3339 profile datetimes and return W3C profile', function(){
        it('200801', function(){
        	assert.equal(new lib.ISODate('200801').toString(), "2008-01");
        });
        it('20080121', function(){
        	assert.equal(new lib.ISODate('20080121').toString(), "2008-01-21");
        });
        it('20070501T1130', function(){
        	assert.equal(new lib.ISODate('20070501T1130').toString(), "2007-05-01T11:30:00");
        });
        it('20070501T113015', function(){
        	assert.equal(new lib.ISODate('20070501T113015').toString(), "2007-05-01T11:30:15");
        });
        it('20070501T113015Z', function(){
        	assert.equal(new lib.ISODate('20070501T113015Z').toString(), "2007-05-01T11:30:15Z");
        });
        it('20070501t113025z', function(){
        	assert.equal(new lib.ISODate('20070501t113025z').toString(), "2007-05-01T11:30:25Z");
        });
        it('20070501t113025+01:00', function(){
        	assert.equal(new lib.ISODate('20070501t113025+01:00').toString(), "2007-05-01T11:30:25+0100");
        });
    })


    describe('Parse mixed RFC3339 and W3C profile datetimes and return W3C profile', function(){
        it('2007-05-01T113025', function(){
        	assert.equal(new lib.ISODate('2007-05-01T113025').toString(), "2007-05-01T11:30:25");
        });
        it('20070501T11:30:25', function(){
        	assert.equal(new lib.ISODate('20070501T11:30:25').toString(), "2007-05-01T11:30:25");
        });
    })



    describe('isDuration', function(){
        it('PY1M11 - true', function(){
        	assert.isTrue(dates.isDuration('PY1M11'));
        });
        it('PW42 - true', function(){
        	assert.isTrue(dates.isDuration('PW42'));
        });
        it('pw34 - true', function(){
        	assert.isTrue(dates.isDuration('pw34'));
        });

        // Not
        it('11:00pm - false', function(){
        	assert.isFalse(dates.isDuration('11:00pm'));
        });
        it('2007 - false', function(){
        	assert.isFalse(dates.isDuration('2007'));
        });
        it('2007-05-01T21:30:00.0150 - false', function(){
        	assert.isFalse(dates.isDuration('2007-05-01T21:30:00.0150'));
        });
    })



    describe('parseAmPmTime', function(){
        it('21:30', function(){
        	assert.equal(dates.parseAmPmTime('21:30'), '21:30');
        });
        it('21:30:45', function(){
        	assert.equal(dates.parseAmPmTime('21:30:45'), '21:30:45');
        });
        it('21:30:45.0123', function(){
        	assert.equal(dates.parseAmPmTime('21:30:45.0123'), '21:30:45.0123');
        });
        it('9:30', function(){
        	assert.equal(dates.parseAmPmTime('9:30'), '09:30');
        });
        it('9:30pm', function(){
        	assert.equal(dates.parseAmPmTime('9:30pm'), '21:30');
        });
        it('9:30am', function(){
        	assert.equal(dates.parseAmPmTime('9:30am'), '09:30');
        });
        it('9:30A.M.', function(){
        	assert.equal(dates.parseAmPmTime('9:30A.M.'), '09:30');
        });
        it('9:30 pm', function(){
        	assert.equal(dates.parseAmPmTime('9:30 pm'), '21:30');
        });
    })




    describe('concatFragments', function(){
        it("['2007-05-01','21:30']", function(){
        	assert.equal(dates.concatFragments(['2007-05-01','21:30']).toString(), "2007-05-01T21:30:00");
        });
        it("['2007-05-01','9:30pm']", function(){
        	assert.equal(dates.concatFragments(['2007-05-01','9:30pm']).toString(), "2007-05-01T21:30:00");
        });
        it("['2007-05-01','9:30A.M.']", function(){
        	assert.equal(dates.concatFragments(['2007-05-01','9:30A.M.']).toString(), "2007-05-01T09:30:00");
        });
        it("['2007-05-01','9:30 pm']", function(){
        	assert.equal(dates.concatFragments(['2007-05-01','9:30 pm']).toString(), "2007-05-01T21:30:00");
        });
        it("['2007-05-01','09:30 pm']", function(){
        	assert.equal(dates.concatFragments(['2007-05-01','9:30 pm']).toString(), "2007-05-01T21:30:00");
        });
        it("['2007-05-01','09:30:24 pm']", function(){
        	assert.equal(dates.concatFragments(['2007-05-01','9:30:24 pm']).toString(), "2007-05-01T21:30:24");
        });
        it("['2007-05-01','09:30:24 pm','-01:00']", function(){
        	assert.equal(dates.concatFragments(['2007-05-01','09:30:24 pm', '-01:00']).toString(), "2007-05-01T21:30:24-0100");
        });
        it("['2007-05-01','09:30:24','+01:00']", function(){
        	assert.equal(dates.concatFragments(['2007-05-01','09:30:24','+01:00']).toString(), "2007-05-01T09:30:24+0100");
        });
        it("['2007-05-01','09:30:24','Z']", function(){
        	assert.equal(dates.concatFragments(['2007-05-01','9:30:24 pm','Z']).toString(), "2007-05-01T21:30:24Z");
        });
    })


    describe('dateTimeUnion', function(){
        it("'2007-05-01T19:30','21:30'", function(){
            assert.equal(dates.dateTimeUnion('2007-05-01T19:30','21:30').toString(), "2007-05-01T21:30:00");
        });

        it("'2007-05-01T19:30','21:30'", function(){
            assert.equal(dates.dateTimeUnion('2007-05-01','9:30pm').toString(), "2007-05-01T21:30:00");
        });

        it("'','garbage'", function(){
            assert.equal(dates.dateTimeUnion('','garbage').toString(), "");
        });
    })






})
 



