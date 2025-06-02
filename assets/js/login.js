document.addEventListener("DOMContentLoaded", function () {
  const loginForm = document.getElementById("loginForm");

  if (loginForm) {
    loginForm.addEventListener("submit", function (e) {
      e.preventDefault();

      // Get form data
      const email = document.getElementById("email").value;
      const password = document.getElementById("password").value;

      // Validate form
      if (!validateEmail(email)) {
        showNotification("Please enter a valid email address.", "warning");
        return;
      }

      if (!password) {
        showNotification("Please enter your password.", "warning");
        return;
      }

      // Simulate API call for authentication
      showNotification("Authenticating...", "info");

      // Simulate API delay
      setTimeout(() => {
        // For demo purposes, use hardcoded credentials
        if (email === "admin@fingerpay.com" && password === "admin123") {
          showNotification("Login successful!", "success");

          // Redirect to dashboard after successful login
          setTimeout(() => {
            window.location.href = "dashboard.html";
          }, 1000);
        } else {
          showNotification("Invalid email or password.", "danger");
        }
      }, 1500);
    });
  }

  // Handle forgot password
  const forgotPasswordLink = document.querySelector('a[href="#"]');
  if (forgotPasswordLink) {
    forgotPasswordLink.addEventListener("click", function (e) {
      e.preventDefault();
      const email = document.getElementById("email").value;

      if (!validateEmail(email)) {
        showNotification("Please enter your email address first.", "warning");
        return;
      }

      // Simulate sending reset password email
      showNotification("Sending password reset instructions...", "info");

      setTimeout(() => {
        showNotification(
          "Password reset instructions sent to your email!",
          "success"
        );
      }, 1500);
    });
  }

  // Email validation function
  function validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  }

  // Show notification function
  function showNotification(message, type = "info") {
    // Create notification element
    const notification = document.createElement("div");
    notification.className = `alert alert-${type} alert-dismissible fade show position-fixed top-0 end-0 m-3`;
    notification.role = "alert";
    notification.innerHTML = `
            ${message}
            <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
        `;

    // Add to document
    document.body.appendChild(notification);

    // Remove after 3 seconds
    setTimeout(() => {
      notification.remove();
    }, 3000);
  }

  // Add input event listeners for real-time validation
  const emailInput = document.getElementById("email");
  if (emailInput) {
    emailInput.addEventListener("input", function () {
      if (this.value && !validateEmail(this.value)) {
        this.classList.add("is-invalid");
      } else {
        this.classList.remove("is-invalid");
      }
    });
  }

  const passwordInput = document.getElementById("password");
  if (passwordInput) {
    passwordInput.addEventListener("input", function () {
      if (this.value.length < 6) {
        this.classList.add("is-invalid");
      } else {
        this.classList.remove("is-invalid");
      }
    });
  }

  // Add password visibility toggle
  const passwordField = document.getElementById("password");
  if (passwordField) {
    const togglePassword = document.createElement("button");
    togglePassword.type = "button";
    togglePassword.className =
      "btn position-absolute end-0 top-45 translate-middle-y bg-transparent border-0 text-muted";
    togglePassword.style.padding = "0 12px";
    togglePassword.innerHTML = '<i class="fas fa-eye"></i>';
    togglePassword.style.zIndex = "10";

    const wrapper = document.createElement("div");
    wrapper.className = "position-relative";
    passwordField.parentNode.insertBefore(wrapper, passwordField);
    wrapper.appendChild(passwordField);
    wrapper.appendChild(togglePassword);

    togglePassword.addEventListener("click", function () {
      const type =
        passwordField.getAttribute("type") === "password" ? "text" : "password";
      passwordField.setAttribute("type", type);

      const icon = this.querySelector("i");
      icon.classList.toggle("fa-eye");
      icon.classList.toggle("fa-eye-slash");
    });
  }
});
