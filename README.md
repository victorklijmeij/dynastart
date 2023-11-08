# dynastart
A portable startpage with dynamic search features.

Made to run from filesystem, batteries included for air gapped environments.

Data is stored in js files as a workaround for cors errors when loading from filesystem
https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS/Errors/CORSRequestNotHttp?utm_source=devtools&utm_medium=firefox-cors-errors&utm_campaign=default


## Customization
Edit hyperlinks.js to add new sites
Edit meta.js to add new tags 

## Filter and search
Tags are cut off at set number characters to prevent overflow
Try to limit the number of tags to 20 and use fixedtags for an extra layer of filtering

THe fixed tags are mandatory when selected, multiple fixed tag selections are treated as OR
Selecting secondary tags is the same as an OR and creates a broader selection of links.

The searchbox is used to search freely in the result of the fixed tag filters

## Remarks
- To many tags will add to many menu items. (no overflow yet)
- Almost no syntax check on the input files

## Todo:
Mention sources
- Jquery
- Bootstrap
