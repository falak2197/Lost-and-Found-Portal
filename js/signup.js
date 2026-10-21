// ============================================================
// signup.js — Handles the Sign Up / Create Account form
// Concepts used: Promise, DOM, events, form validation, localStorage
// ============================================================

window.addEventListener("load", function () {

    // --- References to form elements ---
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
    var submitBtn = form ? (form.querySelector(".signup-submit-btn") || form.querySelector("button[type='submit']")) : null;

    if (googleBtn) {
        googleBtn.addEventListener("click", function () {
            alert("Google Sign-In is not enabled for local demo. Please register with your email and password.");
        });
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

    // --- Validate sign-up inputs ---
    function validateSignup() {
        if (nameInput.value.trim() === "") {
            showError("Please enter your full name.");
            nameInput.focus();
            return false;
        }

        var email = emailInput.value.trim();
        if (email === "" || email.indexOf("@") === -1 || email.indexOf(".") === -1) {
            showError("Please enter a valid email address.");
            emailInput.focus();
            return false;
        }

        var phone = phoneInput.value.trim();
        if (phone === "" || phone.length < 7) {
            showError("Please enter a valid phone number (at least 7 digits).");
            phoneInput.focus();
            return false;
        }

        var password = passwordInput.value;
        if (password.length < 6) {
            showError("Password must be at least 6 characters long.");
            passwordInput.focus();
            return false;
        }

        if (password !== confirmInput.value) {
            showError("Passwords do not match. Please verify.");
            confirmInput.focus();
            return false;
        }

        if (termsCheckbox && !termsCheckbox.checked) {
            showError("Please accept the Terms & Conditions to create an account.");
            return false;
        }

        return true;
    }

    // ============================================================
    // PROMISE USAGE: Asynchronous User Registration
    // Using registerUserAsync(newUser) which returns a Promise
    // ============================================================
    if (form) {
        form.addEventListener("submit", function (event) {
            event.preventDefault();

            if (successMsg) successMsg.style.display = "none";
            if (errorMsg) errorMsg.style.display = "none";

            if (!validateSignup()) {
                return;
            }

            var newUser = {
                name: nameInput.value.trim(),
                email: emailInput.value.trim().toLowerCase(),
                phone: phoneInput.value.trim(),
                password: passwordInput.value,
                registeredAt: new Date().toISOString()
            };

            if (submitBtn) {
                submitBtn.disabled = true;
                submitBtn.innerText = "Creating Account...";
            }

            // Call Promise-based register function
            registerUserAsync(newUser)
                .then(function (user) {
                    showSuccess("✅ Account created successfully! Redirecting to Login...");
                    form.reset();

                    setTimeout(function () {
                        window.location.href = "login.html";
                    }, 1500);
                })
                .catch(function (error) {
                    showError(error.message || "Failed to register account.");
                    if (submitBtn) {
                        submitBtn.disabled = false;
                        submitBtn.innerText = "Create Account";
                    }
                });
        });
    }

});
