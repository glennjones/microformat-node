var helper = {};
helper.parseHTML = function(htmlFragment,baseUrl){
   var request = new XMLHttpRequest();
   request.open('GET', '../?html=' + encodeURIComponent(htmlFragment) + '&baseurl=' + encodeURIComponent(baseUrl), false);
   request.send(); 
   if (request.status === 200) {
     return JSON.parse(request.responseText);
   }else{
      return {};
   }
}