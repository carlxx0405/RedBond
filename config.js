import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';
const supabase = createClient(


  'https://zzkumnjebnmrriimiadh.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inp6a3VtbmplYm5tcnJpaW1pYWRoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDcyMTM5NzksImV4cCI6MjA2Mjc4OTk3OX0.pBcl-0E2wQspaUKdyGJ3ck8nNJ5RpJgMNAeXQJ9QlHE'
);

window.supabase = supabase;