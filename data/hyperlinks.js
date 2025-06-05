// [
//   {
//     "title": "Example Link 1",
//     "link": "https://www.example1.com",
//     "tags": ["Dev", "Lab"],
//     "tooltip": "This is a tooltip for Example Link 1",
//     "documentationLink": "https://www.example1.com/docs"
//   },
//   {
//     "title": "Example Link 2",
//     "link": "https://www.example2.com",
//     "tags": ["RSI", "BUS"],
//     "tooltip": "This is a tooltip for Example Link 2",
//     "documentationLink": "https://www.example2.com/docs"
//   }
//   // ... more link objects
// ]

// Embed the JSON data into the JavaScript file by assigning it to a variable
const hyperlinksData = [
  {
    "link": "https://www.nu.nl",
    "title": "NU.nl",
    "tooltip": "Netherlands News - General and Current Events",
    "rssfeed": true,
    "documentationLink": "https://www.nu.nl/documentation",
    "tags": [
      "General",
      "Current",
      "National"
    ],
    "uid": "c9ebefa0-9f55-4f7b-bf41-f650a41ee2f6",
    "openInTab": false
  },
  {
    "link": "https://www.ad.nl",
    "title": "AD.nl",
    "tooltip": "Netherlands News - Sports and Media",
    "tags": [
      "General",
      "Sports"
    ],
    "uid": "1fb07e16-4855-4596-bec1-d9e68ca47172",
    "openInTab": false
  },
  {
    "link": "https://www.volkskrant.nl",
    "title": "de Volkskrant",
    "tooltip": "Netherlands News - Politics and Culture",
    "tags": [
      "Politics",
      "Culture",
      "Opinion"
    ],
    "uid": "e88fa7ac-9660-4304-b326-9fbbe5e944fc",
    "openInTab": false
  },
  {
    "link": "https://www.nos.nl",
    "title": "NOS",
    "tooltip": "Netherlands News - General News and Multimedia",
    "tags": [
      "General",
      "Sports",
      "Multimedia",
      "TAG1"
    ],
    "uid": "c23fe5b9-f3f2-4d3c-a333-92b3aada2c57",
    "openInTab": false
  },
  {
    "link": "https://www.telegraaf.nl",
    "title": "De Telegraaf",
    "tooltip": "Netherlands News - Finance and Media",
    "tags": [
      "General",
      "Finance"
    ],
    "uid": "23002b21-cbf7-42ca-a91f-8ea980411d80",
    "openInTab": false
  },
  {
    "link": "https://www.techcrunch.com",
    "title": "TechCrunch",
    "tooltip": "The latest technology news and information on startups",
    "tags": [
      "Technology",
      "Startups",
      "Gadgets",
      "TAG2"
    ],
    "documentationLink": "https://www.techcrunch.com/documentation",
    "uid": "e06cbfea-b9a9-4571-8d5f-57394dc1f157",
    "openInTab": false
  },
  {
    "link": "https://www.theverge.com",
    "title": "The Verge",
    "tooltip": "Covers the intersection of technology, science, art, and culture",
    "tags": [
      "Technology",
      "Science",
      "Culture"
    ],
    "documentationLink": "https://www.theverge.com/documentation",
    "uid": "71c2b7b0-002c-49cd-8a09-a5c1cd1923ba",
    "openInTab": false
  },
  {
    "link": "https://www.wired.com",
    "title": "Wired",
    "tooltip": "In-depth coverage of current and future trends in technology",
    "tags": [
      "Technology",
      "Future",
      "Culture"
    ],
    "documentationLink": "https://www.wired.com/documentation",
    "uid": "998d9979-9324-41c0-a56b-4456e6f15905",
    "openInTab": false
  },
  {
    "link": "https://www.arstechnica.com",
    "title": "Ars Technica",
    "tooltip": "Tech news, analysis, and reviews",
    "tags": [
      "Technology",
      "Analysis",
      "Reviews"
    ],
    "documentationLink": "https://www.arstechnica.com/documentation",
    "uid": "d6bb6a3d-402b-4059-ba6b-2fcdfa4e3efb",
    "openInTab": false
  },
  {
    "link": "https://www.cnet.com",
    "title": "CNET",
    "tooltip": "Tech product reviews, news, prices, and more",
    "tags": [
      "Technology",
      "Reviews",
      "News"
    ],
    "documentationLink": "https://www.cnet.com/documentation",
    "uid": "3096806b-79ef-417a-adb3-29d6f5680cad",
    "openInTab": false
  },
  {
    "title": "TechCrunch",
    "link": "https://www.techcrunch.com",
    "tooltip": "The latest technology news and information on startups",
    "tags": [
      "Technology",
      "Startups",
      "Gadgets",
      "TAG2"
    ],
    "documentationLink": "https://www.techcrunch.com/documentation",
    "uid": "b2a3f7f1-a041-4e77-87d8-b40f0b665dc2",
    "openInTab": true
  },
  {
    "title": "NU.nl",
    "link": "https://www.nu.nl",
    "tooltip": "Netherlands News - General and Current Events",
    "tags": [
      "General",
      "Current",
      "National"
    ],
    "documentationLink": "https://www.nu.nl/documentation",
    "uid": "bb9595b2-c439-46d3-8838-911f3c00b58b",
    "openInTab": true
  }
];