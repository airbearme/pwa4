import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import Stripe from 'https://esm.sh/stripe@14.12.0?target=deno'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.1'

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') ?? '', {
    apiVersion: '2023-10-16',
    httpClient: Stripe.createFetchHttpClient(),
})

const supabase = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SECRET_KEY') ?? ''
)

serve(async (req) => {
    const signature = req.headers.get('stripe-signature')
    const webhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET')

    if (!signature || !webhookSecret) {
        return new Response('Missing signature or secret', { status: 400 })
    }

    try {
        const body = await req.text()
        const event = stripe.webhooks.constructEvent(body, signature, webhookSecret)

        if (event.type === 'payment_intent.succeeded') {
            const paymentIntent = event.data.object as Stripe.PaymentIntent
            const { orderId, rideId, product_type, user_id } = paymentIntent.metadata

            console.log(`Payment succeeded for user ${user_id}`)

            if (product_type === 'ceo_tshirt' && user_id) {
                await supabase
                    .from('users')
                    .update({ has_ceo_tshirt: true, tshirt_purchase_date: new Date().toISOString() })
                    .eq('id', user_id)
            }

            if (rideId) {
                await supabase
                    .from('rides')
                    .update({ status: 'completed' })
                    .eq('id', rideId)
            }

            if (orderId) {
                await supabase
                    .from('orders')
                    .update({ status: 'completed' })
                    .eq('id', orderId)
            }
        }

        return new Response(JSON.stringify({ received: true }), {
            headers: { 'Content-Type': 'application/json' },
        })
    } catch (err) {
        return new Response(`Webhook Error: ${err.message}`, { status: 400 })
    }
})
