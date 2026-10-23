// ============================================================
// lost-items.js — Loads and displays lost item reports
// Concepts used: Promise, Event Delegation, DOM manipulation,
//                localStorage, search/filter, modal dialogs
// ============================================================

window.addEventListener("load", function () {

    // --- References to page elements ---
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
    var modalTitle = modal ? modal.querySelector(".modal-header h3") : null;

    // --- Built-in sample items (demonstration data) ---
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
            image: "",
            isSample: true
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
            image: "",
            isSample: true
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
            image: "",
            isSample: true
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
            image: "",
            isSample: true
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
            image: "",
            isSample: true
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
            image: "",
            isSample: true
        }
    ];

    var defaultPlaceholder = "https://placehold.co/400x250/e8f0fe/2563eb?text=Lost+Item";

    // --- Format a date string ---
    function formatDate(dateStr) {
        if (!dateStr) return "Unknown Date";
        var parts = dateStr.split("-");
        if (parts.length < 3) return dateStr;
        var monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun",
            "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
        var mIdx = parseInt(parts[1], 10) - 1;
        var monthName = monthNames[mIdx] || parts[1];
        return parts[2] + " " + monthName + " " + parts[0];
    }

    // --- Category display label ---
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

    // --- Helper to get all combined items, excluding deleted sample IDs ---
    function getAllItems() {
        var userReports = getLostItems(); // from localStorage
        var deletedSampleIds = [];
        try {
            var d = localStorage.getItem("deletedSampleIds");
            if (d) deletedSampleIds = JSON.parse(d);
        } catch (e) { }

        var activeSamples = sampleItems.filter(function (s) {
            return deletedSampleIds.indexOf(String(s.id).trim()) === -1;
        });

        // User reports first, then active samples
        return userReports.concat(activeSamples);
    }

    // --- Find an item by ID safely ---
    function findItemById(id) {
        var all = getAllItems();
        var targetId = String(id).trim();
        for (var i = 0; i < all.length; i++) {
            if (String(all[i].id).trim() === targetId) {
                return all[i];
            }
        }
        return null;
    }

    // --- Helper to check if current logged-in user is the report owner ---
    function isItemOwner(item) {
        if (!item || !item.userId) return false;
        var currentUser = getLoggedInUser();
        if (!currentUser || !currentUser.id) return false;
        return String(currentUser.id).trim() === String(item.userId).trim();
    }

    // ============================================================
    // Helper: Build a single item card
    // ============================================================
    function createItemCard(item) {
        var card = document.createElement("div");
        card.className = "item-card";

        var imgSrc = item.image ? item.image : defaultPlaceholder;
        var categoryLabel = getCategoryLabel(item.category);
        var dateLabel = formatDate(item.date);
        var isOwner = isItemOwner(item);

        card.innerHTML =
            '<div class="item-image">' +
            '<img src="' + imgSrc + '" alt="' + categoryLabel + '" onerror="this.src=\'' + defaultPlaceholder + '\'">' +
            '<span class="status-badge">Lost</span>' +
            (isOwner ? '<span class="new-badge">Your Report</span>' : '') +
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
            '<button type="button" class="view-btn" data-id="' + item.id + '">View Details</button>' +
            '<button type="button" class="match-btn" data-id="' + item.id + '">🤝 Report Match</button>' +
            '</div>' +
            (isOwner ? '<button type="button" class="delete-btn" data-id="' + item.id + '" style="margin-top:10px;">🗑️ Delete Report</button>' : '') +
            '</div>';

        card.querySelector(".item-title").textContent = item.itemName;
        card.querySelector(".category").textContent = categoryLabel;
        card.querySelector(".item-desc").textContent = item.description;
        card.querySelector(".loc-text").textContent = item.location;
        card.querySelector(".date-text").textContent = dateLabel;

        return card;
    }

    // ============================================================
    // MODAL HANDLERS
    // ============================================================

    // 1. View Item Details Modal
    function openViewModal(item) {
        if (modalTitle) modalTitle.textContent = "Lost Item Details";

        var categoryLabel = getCategoryLabel(item.category);
        var dateLabel = formatDate(item.date);
        var isOwner = isItemOwner(item);

        modalContent.innerHTML =
            '<div class="modal-item-info">' +
            (item.image ? '<img src="' + item.image + '" alt="Item image" class="modal-img">' : '') +
            '<table class="modal-table">' +
            '<tr><th>Item Name</th><td class="m-name"></td></tr>' +
            '<tr><th>Category</th><td class="m-cat"></td></tr>' +
            '<tr><th>Location Lost</th><td class="m-loc"></td></tr>' +
            '<tr><th>Date Lost</th><td class="m-date"></td></tr>' +
            (item.time ? '<tr><th>Approx. Time</th><td class="m-time"></td></tr>' : '') +
            '<tr><th>Description</th><td class="m-desc"></td></tr>' +
            (item.additionalDetails ? '<tr><th>Additional Info</th><td class="m-addl"></td></tr>' : '') +
            '<tr><th>Contact Name</th><td class="m-cname"></td></tr>' +
            '<tr><th>Contact Email</th><td class="m-cemail"></td></tr>' +
            '<tr><th>Contact Phone</th><td class="m-cphone"></td></tr>' +
            '</table>' +
            '<div style="margin-top:20px;display:flex;gap:12px;">' +
            '<button type="button" class="primary-btn match-from-modal-btn" data-id="' + item.id + '" style="flex:1;cursor:pointer;border:none;">🤝 Report a Match</button>' +
            (isOwner ? '<button type="button" class="delete-btn delete-from-modal-btn" data-id="' + item.id + '" style="flex:1;">🗑️ Delete Report</button>' : '') +
            '</div>' +
            '</div>';

        modalContent.querySelector(".m-name").textContent = item.itemName;
        modalContent.querySelector(".m-cat").textContent = categoryLabel;
        modalContent.querySelector(".m-loc").textContent = item.location;
        modalContent.querySelector(".m-date").textContent = dateLabel;
        if (item.time && modalContent.querySelector(".m-time")) {
            modalContent.querySelector(".m-time").textContent = item.time;
        }
        modalContent.querySelector(".m-desc").textContent = item.description;
        if (item.additionalDetails && modalContent.querySelector(".m-addl")) {
            modalContent.querySelector(".m-addl").textContent = item.additionalDetails;
        }
        modalContent.querySelector(".m-cname").textContent = item.contactName || "Not provided";
        modalContent.querySelector(".m-cemail").textContent = item.contactEmail || "Not provided";
        modalContent.querySelector(".m-cphone").textContent = item.contactPhone || "Not provided";

        // Bind in-modal buttons
        var matchModalBtn = modalContent.querySelector(".match-from-modal-btn");
        if (matchModalBtn) {
            matchModalBtn.addEventListener("click", function () {
                openReportMatchModal(item);
            });
        }

        var deleteModalBtn = modalContent.querySelector(".delete-from-modal-btn");
        if (deleteModalBtn) {
            deleteModalBtn.addEventListener("click", function () {
                openDeleteConfirmationModal(item);
            });
        }

        modal.style.display = "flex";
    }

    // 2. Report Match Modal (Replaces old alert)
    function openReportMatchModal(item) {
        if (modalTitle) modalTitle.textContent = "🤝 Report Match for: " + item.itemName;

        var loggedIn = getLoggedInUser();
        var defaultName = loggedIn ? loggedIn.name : "";
        var defaultContact = loggedIn ? (loggedIn.email || loggedIn.phone) : "";

        modalContent.innerHTML =
            '<div style="font-size:14px;color:#475569;line-height:1.6;">' +
            '<div class="modal-contact-card">' +
            '<h4>Owner Contact Information:</h4>' +
            '<p><strong>Name:</strong> ' + (item.contactName || "Not provided") + '</p>' +
            '<p><strong>Email:</strong> ' + (item.contactEmail || "Not provided") + '</p>' +
            '<p><strong>Phone:</strong> ' + (item.contactPhone || "Not provided") + '</p>' +
            '<div class="contact-quick-buttons">' +
            (item.contactPhone ? '<a href="tel:' + item.contactPhone + '" class="call-btn">📞 Call ' + item.contactPhone + '</a>' : '') +
            (item.contactEmail ? '<a href="mailto:' + item.contactEmail + '?subject=Found%20Your%20Lost%20Item:%20' + encodeURIComponent(item.itemName) + '" class="email-btn">✉️ Email Owner</a>' : '') +
            '</div>' +
            '</div>' +
            '<form id="match-notify-form" style="margin-top:16px;">' +
            '<h4 style="margin-bottom:8px;color:#1e293b;">Send Direct Match Notification:</h4>' +
            '<div style="margin-bottom:12px;">' +
            '<label style="display:block;margin-bottom:4px;font-weight:600;font-size:13px;">Your Name / Contact Info:</label>' +
            '<input type="text" id="finder-contact" placeholder="e.g. Sarah (9876543210 / sarah@gmail.com)" required value="' + defaultContact + '" style="width:100%;padding:10px;border:1px solid #cbd5e1;border-radius:8px;font-size:14px;">' +
            '</div>' +
            '<div style="margin-bottom:14px;">' +
            '<label style="display:block;margin-bottom:4px;font-weight:600;font-size:13px;">Where or when did you find it?</label>' +
            '<textarea id="match-notes" rows="3" placeholder="e.g. Found on 2nd floor library near the window. Please contact me to collect it." required style="width:100%;padding:10px;border:1px solid #cbd5e1;border-radius:8px;font-size:14px;"></textarea>' +
            '</div>' +
            '<div id="match-feedback" style="display:none;padding:10px;border-radius:8px;margin-bottom:12px;font-weight:600;"></div>' +
            '<button type="submit" class="primary-btn" id="send-match-btn" style="width:100%;cursor:pointer;border:none;padding:12px;">Send Match Notification</button>' +
            '</form>' +
            '</div>';

        var matchForm = document.getElementById("match-notify-form");
        var matchFeedback = document.getElementById("match-feedback");
        var sendMatchBtn = document.getElementById("send-match-btn");

        matchForm.addEventListener("submit", function (ev) {
            ev.preventDefault();

            var finderContact = document.getElementById("finder-contact").value.trim();
            var notes = document.getElementById("match-notes").value.trim();

            if (!finderContact || !notes) return;

            sendMatchBtn.disabled = true;
            sendMatchBtn.textContent = "Recording Match Notification...";

            // PROMISE USAGE: Save match notification
            saveMatchNotificationAsync({
                id: generateId(),
                itemId: item.id,
                itemName: item.itemName,
                ownerName: item.contactName,
                ownerEmail: item.contactEmail,
                finderContact: finderContact,
                notes: notes,
                timestamp: new Date().toISOString()
            })
                .then(function () {
                    matchFeedback.style.display = "block";
                    matchFeedback.style.background = "#dcfce7";
                    matchFeedback.style.color = "#15803d";
                    matchFeedback.innerHTML = "✅ Match recorded! Owner has been linked with your details.";
                    sendMatchBtn.textContent = "Sent!";
                    showToastNotification("✅ Match reported for " + item.itemName + "!");

                    setTimeout(function () {
                        modal.style.display = "none";
                    }, 1800);
                })
                .catch(function (err) {
                    matchFeedback.style.display = "block";
                    matchFeedback.style.background = "#fee2e2";
                    matchFeedback.style.color = "#b91c1c";
                    matchFeedback.textContent = "Error: " + err.message;
                    sendMatchBtn.disabled = false;
                    sendMatchBtn.textContent = "Send Match Notification";
                });
        });

        modal.style.display = "flex";
    }

    // 3. In-Modal Delete Confirmation (No flaky browser confirm() dialog)
    function openDeleteConfirmationModal(item) {
        // Enforce ownership check before displaying confirmation modal
        if (!isItemOwner(item)) {
            alert("Unauthorized: You can only delete reports that you created.");
            return;
        }

        if (modalTitle) modalTitle.textContent = "🗑️ Confirm Delete Report";

        modalContent.innerHTML =
            '<div style="text-align:center;padding:10px 0;">' +
            '<p style="font-size:16px;color:#334155;margin-bottom:12px;">' +
            'Are you sure you want to permanently delete the report for:<br>' +
            '<strong style="font-size:18px;color:#1e293b;">"' + item.itemName + '"</strong>?' +
            '</p>' +
            '<p style="font-size:13px;color:#64748b;margin-bottom:24px;">This action will remove the listing from the portal.</p>' +
            '<div style="display:flex;gap:12px;justify-content:center;">' +
            '<button type="button" id="confirm-delete-action-btn" class="delete-btn" style="width:auto;padding:10px 24px;font-size:14px;">Yes, Delete Report</button>' +
            '<button type="button" id="cancel-delete-action-btn" class="secondary-btn" style="padding:10px 24px;font-size:14px;cursor:pointer;">Cancel</button>' +
            '</div>' +
            '</div>';

        document.getElementById("cancel-delete-action-btn").addEventListener("click", function () {
            modal.style.display = "none";
        });

        document.getElementById("confirm-delete-action-btn").addEventListener("click", function () {
            var btn = this;
            btn.disabled = true;
            btn.textContent = "Deleting...";

            // PROMISE USAGE: deleteLostItemAsync
            deleteLostItemAsync(item.id)
                .then(function () {
                    modal.style.display = "none";
                    showToastNotification("🗑️ Report for \"" + item.itemName + "\" has been deleted.");
                    loadAndRender();
                })
                .catch(function (err) {
                    alert("Error deleting report: " + (err.message || "Unauthorized action."));
                    btn.disabled = false;
                    btn.textContent = "Yes, Delete Report";
                });
        });

        modal.style.display = "flex";
    }

    // ============================================================
    // EVENT DELEGATION: Handles all clicks on itemsGrid reliably
    // ============================================================
    if (itemsGrid) {
        itemsGrid.addEventListener("click", function (event) {
            var targetBtn = event.target.closest("button");
            if (!targetBtn) return;

            var itemId = targetBtn.getAttribute("data-id");
            if (!itemId) return;

            var item = findItemById(itemId);
            if (!item) {
                console.warn("Item not found for id:", itemId);
                return;
            }

            if (targetBtn.classList.contains("view-btn")) {
                openViewModal(item);
            } else if (targetBtn.classList.contains("match-btn")) {
                openReportMatchModal(item);
            } else if (targetBtn.classList.contains("delete-btn")) {
                if (!isItemOwner(item)) {
                    alert("Unauthorized: You can only delete reports that you created.");
                    return;
                }
                openDeleteConfirmationModal(item);
            }
        });
    }

    // --- Render list of items to the page ---
    function renderItems(itemsArray) {
        itemsGrid.innerHTML = "";

        if (!itemsArray || itemsArray.length === 0) {
            if (noResults) noResults.style.display = "block";
            return;
        }

        if (noResults) noResults.style.display = "none";

        for (var i = 0; i < itemsArray.length; i++) {
            var card = createItemCard(itemsArray[i]);
            itemsGrid.appendChild(card);
        }
    }

    // --- Search and filter ---
    function searchAndFilter() {
        var searchVal = searchInput ? searchInput.value.trim().toLowerCase() : "";
        var catVal = catFilter ? catFilter.value.toLowerCase() : "";
        var locVal = locFilter ? locFilter.value.toLowerCase() : "";
        var dateVal = dateFilter ? dateFilter.value : "";

        var allItems = getAllItems();
        var results = [];

        for (var i = 0; i < allItems.length; i++) {
            var item = allItems[i];
            var matches = true;

            // Search text
            if (searchVal !== "") {
                var nameMatch = (item.itemName || "").toLowerCase().indexOf(searchVal) !== -1;
                var descMatch = (item.description || "").toLowerCase().indexOf(searchVal) !== -1;
                var locMatch = (item.location || "").toLowerCase().indexOf(searchVal) !== -1;
                if (!nameMatch && !descMatch && !locMatch) {
                    matches = false;
                }
            }

            // Category filter
            if (catVal !== "" && (item.category || "").toLowerCase() !== catVal) {
                matches = false;
            }

            // Location filter
            if (locVal !== "") {
                var itemLoc = (item.location || "").toLowerCase();
                if (locVal === "transport") {
                    if (itemLoc.indexOf("bus") === -1 && itemLoc.indexOf("railway") === -1 && itemLoc.indexOf("station") === -1) {
                        matches = false;
                    }
                } else if (itemLoc.indexOf(locVal) === -1) {
                    matches = false;
                }
            }

            // Date filter
            if (dateVal !== "" && item.date !== dateVal) {
                matches = false;
            }

            if (matches) {
                results.push(item);
            }
        }

        renderItems(results);
    }

    // ============================================================
    // PROMISE USAGE: Asynchronous initial item loading
    // ============================================================
    function loadAndRender() {
        getLostItemsAsync()
            .then(function () {
                var allItems = getAllItems();
                renderItems(allItems);
            })
            .catch(function () {
                renderItems(sampleItems);
            });
    }

    // --- Modal close handlers ---
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

    // Close on Escape key
    window.addEventListener("keydown", function (e) {
        if (e.key === "Escape" && modal && modal.style.display === "flex") {
            modal.style.display = "none";
        }
    });

    // --- Filter listeners ---
    if (searchBtn) searchBtn.addEventListener("click", searchAndFilter);
    if (searchInput) {
        searchInput.addEventListener("input", searchAndFilter);
        searchInput.addEventListener("keydown", function (e) {
            if (e.key === "Enter") searchAndFilter();
        });
    }
    if (catFilter) catFilter.addEventListener("change", searchAndFilter);
    if (locFilter) locFilter.addEventListener("change", searchAndFilter);
    if (dateFilter) dateFilter.addEventListener("change", searchAndFilter);

    // Initial load
    loadAndRender();

});
