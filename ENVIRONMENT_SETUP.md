# AirBear PWA - Production Environment Setup Guide

## =€ Quick Start for Live Production

### 1. Set Environment Variables in Vercel

Go to: https://vercel.com/stephens-projects-8fbc16d0/pwa4/settings/environment-variables

Add these required variables:

```bash
# Stripe Configuration
VITE_STRIPE_PUBLIC_KEY=pk_live_your_real_key
STRIPE_SECRET_KEY=sk_live_your_real_key
STRIPE_WEBHOOK_SECRET=whsec_your_real_key

# Supabase Configuration
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=your_anon_key
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SECRET_KEY=your_service_role_key

# Application Configuration
NODE_ENV=production
USE_MOCK_DATABASE=false
```

### 2. Deploy to Production

```bash
# Force deployment (will work even with missing vars)
npx vercel --prod --force
```

### 3. Verify Deployment

```bash
# Check health endpoint
curl https://pwa41.vercel.app/api/health

# Should return:
# {"status":"ok","supabaseUrl":"configured","supabaseSecretKey":"configured","stripeSecretKey":"configured"}
```

## =' Environment Configuration Options

### Option A: Full Production (Recommended)
- Set all real credentials in Vercel
- Application uses SupabaseStorage with real database
- Full payment processing enabled

### Option B: Development Mode (Fallback)
- Leave variables unset or use test credentials
- Application automatically uses MemStorage
- No database required
- Payment processing in test mode

### Option C: Hybrid Mode
- Set some variables, leave others unset
- Application uses MemStorage for missing services
- Partial functionality

## =Ë Environment Variable Reference

| Variable | Purpose | Required | Fallback |
|----------|---------|----------|----------|
| `VITE_STRIPE_PUBLIC_KEY` | Stripe public key |  | Test mode |
| `STRIPE_SECRET_KEY` | Stripe secret key |  | Test mode |
| `STRIPE_WEBHOOK_SECRET` | Stripe webhook |  | Test mode |
| `VITE_SUPABASE_URL` | Supabase URL |  | MemStorage |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | Supabase anon key |  | MemStorage |
| `SUPABASE_URL` | Supabase URL (server) |  | MemStorage |
| `SUPABASE_SECRET_KEY` | Supabase service key |  | MemStorage |
| `NODE_ENV` | Environment mode |  | development |
| `USE_MOCK_DATABASE` | Force mock database | L | false |

## <¯ Storage System Behavior

```javascript
// Production with real credentials ’ SupabaseStorage (real database)
// Development or missing credentials ’ MemStorage (in-memory)
// Automatic fallback prevents deployment failures
```

## =Ê Deployment Status

**Current Status:**
-  Code fully implemented and tested
-  Local development working perfectly
-  Environment checks configured
- ó Waiting for Vercel environment variables

**Next Steps:**
1. Add real credentials to Vercel dashboard
2. Deploy with `npx vercel --prod --force`
3. Verify all endpoints work in production
4. Monitor system health

## = Quick Links

- **Vercel Dashboard:** https://vercel.com/stephens-projects-8fbc16d0/pwa4
- **Production URL:** https://pwa41.vercel.app
- **API Health:** https://pwa41.vercel.app/api/health
- **Auth Page:** https://pwa41.vercel.app/auth

The application is ready for production! Just add the environment variables and deploy. =€