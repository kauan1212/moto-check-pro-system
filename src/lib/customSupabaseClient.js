import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://rpsegomkhytxhsatzgyd.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJwc2Vnb21raHl0eGhzYXR6Z3lkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk5MjcyMDcsImV4cCI6MjA2NTUwMzIwN30.It9u5-jVLm9k6MflrISSFWUBv1R2hXFbqiYOgsNAs0Y';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);