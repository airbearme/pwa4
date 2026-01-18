export default async function handler(req: any, res: any) {
  res.json({
    status: "ok",
    timestamp: new Date().toISOString(),
    supabaseUrl: (process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL) ? "configured" : "missing",
    supabaseSecretKey: (process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY) ? "configured" : "missing",
    stripeSecretKey: (process.env.STRIPE_SECRET_KEY || process.env.VITE_STRIPE_SECRET_KEY) ? "configured" : "missing",
  });
}
