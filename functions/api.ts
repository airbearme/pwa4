import { IttyRouter, json, ThrowableRouter, withParams, IRequest } from 'itty-router';
import Stripe from 'stripe';
import { getStorage } from '../server/storage';
import { insertRideSchema, insertOrderSchema, insertPaymentSchema } from '../shared/schema';
import { z } from 'zod';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Define a type for our requests that includes the env
export type RequestWithEnv = IRequest & {
  env: {
    DATABASE_URL: string;
    SUPABASE_URL: string;
    SUPABASE_SERVICE_ROLE_KEY: string;
    STRIPE_SECRET_KEY: string;
    STRIPE_WEBHOOK_SECRET: string;
  };
};

let stripe: Stripe;
let supabaseAdmin: SupabaseClient;

const router = IttyRouter<RequestWithEnv>();

// Middleware to initialize services
const withServices = (request: RequestWithEnv) => {
  if (!stripe) {
    if (!request.env.STRIPE_SECRET_KEY) {
      throw new Error('STRIPE_SECRET_KEY is required.');
    }
    stripe = new Stripe(request.env.STRIPE_SECRET_KEY, {
      apiVersion: '2025-08-27.basil',
      httpClient: Stripe.createFetchHttpClient(), // Important for workers
    });
  }

  if (!supabaseAdmin) {
    if (!request.env.SUPABASE_URL || !request.env.SUPABASE_SERVICE_ROLE_KEY) {
      console.warn('⚠️ Supabase admin client not configured.');
    } else {
      supabaseAdmin = createClient(request.env.SUPABASE_URL, request.env.SUPABASE_SERVICE_ROLE_KEY, { auth: { autoRefreshToken: false } });
    }
  }
};

router.all('*', withServices);

const profileSchema = z.object({
  email: z.string().email(),
  username: z.string().min(2),
  fullName: z.string().optional().nullable(),
  role: z.enum(['user', 'driver', 'admin']).optional(),
  avatarUrl: z.string().url().optional().nullable(),
});

const ensureUserProfile = async (request: RequestWithEnv, payload: z.infer<typeof profileSchema>) => {
  const storage = getStorage(request.env.DATABASE_URL);
  const existingUser = await storage.getUserByEmail(payload.email);
  if (existingUser) {
    return storage.updateUser(existingUser.id, {
      username: payload.username,
      fullName: payload.fullName ?? null,
      avatarUrl: payload.avatarUrl ?? null,
      role: payload.role || existingUser.role,
    });
  }

  return storage.createUser({
    email: payload.email,
    username: payload.username,
    fullName: payload.fullName ?? null,
    avatarUrl: payload.avatarUrl ?? null,
    role: payload.role || 'user',
    ecoPoints: 0,
    totalRides: 0,
    co2Saved: '0',
  });
};

router.post('/api/auth/register', async (request: RequestWithEnv) => {
  try {
    if (!supabaseAdmin) {
      return new Response(JSON.stringify({ message: 'Supabase is not configured.' }), { status: 500 });
    }
    const storage = getStorage(request.env.DATABASE_URL);
    const body = await request.json();
    const userData = profileSchema.extend({ password: z.string().min(6) }).parse(body);
    const { data, error } = await supabaseAdmin.auth.admin.createUser({
      email: userData.email,
      password: userData.password,
      email_confirm: true,
      user_metadata: {
        username: userData.username,
        role: userData.role || 'user',
        fullName: userData.fullName,
      },
    });

    if (error) throw error;
    const profile = await ensureUserProfile(request, {
      email: userData.email,
      username: userData.username,
      fullName: userData.fullName,
      role: (data.user?.user_metadata?.role as 'user' | 'driver' | 'admin') || userData.role || 'user',
      avatarUrl: null,
    });

    return json({ user: { id: profile.id, email: profile.email, username: profile.username, role: profile.role } });
  } catch (error: any) {
    return new Response(JSON.stringify({ message: error.message }), { status: 400 });
  }
});

router.post('/api/auth/login', async (request: RequestWithEnv) => {
  try {
    if (!supabaseAdmin) {
      return new Response(JSON.stringify({ message: 'Supabase is not configured.' }), { status: 500 });
    }

    const body = await request.json();
    const { email, password } = z.object({
      email: z.string().email(),
      password: z.string().min(6),
    }).parse(body);

    const { data, error } = await supabaseAdmin.auth.signInWithPassword({ email, password });
    if (error || !data.user) {
      return new Response(JSON.stringify({ message: error?.message || 'Invalid credentials' }), { status: 401 });
    }

    const profile = await ensureUserProfile(request, {
      email,
      username: (data.user.user_metadata?.username as string) || email.split('@')[0],
      fullName: (data.user.user_metadata?.fullName as string | undefined) || null,
      role: (data.user.user_metadata?.role as 'user' | 'driver' | 'admin' | undefined) || 'user',
      avatarUrl: (data.user.user_metadata?.avatar_url as string | undefined) || null,
    });

    return json({ user: { id: profile.id, email: profile.email, username: profile.username, role: profile.role } });
  } catch (error: any) {
    return new Response(JSON.stringify({ message: error.message }), { status: 400 });
  }
});

router.post('/api/auth/sync-profile', async (request: RequestWithEnv) => {
  try {
    if (!supabaseAdmin) {
      return new Response(JSON.stringify({ message: 'Supabase is not configured.' }), { status: 500 });
    }

    const body = await request.json();
    const payload = profileSchema.parse(body);
    const profile = await ensureUserProfile(request, payload);
    return json({ user: profile });
  } catch (error: any) {
    return new Response(JSON.stringify({ message: error.message }), { status: 400 });
  }
});

// Spots routes
router.get('/api/spots', async (request: RequestWithEnv) => {
  try {
    const storage = getStorage(request.env.DATABASE_URL);
    const spots = await storage.getAllSpots();
    return json(spots);
  } catch (error: any) {
    return new Response(JSON.stringify({ message: error.message }), { status: 500 });
  }
});

// Rickshaws routes
router.get('/api/rickshaws', async (request: RequestWithEnv) => {
  try {
    const storage = getStorage(request.env.DATABASE_URL);
    const rickshaws = await storage.getAllAirbears();
    return json(rickshaws);
  } catch (error: any) {
    return new Response(JSON.stringify({ message: error.message }), { status: 500 });
  }
});

router.get('/api/rickshaws/available', async (request: RequestWithEnv) => {
  try {
    const storage = getStorage(request.env.DATABASE_URL);
    const rickshaws = await storage.getAvailableAirbears();
    return json(rickshaws);
  } catch (error: any) {
    return new Response(JSON.stringify({ message: error.message }), { status: 500 });
  }
});

// Rides routes
router.post('/api/rides', async (request: RequestWithEnv) => {
  try {
    const storage = getStorage(request.env.DATABASE_URL);
    const body = await request.json();
    const rideData = insertRideSchema.parse(body);
    const ride = await storage.createRide(rideData);
    return json(ride);
  } catch (error: any) {
    return new Response(JSON.stringify({ message: error.message }), { status: 400 });
  }
});

router.get('/api/rides/user/:userId', withParams, async (request: RequestWithEnv & { params: { userId: string } }) => {
  try {
    const storage = getStorage(request.env.DATABASE_URL);
    const rides = await storage.getRidesByUser(request.params.userId);
    return json(rides);
  } catch (error: any) {
    return new Response(JSON.stringify({ message: error.message }), { status: 500 });
  }
});

router.patch('/api/rides/:id', withParams, async (request: RequestWithEnv & { params: { id: string } }) => {
  try {
    const storage = getStorage(request.env.DATABASE_URL);
    const updates = await request.json();
    const ride = await storage.updateRide(request.params.id, updates);
    return json(ride);
  } catch (error: any) {
    return new Response(JSON.stringify({ message: error.message }), { status: 400 });
  }
});

// Bodega routes
router.get('/api/bodega/items', async (request: RequestWithEnv) => {
  try {
    const storage = getStorage(request.env.DATABASE_URL);
    const url = new URL(request.url);
    const category = url.searchParams.get('category');
    const items = category
      ? await storage.getBodegaItemsByCategory(category as string)
      : await storage.getAllBodegaItems();
    return json(items);
  } catch (error: any) {
    return new Response(JSON.stringify({ message: error.message }), { status: 500 });
  }
});

// Orders routes
router.post('/api/orders', async (request: RequestWithEnv) => {
  try {
    const storage = getStorage(request.env.DATABASE_URL);
    const body = await request.json();
    const orderData = insertOrderSchema.parse({
      ...body,
      totalAmount:
        typeof body?.totalAmount === 'number'
          ? body.totalAmount.toFixed(2)
          : body?.totalAmount,
    });
    const order = await storage.createOrder(orderData);
    return json(order);
  } catch (error: any) {
    return new Response(JSON.stringify({ message: error.message }), { status: 400 });
  }
});

router.get('/api/orders/user/:userId', withParams, async (request: RequestWithEnv) => {
  try {
    const storage = getStorage(request.env.DATABASE_URL);
    const orders = await storage.getOrdersByUser(request.params.userId);
    return json(orders);
  } catch (error: any) {
    return new Response(JSON.stringify({ message: error.message }), { status: 500 });
  }
});

// Stripe payment routes
router.post('/api/create-payment-intent', async (request: RequestWithEnv) => {
  try {
    const { amount, orderId, rideId, paymentMethod = 'stripe' } = await request.json();

    if (!amount || amount <= 0) {
      return new Response(JSON.stringify({ message: 'Invalid amount' }), { status: 400 });
    }

    let paymentIntent;

    if (paymentMethod === 'cash') {
      const qrData = {
        orderId,
        rideId,
        amount,
        timestamp: Date.now(),
        method: 'cash',
      };

      return json({
        qrCode: btoa(JSON.stringify(qrData)),
        paymentMethod: 'cash',
      });
    } else {
      paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(amount * 100),
        currency: 'usd',
        automatic_payment_methods: {
          enabled: true,
        },
        metadata: {
          orderId: orderId || '',
          rideId: rideId || '',
        },
      });

      return json({
        clientSecret: paymentIntent.client_secret,
        paymentIntentId: paymentIntent.id,
      });
    }
  } catch (error: any) {
    return new Response(JSON.stringify({ message: 'Error creating payment intent: ' + error.message }), { status: 500 });
  }
});

// Payment confirmation
router.post('/api/payments/confirm', async (request: RequestWithEnv) => {
  try {
    const storage = getStorage(request.env.DATABASE_URL);
    const body = await request.json();
    const paymentData = insertPaymentSchema.parse(body);
    const payment = await storage.createPayment(paymentData);
    return json(payment);
  } catch (error: any) {
    return new Response(JSON.stringify({ message: error.message }), { status: 400 });
  }
});

// CEO T-shirt purchase route
router.post('/api/ceo-tshirt/purchase', async (request: RequestWithEnv) => {
  try {
    const { userId, size } = await request.json();

    const paymentIntent = await stripe.paymentIntents.create({
      amount: 10000,
      currency: 'usd',
      automatic_payment_methods: {
        enabled: true,
      },
      metadata: {
        product_type: 'ceo_tshirt',
        user_id: userId,
        size: size,
        unlimited_rides: 'true',
        non_transferable: 'true',
      },
    });

    return json({
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
    });
  } catch (error: any) {
    return new Response(JSON.stringify({ message: 'Error creating CEO T-shirt payment: ' + error.message }), { status: 500 });
  }
});

// Free ride validation for CEO T-shirt holders
router.get('/api/users/:userId/free-ride-status', withParams, async (request: RequestWithEnv) => {
  try {
    const storage = getStorage(request.env.DATABASE_URL);
    const user = await storage.getUser(request.params.userId);

    if (!user) {
      return new Response(JSON.stringify({ message: 'User not found' }), { status: 404 });
    }

    if (!user.hasCeoTshirt) {
      return json({
        canRideFree: false,
        reason: 'No CEO T-shirt purchased',
      });
    }

    const today = new Date().toISOString().split('T')[0];
    const todayRides = await storage.getRidesByUserAndDate(request.params.userId, today);
    const freeRidesToday = todayRides.filter((ride) => ride.isFreeTshirtRide);

    if (freeRidesToday.length > 0) {
      return json({
        canRideFree: false,
        reason: 'Daily free ride already used',
      });
    }

    return json({ canRideFree: true });
  } catch (error: any) {
    return new Response(JSON.stringify({ message: error.message }), { status: 500 });
  }
});

// Webhook for Stripe
router.post('/api/webhooks/stripe', async (request: RequestWithEnv) => {
  try {
    const storage = getStorage(request.env.DATABASE_URL);
    const sig = request.headers.get('stripe-signature');
    const endpointSecret = request.env.STRIPE_WEBHOOK_SECRET;

    if (!sig || !endpointSecret) {
      return new Response(JSON.stringify({ message: 'Missing signature or webhook secret' }), { status: 400 });
    }

    let event;
    try {
      const body = await request.text();
      event = await stripe.webhooks.constructEventAsync(body, sig, endpointSecret);
    } catch (err: any) {
      return new Response(JSON.stringify({ message: `Webhook signature verification failed: ${err.message}` }), { status: 400 });
    }

    switch (event.type) {
      case 'payment_intent.succeeded':
        const paymentIntent = event.data.object;
        console.log('PaymentIntent succeeded:', paymentIntent.id);

        if (paymentIntent.metadata?.product_type === 'ceo_tshirt') {
          const userId = paymentIntent.metadata.user_id;
          if (userId) {
            await storage.updateUser(userId, {
              hasCeoTshirt: true,
              tshirtPurchaseDate: new Date(),
            });
            console.log('CEO T-shirt activated for user:', userId);
          }
        }

        const metadata = paymentIntent.metadata;
        if (metadata?.orderId || metadata?.rideId) {
          if (metadata.orderId) {
            await storage.updateOrder(metadata.orderId, { status: 'completed' });
          }
          if (metadata.rideId) {
            await storage.updateRide(metadata.rideId, { status: 'completed' });
          }
        }
        break;

      case 'payment_intent.payment_failed':
        const failedPayment = event.data.object;
        console.log('PaymentIntent failed:', failedPayment.id);
        break;

      default:
        console.log(`Unhandled event type ${event.type}`);
    }

    return json({ received: true });
  } catch (error: any) {
    return new Response(JSON.stringify({ message: error.message }), { status: 500 });
  }
});

// Analytics routes
router.get('/api/analytics/overview', async (request: RequestWithEnv) => {
  try {
    const storage = getStorage(request.env.DATABASE_URL);
    const spots = await storage.getAllSpots();
    const airbears = await storage.getAllAirbears();
    const activeAirbears = airbears.filter((a) => a.isAvailable && !a.isCharging);
    const chargingAirbears = airbears.filter((a) => a.isCharging);
    const maintenanceAirbears = airbears.filter((a) => a.maintenanceStatus !== 'good');

    const analytics = {
      totalSpots: spots.length,
      totalAirbears: airbears.length,
      activeAirbears: activeAirbears.length,
      chargingAirbears: chargingAirbears.length,
      maintenanceAirbears: maintenanceAirbears.length,
      averageBatteryLevel: airbears.length > 0
        ? Math.round(airbears.reduce((sum, a) => sum + a.batteryLevel, 0) / airbears.length)
        : 0,
    };

    return json(analytics);
  } catch (error: any) {
    return new Response(JSON.stringify({ message: error.message }), { status: 500 });
  }
});

// Push Notification Subscription Management
router.post('/api/push-subscriptions', async (request: RequestWithEnv) => {
  try {
    const { subscription, preferences } = await request.json();

    if (!subscription || !preferences) {
      return new Response(JSON.stringify({ message: 'Subscription and preferences required' }), { status: 400 });
    }

    console.log('Push subscription registered:', {
      endpoint: subscription.endpoint,
      preferences,
    });

    return json({
      success: true,
      message: 'Push subscription registered successfully',
    });
  } catch (error: any) {
    return new Response(JSON.stringify({ message: error.message }), { status: 500 });
  }
});

router.patch('/api/push-subscriptions', async (request: RequestWithEnv) => {
  try {
    const { endpoint, preferences } = await request.json();

    if (!endpoint || !preferences) {
      return new Response(JSON.stringify({ message: 'Endpoint and preferences required' }), { status: 400 });
    }

    console.log('Push preferences updated:', {
      endpoint,
      preferences,
    });

    return json({
      success: true,
      message: 'Push preferences updated successfully',
    });
  } catch (error: any) {
    return new Response(JSON.stringify({ message: error.message }), { status: 500 });
  }
});

router.delete('/api/push-subscriptions', async (request: RequestWithEnv) => {
  try {
    const { endpoint } = await request.json();

    if (!endpoint) {
      return new Response(JSON.stringify({ message: 'Endpoint required' }), { status: 400 });
    }

    console.log('Push subscription removed:', endpoint);

    return json({
      success: true,
      message: 'Push subscription removed successfully',
    });
  } catch (error: any) {
    return new Response(JSON.stringify({ message: error.message }), { status: 500 });
  }
});

router.post('/api/notifications/test', async () => {
  try {
    return json({
      success: true,
      message: 'Test notification sent successfully',
    });
  } catch (error: any) {
    return new Response(JSON.stringify({ message: error.message }), { status: 500 });
  }
});

router.post('/api/notifications/driver-available', async (request: RequestWithEnv) => {
  try {
    const { userId, location, availableDrivers } = await request.json();

    if (!userId) {
      return new Response(JSON.stringify({ message: 'User ID required' }), { status: 400 });
    }

    console.log('Driver availability notification requested:', {
      userId,
      location,
      availableDrivers: availableDrivers || 1,
    });

    return json({
      success: true,
      message: 'Driver availability notification sent',
    });
  } catch (error: any) {
    return new Response(JSON.stringify({ message: error.message }), { status: 500 });
  }
});

// Catch-all for any other requests
router.all('*', () => new Response('Not Found.', { status: 404 }));

export default {
  fetch: router.handle
}
