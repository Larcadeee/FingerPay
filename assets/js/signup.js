// Create Supabase client
const supabaseUrl = "https://yzwkdfrbotpcvtnnncns.supabase.co";
const supabaseAnonKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl6d2tkZnJib3RwY3Z0bm5uY25zIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDYwMDAxMjcsImV4cCI6MjA2MTU3NjEyN30.d1sADufPth97GQeYOSfjkn2340XIYhPb5_oyz50Ppbg";

const supabaseClient = window.supabase.createClient(
  supabaseUrl,
  supabaseAnonKey
);

document.addEventListener("DOMContentLoaded", function () {
  const signupForm = document.getElementById("signupForm");
  const togglePassword = document.getElementById("togglePassword");

  // Handle password visibility toggle
  if (togglePassword) {
    togglePassword.addEventListener("click", function () {
      const password = document.getElementById("password");
      const type =
        password.getAttribute("type") === "password" ? "text" : "password";
      password.setAttribute("type", type);

      // Toggle eye icon
      const icon = this.querySelector("i");
      icon.classList.toggle("fa-eye");
      icon.classList.toggle("fa-eye-slash");
    });
  }

  if (signupForm) {
    signupForm.addEventListener("submit", async function (e) {
      e.preventDefault();

      // Get form data
      const name = document.getElementById("name").value;
      const email = document.getElementById("email").value;
      const password = document.getElementById("password").value;

      try {
        // Show loading state
        const submitBtn = this.querySelector('button[type="submit"]');
        const originalText = submitBtn.innerHTML;
        submitBtn.innerHTML =
          '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Signing up...';
        submitBtn.disabled = true;

        // Sign up with Supabase
        const { data: authData, error: authError } =
          await supabaseClient.auth.signUp({
            email,
            password,
            options: {
              data: {
                full_name: name,
              },
            },
          });

        if (authError) throw authError;

        // Create a profile in the profiles table
        const { error: profileError } = await supabaseClient
          .from("profiles")
          .insert([
            {
              id: authData.user.id,
              full_name: name,
              email: email,
            },
          ]);

        if (profileError) throw profileError;

        // Show success message
        showNotification(
          "Account created successfully! Please check your email for verification.",
          "success"
        );
        setTimeout(() => {
          window.location.href = "index.html";
        }, 2000);
      } catch (error) {
        showNotification(error.message, "error");
        // Reset button state
        submitBtn.innerHTML = originalText;
        submitBtn.disabled = false;
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
});
