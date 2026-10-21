// ============================================================
// login.js — Handles the Login form
// Concepts used: Promise, DOM, events, form validation, localStorage
// ============================================================

window.addEventListener("load", function () {

    // --- References to form elements ---
    var form = document.getElementById("login-form");
    var emailInput = document.getElementById("email");
    var passwordInput = document.getElementById("password");
    var rememberBox = document.querySelector(".remember input[type='checkbox']");
    var forgotLink = document.querySelector(".forgot-password");
    var googleBtn = document.querySelector(".google-btn");
    var successMsg = document.getElementById("success-message");
    var errorMsg = document.getElementById("error-message");
    var submitBtn = form ? (form.querySelector(".login-submit-btn") || form.querySelector("button[type='submit']")) : null;

    // Pre-fill email if "Remember Me" was used
    var savedEmail = localStorage.getItem("rememberedEmail");
    if (savedEmail !== null && emailInput) {
        emailInput.value = savedEmail;
        if (rememberBox) {
            rememberBox.checked = true;
        }
    }

    // Google button placeholder notification
    if (googleBtn) {
        googleBtn.addEventListener("click", function () {
            alert("Google Sign-In is not enabled for local demo. Please log in with your email and password.");
        });
    }

    // Forgot Password message
    if (forgotLink) {
        forgotLink.addEventListener("click", function (event) {
            event.preventDefault();
            alert(
                "Password Recovery:\n\n" +
                "In this local storage environment, password emails are not transmitted.\n" +
                "You can create a new account via the Sign Up page anytime."
            );
        });
    }

    // One-Click Fill Demo Credentials
    var fillDemoBtn = document.getElementById("fill-demo-btn");
    if (fillDemoBtn) {
        fillDemoBtn.addEventListener("click", function () {
            if (emailInput) emailInput.value = "user@example.com";
            if (passwordInput) passwordInput.value = "password123";
            if (errorMsg) errorMsg.style.display = "none";
            if (successMsg) {
                successMsg.innerText = "Demo credentials filled! Click 'Login' to sign in.";
                successMsg.style.display = "block";
            }
        });
    }

    // --- Helper: show error message ---
    function showError(message) {
        if (errorMsg) {
            errorMsg.innerText = message;
            errorMsg.style.display = "block";
        }
        if (successMsg) successMsg.style.display = "none";
    }

    // --- Helper: show success message ---
    function showSuccess(message) {
        if (successMsg) {
            successMsg.innerText = message;
            successMsg.style.display = "block";
        }
        if (errorMsg) errorMsg.style.display = "none";
    }

    // --- Validate login fields ---
    function validateLogin() {
        var email = emailInput.value.trim();
        if (email === "" || email.indexOf("@") === -1) {
            showError("Please enter a valid email address.");
            emailInput.focus();
            return false;
        }

        if (passwordInput.value === "") {
            showError("Please enter your password.");
            passwordInput.focus();
            return false;
        }

        return true;
    }

    // ============================================================
    // PROMISE USAGE: Asynchronous Login Authentication
    // Using loginUserAsync(email, password) which returns a Promise
    // ============================================================
    if (form) {
        form.addEventListener("submit", function (event) {
            event.preventDefault();
            if (successMsg) successMsg.style.display = "none";
            if (errorMsg) errorMsg.style.display = "none";

            if (!validateLogin()) {
                return;
            }

            var email = emailInput.value.trim();
            var password = passwordInput.value;

            if (submitBtn) {
                submitBtn.disabled = true;
                submitBtn.innerText = "Signing in...";
            }

            // Call Promise-based login function
            loginUserAsync(email, password)
                .then(function (user) {
                    // Remember Me handling
                    if (rememberBox && rememberBox.checked) {
                        localStorage.setItem("rememberedEmail", email);
                    } else {
                        localStorage.removeItem("rememberedEmail");
                    }

                    showSuccess("✅ Login successful! Welcome back, " + user.name + ". Redirecting to Home...");

                    setTimeout(function () {
                        window.location.href = "index.html";
                    }, 1200);
                })
                .catch(function (error) {
                    showError(error.message || "Invalid credentials. Please verify your email and password.");
                    if (submitBtn) {
                        submitBtn.disabled = false;
                        submitBtn.innerText = "Login";
                    }
                });
        });
    }

});
