// ============================================================
// lost-items.js — Loads and displays lost item reports
// Concepts used: arrays, objects, loops, DOM manipulation,
//                localStorage, search/filter, innerHTML
// ============================================================

// --- Wait for the page to load ---
window.addEventListener("load", function () {

    // --- Get references to page elements ---
    var itemsGrid = document.getElementById("items-grid");
    var noResults = document.getElementById("no-results");
    var searchInput = document.getElementById("search");
    var catFilter = document.getElementById("category");
    var locFilter = document.getElementById("location");
    var dateFilter = document.getElementById("date");
    var searchBtn = document.querySelector(".search-btn");

    // Detail modal elements
    var modal = document.getElementById("detail-modal");
    var modalClose = document.getElementById("modal-close");
    var modalContent = document.getElementById("modal-body");

    // --- Define the 6 built-in sample items (static data) ---
    // Concept: array of objects
    var sampleItems = [
        {
            id: "sample-lost-1",
            itemName: "Black Leather Wallet",
            category: "wallet",
            location: "City Market",
            description: "Black leather wallet containing some cards and personal identification documents.",
            date: "2026-08-15",
            contactName: "Rahul S.",
            contactEmail: "rahul@example.com",
            contactPhone: "9876540001",
            image: ""
        },
        {
            id: "sample-lost-2",
            itemName: "Black Smartphone",
            category: "electronics",
            location: "Bus Stand",
            description: "Black smartphone with a dark protective case. Lost while travelling through the city.",
            date: "2026-08-14",
            contactName: "Priya M.",
            contactEmail: "priya@example.com",
            contactPhone: "9876540002",
            image: ""
        },
        {
            id: "sample-lost-3",
            itemName: "Set of House Keys",
            category: "keys",
            location: "City Park",
            description: "A small set of silver keys attached to a simple keychain.",
            date: "2026-08-13",
            contactName: "Arjun K.",
            contactEmail: "arjun@example.com",
            contactPhone: "9876540003",
            image: ""
        },
        {
            id: "sample-lost-4",
            itemName: "College ID Card",
            category: "documents",
            location: "College Campus",
            description: "Student identification card with a blue card holder attached.",
            date: "2026-08-12",
            contactName: "Nisha T.",
            contactEmail: "nisha@example.com",
            contactPhone: "9876540004",
            image: ""
        },
        {
            id: "sample-lost-5",
            itemName: "Silver Wrist Watch",
            category: "jewellery",
            location: "Shopping Mall",
            description: "Silver coloured wrist watch with a round dial and metal strap.",
            date: "2026-08-10",
            contactName: "Vikram P.",
            contactEmail: "vikram@example.com",
            contactPhone: "9876540005",
            image: ""
        },
        {
            id: "sample-lost-6",
            itemName: "Blue Backpack",
            category: "bags",
            location: "Railway Station",
            description: "Medium-sized blue backpack with multiple compartments and a front pocket.",
            date: "2026-08-09",
            contactName: "Anjali R.",
            contactEmail: "anjali@example.com",
            contactPhone: "9876540006",
            image: ""
        }
    ];


    // --- Format a date string into a readable format ---
    // Concept: string methods, type conversion
    function formatDate(dateStr) {
        if (!dateStr) return "Unknown Date";
        // dateStr is in "YYYY-MM-DD" format
        var parts = dateStr.split("-");
        var year = parts[0];
        var month = parts[1];
        var day = parts[2];

        // Map month numbers to names — concept: array, index
        var monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun",
            "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
        var monthName = monthNames[parseInt(month) - 1];

        return day + " " + monthName + " " + year;
    }


    // --- Map category value to a display label ---
    // Concept: switch statement
    function getCategoryLabel(cat) {
        switch (cat) {
            case "electronics": return "Electronics";
            case "documents": return "Documents";
            case "wallet": return "Wallet / Purse";
            case "keys": return "Keys";
            case "bags": return "Bags";
            case "clothing": return "Clothing";
            case "jewellery": return "Jewellery";
            case "books": return "Books";
            default: return "Other";
        }
    }


    // --- Create one item card element ---
    // Concept: document.createElement, innerText, appendChild
    function createItemCard(item) {
        // Create the outer card div
        var card = document.createElement("div");
        card.className = "item-card";

        // Build image HTML — use placeholder if no image uploaded
        var imgSrc = item.image ? item.image : "https://placehold.co/300x200/e8f0fe/2563eb?text=No+Image";

        // Build the card inner HTML safely
        // Note: we use textContent for user text in the modal, but for
        // the card we build HTML using string concatenation (beginner approach)
        var categoryLabel = getCategoryLabel(item.category);
        var dateLabel = formatDate(item.date);

        card.innerHTML =
            '<div class="item-image">' +
            '<img src="' + imgSrc + '" alt="' + categoryLabel + ' image" onerror="this.src=\'https://placehold.co/300x200/e8f0fe/2563eb?text=No+Image\'">' +
            '<span class="status-badge">Lost</span>' +
            '</div>' +
            '<div class="item-content">' +
            '<h3 class="item-title"></h3>' +
            '<span class="category"></span>' +
            '<p class="item-desc"></p>' +
            '<div class="item-details">' +
            '<div><strong>Location</strong><span class="loc-text"></span></div>' +
            '<div><strong>Date</strong><span class="date-text"></span></div>' +
            '</div>' +
            '<div class="card-buttons">' +
            '<button class="view-btn" data-id="' + item.id + '">View Details</button>' +
            '<button class="match-btn" data-id="' + item.id + '">Report Match</button>' +
            '</div>' +
            '</div>';

        // Use textContent for user-provided text to prevent XSS
        card.querySelector(".item-title").textContent = item.itemName;
        card.querySelector(".category").textContent = categoryLabel;
        card.querySelector(".item-desc").textContent = item.description;
        card.querySelector(".loc-text").textContent = item.location;
        card.querySelector(".date-text").textContent = dateLabel;

        return card;
    }


    // --- Show the detail modal for a specific item ---
    function openModal(item) {
        var categoryLabel = getCategoryLabel(item.category);
        var dateLabel = formatDate(item.date);

        // Build modal content using textContent to stay safe
        modalContent.innerHTML =
            '<div class="modal-item-info">' +
            (item.image ? '<img src="' + item.image + '" alt="Item image" class="modal-img">' : '') +
            '<table class="modal-table">' +
            '<tr><th>Item Name</th><td class="m-name"></td></tr>' +
            '<tr><th>Category</th><td class="m-cat"></td></tr>' +
            '<tr><th>Location Lost</th><td class="m-loc"></td></tr>' +
            '<tr><th>Date Lost</th><td class="m-date"></td></tr>' +
            '<tr><th>Description</th><td class="m-desc"></td></tr>' +
            '<tr><th>Contact Name</th><td class="m-cname"></td></tr>' +
            '<tr><th>Contact Email</th><td class="m-cemail"></td></tr>' +
            '<tr><th>Contact Phone</th><td class="m-cphone"></td></tr>' +
            '</table>' +
            '</div>';

        // Set text content safely
        modalContent.querySelector(".m-name").textContent = item.itemName;
        modalContent.querySelector(".m-cat").textContent = categoryLabel;
        modalContent.querySelector(".m-loc").textContent = item.location;
        modalContent.querySelector(".m-date").textContent = dateLabel;
        modalContent.querySelector(".m-desc").textContent = item.description;
        modalContent.querySelector(".m-cname").textContent = item.contactName || "Not provided";
        modalContent.querySelector(".m-cemail").textContent = item.contactEmail || "Not provided";
        modalContent.querySelector(".m-cphone").textContent = item.contactPhone || "Not provided";

        modal.style.display = "flex";  // show modal
    }


    // --- Render (display) a list of items on the page ---
    // Concept: for loop, DOM manipulation, array length
    function renderItems(itemsArray) {
        // Clear what is currently shown
        itemsGrid.innerHTML = "";

        // If no items, show the "no results" message
        if (itemsArray.length === 0) {
            noResults.style.display = "block";
            return;
        }

        // Hide "no results" message
        noResults.style.display = "none";

        // Loop through items and create a card for each
        for (var i = 0; i < itemsArray.length; i++) {
            var card = createItemCard(itemsArray[i]);
            itemsGrid.appendChild(card);
        }

        // Add click events to all "View Details" buttons
        var viewBtns = itemsGrid.querySelectorAll(".view-btn");
        for (var j = 0; j < viewBtns.length; j++) {
            viewBtns[j].addEventListener("click", function (e) {
                var itemId = e.target.getAttribute("data-id");
                var allItems = sampleItems.concat(getLostItems());
                // Find the item that matches the clicked ID
                for (var k = 0; k < allItems.length; k++) {
                    if (allItems[k].id === itemId) {
                        openModal(allItems[k]);
                        break;
                    }
                }
            });
        }

        // Add click events to all "Report Match" buttons
        var matchBtns = itemsGrid.querySelectorAll(".match-btn");
        for (var m = 0; m < matchBtns.length; m++) {
            matchBtns[m].addEventListener("click", function (e) {
                var itemId = e.target.getAttribute("data-id");
                var allItems = sampleItems.concat(getLostItems());
                var found = null;
                for (var n = 0; n < allItems.length; n++) {
                    if (allItems[n].id === itemId) {
                        found = allItems[n];
                        break;
                    }
                }
                if (found) {
                    // Use confirm() as a simple "I found this item" action
                    var confirmed = confirm(
                        'Do you think you found "' + found.itemName + '"?\n\n' +
                        'Contact the reporter:\n' +
                        'Name: ' + (found.contactName || "Not provided") + '\n' +
                        'Email: ' + (found.contactEmail || "Not provided") + '\n' +
                        'Phone: ' + (found.contactPhone || "Not provided")
                    );
                    // confirmed is true if user clicked OK, false if Cancel
                }
            });
        }
    }


    // --- Search and filter function ---
    // Concept: array filtering, string methods (toLowerCase, indexOf)
    function searchAndFilter() {
        // Get the values the user entered / selected
        var searchVal = searchInput.value.trim().toLowerCase();
        var catVal = catFilter.value.toLowerCase();
        var locVal = locFilter.value.toLowerCase();
        var dateVal = dateFilter.value;

        // Combine sample items + user-submitted items
        var allItems = sampleItems.concat(getLostItems());

        // Filter the array using a for loop
        var results = [];

        for (var i = 0; i < allItems.length; i++) {
            var item = allItems[i];
            var matches = true;  // assume this item matches; disprove below

            // Check search text — look in name, description, location
            if (searchVal !== "") {
                var nameMatch = item.itemName.toLowerCase().indexOf(searchVal) !== -1;
                var descMatch = item.description.toLowerCase().indexOf(searchVal) !== -1;
                var locMatch = item.location.toLowerCase().indexOf(searchVal) !== -1;

                if (!nameMatch && !descMatch && !locMatch) {
                    matches = false;  // no text match
                }
            }

            // Check category filter
            if (catVal !== "" && item.category !== catVal) {
                matches = false;
            }

            // Check location filter — compare lowercased location text
            if (locVal !== "") {
                var locationLower = item.location.toLowerCase();
                var catValMap = {
                    "college": "college",
                    "market": "market",
                    "transport": ["bus", "railway", "station"],
                    "office": "office",
                    "park": "park",
                    "other": "other"
                };

                // Location filter uses keyword matching
                if (locVal === "transport") {
                    if (locationLower.indexOf("bus") === -1 &&
                        locationLower.indexOf("railway") === -1 &&
                        locationLower.indexOf("station") === -1) {
                        matches = false;
                    }
                } else if (locationLower.indexOf(locVal) === -1) {
                    matches = false;
                }
            }

            // Check date filter
            if (dateVal !== "" && item.date !== dateVal) {
                matches = false;
            }

            // If all checks passed, add to results
            if (matches) {
                results.push(item);
            }
        }

        // Display the filtered results
        renderItems(results);
    }


    // --- Modal close button ---
    if (modalClose) {
        modalClose.addEventListener("click", function () {
            modal.style.display = "none";
        });
    }

    // --- Close modal when clicking outside the content area ---
    if (modal) {
        modal.addEventListener("click", function (e) {
            if (e.target === modal) {
                modal.style.display = "none";
            }
        });
    }


    // --- Search button click event ---
    searchBtn.addEventListener("click", function () {
        searchAndFilter();
    });

    // --- Also search when user presses Enter in the search box ---
    searchInput.addEventListener("keydown", function (e) {
        if (e.key === "Enter") {
            searchAndFilter();
        }
    });

    // --- Live filter on category/location/date change ---
    catFilter.addEventListener("change", searchAndFilter);
    locFilter.addEventListener("change", searchAndFilter);
    dateFilter.addEventListener("change", searchAndFilter);


    // --- Initial load: show all items ---
    var allItems = sampleItems.concat(getLostItems());
    renderItems(allItems);

});
