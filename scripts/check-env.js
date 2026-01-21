const requiredGroups = [
  {
    name: 'client:stripe',
    keys: ['VITE_STRIPE_PUBLIC_KEY'],
  },
  {
    name: 'client:supabase-url',
    keys: ['VITE_SUPABASE_URL'],
  },
  {
    name: 'client:supabase-key',
    keys: ['VITE_SUPABASE_ANON_KEY'],
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
    keys: ['SUPABASE_SERVICE_ROLE_KEY'],
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
  console.warn('⚠️  Missing some environment variables for production deploy:');
  for (const entry of missing) {
    console.warn(`  - ${entry}`);
  }
  console.warn('\n⚠️  WARNING: Continuing deployment with missing environment variables...');
  console.warn('The application will use MemStorage for development. Configure all required variables in Vercel dashboard for full production functionality.');
} else {
  console.log('✅ All environment variables configured for production!');
}

console.log('Environment check completed. Proceeding with build...');
