// ============================================================
// contact.js — Handles the Contact Us form
// Concepts used: DOM, events, form validation, if/else,
//                string methods, localStorage (to save messages)
// ============================================================

window.addEventListener("load", function () {

    // --- Get form elements ---
    var form = document.getElementById("contact-form");
    var nameInput = document.getElementById("name");
    var emailInput = document.getElementById("email");
    var subjectInput = document.getElementById("subject");
    var messageInput = document.getElementById("message");
    var successMsg = document.getElementById("success-message");
    var errorMsg = document.getElementById("error-message");


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


    // --- Validate the contact form ---
    function validateContact() {
        if (nameInput.value.trim() === "") {
            showError("Please enter your name.");
            return false;
        }

        var email = emailInput.value.trim();
        if (email === "" || email.indexOf("@") === -1) {
            showError("Please enter a valid email address.");
            return false;
        }

        if (subjectInput.value.trim() === "") {
            showError("Please enter a subject.");
            return false;
        }

        if (messageInput.value.trim() === "") {
            showError("Please write a message.");
            return false;
        }

        // Message should be at least 10 characters
        if (messageInput.value.trim().length < 10) {
            showError("Your message should be at least 10 characters long.");
            return false;
        }

        return true;
    }


    // --- Handle form submit ---
    form.addEventListener("submit", function (event) {
        event.preventDefault();
        successMsg.style.display = "none";
        errorMsg.style.display = "none";

        if (!validateContact()) {
            return;
        }

        // Build a contact message object — concept: JavaScript objects
        var contactMessage = {
            id: generateId(),
            name: nameInput.value.trim(),
            email: emailInput.value.trim(),
            subject: subjectInput.value.trim(),
            message: messageInput.value.trim(),
            sentAt: new Date().toISOString()
        };

        // Save to localStorage so the message is not lost on refresh
        // NOTE: This is stored locally in your browser only.
        // This does NOT send any email to support@lostfound.com.
        var existing = localStorage.getItem("contactMessages");
        var messages = existing ? JSON.parse(existing) : [];
        messages.push(contactMessage);
        localStorage.setItem("contactMessages", JSON.stringify(messages));

        // Show success
        showSuccess(
            "✅ Your message has been recorded. Thank you, " + contactMessage.name + "!\n" +
            "(Note: This is a local demo — your message is saved in the browser but not emailed.)"
        );

        // Clear the form after success
        form.reset();
    });

});
