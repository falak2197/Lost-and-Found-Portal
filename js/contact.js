// ============================================================
// contact.js — Handles the Contact Us form
// Concepts used: Promise, DOM, events, form validation, localStorage
// ============================================================

window.addEventListener("load", function () {

    // --- References to form elements ---
    var form = document.getElementById("contact-form");
    var nameInput = document.getElementById("name");
    var emailInput = document.getElementById("email");
    var subjectInput = document.getElementById("subject");
    var messageInput = document.getElementById("message");
    var successMsg = document.getElementById("success-message");
    var errorMsg = document.getElementById("error-message");
    var submitBtn = form ? form.querySelector(".submit-btn") : null;

    // Pre-fill user information if logged in
    var currentUser = getLoggedInUser();
    if (currentUser) {
        if (nameInput && !nameInput.value) nameInput.value = currentUser.name || "";
        if (emailInput && !emailInput.value) emailInput.value = currentUser.email || "";
    }

    // --- Helper: show error ---
    function showError(message) {
        if (errorMsg) {
            errorMsg.innerText = message;
            errorMsg.style.display = "block";
        }
        if (successMsg) successMsg.style.display = "none";
    }

    // --- Helper: show success ---
    function showSuccess(message) {
        if (successMsg) {
            successMsg.innerText = message;
            successMsg.style.display = "block";
        }
        if (errorMsg) errorMsg.style.display = "none";
    }

    // --- Validate inputs ---
    function validateContact() {
        if (nameInput.value.trim() === "") {
            showError("Please enter your name.");
            nameInput.focus();
            return false;
        }

        var email = emailInput.value.trim();
        if (email === "" || email.indexOf("@") === -1 || email.indexOf(".") === -1) {
            showError("Please enter a valid email address.");
            emailInput.focus();
            return false;
        }

        if (subjectInput.value.trim() === "") {
            showError("Please enter a subject.");
            subjectInput.focus();
            return false;
        }

        if (messageInput.value.trim().length < 10) {
            showError("Your message should be at least 10 characters long.");
            messageInput.focus();
            return false;
        }

        return true;
    }

    // ============================================================
    // PROMISE USAGE: Asynchronous Message Saving
    // Using saveContactMessageAsync(contactMessage) which returns a Promise
    // ============================================================
    if (form) {
        form.addEventListener("submit", function (event) {
            event.preventDefault();

            if (successMsg) successMsg.style.display = "none";
            if (errorMsg) errorMsg.style.display = "none";

            if (!validateContact()) {
                return;
            }

            var contactMessage = {
                id: generateId(),
                name: nameInput.value.trim(),
                email: emailInput.value.trim(),
                subject: subjectInput.value.trim(),
                message: messageInput.value.trim(),
                sentAt: new Date().toISOString()
            };

            if (submitBtn) {
                submitBtn.disabled = true;
                submitBtn.innerText = "Sending Message...";
            }

            // Call Promise-based message saving function
            saveContactMessageAsync(contactMessage)
                .then(function (saved) {
                    showSuccess(
                        "✅ Thank you, " + saved.name + "! Your message has been received. Our team will get back to you shortly."
                    );
                    form.reset();
                    if (submitBtn) {
                        submitBtn.disabled = false;
                        submitBtn.innerText = "Send Message";
                    }
                })
                .catch(function (error) {
                    showError("Failed to send message: " + (error.message || "Please try again."));
                    if (submitBtn) {
                        submitBtn.disabled = false;
                        submitBtn.innerText = "Send Message";
                    }
                });
        });
    }

});
