// ============================================================
// found-items.js — Loads and displays found item reports
// Concepts used: arrays, objects, loops, DOM manipulation,
//                localStorage, search/filter, innerHTML
// ============================================================

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

    // --- Built-in sample found items ---
    var sampleItems = [
        {
            id: "sample-found-1",
            itemName: "Brown Leather Wallet",
            category: "wallet",
            location: "City Market",
            description: "Brown leather wallet found with several cards inside. The owner can verify its details.",
            date: "2026-08-16",
            contactName: "Meena S.",
            contactEmail: "meena@example.com",
            contactPhone: "9876541001",
            image: ""
        },
        {
            id: "sample-found-2",
            itemName: "Black Smartphone",
            category: "electronics",
            location: "Bus Stand",
            description: "Black smartphone found near a public transport area. It has a dark protective case.",
            date: "2026-08-15",
            contactName: "Ravi G.",
            contactEmail: "ravi@example.com",
            contactPhone: "9876541002",
            image: ""
        },
        {
            id: "sample-found-3",
            itemName: "Set of Silver Keys",
            category: "keys",
            location: "City Park",
            description: "A set of silver keys attached to a small keychain found near a park entrance.",
            date: "2026-08-14",
            contactName: "Sonal P.",
            contactEmail: "sonal@example.com",
            contactPhone: "9876541003",
            image: ""
        },
        {
            id: "sample-found-4",
            itemName: "College ID Card",
            category: "documents",
            location: "College Campus",
            description: "Student identification card found inside a blue card holder on a college campus.",
            date: "2026-08-13",
            contactName: "Deepak R.",
            contactEmail: "deepak@example.com",
            contactPhone: "9876541004",
            image: ""
        },
        {
            id: "sample-found-5",
            itemName: "Silver Wrist Watch",
            category: "jewellery",
            location: "Shopping Mall",
            description: "Silver coloured wrist watch with a round dial and metal strap found in a shopping area.",
            date: "2026-08-11",
            contactName: "Kavya L.",
            contactEmail: "kavya@example.com",
            contactPhone: "9876541005",
            image: ""
        },
        {
            id: "sample-found-6",
            itemName: "Blue Backpack",
            category: "bags",
            location: "Railway Station",
            description: "Medium-sized blue backpack found near a railway station with several compartments.",
            date: "2026-08-10",
            contactName: "Suresh N.",
            contactEmail: "suresh@example.com",
            contactPhone: "9876541006",
            image: ""
        }
    ];


    // --- Format date ---
    function formatDate(dateStr) {
        if (!dateStr) return "Unknown Date";
        var parts = dateStr.split("-");
        var monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun",
            "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
        return parts[2] + " " + monthNames[parseInt(parts[1]) - 1] + " " + parts[0];
    }


    // --- Category label ---
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


    // --- Create a found item card ---
    function createItemCard(item) {
        var card = document.createElement("div");
        card.className = "item-card";

        var imgSrc = item.image ? item.image : "https://placehold.co/300x200/e8f4f0/16a34a?text=No+Image";
        var categoryLabel = getCategoryLabel(item.category);

        card.innerHTML =
            '<div class="item-image">' +
            '<img src="' + imgSrc + '" alt="' + categoryLabel + ' image" onerror="this.src=\'https://placehold.co/300x200/e8f4f0/16a34a?text=No+Image\'">' +
            '<span class="status-badge found-badge">Found</span>' +
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
            '<button class="contact-btn" data-id="' + item.id + '">Contact</button>' +
            '</div>' +
            '</div>';

        // Set text safely using textContent
        card.querySelector(".item-title").textContent = item.itemName;
        card.querySelector(".category").textContent = categoryLabel;
        card.querySelector(".item-desc").textContent = item.description;
        card.querySelector(".loc-text").textContent = item.location;
        card.querySelector(".date-text").textContent = formatDate(item.date);

        return card;
    }


    // --- Open the detail modal ---
    function openModal(item) {
        var categoryLabel = getCategoryLabel(item.category);

        modalContent.innerHTML =
            '<div class="modal-item-info">' +
            (item.image ? '<img src="' + item.image + '" alt="Item image" class="modal-img">' : '') +
            '<table class="modal-table">' +
            '<tr><th>Item Name</th><td class="m-name"></td></tr>' +
            '<tr><th>Category</th><td class="m-cat"></td></tr>' +
            '<tr><th>Location Found</th><td class="m-loc"></td></tr>' +
            '<tr><th>Date Found</th><td class="m-date"></td></tr>' +
            '<tr><th>Description</th><td class="m-desc"></td></tr>' +
            '<tr><th>Contact Name</th><td class="m-cname"></td></tr>' +
            '<tr><th>Contact Email</th><td class="m-cemail"></td></tr>' +
            '<tr><th>Contact Phone</th><td class="m-cphone"></td></tr>' +
            '</table>' +
            '</div>';

        modalContent.querySelector(".m-name").textContent = item.itemName;
        modalContent.querySelector(".m-cat").textContent = categoryLabel;
        modalContent.querySelector(".m-loc").textContent = item.location;
        modalContent.querySelector(".m-date").textContent = formatDate(item.date);
        modalContent.querySelector(".m-desc").textContent = item.description;
        modalContent.querySelector(".m-cname").textContent = item.contactName || "Not provided";
        modalContent.querySelector(".m-cemail").textContent = item.contactEmail || "Not provided";
        modalContent.querySelector(".m-cphone").textContent = item.contactPhone || "Not provided";

        modal.style.display = "flex";
    }


    // --- Render items to the grid ---
    function renderItems(itemsArray) {
        itemsGrid.innerHTML = "";

        if (itemsArray.length === 0) {
            noResults.style.display = "block";
            return;
        }

        noResults.style.display = "none";

        for (var i = 0; i < itemsArray.length; i++) {
            var card = createItemCard(itemsArray[i]);
            itemsGrid.appendChild(card);
        }

        // View Details button events
        var viewBtns = itemsGrid.querySelectorAll(".view-btn");
        for (var j = 0; j < viewBtns.length; j++) {
            viewBtns[j].addEventListener("click", function (e) {
                var itemId = e.target.getAttribute("data-id");
                var allItems = sampleItems.concat(getFoundItems());
                for (var k = 0; k < allItems.length; k++) {
                    if (allItems[k].id === itemId) {
                        openModal(allItems[k]);
                        break;
                    }
                }
            });
        }

        // Contact button events
        var contactBtns = itemsGrid.querySelectorAll(".contact-btn");
        for (var m = 0; m < contactBtns.length; m++) {
            contactBtns[m].addEventListener("click", function (e) {
                var itemId = e.target.getAttribute("data-id");
                var allItems = sampleItems.concat(getFoundItems());
                var found = null;
                for (var n = 0; n < allItems.length; n++) {
                    if (allItems[n].id === itemId) {
                        found = allItems[n];
                        break;
                    }
                }
                if (found) {
                    alert(
                        'Is this your item? Contact the finder:\n\n' +
                        'Name: ' + (found.contactName || "Not provided") + '\n' +
                        'Email: ' + (found.contactEmail || "Not provided") + '\n' +
                        'Phone: ' + (found.contactPhone || "Not provided")
                    );
                }
            });
        }
    }


    // --- Search and filter ---
    function searchAndFilter() {
        var searchVal = searchInput.value.trim().toLowerCase();
        var catVal = catFilter.value.toLowerCase();
        var locVal = locFilter.value.toLowerCase();
        var dateVal = dateFilter.value;

        var allItems = sampleItems.concat(getFoundItems());
        var results = [];

        for (var i = 0; i < allItems.length; i++) {
            var item = allItems[i];
            var matches = true;

            if (searchVal !== "") {
                var nameMatch = item.itemName.toLowerCase().indexOf(searchVal) !== -1;
                var descMatch = item.description.toLowerCase().indexOf(searchVal) !== -1;
                var locMatch = item.location.toLowerCase().indexOf(searchVal) !== -1;
                if (!nameMatch && !descMatch && !locMatch) {
                    matches = false;
                }
            }

            if (catVal !== "" && item.category !== catVal) {
                matches = false;
            }

            if (locVal !== "") {
                var locationLower = item.location.toLowerCase();
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

            if (dateVal !== "" && item.date !== dateVal) {
                matches = false;
            }

            if (matches) {
                results.push(item);
            }
        }

        renderItems(results);
    }


    // --- Modal close ---
    if (modalClose) {
        modalClose.addEventListener("click", function () {
            modal.style.display = "none";
        });
    }

    if (modal) {
        modal.addEventListener("click", function (e) {
            if (e.target === modal) {
                modal.style.display = "none";
            }
        });
    }


    // --- Event listeners ---
    searchBtn.addEventListener("click", searchAndFilter);

    searchInput.addEventListener("keydown", function (e) {
        if (e.key === "Enter") {
            searchAndFilter();
        }
    });

    catFilter.addEventListener("change", searchAndFilter);
    locFilter.addEventListener("change", searchAndFilter);
    dateFilter.addEventListener("change", searchAndFilter);


    // --- Initial load ---
    var allItems = sampleItems.concat(getFoundItems());
    renderItems(allItems);

});
