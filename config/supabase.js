import { createClient } from "@supabase/supabase-js";

// Supabase configuration
const supabaseUrl = "https://yzwkdfrbotpcvtnnncns.supabase.co";
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inl6d2tkZnJib3RwY3Z0bm5uY25zIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDYwMDAxMjcsImV4cCI6MjA2MTU3NjEyN30.d1sADufPth97GQeYOSfjkn2340XIYhPb5_oyz50Ppbg";

// Create Supabase client
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export default supabase;
