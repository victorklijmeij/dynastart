document.addEventListener("DOMContentLoaded", function(){
    console.log("page load");
    yamlString="";
    // nativeObject = YAML.parse($("#source").val());
    nativeObject=YAML.parse(dynacontent);
    console.log(nativeObject);
    dyna_searchvalue="";
    contenttag=window.location.hash.substr(1);
    dynastart_search_and_update(contenttag);
});


function dynastart_search_and_update(searchtag=contenttag) { 
    contenttag=searchtag;
    console.log("search for "+dyna_searchvalue+" with tag: "+contenttag);
    for (idx = 0; idx < nativeObject.length; idx++) {
        if (nativeObject[idx].name.toLowerCase().search(dyna_searchvalue) > -1) {
            if ($.inArray(searchtag, nativeObject[idx].tags) != -1 || searchtag =='' ) {
                console.log("tag "+searchtag+" in "+nativeObject[idx].tags);
                if($("#linkid" + idx).length == 0) {
                console.log("<a href=\""+nativeObject[idx].url+"\">"+nativeObject[idx].name+"\"</a>");
                $("#searchresults").append("<li  id=linkid"+idx+""+"><a href=\""+nativeObject[idx].url+"\">"+nativeObject[idx].name+"</a></li>");
                } 
            } else {
                // remove items with missing tag
                $("#searchresults #linkid"+idx).remove();
            }
        } else {
            // Remove items with missing search word
            $("#searchresults #linkid"+idx).remove();
        }
    }

}