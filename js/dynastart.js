// Assuming this is the path/to/your/javascriptfile.js file
let allLinks = []; // This will hold the original array of links and tags
let tagLength = 6
// Keep track of selected tags
let selectedTags = new Set();
let selectedFixedTags = new Set();

function loadData() {
    if (metaData.pageTitle) {
        document.title = metaData.pageTitle; // Set the page title
    }
    if (metaData.tagLength) {
        tagLength = metaData.tagLength;
        document.title = metaData.pageTitle; // Set the page title
    }
    if (metaData.fixedTags && Array.isArray(metaData.fixedTags)) {
        createFixedTagMenuItems(metaData.fixedTags); // Create fixed tag menu items
    } else {
        console.error('The JSON does not contain a valid "fixedTags" array.');
    }
    
    const fixedTags = metaData.fixedTags.map(item => item.tag); // Create an  array of fixedTags
    // Fetch the unique tags and all links as shown in the previous examples
    allLinks = hyperlinksData; // Store the original data
    const uniqueTags = getUniqueTags(hyperlinksData).filter(tag => !fixedTags.includes(tag)) // Use the getUniqueTags function from earlier  
    createMenuItems(uniqueTags); // Create other tag menu items
    displayLinks(allLinks); // Display all links by default
}

// Function to get unique tags from an array of items
function getUniqueTags(items) {
    const allTags = items.flatMap(item => item.tags); // Collect all tags into a single array
    const uniqueTags = [...new Set(allTags)]; // Create a Set to remove duplicates and convert back to array
    return uniqueTags;
}

// Function to create fixed tag menu items with descriptions as tooltips
function createFixedTagMenuItems(fixedTags) {
    const fixedMenu = document.getElementById('fixedTagMenu');
    fixedTags.forEach(item => {
        const listItem = document.createElement('li');
        listItem.className = 'nav-item';
        const link = document.createElement('a');
        link.className = 'nav-link';
        link.href = '#';
        link.textContent = item.tag;
        link.title = item.description; // Set the tooltip to the tag's description
        link.addEventListener('click', (event) => {
            event.preventDefault();
            toggleFixedTagSelection(event.target, item.tag);
        });
        listItem.appendChild(link);
        fixedMenu.appendChild(listItem);
    });
    restoreSelectedTagsState();
}

// Function to create menu items based on unique tags
function createMenuItems(uniqueTags) {
    const menu = document.getElementById('tagMenu');
    // Exclude fixed tags from uniqueTags
    const fixedTags = [];
    const nonFixedTags = uniqueTags.filter(tag => !fixedTags.includes(tag));

    // Add non-fixed tags
    nonFixedTags.forEach(tag => {
        const listItem = document.createElement('li');
        listItem.className = 'nav-item';
        const link = document.createElement('a');
        link.className = 'nav-link';
        link.href = '#';
        link.textContent = tag.slice(0, tagLength); // Truncate tag to a maximum of 6 characters
        //link.textContent = tag;
        link.addEventListener('click', (event) => {
            event.preventDefault();
            toggleTagSelection(event.target, tag);
        });
        listItem.appendChild(link);
        menu.appendChild(listItem);
    });
}

// Function to toggle tag selection and update the filter
function toggleTagSelection(linkElement, tag) {
    if (selectedTags.has(tag)) {
        selectedTags.delete(tag); // Remove the tag from the selected set
        linkElement.classList.remove('active'); // Remove active class to restore original color
    } else {
        selectedTags.add(tag); // Add the tag to the selected set
        linkElement.classList.add('active'); // Add active class to change color
    }
    // Save the updated state of selectedTags to localStorage
    localStorage.setItem('selectedTags', JSON.stringify([...selectedTags]));
    filterLinksByTags(); // Re-filter and display links based on the updated selected tags
}

// Function to toggle tag selection and update the filter
function toggleFixedTagSelection(linkElement, tag) {
    if (selectedFixedTags.has(tag)) {
        selectedFixedTags.delete(tag); // Remove the tag from the selected set
        linkElement.classList.remove('active'); // Remove active class to restore original color
    } else {
        selectedFixedTags.add(tag); // Add the tag to the selected set
        linkElement.classList.add('active'); // Add active class to change color
    }
    // Save the updated state of selectedTags to localStorage
    localStorage.setItem('selectedFixedTags', JSON.stringify([...selectedFixedTags]));
    filterLinksByTags(); // Re-filter and display links based on the updated selected tags
}

// Function to filter and display links that have at least one selected tag,
// or display clicked links sorted by the number of clicks if no tags are selected
function filterLinksByTags() {
    let linksToDisplay;

    // If no tags are selected, display clicked links sorted by the number of clicks
    if (selectedTags.size === 0) {

        // Retrieve the clicked links object from localStorage and convert it to an array of [url, count] pairs
        const clickedLinks = JSON.parse(localStorage.getItem('clickedLinks') || '{}');
        const clickedLinksArray = Object.entries(clickedLinks);

        // Sort the array by the number of clicks in descending order
        clickedLinksArray.sort((a, b) => b[1] - a[1]);
  
        linksToDisplay = allLinks.filter(item =>
            item.tags.some(tag => selectedTags.has(tag))
        );

    } else {
        // Otherwise, filter links that have at least one selected tag
        linksToDisplay = allLinks.filter(item =>
            item.tags.some(tag => selectedTags.has(tag))
        );
        linksToDisplay = allLinks.filter(item =>
            item.tags.some(tag => selectedFixedTags.has(tag))
        );

    }

    displayLinks(linksToDisplay); // Display the determined set of links
}

function handleLinkClick(event) {
    event.preventDefault();
    const title = event.target.title;
    // Retrieve the current object of clicked links from localStorage
    const clickedLinks = JSON.parse(localStorage.getItem('clickedLinks') || '{}');
    // If the link has been clicked before, increment its count; otherwise, set it to 1
    if (clickedLinks[title]) {
        clickedLinks[title]++;
    } else {
        clickedLinks[title] = 1;
    }
    localStorage.setItem('clickedLinks', JSON.stringify(clickedLinks));
    // Optionally, navigate to the clicked URL
    window.location.href = event.target.href;
}

function displayClickedLinks() {
    const linksContainer = document.getElementById('linksContainer');
    linksContainer.innerHTML = ''; // Clear previous content

    // Retrieve the clicked links object from localStorage and convert it to an array of [url, count] pairs
    const clickedLinks = JSON.parse(localStorage.getItem('clickedLinks') || '{}');
    const clickedLinksArray = Object.entries(clickedLinks);

    // Sort the array by the number of clicks in descending order
    clickedLinksArray.sort((a, b) => b[1] - a[1]);

    // Display the sorted clicked links
    clickedLinksArray.forEach(([url, count]) => {
        const linkElement = document.createElement('a');
        linkElement.href = url;
        linkElement.textContent = `${url} (${count} clicks)`;
        linkElement.className = 'd-block mb-2'; // Bootstrap classes for display and margin
        linksContainer.appendChild(linkElement);
    });
}

// Function to display a list of links as cards in the main body
function displayLinks(links) {
    const linksContainer = document.getElementById('linksContainer');
    linksContainer.innerHTML = ''; // Clear previous content

    links.forEach((item) => {
        // Create card container
        const card = document.createElement('div');
        card.className = 'card mb-3'; // Bootstrap card class with margin-bottom

        // Create card body
        const cardBody = document.createElement('div');
        cardBody.className = 'card-body';

        // Create title as card title and make it a clickable link
        const cardTitleLink = document.createElement('a');
        cardTitleLink.href = item.link; // Set the href to the item's link
        cardTitleLink.className = 'card-title h5'; // Use 'h5' for title size
        cardTitleLink.textContent = item.title;
        cardTitleLink.setAttribute('target', '_blank'); // Open in new tab
        cardTitleLink.addEventListener('click', handleLinkClick);

        // Add hover event listeners to the card title link
        cardTitleLink.addEventListener('mouseenter', () => {
            card.style.backgroundColor = '#f8f9fa'; // Light gray background color on hover
        });
        cardTitleLink.addEventListener('mouseleave', () => {
            card.style.backgroundColor = ''; // Reset to original background color
        });

        // Create tooltip as card subheader
        const cardSubheader = document.createElement('h6');
        cardSubheader.className = 'card-subtitle mb-2 text-muted d-flex justify-content-between align-items-center';
        cardSubheader.textContent = item.tooltip;

        // Create documentation link if available
        if (item.documentationLink && item.documentationLink !== "0") {
            const docLink = document.createElement('a');
            docLink.href = item.documentationLink;
            docLink.className = 'card-link ml-auto'; // Use margin-left auto to push to the right
            docLink.setAttribute('target', '_blank'); // Open in new tab
            docLink.setAttribute('title', 'View documentation'); // Tooltip for the icon

            // Create the book icon for the documentation link
            const icon = document.createElement('i');
            icon.className = 'fas fa-book'; // Font Awesome book icon

            // Append the book icon to the documentation link
            docLink.appendChild(icon);

            // Append the documentation link to the subheader
            cardSubheader.appendChild(docLink);
        }

        // Append card title link and subheader to the card body
        cardBody.appendChild(cardTitleLink);
        cardBody.appendChild(cardSubheader);

        // Append card body to the card container
        card.appendChild(cardBody);

        // Append the card to the links container
        linksContainer.appendChild(card);
    });
}

// Function to filter and display links that match the search query
function filterLinksBySearch() {
    const searchQuery = document.getElementById('searchInput').value.toLowerCase();
    filteredLinks = allLinks.filter(item =>
        item.link.toLowerCase().includes(searchQuery)
    );
    console.log(searchQuery);
    if ( searchQuery == "") {
        filteredLinks = [];
        filterLinksByTags();
    }
    else {
        filteredLinks = filteredLinks.filter(item =>
            item.tags.some(tag => selectedFixedTags.has(tag))
        );
        displayLinks(filteredLinks);
    }
}

// Function to restore the state of selected tags from localStorage
function restoreSelectedTagsState() {
    const savedTags = JSON.parse(localStorage.getItem('selectedTags') || '[]');
    savedTags.forEach(tag => {
        const linkElement = document.querySelector(`.nav-link[href="#${tag}"]`);
        if (linkElement) {
            selectedTags.add(tag); // Restore the tag to the selected set
            linkElement.classList.add('active'); // Add active class to change color
        }
    });
    filterLinksByTags(); // Display links based on the restored selected tags
}

// After the displayLinks function call
$(function () {
    $('[data-toggle="tooltip"]').tooltip(); // Initialize Bootstrap tooltips
});

// Event listener for the search input field
document.getElementById('searchInput').addEventListener('input', filterLinksBySearch);

// Set focus on the search bar when the page loads
document.addEventListener('DOMContentLoaded', (event) => {
    loadData();
    // filterLinksByTags(); // Call this function to display the initial set of links
    restoreSelectedTagsState();
    document.getElementById('searchInput').focus();
});
