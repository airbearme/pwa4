# Apply Database Fix - Step by Step

## 🚨 Current Issue
**Error:** `"Could not find the 'avatarUrl' column of 'users'"`

## 📋 Step-by-Step Fix

### Step 1: Open Supabase Dashboard
1. Go to: https://supabase.com/dashboard
2. Click on your project: `fushiklvahmujvzuveje`
3. Click on "SQL Editor" in the left sidebar

### Step 2: Apply Corrected Schema
1. Copy the entire contents of `supabase-schema-correct.sql`
2. Paste it into the SQL Editor
3. Click "Run" (or press Ctrl+Enter)

### Step 3: Verify Schema Applied
1. Run this query to verify:
```sql
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'users' 
ORDER BY ordinal_position;
```

You should see columns like:
- avatarUrl (text)
- stripeCustomerId (text)
- ecoPoints (integer)
- totalRides (integer)
- etc.

### Step 4: Test User Registration
1. Visit: https://pwa41.vercel.app/auth
2. Click "Sign Up"
3. Fill out the form:
   - Email: `test@yourdomain.com`
   - Password: `Test123456!`
   - Username: `testuser`
4. Click "Sign Up"

### Step 5: Verify Success
- ✅ Should see "Registration successful" message
- ✅ Should be redirected to login or dashboard
- ✅ User should be created in database

## 🔍 What the Schema Does

The corrected schema:
1. **Drops existing tables** (clean slate)
2. **Creates enums** (user_role, ride_status, etc.)
3. **Creates tables with camelCase columns** (matching app code)
4. **Inserts 17 locations** with descriptions
5. **Inserts sample data** (1 AirBear, 4 bodega items)
6. **Sets up indexes** for performance
7. **Enables RLS** (Row Level Security)
8. **Creates policies** for data access

## 🎯 Expected Results

After applying the schema:
- ✅ User registration works
- ✅ User login works
- ✅ Profile management works
- ✅ All 17 locations display
- ✅ Real-time tracking works
- ✅ Bodega ordering works

## 🚨 Important Notes

- **This will delete all existing data** in the tables
- **Only run once** to apply the fix
- **Backup data first** if you have important data
- **Schema is idempotent** - can be run multiple times safely

## 📞 If Issues Occur

1. **Schema errors:** Check for syntax errors in SQL
2. **Permission errors:** Ensure you have admin access
3. **Connection errors:** Verify Supabase project URL
4. **Registration still fails:** Check browser console for errors

## 🌐 Test After Fix

Once the schema is applied:
1. Test user registration
2. Test user login
3. Test profile updates
4. Test all application features

The database will be perfectly aligned with the application code! 🎉
