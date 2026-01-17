export default async function handler(req: any, res: any) {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    env: {
      SUPABASE_URL: process.env.SUPABASE_URL ? 'set' : 'missing',
      SUPABASE_SECRET_KEY: process.env.SUPABASE_SECRET_KEY ? 'set' : 'missing',
      STRIPE_SECRET_KEY: process.env.STRIPE_SECRET_KEY ? 'set' : 'missing',
      VITE_SUPABASE_URL: process.env.VITE_SUPABASE_URL ? 'set' : 'missing',
      VITE_SUPABASE_PUBLISHABLE_KEY: process.env.VITE_SUPABASE_PUBLISHABLE_KEY ? 'set' : 'missing',
    }
  });
}
