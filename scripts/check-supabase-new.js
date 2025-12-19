import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://fkpvmefbckpyprdgmozj.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZrcHZtZWZiY2tweXByZGdtb3pqIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MDIzMjA1MywiZXhwIjoyMDc1ODA4MDUzfQ.kFtaA-NX0fiqQ6GzejEhEsZvi8ze5fopd-2kAnBfzMI';

console.log('Testing connection to:', supabaseUrl);

const supabase = createClient(supabaseUrl, supabaseKey);

async function check() {
  try {
    // Try to list tables (requires admin/pg rights usually, or just check a public table)
    // We'll check 'spots'
    const { data, error } = await supabase.from('spots').select('*').limit(1);
    
    if (error) {
      console.log('❌ Error querying spots:', error.message);
      // Try authentication check
       const { data: authData, error: authError } = await supabase.auth.admin.listUsers();
       if (authError) {
           console.log('❌ Auth Admin check failed:', authError.message);
       } else {
           console.log('✅ Auth Admin check successful. Users found:', authData.users.length);
       }
    } else {
      console.log('✅ Connected! Spots found:', data.length);
    }
  } catch (e) {
    console.error('❌ Unexpected error:', e);
  }
}

check();
