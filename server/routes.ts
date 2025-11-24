import type { Express } from "express";
import { createServer, type Server } from "http";
import Stripe from "stripe";
import { storage } from "./storage";
import { insertRideSchema, insertOrderSchema, insertPaymentSchema, insertUserSchema } from "@shared/schema";
import { z } from "zod";

// Mock Stripe client when no API key is provided
const isMockMode = !process.env.STRIPE_SECRET_KEY;
const stripe = isMockMode ? {
  paymentIntents: {
    create: async () => ({
      id: 'mock_pi_' + Math.random().toString(36).substring(2, 15),
      client_secret: 'mock_cs_' + Math.random().toString(36).substring(2, 15),
      status: 'succeeded',
      amount: 1000, // $10.00
      currency: 'usd'
    })
  },
  // Add other Stripe methods as needed
} as unknown as Stripe : new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: "2025-08-27.basil",
});

if (isMockMode) {
  console.warn('⚠️  Running in mock mode. No real Stripe transactions will be processed.');
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth routes
  app.post("/api/auth/register", async (req, res) => {
    try {
      const userData = insertUserSchema.parse(req.body);
      const existingUser = await storage.getUserByEmail(userData.email);
      
      if (existingUser) {
        return res.status(400).json({ message: "User already exists" });
      }

      const user = await storage.createUser(userData);
      res.json({ user: { id: user.id, email: user.email, username: user.username, role: user.role } });
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  app.post("/api/auth/login", async (req, res) => {
    try {
      const { email } = req.body;
      const user = await storage.getUserByEmail(email);
      
      if (!user) {
        return res.status(401).json({ message: "User not found" });
      }

      res.json({ user: { id: user.id, email: user.email, username: user.username, role: user.role } });
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  // Spots routes
  app.get("/api/spots", async (req, res) => {
    try {
      const spots = await storage.getAllSpots();
      res.json(spots);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Rickshaws routes
  app.get("/api/rickshaws", async (req, res) => {
    try {
      const rickshaws = await storage.getAllRickshaws();
      res.json(rickshaws);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  app.get("/api/rickshaws/available", async (req, res) => {
    try {
      const rickshaws = await storage.getAvailableRickshaws();
      res.json(rickshaws);
    } catch (error: any) {
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
      res.status(400).json({ message: error.message });
    }
  });

  app.get("/api/rides/user/:userId", async (req, res) => {
    try {
      const { userId } = req.params;
      const rides = await storage.getRidesByUser(userId);
      res.json(rides);
    } catch (error: any) {
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
      res.status(400).json({ message: error.message });
    }
  });

  app.get("/api/orders/user/:userId", async (req, res) => {
    try {
      const { userId } = req.params;
      const orders = await storage.getOrdersByUser(userId);
      res.json(orders);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  });

  // Stripe payment routes
  app.post("/api/create-payment-intent", async (req, res) => {
    try {
      const { amount, orderId, rideId, paymentMethod = "stripe" } = req.body;
      
      if (!amount || amount <= 0) {
        return res.status(400).json({ message: "Invalid amount" });
      }

      let paymentIntent;
      
      if (paymentMethod === "cash") {
        // For cash payments, generate QR code data
        const qrData = {
          orderId,
          rideId,
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
        paymentIntent = await stripe.paymentIntents.create({
          amount: Math.round(amount * 100), // Convert to cents
          currency: "usd",
          automatic_payment_methods: {
            enabled: true,
          },
          metadata: {
            orderId: orderId || "",
            rideId: rideId || "",
          }
        });

        res.json({ 
          clientSecret: paymentIntent.client_secret,
          paymentIntentId: paymentIntent.id
        });
      }
    } catch (error: any) {
      res.status(500).json({ message: "Error creating payment intent: " + error.message });
    }
  });

  // Payment confirmation
  app.post("/api/payments/confirm", async (req, res) => {
    try {
      const paymentData = insertPaymentSchema.parse(req.body);
      const payment = await storage.createPayment(paymentData);
      res.json(payment);
    } catch (error: any) {
      res.status(400).json({ message: error.message });
    }
  });

  // CEO T-shirt purchase route
  app.post("/api/ceo-tshirt/purchase", async (req, res) => {
    try {
      const { userId, size, amount } = req.body;
      
      // Create Stripe PaymentIntent for CEO T-shirt
      const paymentIntent = await stripe.paymentIntents.create({
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
      res.status(500).json({ message: error.message });
    }
  });

  // Webhook for Stripe
  app.post("/api/webhooks/stripe", async (req, res) => {
    try {
      const sig = req.headers['stripe-signature'];
      const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

      if (!sig || !endpointSecret) {
        return res.status(400).json({ message: "Missing signature or webhook secret" });
      }

      let event;
      try {
        event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
      } catch (err: any) {
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
      res.status(500).json({ message: error.message });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
