import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://vrlnupietrpmwoxmogdg.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZybG51cGlldHJwbXdveG1vZ2RnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTI2MjY3ODEsImV4cCI6MjA2ODIwMjc4MX0.cBYzQ0MTmc8VRtfJjj-rXMPgZCs38IrcbZbsNG-uwr0';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);