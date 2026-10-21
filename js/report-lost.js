// ============================================================
// report-lost.js — Handles the Report Lost Item form
// Concepts used: Promise, async/await, DOM, events, form validation,
//                FileReader, canvas compression, localStorage
// ============================================================

window.addEventListener("load", function () {

    // --- References to form elements ---
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
    var submitBtn = form ? form.querySelector(".submit-btn") : null;

    // Feedback messages
    var successMsg = document.getElementById("success-message");
    var errorMsg = document.getElementById("error-message");

    // Image preview element
    var imagePreview = document.getElementById("image-preview");

    // Current processed image data
    var imageData = "";

    // Pre-fill user information if logged in
    var currentUser = getLoggedInUser();
    if (currentUser) {
        if (nameInput && !nameInput.value) nameInput.value = currentUser.name || "";
        if (emailInput && !emailInput.value) emailInput.value = currentUser.email || "";
        if (phoneInput && !phoneInput.value) phoneInput.value = currentUser.phone || "";
    }

    // Set default date to today if empty
    if (dateInput && !dateInput.value) {
        var today = new Date().toISOString().split("T")[0];
        dateInput.value = today;
    }

    // --- Helper: show an error message ---
    function showError(message) {
        if (errorMsg) {
            errorMsg.innerText = message;
            errorMsg.style.display = "block";
            errorMsg.scrollIntoView({ behavior: "smooth", block: "center" });
        }
        if (successMsg) successMsg.style.display = "none";
    }

    // --- Helper: show a success message ---
    function showSuccess(message) {
        if (successMsg) {
            successMsg.innerText = message;
            successMsg.style.display = "block";
            successMsg.scrollIntoView({ behavior: "smooth", block: "center" });
        }
        if (errorMsg) errorMsg.style.display = "none";
    }

    // --- Helper: hide both messages ---
    function hideMessages() {
        if (errorMsg) errorMsg.style.display = "none";
        if (successMsg) successMsg.style.display = "none";
    }

    // ============================================================
    // PROMISE USAGE: Asynchronous Image Processing & Preview
    // Using processImageFile() which returns a Promise
    // ============================================================
    if (imageInput) {
        imageInput.addEventListener("change", function () {
            hideMessages();
            var file = imageInput.files && imageInput.files[0];

            if (!file) {
                imageData = "";
                if (imagePreview) imagePreview.style.display = "none";
                return;
            }

            // Execute the image processing Promise
            processImageFile(file, 640, 640, 0.82)
                .then(function (compressedBase64) {
                    imageData = compressedBase64;
                    if (imagePreview) {
                        imagePreview.src = compressedBase64;
                        imagePreview.style.display = "block";
                    }
                })
                .catch(function (error) {
                    showError(error.message);
                    imageInput.value = "";
                    imageData = "";
                    if (imagePreview) imagePreview.style.display = "none";
                });
        });
    }

    // --- Validate the form fields ---
    function validateForm() {
        if (itemNameInput.value.trim() === "") {
            showError("Please enter the item name.");
            itemNameInput.focus();
            return false;
        }

        if (categoryInput.value === "") {
            showError("Please select a category.");
            categoryInput.focus();
            return false;
        }

        if (locationInput.value.trim() === "") {
            showError("Please enter the location where the item was lost.");
            locationInput.focus();
            return false;
        }

        if (descInput.value.trim() === "") {
            showError("Please provide a description of the item.");
            descInput.focus();
            return false;
        }

        if (dateInput.value === "") {
            showError("Please select the date the item was lost.");
            dateInput.focus();
            return false;
        }

        if (nameInput.value.trim() === "") {
            showError("Please enter your full name.");
            nameInput.focus();
            return false;
        }

        var emailVal = emailInput.value.trim();
        if (emailVal === "" || emailVal.indexOf("@") === -1 || emailVal.indexOf(".") === -1) {
            showError("Please enter a valid email address.");
            emailInput.focus();
            return false;
        }

        var phoneVal = phoneInput.value.trim();
        if (phoneVal === "" || phoneVal.length < 7) {
            showError("Please enter a valid phone number (at least 7 digits).");
            phoneInput.focus();
            return false;
        }

        return true;
    }

    // ============================================================
    // PROMISE USAGE: Asynchronous Form Submission & Report Saving
    // Chains processImageFile() Promise and saveLostItemAsync() Promise
    // ============================================================
    if (form) {
        form.addEventListener("submit", function (event) {
            event.preventDefault();
            hideMessages();

            if (!validateForm()) {
                return;
            }

            // Set loading state on submit button
            if (submitBtn) {
                submitBtn.disabled = true;
                submitBtn.innerText = "Registering Item...";
            }

            var selectedFile = imageInput.files && imageInput.files[0];

            // Use Promise to ensure image is processed before saving
            var imagePromise = selectedFile && !imageData
                ? processImageFile(selectedFile, 640, 640, 0.82)
                : Promise.resolve(imageData);

            imagePromise
                .then(function (finalImageData) {
                    // Build report object
                    var report = {
                        id: generateId(),
                        type: "lost",
                        itemName: itemNameInput.value.trim(),
                        category: categoryInput.value,
                        location: locationInput.value.trim(),
                        description: descInput.value.trim(),
                        date: dateInput.value,
                        time: timeInput ? timeInput.value : "",
                        additionalDetails: addlInput ? addlInput.value.trim() : "",
                        image: finalImageData || "",
                        contactName: nameInput.value.trim(),
                        contactEmail: emailInput.value.trim(),
                        contactPhone: phoneInput.value.trim(),
                        reportedAt: new Date().toISOString()
                    };

                    // Call the Promise-based saving function
                    return saveLostItemAsync(report);
                })
                .then(function (result) {
                    showSuccess("✅ Your lost item has been successfully registered! Redirecting to Lost Items...");
                    form.reset();
                    imageData = "";
                    if (imagePreview) imagePreview.style.display = "none";

                    // Redirect after short delay so user sees success message
                    setTimeout(function () {
                        window.location.href = "lost-items.html";
                    }, 1500);
                })
                .catch(function (error) {
                    showError("Failed to register item: " + (error.message || "Unknown error occurred."));
                    if (submitBtn) {
                        submitBtn.disabled = false;
                        submitBtn.innerText = "Submit Report";
                    }
                });
        });
    }

});
