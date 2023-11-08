# dynastart
A portable startpage with dynamic search features
Designed to run from a local directory, batteries included for air gapped environments.

Data is stored in js files as a workaround for cors errors when loading from filesystem
https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS/Errors/CORSRequestNotHttp?utm_source=devtools&utm_medium=firefox-cors-errors&utm_campaign=default

Edit hyperlinks.js to add new sites
Edit meta.js to add new tags 

## Filter and search
Tags are cut off at 6 characters to prevent overflow
Try to limit the number of tags to 20 and use fixedtags for an extra layer of filtering

THe fixed tags are mandatory when selected, multiple fixed tag selections are treated as OR
Selecting secondary tags is the same as an OR and creates a broader selection of links.

The searchbox is used to search in the result of tag filters

## Remarks
- To many tags will add to many menu items. (no overflow yet)
- No syntax check on the input file

## Todo:
Mention sources
- Jquery
- Bootstrap