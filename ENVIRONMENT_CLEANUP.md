# Environment Variables Cleanup

## ✅ **Clean Environment Variables**

### **Client-Side (VITE_ prefix)**
- `VITE_STRIPE_PUBLIC_KEY` - Stripe public key for React app
- `VITE_SUPABASE_URL` - Supabase URL for React app  
- `VITE_SUPABASE_ANON_KEY` - Supabase anonymous key for React app
- `VITE_SUPABASE_PUBLISHABLE_KEY` - Alternative to ANON_KEY

### **Server-Side (No prefix)**
- `STRIPE_SECRET_KEY` - Stripe secret key for API routes
- `STRIPE_WEBHOOK_SECRET` - Stripe webhook secret for API routes
- `SUPABASE_URL` - Supabase URL for server
- `SUPABASE_SECRET_KEY` - Supabase service role key for server
- `SUPABASE_SERVICE_ROLE_KEY` - Alternative to SECRET_KEY

## ❌ **Removed Bad Keys**
- `VITE_STRIPE_SECRET_KEY` - Server key shouldn't have VITE_ prefix
- `VITE_STRIPE_WEBHOOK_SECRET` - Server key shouldn't have VITE_ prefix
- `SUPABASE_ANON_KEY` - Client key should have VITE_ prefix

## 🎯 **Final Required Variables**

### **For Vercel Dashboard:**
```
VITE_STRIPE_PUBLIC_KEY=pk_live_your_stripe_public_key
STRIPE_SECRET_KEY=sk_live_your_stripe_secret_key  
STRIPE_WEBHOOK_SECRET=whsec_your_stripe_webhook_secret
SUPABASE_URL=https://your_project.supabase.co
SUPABASE_SECRET_KEY=your_supabase_service_role_key
VITE_SUPABASE_URL=https://your_project.supabase.co
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### **Environment Check:**
- ✅ Clean separation of client/server variables
- ✅ No duplicate or conflicting keys
- ✅ Proper naming conventions
- ✅ Clear documentation
