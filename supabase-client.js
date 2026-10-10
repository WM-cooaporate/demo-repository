/* ============================================
   WM Solutions - Supabase Client
============================================ */

// ✅ URL الحقيقي
const SUPABASE_URL = "https://tgosgdygqtbidlfcccns.supabase.co";

// ✅ anon public key (اللي في الصورة التانية - السطر الأول)
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...";

// ✅ اسم مختلف لتجنب التعارض
const wmSupabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);