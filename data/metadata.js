// Assuming this is the content of your meta.json file
// {
//   pageTitle: "dynaStart",
//     tagLength: 10,
//       fixedTags: [
//         "fixedTags": [
//           { "tag": "TAG1", "description": "TAG 1 related links" },
//           { "tag": "TAG2", "description": "TAG 2 related links" },
//           { "tag": "TAG3", "description": "TAG 3 related links" },
//           { "tag": "TAG4", "description": "TAG 4 related links" },
//           { "tag": "TAG5", "description": "TAG 5 related links" }
//         ]
// }

// Embed the JSON data into the JavaScript file by assigning it to a variable
const metaData = {
  pageTitle: "dynaStart",
  tagLength: 10,
  topLevelFilters: [
    { "tag": "TAG1", "description": "filter on TAG 1" },
    { "tag": "TAG2", "description": "filter on TAG 2" },
    { "tag": "TAG3", "description": "filter on TAG 3" },
    { "tag": "TAG4", "description": "filter on TAG 4" },
    { "tag": "TAG5", "description": "filter on TAG 5" }
  ]
};
