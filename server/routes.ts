import type { Express, Request } from "express";
import { createServer, type Server } from "http";
import Stripe from "stripe";
import { storage } from "./storage.js";
import { insertRideSchema, insertOrderSchema, insertPaymentSchema } from "../shared/schema.js";
import { z } from "zod";
import { createClient as createSupabaseAdminClient } from "@supabase/supabase-js";

const stripeSecretKey = process.env.STRIPE_SECRET_KEY || process.env.VITE_STRIPE_SECRET_KEY;
if (!stripeSecretKey) {
  console.warn("⚠️ STRIPE_SECRET_KEY is not configured. Stripe functionality will be disabled.");
}

const stripe = stripeSecretKey ? new Stripe(stripeSecretKey, {}) : null;

const getStripe = () => {
  if (!stripe) {
    throw new Error("Stripe is not configured. Set STRIPE_SECRET_KEY.");
  }
  return stripe;
};

const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const supabaseSecretKey = process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabaseAdmin = supabaseUrl && supabaseSecretKey
  ? createSupabaseAdminClient(supabaseUrl, supabaseSecretKey, { auth: { autoRefreshToken: false } })
  : null;

if (!supabaseAdmin) {
  console.warn("⚠️ Supabase admin client not configured. Set SUPABASE_URL and SUPABASE_SECRET_KEY for live auth.");
}

const logRouteError = (req: Request, error: unknown) => {
  const requestId = req.get("x-request-id");
  const prefix = requestId ? `[${requestId}] ` : "";
  console.error(`${prefix}[RouteError] ${req.method} ${req.path}`, error);
};

export async function registerRoutes(app: Express): Promise<Server> {
  // Health check
  app.get("/api/health", (_req, res) => {
    res.json({
      status: "ok",
      timestamp: new Date().toISOString(),
      supabaseUrl: supabaseUrl ? "configured" : "missing",
      supabaseSecretKey: supabaseSecretKey ? "configured" : "missing",
      stripeSecretKey: stripeSecretKey ? "configured" : "missing",
    });
  });

  // Auth routes
  const profileSchema = z.object({
    id: z.string().optional(),
    email: z.string().email(),
    username: z.string().min(2),
    fullName: z.string().optional().nullable(),
    fullname: z.string().optional().nullable(),
    role: z.enum(["user", "driver", "admin"]).optional(),
    avatarUrl: z.string().optional().nullable(),
    avatarurl: z.string().optional().nullable(),
  }).transform((data) => ({
    ...data,
    fullName: data.fullName ?? data.fullname ?? null,
    avatarUrl: data.avatarUrl ?? data.avatarurl ?? null,
  }));

  const ensureUserProfile = async (payload: z.infer<typeof profileSchema>) => {
    // Fallback to local storage - Supabase API has permission issues
    const existingUser = payload.id
      ? await storage.getUser(payload.id)
      : payload.email ? await storage.getUserByEmail(payload.email) : null;

    if (existingUser) {
      // Deep comparison to avoid redundant updates
      const needsUpdate =
        existingUser.username !== payload.username ||
        (payload.fullName !== undefined && existingUser.fullName !== payload.fullName) ||
        (payload.avatarUrl !== undefined && existingUser.avatarUrl !== payload.avatarUrl) ||
        (payload.role !== undefined && existingUser.role !== payload.role);

      if (needsUpdate) {
        return storage.updateUser(existingUser.id, {
          username: payload.username,
          fullName: payload.fullName ?? existingUser.fullName,
          avatarUrl: payload.avatarUrl ?? existingUser.avatarUrl,
          role: payload.role || existingUser.role,
        });
      }
      return existingUser;
    }

    return storage.createUser({
      id: payload.id, // Pass the ID from Supabase Auth
      email: payload.email || "",
      username: payload.username,
      fullName: payload.fullName ?? null,
      avatarUrl: payload.avatarUrl ?? null,
      role: payload.role || "user",
      ecoPoints: 0,
      totalRides: 0,
      co2Saved: "0",
    });
  };

  app.post("/api/auth/register", async (req, res) => {
    try {
      const registerSchema = z.object({
        email: z.string().email(),
        username: z.string().min(2),
        fullName: z.string().optional().nullable(),
        role: z.enum(["user", "driver", "admin"]).optional(),
        avatarUrl: z.string().optional().nullable(),
        password: z.string().min(6),
      });
      const userData = registerSchema.parse(req.body);

      // Check for existing user with same email
      const existingUser = await storage.getUserByEmail(userData.email);
      if (existingUser) {
        return res.status(400).json({ message: "Email already registered" });
      }

      // Check for existing user with same username by trying to get by email pattern
      // For now, skip username check since getAllUsers doesn't exist
      // const existingUsernameUser = Array.from((await storage.getAllUsers()) || []).find(u => u.username === userData.username);
      // if (existingUsernameUser) {
      //   return res.status(400).json({ message: "Username already taken" });
      // }

      // Create user profile directly in local storage
      const profile = await storage.createUser({
        id: undefined, // Let storage generate ID
        email: userData.email || "",
        username: userData.username,
        fullName: userData.fullName ?? null,
        avatarUrl: userData.avatarUrl ?? null,
        role: userData.role || "user",
        ecoPoints: 0,
        totalRides: 0,
        co2Saved: "0",
        hasCeoTshirt: false,
        stripeCustomerId: null,
        stripeSubscriptionId: null,
        tshirtPurchaseDate: null
      });

      res.json({ user: { id: profile.id, email: profile.email, username: profile.username, role: profile.role } });
    } catch (error: any) {
      logRouteError(req, error);
      console.error('Registration error:', error);
      res.status(400).json({ message: error.message });
    }
  });

  app.post("/api/auth/login", async (req, res) => {
    try {
      if (!supabaseAdmin) {
        return res.status(500).json({ message: "Supabase is not configured. Set SUPABASE_URL and SUPABASE_SECRET_KEY." });
      }

      const { email, password } = z.object({
        email: z.string().email(),
        password: z.string().min(6),
      }).parse(req.body);

      const { data, error } = await supabaseAdmin.auth.signInWithPassword({ email, password });
      if (error || !data.user) {
        return res.status(401).json({ message: error?.message || "Invalid credentials" });
      }

      const profile = await ensureUserProfile({
        email,
        username: (data.user.user_metadata?.username as string) || email.split("@")[0],
        fullName: (data.user.user_metadata?.fullName as string | undefined) || null,
        role: (data.user.user_metadata?.role as "user" | "driver" | "admin" | undefined) || "user",
        avatarUrl: (data.user.user_metadata?.avatar_url as string | undefined) || null,
      });

      res.json({ user: { id: profile.id, email: profile.email, username: profile.username, role: profile.role } });
    } catch (error: any) {
      logRouteError(req, error);
      res.status(400).json({ message: error.message });
    }
  });

  app.post("/api/auth/sync-profile", async (req, res) => {
    try {
      if (!supabaseAdmin) {
        return res.status(500).json({ message: "Supabase is not configured. Set SUPABASE_URL and SUPABASE_SECRET_KEY." });
      }

      const payload = profileSchema.parse(req.body);
      const profile = await ensureUserProfile(payload);
      res.json({ user: profile });
    } catch (error: any) {
      logRouteError(req, error);
      res.status(400).json({ message: error.message });
    }
  });

  // Spots routes
  app.get("/api/spots", async (req, res) => {
    try {
      const spots = await storage.getAllSpots();
      res.json(spots);
    } catch (error) {
      logRouteError(req, error);
      res.status(500).json({ message: "Failed to fetch spots" });
    }
  });

  // Airbears route
  app.get("/api/airbears", async (req, res) => {
    try {
      const airbears = await storage.getAllAirbears();
      res.json(airbears);
    } catch (error) {
      logRouteError(req, error);
      res.status(500).json({ message: "Failed to fetch airbears" });
    }
  });

  // Bodega items route
  app.get("/api/bodega-items", async (req, res) => {
    try {
      const items = await storage.getAllBodegaItems();
      res.json(items);
    } catch (error) {
      logRouteError(req, error);
      res.status(500).json({ message: "Failed to fetch bodega items" });
    }
  });

  // Rickshaws routes
  app.get("/api/rickshaws", async (req, res) => {
    try {
      const rickshaws = await storage.getAllRickshaws();
      res.json(rickshaws);
    } catch (error: any) {
      logRouteError(req, error);
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/rickshaws/available", async (req, res) => {
    try {
      const rickshaws = await storage.getAvailableRickshaws();
      res.json(rickshaws);
    } catch (error: any) {
      logRouteError(req, error);
      res.status(500).json({ message: error.message });
    }
  });

  // Rides routes
  app.post("/api/rides", async (req, res) => {
    try {
      const rideData = insertRideSchema.parse(req.body);
      const ride = await storage.createRide(rideData);
      res.json(ride);
    } catch (error: any) {
      logRouteError(req, error);
      res.status(400).json({ message: error.message });
    }
  });

  app.get("/api/rides/user/:userId", async (req, res) => {
    try {
      const { userId } = req.params;
      const rides = await storage.getRidesByUser(userId);
      res.json(rides);
    } catch (error: any) {
      logRouteError(req, error);
      res.status(500).json({ message: error.message });
    }
  });

  app.patch("/api/rides/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const updates = req.body;
      const ride = await storage.updateRide(id, updates);
      res.json(ride);
    } catch (error: any) {
      logRouteError(req, error);
      res.status(400).json({ message: error.message });
    }
  });

  // Bodega routes
  app.get("/api/bodega/items", async (req, res) => {
    try {
      const { category } = req.query;
      const items = category
        ? await storage.getBodegaItemsByCategory(category as string)
        : await storage.getAllBodegaItems();
      res.json(items);
    } catch (error: any) {
      logRouteError(req, error);
      res.status(500).json({ message: error.message });
    }
  });

  // Orders routes
  app.post("/api/orders", async (req, res) => {
    try {
      const orderData = insertOrderSchema.parse({
        ...req.body,
        // Accept numeric amounts from clients and normalize to string for Drizzle schema
        totalAmount:
          typeof req.body?.totalAmount === "number"
            ? req.body.totalAmount.toFixed(2)
            : req.body?.totalAmount,
      });
      const order = await storage.createOrder(orderData);
      res.json(order);
    } catch (error: any) {
      logRouteError(req, error);
      res.status(400).json({ message: error.message });
    }
  });

  app.get("/api/orders/user/:userId", async (req, res) => {
    try {
      const { userId } = req.params;
      const orders = await storage.getOrdersByUser(userId);
      res.json(orders);
    } catch (error: any) {
      logRouteError(req, error);
      res.status(500).json({ message: error.message });
    }
  });

  // Stripe payment routes
  app.post("/api/create-payment-intent", async (req, res) => {
    try {
      const { amount, orderId, rideId, userId, paymentMethod = "stripe" } = req.body;

      if (!amount || amount <= 0) {
        return res.status(400).json({ message: "Invalid amount" });
      }

      let paymentIntent;

      if (paymentMethod === "cash") {
        // For cash payments, generate QR code data
        const qrData = {
          orderId,
          rideId,
          userId,
          amount,
          timestamp: Date.now(),
          method: "cash"
        };

        return res.json({
          qrCode: Buffer.from(JSON.stringify(qrData)).toString('base64'),
          paymentMethod: "cash"
        });
      } else {
        // Create Stripe PaymentIntent
        paymentIntent = await getStripe().paymentIntents.create({
          amount: Math.round(amount * 100), // Convert to cents
          currency: "usd",
          automatic_payment_methods: {
            enabled: true
          },
          metadata: {
            orderId: orderId || null,
            rideId: rideId || null,
            userId: userId || null
          }
        });
      }

      res.json({
        clientSecret: paymentIntent.client_secret,
        paymentIntentId: paymentIntent.id,
        amount: paymentIntent.amount,
        currency: paymentIntent.currency,
        status: paymentIntent.status
      });
    } catch (error: any) {
      logRouteError(req, error);
      console.error('Payment intent creation error:', error);
      res.status(500).json({ message: error.message });
    }
  });

  // Stripe checkout session route
  app.post("/api/stripe/create-checkout-session", async (req, res) => {
    try {
      const { amount, currency = "usd", successUrl, cancelUrl } = req.body;

      if (!amount || amount <= 0) {
        return res.status(400).json({ message: "Invalid amount" });
      }

      const session = await getStripe().checkout.sessions.create({
        payment_method_types: ['card'],
        mode: 'payment',
        line_items: [{
          price_data: {
            currency: currency,
            product_data: {
              name: 'AirBear Ride Credit',
              description: 'Add credits to your AirBear account',
            },
            unit_amount: Math.round(amount * 100), // Convert to cents
          },
          quantity: 1,
        }],
        success_url: successUrl || `${req.protocol}://${req.get('host')}/dashboard`,
        cancel_url: cancelUrl || `${req.protocol}://${req.get('host')}/checkout`,
      });

      res.json({
        sessionId: session.id,
        url: session.url,
      });
    } catch (error: any) {
      logRouteError(req, error);
      console.error('Checkout session creation error:', error);
      res.status(500).json({ message: error.message });
    }
  });

  // Payment confirmation
  app.post("/api/payments/confirm", async (req, res) => {
    try {
      const paymentData = insertPaymentSchema.parse(req.body);
      const payment = await storage.createPayment(paymentData);
      res.json(payment);
    } catch (error: any) {
      logRouteError(req, error);
      res.status(400).json({ message: error.message });
    }
  });

  app.post("/api/payments/confirm-cash", async (req, res) => {
    try {
      const { qrCode, driverId } = req.body;
      if (!qrCode) return res.status(400).json({ message: "Missing QR code data" });

      const decodedData = JSON.parse(Buffer.from(qrCode, 'base64').toString());
      const { orderId, rideId, amount } = decodedData;

      if (orderId) {
        await storage.updateOrder(orderId, { status: "completed" });
      }
      if (rideId) {
        await storage.updateRide(rideId, { status: "completed" });
      }

      // Record the cash payment
      const payment = await storage.createPayment({
        rideId: rideId || null,
        userId: decodedData.userId || null,
        amount: amount.toString(),
        currency: "usd",
        paymentMethod: "cash",
        status: "completed",
        metadata: { driverId, confirmedAt: new Date().toISOString() }
      });

      res.json({ success: true, payment });
    } catch (error: any) {
      logRouteError(req, error);
      res.status(400).json({ message: "Invalid QR code or confirmation error: " + error.message });
    }
  });

  // CEO T-shirt purchase route
  app.post("/api/ceo-tshirt/purchase", async (req, res) => {
    try {
      const { userId, size, amount } = req.body;

      // Create Stripe PaymentIntent for CEO T-shirt
      const paymentIntent = await getStripe().paymentIntents.create({
        amount: 10000, // $100.00 in cents
        currency: "usd",
        automatic_payment_methods: {
          enabled: true,
        },
        metadata: {
          product_type: "ceo_tshirt",
          user_id: userId,
          size: size,
          unlimited_rides: "true",
          non_transferable: "true"
        }
      });

      res.json({
        clientSecret: paymentIntent.client_secret,
        paymentIntentId: paymentIntent.id
      });
    } catch (error: any) {
      logRouteError(req, error);
      res.status(500).json({ message: "Error creating CEO T-shirt payment: " + error.message });
    }
  });

  // Free ride validation for CEO T-shirt holders
  app.get("/api/users/:userId/free-ride-status", async (req, res) => {
    try {
      const { userId } = req.params;
      const user = await storage.getUser(userId);

      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      // Check if user has CEO T-shirt
      if (!user.hasCeoTshirt) {
        return res.json({
          canRideFree: false,
          reason: "No CEO T-shirt purchased"
        });
      }

      // Check if user has already used free ride today
      const today = new Date().toISOString().split('T')[0];
      const todayRides = await storage.getRidesByUserAndDate(userId, today);
      const freeRidesToday = todayRides.filter(ride => ride.isFreeTshirtRide);

      if (freeRidesToday.length > 0) {
        return res.json({
          canRideFree: false,
          reason: "Daily free ride already used"
        });
      }

      res.json({ canRideFree: true });
    } catch (error: any) {
      logRouteError(req, error);
      res.status(500).json({ message: error.message });
    }
  });

  // Webhook for Stripe
  app.post("/api/webhooks/stripe", async (req, res) => {
    try {
      const sig = req.headers['stripe-signature'];
      const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET || process.env.VITE_STRIPE_WEBHOOK_SECRET;

      if (!sig || !endpointSecret) {
        return res.status(400).json({ message: "Missing signature or webhook secret" });
      }

      let event;
      try {
        event = getStripe().webhooks.constructEvent((req as any).rawBody, sig, endpointSecret);
      } catch (err: any) {
        console.error(`Webhook signature verification failed: ${err.message}`);
        return res.status(400).json({ message: `Webhook signature verification failed: ${err.message}` });
      }

      // Handle the event
      switch (event.type) {
        case 'payment_intent.succeeded':
          const paymentIntent = event.data.object;
          console.log('PaymentIntent succeeded:', paymentIntent.id);

          // Handle CEO T-shirt purchase
          if (paymentIntent.metadata?.product_type === 'ceo_tshirt') {
            const userId = paymentIntent.metadata.user_id;
            if (userId) {
              await storage.updateUser(userId, {
                hasCeoTshirt: true,
                tshirtPurchaseDate: new Date()
              });
              console.log('CEO T-shirt activated for user:', userId);
            }
          }

          // Update payment status in database
          const metadata = paymentIntent.metadata;
          if (metadata?.orderId || metadata?.rideId) {
            // Update order/ride status to completed
            if (metadata.orderId) {
              await storage.updateOrder(metadata.orderId, { status: "completed" });
            }
            if (metadata.rideId) {
              await storage.updateRide(metadata.rideId, { status: "completed" });
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

      res.json({ received: true });
    } catch (error: any) {
      logRouteError(req, error);
      res.status(500).json({ message: error.message });
    }
  });

  // Analytics routes (for admin dashboard)
  app.get("/api/analytics/overview", async (req, res) => {
    try {
      const spots = await storage.getAllSpots();
      const airbears = await storage.getAllAirbears();
      const activeAirbears = airbears.filter(a => a.isAvailable && !a.isCharging);
      const chargingAirbears = airbears.filter(a => a.isCharging);
      const maintenanceAirbears = airbears.filter(a => a.maintenanceStatus !== "good");

      const analytics = {
        totalSpots: spots.length,
        totalAirbears: airbears.length,
        activeAirbears: activeAirbears.length,
        chargingAirbears: chargingAirbears.length,
        maintenanceAirbears: maintenanceAirbears.length,
        averageBatteryLevel: airbears.length > 0
          ? Math.round(airbears.reduce((sum, a) => sum + a.batteryLevel, 0) / airbears.length)
          : 0
      };

      res.json(analytics);
    } catch (error: any) {
      logRouteError(req, error);
      res.status(500).json({ message: error.message });
    }
  });

  // Push Notification Subscription Management
  app.post("/api/push-subscriptions", async (req, res) => {
    try {
      const { subscription, preferences } = req.body;

      if (!subscription || !preferences) {
        return res.status(400).json({ message: "Subscription and preferences required" });
      }

      // In a real app, you'd store this in a database
      // For now, we'll just log it and return success
      console.log('Push subscription registered:', {
        endpoint: subscription.endpoint,
        preferences
      });

      res.json({
        success: true,
        message: "Push subscription registered successfully"
      });
    } catch (error: any) {
      logRouteError(req, error);
      res.status(500).json({ message: error.message });
    }
  });

  // Update push notification preferences
  app.patch("/api/push-subscriptions", async (req, res) => {
    try {
      const { endpoint, preferences } = req.body;

      if (!endpoint || !preferences) {
        return res.status(400).json({ message: "Endpoint and preferences required" });
      }

      console.log('Push preferences updated:', {
        endpoint,
        preferences
      });

      res.json({
        success: true,
        message: "Push preferences updated successfully"
      });
    } catch (error: any) {
      logRouteError(req, error);
      res.status(500).json({ message: error.message });
    }
  });

  // Remove push subscription
  app.delete("/api/push-subscriptions", async (req, res) => {
    try {
      const { endpoint } = req.body;

      if (!endpoint) {
        return res.status(400).json({ message: "Endpoint required" });
      }

      console.log('Push subscription removed:', endpoint);

      res.json({
        success: true,
        message: "Push subscription removed successfully"
      });
    } catch (error: any) {
      logRouteError(req, error);
      res.status(500).json({ message: error.message });
    }
  });

  // Send test notification (for testing purposes)
  app.post("/api/notifications/test", async (req, res) => {
    try {
      // In a real app, this would send a push notification to the user's subscription
      // For now, we'll just simulate it

      res.json({
        success: true,
        message: "Test notification sent successfully"
      });
    } catch (error: any) {
      logRouteError(req, error);
      res.status(500).json({ message: error.message });
    }
  });

  // Driver availability notification endpoint (called when drivers become available)
  app.post("/api/notifications/driver-available", async (req, res) => {
    try {
      const { userId, location, availableDrivers } = req.body;

      if (!userId) {
        return res.status(400).json({ message: "User ID required" });
      }

      // In a real app, this would:
      // 1. Find the user's push subscription
      // 2. Send a push notification with driver availability info
      // 3. Include location and number of available drivers

      console.log('Driver availability notification requested:', {
        userId,
        location,
        availableDrivers: availableDrivers || 1
      });

      res.json({
        success: true,
        message: "Driver availability notification sent"
      });
    } catch (error: any) {
      logRouteError(req, error);
      res.status(500).json({ message: error.message });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
