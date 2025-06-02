import supabase from "./config/supabase.js";

async function testLogin() {
  try {
    console.log("Attempting to login with admin credentials...");

    const { data, error } = await supabase.auth.signInWithPassword({
      email: "admin@fingerpay.com",
      password: "admin123",
    });

    if (error) throw error;

    console.log("✅ Login successful!");
    console.log("User details:", data.user);

    // Test if we can access the users table
    const { data: userData, error: userError } = await supabase
      .from("users")
      .select("email, role")
      .eq("email", "admin@fingerpay.com")
      .single();

    if (userError) throw userError;
    console.log("User data from database:", userData);
  } catch (error) {
    console.error("❌ Login error:", error.message);
  }
}

testLogin();
