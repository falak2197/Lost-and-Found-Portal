// ============================================================
// signup.js — Handles the Sign Up / Create Account form
// Concepts used: DOM, events, form validation, localStorage,
//                arrays, objects, if/else, string methods
// ============================================================

window.addEventListener("load", function () {

    // --- Get form elements ---
    var form = document.getElementById("signup-form");
    var nameInput = document.getElementById("name");
    var emailInput = document.getElementById("email");
    var phoneInput = document.getElementById("phone");
    var passwordInput = document.getElementById("password");
    var confirmInput = document.getElementById("confirm-password");
    var termsCheckbox = document.getElementById("terms");
    var successMsg = document.getElementById("success-message");
    var errorMsg = document.getElementById("error-message");
    var googleBtn = document.querySelector(".google-btn");


    // --- Block the Google button — not available in this demo ---
    if (googleBtn) {
        googleBtn.addEventListener("click", function () {
            alert("Google Sign-In is not available in this local demo. Please use the email and password form.");
        });
    }


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


    // --- Validate the sign-up form ---
    // Concept: if/else, string methods (trim, length, indexOf)
    function validateSignup() {
        // Full name must not be empty
        if (nameInput.value.trim() === "") {
            showError("Please enter your full name.");
            return false;
        }

        // Email must have @ symbol
        var email = emailInput.value.trim();
        if (email === "" || email.indexOf("@") === -1) {
            showError("Please enter a valid email address.");
            return false;
        }

        // Phone must be at least 7 characters
        var phone = phoneInput.value.trim();
        if (phone === "" || phone.length < 7) {
            showError("Please enter a valid phone number (at least 7 digits).");
            return false;
        }

        // Password must be at least 6 characters
        var password = passwordInput.value;
        if (password.length < 6) {
            showError("Password must be at least 6 characters long.");
            return false;
        }

        // Passwords must match — concept: comparison operator ===
        if (password !== confirmInput.value) {
            showError("Passwords do not match. Please re-enter.");
            return false;
        }

        // Terms checkbox must be ticked
        if (!termsCheckbox.checked) {
            showError("You must agree to the Terms & Conditions to create an account.");
            return false;
        }

        // Check for duplicate email — concept: function call, return value
        if (isEmailTaken(email)) {
            showError("This email is already registered. Please use a different email or login.");
            return false;
        }

        return true;  // all validations passed
    }


    // --- Handle form submit ---
    form.addEventListener("submit", function (event) {
        event.preventDefault();  // stop page reload

        // Hide previous messages
        successMsg.style.display = "none";
        errorMsg.style.display = "none";

        if (!validateSignup()) {
            return;
        }

        // Build a user object — concept: JavaScript objects
        var newUser = {
            name: nameInput.value.trim(),
            email: emailInput.value.trim(),
            phone: phoneInput.value.trim(),
            password: passwordInput.value
            // NOTE: Storing passwords locally is only for demo purposes.
            // In a real application, passwords should never be stored in plain text.
        };

        // Save the user to localStorage
        saveUser(newUser);

        // Show success message
        showSuccess("✅ Account created successfully! Redirecting to Login...");

        // Clear the form
        form.reset();

        // Redirect to login after 2 seconds
        setTimeout(function () {
            window.location.href = "login.html";
        }, 2000);
    });

});
