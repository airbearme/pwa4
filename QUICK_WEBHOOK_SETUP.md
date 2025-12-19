# Quick Stripe Webhook Setup - Copy & Paste Guide

You're already at: https://dashboard.stripe.com/acct_1RzDHKKPp8gF577P/workbench/webhooks/create

## Step 1: Endpoint URL

**Copy this URL and paste it in the "Endpoint URL" field:**
```
https://placeholder.airbear.me/api/webhooks/stripe
```

(We'll update this later when you deploy your backend)

---

## Step 2: Select Events

Click the **"Select events"** button, then select these 5 events:

### ✅ Check These Boxes:

1. **payment_intent.succeeded**
2. **payment_intent.payment_failed**
3. **charge.succeeded**
4. **charge.refunded**
5. **charge.dispute.created**

**Tip:** Use the search box to find them quickly. Type "payment_intent" to see the first two, then "charge" for the others.

---

## Step 3: Add Endpoint

Click the **"Add endpoint"** button at the bottom of the page.

---

## Step 4: Get Your Webhook Secret

After clicking "Add endpoint", you'll be redirected to a new page showing your webhook details.

1. Look for the section labeled **"Signing secret"**
2. Click the **"Reveal"** button
3. Click the **copy icon** to copy the secret
4. It will look like: `whsec_...` (starts with "whsec_")

---

## Step 5: Add to Your .env File

Open `/home/steve/Projects/pwa4/.env` and add this line:

```bash
STRIPE_WEBHOOK_SECRET=whsec_paste_your_secret_here
```

**Replace `whsec_paste_your_secret_here` with the actual secret you copied.**

---

## ✅ Done!

Your webhook is configured. When you deploy your backend server later, you'll update the endpoint URL from `https://placeholder.airbear.me/api/webhooks/stripe` to your actual backend URL.

---

## What You Should See:

After adding the endpoint, the Stripe page should show:
- ✅ Endpoint URL: https://placeholder.airbear.me/api/webhooks/stripe
- ✅ Events: 5 selected
- ✅ Status: Active (but will show errors until backend is deployed)
- ✅ Signing secret: whsec_... (revealed)

---

## Next: Deploy Backend

To make webhooks actually work, you need to deploy your backend server. See `STRIPE_WEBHOOK_SETUP.md` for full instructions on deploying to Vercel (free).
