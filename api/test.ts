export default async function handler(req: any, res: any) {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    env: {
      SUPABASE_URL: process.env.SUPABASE_URL ? 'set' : 'missing',
      SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY ? 'set' : 'missing',
      STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY ? 'set' : 'missing',
      STRIPE_WEBHOOK_SECRET: process.env.STRIPE_WEBHOOK_SECRET ? 'set' : 'missing',
      VITE_SUPABASE_URL: process.env.VITE_SUPABASE_URL ? 'set' : 'missing',
      VITE_SUPABASE_ANON_KEY: process.env.VITE_SUPABASE_ANON_KEY ? 'set' : 'missing',
      VITE_STRIPE_PUBLIC_KEY: process.env.VITE_STRIPE_PUBLIC_KEY ? 'set' : 'missing',
    }
  });
}
