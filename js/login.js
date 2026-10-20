// ============================================================
// login.js — Handles the Login form
// Concepts used: DOM, events, form validation, localStorage,
//                objects, if/else, comparison operators
// ============================================================

window.addEventListener("load", function () {

    // --- Get form elements ---
    var form = document.getElementById("login-form");
    var emailInput = document.getElementById("email");
    var passwordInput = document.getElementById("password");
    var rememberBox = document.querySelector(".remember input[type='checkbox']");
    var forgotLink = document.querySelector(".forgot-password");
    var googleBtn = document.querySelector(".google-btn");
    var successMsg = document.getElementById("success-message");
    var errorMsg = document.getElementById("error-message");


    // --- Pre-fill email if "Remember Me" was used last time ---
    // Concept: localStorage.getItem, conditional check
    var savedEmail = localStorage.getItem("rememberedEmail");
    if (savedEmail !== null) {
        emailInput.value = savedEmail;
        if (rememberBox) {
            rememberBox.checked = true;
        }
    }


    // --- Block Google button in demo ---
    if (googleBtn) {
        googleBtn.addEventListener("click", function () {
            alert("Google Sign-In is not available in this local demo. Please use your registered email and password.");
        });
    }


    // --- Forgot Password: show a simple info message ---
    if (forgotLink) {
        forgotLink.addEventListener("click", function (event) {
            event.preventDefault();
            alert(
                "Forgot Password?\n\n" +
                "This is a local demo — password reset emails are not sent.\n" +
                "If you have forgotten your password, please create a new account."
            );
        });
    }


    // --- Helper: show error message ---
    function showError(message) {
        errorMsg.innerText = message;
        errorMsg.style.display = "block";
        successMsg.style.display = "none";
    }


    // --- Helper: show success message ---
    function showSuccess(message) {
        successMsg.innerText = message;
        successMsg.style.display = "block";
        errorMsg.style.display = "none";
    }


    // --- Validate login fields ---
    function validateLogin() {
        var email = emailInput.value.trim();
        if (email === "" || email.indexOf("@") === -1) {
            showError("Please enter a valid email address.");
            return false;
        }

        if (passwordInput.value === "") {
            showError("Please enter your password.");
            return false;
        }

        return true;
    }


    // --- Handle form submission ---
    form.addEventListener("submit", function (event) {
        event.preventDefault();
        successMsg.style.display = "none";
        errorMsg.style.display = "none";

        if (!validateLogin()) {
            return;
        }

        var email = emailInput.value.trim();
        var password = passwordInput.value;

        // Check credentials against stored users — concept: function from storage.js
        var user = findUser(email, password);

        if (user === null) {
            // No matching user found
            showError("Incorrect email or password. Please try again, or create an account.");
            return;
        }

        // --- Remember Me feature ---
        // Concept: if/else, localStorage.setItem, localStorage.removeItem
        if (rememberBox && rememberBox.checked) {
            localStorage.setItem("rememberedEmail", email);
        } else {
            localStorage.removeItem("rememberedEmail");
        }

        // Save logged-in user to session
        setLoggedInUser(user);

        // Show success and redirect
        showSuccess("✅ Login successful! Welcome back, " + user.name + ". Redirecting...");

        setTimeout(function () {
            window.location.href = "index.html";
        }, 2000);
    });

});
