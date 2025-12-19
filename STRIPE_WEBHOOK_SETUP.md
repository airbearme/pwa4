# Stripe Webhook Setup Guide - Detailed Instructions

## Overview
Webhooks allow Stripe to notify your server when payment events occur (successful payments, refunds, disputes, etc.). This is critical for production payment processing.

---

## Step-by-Step Setup

### Step 1: Access Stripe Dashboard

1. Go to [Stripe Dashboard](https://dashboard.stripe.com/)
2. **Make sure you're in LIVE mode** (toggle in top-right should say "Live")
   - Test mode webhooks won't work with live payments
   - You'll see a red "LIVE" badge when in live mode

### Step 2: Navigate to Webhooks

1. In the left sidebar, click **"Developers"**
2. Click **"Webhooks"**
3. You'll see a page titled "Webhooks"

### Step 3: Add Endpoint

1. Click the **"Add endpoint"** button (top-right)
2. You'll see a form with several fields

---

## Webhook Configuration

### Endpoint URL

**IMPORTANT:** You need a backend server URL for webhooks. Since IONOS only hosts static files, you have two options:

#### Option A: Deploy Backend to Vercel (Recommended - Free)
```
https://your-app-name.vercel.app/api/webhooks/stripe
```

#### Option B: Use a Webhook Relay Service (Temporary Testing)
```
https://webhook.site/your-unique-id
```
(This is ONLY for testing - not for production)

#### Option C: Deploy to Railway/Render
```
https://your-app.railway.app/api/webhooks/stripe
```

**For now, if you don't have a backend deployed yet:**
- Enter a placeholder: `https://placeholder.com/webhook`
- We'll update it later when you deploy the backend

### Events to Select

Click **"Select events"** and choose these events:

#### ✅ **Payment Events (Required)**
- `payment_intent.succeeded` - Payment completed successfully
- `payment_intent.payment_failed` - Payment failed
- `payment_intent.canceled` - Payment was canceled

#### ✅ **Charge Events (Recommended)**
- `charge.succeeded` - Charge completed
- `charge.failed` - Charge failed
- `charge.refunded` - Charge was refunded

#### ✅ **Dispute Events (Important)**
- `charge.dispute.created` - Customer disputed a charge
- `charge.dispute.closed` - Dispute was resolved

#### ⚠️ **Optional Events**
- `customer.created` - New customer created
- `customer.updated` - Customer info updated
- `invoice.paid` - For subscriptions (not needed for rides)

**Recommended Selection:**
```
✓ payment_intent.succeeded
✓ payment_intent.payment_failed  
✓ charge.succeeded
✓ charge.refunded
✓ charge.dispute.created
```

### API Version

- **Select:** Latest version (should be pre-selected)
- **Current:** `2024-12-18` or similar

### Description (Optional)

```
AirBear Production Webhook - Payment Events
```

---

## Step 4: Save and Get Secret

1. Click **"Add endpoint"**
2. You'll be redirected to the endpoint details page
3. **CRITICAL:** Copy the **Signing secret** (starts with `whsec_...`)
   - Click "Reveal" next to "Signing secret"
   - Click the copy icon
   - This is your `STRIPE_WEBHOOK_SECRET`

**Example:**
```
whsec_1234567890abcdefghijklmnopqrstuvwxyz1234567890abcdefghijklmnop
```

---

## Step 5: Add to Environment Variables

### Update `.env` file:

```bash
# Add this line (replace with your actual secret)
STRIPE_WEBHOOK_SECRET=whsec_your_actual_secret_here
```

**Full Stripe section in `.env` should look like:**
```bash
# Stripe Configuration
VITE_STRIPE_PUBLIC_KEY=pk_live_your_actual_public_key_here
STRIPE_SECRET_KEY=sk_live_your_actual_secret_key_here
STRIPE_WEBHOOK_SECRET=whsec_your_actual_secret_here
```

---

## Step 6: Deploy Backend Server

Your webhook won't work until you have a backend server running. Here's how:

### Option A: Deploy to Vercel (Easiest)

1. Install Vercel CLI:
   ```bash
   npm install -g vercel
   ```

2. Deploy backend:
   ```bash
   cd /home/steve/Projects/pwa4
   vercel
   ```

3. Follow prompts:
   - Project name: `airbear-backend`
   - Directory: `./` (current)
   - Framework: `Other`

4. Get your URL (e.g., `https://airbear-backend.vercel.app`)

5. Update webhook endpoint in Stripe:
   - Go back to Stripe → Developers → Webhooks
   - Click your webhook
   - Click "..." → Update details
   - Change URL to: `https://airbear-backend.vercel.app/api/webhooks/stripe`

### Option B: Deploy to Railway

1. Go to [railway.app](https://railway.app)
2. Connect GitHub repo
3. Deploy `server` directory
4. Get deployment URL
5. Update webhook endpoint

---

## Testing Webhooks

### Test in Stripe Dashboard

1. Go to your webhook in Stripe Dashboard
2. Click **"Send test webhook"**
3. Select event: `payment_intent.succeeded`
4. Click **"Send test webhook"**
5. Check if your server received it

### Test with Stripe CLI (Advanced)

```bash
# Install Stripe CLI
brew install stripe/stripe-cli/stripe

# Login
stripe login

# Forward webhooks to local server
stripe listen --forward-to localhost:5000/api/webhooks/stripe

# Trigger test event
stripe trigger payment_intent.succeeded
```

---

## Webhook Handler Code

Your backend already has webhook handling in `server/routes.ts`:

```typescript
app.post("/api/webhooks/stripe", async (req, res) => {
  const sig = req.headers['stripe-signature'];
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  try {
    const event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      webhookSecret
    );

    // Handle the event
    switch (event.type) {
      case 'payment_intent.succeeded':
        // Update ride status to confirmed
        break;
      case 'payment_intent.payment_failed':
        // Notify user of failure
        break;
      // ... other events
    }

    res.json({ received: true });
  } catch (err) {
    res.status(400).send(`Webhook Error: ${err.message}`);
  }
});
```

---

## Security Best Practices

### ✅ DO:
- Always verify webhook signatures
- Use HTTPS only (Stripe requires it)
- Keep webhook secret in environment variables
- Log webhook events for debugging
- Return 200 status quickly (process async if needed)

### ❌ DON'T:
- Expose webhook secret in code
- Skip signature verification
- Use HTTP (must be HTTPS)
- Take too long to respond (timeout = 30s)

---

## Troubleshooting

### Webhook Not Receiving Events

**Check:**
1. ✅ Endpoint URL is correct and accessible
2. ✅ Server is running and responding
3. ✅ HTTPS is enabled (Stripe requires it)
4. ✅ Firewall allows incoming connections
5. ✅ Webhook secret matches in code

**Test:**
```bash
curl -X POST https://your-backend-url/api/webhooks/stripe
```

### Signature Verification Failing

**Common causes:**
- Wrong webhook secret
- Request body was modified
- Using test secret with live webhooks

**Fix:**
- Copy secret again from Stripe Dashboard
- Ensure raw request body is used (not parsed JSON)

### Events Not Triggering

**Check:**
1. Events are selected in webhook configuration
2. Using live mode (not test mode)
3. Payments are actually completing

---

## Monitoring Webhooks

### In Stripe Dashboard

1. Go to Developers → Webhooks
2. Click your webhook
3. View **"Logs"** tab
4. See all webhook attempts, responses, and errors

### Webhook Logs Show:
- ✅ Timestamp
- ✅ Event type
- ✅ HTTP status code
- ✅ Response time
- ✅ Error messages (if any)

---

## Quick Reference

### Webhook URL Format
```
https://your-backend-domain.com/api/webhooks/stripe
```

### Essential Events
```
payment_intent.succeeded
payment_intent.payment_failed
charge.refunded
charge.dispute.created
```

### Environment Variable
```bash
STRIPE_WEBHOOK_SECRET=whsec_...
```

### Stripe Dashboard URLs
- Webhooks: https://dashboard.stripe.com/webhooks
- API Keys: https://dashboard.stripe.com/apikeys
- Events: https://dashboard.stripe.com/events

---

## Next Steps After Setup

1. ✅ Deploy backend server (Vercel/Railway/Render)
2. ✅ Update webhook endpoint URL in Stripe
3. ✅ Add webhook secret to `.env`
4. ✅ Test with "Send test webhook" in Stripe
5. ✅ Monitor webhook logs for errors
6. ✅ Handle events in your code (update ride status, etc.)

---

## Summary

**What You Need:**
1. Backend server URL (deploy to Vercel/Railway)
2. Webhook secret from Stripe (starts with `whsec_`)
3. Selected events (payment_intent.succeeded, etc.)

**Where to Configure:**
- Stripe: https://dashboard.stripe.com/webhooks
- Code: `server/routes.ts` (already implemented)
- Environment: `.env` file

**Critical:** Webhooks require a live backend server. Your current IONOS hosting only supports static files, so you'll need to deploy the backend separately to Vercel, Railway, or similar.
