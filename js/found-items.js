// ============================================================
// found-items.js — Loads and displays found item reports
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

    // --- Built-in sample found items (demonstration data) ---
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
            image: "",
            isSample: true
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
            image: "",
            isSample: true
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
            image: "",
            isSample: true
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
            image: "",
            isSample: true
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
            image: "",
            isSample: true
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
            image: "",
            isSample: true
        }
    ];

    var defaultPlaceholder = "https://placehold.co/400x250/e8f4f0/16a34a?text=Found+Item";

    // --- Format date ---
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

    // --- Get all items excluding deleted sample IDs ---
    function getAllItems() {
        var userReports = getFoundItems();
        var deletedSampleIds = [];
        try {
            var d = localStorage.getItem("deletedSampleIds");
            if (d) deletedSampleIds = JSON.parse(d);
        } catch (e) {}

        var activeSamples = sampleItems.filter(function (s) {
            return deletedSampleIds.indexOf(String(s.id).trim()) === -1;
        });

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

    // ============================================================
    // Helper: Create a found item card
    // ============================================================
    function createItemCard(item) {
        var card = document.createElement("div");
        card.className = "item-card";

        var imgSrc = item.image ? item.image : defaultPlaceholder;
        var categoryLabel = getCategoryLabel(item.category);
        var dateLabel = formatDate(item.date);
        var isUserItem = !item.isSample;

        card.innerHTML =
            '<div class="item-image">' +
            '<img src="' + imgSrc + '" alt="' + categoryLabel + '" onerror="this.src=\'' + defaultPlaceholder + '\'">' +
            '<span class="status-badge found-badge">Found</span>' +
            (isUserItem ? '<span class="new-badge">Your Report</span>' : '') +
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
            '<button type="button" class="contact-btn" data-id="' + item.id + '">📞 Contact Finder</button>' +
            '</div>' +
            '<button type="button" class="delete-btn" data-id="' + item.id + '" style="margin-top:10px;">🗑️ Delete Report</button>' +
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

    // 1. View Details Modal
    function openViewModal(item) {
        if (modalTitle) modalTitle.textContent = "Found Item Details";

        var categoryLabel = getCategoryLabel(item.category);
        var dateLabel = formatDate(item.date);

        modalContent.innerHTML =
            '<div class="modal-item-info">' +
            (item.image ? '<img src="' + item.image + '" alt="Item image" class="modal-img">' : '') +
            '<table class="modal-table">' +
            '<tr><th>Item Name</th><td class="m-name"></td></tr>' +
            '<tr><th>Category</th><td class="m-cat"></td></tr>' +
            '<tr><th>Location Found</th><td class="m-loc"></td></tr>' +
            '<tr><th>Date Found</th><td class="m-date"></td></tr>' +
            (item.time ? '<tr><th>Approx. Time</th><td class="m-time"></td></tr>' : '') +
            '<tr><th>Description</th><td class="m-desc"></td></tr>' +
            (item.additionalDetails ? '<tr><th>Additional Info</th><td class="m-addl"></td></tr>' : '') +
            '<tr><th>Finder Name</th><td class="m-cname"></td></tr>' +
            '<tr><th>Finder Email</th><td class="m-cemail"></td></tr>' +
            '<tr><th>Finder Phone</th><td class="m-cphone"></td></tr>' +
            '</table>' +
            '<div style="margin-top:20px;display:flex;gap:12px;">' +
            '<button type="button" class="primary-btn contact-from-modal-btn" data-id="' + item.id + '" style="flex:1;cursor:pointer;border:none;">📞 Contact Finder</button>' +
            '<button type="button" class="delete-btn delete-from-modal-btn" data-id="' + item.id + '" style="flex:1;">🗑️ Delete Report</button>' +
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

        var contactModalBtn = modalContent.querySelector(".contact-from-modal-btn");
        if (contactModalBtn) {
            contactModalBtn.addEventListener("click", function () {
                openContactFinderModal(item);
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

    // 2. Contact Finder Modal (Replaces browser alert)
    function openContactFinderModal(item) {
        if (modalTitle) modalTitle.textContent = "📞 Contact Finder for: " + item.itemName;

        modalContent.innerHTML =
            '<div style="font-size:14px;color:#475569;line-height:1.6;">' +
            '<div class="modal-contact-card">' +
            '<h4>Finder Contact Information:</h4>' +
            '<p><strong>Name:</strong> ' + (item.contactName || "Not provided") + '</p>' +
            '<p><strong>Email:</strong> ' + (item.contactEmail || "Not provided") + '</p>' +
            '<p><strong>Phone:</strong> ' + (item.contactPhone || "Not provided") + '</p>' +
            '<div class="contact-quick-buttons">' +
            (item.contactPhone ? '<a href="tel:' + item.contactPhone + '" class="call-btn">📞 Call ' + item.contactPhone + '</a>' : '') +
            (item.contactEmail ? '<a href="mailto:' + item.contactEmail + '?subject=Inquiry%20About%20Found%20Item:%20' + encodeURIComponent(item.itemName) + '" class="email-btn">✉️ Email Finder</a>' : '') +
            '</div>' +
            '</div>' +
            '<form id="claim-notify-form" style="margin-top:16px;">' +
            '<h4 style="margin-bottom:8px;color:#1e293b;">Send Claim Message to Finder:</h4>' +
            '<div style="margin-bottom:12px;">' +
            '<label style="display:block;margin-bottom:4px;font-weight:600;font-size:13px;">Your Name & Phone / Email:</label>' +
            '<input type="text" id="claimant-contact" placeholder="e.g. John (9876543210 / john@example.com)" required style="width:100%;padding:10px;border:1px solid #cbd5e1;border-radius:8px;font-size:14px;">' +
            '</div>' +
            '<div style="margin-bottom:14px;">' +
            '<label style="display:block;margin-bottom:4px;font-weight:600;font-size:13px;">Proof of Ownership / Description:</label>' +
            '<textarea id="claim-notes" rows="3" placeholder="Describe identifying features to verify this is your item..." required style="width:100%;padding:10px;border:1px solid #cbd5e1;border-radius:8px;font-size:14px;"></textarea>' +
            '</div>' +
            '<div id="claim-feedback" style="display:none;padding:10px;border-radius:8px;margin-bottom:12px;font-weight:600;"></div>' +
            '<button type="submit" class="primary-btn" id="send-claim-btn" style="width:100%;cursor:pointer;border:none;padding:12px;">Send Message to Finder</button>' +
            '</form>' +
            '</div>';

        var claimForm = document.getElementById("claim-notify-form");
        var claimFeedback = document.getElementById("claim-feedback");
        var sendClaimBtn = document.getElementById("send-claim-btn");

        claimForm.addEventListener("submit", function (ev) {
            ev.preventDefault();

            var contactInfo = document.getElementById("claimant-contact").value.trim();
            var notes = document.getElementById("claim-notes").value.trim();

            if (!contactInfo || !notes) return;

            sendClaimBtn.disabled = true;
            sendClaimBtn.textContent = "Sending Claim Message...";

            // PROMISE USAGE: Save message
            saveMatchNotificationAsync({
                id: generateId(),
                itemId: item.id,
                itemName: item.itemName,
                finderName: item.contactName,
                finderEmail: item.contactEmail,
                claimantContact: contactInfo,
                notes: notes,
                timestamp: new Date().toISOString()
            })
                .then(function () {
                    claimFeedback.style.display = "block";
                    claimFeedback.style.background = "#dcfce7";
                    claimFeedback.style.color = "#15803d";
                    claimFeedback.innerHTML = "✅ Message recorded! Finder has been provided your claim details.";
                    sendClaimBtn.textContent = "Message Sent!";
                    showToastNotification("✅ Message sent to finder of " + item.itemName + "!");

                    setTimeout(function () {
                        modal.style.display = "none";
                    }, 1800);
                })
                .catch(function (err) {
                    claimFeedback.style.display = "block";
                    claimFeedback.style.background = "#fee2e2";
                    claimFeedback.style.color = "#b91c1c";
                    claimFeedback.textContent = "Error: " + err.message;
                    sendClaimBtn.disabled = false;
                    sendClaimBtn.textContent = "Send Message to Finder";
                });
        });

        modal.style.display = "flex";
    }

    // 3. In-Modal Delete Confirmation
    function openDeleteConfirmationModal(item) {
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

            // PROMISE USAGE: deleteFoundItemAsync
            deleteFoundItemAsync(item.id)
                .then(function () {
                    modal.style.display = "none";
                    showToastNotification("🗑️ Report for \"" + item.itemName + "\" has been deleted.");
                    loadAndRender();
                })
                .catch(function (err) {
                    alert("Error deleting report: " + err.message);
                    btn.disabled = false;
                    btn.textContent = "Yes, Delete Report";
                });
        });

        modal.style.display = "flex";
    }

    // ============================================================
    // EVENT DELEGATION: Catches button clicks on itemsGrid
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
            } else if (targetBtn.classList.contains("contact-btn")) {
                openContactFinderModal(item);
            } else if (targetBtn.classList.contains("delete-btn")) {
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

            // Search query
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
        getFoundItemsAsync()
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
