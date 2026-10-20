// ============================================================
// storage.js — Shared helper functions for localStorage
// Concept: localStorage, JSON.stringify, JSON.parse, functions
// ============================================================

// --- Key names used in localStorage ---
var LOST_ITEMS_KEY = "lostItems";    // key for lost item reports
var FOUND_ITEMS_KEY = "foundItems";  // key for found item reports
var USERS_KEY = "portalUsers";       // key for registered user accounts
var LOGGED_IN_KEY = "loggedInUser";  // key for current session


// --- Get all lost items from localStorage ---
// Returns an array. If nothing is saved yet, returns an empty array.
function getLostItems() {
    var data = localStorage.getItem(LOST_ITEMS_KEY);  // read from storage
    if (data === null) {
        return [];  // no data yet — return empty array
    }
    return JSON.parse(data);  // convert JSON string back to array
}


// --- Get all found items from localStorage ---
function getFoundItems() {
    var data = localStorage.getItem(FOUND_ITEMS_KEY);
    if (data === null) {
        return [];
    }
    return JSON.parse(data);
}


// --- Save a new lost item report ---
// Takes a JavaScript object and adds it to the existing array
function saveLostItem(itemObject) {
    var existing = getLostItems();   // get current list
    existing.push(itemObject);       // add the new item
    localStorage.setItem(LOST_ITEMS_KEY, JSON.stringify(existing));  // save back
}


// --- Save a new found item report ---
function saveFoundItem(itemObject) {
    var existing = getFoundItems();
    existing.push(itemObject);
    localStorage.setItem(FOUND_ITEMS_KEY, JSON.stringify(existing));
}


// --- Get all registered users ---
function getUsers() {
    var data = localStorage.getItem(USERS_KEY);
    if (data === null) {
        return [];
    }
    return JSON.parse(data);
}


// --- Save a new user account ---
function saveUser(userObject) {
    var existing = getUsers();
    existing.push(userObject);
    localStorage.setItem(USERS_KEY, JSON.stringify(existing));
}


// --- Check if an email is already registered ---
// Concept: for loop, comparison operator ===
function isEmailTaken(email) {
    var users = getUsers();
    for (var i = 0; i < users.length; i++) {
        if (users[i].email === email) {
            return true;  // email already exists
        }
    }
    return false;
}


// --- Find a user by email and password (for login) ---
function findUser(email, password) {
    var users = getUsers();
    for (var i = 0; i < users.length; i++) {
        if (users[i].email === email && users[i].password === password) {
            return users[i];  // match found — return the user object
        }
    }
    return null;  // no match
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
    return JSON.parse(data);
}


// --- Log the user out ---
function logoutUser() {
    localStorage.removeItem(LOGGED_IN_KEY);
}


// --- Generate a unique ID for each item report ---
// Concept: Date.now() returns milliseconds since 1970 as a number
function generateId() {
    return String(Date.now());
}
