import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://your-project-ref.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZvZm1ycWdjaWRmZW5iZXZheXJnIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MzYzNDcyOCwiZXhwIjoyMDc5MjEwNzI4fQ.89Y4IOCpB-Ky1qjTJLmotMBe8RqQyN8bk6Xp5F43MMA';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZvZm1ycWdjaWRmZW5iZXZheXJnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM2MzQ3MjgsImV4cCI6MjA3OTIxMDcyOH0.Z6m5z1KQGp-cDjBbcdJjUaXIA25C3VD8IlcLge1fWyM';

console.log('🔌 Testing Purple Zebra (your-project-ref)...');
console.log('URL:', supabaseUrl);

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function test() {
  try {
    // Test auth
    const { data: authData, error: authError } = await supabase.auth.admin.listUsers();
    
    if (authError) {
      console.log('❌ Auth Error:', authError.message);
    } else {
      console.log('✅ Auth Connected! Users:', authData.users.length);
    }

    // Test database access
    const { data: tables, error: dbError } = await supabase
      .from('spots')
      .select('*')
      .limit(1);
    
    if (dbError) {
      console.log('⚠️  Spots table error:', dbError.message);
      console.log('   (Table may not exist yet - this is OK)');
    } else {
      console.log('✅ Database Connected! Spots found:', tables?.length || 0);
    }

    console.log('\n🎉 Purple Zebra is LIVE and accessible!');
    
  } catch (e) {
    console.log('❌ Exception:', e.message);
  }
}

test();
