// Assuming this is the path/to/your/javascriptfile.js file
/**
 * Global variables to manage links and tags.
 */
let allLinks = [];
let selectedLinks = []; // This will hold the original array of links and tags
let fixedTags = [];
tagLength = 6;
selectedFixedTags = new Set(); // Keep track of Fixed tags
selectedTags = new Set();  // Keep track of secondary tags
let debug = false; // Global debug flag
let currentFilteredLinks = []; // Keep track of current filtered links for navigation
let currentCardIndex = -1; // Keep track of current card index in full-screen view
let pwa_app = false; // Global flag indicating if running as PWA

/**
 * Logs debug information to the console if the debug flag is set.
 * @param  {...any} args - The arguments to log.
 */
function debugLog(...args) {
    if (debug) {
        console.log(...args);
    }
}

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
    item = allLinks.find(item => item.uid === uid);
    debugLog("getItem ", item);
    return item;
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
        link.textContent = tag.slice(0, tagLength).toLowerCase(); // Truncate tag and display in lowercase
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
 * Copy text to clipboard with fallback support
 * @param {string} text - The text to copy
 * @returns {Promise} - Promise that resolves when copy is successful
 */
function copyToClipboard(text) {
    // Try modern Clipboard API first
    if (navigator.clipboard && navigator.clipboard.writeText) {
        return navigator.clipboard.writeText(text).catch(err => {
            // If Clipboard API fails (e.g., permission denied), fall back to execCommand
            return fallbackCopyToClipboard(text);
        });
    }

    // If Clipboard API doesn't exist, use fallback directly
    return fallbackCopyToClipboard(text);
}

/**
 * Fallback clipboard copy using execCommand
 * @param {string} text - The text to copy
 * @returns {Promise} - Promise that resolves when copy is successful
 */
function fallbackCopyToClipboard(text) {
    return new Promise((resolve, reject) => {
        // Use a pre element for better text selection compatibility
        const pre = document.createElement('pre');
        pre.textContent = text;
        pre.style.position = 'fixed';
        pre.style.top = '0';
        pre.style.left = '0';
        pre.style.width = '1px';
        pre.style.height = '1px';
        pre.style.padding = '0';
        pre.style.border = 'none';
        pre.style.outline = 'none';
        pre.style.boxShadow = 'none';
        pre.style.background = 'transparent';
        pre.style.overflow = 'hidden';
        pre.style.opacity = '0';
        pre.style.pointerEvents = 'none';
        pre.style.zIndex = '-1';

        document.body.appendChild(pre);

        // Create a range and select the pre content
        const range = document.createRange();
        range.selectNodeContents(pre);

        const selection = window.getSelection();
        selection.removeAllRanges();
        selection.addRange(range);

        // Try to copy
        try {
            const successful = document.execCommand('copy');

            // Clean up
            selection.removeAllRanges();
            document.body.removeChild(pre);

            if (successful) {
                resolve();
            } else {
                reject(new Error('execCommand copy failed'));
            }
        } catch (err) {
            selection.removeAllRanges();
            document.body.removeChild(pre);
            reject(err);
        }
    });
}

/**
 * Filters and displays links that have at least one selected tag,
 * or displays clicked links sorted by the number of clicks if no tags are selected.
 */
function filterLinksByTags() {
    let selectedLinks = [];
    let tagselectedLinks = [];
    let allLinks = getAlllinks();
    selectedTags = new Set(JSON.parse(localStorage.getItem('selectedTags') || '[]')) // TODO replace with secondaryTags
    secondaryTags = getSelectedTags();
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
    searchfilteredLinks = allLinks.filter(item => {
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
        // Create lowercase version of selected fixed tags for case-insensitive comparison
        const selectedFixedTagsLower = new Set([...selectedFixedTags].map(tag => tag.toLowerCase()));
        searchfilteredLinks.forEach((item) => {
            // include items that have the fixed tag (case-insensitive)
            if (item.tags.some(tag => selectedFixedTagsLower.has(tag.toLowerCase()))) {
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
    newTags = [];
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

    // Display export notification when there are changes
    const exportNotification = document.getElementById('exportNotification');
    const saveNotification = document.getElementById('saveNotification');
    const settingsGear = document.getElementById('settingsGear');

    if (updatedLinks.length > 0 || deletedLinks.length > 0) {
        if (exportNotification) exportNotification.style.display = 'flex';
        if (saveNotification) saveNotification.style.display = 'inline';
        if (settingsGear) settingsGear.classList.add('export-needed');
    } else {
        if (exportNotification) exportNotification.style.display = 'none';
        if (saveNotification) saveNotification.style.display = 'none';
        if (settingsGear) settingsGear.classList.remove('export-needed');
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
    window.open(event.target.href, event.target.target);
}

/**
 * Returns all valid links based on file, updated, and deleted links.
 * @returns {Array} An array of all valid links.
 */
function getAlllinks() {
    let deletedLinks = JSON.parse(localStorage.getItem('deletedLinks') || '[]');
    let Links = hyperlinksData;

    // Add a uid for all items when not set and normalize tags to lowercase
    Links.forEach(item => {
        if (!item.uid) {
            debugLog("Addding uid", item.title);
            item.uid = generateUID();
        }
        // Normalize all tags to lowercase when reading from hyperlinks.js
        if (item.tags && Array.isArray(item.tags)) {
            item.tags = item.tags.map(tag => typeof tag === 'string' ? tag.toLowerCase() : tag);
        }
    });

    // Remove items from updatedLinks if they exist in Links and all values match
    updatedLinks = updatedLinks.filter(updatedItem => {
        const match = Links.find(link => 
            link.uid === updatedItem.uid &&
            link.title === updatedItem.title &&
            link.openInTab === updatedItem.openInTab &&
            link.link === updatedItem.link &&
            link.tooltip === updatedItem.tooltip &&
            JSON.stringify(link.tags) === JSON.stringify(updatedItem.tags) &&
            link.documentationLink === updatedItem.documentationLink &&
            (link.display_full || false) === (updatedItem.display_full || false)
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

    // Normalize tags in updatedLinks to lowercase
    updatedLinks.forEach(item => {
        if (item.tags && Array.isArray(item.tags)) {
            item.tags = item.tags.map(tag => typeof tag === 'string' ? tag.toLowerCase() : tag);
        }
    });

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

    // Only show secondary tags if at least one primary tag is selected
    if (selectedFixedTagsFromStorage.size > 0) {
        // Normalize selected fixed tags to lowercase for case-insensitive comparison
        const normalizedSelectedTags = new Set([...selectedFixedTagsFromStorage].map(tag => tag.toLowerCase()));
        const filteredLinks = getAlllinks().filter(item => item.tags.some(tag => normalizedSelectedTags.has(tag.toLowerCase())));

        // Filter out fixed tags from uniqueTags (case-insensitive comparison)
        const fixedTagsLower = fixedTags.map(tag => tag.toLowerCase());
        uniqueTags = getUniqueTags(filteredLinks).filter(tag => !fixedTagsLower.includes(tag.toLowerCase()));
        createMenuItems(uniqueTags); // Create other tag menu items
    } else {
        // No primary tags selected - clear secondary tags
        uniqueTags = [];
        createMenuItems(uniqueTags);
    }

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
        // Add fa-note-sticky icon if the link is a note, or fa-link if it starts with http/https
        if (!hasScheme) {
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
        target = "_self"
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
        // Check if item has display_full option set to true, otherwise limit to 5 lines
        const displayFullClass = item.display_full ? 'card-subtitle-full' : 'card-subtitle-limited';
        cardSubheader.className = `card-subtitle mb-2 text-muted ${displayFullClass}`;
        cardSubheader.innerHTML = marked.parse(item.tooltip, { breaks: true, headerIds: false });

        // Apply syntax highlighting to code blocks
        cardSubheader.querySelectorAll('pre code').forEach((block) => {
            hljs.highlightElement(block);
        });

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

        // Add click event listener to card body for full-screen view
        cardBody.addEventListener('click', (event) => {
            // Prevent triggering when clicking on title link, card link, or copy buttons
            if (event.target.closest('.card-title') ||
                event.target.closest('.card-link') ||
                event.target.closest('.code-copy-btn') ||
                event.target.closest('.inline-code-copy-btn')) {
                return;
            }
            const cardIndex = currentFilteredLinks.findIndex(link => link.uid === item.uid);
            showFullScreenCard(item, cardIndex);
        });

        // Add cursor pointer to indicate clickable area
        cardBody.style.cursor = 'pointer';

        // Append card body to the card container
        card.appendChild(cardBody);

        // Append the card to the links container
        linksContainer.appendChild(card);

        // Add copy button to each code block (pre > code)
        const codeBlocks = card.querySelectorAll('pre code');
        codeBlocks.forEach((codeBlock) => {
            const pre = codeBlock.parentElement;
            if (!pre.querySelector('.code-copy-btn')) {
                // Create wrapper for positioning
                pre.style.position = 'relative';

                const copyBtn = document.createElement('button');
                copyBtn.className = 'code-copy-btn';
                copyBtn.innerHTML = '<img src="images/copy-icon.svg" alt="Copy" class="copy-icon">';
                copyBtn.setAttribute('title', 'Copy code');

                copyBtn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    // Get the code element at click time to ensure we have the latest content
                    const codeElement = pre.querySelector('code');
                    const code = codeElement ? codeElement.textContent : '';
                    copyToClipboard(code).then(() => {
                        copyBtn.innerHTML = '<span style="color: #28a745;">✓</span>';
                        setTimeout(() => {
                            copyBtn.innerHTML = '<img src="images/copy-icon.svg" alt="Copy" class="copy-icon">';
                        }, 2000);
                    }).catch(err => {
                        console.error('Failed to copy text: ', err);
                        copyBtn.innerHTML = '<span style="color: #dc3545;">✗</span>';
                        setTimeout(() => {
                            copyBtn.innerHTML = '<img src="images/copy-icon.svg" alt="Copy" class="copy-icon">';
                        }, 2000);
                    });
                });

                pre.appendChild(copyBtn);
            }
        });

        // Add copy button to inline code elements (code not in pre)
        const inlineCodes = card.querySelectorAll('code:not(pre code)');
        inlineCodes.forEach((codeElement) => {
            if (!codeElement.querySelector('.inline-code-copy-btn')) {
                // Wrap the code element if not already wrapped
                if (!codeElement.parentElement.classList.contains('inline-code-wrapper')) {
                    const wrapper = document.createElement('span');
                    wrapper.className = 'inline-code-wrapper';
                    wrapper.style.position = 'relative';
                    wrapper.style.display = 'inline-block';

                    codeElement.parentNode.insertBefore(wrapper, codeElement);
                    wrapper.appendChild(codeElement);

                    const copyBtn = document.createElement('button');
                    copyBtn.className = 'inline-code-copy-btn';
                    copyBtn.innerHTML = '<img src="images/copy-icon.svg" alt="Copy" class="copy-icon">';
                    copyBtn.setAttribute('title', 'Copy code');

                    copyBtn.addEventListener('click', (e) => {
                        e.stopPropagation();
                        const code = codeElement.textContent;
                        copyToClipboard(code).then(() => {
                            copyBtn.innerHTML = '<span style="color: #28a745; font-size: 10px;">✓</span>';
                            setTimeout(() => {
                                copyBtn.innerHTML = '<img src="images/copy-icon.svg" alt="Copy" class="copy-icon">';
                            }, 2000);
                        }).catch(err => {
                            console.error('Failed to copy text: ', err);
                            copyBtn.innerHTML = '<span style="color: #dc3545; font-size: 10px;">✗</span>';
                            setTimeout(() => {
                                copyBtn.innerHTML = '<img src="images/copy-icon.svg" alt="Copy" class="copy-icon">';
                            }, 2000);
                        });
                    });

                    wrapper.appendChild(copyBtn);
                }
            }
        });
    });

    // Store the current filtered links for navigation
    currentFilteredLinks = links;

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
    document.getElementById('editSiteOpenInTab').checked = item.openInTab || false;
    document.getElementById('editSiteDisplayFull').checked = item.display_full || false;
    console.log("Edit :", item);
    document.getElementById('editSiteTags').value = item.tags.join(', ');
    document.getElementById('editSiteDocumentationLink').value = item.documentationLink;
    document.getElementById('editSiteUid').value = item.uid;

    $('#editSiteModal').modal('show');
}

// Handle edit save button click
document.getElementById('saveEditSiteButton').addEventListener('click', (event) => {
    event.preventDefault();
    event.stopPropagation();
    const uid = document.getElementById('editSiteUid').value; // Retrieve the original item name
    const title = document.getElementById('editSiteTitle').value;
    const link = document.getElementById('editSiteLink').value;
    const tooltip = document.getElementById('editSiteTooltip').value;
    const tags = document.getElementById('editSiteTags').value.split(',').map(tag => tag.trim().toLowerCase());
    const documentationLink = document.getElementById('editSiteDocumentationLink').value;
    const openInTab = document.getElementById('editSiteOpenInTab').checked;
    const displayFull = document.getElementById('editSiteDisplayFull').checked;

    // Check if the title already exists in other items (excluding current item)
    const allLinks = getAlllinks();
    const isTitleUnique = !allLinks.some(item => item.uid !== uid && item.title.toLowerCase() === title.toLowerCase());
    
    if (!isTitleUnique) {
        // Show error message in the modal instead of alert
        const titleInput = document.getElementById('editSiteTitle');
        titleInput.style.borderColor = 'red';
        titleInput.focus();
        // Create or update error message
        let errorMsg = document.getElementById('editTitleError');
        if (!errorMsg) {
            errorMsg = document.createElement('small');
            errorMsg.id = 'editTitleError';
            errorMsg.className = 'text-danger';
            titleInput.parentNode.appendChild(errorMsg);
        }
        errorMsg.textContent = 'The title already exists. Please enter a unique title.';
        return; // Keep modal open
    }
    
    // Clear any previous error messages and styling
    const titleInput = document.getElementById('editSiteTitle');
    titleInput.style.borderColor = '';
    const titleError = document.getElementById('editTitleError');
    if (titleError) titleError.remove();

    // Update the item with the new values
    const updatedItem = {
        title,
        link,
        tooltip,
        tags,
        documentationLink,
        uid,
        openInTab,
        display_full: displayFull
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

    // Get current theme from form or localStorage
    const currentTheme = getThemeFromForm();

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
        `const hyperlinksData = ${JSON.stringify(getAlllinks().map(item => ({ ...item, openInTab: item.openInTab ?? false, display_full: item.display_full ?? false })), null, 2)};\n\n` +
        `// Saved theme settings - will be loaded before localStorage theme\n` +
        `const savedTheme = ${JSON.stringify(currentTheme, null, 2)};`
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

// Last typed character indicator - show bold overlay on typing
let lastCharTimeout = null;

document.getElementById('searchInput').addEventListener('input', function(event) {
    const input = event.target;

    // Only show for actual character input (not backspace/delete)
    if (event.inputType === 'insertText' && event.data) {
        const char = event.data;
        const indicator = document.getElementById('lastCharIndicator');
        const inputRect = input.getBoundingClientRect();

        // Create a temporary span to measure text width up to cursor (before the just-typed character)
        const tempSpan = document.createElement('span');
        tempSpan.style.visibility = 'hidden';
        tempSpan.style.position = 'absolute';
        tempSpan.style.whiteSpace = 'pre';
        tempSpan.style.font = window.getComputedStyle(input).font;
        tempSpan.textContent = input.value.substring(0, input.selectionStart - 1);
        document.body.appendChild(tempSpan);
        const textWidth = tempSpan.offsetWidth;
        document.body.removeChild(tempSpan);

        // Position the indicator over the newly typed character
        const paddingLeft = parseInt(window.getComputedStyle(input).paddingLeft);
        indicator.style.left = (inputRect.left - input.closest('.container').getBoundingClientRect().left + paddingLeft + textWidth) + 'px';
        indicator.style.top = (inputRect.top - input.closest('.container').getBoundingClientRect().top + 8) + 'px';
        indicator.textContent = char;

        // Clear previous timeout
        if (lastCharTimeout) {
            clearTimeout(lastCharTimeout);
        }

        // Show the bold indicator
        indicator.classList.remove('hide');
        indicator.classList.add('show');

        // Hide after 300ms
        lastCharTimeout = setTimeout(() => {
            indicator.classList.remove('show');
            indicator.classList.add('hide');
        }, 300);
    }
});

// Show dialog for add site and prefill
document.getElementById('addSiteButton').addEventListener('click', (e) => {
    e.preventDefault();
    siteTags = JSON.parse(localStorage.getItem('selectedFixedTags') || '[]');
    siteTags = siteTags.concat(JSON.parse(localStorage.getItem('selectedTags') || '[]'));
    document.getElementById('siteTags').value = siteTags;
    document.getElementById('siteTitle').value = "";
    document.getElementById('siteLink').value = "";
    document.getElementById('siteTooltip').value = "";
    document.getElementById('siteDisplayFull').checked = false;
    $('#addSiteModal').modal('show');
});

// Handle save site button click
document.getElementById('saveSiteButton').addEventListener('click', () => {
    const title = document.getElementById('siteTitle').value;
    const link = document.getElementById('siteLink').value;
    const tooltip = document.getElementById('siteTooltip').value;
    const tags = document.getElementById('siteTags').value.split(',').map(tag => tag.trim().toLowerCase());
    const documentationLink = document.getElementById('siteDocumentationLink').value;
    
    // Check if the title already exists in allLinks
    checklinks = getAlllinks();
    const isTitleUnique = !checklinks.some(item => item.title.toLowerCase() === title.toLowerCase());
    if (!isTitleUnique) {
        alert('The title already exists. Please enter a unique title.');
        $('#addSiteModal').modal('hide');
        return;
    }

    // New item construct
    const openInTab = document.getElementById('siteOpenInTab').checked;
    const displayFull = document.getElementById('siteDisplayFull').checked;
    const newItem = {
        title,
        link,
        tooltip,
        tags,
        documentationLink,
        openInTab,
        display_full: displayFull
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
            link.textContent = tag.slice(0, tagLength).toLowerCase(); // Truncate tag and display in lowercase
            link.addEventListener('click', (event) => {
                event.preventDefault();
                toggleTagSelection(event.target, tag);
            });
            listItem.appendChild(link);
            menu.appendChild(listItem);
        }
    });
}

/**
 * Shows a full-screen view of a card item
 * @param {Object} item - The link item to display in full-screen
 * @param {number} index - The index of the item in the filtered list
 */
function showFullScreenCard(item, index = -1) {
    currentCardIndex = index;
    const fullScreenContent = document.getElementById('fullScreenCardContent');

    // Clear previous content
    fullScreenContent.innerHTML = '';

    // Update modal title to show the link URL
    const modalTitle = document.getElementById('fullScreenCardModalLabel');
    if (modalTitle) {
        // Clear existing content
        modalTitle.innerHTML = '';

        // Create link element
        const linkElement = document.createElement('a');
        const hasScheme = /^[a-zA-Z][a-zA-Z\d+\-.]*:/.test(item.link);
        linkElement.href = hasScheme ? item.link : metaData.noteUriScheme + item.link.replace(/\s+/g, '_');
        linkElement.className = 'text-decoration-none';
        const target = item.openInTab ? "_blank" : "_self";
        linkElement.setAttribute('target', target);
        linkElement.setAttribute('data-uid', item.uid);
        linkElement.addEventListener('click', handleLinkClick);

        // Add appropriate icon
        const icon = document.createElement('i');
        if (!hasScheme) {
            icon.className = 'fas fa-note-sticky fa-sm mr-2';
        } else if (item.link.startsWith('logseq') || item.link.startsWith('obsidian')) {
            icon.className = 'fas fa-note-sticky fa-sm mr-2';
        } else if (item.link.startsWith('http') || item.link.startsWith('https')) {
            icon.className = 'fas fa-link fa-sm mr-2';
        } else if (item.link.startsWith('file://')) {
            icon.className = 'fas fa-folder-tree fa-sm mr-2';
        } else {
            icon.className = 'fas fa-link fa-sm mr-2';
        }
        linkElement.appendChild(icon);

        // Add link text
        linkElement.appendChild(document.createTextNode(item.link));

        modalTitle.appendChild(linkElement);
    }

    // Create card body for full-screen view
    const cardBody = document.createElement('div');

    // Create title container with title text and documentation
    const titleContainer = document.createElement('div');
    titleContainer.className = 'd-flex justify-content-between align-items-center mb-3';

    // Create title as text (not a link anymore, since link is in header)
    const cardTitle = document.createElement('h3');
    cardTitle.className = 'card-title mb-0';
    cardTitle.textContent = item.title;

    titleContainer.appendChild(cardTitle);
    
    // Add documentation link if available
    if (item.documentationLink && item.documentationLink !== "0") {
        const openInTab = item.openInTab ? "_blank" : "_self";
        const docLink = document.createElement('a');
        docLink.href = item.documentationLink;
        docLink.className = 'card-link';
        docLink.setAttribute('target', openInTab);
        docLink.setAttribute('title', 'View documentation');
        
        const icon = document.createElement('i');
        icon.className = 'fa-solid fa-book-open-reader fa-2x';
        docLink.appendChild(icon);
        
        titleContainer.appendChild(docLink);
    }
    
    // Create tooltip content
    const cardContent = document.createElement('div');
    cardContent.className = 'card-text';
    cardContent.innerHTML = marked.parse(item.tooltip, { breaks: true, headerIds: false });

    // Apply syntax highlighting to code blocks in full-screen view
    cardContent.querySelectorAll('pre code').forEach((block) => {
        hljs.highlightElement(block);
    });
    
    // Create tags display
    const tagsContainer = document.createElement('div');
    tagsContainer.className = 'mt-4';
    const tagsLabel = document.createElement('small');
    tagsLabel.className = 'text-muted font-weight-bold';
    tagsLabel.textContent = 'Tags: ';
    tagsContainer.appendChild(tagsLabel);
    
    item.tags.forEach((tag, index) => {
        const tagSpan = document.createElement('span');
        tagSpan.className = 'badge badge-secondary mr-1';
        tagSpan.textContent = tag;
        tagsContainer.appendChild(tagSpan);
    });
    
    // Append all elements to card body
    cardBody.appendChild(titleContainer);
    cardBody.appendChild(cardContent);
    cardBody.appendChild(tagsContainer);
    
    // Add copy button to code blocks and inline code in full-screen view
    setTimeout(() => {
        // Add copy button to code blocks (pre > code)
        const codeBlocks = cardBody.querySelectorAll('pre code');
        codeBlocks.forEach((codeBlock) => {
            const pre = codeBlock.parentElement;
            if (!pre.querySelector('.code-copy-btn')) {
                // Create wrapper for positioning
                pre.style.position = 'relative';

                const copyBtn = document.createElement('button');
                copyBtn.className = 'code-copy-btn';
                copyBtn.innerHTML = '<img src="images/copy-icon.svg" alt="Copy" class="copy-icon">';
                copyBtn.setAttribute('title', 'Copy code');

                copyBtn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    // Get the code element at click time to ensure we have the latest content
                    const codeElement = pre.querySelector('code');
                    const code = codeElement ? codeElement.textContent : '';
                    copyToClipboard(code).then(() => {
                        copyBtn.innerHTML = '<span style="color: #28a745;">✓</span>';
                        setTimeout(() => {
                            copyBtn.innerHTML = '<img src="images/copy-icon.svg" alt="Copy" class="copy-icon">';
                        }, 2000);
                    }).catch(err => {
                        console.error('Failed to copy text: ', err);
                        copyBtn.innerHTML = '<span style="color: #dc3545;">✗</span>';
                        setTimeout(() => {
                            copyBtn.innerHTML = '<img src="images/copy-icon.svg" alt="Copy" class="copy-icon">';
                        }, 2000);
                    });
                });

                pre.appendChild(copyBtn);
            }
        });

        // Add copy button to inline code elements (code not in pre)
        const inlineCodes = cardBody.querySelectorAll('code:not(pre code)');
        inlineCodes.forEach((codeElement) => {
            if (!codeElement.querySelector('.inline-code-copy-btn')) {
                // Wrap the code element if not already wrapped
                if (!codeElement.parentElement.classList.contains('inline-code-wrapper')) {
                    const wrapper = document.createElement('span');
                    wrapper.className = 'inline-code-wrapper';
                    wrapper.style.position = 'relative';
                    wrapper.style.display = 'inline-block';

                    codeElement.parentNode.insertBefore(wrapper, codeElement);
                    wrapper.appendChild(codeElement);

                    const copyBtn = document.createElement('button');
                    copyBtn.className = 'inline-code-copy-btn';
                    copyBtn.innerHTML = '<img src="images/copy-icon.svg" alt="Copy" class="copy-icon">';
                    copyBtn.setAttribute('title', 'Copy code');

                    copyBtn.addEventListener('click', (e) => {
                        e.stopPropagation();
                        const code = codeElement.textContent;
                        copyToClipboard(code).then(() => {
                            copyBtn.innerHTML = '<span style="color: #28a745; font-size: 10px;">✓</span>';
                            setTimeout(() => {
                                copyBtn.innerHTML = '<img src="images/copy-icon.svg" alt="Copy" class="copy-icon">';
                            }, 2000);
                        }).catch(err => {
                            console.error('Failed to copy text: ', err);
                            copyBtn.innerHTML = '<span style="color: #dc3545; font-size: 10px;">✗</span>';
                            setTimeout(() => {
                                copyBtn.innerHTML = '<img src="images/copy-icon.svg" alt="Copy" class="copy-icon">';
                            }, 2000);
                        });
                    });

                    wrapper.appendChild(copyBtn);
                }
            }
        });
    }, 100);
    
    fullScreenContent.appendChild(cardBody);

    // Add navigation arrows if there's more than one card
    if (currentFilteredLinks.length > 1) {
        addNavigationArrows();
    } else {
        // Clear navigation if only one card
        const navContainer = document.getElementById('fullScreenNavigation');
        if (navContainer) {
            navContainer.innerHTML = '';
        }
    }

    // Setup Edit card button
    const editCardButton = document.getElementById('fullScreenEditCardButton');
    if (editCardButton) {
        // Remove any existing event listeners
        const newEditCardButton = editCardButton.cloneNode(true);
        editCardButton.parentNode.replaceChild(newEditCardButton, editCardButton);

        // Add new event listener
        newEditCardButton.addEventListener('click', () => {
            // Hide the full screen modal
            $('#fullScreenCardModal').modal('hide');
            // Open the edit link modal with the current item
            setTimeout(() => {
                editLink(item);
            }, 300); // Wait for modal to close
        });
    }

    // Setup Edit Text button
    const editTextButton = document.getElementById('fullScreenEditTextButton');
    if (editTextButton) {
        // Remove any existing event listeners
        const newEditTextButton = editTextButton.cloneNode(true);
        editTextButton.parentNode.replaceChild(newEditTextButton, editTextButton);

        // Add new event listener
        newEditTextButton.addEventListener('click', () => {
            // Hide the full screen modal
            $('#fullScreenCardModal').modal('hide');
            // Open the text editor with the current item
            setTimeout(() => {
                openTextEditor(item);
            }, 300); // Wait for modal to close
        });
    }

    // Show the modal
    $('#fullScreenCardModal').modal('show');

    // Add keyboard navigation event listener
    $(document).off('keydown.fullScreenNav').on('keydown.fullScreenNav', function(e) {
        if ($('#fullScreenCardModal').hasClass('show')) {
            if (e.key === 'ArrowLeft') {
                e.preventDefault();
                navigateToCard(-1); // Previous card
            } else if (e.key === 'ArrowRight') {
                e.preventDefault();
                navigateToCard(1); // Next card
            } else if (e.key === 'Escape') {
                e.preventDefault();
                $('#fullScreenCardModal').modal('hide');
            }
        }
    });
}

/**
 * Navigates to the previous or next card in the filtered list
 * @param {number} direction - -1 for previous, 1 for next
 */
function navigateToCard(direction) {
    if (currentFilteredLinks.length === 0 || currentCardIndex === -1) {
        return;
    }
    
    const newIndex = currentCardIndex + direction;
    
    // Wrap around if at the beginning or end
    let targetIndex;
    if (newIndex < 0) {
        targetIndex = currentFilteredLinks.length - 1; // Go to last card
    } else if (newIndex >= currentFilteredLinks.length) {
        targetIndex = 0; // Go to first card
    } else {
        targetIndex = newIndex;
    }
    
    const targetCard = currentFilteredLinks[targetIndex];
    if (targetCard) {
        showFullScreenCard(targetCard, targetIndex);
    }
}

/**
 * Adds navigation arrows to the full-screen modal footer
 */
function addNavigationArrows() {
    const navContainer = document.getElementById('fullScreenNavigation');

    if (!navContainer) return;

    // Clear existing content
    navContainer.innerHTML = '';

    // Create left arrow
    const leftArrow = document.createElement('div');
    leftArrow.className = 'nav-arrow';
    leftArrow.innerHTML = '<i class="fas fa-chevron-left"></i>';
    leftArrow.addEventListener('click', () => navigateToCard(-1));

    // Create card counter
    const cardCounter = document.createElement('div');
    cardCounter.className = 'card-counter';
    cardCounter.textContent = `${currentCardIndex + 1} / ${currentFilteredLinks.length}`;

    // Create right arrow
    const rightArrow = document.createElement('div');
    rightArrow.className = 'nav-arrow';
    rightArrow.innerHTML = '<i class="fas fa-chevron-right"></i>';
    rightArrow.addEventListener('click', () => navigateToCard(1));

    // Append arrows and counter to navigation container
    navContainer.appendChild(leftArrow);
    navContainer.appendChild(cardCounter);
    navContainer.appendChild(rightArrow);
}

// Clean up keyboard navigation when modal is hidden
$('#fullScreenCardModal').on('hidden.bs.modal', function() {
    $(document).off('keydown.fullScreenNav');
    currentCardIndex = -1;
});

/**
 * Theme Management System
 */

/**
 * Applies a theme by setting CSS variables
 * @param {Object} theme - The theme object containing color values
 */
function applyTheme(theme) {
    const root = document.documentElement;

    // General
    root.style.setProperty('--bg-color', theme.backgroundColor);

    // Fixed Tags Bar (Primary Tags)
    root.style.setProperty('--fixed-tags-bg', theme.fixedTagsBackground);
    root.style.setProperty('--fixed-tags-text-color', theme.fixedTagsTextColor);
    root.style.setProperty('--fixed-tags-text-muted', theme.fixedTagsTextMuted);

    // Navigation Separator
    root.style.setProperty('--nav-separator-color', theme.navSeparatorColor);

    // Navbar (Secondary Tag Menu Bar)
    root.style.setProperty('--navbar-bg', theme.navbarBackground);
    root.style.setProperty('--navbar-text-color', theme.navbarTextColor);
    root.style.setProperty('--navbar-text-muted', theme.navbarTextMuted);

    // Cards
    root.style.setProperty('--card-bg', theme.cardBackground);
    root.style.setProperty('--card-text-color', theme.cardTextColor);
    root.style.setProperty('--card-border', theme.cardBorder);
    root.style.setProperty('--card-shadow', theme.cardShadow);
    root.style.setProperty('--link-color', theme.linkColor);
    root.style.setProperty('--link-hover-color', theme.linkHoverColor);

    // Fixed Tags (Primary Tags)
    root.style.setProperty('--hover-bg', theme.hoverBackground);
    root.style.setProperty('--active-tag-bg', theme.activeTagBackground);
    root.style.setProperty('--active-tag-color', theme.activeTagColor);

    // Secondary Tags (Tag Menu)
    root.style.setProperty('--secondary-tag-bg', theme.secondaryTagBackground);
    root.style.setProperty('--secondary-tag-text-color', theme.secondaryTagTextColor);
    root.style.setProperty('--secondary-tag-hover-bg', theme.secondaryTagHoverBackground);
    root.style.setProperty('--secondary-tag-active-bg', theme.secondaryTagActiveBackground);
    root.style.setProperty('--secondary-tag-active-color', theme.secondaryTagActiveColor);

    // Action Buttons (Add & Settings)
    root.style.setProperty('--action-btn-bg', theme.actionBtnBackground);
    root.style.setProperty('--action-btn-text-color', theme.actionBtnTextColor);
    root.style.setProperty('--action-btn-hover-bg', theme.actionBtnHoverBackground);
    root.style.setProperty('--action-btn-hover-color', theme.actionBtnHoverColor);

    // Modals
    root.style.setProperty('--modal-bg', theme.modalBackground);
    root.style.setProperty('--modal-header-bg', theme.modalHeaderBackground);
    root.style.setProperty('--modal-text-color', theme.modalTextColor);

    // Buttons & UI
    root.style.setProperty('--primary-color', theme.primaryColor);
    root.style.setProperty('--secondary-color', theme.secondaryColor);
    root.style.setProperty('--border-color', theme.borderColor);
    root.style.setProperty('--text-muted', theme.textMuted);

    debugLog('Theme applied:', theme);
}

/**
 * Loads the current theme (base theme + overrides)
 * Priority: 1. savedTheme from file, 2. base theme + overrides from localStorage, 3. default theme
 * @returns {Object} The current theme object
 */
function loadTheme() {
    // First check if there's a savedTheme from the hyperlinks.js file
    if (typeof savedTheme !== 'undefined' && savedTheme !== null) {
        try {
            // Merge saved theme with default theme to ensure all new properties exist
            const merged = { ...metaData.defaultTheme, ...savedTheme };
            debugLog('Loaded theme from file (savedTheme), merged with defaults:', merged);
            return merged;
        } catch (e) {
            console.error('Error loading theme from file:', e);
        }
    }

    // Load base theme and overrides from localStorage
    const baseThemeName = localStorage.getItem('baseThemeName');
    const themeOverrides = localStorage.getItem('themeOverrides');

    // Start with the base theme
    let baseTheme = metaData.defaultTheme;
    if (baseThemeName && metaData.themes && metaData.themes[baseThemeName]) {
        baseTheme = metaData.themes[baseThemeName];
        debugLog('Using base theme:', baseThemeName);
    }

    // Apply overrides on top of base theme
    if (themeOverrides) {
        try {
            const overrides = JSON.parse(themeOverrides);
            const merged = { ...baseTheme, ...overrides };
            debugLog('Applied overrides to base theme:', merged);
            return merged;
        } catch (e) {
            console.error('Error parsing theme overrides:', e);
            return baseTheme;
        }
    }

    // No overrides, just return base theme
    debugLog('No overrides, using base theme:', baseTheme);
    return baseTheme;
}

/**
 * Gets the base theme (without overrides)
 * @returns {Object} The base theme object
 */
function getBaseTheme() {
    // First check if there's a savedTheme from the hyperlinks.js file
    if (typeof savedTheme !== 'undefined' && savedTheme !== null) {
        try {
            const merged = { ...metaData.defaultTheme, ...savedTheme };
            return merged;
        } catch (e) {
            console.error('Error loading theme from file:', e);
        }
    }

    // Load base theme name from localStorage
    const baseThemeName = localStorage.getItem('baseThemeName');

    if (baseThemeName && metaData.themes && metaData.themes[baseThemeName]) {
        return metaData.themes[baseThemeName];
    }

    // Return default theme
    return metaData.defaultTheme;
}

/**
 * Saves theme overrides to localStorage
 * Only saves properties that differ from the base theme
 * @param {Object} theme - The complete theme object
 */
function saveTheme(theme) {
    const baseTheme = getBaseTheme();
    const overrides = {};

    // Compare each property and only save differences
    for (const key in theme) {
        if (theme[key] !== baseTheme[key]) {
            overrides[key] = theme[key];
        }
    }

    // Save only the overrides
    if (Object.keys(overrides).length > 0) {
        localStorage.setItem('themeOverrides', JSON.stringify(overrides));
        debugLog('Theme overrides saved:', overrides);
    } else {
        // No overrides, clear the overrides
        localStorage.removeItem('themeOverrides');
        debugLog('No theme overrides, cleared from localStorage');
    }
}

/**
 * Updates the theme modal form with current theme values
 * @param {Object} theme - The theme object to display
 */
function updateThemeForm(theme) {
    debugLog('updateThemeForm called with theme:', theme);

    // Helper function to safely set element value
    const setElementValue = (id, value) => {
        const element = document.getElementById(id);
        if (element) {
            element.value = value;
            debugLog(`Set ${id} = ${value}`);
        } else {
            console.warn(`updateThemeForm: Missing element with id "${id}"`);
        }
    };

    // General
    setElementValue('bgColor', theme.backgroundColor);
    setElementValue('bgColorText', theme.backgroundColor);

    // Fixed Tags Bar (Primary Tags)
    setElementValue('fixedTagsBg', theme.fixedTagsBackground);
    setElementValue('fixedTagsBgText', theme.fixedTagsBackground);
    setElementValue('fixedTagsTextColor', theme.fixedTagsTextColor);
    setElementValue('fixedTagsTextColorText', theme.fixedTagsTextColor);
    setElementValue('fixedTagsTextMuted', theme.fixedTagsTextMuted);
    setElementValue('fixedTagsTextMutedText', theme.fixedTagsTextMuted);

    // Navigation Separator
    setElementValue('navSeparatorColor', theme.navSeparatorColor);
    setElementValue('navSeparatorColorText', theme.navSeparatorColor);

    // Navbar (Secondary Tag Menu Bar)
    setElementValue('navbarBg', theme.navbarBackground);
    setElementValue('navbarBgText', theme.navbarBackground);
    setElementValue('navbarTextColor', theme.navbarTextColor);
    setElementValue('navbarTextColorText', theme.navbarTextColor);
    setElementValue('navbarTextMuted', theme.navbarTextMuted);
    setElementValue('navbarTextMutedText', theme.navbarTextMuted);

    // Cards
    setElementValue('cardBg', theme.cardBackground);
    setElementValue('cardBgText', theme.cardBackground);
    setElementValue('cardTextColor', theme.cardTextColor);
    setElementValue('cardTextColorText', theme.cardTextColor);
    setElementValue('cardBorder', theme.cardBorder);
    setElementValue('cardBorderText', theme.cardBorder);
    setElementValue('cardShadowText', theme.cardShadow);
    setElementValue('linkColor', theme.linkColor);
    setElementValue('linkColorText', theme.linkColor);
    setElementValue('linkHoverColor', theme.linkHoverColor);
    setElementValue('linkHoverColorText', theme.linkHoverColor);

    // Fixed Tags (Primary Tags)
    setElementValue('hoverBg', theme.hoverBackground);
    setElementValue('hoverBgText', theme.hoverBackground);
    setElementValue('activeTagBg', theme.activeTagBackground);
    setElementValue('activeTagBgText', theme.activeTagBackground);
    setElementValue('activeTagColor', theme.activeTagColor);
    setElementValue('activeTagColorText', theme.activeTagColor);

    // Secondary Tags (Tag Menu)
    setElementValue('secondaryTagBg', theme.secondaryTagBackground);
    setElementValue('secondaryTagBgText', theme.secondaryTagBackground);
    setElementValue('secondaryTagTextColor', theme.secondaryTagTextColor);
    setElementValue('secondaryTagTextColorText', theme.secondaryTagTextColor);
    setElementValue('secondaryTagHoverBg', theme.secondaryTagHoverBackground);
    setElementValue('secondaryTagHoverBgText', theme.secondaryTagHoverBackground);
    setElementValue('secondaryTagActiveBg', theme.secondaryTagActiveBackground);
    setElementValue('secondaryTagActiveBgText', theme.secondaryTagActiveBackground);
    setElementValue('secondaryTagActiveColor', theme.secondaryTagActiveColor);
    setElementValue('secondaryTagActiveColorText', theme.secondaryTagActiveColor);

    // Action Buttons (Add & Settings)
    setElementValue('actionBtnBg', theme.actionBtnBackground);
    setElementValue('actionBtnBgText', theme.actionBtnBackground);
    setElementValue('actionBtnTextColor', theme.actionBtnTextColor);
    setElementValue('actionBtnTextColorText', theme.actionBtnTextColor);
    setElementValue('actionBtnHoverBg', theme.actionBtnHoverBackground);
    setElementValue('actionBtnHoverBgText', theme.actionBtnHoverBackground);
    setElementValue('actionBtnHoverColor', theme.actionBtnHoverColor);
    setElementValue('actionBtnHoverColorText', theme.actionBtnHoverColor);

    // Modals
    setElementValue('modalBg', theme.modalBackground);
    setElementValue('modalBgText', theme.modalBackground);
    setElementValue('modalHeaderBg', theme.modalHeaderBackground);
    setElementValue('modalHeaderBgText', theme.modalHeaderBackground);
    setElementValue('modalTextColor', theme.modalTextColor);
    setElementValue('modalTextColorText', theme.modalTextColor);

    // Buttons & UI
    setElementValue('primaryColor', theme.primaryColor);
    setElementValue('primaryColorText', theme.primaryColor);
    setElementValue('secondaryColor', theme.secondaryColor);
    setElementValue('secondaryColorText', theme.secondaryColor);
    setElementValue('borderColor', theme.borderColor);
    setElementValue('borderColorText', theme.borderColor);
    setElementValue('textMuted', theme.textMuted);
    setElementValue('textMutedText', theme.textMuted);
}

/**
 * Gets the current theme from the form
 * @returns {Object} The theme object from form values
 */
function getThemeFromForm() {
    // Helper function to safely get element value
    const getElementValue = (id, defaultValue = '#ffffff') => {
        const element = document.getElementById(id);
        if (element) {
            return element.value;
        } else {
            console.warn(`getThemeFromForm: Missing element with id "${id}", using default: ${defaultValue}`);
            return defaultValue;
        }
    };

    return {
        // General
        backgroundColor: getElementValue('bgColorText', '#ffffff'),

        // Fixed Tags Bar (Primary Tags)
        fixedTagsBackground: getElementValue('fixedTagsBgText', '#000000'),
        fixedTagsTextColor: getElementValue('fixedTagsTextColorText', '#ffffff'),
        fixedTagsTextMuted: getElementValue('fixedTagsTextMutedText', '#adb5bd'),

        // Navigation Separator
        navSeparatorColor: getElementValue('navSeparatorColorText', '#b8860b'),

        // Navbar (Secondary Tag Menu Bar)
        navbarBackground: getElementValue('navbarBgText', '#2a2a2a'),
        navbarTextColor: getElementValue('navbarTextColorText', '#e0e0e0'),
        navbarTextMuted: getElementValue('navbarTextMutedText', '#adb5bd'),

        // Cards
        cardBackground: getElementValue('cardBgText', '#ffffff'),
        cardTextColor: getElementValue('cardTextColorText', '#212529'),
        cardBorder: getElementValue('cardBorderText', '#dee2e6'),
        cardShadow: getElementValue('cardShadowText', '0 0.25rem 0.5rem rgba(0,0,0,0.1)'),
        linkColor: getElementValue('linkColorText', '#007bff'),
        linkHoverColor: getElementValue('linkHoverColorText', '#0056b3'),

        // Fixed Tags (Primary Tags)
        hoverBackground: getElementValue('hoverBgText', '#f8f9fa'),
        activeTagBackground: getElementValue('activeTagBgText', '#007bff'),
        activeTagColor: getElementValue('activeTagColorText', '#ffffff'),

        // Secondary Tags (Tag Menu)
        secondaryTagBackground: getElementValue('secondaryTagBgText', '#ffffff'),
        secondaryTagTextColor: getElementValue('secondaryTagTextColorText', '#212529'),
        secondaryTagHoverBackground: getElementValue('secondaryTagHoverBgText', '#e9ecef'),
        secondaryTagActiveBackground: getElementValue('secondaryTagActiveBgText', '#28a745'),
        secondaryTagActiveColor: getElementValue('secondaryTagActiveColorText', '#ffffff'),

        // Action Buttons (Add & Settings)
        actionBtnBackground: getElementValue('actionBtnBgText', 'transparent'),
        actionBtnTextColor: getElementValue('actionBtnTextColorText', '#ffffff'),
        actionBtnHoverBackground: getElementValue('actionBtnHoverBgText', '#333333'),
        actionBtnHoverColor: getElementValue('actionBtnHoverColorText', '#ffffff'),

        // Modals
        modalBackground: getElementValue('modalBgText', '#ffffff'),
        modalHeaderBackground: getElementValue('modalHeaderBgText', '#f8f9fa'),
        modalTextColor: getElementValue('modalTextColorText', '#212529'),

        // Buttons & UI
        primaryColor: getElementValue('primaryColorText', '#007bff'),
        secondaryColor: getElementValue('secondaryColorText', '#6c757d'),
        borderColor: getElementValue('borderColorText', '#dee2e6'),
        textMuted: getElementValue('textMutedText', '#6c757d')
    };
}

/**
 * Creates theme preset buttons
 */
function createThemePresets() {
    const presetsContainer = document.getElementById('themePresets');

    // Only create presets if the container exists (dynastart.html only)
    if (!presetsContainer) {
        return;
    }

    const themes = metaData.themes;

    Object.keys(themes).forEach(themeKey => {
        const theme = themes[themeKey];
        const col = document.createElement('div');
        col.className = 'col-md-4 col-sm-6 mb-3';

        const button = document.createElement('button');
        button.className = 'btn btn-outline-primary btn-block';
        button.textContent = theme.name;
        button.addEventListener('click', () => {
            // Merge preset with defaults to ensure all properties exist
            const fullTheme = { ...metaData.defaultTheme, ...theme };

            // Set this as the new base theme and clear overrides
            localStorage.setItem('baseThemeName', themeKey);
            localStorage.removeItem('themeOverrides');
            debugLog('Set base theme to:', themeKey, 'and cleared overrides');

            updateThemeForm(fullTheme);
            applyTheme(fullTheme);
        });

        col.appendChild(button);
        presetsContainer.appendChild(col);
    });
}

/**
 * Applies theme from form values immediately (for live preview)
 */
function applyThemeFromForm() {
    const theme = getThemeFromForm();
    applyTheme(theme);
}

/**
 * Syncs color picker with text input and applies theme in real-time
 * @param {string} colorId - The ID of the color input
 * @param {string} textId - The ID of the text input
 */
function syncColorInputs(colorId, textId) {
    const colorInput = document.getElementById(colorId);
    const textInput = document.getElementById(textId);

    if (!colorInput || !textInput) {
        console.warn(`syncColorInputs: Missing elements for ${colorId} or ${textId}`);
        return;
    }

    colorInput.addEventListener('input', (e) => {
        textInput.value = e.target.value;
        // Apply theme immediately
        applyThemeFromForm();
    });

    textInput.addEventListener('input', (e) => {
        const value = e.target.value;
        if (/^#[0-9A-F]{6}$/i.test(value)) {
            colorInput.value = value;
            // Apply theme immediately
            applyThemeFromForm();
        }
    });
}

/**
 * Initializes theme system
 */
function initThemeSystem() {
    // Initialize base theme if not set
    if (!localStorage.getItem('baseThemeName') && !localStorage.getItem('theme')) {
        // First time user or migrating from old system
        // Set "Light" as the default base theme
        localStorage.setItem('baseThemeName', 'Light');
        debugLog('Initialized base theme to Light');
    }

    // Migrate old localStorage theme to new system
    const oldTheme = localStorage.getItem('theme');
    if (oldTheme && !localStorage.getItem('baseThemeName')) {
        // User has old theme format, migrate it
        try {
            const parsed = JSON.parse(oldTheme);
            // Try to detect which base theme it's closest to (for now just set to default)
            localStorage.setItem('baseThemeName', 'Light');
            // The old theme becomes the full theme, will be split into overrides on next save
            debugLog('Migrated old theme format to new system');
        } catch (e) {
            console.error('Error migrating old theme:', e);
        }
        // Remove old theme storage
        localStorage.removeItem('theme');
    }

    // Load and apply saved theme
    const currentTheme = loadTheme();
    applyTheme(currentTheme);

    // Create theme preset buttons
    createThemePresets();

    // Sync color pickers with text inputs
    // General
    syncColorInputs('bgColor', 'bgColorText');

    // Fixed Tags Bar (Primary Tags)
    syncColorInputs('fixedTagsBg', 'fixedTagsBgText');
    syncColorInputs('fixedTagsTextColor', 'fixedTagsTextColorText');
    syncColorInputs('fixedTagsTextMuted', 'fixedTagsTextMutedText');

    // Navbar (Secondary Tag Menu Bar)
    syncColorInputs('navbarBg', 'navbarBgText');
    syncColorInputs('navbarTextColor', 'navbarTextColorText');
    syncColorInputs('navbarTextMuted', 'navbarTextMutedText');

    // Cards
    syncColorInputs('cardBg', 'cardBgText');
    syncColorInputs('cardTextColor', 'cardTextColorText');
    syncColorInputs('cardBorder', 'cardBorderText');
    syncColorInputs('linkColor', 'linkColorText');
    syncColorInputs('linkHoverColor', 'linkHoverColorText');

    // Card shadow (special text-only input)
    const cardShadowInput = document.getElementById('cardShadowText');
    if (cardShadowInput) {
        cardShadowInput.addEventListener('input', () => {
            applyThemeFromForm();
        });
    }

    // Fixed Tags (Primary Tags)
    syncColorInputs('hoverBg', 'hoverBgText');
    syncColorInputs('activeTagBg', 'activeTagBgText');
    syncColorInputs('activeTagColor', 'activeTagColorText');

    // Secondary Tags (Tag Menu)
    syncColorInputs('secondaryTagBg', 'secondaryTagBgText');
    syncColorInputs('secondaryTagTextColor', 'secondaryTagTextColorText');
    syncColorInputs('secondaryTagHoverBg', 'secondaryTagHoverBgText');
    syncColorInputs('secondaryTagActiveBg', 'secondaryTagActiveBgText');
    syncColorInputs('secondaryTagActiveColor', 'secondaryTagActiveColorText');

    // Action Buttons (Add & Settings)
    syncColorInputs('actionBtnBg', 'actionBtnBgText');
    syncColorInputs('actionBtnTextColor', 'actionBtnTextColorText');
    syncColorInputs('actionBtnHoverBg', 'actionBtnHoverBgText');
    syncColorInputs('actionBtnHoverColor', 'actionBtnHoverColorText');

    // Modals
    syncColorInputs('modalBg', 'modalBgText');
    syncColorInputs('modalHeaderBg', 'modalHeaderBgText');
    syncColorInputs('modalTextColor', 'modalTextColorText');

    // Buttons & UI
    syncColorInputs('primaryColor', 'primaryColorText');
    syncColorInputs('secondaryColor', 'secondaryColorText');
    syncColorInputs('borderColor', 'borderColorText');
    syncColorInputs('textMuted', 'textMutedText');

    // Store the theme when modal is opened (for cancel/revert)
    let themeBeforeEdit = null;

    // Update form when modal is opened
    $('#themeModal').on('show.bs.modal', function() {
        const currentTheme = loadTheme();
        themeBeforeEdit = currentTheme; // Store for potential revert
        updateThemeForm(currentTheme);
    });

    // Restore original theme if modal is closed without saving
    $('#themeModal').on('hidden.bs.modal', function() {
        // Check if the current theme matches what's saved
        const currentAppliedTheme = getThemeFromForm();
        const savedTheme = loadTheme();

        // If themes don't match, user made changes but didn't save
        // Restore the saved theme
        if (JSON.stringify(currentAppliedTheme) !== JSON.stringify(savedTheme)) {
            applyTheme(savedTheme);
        }
    });
}

/**
 * Gets all current CSS custom properties (variables) from :root
 * @returns {Object} Object containing CSS variable names and values
 */
function getCurrentCssOverrides() {
    const rootStyles = getComputedStyle(document.documentElement);
    const cssVars = {};

    // List of CSS variables we want to display (must match applyTheme() function)
    const cssVariableNames = [
        // General
        '--bg-color',
        // Fixed Tags Bar (Primary Tags)
        '--fixed-tags-bg',
        '--fixed-tags-text-color',
        '--fixed-tags-text-muted',
        // Navigation Separator
        '--nav-separator-color',
        // Navbar (Secondary Tag Menu Bar)
        '--navbar-bg',
        '--navbar-text-color',
        '--navbar-text-muted',
        // Cards
        '--card-bg',
        '--card-text-color',
        '--card-border',
        '--card-shadow',
        '--link-color',
        '--link-hover-color',
        // Fixed Tags (Primary Tags) - Hover states
        '--hover-bg',
        '--active-tag-bg',
        '--active-tag-color',
        // Secondary Tags (Tag Menu)
        '--secondary-tag-bg',
        '--secondary-tag-text-color',
        '--secondary-tag-hover-bg',
        '--secondary-tag-active-bg',
        '--secondary-tag-active-color',
        // Action Buttons (Add & Settings)
        '--action-btn-bg',
        '--action-btn-text-color',
        '--action-btn-hover-bg',
        '--action-btn-hover-color',
        // Modals
        '--modal-bg',
        '--modal-header-bg',
        '--modal-text-color',
        // Buttons & UI
        '--primary-color',
        '--secondary-color',
        '--border-color',
        '--text-muted'
    ];

    // Get the value of each CSS variable
    cssVariableNames.forEach(varName => {
        const value = rootStyles.getPropertyValue(varName).trim();
        if (value) {
            cssVars[varName] = value;
        }
    });

    return cssVars;
}

/**
 * Displays CSS overrides in the modal (only shows values different from base theme)
 */
function displayCssOverrides() {
    const cssVars = getCurrentCssOverrides();
    const baseTheme = getBaseTheme();
    const container = document.getElementById('cssOverridesContent');

    if (!container) return;

    // Map theme properties to CSS variable names
    const themeToVarMapping = {
        '--bg-color': 'backgroundColor',
        '--fixed-tags-bg': 'fixedTagsBackground',
        '--fixed-tags-text-color': 'fixedTagsTextColor',
        '--fixed-tags-text-muted': 'fixedTagsTextMuted',
        '--nav-separator-color': 'navSeparatorColor',
        '--navbar-bg': 'navbarBackground',
        '--navbar-text-color': 'navbarTextColor',
        '--navbar-text-muted': 'navbarTextMuted',
        '--card-bg': 'cardBackground',
        '--card-text-color': 'cardTextColor',
        '--card-border': 'cardBorder',
        '--card-shadow': 'cardShadow',
        '--link-color': 'linkColor',
        '--link-hover-color': 'linkHoverColor',
        '--hover-bg': 'hoverBackground',
        '--active-tag-bg': 'activeTagBackground',
        '--active-tag-color': 'activeTagColor',
        '--secondary-tag-bg': 'secondaryTagBackground',
        '--secondary-tag-text-color': 'secondaryTagTextColor',
        '--secondary-tag-hover-bg': 'secondaryTagHoverBackground',
        '--secondary-tag-active-bg': 'secondaryTagActiveBackground',
        '--secondary-tag-active-color': 'secondaryTagActiveColor',
        '--action-btn-bg': 'actionBtnBackground',
        '--action-btn-text-color': 'actionBtnTextColor',
        '--action-btn-hover-bg': 'actionBtnHoverBackground',
        '--action-btn-hover-color': 'actionBtnHoverColor',
        '--modal-bg': 'modalBackground',
        '--modal-header-bg': 'modalHeaderBackground',
        '--modal-text-color': 'modalTextColor',
        '--primary-color': 'primaryColor',
        '--secondary-color': 'secondaryColor',
        '--border-color': 'borderColor',
        '--text-muted': 'textMuted'
    };

    // Group CSS variables by category (must match applyTheme() function)
    const categories = {
        'General': ['--bg-color', '--primary-color', '--secondary-color', '--border-color', '--text-muted'],
        'Primary Navigation': ['--fixed-tags-bg', '--fixed-tags-text-color', '--fixed-tags-text-muted', '--nav-separator-color'],
        'Secondary Navigation': ['--navbar-bg', '--navbar-text-color', '--navbar-text-muted'],
        'Cards': ['--card-bg', '--card-text-color', '--card-border', '--card-shadow', '--link-color', '--link-hover-color'],
        'Primary Tag States': ['--hover-bg', '--active-tag-bg', '--active-tag-color'],
        'Secondary Tag Colors': ['--secondary-tag-bg', '--secondary-tag-text-color', '--secondary-tag-hover-bg', '--secondary-tag-active-bg', '--secondary-tag-active-color'],
        'Action Buttons': ['--action-btn-bg', '--action-btn-text-color', '--action-btn-hover-bg', '--action-btn-hover-color'],
        'Modals': ['--modal-bg', '--modal-header-bg', '--modal-text-color']
    };

    // Filter out variables that match the base theme
    const overrides = {};
    for (const [varName, value] of Object.entries(cssVars)) {
        const themeProp = themeToVarMapping[varName];
        if (themeProp && baseTheme[themeProp]) {
            // Compare values (normalize for comparison)
            const baseThemeValue = baseTheme[themeProp];
            if (value !== baseThemeValue) {
                overrides[varName] = {
                    current: value,
                    expected: baseThemeValue
                };
            }
        }
    }

    let html = '';

    // Check if there are any overrides
    if (Object.keys(overrides).length === 0) {
        html = `<div class="alert alert-info">
            <i class="fas fa-info-circle"></i>
            <strong>No CSS overrides detected.</strong><br>
            All CSS variables match the base theme.
        </div>`;
        container.innerHTML = html;
        return;
    }

    // Get base theme name for display
    const baseThemeName = localStorage.getItem('baseThemeName') || 'Default';

    html += `<div class="alert alert-warning mb-3">
        <i class="fas fa-exclamation-triangle"></i>
        <strong>${Object.keys(overrides).length} CSS override(s) detected.</strong><br>
        The following variables differ from the base theme (${baseThemeName}):
    </div>`;

    // Display overrides by category
    for (const [category, varNames] of Object.entries(categories)) {
        // Check if this category has any overrides
        const categoryOverrides = varNames.filter(v => overrides[v]);
        if (categoryOverrides.length === 0) continue;

        html += `<div class="mb-3">`;
        html += `<h6 class="font-weight-bold text-primary">${category}</h6>`;
        html += `<table class="table table-sm table-bordered">`;
        html += `<thead><tr><th style="width: 30%;">Variable</th><th style="width: 35%;">Current Value</th><th style="width: 35%;">Base Theme Value</th></tr></thead>`;
        html += `<tbody>`;

        categoryOverrides.forEach(varName => {
            const override = overrides[varName];
            const currentValue = override.current;
            const expectedValue = override.expected;

            // Create color swatches if values are colors
            const isCurrentColor = currentValue.startsWith('#') || currentValue.startsWith('rgb');
            const isExpectedColor = expectedValue.startsWith('#') || expectedValue.startsWith('rgb');

            const currentSwatch = isCurrentColor ?
                `<span style="display: inline-block; width: 20px; height: 20px; background-color: ${currentValue}; border: 1px solid #ccc; margin-right: 8px; vertical-align: middle;"></span>` : '';
            const expectedSwatch = isExpectedColor ?
                `<span style="display: inline-block; width: 20px; height: 20px; background-color: ${expectedValue}; border: 1px solid #ccc; margin-right: 8px; vertical-align: middle;"></span>` : '';

            html += `<tr>`;
            html += `<td><code>${varName}</code></td>`;
            html += `<td>${currentSwatch}<code>${currentValue}</code></td>`;
            html += `<td>${expectedSwatch}<code>${expectedValue}</code></td>`;
            html += `</tr>`;
        });

        html += `</tbody></table></div>`;
    }

    container.innerHTML = html;
}

/**
 * Copies CSS overrides to clipboard (only variables that differ from base theme)
 */
function copyCssOverridesToClipboard() {
    const cssVars = getCurrentCssOverrides();
    const baseTheme = getBaseTheme();

    // Map theme properties to CSS variable names
    const themeToVarMapping = {
        '--bg-color': 'backgroundColor',
        '--fixed-tags-bg': 'fixedTagsBackground',
        '--fixed-tags-text-color': 'fixedTagsTextColor',
        '--fixed-tags-text-muted': 'fixedTagsTextMuted',
        '--nav-separator-color': 'navSeparatorColor',
        '--navbar-bg': 'navbarBackground',
        '--navbar-text-color': 'navbarTextColor',
        '--navbar-text-muted': 'navbarTextMuted',
        '--card-bg': 'cardBackground',
        '--card-text-color': 'cardTextColor',
        '--card-border': 'cardBorder',
        '--card-shadow': 'cardShadow',
        '--link-color': 'linkColor',
        '--link-hover-color': 'linkHoverColor',
        '--hover-bg': 'hoverBackground',
        '--active-tag-bg': 'activeTagBackground',
        '--active-tag-color': 'activeTagColor',
        '--secondary-tag-bg': 'secondaryTagBackground',
        '--secondary-tag-text-color': 'secondaryTagTextColor',
        '--secondary-tag-hover-bg': 'secondaryTagHoverBackground',
        '--secondary-tag-active-bg': 'secondaryTagActiveBackground',
        '--secondary-tag-active-color': 'secondaryTagActiveColor',
        '--action-btn-bg': 'actionBtnBackground',
        '--action-btn-text-color': 'actionBtnTextColor',
        '--action-btn-hover-bg': 'actionBtnHoverBackground',
        '--action-btn-hover-color': 'actionBtnHoverColor',
        '--modal-bg': 'modalBackground',
        '--modal-header-bg': 'modalHeaderBackground',
        '--modal-text-color': 'modalTextColor',
        '--primary-color': 'primaryColor',
        '--secondary-color': 'secondaryColor',
        '--border-color': 'borderColor',
        '--text-muted': 'textMuted'
    };

    // Filter out variables that match the base theme
    const overrides = {};
    for (const [varName, value] of Object.entries(cssVars)) {
        const themeProp = themeToVarMapping[varName];
        if (themeProp && baseTheme[themeProp]) {
            const baseThemeValue = baseTheme[themeProp];
            if (value !== baseThemeValue) {
                overrides[varName] = value;
            }
        }
    }

    // Check if there are any overrides
    if (Object.keys(overrides).length === 0) {
        alert('No CSS overrides to copy. All variables match the base theme.');
        return;
    }

    let text = ':root {\n';
    for (const [varName, value] of Object.entries(overrides)) {
        text += `  ${varName}: ${value};\n`;
    }
    text += '}';

    // Copy to clipboard
    navigator.clipboard.writeText(text).then(() => {
        // Show success feedback
        const button = document.getElementById('copyCssOverridesButton');
        const originalText = button.textContent;
        button.textContent = 'Copied!';
        button.classList.add('btn-success');
        button.classList.remove('btn-secondary');

        setTimeout(() => {
            button.textContent = originalText;
            button.classList.remove('btn-success');
            button.classList.add('btn-secondary');
        }, 2000);
    }).catch(err => {
        console.error('Failed to copy to clipboard:', err);
        alert('Failed to copy to clipboard. Please try again.');
    });
}

/**
 * Opens the fullscreen text editor modal for editing additional text
 * @param {Object} item - The link item to edit
 */
function openTextEditor(item) {
    // Store the current item UID for saving later
    window.currentEditingItemUid = item.uid;

    // Set the textarea value
    const textarea = document.getElementById('textEditorTextarea');
    if (textarea) {
        textarea.value = item.tooltip || '';
    }

    // Show the modal
    $('#textEditorModal').modal('show');
}

/**
 * Saves the edited text from the fullscreen editor
 */
function saveEditedText() {
    const textarea = document.getElementById('textEditorTextarea');
    const uid = window.currentEditingItemUid;

    if (!uid || !textarea) {
        console.error('Cannot save: missing UID or textarea');
        return;
    }

    // Get the current item
    const item = getItem(uid);
    if (!item) {
        console.error('Cannot find item with UID:', uid);
        return;
    }

    // Update the item with the new tooltip
    const updatedItem = {
        ...item,
        tooltip: textarea.value
    };

    // Update the item in updatedLinks
    addUpdatedLink(updatedItem);

    // Refresh the display first
    filterLinksByTags();

    // Hide the modal after a brief delay to ensure display is updated
    setTimeout(() => {
        $('#textEditorModal').modal('hide');
    }, 100);
}

/**
 * Detects if the app is running as a PWA
 * Works for iOS Safari, Chrome, and other browsers
 * @returns {boolean} True if running as PWA
 */
function detectPWA() {
    // Check if running in standalone mode (iOS Safari)
    const isStandalone = window.navigator.standalone === true;

    // Check if display-mode is standalone (Chrome, Edge, etc.)
    const isDisplayModeStandalone = window.matchMedia('(display-mode: standalone)').matches;

    // Check if display-mode is fullscreen
    const isDisplayModeFullscreen = window.matchMedia('(display-mode: fullscreen)').matches;

    // Check if display-mode is minimal-ui
    const isDisplayModeMinimalUI = window.matchMedia('(display-mode: minimal-ui)').matches;

    const isPWA = isStandalone || isDisplayModeStandalone || isDisplayModeFullscreen || isDisplayModeMinimalUI;

    debugLog('[PWA Detection]', {
        isStandalone,
        isDisplayModeStandalone,
        isDisplayModeFullscreen,
        isDisplayModeMinimalUI,
        isPWA
    });

    return isPWA;
}

/**
 * Registers the service worker for PWA functionality
 */
function registerServiceWorker() {
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('/service-worker.js')
            .then((registration) => {
                console.log('[PWA] Service Worker registered successfully:', registration.scope);

                // Check for updates periodically
                registration.addEventListener('updatefound', () => {
                    const newWorker = registration.installing;
                    console.log('[PWA] New service worker found, installing...');

                    newWorker.addEventListener('statechange', () => {
                        if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                            console.log('[PWA] New service worker installed, ready to activate');
                            // Optionally notify user about update
                        }
                    });
                });
            })
            .catch((error) => {
                console.error('[PWA] Service Worker registration failed:', error);
            });

        // Listen for service worker updates
        navigator.serviceWorker.addEventListener('controllerchange', () => {
            console.log('[PWA] Service worker controller changed, reloading page...');
            window.location.reload();
        });
    } else {
        console.log('[PWA] Service Workers not supported in this browser');
    }
}

/**
 * Initializes PWA functionality
 */
function initializePWA() {
    // Detect if running as PWA
    pwa_app = detectPWA();

    if (pwa_app) {
        console.log('[PWA] Running as Progressive Web App');
        document.body.classList.add('pwa-mode');
    } else {
        console.log('[PWA] Running in browser mode');
        document.body.classList.add('browser-mode');
    }

    // Register service worker for offline support
    registerServiceWorker();

    // Listen for app installation
    window.addEventListener('beforeinstallprompt', (e) => {
        console.log('[PWA] Install prompt available');
        // Optionally store the event to show install button later
        window.deferredPrompt = e;
    });

    // Listen for app installed event
    window.addEventListener('appinstalled', () => {
        console.log('[PWA] App installed successfully');
        window.deferredPrompt = null;
    });
}

// Handle theme save button
document.addEventListener('DOMContentLoaded', () => {
    const saveThemeButton = document.getElementById('saveThemeButton');
    if (saveThemeButton) {
        saveThemeButton.addEventListener('click', () => {
            const theme = getThemeFromForm();
            applyTheme(theme);
            saveTheme(theme);
            $('#themeModal').modal('hide');
        });
    }

    // Handle theme reset button
    const resetThemeButton = document.getElementById('resetThemeButton');
    if (resetThemeButton) {
        resetThemeButton.addEventListener('click', () => {
            const defaultTheme = metaData.defaultTheme;
            updateThemeForm(defaultTheme);
            applyTheme(defaultTheme);
            // Note: Theme will be saved when user clicks "Apply Theme" button
        });
    }

    // Handle text editor save button
    const saveTextEditorButton = document.getElementById('saveTextEditorButton');
    if (saveTextEditorButton) {
        saveTextEditorButton.addEventListener('click', () => {
            saveEditedText();
        });
    }

    // Handle CSS overrides modal show event
    $('#cssOverridesModal').on('show.bs.modal', function() {
        displayCssOverrides();
    });

    // Handle copy CSS overrides button
    const copyCssOverridesButton = document.getElementById('copyCssOverridesButton');
    if (copyCssOverridesButton) {
        copyCssOverridesButton.addEventListener('click', () => {
            copyCssOverridesToClipboard();
        });
    }
});

// Set focus on the search bar when the page loads
document.addEventListener('DOMContentLoaded', (event) => {
    // Check if the URL hash is #debug and set the debug flag
    if (window.location.hash === '#debug') {
        debug = true;
        debugLog("Debug mode is ON");
    }

    // Initialize PWA functionality
    initializePWA();

    // Initialize theme system
    initThemeSystem();

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
