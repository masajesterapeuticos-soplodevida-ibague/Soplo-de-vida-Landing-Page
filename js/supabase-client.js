// ===== Cliente de Supabase =====
// Estas llaves son PÚBLICAS. La seguridad real la da el RLS en Supabase.

const SUPABASE_URL = 'https://xckcljkaiskesnucishi.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inhja2NsamthaXNrZXNudWNpc2hpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTIxNzY3MTYsImV4cCI6MjEwNzc1MjcxNn0._Ub7ZX1xgq1OAQqFRK7XFiZv4obNIPeBci-6k3l9zeg';

// Creamos el cliente y lo hacemos global para usarlo en script.js
window.supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);