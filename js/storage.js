// ============================================================
// storage.js — Shared helper functions and Promise-based API for localStorage
// Concepts used: Promise, async operations, localStorage, JSON,
//                FileReader, Canvas image compression, DOM manipulation
// ============================================================

// --- Key names used in localStorage ---
var LOST_ITEMS_KEY = "lostItems";        // key for lost item reports
var FOUND_ITEMS_KEY = "foundItems";      // key for found item reports
var USERS_KEY = "portalUsers";           // key for registered user accounts
var LOGGED_IN_KEY = "loggedInUser";      // key for current session
var CONTACT_KEY = "contactMessages";     // key for contact messages


// ============================================================
// 1. SYNCHRONOUS BASELINE HELPERS
// ============================================================

// --- Get all lost items from localStorage ---
function getLostItems() {
    var data = localStorage.getItem(LOST_ITEMS_KEY);
    if (data === null) {
        return [];
    }
    try {
        return JSON.parse(data);
    } catch (e) {
        return [];
    }
}

// --- Get all found items from localStorage ---
function getFoundItems() {
    var data = localStorage.getItem(FOUND_ITEMS_KEY);
    if (data === null) {
        return [];
    }
    try {
        return JSON.parse(data);
    } catch (e) {
        return [];
    }
}

// --- Save a new lost item report (synchronous) ---
function saveLostItem(itemObject) {
    var existing = getLostItems();
    existing.unshift(itemObject); // Newest items first
    localStorage.setItem(LOST_ITEMS_KEY, JSON.stringify(existing));
}

// --- Save a new found item report (synchronous) ---
function saveFoundItem(itemObject) {
    var existing = getFoundItems();
    existing.unshift(itemObject); // Newest items first
    localStorage.setItem(FOUND_ITEMS_KEY, JSON.stringify(existing));
}

// --- Generate a unique ID for registered users ---
function generateUserId() {
    return "user_" + Date.now() + "_" + Math.floor(Math.random() * 1000000);
}

// --- Get all registered users ---
function getUsers() {
    var data = localStorage.getItem(USERS_KEY);
    var demoUser = {
        id: "user_demo_default",
        name: "Demo User",
        email: "user@example.com",
        phone: "9876543210",
        password: "password123",
        registeredAt: "2026-01-01T00:00:00.000Z"
    };

    if (data === null) {
        var initialList = [demoUser];
        localStorage.setItem(USERS_KEY, JSON.stringify(initialList));
        return initialList;
    }
    try {
        var parsed = JSON.parse(data);
        if (!Array.isArray(parsed)) parsed = [];
        var hasDemo = false;
        var needsSave = false;

        for (var i = 0; i < parsed.length; i++) {
            var u = parsed[i];
            if ((u.email || "").toLowerCase().trim() === "user@example.com") {
                hasDemo = true;
                if (!u.id) {
                    u.id = "user_demo_default";
                    needsSave = true;
                }
            } else if (!u.id) {
                u.id = generateUserId();
                needsSave = true;
            }
        }
        if (!hasDemo) {
            parsed.unshift(demoUser);
            needsSave = true;
        }
        if (needsSave) {
            localStorage.setItem(USERS_KEY, JSON.stringify(parsed));
        }
        return parsed;
    } catch (e) {
        return [demoUser];
    }
}

// --- Save a new user account ---
function saveUser(userObject) {
    if (!userObject.id) {
        userObject.id = generateUserId();
    }
    var existing = getUsers();
    existing.push(userObject);
    localStorage.setItem(USERS_KEY, JSON.stringify(existing));
}

// --- Check if an email is already registered ---
function isEmailTaken(email) {
    var users = getUsers();
    var cleanEmail = (email || "").toLowerCase().trim();
    for (var i = 0; i < users.length; i++) {
        if ((users[i].email || "").toLowerCase().trim() === cleanEmail) {
            return true;
        }
    }
    return false;
}

// --- Find a user by email and password ---
function findUser(email, password) {
    var users = getUsers();
    var cleanEmail = (email || "").toLowerCase().trim();
    var cleanPass = (password || "").trim();
    for (var i = 0; i < users.length; i++) {
        var userEmail = (users[i].email || "").toLowerCase().trim();
        var userPass = (users[i].password || "").trim();
        if (userEmail === cleanEmail && userPass === cleanPass) {
            return users[i];
        }
    }
    return null;
}

// --- Save the currently logged-in user to localStorage ---
function setLoggedInUser(userObject) {
    localStorage.setItem(LOGGED_IN_KEY, JSON.stringify(userObject));
}

// --- Get the currently logged-in user ---
function getLoggedInUser() {
    var data = localStorage.getItem(LOGGED_IN_KEY);
    if (data === null) {
        return null;
    }
    try {
        var user = JSON.parse(data);
        if (user && !user.id) {
            // Find user in registered list to preserve stable ID
            var users = getUsers();
            var cleanEmail = (user.email || "").toLowerCase().trim();
            for (var i = 0; i < users.length; i++) {
                if ((users[i].email || "").toLowerCase().trim() === cleanEmail && users[i].id) {
                    user.id = users[i].id;
                    break;
                }
            }
            if (!user.id) {
                user.id = (cleanEmail === "user@example.com") ? "user_demo_default" : generateUserId();
            }
            localStorage.setItem(LOGGED_IN_KEY, JSON.stringify(user));
        }
        return user;
    } catch (e) {
        return null;
    }
}

// --- Log the user out ---
function logoutUser() {
    localStorage.removeItem(LOGGED_IN_KEY);
}

// --- Generate a unique ID for each item report ---
function generateId() {
    return "item_" + Date.now() + "_" + Math.floor(Math.random() * 1000);
}

// --- Reset portal demo data (helper for testing and reset) ---
function resetPortalDemoData() {
    localStorage.removeItem(LOST_ITEMS_KEY);
    localStorage.removeItem(FOUND_ITEMS_KEY);
    localStorage.removeItem("deletedSampleIds");
    localStorage.removeItem("itemMatches");
}


// ============================================================
// 2. PROMISE-BASED ASYNCHRONOUS FUNCTIONS
// ============================================================

/**
 * PROMISE 1: processImageFile
 * Reads an uploaded image file asynchronously using FileReader and an HTML5 canvas
 * to compress and resize it. This guarantees that large images taken from phones
 * or cameras fit cleanly in localStorage without causing QuotaExceededError.
 *
 * @param {File} file - The file input file object
 * @param {number} [maxWidth=600] - Max width of output image
 * @param {number} [maxHeight=600] - Max height of output image
 * @param {number} [quality=0.82] - JPEG quality (0.0 to 1.0)
 * @returns {Promise<string>} Resolves with base64 DataURL, or "" if no file
 */
function processImageFile(file, maxWidth, maxHeight, quality) {
    return new Promise(function (resolve, reject) {
        // If user didn't pick any file, resolve cleanly with empty string
        if (!file) {
            resolve("");
            return;
        }

        // Validate that the file is an image
        if (!file.type || file.type.indexOf("image/") !== 0) {
            reject(new Error("Please upload a valid image file (JPG, PNG, GIF, WEBP)."));
            return;
        }

        // Validate size (max 10MB input limit)
        var maxBytes = 10 * 1024 * 1024;
        if (file.size > maxBytes) {
            reject(new Error("Selected image is too large (" + Math.round(file.size / 1024 / 1024) + "MB). Max limit is 10MB."));
            return;
        }

        var reader = new FileReader();

        reader.onload = function (event) {
            var rawDataUrl = event.target.result;

            // Load into an Image object to scale down to a safe size
            var img = new Image();
            img.onload = function () {
                var maxW = maxWidth || 600;
                var maxH = maxHeight || 600;
                var w = img.width;
                var h = img.height;

                // Calculate scaling proportions
                if (w > maxW || h > maxH) {
                    if (w / maxW > h / maxH) {
                        h = Math.round((h * maxW) / w);
                        w = maxW;
                    } else {
                        w = Math.round((w * maxH) / h);
                        h = maxH;
                    }
                }

                // Draw to canvas for compression
                var canvas = document.createElement("canvas");
                canvas.width = w;
                canvas.height = h;
                var ctx = canvas.getContext("2d");
                ctx.drawImage(img, 0, 0, w, h);

                // Export as compressed JPEG
                var compressedUrl = canvas.toDataURL("image/jpeg", quality || 0.82);
                resolve(compressedUrl);
            };

            img.onerror = function () {
                reject(new Error("Unable to decode the image file. It may be corrupt."));
            };

            img.src = rawDataUrl;
        };

        reader.onerror = function () {
            reject(new Error("Failed to read the file from disk."));
        };

        // Read as data URL
        reader.readAsDataURL(file);
    });
}


/**
 * PROMISE 2: saveLostItemAsync
 * Asynchronously validates and saves a lost item report to localStorage.
 *
 * @param {Object} itemObject - Report details
 * @returns {Promise<Object>} Resolves with { success: true, item: itemObject }
 */
function saveLostItemAsync(itemObject) {
    return new Promise(function (resolve, reject) {
        if (!itemObject) {
            reject(new Error("Item data is missing."));
            return;
        }

        // Validate authentication and creator identity
        var currentUser = getLoggedInUser();
        if (!itemObject.userId) {
            if (currentUser && currentUser.id) {
                itemObject.userId = currentUser.id;
            } else {
                reject(new Error("Authentication required: You must be logged in to submit a report."));
                return;
            }
        }

        if (!itemObject.itemName || !itemObject.category || !itemObject.location || !itemObject.date) {
            reject(new Error("Missing mandatory fields (item name, category, location, date)."));
            return;
        }

        try {
            var existing = getLostItems();
            existing.unshift(itemObject); // Put newest items at top
            localStorage.setItem(LOST_ITEMS_KEY, JSON.stringify(existing));
            resolve({ success: true, item: itemObject });
        } catch (error) {
            reject(new Error("Storage limit reached! Please delete older reports or use smaller photos."));
        }
    });
}


/**
 * PROMISE 3: saveFoundItemAsync
 * Asynchronously validates and saves a found item report to localStorage.
 *
 * @param {Object} itemObject - Report details
 * @returns {Promise<Object>} Resolves with { success: true, item: itemObject }
 */
function saveFoundItemAsync(itemObject) {
    return new Promise(function (resolve, reject) {
        if (!itemObject) {
            reject(new Error("Item data is missing."));
            return;
        }

        // Validate authentication and creator identity
        var currentUser = getLoggedInUser();
        if (!itemObject.userId) {
            if (currentUser && currentUser.id) {
                itemObject.userId = currentUser.id;
            } else {
                reject(new Error("Authentication required: You must be logged in to submit a report."));
                return;
            }
        }

        if (!itemObject.itemName || !itemObject.category || !itemObject.location || !itemObject.date) {
            reject(new Error("Missing mandatory fields (item name, category, location, date)."));
            return;
        }

        try {
            var existing = getFoundItems();
            existing.unshift(itemObject); // Put newest items at top
            localStorage.setItem(FOUND_ITEMS_KEY, JSON.stringify(existing));
            resolve({ success: true, item: itemObject });
        } catch (error) {
            reject(new Error("Storage limit reached! Please delete older reports or use smaller photos."));
        }
    });
}


/**
 * PROMISE 4: getLostItemsAsync
 * Asynchronously retrieves lost items from storage.
 *
 * @returns {Promise<Array>}
 */
function getLostItemsAsync() {
    return new Promise(function (resolve) {
        // Simulating async retrieval
        setTimeout(function () {
            resolve(getLostItems());
        }, 30);
    });
}


/**
 * PROMISE 5: getFoundItemsAsync
 * Asynchronously retrieves found items from storage.
 *
 * @returns {Promise<Array>}
 */
function getFoundItemsAsync() {
    return new Promise(function (resolve) {
        setTimeout(function () {
            resolve(getFoundItems());
        }, 30);
    });
}


/**
 * PROMISE 6: deleteLostItemAsync
 * Deletes a registered lost item by ID with ownership verification.
 * Only the user who originally created the report is allowed to delete it.
 *
 * @param {string} id - The ID of the report to remove
 * @returns {Promise<Array>} Resolves with updated array of items
 */
function deleteLostItemAsync(id) {
    return new Promise(function (resolve, reject) {
        try {
            var targetId = String(id || "").trim();
            if (!targetId) {
                reject(new Error("Invalid report ID."));
                return;
            }

            // 1. Verify user authentication
            var currentUser = getLoggedInUser();
            if (!currentUser || !currentUser.id) {
                reject(new Error("Authentication required: You must be logged in to delete a report."));
                return;
            }

            // 2. Find the report in stored lost items
            var items = getLostItems();
            var report = null;
            for (var i = 0; i < items.length; i++) {
                if (String(items[i].id).trim() === targetId) {
                    report = items[i];
                    break;
                }
            }

            // 3. Reject if report does not exist
            if (!report) {
                reject(new Error("Report not found."));
                return;
            }

            // 4. Reject if report has no valid owner ID (legacy/demo reports cannot be deleted by ordinary users)
            if (!report.userId) {
                reject(new Error("Unauthorized: This report has unknown ownership and cannot be deleted."));
                return;
            }

            // 5. Verify that the logged-in user's stable ID matches the report's creator ID
            if (String(report.userId).trim() !== String(currentUser.id).trim()) {
                reject(new Error("Unauthorized: You can only delete reports that you created."));
                return;
            }

            // 6. Ownership confirmed -> delete report and update storage
            var filtered = items.filter(function (it) {
                return String(it.id).trim() !== targetId;
            });
            localStorage.setItem(LOST_ITEMS_KEY, JSON.stringify(filtered));

            resolve(filtered);
        } catch (err) {
            reject(new Error("Failed to delete item: " + err.message));
        }
    });
}


/**
 * PROMISE 7: deleteFoundItemAsync
 * Deletes a registered found item by ID with ownership verification.
 * Only the user who originally created the report is allowed to delete it.
 *
 * @param {string} id - The ID of the report to remove
 * @returns {Promise<Array>} Resolves with updated array of items
 */
function deleteFoundItemAsync(id) {
    return new Promise(function (resolve, reject) {
        try {
            var targetId = String(id || "").trim();
            if (!targetId) {
                reject(new Error("Invalid report ID."));
                return;
            }

            // 1. Verify user authentication
            var currentUser = getLoggedInUser();
            if (!currentUser || !currentUser.id) {
                reject(new Error("Authentication required: You must be logged in to delete a report."));
                return;
            }

            // 2. Find the report in stored found items
            var items = getFoundItems();
            var report = null;
            for (var i = 0; i < items.length; i++) {
                if (String(items[i].id).trim() === targetId) {
                    report = items[i];
                    break;
                }
            }

            // 3. Reject if report does not exist
            if (!report) {
                reject(new Error("Report not found."));
                return;
            }

            // 4. Reject if report has no valid owner ID (legacy/demo reports cannot be deleted by ordinary users)
            if (!report.userId) {
                reject(new Error("Unauthorized: This report has unknown ownership and cannot be deleted."));
                return;
            }

            // 5. Verify that the logged-in user's stable ID matches the report's creator ID
            if (String(report.userId).trim() !== String(currentUser.id).trim()) {
                reject(new Error("Unauthorized: You can only delete reports that you created."));
                return;
            }

            // 6. Ownership confirmed -> delete report and update storage
            var filtered = items.filter(function (it) {
                return String(it.id).trim() !== targetId;
            });
            localStorage.setItem(FOUND_ITEMS_KEY, JSON.stringify(filtered));

            resolve(filtered);
        } catch (err) {
            reject(new Error("Failed to delete item: " + err.message));
        }
    });
}


/**
 * PROMISE: saveMatchNotificationAsync
 * Saves a match notification between a finder and a report owner.
 *
 * @param {Object} matchData
 * @returns {Promise<Object>}
 */
function saveMatchNotificationAsync(matchData) {
    return new Promise(function (resolve, reject) {
        try {
            var existing = localStorage.getItem("itemMatches");
            var matches = existing ? JSON.parse(existing) : [];
            matches.unshift(matchData);
            localStorage.setItem("itemMatches", JSON.stringify(matches));
            resolve(matchData);
        } catch (err) {
            reject(new Error("Failed to save match notification: " + err.message));
        }
    });
}


/**
 * Global Toast Notification Helper
 */
function showToastNotification(message, type) {
    var toast = document.querySelector(".app-toast");
    if (!toast) {
        toast = document.createElement("div");
        toast.className = "app-toast";
        document.body.appendChild(toast);
    }
    toast.className = "app-toast " + (type || "success");
    toast.innerHTML = message;
    toast.classList.add("show");

    setTimeout(function () {
        toast.classList.remove("show");
    }, 3200);
}


/**
 * PROMISE 8: registerUserAsync
 * Asynchronously registers a new user account with duplicate check.
 *
 * @param {Object} user - { name, email, phone, password }
 * @returns {Promise<Object>}
 */
function registerUserAsync(user) {
    return new Promise(function (resolve, reject) {
        if (!user || !user.email || !user.password) {
            reject(new Error("Email and password are required."));
            return;
        }

        if (isEmailTaken(user.email)) {
            reject(new Error("This email is already registered. Please login instead."));
            return;
        }

        try {
            if (!user.id) {
                user.id = generateUserId();
            }
            saveUser(user);
            resolve(user);
        } catch (e) {
            reject(new Error("Failed to save user account."));
        }
    });
}


/**
 * PROMISE 9: loginUserAsync
 * Asynchronously validates credentials and starts a user session.
 *
 * @param {string} email
 * @param {string} password
 * @returns {Promise<Object>}
 */
function loginUserAsync(email, password) {
    return new Promise(function (resolve, reject) {
        var cleanEmail = (email || "").toLowerCase().trim();
        var cleanPass = (password || "").trim();

        if (!cleanEmail || !cleanPass) {
            reject(new Error("Please enter both email and password."));
            return;
        }

        var users = getUsers();
        var userFoundByEmail = null;

        for (var i = 0; i < users.length; i++) {
            if ((users[i].email || "").toLowerCase().trim() === cleanEmail) {
                userFoundByEmail = users[i];
                break;
            }
        }

        if (!userFoundByEmail) {
            reject(new Error("No account found for " + cleanEmail + ". Please create an account via Sign Up, or click 'One-Click Fill Demo'."));
            return;
        }

        var storedPass = (userFoundByEmail.password || "").trim();
        if (storedPass !== cleanPass && userFoundByEmail.password !== password) {
            reject(new Error("Incorrect password for " + cleanEmail + ". Please verify and try again."));
            return;
        }

        // Guarantee stable user ID exists
        if (!userFoundByEmail.id) {
            userFoundByEmail.id = (cleanEmail === "user@example.com") ? "user_demo_default" : generateUserId();
            var allUsers = getUsers();
            for (var u = 0; u < allUsers.length; u++) {
                if ((allUsers[u].email || "").toLowerCase().trim() === cleanEmail) {
                    allUsers[u].id = userFoundByEmail.id;
                    break;
                }
            }
            localStorage.setItem(USERS_KEY, JSON.stringify(allUsers));
        }

        setLoggedInUser(userFoundByEmail);
        resolve(userFoundByEmail);
    });
}


/**
 * PROMISE 10: saveContactMessageAsync
 * Asynchronously saves a contact message to localStorage.
 *
 * @param {Object} messageObj
 * @returns {Promise<Object>}
 */
function saveContactMessageAsync(messageObj) {
    return new Promise(function (resolve, reject) {
        try {
            var existing = localStorage.getItem(CONTACT_KEY);
            var list = existing ? JSON.parse(existing) : [];
            list.push(messageObj);
            localStorage.setItem(CONTACT_KEY, JSON.stringify(list));
            resolve(messageObj);
        } catch (e) {
            reject(new Error("Failed to save contact message."));
        }
    });
}


// ============================================================
// 3. AUTOMATIC NAVBAR & PREFILL INITIALIZATION
// ============================================================

function initNavbarAuth() {
    var user = getLoggedInUser();
    var buttonsContainer = document.querySelector(".navbar .buttons");

    if (buttonsContainer) {
        if (user && user.name) {
            buttonsContainer.innerHTML =
                '<span class="user-greeting" style="font-size:14px;color:#374151;font-weight:600;display:inline-flex;align-items:center;gap:6px;">' +
                '👤 <span>' + user.name.split(" ")[0] + '</span>' +
                '</span>' +
                '<a href="#" id="logout-btn" class="login-btn" style="text-decoration:none;padding:8px 16px;border:1px solid #ef4444;color:#ef4444;border-radius:8px;font-weight:600;font-size:13px;transition:.3s;">Logout</a>';

            var logoutBtn = document.getElementById("logout-btn");
            if (logoutBtn) {
                logoutBtn.addEventListener("click", function (e) {
                    e.preventDefault();
                    logoutUser();
                    alert("You have logged out successfully.");
                    window.location.reload();
                });
            }
        }
    }

    // Pre-fill contact information on report forms if logged in
    if (user) {
        var nameInput = document.getElementById("name");
        var emailInput = document.getElementById("email");
        var phoneInput = document.getElementById("phone");

        if (nameInput && !nameInput.value && user.name) {
            nameInput.value = user.name;
        }
        if (emailInput && !emailInput.value && user.email) {
            emailInput.value = user.email;
        }
        if (phoneInput && !phoneInput.value && user.phone) {
            phoneInput.value = user.phone;
        }
    }
}

// Run auth header check whenever DOM is ready
if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initNavbarAuth);
} else {
    initNavbarAuth();
}
