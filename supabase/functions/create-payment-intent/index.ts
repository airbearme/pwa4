import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import Stripe from 'https://esm.sh/stripe@14.12.0?target=deno'

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') ?? '', {
    apiVersion: '2023-10-16',
    httpClient: Stripe.createFetchHttpClient(),
})

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders })
    }

    try {
        const { amount, currency = 'usd', orderId, rideId, product_type, user_id } = await req.json()

        const paymentIntent = await stripe.paymentIntents.create({
            amount: Math.round(amount * 100),
            currency,
            metadata: {
                orderId: orderId || '',
                rideId: rideId || '',
                product_type: product_type || '',
                user_id: user_id || ''
            },
            automatic_payment_methods: {
                enabled: true,
            },
        })

        return new Response(
            JSON.stringify({ clientSecret: paymentIntent.client_secret }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
    } catch (error) {
        return new Response(
            JSON.stringify({ error: error.message }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
    }
})
