/*!
	parse 
	Used by http://localhost:3000/
	Copyright (C) 2010 - 2015 Glenn Jones. All Rights Reserved.
	MIT License: https://raw.github.com/glennjones/microformat-shiv/master/license.txt
*/

window.onload = function() {

    var form = document.getElementById('mf-form'),
        parserJSONElt = document.querySelector('#parser-json pre code'); 
    
    form.onsubmit = function(e){
        e = (e)? e : window.event;
        
        if (e.preventDefault) {
             e.preventDefault(); 
        } else {
             event.returnValue = false; 
        }

        
        getResults( form, '/parse/', function( err, mfJSON ){
            if(mfJSON){
                
                // format output
                parserJSONElt.innerHTML = htmlEscape( js_beautify( JSON.stringify(mfJSON) ) );
                //prettyPrint(); 
                
            }else{
                parserJSONElt.innerHTML = htmlEscape( err );
            }
        });
           
        
    }
    
  
};  





function htmlEscape(str) {
    return String(str)
            .replace(/&/g, '&amp;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;');
}


function trimArrayItems( arr ){
    return arr.map(function(item){
        return item.trim();
    })
}



// post form and returns JSON
function getResults( form, url, callback ){
    var formData = new FormData( form );
    var request = new XMLHttpRequest();
    request.open("POST", url);
    request.send(formData);
    
    request.onload = function(e) {
     if (request.status == 200) {
            callback(null, JSON.parse(request.responseText));
        } else {
            callback("Error " + request.status + ' - ' + request.responseText, null);
        }
    };
}