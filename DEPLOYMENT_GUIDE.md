# AirBear PWA - Production Deployment Guide

## 🚀 Production Readiness Checklist

### ✅ Environment Configuration

1. **Create `.env.production` file** with real credentials:
   ```bash
   cp .env.production .env
   ```

2. **Replace all placeholder credentials** with real values:
   - Stripe live keys (from Stripe Dashboard)
   - Supabase production keys (from Supabase Project Settings)
   - Database connection string
   - Security secrets (generate strong random strings)

### ✅ Database Setup

1. **Supabase Database Schema**:
   ```bash
   # Run database migrations
   npx drizzle-kit push
   ```

2. **Required Tables**:
   - `users` - User profiles and authentication
   - `spots` - Pickup/drop-off locations
   - `airbears` - Vehicle fleet data
   - `rides` - Ride history and tracking
   - `bodega_items` - Onboard store inventory
   - `orders` - Customer orders
   - `payments` - Payment transactions

### ✅ Storage System

The application automatically selects the appropriate storage backend:

- **Production**: Uses `SupabaseStorage` with real database
- **Development**: Uses `MemStorage` with in-memory data
- **Testing**: Uses `MemStorage` with test credentials

### ✅ Deployment Commands

#### Local Production Test:
```bash
NODE_ENV=production npx tsx server/index.ts
```

#### Build for Production:
```bash
npm run build
```

#### Vercel Deployment:
```bash
vercel --prod
```

### ✅ Environment Variables Priority

1. **Production Environment Variables** (highest priority):
   - Set in Vercel/hosting platform
   - Override `.env.production` values

2. **`.env.production` file**:
   - Default production values
   - Should NOT be committed with real secrets

3. **`.env` file** (development only):
   - Local development settings
   - Never used in production

### ✅ Storage Selection Logic

The system automatically determines which storage to use:

```javascript
// Production conditions (uses SupabaseStorage):
- NODE_ENV === 'production'
- Real Supabase credentials provided
- USE_MOCK_DATABASE !== 'true'
- Not using test credentials

// Development conditions (uses MemStorage):
- NODE_ENV === 'development'
- USE_MOCK_DATABASE === 'true'
- Using test credentials
- Missing Supabase credentials
```

### ✅ Health Check Endpoint

Verify production readiness:
```bash
curl https://your-domain.com/api/health
```

Expected response:
```json
{
  "status": "ok",
  "supabaseUrl": "configured",
  "supabaseServiceRoleKey": "configured",
  "stripeSecretKey": "configured"
}
```

### ✅ Critical Production Checks

1. **Database Connection**:
   - Verify Supabase URL and secret key are correct
   - Test database queries in staging first

2. **Payment Processing**:
   - Use real Stripe test keys first
   - Verify webhook endpoints are configured
   - Test payment flows with Stripe test cards

3. **Authentication**:
   - Supabase auth must be properly configured
   - Email templates should be customized
   - Password reset flows must work

4. **Security**:
   - All secrets must be in environment variables
   - CORS must be restricted to your domain
   - Rate limiting should be enabled

### ✅ Monitoring and Maintenance

1. **Logging**:
   - Set `LOG_LEVEL=info` for production
   - Monitor error logs regularly

2. **Performance**:
   - Monitor database query performance
   - Check API response times
   - Scale Supabase as needed

3. **Backups**:
   - Enable Supabase automated backups
   - Test restore procedures
   - Backup critical data regularly

### ✅ Troubleshooting

**Issue: Application uses MemStorage in production**
- Check `.env.production` has real Supabase credentials
- Ensure `USE_MOCK_DATABASE` is not set to `true`
- Verify `NODE_ENV=production`

**Issue: Database connection fails**
- Verify Supabase URL and secret key
- Check network connectivity to Supabase
- Test credentials with Supabase CLI

**Issue: Payments not processing**
- Verify Stripe secret key is correct
- Check Stripe webhook configuration
- Test with Stripe test cards first

## 🎉 Deployment Complete!

Your AirBear PWA is now ready for production use with:
- ✅ Real database persistence
- ✅ Live payment processing
- ✅ Production-ready authentication
- ✅ Scalable architecture
- ✅ Comprehensive monitoring
