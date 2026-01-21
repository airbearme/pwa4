import { createClient } from '@supabase/supabase-js';

const credentials = [
  {
    name: 'archon-chatty',
    url: 'https://your-project-ref.supabase.co',
    key: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV0enN4Y3Vya3JqZm1hbmhyZ291Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MTc3MDE5NSwiZXhwIjoyMDc3MzQ2MTk1fQ.sWfNSEKOoNWIoYDVomVyXaFIgOr23CSjoR77CePiC3g'
  },
  {
    name: 'supabase-purple-zebra',
    url: 'https://your-project-ref.supabase.co',
    key: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd0b212bXltZmNqc3d2eHVjbGlpIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NTU4Mzk3MywiZXhwIjoyMDcxMTU5OTczfQ.gbAh5_qDmUWiG65qHGUme9RyKOQmLB25LGkSfRw7_BA'
  },
  {
      name: 'airbearme-project',
      url: 'https://your-project-ref.supabase.co',
      key: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inhja2dnZG1xZnFhamF0eXRtaWtvIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NTU2NjQzMSwiZXhwIjoyMDcxMTQyNDMxfQ.xlWcDC0-orIG5CHgExH3WW21r5VBNJcgIM2KATwDhIY'
  }
];

async function check(creds) {
    console.log('Testing:', creds.name, creds.url);
    const supabase = createClient(creds.url, creds.key);
    try {
        const {data, error} = await supabase.from('users').select('id').limit(1);
        if (error) {
             console.log('❌ Error:', error.message);
             // Try auth check
             const {data: auth, error: authErr} = await supabase.auth.admin.listUsers();
             if (authErr) {
                 console.log('❌ Auth Error:', authErr.message);
             } else {
                 console.log('✅ Auth Connected! Users:', auth.users.length);
             }
        } else {
             console.log('✅ Connected! Data access OK');
        }
    } catch (e) {
        console.log('timeout/fetch failed', e.message);
    }
}

async function run() {
    for (const c of credentials) {
        await check(c);
        console.log('---');
    }
}

run();
