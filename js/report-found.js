// ============================================================
// report-found.js — Handles the Report Found Item form
// Concepts used: DOM, events, forms, validation, localStorage,
//                arrays, objects, FileReader for image preview
// ============================================================

// --- Wait for the page to fully load before running ---
window.addEventListener("load", function () {

    // --- Get references to form elements ---
    var form = document.getElementById("report-found-form");
    var itemNameInput = document.getElementById("item-name");
    var categoryInput = document.getElementById("category");
    var locationInput = document.getElementById("location");
    var descInput = document.getElementById("description");
    var dateInput = document.getElementById("found-date");
    var timeInput = document.getElementById("found-time");
    var addlInput = document.getElementById("additional-details");
    var imageInput = document.getElementById("item-image");
    var nameInput = document.getElementById("name");
    var emailInput = document.getElementById("email");
    var phoneInput = document.getElementById("phone");

    // Message boxes
    var successMsg = document.getElementById("success-message");
    var errorMsg = document.getElementById("error-message");

    // Image preview element
    var imagePreview = document.getElementById("image-preview");

    // Variable to hold base64 image data
    var imageData = "";


    // --- Image preview when user picks a file ---
    imageInput.addEventListener("change", function () {
        var file = imageInput.files[0];

        if (file) {
            var reader = new FileReader();

            reader.onload = function (event) {
                imageData = event.target.result;
                imagePreview.src = imageData;
                imagePreview.style.display = "block";
            };

            reader.readAsDataURL(file);
        } else {
            imageData = "";
            imagePreview.style.display = "none";
        }
    });


    // --- Helper: show error ---
    function showError(message) {
        errorMsg.innerText = message;
        errorMsg.style.display = "block";
        successMsg.style.display = "none";
    }


    // --- Helper: show success ---
    function showSuccess(message) {
        successMsg.innerText = message;
        successMsg.style.display = "block";
        errorMsg.style.display = "none";
    }


    // --- Helper: hide messages ---
    function hideMessages() {
        errorMsg.style.display = "none";
        successMsg.style.display = "none";
    }


    // --- Validate all required fields ---
    function validateForm() {
        if (itemNameInput.value.trim() === "") {
            showError("Please enter the item name.");
            return false;
        }

        if (categoryInput.value === "") {
            showError("Please select a category.");
            return false;
        }

        if (locationInput.value.trim() === "") {
            showError("Please enter the location where the item was found.");
            return false;
        }

        if (descInput.value.trim() === "") {
            showError("Please provide a description of the item.");
            return false;
        }

        if (dateInput.value === "") {
            showError("Please select the date the item was found.");
            return false;
        }

        if (nameInput.value.trim() === "") {
            showError("Please enter your full name.");
            return false;
        }

        var emailVal = emailInput.value.trim();
        if (emailVal === "" || emailVal.indexOf("@") === -1) {
            showError("Please enter a valid email address.");
            return false;
        }

        var phoneVal = phoneInput.value.trim();
        if (phoneVal === "" || phoneVal.length < 7) {
            showError("Please enter a valid phone number.");
            return false;
        }

        return true;
    }


    // --- Handle form submission ---
    form.addEventListener("submit", function (event) {
        event.preventDefault();
        hideMessages();

        if (!validateForm()) {
            return;
        }

        // Build the report object
        var report = {
            id: generateId(),
            type: "found",
            itemName: itemNameInput.value.trim(),
            category: categoryInput.value,
            location: locationInput.value.trim(),
            description: descInput.value.trim(),
            date: dateInput.value,
            time: timeInput.value,
            additionalDetails: addlInput.value.trim(),
            image: imageData,
            contactName: nameInput.value.trim(),
            contactEmail: emailInput.value.trim(),
            contactPhone: phoneInput.value.trim(),
            reportedAt: new Date().toISOString()
        };

        // Save to localStorage
        saveFoundItem(report);

        // Show success and clear form
        showSuccess("✅ Your found item report has been submitted! It will now appear on the Found Items page.");
        form.reset();
        imagePreview.style.display = "none";
        imageData = "";

        // Redirect after 2 seconds
        setTimeout(function () {
            window.location.href = "found-items.html";
        }, 2000);
    });

});
