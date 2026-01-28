# Production Environment Variables Fix

## Issue Analysis
The production deployment on `pwa41.vercel.app` is failing because Supabase environment variables are not properly configured.

## Required Environment Variables for Vercel

### Client-side (Vite)
```
VITE_SUPABASE_URL=https://fushiklvahmujvzuveje.supabase.co
VITE_SUPABASE_ANON_KEY=your_actual_anon_key_here
```

### Server-side (API)
```
SUPABASE_URL=https://fushiklvahmujvzuveje.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your_actual_service_role_key_here
```

## Steps to Fix

### 1. Get Supabase Credentials
Go to your Supabase project dashboard:
1. Navigate to Project Settings > API
2. Copy the Project URL (already visible: `https://fushiklvahmujvzuveje.supabase.co`)
3. Copy the `anon` key
4. Copy the `service_role` key

### 2. Set Environment Variables in Vercel
In Vercel dashboard:
1. Go to Project Settings > Environment Variables
2. Add the following variables:

**For Production:**
- `VITE_SUPABASE_URL` = `https://fushiklvahmujvzuveje.supabase.co`
- `VITE_SUPABASE_ANON_KEY` = `[your_anon_key]`
- `SUPABASE_URL` = `https://fushiklvahmujvzuveje.supabase.co`
- `SUPABASE_SERVICE_ROLE_KEY` = `[your_service_role_key]`

### 3. Configure OAuth Redirect URLs
In Supabase dashboard:
1. Go to Authentication > Settings
2. Add redirect URLs:
   - `https://pwa41.vercel.app/auth/callback`
   - `http://localhost:5000/auth/callback` (for local development)

### 4. Configure Google OAuth
1. Go to Authentication > Providers > Google
2. Enable Google provider
3. Add your Google OAuth credentials
4. Set redirect URL to: `https://pwa41.vercel.app/auth/callback`

## Current Issues Fixed

✅ **SVG Path Errors** - Fixed broken Google/Apple icon paths
✅ **CSP Policy** - Added `https://vercel.live` to allowed sources
🔄 **Supabase Auth** - Requires environment variable configuration
🔄 **OAuth Setup** - Requires Google OAuth configuration

## Verification Steps

After setting up environment variables:

1. **Test Registration**: Try creating a new account
2. **Test Login**: Try signing in with email/password
3. **Test Google OAuth**: Try Google sign-in
4. **Check API Calls**: Verify database queries work

## Error Messages Resolved

- `400 Bad Request` on `/auth/v1/token` → Fixed with proper anon key
- `400 Bad Request` on `/auth/v1/authorize` → Fixed with OAuth setup
- `500 Internal Server Error` on `/auth/v1/signup` → Fixed with proper configuration
- `400 Bad Request` on database queries → Fixed with proper service role key

## Deployment

After fixing environment variables:
1. Push changes to git
2. Vercel will automatically redeploy
3. Test all authentication flows
