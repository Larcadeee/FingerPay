// Create Supabase client
const supabaseUrl = "https://yzwkdfrbotpcvtnnncns.supabase.co";
const supabaseAnonKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl6d2tkZnJib3RwY3Z0bm5uY25zIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDYwMDAxMjcsImV4cCI6MjA2MTU3NjEyN30.d1sADufPth97GQeYOSfjkn2340XIYhPb5_oyz50Ppbg";

const supabase = window.supabase.createClient(supabaseUrl, supabaseAnonKey);

document.addEventListener("DOMContentLoaded", function () {
  const loginForm = document.getElementById("loginForm");

  if (loginForm) {
    loginForm.addEventListener("submit", async function (e) {
      e.preventDefault();

      // Get form data
      const email = document.getElementById("email").value;
      const password = document.getElementById("password").value;

      try {
        // Show loading state
        const submitBtn = this.querySelector('button[type="submit"]');
        const originalText = submitBtn.innerHTML;
        submitBtn.innerHTML =
          '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Logging in...';
        submitBtn.disabled = true;

        // First, check if the user exists in our users table
        const { data: userData, error: userError } = await supabase
          .from("users")
          .select("user_id, email, role")
          .eq("email", email)
          .limit(1)
          .maybeSingle();

        if (userError) {
          throw new Error("Error checking user account");
        }

        if (!userData) {
          throw new Error("Account not found");
        }

        // Sign in with Supabase Auth
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) throw error;

        // Update the user's metadata with their role
        const { error: updateError } = await supabase.auth.updateUser({
          data: { role: userData.role },
        });

        if (updateError) {
          console.error("Error updating user metadata:", updateError);
        }

        showNotification("Login successful!", "success");
        setTimeout(() => {
          window.location.href = "dashboard.html";
        }, 1000);
      } catch (error) {
        console.error("Login error:", error);
        showNotification(error.message, "error");
        // Reset button state
        submitBtn.innerHTML = originalText;
        submitBtn.disabled = false;
      }
    });
  }

  // Handle forgot password
  const forgotPasswordLink = document.querySelector('a[href="#"]');
  if (forgotPasswordLink) {
    forgotPasswordLink.addEventListener("click", async function (e) {
      e.preventDefault();
      const email = document.getElementById("email").value;

      if (!validateEmail(email)) {
        showNotification("Please enter a valid email address.", "warning");
        return;
      }

      try {
        const { error } = await supabase.auth.resetPasswordForEmail(email);
        if (error) throw error;
        showNotification(
          "Password reset instructions sent to your email!",
          "success"
        );
      } catch (error) {
        showNotification(error.message, "error");
      }
    });
  }

  // Email validation function
  function validateEmail(email) {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  }

  // Show notification function
  function showNotification(message, type = "info") {
    const notification = document.createElement("div");
    notification.className = `alert alert-${type} alert-dismissible fade show position-fixed top-0 end-0 m-3`;
    notification.role = "alert";
    notification.innerHTML = `
      ${message}
      <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
    `;
    document.body.appendChild(notification);
    setTimeout(() => notification.remove(), 5000);
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
