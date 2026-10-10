/* ============================================
   WM Solutions - Supabase Client
============================================ */

window.SUPABASE_URL = "https://tgosgdygqtbidlfcccns.supabase.co";

window.SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRnb3NnZHlncXRiaWRsZmNjY25zIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTE2NjUxMjgsImV4cCI6MjEwNzI0MTEyOH0.mSPc0fPHW4y5fQLf_OpUd_3aA3CjrAocgzB86YZWksI";

window.wmSupabase = window.supabase.createClient(
    window.SUPABASE_URL,
    window.SUPABASE_ANON_KEY
);