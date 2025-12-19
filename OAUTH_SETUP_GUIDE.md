# OAuth Setup Guide for AirBear PWA

## Overview
This guide walks you through setting up Google and Apple OAuth for your AirBear PWA at airbear.me.

## Google OAuth Setup

### Step 1: Create Google Cloud Project
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Click "Select a project" → "New Project"
3. Name: `AirBear PWA`
4. Click "Create"

### Step 2: Enable Google+ API
1. In your project, go to "APIs & Services" → "Library"
2. Search for "Google+ API"
3. Click "Enable"

### Step 3: Create OAuth Credentials
1. Go to "APIs & Services" → "Credentials"
2. Click "Create Credentials" → "OAuth client ID"
3. If prompted, configure OAuth consent screen:
   - User Type: External
   - App name: `AirBear`
   - User support email: Your email
   - Developer contact: Your email
   - Save and Continue through all steps

4. Create OAuth Client ID:
   - Application type: **Web application**
   - Name: `AirBear Web Client`
   - Authorized JavaScript origins:
     ```
     https://airbear.me
     https://fofmrqgcidfenbevayrg.supabase.co
     ```
   - Authorized redirect URIs:
     ```
     https://fofmrqgcidfenbevayrg.supabase.co/auth/v1/callback
     ```
   - Click "Create"

5. **Copy the Client ID and Client Secret** (you'll need these next)

### Step 4: Configure in Supabase
1. Go to: https://supabase.com/dashboard/project/fofmrqgcidfenbevayrg/auth/providers
2. Find "Google" provider
3. Enable it
4. Paste your **Client ID**
5. Paste your **Client Secret**
6. Click "Save"

### Step 5: Test Google Login
1. Go to https://airbear.me/auth
2. Click "Sign in with Google"
3. Authorize the app
4. You should be redirected back and logged in!

---

## Apple Sign In Setup

### Prerequisites
- Apple Developer Account ($99/year)
- Access to https://developer.apple.com

### Step 1: Create App ID
1. Go to [Apple Developer Portal](https://developer.apple.com/account)
2. Navigate to "Certificates, Identifiers & Profiles"
3. Click "Identifiers" → "+" button
4. Select "App IDs" → Continue
5. Select "App" → Continue
6. Description: `AirBear PWA`
7. Bundle ID: `me.airbear.pwa` (or your preferred reverse domain)
8. Scroll to "Sign In with Apple" → Check it
9. Click "Continue" → "Register"

### Step 2: Create Services ID
1. In "Identifiers", click "+" again
2. Select "Services IDs" → Continue
3. Description: `AirBear Web Service`
4. Identifier: `me.airbear.web`
5. Check "Sign In with Apple"
6. Click "Configure" next to "Sign In with Apple"
7. Primary App ID: Select the App ID you created above
8. Domains and Subdomains:
   ```
   airbear.me
   fofmrqgcidfenbevayrg.supabase.co
   ```
9. Return URLs:
   ```
   https://fofmrqgcidfenbevayrg.supabase.co/auth/v1/callback
   ```
10. Click "Save" → "Continue" → "Register"

### Step 3: Create Private Key
1. Go to "Keys" → "+" button
2. Key Name: `AirBear Sign In Key`
3. Check "Sign In with Apple"
4. Click "Configure"
5. Select your Primary App ID
6. Click "Save" → "Continue" → "Register"
7. **Download the .p8 key file** (you can only download once!)
8. Note the **Key ID** shown

### Step 4: Get Team ID
1. Go to "Membership" in the sidebar
2. Copy your **Team ID** (10 characters)

### Step 5: Configure in Supabase
1. Go to: https://supabase.com/dashboard/project/fofmrqgcidfenbevayrg/auth/providers
2. Find "Apple" provider
3. Enable it
4. Fill in:
   - **Services ID**: `me.airbear.web` (from Step 2)
   - **Team ID**: Your 10-character Team ID
   - **Key ID**: From the key you created
   - **Private Key**: Open the .p8 file in a text editor, copy the entire contents
5. Click "Save"

### Step 6: Test Apple Sign In
1. Go to https://airbear.me/auth
2. Click "Sign in with Apple"
3. Authorize the app
4. You should be redirected back and logged in!

---

## Troubleshooting

### Google OAuth Issues

**Error: "redirect_uri_mismatch"**
- Check that `https://fofmrqgcidfenbevayrg.supabase.co/auth/v1/callback` is in your authorized redirect URIs
- Make sure there are no trailing slashes

**Error: "Access blocked: This app's request is invalid"**
- Complete the OAuth consent screen configuration
- Add test users if app is in testing mode

### Apple Sign In Issues

**Error: "invalid_client"**
- Verify Services ID matches exactly
- Check that domains are configured correctly
- Ensure .p8 key is copied completely (including BEGIN/END lines)

**Error: "unauthorized_client"**
- Make sure Sign In with Apple is enabled for both App ID and Services ID
- Verify return URLs match exactly

### General Issues

**Users not appearing in Supabase**
- Check Authentication → Users in Supabase dashboard
- Verify email confirmation is not required (or is handled)

**Redirect not working**
- Clear browser cache
- Try incognito/private mode
- Check browser console for errors

---

## Security Best Practices

1. **Never commit OAuth secrets to Git**
   - Keep them in Supabase dashboard only
   - Use environment variables for any server-side code

2. **Use HTTPS only**
   - OAuth will not work over HTTP
   - airbear.me already has HTTPS ✓

3. **Limit OAuth scopes**
   - Only request email and profile
   - Don't ask for unnecessary permissions

4. **Monitor OAuth usage**
   - Check Google Cloud Console quotas
   - Review Apple Developer Console analytics

---

## Next Steps After Setup

Once OAuth is configured:

1. **Update Auth UI** (optional):
   - Add Google/Apple buttons to login page
   - Customize button styling

2. **Handle User Profiles**:
   - User data automatically syncs to Supabase
   - Profile photos from Google/Apple are available

3. **Test Thoroughly**:
   - Test on mobile devices
   - Test with different accounts
   - Verify logout works correctly

---

## Cost Summary

- **Google OAuth**: Free (no cost)
- **Apple Sign In**: Requires Apple Developer Program ($99/year)
- **Supabase Auth**: Free tier includes OAuth

---

## Support Resources

- [Supabase Auth Docs](https://supabase.com/docs/guides/auth)
- [Google OAuth Documentation](https://developers.google.com/identity/protocols/oauth2)
- [Apple Sign In Documentation](https://developer.apple.com/sign-in-with-apple/)

---

## Quick Reference

### Supabase Auth Providers URL
```
https://supabase.com/dashboard/project/fofmrqgcidfenbevayrg/auth/providers
```

### Redirect URI (for all providers)
```
https://fofmrqgcidfenbevayrg.supabase.co/auth/v1/callback
```

### Authorized Origins
```
https://airbear.me
https://fofmrqgcidfenbevayrg.supabase.co
```
