import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceRoleKey) {
  console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in the environment.');
  process.exit(1);
}

console.log('Testing Supabase admin access...');

const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

async function test() {
  try {
    const { data, error } = await supabase.auth.admin.listUsers();

    if (error) {
      console.log('Auth error:', error.message);
    } else {
      console.log('Connected. Users found:', data.users.length);
    }
  } catch (e) {
    console.log('Exception:', e.message);
  }
}

test();
