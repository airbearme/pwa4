import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceRoleKey) {
  console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in the environment.');
  process.exit(1);
}

async function check() {
  console.log('Testing Supabase credentials for:', supabaseUrl);
  const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

  try {
    const { data, error } = await supabase.from('users').select('id').limit(1);
    if (error) {
      console.log('Error:', error.message);
      const { data: auth, error: authErr } = await supabase.auth.admin.listUsers();
      if (authErr) {
        console.log('Auth error:', authErr.message);
      } else {
        console.log('Auth connected. Users:', auth.users.length);
      }
    } else {
      console.log('Connected. Data access ok');
    }
  } catch (e) {
    console.log('Request failed:', e.message);
  }
}

check();
