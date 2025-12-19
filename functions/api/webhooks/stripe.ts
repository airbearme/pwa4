import Stripe from 'stripe'

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, stripe-signature',
}

export const onRequestPost = async (context: any) => {
    const stripe = new Stripe(context.env.STRIPE_SECRET_KEY as string, {
        apiVersion: '2025-08-27.basil',
    })

    const signature = context.request.headers.get('stripe-signature')
    const webhookSecret = context.env.STRIPE_WEBHOOK_SECRET

    if (!signature || !webhookSecret) {
        return new Response('Missing signature or secret', { status: 400 })
    }

    let event: Stripe.Event
    try {
        const body = await context.request.text()
        event = stripe.webhooks.constructEvent(body, signature, webhookSecret)
    } catch (err: any) {
        return new Response(`Webhook Error: ${err.message}`, { status: 400 })
    }

    // Handle the event
    // Note: We'd need to sync this with Supabase here if we want database updates
    // Since this is a Cloudflare Worker, we use the fetch API to talk to Supabase
    const SUPABASE_URL = context.env.SUPABASE_URL
    const SUPABASE_SERVICE_ROLE_KEY = context.env.SUPABASE_SERVICE_ROLE_KEY

    if (event.type === 'payment_intent.succeeded') {
        const paymentIntent = event.data.object as Stripe.PaymentIntent
        const { orderId, rideId, product_type, user_id } = paymentIntent.metadata

        console.log('Payment succeeded for:', { orderId, rideId, product_type, user_id })

        // If it's a CEO T-shirt, activate it in Supabase
        if (product_type === 'ceo_tshirt' && user_id) {
            await fetch(`${SUPABASE_URL}/rest/v1/users?id=eq.${user_id}`, {
                method: 'PATCH',
                headers: {
                    'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
                    'apikey': SUPABASE_SERVICE_ROLE_KEY,
                    'Content-Type': 'application/json',
                    'Prefer': 'return=minimal'
                },
                body: JSON.stringify({
                    has_ceo_tshirt: true,
                    tshirt_purchase_date: new Date().toISOString()
                })
            })
        }

        // Update ride status if applicable
        if (rideId) {
            await fetch(`${SUPABASE_URL}/rest/v1/rides?id=eq.${rideId}`, {
                method: 'PATCH',
                headers: {
                    'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
                    'apikey': SUPABASE_SERVICE_ROLE_KEY,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ status: 'completed' })
            })
        }

        // Update order status if applicable
        if (orderId) {
            await fetch(`${SUPABASE_URL}/rest/v1/orders?id=eq.${orderId}`, {
                method: 'PATCH',
                headers: {
                    'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
                    'apikey': SUPABASE_SERVICE_ROLE_KEY,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ status: 'completed' })
            })
        }
    }

    return new Response(JSON.stringify({ received: true }), {
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
    })
}

export const onRequestOptions = async () => {
    return new Response(null, {
        headers: {
            ...corsHeaders,
            'Access-Control-Allow-Methods': 'POST, OPTIONS',
        },
    })
}
