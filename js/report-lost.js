// ============================================================
// report-lost.js — Handles the Report Lost Item form
// Concepts used: DOM, events, forms, validation, localStorage,
//                arrays, objects, FileReader for image preview
// ============================================================

// --- Wait for the page to fully load before running ---
// Concept: event listener on window "load" event
window.addEventListener("load", function () {

    // --- Get references to form elements using getElementById ---
    // Concept: document.getElementById()
    var form = document.getElementById("report-lost-form");
    var itemNameInput = document.getElementById("item-name");
    var categoryInput = document.getElementById("category");
    var locationInput = document.getElementById("location");
    var descInput = document.getElementById("description");
    var dateInput = document.getElementById("lost-date");
    var timeInput = document.getElementById("lost-time");
    var addlInput = document.getElementById("additional-details");
    var imageInput = document.getElementById("item-image");
    var nameInput = document.getElementById("name");
    var emailInput = document.getElementById("email");
    var phoneInput = document.getElementById("phone");

    // Message boxes for feedback
    var successMsg = document.getElementById("success-message");
    var errorMsg = document.getElementById("error-message");

    // Image preview element
    var imagePreview = document.getElementById("image-preview");

    // This variable will store the base64 image string
    var imageData = "";


    // --- Image preview when user picks a file ---
    // Concept: FileReader, change event, if/else
    imageInput.addEventListener("change", function () {
        var file = imageInput.files[0];  // get the first selected file

        if (file) {
            // FileReader reads the file as a base64 data URL
            var reader = new FileReader();

            reader.onload = function (event) {
                imageData = event.target.result;   // save base64 string
                imagePreview.src = imageData;      // show preview
                imagePreview.style.display = "block"; // make visible
            };

            reader.readAsDataURL(file);  // start reading
        } else {
            // No file chosen — hide the preview
            imageData = "";
            imagePreview.style.display = "none";
        }
    });


    // --- Helper: show an error message ---
    function showError(message) {
        errorMsg.innerText = message;
        errorMsg.style.display = "block";
        successMsg.style.display = "none";
    }


    // --- Helper: show a success message ---
    function showSuccess(message) {
        successMsg.innerText = message;
        successMsg.style.display = "block";
        errorMsg.style.display = "none";
    }


    // --- Helper: hide both messages ---
    function hideMessages() {
        errorMsg.style.display = "none";
        successMsg.style.display = "none";
    }


    // --- Validate the form fields ---
    // Concept: if/else conditions, string methods, return values
    function validateForm() {
        // Check item name — must not be empty
        if (itemNameInput.value.trim() === "") {
            showError("Please enter the item name.");
            return false;
        }

        // Check category — must select something
        if (categoryInput.value === "") {
            showError("Please select a category.");
            return false;
        }

        // Check location
        if (locationInput.value.trim() === "") {
            showError("Please enter the location where the item was lost.");
            return false;
        }

        // Check description
        if (descInput.value.trim() === "") {
            showError("Please provide a description of the item.");
            return false;
        }

        // Check date
        if (dateInput.value === "") {
            showError("Please select the date the item was lost.");
            return false;
        }

        // Check full name
        if (nameInput.value.trim() === "") {
            showError("Please enter your full name.");
            return false;
        }

        // Check email — simple format check using indexOf
        var emailVal = emailInput.value.trim();
        if (emailVal === "" || emailVal.indexOf("@") === -1) {
            showError("Please enter a valid email address.");
            return false;
        }

        // Check phone — must be at least 7 digits
        var phoneVal = phoneInput.value.trim();
        if (phoneVal === "" || phoneVal.length < 7) {
            showError("Please enter a valid phone number.");
            return false;
        }

        return true;  // all checks passed
    }


    // --- Handle form submission ---
    // Concept: form submit event, preventDefault, objects, localStorage
    form.addEventListener("submit", function (event) {
        event.preventDefault();  // stop default page reload
        hideMessages();

        // Run validation — stop here if something is wrong
        if (!validateForm()) {
            return;
        }

        // --- Build a JavaScript object to represent this report ---
        // Concept: creating an object with key-value pairs
        var report = {
            id: generateId(),              // unique ID
            type: "lost",
            itemName: itemNameInput.value.trim(),
            category: categoryInput.value,
            location: locationInput.value.trim(),
            description: descInput.value.trim(),
            date: dateInput.value,
            time: timeInput.value,
            additionalDetails: addlInput.value.trim(),
            image: imageData,                  // base64 or ""
            contactName: nameInput.value.trim(),
            contactEmail: emailInput.value.trim(),
            contactPhone: phoneInput.value.trim(),
            reportedAt: new Date().toISOString()    // timestamp
        };

        // --- Save to localStorage using the shared helper ---
        saveLostItem(report);

        // --- Show success message ---
        showSuccess("✅ Your lost item report has been submitted! It will now appear on the Lost Items page.");

        // --- Clear the form ---
        form.reset();
        imagePreview.style.display = "none";
        imageData = "";

        // --- Redirect to lost-items page after 2 seconds ---
        setTimeout(function () {
            window.location.href = "lost-items.html";
        }, 2000);
    });

});
