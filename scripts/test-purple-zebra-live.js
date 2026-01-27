import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceRoleKey) {
  console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in the environment.');
  process.exit(1);
}

console.log('Testing Supabase connection...');
console.log('URL:', supabaseUrl);

const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

async function test() {
  try {
    const { data: authData, error: authError } = await supabase.auth.admin.listUsers();

    if (authError) {
      console.log('Auth error:', authError.message);
    } else {
      console.log('Auth connected. Users:', authData.users.length);
    }

    const { data: tables, error: dbError } = await supabase
      .from('spots')
      .select('*')
      .limit(1);

    if (dbError) {
      console.log('Spots table error:', dbError.message);
    } else {
      console.log('Database connected. Spots found:', tables?.length || 0);
    }
  } catch (e) {
    console.log('Exception:', e.message);
  }
}

test();
