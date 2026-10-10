/* ============================================
   WM Solutions - Supabase Client
============================================ */

const SUPABASE_URL = "https://tgosgdygqtbidlfcccns.supabase.co"; // ← غيّر ده
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRnb3NnZHlncXRiaWRsZmNjY25zIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTE2NjUxMjgsImV4cCI6MjEwNzI0MTEyOH0.mSPc0fPHW4y5fQLf_OpUd_3aA3CjrAocgzB86YZWksI"; // ← غيّر ده

const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

window.supabaseClient = supabase;