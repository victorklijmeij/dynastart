// Assuming this is the path/to/your/javascriptfile.js file
/**
 * Global variables to manage links and tags.
 */
let allLinks = [];
let selectedLinks = []; // This will hold the original array of links and tags
let fixedTags = [];
let tagLength = 6;
let selectedFixedTags = new Set(); // Keep track of Fixed tags
let selectedTags = new Set();  // Keep track of secondary tags
let debug = false; // Global debug flag

/**
 * Logs debug information to the console if the debug flag is set.
 * @param  {...any} args - The arguments to log.
 */
function debugLog(...args) {
    if (debug) {
        console.log(...args);
    }
}


async function loadFeed(url) {
  const res = await fetch(url);
  const xmlText = await res.text();

  const parser = new DOMParser();
  const xmlDoc = parser.parseFromString(xmlText, "application/xml");

  const items = xmlDoc.querySelectorAll("item"); // for RSS
  // const entries = xmlDoc.querySelectorAll("entry"); // for Atom

  const feed = Array.from(items).map(item => ({
    title: item.querySelector("title")?.textContent,
    link: item.querySelector("link")?.textContent,
    description: item.querySelector("description")?.textContent,
    pubDate: item.querySelector("pubDate")?.textContent
  }));

  console.log(feed);
}

// Demo load feed from tweakers
loadFeed("https://tweakers.net/feeds/nieuws.xml");

/**
 * Generates a unique identifier (UID) for new items.
 * @returns {string} A unique identifier string.
 */
function generateUID() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        const r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}

/**
 * Adds or updates a link in the updatedLinks array and updates local storage.
 * @param {Object} updatedItem - The item to add or update.
 */
function addUpdatedLink(updatedItem) {
    // Assign a UID to the item if it doesn't have one
    if (!updatedItem.uid) {
        updatedItem.uid = generateUID();
    }

    // Add or update the item in updatedLinks
    const updatedLinksIndex = updatedLinks.findIndex(i => i.uid === updatedItem.uid);
    if (updatedLinksIndex !== -1) {
        updatedLinks[updatedLinksIndex] = updatedItem;
    } else {
        updatedLinks.push(updatedItem);
    }

    // Remove the item from newLinks if it exists
    newLinks = newLinks.filter(i => i.uid !== updatedItem.uid);

    // Update local storage
    localStorage.setItem('updatedLinks', JSON.stringify(updatedLinks));
}

/**
 * Deletes a link from the updatedLinks array and updates local storage.
 * @param {string} title - The title of the item to delete.
 */
function deleteUpdatedLink(uid) {
    updatedLinks = updatedLinks.filter(item => item.uid !== uid);
    localStorage.setItem('updatedLinks', JSON.stringify(updatedLinks));
}

/**
 * Adds a link to the deletedLinks array and updates local storage.
 * @param {Object} deletedItem - The item to add to deletedLinks.
 */
function addDeletedLink(deletedItem) {
    // Remove the item from deletedLinks if it exists
    deletedLinks = deletedLinks.filter(item => item.title.toLowerCase() !== deletedItem.title.toLowerCase());
    
    // Add the item to deletedLinks
    deletedLinks.push(deletedItem);
    localStorage.setItem('deletedLinks', JSON.stringify(deletedLinks));
}

/**
 * Deletes a link from the deletedLinks array and updates local storage.
 * @param {string} title - The title of the item to delete.
 */
function deleteDeletedLink(title) {
    deletedLinks = deletedLinks.filter(item => item.title.toLowerCase() !== title.toLowerCase());
    localStorage.setItem('deletedLinks', JSON.stringify(deletedLinks));
}

/**
 * Retrieves an item based on its UID.
 * @param {string} uid - The UID of the item to retrieve.
 * @returns {Object} The item with the specified UID.
 */
function getItem(uid) {
    const allLinks = getAlllinks();
    const foundItem = allLinks.find(item => item.uid === uid);
    debugLog("getItem ", foundItem);
    return foundItem;
}

/**
 * Retrieves selected tags from local storage.
 * @returns {Set} A set of selected tags.
 */
function getSelectedTags() {
    const loadedTags = new Set(JSON.parse(localStorage.getItem('selectedTags') || '[]')); 
    return loadedTags;
}

/**
 * Updates the selected tags in local storage.
 * @param {Set} tagSet - The set of tags to store.
 */
function setSelectedTags(tagSet) {
    localStorage.setItem('selectedTags', JSON.stringify([...tagSet])); // Update local storage
    selectedTags = tagSet;
}

/**
 * Checks if a UID exists in an array of items.
 * @param {string} uid - The UID to check.
 * @param {Array} array - The array of items to search.
 * @returns {boolean} True if the UID exists, false otherwise.
 */
function uidExists(uid, array) {
    return array.some(item => item.uid === uid);
}

/**
 * Initializes the application by loading data from local storage and setting up the page.
 */
function loadData() {
    debugLog("Init and load Data");
    updatedLinks = JSON.parse(localStorage.getItem('updatedLinks') || '[]'); 
    deletedLinks = JSON.parse(localStorage.getItem('deletedLinks') || '[]');
    localStorage.setItem('hyperlinksData', JSON.stringify(hyperlinksData));

    if (metaData.pageTitle) {
        document.title = metaData.pageTitle; // Set the page title
    }

    if (metaData.tagLength !== undefined) {
        tagLength = metaData.tagLength;
    }

    if (metaData.topLevelFilters && Array.isArray(metaData.topLevelFilters)) {
        createFixedTagMenuItems(metaData.topLevelFilters); // Create fixed tag menu items
    }

    fixedTags = metaData.topLevelFilters.map(item => item.tag); // Create an array of fixedTags

    $('#editSiteModal').modal('hide');
}


/**
 * Gets unique tags from an array of items.
 * @param {Array} items - The array of items to extract tags from.
 * @returns {Array} An array of unique tags.
 */
function getUniqueTags(items) {
    const allTags = items.flatMap(item => item.tags); // Collect all tags into a single array
    const uniqueTags = [...new Set(allTags)]; // Create a Set to remove duplicates and convert back to array
    return uniqueTags;
}

/**
 * Creates fixed tag menu items with descriptions as tooltips.
 * @param {Array} fixedTags - The array of fixed tags to create menu items for.
 */
function createFixedTagMenuItems(fixedTags) {

    const fixedMenu = document.getElementById('fixedTagMenu');

    fixedTags.forEach(item => {
        const listItem = document.createElement('li');
        listItem.className = 'nav-item';
        const link = document.createElement('a');
        link.className = 'nav-link';
        link.href = `#${item.tag}`; // restore in reload based on href
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

/**
 * Creates menu items based on unique tags.
 * @param {Array} uniqueTags - The array of unique tags to create menu items for.
 */
function createMenuItems(uniqueTags) {
    storedTags = JSON.parse(localStorage.getItem('selectedTags') || '[]')
    selectedTags = getSelectedTags(); //new Set(JSON.parse(localStorage.getItem('selectedTags') || '[]'))
 
    const removeTags = JSON.parse(localStorage.getItem('selectedTags') || '[]').filter(tag => !uniqueTags.includes(tag));
    removeTags.forEach(tag => {
        storedTags = storedTags.filter(item => item !== tag)
    })
    localStorage.setItem('selectedTags', JSON.stringify([...storedTags])); // Update local storage
    const menu = document.getElementById('tagMenu');
    // Exclude fixed tags from uniqueTags
    const fixedTags = [];
    const nonFixedTags = uniqueTags.filter(tag => !fixedTags.includes(tag));

    // Remove all list items
    while (menu.firstChild) {                                                                                                                     
        menu.removeChild(menu.firstChild);                                                                                                        
    }                                                                                                                                             

    // Add non-fixed tags
    uniqueTags.forEach(tag => {
        const listItem = document.createElement('li');
        listItem.className = 'nav-item';
        const link = document.createElement('a');
        link.className = 'nav-link tag';
        link.href = `#${tag}`; // Not restorable 
        link.textContent = tag.slice(0, tagLength); // Truncate tag to a maximum of 6 characters
        link.addEventListener('click', (event) => {
            event.preventDefault();
            toggleTagSelection(event.target, tag);
        });
        listItem.appendChild(link);
        menu.appendChild(listItem);
    });
    const savedTags = JSON.parse(localStorage.getItem('selectedTags') || '[]').filter(tag => uniqueTags.includes(tag));
    savedTags.forEach(tag => {
        const linkElement = menu.querySelector(`.nav-link[href="#${tag}"]`);
        if (linkElement) {
            linkElement.classList.add('active'); // Add active class to change color
            selectedTags.add(tag); // Restore the tag to the selected set
        }
    });
    localStorage.setItem('selectedFixedTags', JSON.stringify([...selectedFixedTags]));
}

/**
 * Toggles primary tag selection and updates the filter when a menu item is clicked.
 * @param {HTMLElement} linkElement - The link element that was clicked.
 * @param {string} tag - The tag associated with the link element.
 */
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
    debugLog("Fixedtag set active");
    filterLinksByTags(); // Re-filter and display links based on the updated selected tags
}

/**
 * Toggles secondary tag selection and updates the filter.
 * @param {HTMLElement} linkElement - The link element that was clicked.
 * @param {string} tag - The tag associated with the link element.
 */
function toggleTagSelection(linkElement, tag) {
    selectedTags = new Set(JSON.parse(localStorage.getItem('selectedTags') || '[]'))
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

/**
 * Filters and displays links that have at least one selected tag,
 * or displays clicked links sorted by the number of clicks if no tags are selected.
 */
function filterLinksByTags() {
    selectedLinks = [];
    let tagselectedLinks = [];
    let allLinks = getAlllinks();
    selectedTags = new Set(JSON.parse(localStorage.getItem('selectedTags') || '[]'));
    const secondaryTags = getSelectedTags();
    const searchQuery = document.getElementById('searchInput').value.toLowerCase();
    // Determine search mode based on prefix
    let searchMode = 'default';
    let query = searchQuery;

    if (searchQuery.startsWith('!')) {
        searchMode = 'title';
        query = searchQuery.slice(1); // Remove the '!' prefix
    } else if (searchQuery.startsWith('#')) {
        searchMode = 'tooltip';
        query = searchQuery.slice(1); // Remove the '#' prefix
    }

    // Pre-filter all links based on search mode
    let searchfilteredLinks = allLinks.filter(item => {
        if (searchMode === 'title') {
            return item.title.toLowerCase().includes(query);
        } else if (searchMode === 'tooltip') {
            return item.tooltip.toLowerCase().includes(query);
        } else {
            return item.title.toLowerCase().includes(query) || item.tooltip.toLowerCase().includes(query);
        }
    });

    // Default to all links when no search query
    if (searchQuery === "") {
        searchfilteredLinks = allLinks;
    }
    debugLog("Selected fixed tags", selectedFixedTags);
    debugLog("Selected tags", selectedTags);

    // First filter out all links that do not have selected fixed tags
    if (selectedFixedTags.size > 0) {
        tagselectedLinks = [];
        searchfilteredLinks.forEach((item) => {
            // include items that have the fixed tag
            if (item.tags.some(tag => selectedFixedTags.has(tag))) {
                debugLog("Match", item);
                tagselectedLinks.push(item);
            } 
        }); 
    } else {
        tagselectedLinks = searchfilteredLinks;
        debugLog("No tags selected");
    }
    debugLog("Filtered links fixed tags ", tagselectedLinks);

    // If secondary tags are selected, filter the links to include items with tags and items with none of the fixed tags.
    let newTags = [];
    selectedTags.forEach((item) => {
        debugLog(item);
        tagselectedLinks.forEach(tag => {
            if (tag.tags.includes(item)) {
                newTags.push(item);
            }            
        });
        setSelectedTags(new Set(newTags));
    });
    debugLog("newTags", newTags);
    
    if (selectedTags.size > 0) {
        debugLog("Selected tags", selectedTags);
        selectedLinks = tagselectedLinks.filter(item =>
            item.tags.some(tag => selectedTags.has(tag))
        );
    } else {
        selectedLinks = tagselectedLinks;
    }
    // Sort selectedLinks by click count in descending order
    const clickedLinks = JSON.parse(localStorage.getItem('clickedLinks') || '{}');
    selectedLinks.sort((a, b) => (clickedLinks[b.uid] || 0) - (clickedLinks[a.uid] || 0));

    debugLog("Selected links sorted by clicks", selectedLinks);

    // Filter tags and remove tags that have no items
    const allTags = [];
    tagselectedLinks.forEach(item => {
        allTags.push(...item.tags);
    });
    const uniqueTags = new Set(allTags);

    const filteredTags = [];
    uniqueTags.forEach(tag => {
        if (tagselectedLinks.some(item => item.tags.includes(tag))) {
            filteredTags.push(tag);
        }
    });

    // Hide tags that have no items
    const allTagElements = document.querySelectorAll('.tag');
    allTagElements.forEach(tagElement => {
        const tag = tagElement.textContent;
        if (!filteredTags.includes(tag)) {
            tagElement.style.display = 'none';
        } else {
            tagElement.style.display = 'inline-block';
        }
    });

    debugLog("Filterlinks final ", selectedLinks);

    displayLinks(selectedLinks);
    
    // Display export button when there are changes
    if (updatedLinks.length > 0 || deletedLinks.length > 0) {
        document.getElementById('exportLinksButtonContainer').style.display = 'block';
    } else {
        document.getElementById('exportLinksButtonContainer').style.display = 'none';
    }
}

/**
 * Handles a title click for counts and optionally navigates to the clicked URL.
 * @param {Event} event - The click event.
 */
function handleLinkClick(event) {
    event.preventDefault();
    console.log(event.target);
    const title = event.target.title;
    const uid = event.target.getAttribute('data-uid');
    const clickedLinks = JSON.parse(localStorage.getItem('clickedLinks') || '{}');
    if (clickedLinks[uid]) {
        clickedLinks[uid]++;    
    } else {
        clickedLinks[uid] = 1;
    }
    localStorage.setItem('clickedLinks', JSON.stringify(clickedLinks));
    const item = getItem(uid);
    if (item && item.rssfeed) {
        fetchRssFeed(item.link);
    } else {
        window.open(event.target.href, event.target.target);
    }
}

/**
 * Fetches an RSS feed and displays its items in place of the current links.
 * @param {string} url - The RSS feed URL.
 */
async function fetchRssFeed(url) {
    try {
        const response = await fetch(url);
        const text = await response.text();
        const parser = new DOMParser();
        const xml = parser.parseFromString(text, 'application/xml');
        const items = Array.from(xml.querySelectorAll('item')).map(it => ({
            title: it.querySelector('title') ? it.querySelector('title').textContent : '',
            link: it.querySelector('link') ? it.querySelector('link').textContent : '#',
            tooltip: it.querySelector('description') ? it.querySelector('description').textContent : '',
            tags: [],
            documentationLink: '',
            uid: generateUID(),
            openInTab: true,
            rssfeed: false
        }));
        displayLinks(items);
    } catch (err) {
        console.error('Failed to fetch RSS feed', err);
    }
}

/**
 * Returns all valid links based on file, updated, and deleted links.
 * @returns {Array} An array of all valid links.
 */
function getAlllinks() {
    let deletedLinks = JSON.parse(localStorage.getItem('deletedLinks') || '[]');
    let Links = hyperlinksData;

    // Add a uid for all items when not set
    Links.forEach(item => {
        if (!item.uid) {
            debugLog("Addding uid", item.title);
            item.uid = generateUID();
        }    
    });

    // Remove items from updatedLinks if they exist in Links and all values match
    updatedLinks = updatedLinks.filter(updatedItem => {
        const match = Links.find(link => 
            link.uid === updatedItem.uid &&
            link.title === updatedItem.title &&
            link.openInTab === updatedItem.openInTab &&
            (link.rssfeed ?? false) === (updatedItem.rssfeed ?? false) &&
            link.link === updatedItem.link &&
            link.tooltip === updatedItem.tooltip &&
            JSON.stringify(link.tags) === JSON.stringify(updatedItem.tags) &&
            link.documentationLink === updatedItem.documentationLink
        );
        if (match) {
            // TODO Change to uid
            deleteUpdatedLink(updatedItem.uid);
            return false;
        }
        return true;
    });

    // Remove item from Links when there is an updated version of this item
    Links = Links.filter(link => !updatedLinks.some(updatedItem => updatedItem.uid === link.uid));

    // Add all updated links to the list of items
    Links = Links.concat(updatedLinks);

    // Remove an item from deletedLinks when it is no longer in hyperLinksData or updatedLinks
    let filteredDeletedLinks = [];
    deletedLinks.forEach(element => {
        item = Links.find(item => item.uid === element.uid);
        if (item) {
            debugLog("uid", item.uid); 
            filteredDeletedLinks.push(item);
        } else {
            debugLog("Removing from deleted", element.uid);
        }
    });

    debugLog("deleted links", filteredDeletedLinks);
    deletedLinks = filteredDeletedLinks;
    localStorage.setItem('deletedLinks', JSON.stringify(deletedLinks));

    // Remove item from Links when deleted
    Links = Links.filter(link => !deletedLinks.some(deletedItem => deletedItem.uid === link.uid));

    return Links; // Ensure that the function returns an array
}

/**
 * Displays a list of links as cards in the main body.
 * @param {Array} links - The array of links to display.
 */
function displayLinks(links) {
    const linksContainer = document.getElementById('linksContainer');
    linksContainer.innerHTML = ''; // Clear previous content

    if (!Array.isArray(links)) {
        links = [];
    }

    // Get all tags that match selected fixed tags
    const selectedFixedTagsFromStorage = new Set(JSON.parse(localStorage.getItem('selectedFixedTags') || '[]'));
    const filteredLinks = getAlllinks().filter(item => item.tags.some(tag => selectedFixedTagsFromStorage.has(tag)));

    uniqueTags = getUniqueTags(filteredLinks).filter(tag => !fixedTags.includes(tag)); // Use the getUniqueTags function from earlier
    createMenuItems(uniqueTags); // Create other tag menu items

    links.forEach((item) => {
        // Create card container
        const card = document.createElement('div');
        card.className = 'card mb-3'; // Bootstrap card class with margin-bottom

        // Create card body
        const cardBody = document.createElement('div');
        cardBody.className = 'card-body';

        // Create title as card title and make it a clickable link
        const cardTitleLink = document.createElement('a');
        // Prepend noteUriScheme if the link does not include a URI scheme
        const hasScheme = /^[a-zA-Z][a-zA-Z\d+\-.]*:/.test(item.link);
        cardTitleLink.href = hasScheme ? item.link : metaData.noteUriScheme + item.link.replace(/\s+/g, '_');
        cardTitleLink.className = 'card-title h5'; // Use 'h5' for title size
        // Add icon depending on link type
        if (item.rssfeed) {
            const rssIcon = document.createElement('i');
            rssIcon.className = 'fas fa-rss fa-sm';
            cardTitleLink.appendChild(rssIcon);
            cardTitleLink.appendChild(document.createTextNode(' '));
        } else if (!hasScheme) {
            const noteIcon = document.createElement('i');
            noteIcon.className = 'fas fa-note-sticky fa-sm';
            cardTitleLink.appendChild(noteIcon);
            cardTitleLink.appendChild(document.createTextNode(' ')); // Add space between icon and text
        } else if (item.link.startsWith('logseq') || item.link.startsWith('obsidian')) {
            const linkIcon = document.createElement('i');
            linkIcon.className = 'fas fa-note-sticky fa-sm';
            cardTitleLink.appendChild(linkIcon);
            cardTitleLink.appendChild(document.createTextNode(' ')); // Add space between icon and text
        } else if (item.link.startsWith('http') || item.link.startsWith('https')) {
            const linkIcon = document.createElement('i');
            linkIcon.className = 'fas fa-link fa-sm';
            cardTitleLink.appendChild(linkIcon);
            cardTitleLink.appendChild(document.createTextNode(' ')); // Add space between icon and text
        } else if (item.link.startsWith('file://')) {
            const fileIcon = document.createElement('i');
            fileIcon.className = 'fas fa-folder-tree fa-sm';
            cardTitleLink.appendChild(fileIcon);
            cardTitleLink.appendChild(document.createTextNode(' ')); // Add space between icon and text
        }
        cardTitleLink.appendChild(document.createTextNode(item.title));
        let target = "_self";
        if (item.openInTab) { target = "_blank" };
        cardTitleLink.setAttribute('target', target); // Open in new tab or self
        cardTitleLink.setAttribute('data-uid', item.uid); // Set data-uid attribute
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
        cardSubheader.className = 'card-subtitle mb-2 text-muted';
        cardSubheader.innerHTML = marked.parse(item.tooltip, { breaks: true, headerIds: false });

        // Create a container for the title and documentation link
        const titleContainer = document.createElement('div');
        titleContainer.className = 'd-flex justify-content-between align-items-center';

        // Append card title link to the title container
        titleContainer.appendChild(cardTitleLink);

        // Create documentation link if available
        if (item.documentationLink && item.documentationLink !== "0") {
            const openInTab = item.openInTab ? "_blank" : "_self";
            const docLink = document.createElement('a');
            docLink.href = item.documentationLink;
            docLink.className = 'card-link'; // No margin-left auto needed
            docLink.setAttribute('target', openInTab); // Open in new tab
            docLink.setAttribute('title', 'View documentation'); // Tooltip for the icon

            // Create the book icon for the documentation link
            const icon = document.createElement('i');   
            icon.className = 'fa-solid fa-book-open-reader fa-lg'; // Font Awesome book icon

            // Append the book icon to the d    ocumentation link
            docLink.appendChild(icon);

            // Append the documentation link to the title container
            titleContainer.appendChild(docLink);
        }

        // Append title container and subheader to the card body
        cardBody.appendChild(titleContainer);
        cardBody.appendChild(cardSubheader);

        // Create edit button
        const editButton = document.createElement('button');
        editButton.className = 'btn btn-sm btn-primary edit-button';
        editButton.textContent = 'Edit';
        editButton.addEventListener('click', () => {
            // Handle edit button click
            editLink(item);
        });

        // Create a container for the edit button
        const buttonContainer = document.createElement('div');
        buttonContainer.className = 'd-flex justify-content-end';

        // Append edit button to the button container
        buttonContainer.appendChild(editButton);

        // Append button container to the card body
        cardBody.appendChild(buttonContainer);

        // Append card body to the card container
        card.appendChild(cardBody);

        // Append the card to the links container
        linksContainer.appendChild(card);

        // Add copy button to each code block
        const codeBlocks = card.querySelectorAll('code');
        codeBlocks.forEach((codeBlock) => {
            const copyImage = document.createElement('img');
            copyImage.src = 'images/copy-icon.svg'; // Update with the correct path to your copy image
            copyImage.alt = 'Copy';
            copyImage.className = 'copy-image';
            copyImage.addEventListener('click', () => {
                navigator.clipboard.writeText(codeBlock.textContent).then(() => {
                    alert('Code copied to clipboard!');
                }).catch(err => {
                    console.error('Failed to copy text: ', err);
                });
            });
            codeBlock.appendChild(copyImage);
        });
    });

    document.getElementById('saveSiteButton').style.display = 'block';
}

/**
 * Handles the edit button click and shows the modal dialog for editing a link.
 * @param {Object} item - The item to edit.
 */
function editLink(item) {
    // Add a hidden input field to the edit form
    const hiddenInput = document.createElement('input');
    hiddenInput.type = 'hidden';
    hiddenInput.id = 'uid';
    hiddenInput.name = 'uid';
    hiddenInput.value = item.uid;
    document.getElementById('editSiteForm').appendChild(hiddenInput);
    document.getElementById('editSiteTitle').value = item.title;
    document.getElementById('editSiteLink').value = item.link;
    document.getElementById('editSiteTooltip').value = item.tooltip;
    document.getElementById('editSiteOpenInTab').checked = item.openInTab;
    document.getElementById('editSiteRssFeed').checked = item.rssfeed;
    console.log("Edit :", item);
    document.getElementById('editSiteTags').value = item.tags.join(', ');
    document.getElementById('editSiteDocumentationLink').value = item.documentationLink;
    document.getElementById('editSiteUid').value = item.uid;

    $('#editSiteModal').modal('show');
}

// Handle edit save button click
document.getElementById('saveEditSiteButton').addEventListener('click', () => {
    const uid = document.getElementById('editSiteUid').value; // Retrieve the original item name
    const title = document.getElementById('editSiteTitle').value;
    const link = document.getElementById('editSiteLink').value;
    const tooltip = document.getElementById('editSiteTooltip').value;
    const tags = document.getElementById('editSiteTags').value.split(',').map(tag => tag.trim());
    const documentationLink = document.getElementById('editSiteDocumentationLink').value;
    const openInTab = document.getElementById('editSiteOpenInTab').checked;
    const rssfeed = document.getElementById('editSiteRssFeed').checked;

    // Update the item with the new values
    const updatedItem = {
        title,
        link,
        tooltip,
        tags,
        documentationLink,
        uid,
        openInTab,
        rssfeed
    };

    // Update the item in updated links if it exists otherwise add it
    const updatedLinksIndex = updatedLinks.findIndex(i => i.uid === uid);
    if (updatedLinksIndex !== -1) {
        updatedLinks[updatedLinksIndex] = updatedItem;
    } else {
        updatedLinks.push(updatedItem);
    }

    // Update local storage
    localStorage.setItem('updatedLinks', JSON.stringify(updatedLinks));
    $('#editSiteModal').modal('hide');
    console.log("Saved: ", updatedItem);
    filterLinksByTags();
});

// Handle delete button click
document.getElementById('deleteSiteButton').addEventListener('click', () => {
    const uid = document.getElementById('editSiteUid').value;
    debugLog("deleting", uid);
 
    // Remove the item from updatedLinks
    let allLinks = getAlllinks();
    debugLog(allLinks);
    updatedLinks = updatedLinks.filter(item => item.uid !== uid);
    localStorage.setItem('updatedLinks', JSON.stringify(updatedLinks));

    // Add the item to deletedLinks
    const deletedItem = getItem(uid);
    if (deletedItem) {
        deletedLinks.push(deletedItem);
        localStorage.setItem('deletedLinks', JSON.stringify(deletedLinks));
    }

    $('#editSiteModal').modal('hide');
    filterLinksByTags();
});

/**
 * Restores the state of selected tags from local storage.
 */
function restoreSelectedTagsState() {
    const fixedMenu = document.getElementById('fixedTagMenu');
    const savedTags = JSON.parse(localStorage.getItem('selectedFixedTags') || '[]');
    savedTags.forEach(tag => {
        const linkElement = fixedMenu.querySelector(`.nav-link[href="#${tag}"]`);
        if (linkElement) {
            selectedFixedTags.add(tag); // Restore the tag to the selected set
            linkElement.classList.add('active'); // Add active class to change color
        }
    });
    filterLinksByTags(); // Display links based on the restored selected tags
}

// Initialize Bootstrap tooltips
$(function () {
    $('[data-toggle="tooltip"]').tooltip();
});

// Handle final export button click
document.getElementById('finalExportButton').addEventListener('click', () => {
    // Hide modal form when downloading
    $('#exportModal').modal('hide');
    const dataStr = "data:text/javascript;charset=utf-8," + encodeURIComponent(                                                                                                                                               
        `// [\n` +                                                                                                                                                                                                            
        `//   {\n` +                                                                                                                                                                                                          
        `//     "title": "Example Link 1",\n` +                                                                                                                                                                               
        `//     "link": "https://www.example1.com",\n` +                                                                                                                                                                      
        `//     "tags": ["Dev", "Lab"],\n` +                                                                                                                                                                                  
        `//     "tooltip": "This is a tooltip for Example Link 1",\n` +                                                                                                                                                       
        `//     "documentationLink": "https://www.example1.com/docs"\n` +                                                                                                                                                     
        `//   },\n` +                                                                                                                                                                                                         
        `//   {\n` +                                                                                                                                                                                                          
        `//     "title": "Example Link 2",\n` +                                                                                                                                                                               
        `//     "link": "https://www.example2.com",\n` +                                                                                                                                                                      
        `//     "tags": ["RSI", "BUS"],\n` +                                                                                                                                                                                  
        `//     "tooltip": "This is a tooltip for Example Link 2",\n` +                                                                                                                                                       
        `//     "documentationLink": "https://www.example2.com/docs"\n` +                                                                                                                                                     
        `//   }\n` +                                                                                                                                                                                                          
        `//   // ... more link objects\n` +                                                                                                                                                                                   
        `// ]\n\n` +                                                                                                                                                                                                          
        `// Embed the JSON data into the JavaScript file by assigning it to a variable\n` +                                                                                                                                   
        `const hyperlinksData = ${JSON.stringify(getAlllinks().map(item => ({ ...item, openInTab: item.openInTab ?? false, rssfeed: item.rssfeed ?? false })), null, 2)};`
    );  
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", "hyperlinks.js");
    document.body.appendChild(downloadAnchorNode); // required for firefox
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
});

/**
 * Performs an external search if the search query starts with '>'.
 */
function external_search() {
    console.log("external search called");
    const searchQuery = document.getElementById('searchInput').value;
    if (searchQuery.startsWith('>')) {
        const query = searchQuery.slice(1); // Remove the '>' prefix
        const googleSearchUrl = `https://www.google.com/search?q=${encodeURIComponent(query + " site:.nl")}`;
        const openInCurrent = JSON.parse(localStorage.getItem('openInCurrent'));
        window.open(googleSearchUrl, openInCurrent ? "_self" : "_blank");
    }
}

// Event listener for the search input field
document.getElementById('searchInput').addEventListener('input', filterLinksByTags);

// Event listener for the Enter key in the search input field
document.getElementById('searchInput').addEventListener('keypress', function(event) {
    if (event.key === 'Enter') {
        external_search();
    }
});

// Show dialog for add site and prefill
document.getElementById('addSiteButton').addEventListener('click', () => {
    siteTags = JSON.parse(localStorage.getItem('selectedFixedTags') || '[]');
    siteTags = siteTags.concat(JSON.parse(localStorage.getItem('selectedTags') || '[]'));
    document.getElementById('siteTags').value = siteTags;
    document.getElementById('siteTitle').value = "";
    document.getElementById('siteLink').value = "";
    document.getElementById('siteTooltip').value = "";
    document.getElementById('siteRssFeed').checked = false;
    $('#addSiteModal').modal('show');
});

// Handle save site button click
document.getElementById('saveSiteButton').addEventListener('click', () => {
    const title = document.getElementById('siteTitle').value;
    const link = document.getElementById('siteLink').value;
    const tooltip = document.getElementById('siteTooltip').value;
    const tags = document.getElementById('siteTags').value.split(',').map(tag => tag.trim());
    const documentationLink = document.getElementById('siteDocumentationLink').value;
    
    // Check if the title or URL already exists in allLinks
    checklinks = getAlllinks();
    const isTitleUnique = !checklinks.some(item => item.title.toLowerCase() === title.toLowerCase());
    const isLinkUnique = !checklinks.some(item => item.link.toLowerCase() === link.toLowerCase());
    if (!isTitleUnique || !isLinkUnique) {
        alert('The title or URL already exists. Please enter a unique title and URL.');
        $('#addSiteModal').modal('hide');
        return;
    }

    // New item construct
    const openInTab = document.getElementById('siteOpenInTab').checked;
    const rssfeed = document.getElementById('siteRssFeed').checked;
    const newItem = {
        title,
        link,
        tooltip,
        tags,
        documentationLink,
        openInTab,
        rssfeed
    };

    newItem.uid = generateUID();

    updatedLinks.push(newItem);
    localStorage.setItem('updatedLinks', JSON.stringify(updatedLinks)); // Store newLinks in local storage

    updateTags(tags); // Update tags after adding a new site

    $('#addSiteModal').modal('hide');
    filterLinksByTags();
});

/**
 * Updates the secondary tag menu with new tags.
 * @param {Array} newTags - The array of new tags to add to the menu.
 */
function updateTags(newTags) {
    const menu = document.getElementById('tagMenu');
    const existingTags = new Set([...menu.querySelectorAll('.nav-link.tag')].map(link => link.textContent));

    newTags.forEach(tag => {
        if (!existingTags.has(tag)) {
            const listItem = document.createElement('li');
            listItem.className = 'nav-item';
            const link = document.createElement('a');
            link.className = 'nav-link tag';
            link.href = `#`; // Not restorable 
            link.textContent = tag.slice(0, tagLength); // Truncate tag to a maximum of 6 characters
            link.addEventListener('click', (event) => {
                event.preventDefault();
                toggleTagSelection(event.target, tag);
            });
            listItem.appendChild(link);
            menu.appendChild(listItem);
        }
    });
}

// Set focus on the search bar when the page loads
document.addEventListener('DOMContentLoaded', (event) => {
    // Check if the URL hash is #debug and set the debug flag
    if (window.location.hash === '#debug') {
        debug = true;
        debugLog("Debug mode is ON");
    }

    loadData();
    if (debug) {
        debugLog("Data loaded:", { updatedLinks, deletedLinks, hyperlinksData });
    }
    filterLinksByTags();
    setTimeout(() => {
        document.getElementById('searchInput').focus();
    }, 0);
    debugLog("Dom loaded");
});
