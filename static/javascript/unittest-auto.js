/* 
 Code is licensed under MIT License © Copyright Glenn Jones 2012. All Rights Reserved.
 -----------------------------------------------------------------------------*/


var results = new Array();

$(document).ready(function() {


  for (var y = 0; y < testSuites.length; y++) {
    $.getJSON('../?url=' + encodeURIComponent(testSuites[y]) + '&formats=test-suite', function(data) {
      if(data.microformats['test-suite']){

        var testSuite = data.microformats['test-suite'];
        for (var key in testSuite) {
          if (!testSuite.hasOwnProperty(key))
            continue;  // skip this 
                            
          var item = testSuite[key];
          var i = item.test.length;
          var x = 0;
          while (x < i) {
                loadTestFixture(item.test[x].url)
              x++;
          }
        }
      }
    });
  }


});




function runTests(asserts, microformats, table){

  for (var i = 0; i < asserts.length; i++) {

    var test = asserts[i].test;
    var result = asserts[i].result;
    var comment = asserts[i].comment;
    var testStatus = "none";
    pageNumber = 1
    resuult = {};

    if (result.indexOf("IsEqualTo(") > -1) {
        result = new Result(pageNumber, i, asserts[i], isEqualTo(test, result, comment, microformats));
    }
    else if (result.indexOf("IsEqualToCaseInsensitive(") > -1) {
        result = new Result(pageNumber, i, asserts[i], isEqualToCaseInsensitive(test, result, comment, microformats));
    }
    else if (result.indexOf("IsEqualToISODate(") > -1) {
        result = new Result(pageNumber, i, asserts[i], isEqualToISODate(test, result, comment, microformats));
    }
    else if (result.indexOf("IsEqualToGeo(") > -1) {
        result = new Result(pageNumber, i, asserts[i], isEqualToGeo(test, result, comment, microformats));
    }
    else if (result.indexOf("IsEqualToPhoneNumber(") > -1) {
        result = new Result(pageNumber, i, asserts[i], isEqualToPhoneNumber(test, result, comment, microformats));
    }
    else if (result.indexOf("IsTrue()") > -1) {
        result = new Result(pageNumber, i, asserts[i], isTrue(test, result, comment, microformats));
    }
    else if (result.indexOf("IsFalse()") > -1) {
        result = new Result(pageNumber, i, asserts[i], isFalse(test, result, comment, microformats));
    }
    else if (result.indexOf("HasProperty(") > -1) {
        result = new Result(pageNumber, i, asserts[i], HasProperty(test, result, comment, microformats));
    }
    else {
        result = new Result(pageNumber, i, asserts[i], 'unnone');
    }

    results.push(result);
    addResult(result, table);
    updateCounts(result);
  }
}


function addResultTable(title, url, microformats){
    $('#results').append('<h2>' + title + '</h2>');
    $('#results').append('<p><a href="' + url +'">Test page address: ' + url + '</a></p>');
    var table = $('<table></table>').appendTo('#results');
    return table;
}

function addResult(result, table){
    if(result.testStatus === 'failed')
    $(table).append('<tr title="' + result.assert.comment + '"><td class="' + result.testStatus + '">' + result.testStatus + '</td><td>' + result.assert.test + '</td><td>' + result.assert.result + '</td></tr>')
}

var testCount = 0;
var testFailed = 0;

function updateCounts(result){
  testCount ++;
  if(result.testStatus === 'failed')
    testFailed ++;

  var percent =  trimNumberTo2Places( 100 -(testFailed/testCount * 100) );
  $('#totals').html('<h2><strong>Total test passed: ' 
    + (testCount - testFailed) + ' out ' 
    + testCount  + ' - (' + 
    percent + '%)</strong></h2>')
}











