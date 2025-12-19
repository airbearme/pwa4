import Stripe from 'stripe'
// Cloudflare Pages Function handler type
interface Context {
  request: Request;
  env: Record<string, string>;
}

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

export const onRequestPost = async (context: Context) => {
  try {
    const stripe = new Stripe(context.env.STRIPE_SECRET_KEY as string, {
      apiVersion: '2025-08-27.basil',
    })

    const { amount, currency = 'usd', orderId, rideId, product_type, user_id } = await context.request.json() as any

    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // Convert to cents
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
      JSON.stringify({
        clientSecret: paymentIntent.client_secret,
      }),
      {
        headers: { 'Content-Type': 'application/json', ...corsHeaders },
      }
    )
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', ...corsHeaders },
    })
  }
}

export const onRequestOptions = async () => {
  return new Response(null, {
    headers: {
      ...corsHeaders,
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
    },
  })
}
