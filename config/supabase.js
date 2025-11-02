const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://asgzcvwmrxwksapxwrqd.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFzZ3pjdndtcnh3a3NhcHh3cnFkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjIwNTY3NDQsImV4cCI6MjA3NzYzMjc0NH0.XZ0E4IIO1vzKdjWauK_V5krIoYxtfeFmsXl-ORSSaFo';

const supabase = createClient(supabaseUrl, supabaseKey);

module.exports = supabase;