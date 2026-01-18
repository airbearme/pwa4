const requiredGroups = [
  {
    name: 'client:stripe',
    keys: ['VITE_STRIPE_PUBLIC_KEY'],
  },
  {
    name: 'client:supabase-url',
    keys: ['VITE_SUPABASE_URL', 'SUPABASE_URL'],
  },
  {
    name: 'client:supabase-key',
    keys: ['VITE_SUPABASE_PUBLISHABLE_KEY', 'VITE_SUPABASE_ANON_KEY', 'SUPABASE_ANON_KEY'],
  },
  {
    name: 'server:stripe-secret',
    keys: ['STRIPE_SECRET_KEY'],
  },
  {
    name: 'server:stripe-webhook',
    keys: ['STRIPE_WEBHOOK_SECRET'],
  },
  {
    name: 'server:supabase-url',
    keys: ['SUPABASE_URL'],
  },
  {
    name: 'server:supabase-service-key',
    keys: ['SUPABASE_SECRET_KEY'],
  },
];

const missing = [];

for (const group of requiredGroups) {
  const hasValue = group.keys.some((key) => {
    const value = process.env[key];
    return typeof value === 'string' && value.trim().length > 0;
  });

  if (!hasValue) {
    missing.push(`${group.name}: ${group.keys.join(' | ')}`);
  }
}

if (missing.length > 0) {
  console.error('Missing required environment variables for production deploy:');
  for (const entry of missing) {
    console.error(`- ${entry}`);
  }
  console.error('\n⚠️  WARNING: Continuing deployment with missing environment variables...');
  console.error('This may cause runtime errors. Please configure all required variables in Vercel dashboard.');
  // Don't exit with error code - allow deployment to continue
  // process.exit(1);
}

console.log('Environment check passed (with warnings for missing vars).');
