// Initialize Supabase client
const supabaseUrl = "https://yzwkdfrbotpcvtnnncns.supabase.co";
const supabaseAnonKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl6d2tkZnJib3RwY3Z0bm5uY25zIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDYwMDAxMjcsImV4cCI6MjA2MTU3NjEyN30.d1sADufPth97GQeYOSfjkn2340XIYhPb5_oyz50Ppbg";

const supabase = window.supabase.createClient(supabaseUrl, supabaseAnonKey);

// Fingerprint registration and verification functions
const API_URL = "http://localhost:3002";

async function registerFingerprint(userId) {
  try {
    console.log("Starting fingerprint registration for user:", userId);
    const response = await fetch(`${API_URL}/api/fingerprint/capture`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ userId }),
    });

    const data = await response.json();
    console.log("Server response:", data);

    if (!data.success) {
      throw new Error(data.error || "Failed to register fingerprint");
    }

    return data;
  } catch (error) {
    console.error("Error registering fingerprint:", error);
    if (error.details) {
      console.error("Error details:", error.details);
    }
    throw error;
  }
}

async function verifyFingerprint(userId) {
  try {
    const response = await fetch(`${API_URL}/api/fingerprint/verify`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ userId }),
    });

    const data = await response.json();
    if (!data.success) {
      throw new Error(data.error);
    }

    return data.isMatch;
  } catch (error) {
    console.error("Error verifying fingerprint:", error);
    throw error;
  }
}

// UI Event Handlers
document.addEventListener("DOMContentLoaded", function () {
  const registerBtn = document.getElementById("registerFingerprint");
  const verifyBtn = document.getElementById("verifyFingerprint");
  const statusText = document.getElementById("fingerprintStatus");

  // Check if user is logged in
  async function checkUser() {
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();
    if (error || !user) {
      window.location.href = "index.html"; // Redirect to login if not logged in
      return null;
    }
    return user;
  }

  if (registerBtn) {
    registerBtn.addEventListener("click", async function () {
      try {
        statusText.textContent = "Checking authentication...";
        registerBtn.disabled = true;
        statusText.className = "alert alert-info";

        // Get the current session
        const {
          data: { session },
          error: sessionError,
        } = await supabase.auth.getSession();
        if (sessionError) throw sessionError;

        if (!session) {
          throw new Error("Please log in first");
        }

        // Get user data from the JWT claims
        const { data: userData, error: userError } = await supabase
          .from("users")
          .select("user_id, email, role")
          .eq("email", session.user.email)
          .limit(1)
          .maybeSingle();

        if (userError) {
          console.error("Error fetching user data:", userError);
          throw new Error("Failed to fetch user data");
        }

        if (!userData) {
          throw new Error("User not found in database");
        }

        console.log("Authenticated user:", userData.user_id);
        statusText.textContent = "Place your finger on the scanner...";

        const result = await registerFingerprint(userData.user_id);
        console.log("Registration result:", result);

        statusText.textContent = "Fingerprint registered successfully!";
        statusText.className = "alert alert-success";
      } catch (error) {
        console.error("Registration error:", error);
        statusText.textContent = `Error: ${error.message}`;
        statusText.className = "alert alert-danger";
      } finally {
        registerBtn.disabled = false;
      }
    });
  }

  if (verifyBtn) {
    verifyBtn.addEventListener("click", async function () {
      try {
        statusText.textContent = "Checking authentication...";
        verifyBtn.disabled = true;
        statusText.className = "alert alert-info";

        const user = await checkUser();
        if (!user) return;

        statusText.textContent = "Place your finger on the scanner...";
        const isMatch = await verifyFingerprint(user.id);
        if (isMatch) {
          statusText.textContent = "Fingerprint verified successfully!";
          statusText.className = "alert alert-success";
        } else {
          statusText.textContent = "Fingerprint verification failed!";
          statusText.className = "alert alert-danger";
        }
      } catch (error) {
        statusText.textContent = `Error: ${error.message}`;
        statusText.className = "alert alert-danger";
      } finally {
        verifyBtn.disabled = false;
      }
    });
  }

  // Check authentication on page load
  checkUser().then((user) => {
    if (!user) {
      statusText.textContent = "Please log in first";
      statusText.className = "alert alert-warning";
      registerBtn.disabled = true;
      verifyBtn.disabled = true;
    }
  });
});
