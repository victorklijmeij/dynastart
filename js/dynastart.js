document.addEventListener("DOMContentLoaded", function(){
    console.log("page load");
    yamlString="";
    // const alltags = new Set()
    // nativeObject = YAML.parse($("#source").val());
    nativeObject=YAML.parse(dynacontent);
    console.log(nativeObject);
    dyna_searchvalue="";
    contenttag=window.location.hash.substr(1);
    dynastart_search_and_update(contenttag);
    // get all unique tags
    alltags = [];
    for (idx = 0; idx < nativeObject.length; idx++) {
        alltags = alltags.concat(nativeObject[idx].tags);
    }
    let uniqueTags = [...new Set(alltags)]
    console.log(uniqueTags);
    // create menu items from tags
    for(let key of uniqueTags) {
        $("#dynamenu").append(`<a class="nav-item nav-link" href="#news" onclick='dynastart_search_and_update("${key}");'\>${key}</a>`);
    }
});

//jQuery detect user pressing enter
$(document).bind("keydown", function(e) {
    if(e.which == 13 && e.ctrlKey){
        console.log('Google search!');
        window.open('https://www.google.com/search?q='+dyna_searchvalue, '_blank');
    } else if (e.which == 68  && event.ctrlKey){
        console.log('ducduckgo search!');
        window.open('https://duckduckgo.com/?q='+dyna_searchvalue, '_blank');
    } else if (e.which == 13) {
        console.log('User pressed Enter!');
        window.open('https://duckduckgo.com/?q='+dyna_searchvalue, '_blank');
    } else if (e.which == 82  && event.ctrlKey){
        console.log('reddit search!');
        window.open('https://reddit.com/search?q='+dyna_searchvalue, '_blank');
    }
    // http://www.reddit.com/r/redditdev/search?q=
});

function dynastart_search_and_update(searchtag=contenttag) { 
    contenttag=searchtag;
    console.log("search for "+dyna_searchvalue+" with tag: "+contenttag);
    for (idx = 0; idx < nativeObject.length; idx++) {
        if (nativeObject[idx].name.toLowerCase().search(dyna_searchvalue) > -1 ) {
            if ($.inArray(searchtag, nativeObject[idx].tags) != -1 || searchtag =='' ) {
                console.log("tag "+searchtag+" in "+nativeObject[idx].tags);
                if($("#linkid" + idx).length == 0) {
                console.log("<a href=\""+nativeObject[idx].url+"\">"+nativeObject[idx].name+"\"</a>");
                $("#searchresults").append("<li  id=linkid"+idx+""+"><a href=\""+nativeObject[idx].url+"\" target=\"_blank\">"+nativeObject[idx].name+"</a></li>");
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
    if ( document.querySelectorAll("#searchresults li").length == 1 ) {
        console.log(document.querySelectorAll("#searchresults li").length)
        if (dyna_searchvalue.key === 'Enter' || dyna_searchvalue.keyCode === 13) {
            console.log("whoo open link");
            window.open('http://stackoverflow.com/', '_blank');
            // Do something
        } else {
            console.log("wait for enter key");
        }
    }

}

/*
    if (e.key === 'Enter' || e.keyCode === 13) {
        // Do something
    }
*/