import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';

const supabase = createClient(
  'https://plypcvnfheiqgrfegitc.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBseXBjdm5maGVpcWdyZmVnaXRjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDcyMTgzMzYsImV4cCI6MjA2Mjc5NDMzNn0.qHKzpoiETnL894GkfKEhwSD1POwYRj_NEaAq_YhXDyA'
);

window.supabase = supabase;