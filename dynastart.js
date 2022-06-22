document.addEventListener("DOMContentLoaded", function(){
    console.log("page load");
    yamlString="";
    nativeObject = YAML.parse($("#source").val());
    console.log(nativeObject);
    dyna_searchvalue="";
    dynastart_search_and_update();
});


function dynastart_search_and_update() { 
    contenttag=window.location.hash.substr(1);
    console.log("function call search and update");
    // console.log(nativeObject);
    // console.log("func "+$("#searchTheKey").val());

    console.log("search for "+dyna_searchvalue+" with tag: "+contenttag);
    for (idx = 0; idx < nativeObject.length; idx++) {
        if (nativeObject[idx].name.toLowerCase().search(dyna_searchvalue) > -1) {
            if ($.inArray(contenttag, nativeObject[idx].tags) != -1 || contenttag =='' ) {
                console.log("tag "+contenttag+" in "+nativeObject[idx].tags);
                if($("#linkid" + idx).length == 0) {
                console.log("<a href=\""+nativeObject[idx].url+"\">"+nativeObject[idx].name+"\"</a>");
                $("#searchresults").append("<li  id=linkid"+idx+""+"><a href=\""+nativeObject[idx].url+"\">"+nativeObject[idx].name+"</a></li>");
                } 
            } else {
                console.log("tag "+contenttag+" not in "+nativeObject[idx].tags);
                $("#searchresults #linkid"+idx).remove();
            }
        } else {
            // console.log("remove #searchresults #linkid"+idx);
            $("#searchresults #linkid"+idx).remove();
        }
    }

}