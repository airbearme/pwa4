import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceRoleKey) {
  console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in the environment.');
  process.exit(1);
}

console.log('Testing Supabase connection to:', supabaseUrl);

const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

async function check() {
  try {
    const { data, error } = await supabase.from('spots').select('*').limit(1);

    if (error) {
      console.log('Error querying spots:', error.message);
      const { data: authData, error: authError } = await supabase.auth.admin.listUsers();
      if (authError) {
        console.log('Auth admin check failed:', authError.message);
      } else {
        console.log('Auth admin check successful. Users found:', authData.users.length);
      }
    } else {
      console.log('Connected. Spots found:', data.length);
    }
  } catch (e) {
    console.error('Unexpected error:', e.message);
  }
}

check();
