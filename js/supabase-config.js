// Initialize Supabase Client
// Replace these with your actual Supabase project URL and anon public key
const SUPABASE_URL = 'https://poqqfpsgfmjofdxfstwz.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBvcXFmcHNnZm1qb2ZkeGZzdHd6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODI3MzMzMTksImV4cCI6MjA5ODMwOTMxOX0.vxRd88o_13v9EZyH2IuHsoOgnhewj0-PycjLzX_tZbY';

// Initialize the client (using the global supabase object from the CDN script)
const supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
