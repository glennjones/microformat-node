/* 
 Code is licensed under MIT License © Copyright Glenn Jones 2012. All Rights Reserved.
 -----------------------------------------------------------------------------*/


var results = new Array();

$(document).ready(function() {

  var testSuites = [
    'http://www.ufxtract.com/testsuite/hcard/default.htm',
    'http://www.ufxtract.com/testsuite/hcalendar/default.htm',
    'http://www.ufxtract.com/testsuite/hresume/default.htm',
    //'http://www.ufxtract.com/testsuite/hrecipe/default.htm',
    'http://www.ufxtract.com/testsuite/geo/default.htm'
  ]

  var testFixtures = [
    'http://microformats.org/wiki/value-dt-test-YYYY-MM-DD--HH-MM',
    'http://microformats.org/wiki/value-dt-test-abbr-YYYY-MM-DD--HH-MM',
    'http://microformats.org/wiki/value-dt-test-abbr-YYYY-MM-DD-abbr-HH-MM',
    'http://microformats.org/wiki/value-dt-test-YYYY-MM-DD--HHpm',
    'http://microformats.org/wiki/value-dt-test-YYYY-MM-DD--Hpm-EEpm',
    'http://microformats.org/wiki/value-dt-test-YYYY-MM-DD--abbr-HH-MMpm',
    'http://microformats.org/wiki/value-dt-test-YYYY-MM-DD--12am-12pm',
    'http://microformats.org/wiki/value-dt-test-YYYY-MM-DD--H-MMam-Epm',
    'http://microformats.org/wiki/value-dt-test-YYYY-MM-DD--0Ham-EEam',
    'http://microformats.org/wiki/value-dt-test-YYYY-MM-DD--H-MM-SSpm-EE-NN-UUpm',
    'http://microformats.org/wiki/value-dt-test-YYYY-DDD--HH-MM-SS',
    'http://microformats.org/wiki/value-dt-test-YYYY-MM-DD--HH-MMZ-EE-NN-UUZ',
    'http://microformats.org/wiki/value-dt-test-YYYY-MM-DD--HH-MM-XX-YY--EE-NN-UU--XXYY',
    'http://microformats.org/wiki/value-dt-test-YYYY-MM-DD--HH-MM-XX--EE-NN-UU--Y',
    'http://microformats.org/wiki/value-dt-test-YYYY-MM-DD--HH-MM-SS-XXYY--EE-NN--Z'
  ]

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
              $('<li data-url="'+ item.test[x].url +'">' + item.test[x].format + ' - ' + item.test[x].description +'</li>').appendTo('#tests').click(function(e){
                  $('#tests li').removeClass('hilight');
                  $(this).addClass('hilight');
                  loadTestFixture($(this).attr('data-url'))
              })
              x++;
          }
        }
      }
    });
  }

  //// the wiki test suite needs some more work before it can be tested against
  // for (var z = 0; z < testFixtures.length; z++) {
  //   $('<li data-url="'+ testFixtures[z] +'">' + testFixtures[z].replace('http://microformats.org/wiki/','')  +'</li>').appendTo('#tests').click(function(e){
  //     $('#tests li').removeClass('hilight');
  //     $(this).addClass('hilight');
  //     loadTestFixture($(this).attr('data-url'))
  //   })
  // }

});


function loadTestFixture(url){
  $.getJSON('../?url=' + encodeURIComponent(url) + '&callback=?', function(data) {
    loadTestData(url, data);
  });
}


function loadTestData(url,data){
  $.getJSON('../?url=' + encodeURIComponent(url + '#uf') + '&callback=?', function(ufData) {
    var testFixture = data.microformats['test-fixture'];

    if(testFixture.length > 0){
      if(data.microformats['test-fixture'][0].assert){
        var asserts = data.microformats['test-fixture'][0].assert;
        var table = addResultTable(data.microformats['test-fixture'][0].summary, url, ufData.microformats );
        runTests(asserts, ufData.microformats, table);
      }
    }else{
      alert('No test found')
    }
    
  });

}


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
  }
}


function addResultTable(title, url, microformats){
  $('#results').empty();
    $('#results').append('<h2>' + title + '</h2>');
    $('#results').append('<p><a href="' + url +'">Test page address: ' + url + '</a></p>');
    var table = $('<table></table>').appendTo('#results');
    $('#results').append('<pre><code>' + js_beautify(JSON.stringify(microformats)) + '</code></pre>');
    return table;
}


function addResult(result, table){
    $(table).append('<tr title="' + result.assert.comment + '"><td class="' + result.testStatus + '">' + result.testStatus + '</td><td>' + result.assert.test + '</td><td>' + result.assert.result + '</td></tr>')
}






