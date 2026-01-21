import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://your-project-ref.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd0b212bXltZmNqc3d2eHVjbGlpIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NTU4Mzk3MywiZXhwIjoyMDcxMTU5OTczfQ.gbAh5_qDmUWiG65qHGUme9RyKOQmLB25LGkSfRw7_BA';

console.log('🔌 Testing Purple Zebra connection...');
console.log('URL:', supabaseUrl);

const supabase = createClient(supabaseUrl, supabaseKey);

async function test() {
  try {
    console.log('Attempting auth check...');
    const { data, error } = await supabase.auth.admin.listUsers();
    
    if (error) {
      console.log('❌ Auth Error:', error.message);
      console.log('Error details:', JSON.stringify(error, null, 2));
    } else {
      console.log('✅ SUCCESS! Connected to Purple Zebra');
      console.log('Users found:', data.users.length);
    }
  } catch (e) {
    console.log('❌ Exception:', e.message);
  }
}

// Retry with delay
setTimeout(() => {
  console.log('\nRetrying after 5 seconds...');
  test();
}, 5000);

test();
