// server/index.ts
import express2 from "express";

// server/routes.ts
import { createServer } from "http";
import Stripe from "stripe";

// server/storage.ts
import { randomUUID } from "crypto";
var MemStorage = class {
  users = /* @__PURE__ */ new Map();
  spots = /* @__PURE__ */ new Map();
  airbears = /* @__PURE__ */ new Map();
  rides = /* @__PURE__ */ new Map();
  bodegaItems = /* @__PURE__ */ new Map();
  orders = /* @__PURE__ */ new Map();
  payments = /* @__PURE__ */ new Map();
  constructor() {
    this.initializeDefaultData();
  }
  initializeDefaultData() {
    const spotsData = [
      { name: "Court Street Downtown", latitude: "42.099118", longitude: "-75.917538" },
      { name: "Riverwalk BU Center", latitude: "42.098765", longitude: "-75.916543" },
      { name: "Confluence Park", latitude: "42.090123", longitude: "-75.912345" },
      { name: "Southside Walking Bridge", latitude: "42.091409", longitude: "-75.914568" },
      { name: "General Hospital", latitude: "42.086741", longitude: "-75.915711" },
      { name: "McArthur Park", latitude: "42.086165", longitude: "-75.926153" },
      { name: "Greenway Path", latitude: "42.086678", longitude: "-75.932483" },
      { name: "Vestal Center", latitude: "42.091851", longitude: "-75.951729" },
      { name: "Innovation Park", latitude: "42.093877", longitude: "-75.958331" },
      { name: "BU East Gym", latitude: "42.091695", longitude: "-75.963590" },
      { name: "BU Fine Arts Building", latitude: "42.089282", longitude: "-75.967441" },
      { name: "Whitney Hall", latitude: "42.088456", longitude: "-75.965432" },
      { name: "Student Union", latitude: "42.086903", longitude: "-75.966704" },
      { name: "Appalachian Dining", latitude: "42.084523", longitude: "-75.971264" },
      { name: "Hinman Dining Hall", latitude: "42.086314", longitude: "-75.973292" },
      { name: "BU Science Building", latitude: "42.090227", longitude: "-75.972315" }
    ];
    spotsData.forEach((spotData) => {
      const spot = {
        id: randomUUID(),
        name: spotData.name,
        latitude: spotData.latitude,
        longitude: spotData.longitude,
        isActive: true,
        createdAt: /* @__PURE__ */ new Date()
      };
      this.spots.set(spot.id, spot);
    });
    const createdSpots = Array.from(this.spots.values()).slice(0, 5);
    const airbearsData = [
      { driverId: null, currentSpotId: createdSpots[0]?.id || null, batteryLevel: 85, isAvailable: true, isCharging: false, totalDistance: "125.5", maintenanceStatus: "good" },
      { driverId: null, currentSpotId: createdSpots[1]?.id || null, batteryLevel: 92, isAvailable: true, isCharging: false, totalDistance: "89.2", maintenanceStatus: "good" },
      { driverId: null, currentSpotId: createdSpots[2]?.id || null, batteryLevel: 78, isAvailable: false, isCharging: true, totalDistance: "156.8", maintenanceStatus: "good" },
      { driverId: null, currentSpotId: createdSpots[3]?.id || null, batteryLevel: 95, isAvailable: true, isCharging: false, totalDistance: "67.3", maintenanceStatus: "good" },
      { driverId: null, currentSpotId: createdSpots[4]?.id || null, batteryLevel: 45, isAvailable: false, isCharging: false, totalDistance: "203.1", maintenanceStatus: "maintenance" }
    ];
    airbearsData.forEach((airbearData) => {
      const airbear = {
        id: randomUUID(),
        driverId: airbearData.driverId,
        currentSpotId: airbearData.currentSpotId,
        batteryLevel: airbearData.batteryLevel,
        isAvailable: airbearData.isAvailable,
        isCharging: airbearData.isCharging,
        totalDistance: airbearData.totalDistance,
        maintenanceStatus: airbearData.maintenanceStatus,
        createdAt: /* @__PURE__ */ new Date()
      };
      this.airbears.set(airbear.id, airbear);
    });
    const bodegaItemsData = [
      { name: "CEO-Signed AirBear T-Shirt - Size XS", description: "Authentic CEO-signed organic cotton t-shirt with unlimited daily rides for life. Non-transferable premium membership.", price: "100.00", category: "apparel", isEcoFriendly: true, stock: 10 },
      { name: "CEO-Signed AirBear T-Shirt - Size S", description: "Authentic CEO-signed organic cotton t-shirt with unlimited daily rides for life. Non-transferable premium membership.", price: "100.00", category: "apparel", isEcoFriendly: true, stock: 15 },
      { name: "CEO-Signed AirBear T-Shirt - Size M", description: "Authentic CEO-signed organic cotton t-shirt with unlimited daily rides for life. Non-transferable premium membership.", price: "100.00", category: "apparel", isEcoFriendly: true, stock: 25 },
      { name: "CEO-Signed AirBear T-Shirt - Size L", description: "Authentic CEO-signed organic cotton t-shirt with unlimited daily rides for life. Non-transferable premium membership.", price: "100.00", category: "apparel", isEcoFriendly: true, stock: 25 },
      { name: "CEO-Signed AirBear T-Shirt - Size XL", description: "Authentic CEO-signed organic cotton t-shirt with unlimited daily rides for life. Non-transferable premium membership.", price: "100.00", category: "apparel", isEcoFriendly: true, stock: 15 },
      { name: "CEO-Signed AirBear T-Shirt - Size XXL", description: "Authentic CEO-signed organic cotton t-shirt with unlimited daily rides for life. Non-transferable premium membership.", price: "100.00", category: "apparel", isEcoFriendly: true, stock: 10 },
      // Regular bodega items
      { name: "Local Coffee Blend", description: "Binghamton roasted, eco-friendly packaging", price: "12.99", category: "beverages", isEcoFriendly: true, stock: 20 },
      { name: "Fresh Produce Box", description: "Locally sourced, seasonal selection", price: "24.99", category: "food", isEcoFriendly: true, stock: 15 },
      { name: "Eco Water Bottle", description: "Bamboo fiber, BPA-free, 500ml", price: "18.99", category: "accessories", isEcoFriendly: true, stock: 30 },
      { name: "Energy Snack Mix", description: "Locally made, organic ingredients", price: "8.99", category: "snacks", isEcoFriendly: true, stock: 25 },
      { name: "Solar Power Bank", description: "Portable solar charger for devices", price: "45.99", category: "accessories", isEcoFriendly: true, stock: 20 },
      { name: "Organic Granola Bar", description: "Locally sourced nuts and fruits", price: "3.99", category: "snacks", isEcoFriendly: true, stock: 80 },
      { name: "Binghamton Honey", description: "Pure local wildflower honey", price: "15.99", category: "food", isEcoFriendly: true, stock: 25 }
    ];
    bodegaItemsData.forEach((itemData) => {
      const item = {
        id: randomUUID(),
        name: itemData.name,
        description: itemData.description,
        price: itemData.price,
        imageUrl: null,
        category: itemData.category,
        isEcoFriendly: itemData.isEcoFriendly,
        isAvailable: true,
        stock: itemData.stock,
        createdAt: /* @__PURE__ */ new Date()
      };
      this.bodegaItems.set(item.id, item);
    });
    const sampleUsers = [
      { email: "user@example.com", username: "testuser", fullName: "Test User", role: "user", ecoPoints: 50, totalRides: 5, co2Saved: "2.5", hasCeoTshirt: false, tshirtPurchaseDate: null },
      { email: "driver@example.com", username: "testdriver", fullName: "Test Driver", role: "driver", ecoPoints: 200, totalRides: 45, co2Saved: "18.7", hasCeoTshirt: true, tshirtPurchaseDate: /* @__PURE__ */ new Date() },
      { email: "admin@example.com", username: "admin", fullName: "System Admin", role: "admin", ecoPoints: 0, totalRides: 0, co2Saved: "0", hasCeoTshirt: false, tshirtPurchaseDate: null }
    ];
    sampleUsers.forEach((userData) => {
      const user = {
        ...userData,
        id: randomUUID(),
        avatarUrl: null,
        stripeCustomerId: null,
        stripeSubscriptionId: null,
        role: userData.role,
        createdAt: /* @__PURE__ */ new Date(),
        updatedAt: /* @__PURE__ */ new Date()
      };
      this.users.set(user.id, user);
    });
  }
  async getUser(id) {
    return this.users.get(id);
  }
  async getUserByEmail(email) {
    return Array.from(this.users.values()).find((user) => user.email === email);
  }
  async createUser(insertUser) {
    const user = {
      ...insertUser,
      id: randomUUID(),
      fullName: insertUser.fullName || null,
      avatarUrl: insertUser.avatarUrl || null,
      stripeCustomerId: insertUser.stripeCustomerId || null,
      stripeSubscriptionId: insertUser.stripeSubscriptionId || null,
      ecoPoints: insertUser.ecoPoints || 0,
      totalRides: insertUser.totalRides || 0,
      co2Saved: insertUser.co2Saved || "0",
      hasCeoTshirt: insertUser.hasCeoTshirt || false,
      tshirtPurchaseDate: insertUser.tshirtPurchaseDate || null,
      role: insertUser.role || "user",
      createdAt: /* @__PURE__ */ new Date(),
      updatedAt: /* @__PURE__ */ new Date()
    };
    this.users.set(user.id, user);
    return user;
  }
  async updateUser(id, updates) {
    const user = this.users.get(id);
    if (!user) throw new Error("User not found");
    const updatedUser = { ...user, ...updates, updatedAt: /* @__PURE__ */ new Date() };
    this.users.set(id, updatedUser);
    return updatedUser;
  }
  async getRidesByUserAndDate(userId, date) {
    const userRides = Array.from(this.rides.values()).filter((r) => r.userId === userId);
    return userRides.filter((ride) => {
      const rideDate = ride.requestedAt.toISOString().split("T")[0];
      return rideDate === date;
    });
  }
  // Spots
  async getAllSpots() {
    return Array.from(this.spots.values());
  }
  async createSpot(insertSpot) {
    const spot = {
      ...insertSpot,
      id: randomUUID(),
      latitude: insertSpot.latitude,
      longitude: insertSpot.longitude,
      isActive: insertSpot.isActive ?? true,
      createdAt: /* @__PURE__ */ new Date()
    };
    this.spots.set(spot.id, spot);
    return spot;
  }
  async getSpotById(id) {
    return this.spots.get(id);
  }
  // Airbears (renamed from Rickshaws)
  async getAllAirbears() {
    return Array.from(this.airbears.values());
  }
  async getAvailableAirbears() {
    return Array.from(this.airbears.values()).filter((r) => r.isAvailable && !r.isCharging);
  }
  async getAirbearsByDriver(driverId) {
    return Array.from(this.airbears.values()).filter((r) => r.driverId === driverId);
  }
  async createAirbear(insertAirbear) {
    const airbear = {
      ...insertAirbear,
      id: randomUUID(),
      driverId: insertAirbear.driverId || null,
      currentSpotId: insertAirbear.currentSpotId || null,
      batteryLevel: insertAirbear.batteryLevel || 100,
      isAvailable: insertAirbear.isAvailable ?? true,
      isCharging: insertAirbear.isCharging ?? false,
      totalDistance: insertAirbear.totalDistance || "0",
      maintenanceStatus: insertAirbear.maintenanceStatus || "good",
      createdAt: /* @__PURE__ */ new Date()
    };
    this.airbears.set(airbear.id, airbear);
    return airbear;
  }
  async updateAirbear(id, updates) {
    const airbear = this.airbears.get(id);
    if (!airbear) throw new Error("Airbear not found");
    const updatedAirbear = { ...airbear, ...updates };
    this.airbears.set(id, updatedAirbear);
    return updatedAirbear;
  }
  // Legacy rickshaw methods
  async getAllRickshaws() {
    return this.getAllAirbears();
  }
  async getAvailableRickshaws() {
    return this.getAvailableAirbears();
  }
  // Rides
  async getRidesByUser(userId) {
    return Array.from(this.rides.values()).filter((r) => r.userId === userId);
  }
  async getRidesByDriver(driverId) {
    return Array.from(this.rides.values()).filter((r) => r.driverId === driverId);
  }
  async createRide(insertRide) {
    const ride = {
      ...insertRide,
      id: randomUUID(),
      driverId: insertRide.driverId || null,
      airbearId: insertRide.airbearId || null,
      status: insertRide.status || "pending",
      estimatedDuration: insertRide.estimatedDuration || null,
      actualDuration: insertRide.actualDuration || null,
      distance: insertRide.distance || null,
      co2Saved: insertRide.co2Saved || null,
      isFreeTshirtRide: insertRide.isFreeTshirtRide || false,
      fare: insertRide.fare,
      requestedAt: /* @__PURE__ */ new Date(),
      acceptedAt: null,
      startedAt: null,
      completedAt: null
    };
    this.rides.set(ride.id, ride);
    return ride;
  }
  async updateRide(id, updates) {
    const ride = this.rides.get(id);
    if (!ride) throw new Error("Ride not found");
    const updatedRide = { ...ride, ...updates };
    this.rides.set(id, updatedRide);
    return updatedRide;
  }
  async getRideById(id) {
    return this.rides.get(id);
  }
  // Bodega Items
  async getAllBodegaItems() {
    return Array.from(this.bodegaItems.values());
  }
  async getBodegaItemsByCategory(category) {
    return Array.from(this.bodegaItems.values()).filter((item) => item.category === category);
  }
  async createBodegaItem(insertItem) {
    const item = {
      ...insertItem,
      id: randomUUID(),
      description: insertItem.description || null,
      imageUrl: insertItem.imageUrl || null,
      isEcoFriendly: insertItem.isEcoFriendly || false,
      isAvailable: insertItem.isAvailable ?? true,
      stock: insertItem.stock || 0,
      createdAt: /* @__PURE__ */ new Date()
    };
    this.bodegaItems.set(item.id, item);
    return item;
  }
  async updateBodegaItem(id, updates) {
    const item = this.bodegaItems.get(id);
    if (!item) throw new Error("Bodega item not found");
    const updatedItem = { ...item, ...updates };
    this.bodegaItems.set(id, updatedItem);
    return updatedItem;
  }
  // Orders
  async getOrdersByUser(userId) {
    return Array.from(this.orders.values()).filter((o) => o.userId === userId);
  }
  async createOrder(insertOrder) {
    const order = {
      ...insertOrder,
      id: randomUUID(),
      rideId: insertOrder.rideId || null,
      airbearId: insertOrder.airbearId || null,
      status: insertOrder.status || "pending",
      notes: insertOrder.notes || null,
      createdAt: /* @__PURE__ */ new Date()
    };
    this.orders.set(order.id, order);
    return order;
  }
  async updateOrder(id, updates) {
    const order = this.orders.get(id);
    if (!order) throw new Error("Order not found");
    const updatedOrder = { ...order, ...updates };
    this.orders.set(id, updatedOrder);
    return updatedOrder;
  }
  // Payments
  async getPaymentsByUser(userId) {
    return Array.from(this.payments.values()).filter((p) => p.userId === userId);
  }
  async createPayment(insertPayment) {
    const payment = {
      ...insertPayment,
      id: randomUUID(),
      orderId: insertPayment.orderId || null,
      rideId: insertPayment.rideId || null,
      stripePaymentIntentId: insertPayment.stripePaymentIntentId || null,
      currency: insertPayment.currency || "usd",
      status: insertPayment.status || "pending",
      metadata: insertPayment.metadata || null,
      createdAt: /* @__PURE__ */ new Date()
    };
    this.payments.set(payment.id, payment);
    return payment;
  }
  async updatePayment(id, updates) {
    const payment = this.payments.get(id);
    if (!payment) throw new Error("Payment not found");
    const updatedPayment = { ...payment, ...updates };
    this.payments.set(id, updatedPayment);
    return updatedPayment;
  }
};
var storage = new MemStorage();

// shared/schema.ts
import { sql } from "drizzle-orm";
import { pgTable, text, varchar, timestamp, decimal, integer, boolean, jsonb, pgEnum } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
var userRoleEnum = pgEnum("user_role", ["user", "driver", "admin"]);
var rideStatusEnum = pgEnum("ride_status", ["pending", "accepted", "in_progress", "completed", "cancelled"]);
var paymentStatusEnum = pgEnum("payment_status", ["pending", "completed", "failed", "refunded"]);
var paymentMethodEnum = pgEnum("payment_method", ["stripe", "apple_pay", "google_pay", "cash"]);
var users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: text("email").notNull().unique(),
  username: text("username").notNull().unique(),
  fullName: text("full_name"),
  avatarUrl: text("avatar_url"),
  role: userRoleEnum("role").notNull().default("user"),
  stripeCustomerId: text("stripe_customer_id"),
  stripeSubscriptionId: text("stripe_subscription_id"),
  ecoPoints: integer("eco_points").notNull().default(0),
  totalRides: integer("total_rides").notNull().default(0),
  co2Saved: decimal("co2_saved", { precision: 10, scale: 2 }).notNull().default("0"),
  hasCeoTshirt: boolean("has_ceo_tshirt").notNull().default(false),
  tshirtPurchaseDate: timestamp("tshirt_purchase_date"),
  createdAt: timestamp("created_at").notNull().default(sql`now()`),
  updatedAt: timestamp("updated_at").notNull().default(sql`now()`)
});
var spots = pgTable("spots", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  latitude: decimal("latitude", { precision: 10, scale: 8 }).notNull(),
  longitude: decimal("longitude", { precision: 11, scale: 8 }).notNull(),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").notNull().default(sql`now()`)
});
var airbears = pgTable("airbears", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  driverId: varchar("driver_id").references(() => users.id),
  currentSpotId: varchar("current_spot_id").references(() => spots.id),
  batteryLevel: integer("battery_level").notNull().default(100),
  isAvailable: boolean("is_available").notNull().default(true),
  isCharging: boolean("is_charging").notNull().default(false),
  totalDistance: decimal("total_distance", { precision: 10, scale: 2 }).notNull().default("0"),
  maintenanceStatus: text("maintenance_status").notNull().default("good"),
  createdAt: timestamp("created_at").notNull().default(sql`now()`)
});
var rides = pgTable("rides", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  driverId: varchar("driver_id").references(() => users.id),
  airbearId: varchar("airbear_id").references(() => airbears.id),
  pickupSpotId: varchar("pickup_spot_id").notNull().references(() => spots.id),
  destinationSpotId: varchar("destination_spot_id").notNull().references(() => spots.id),
  status: rideStatusEnum("status").notNull().default("pending"),
  estimatedDuration: integer("estimated_duration"),
  // minutes
  actualDuration: integer("actual_duration"),
  // minutes
  distance: decimal("distance", { precision: 8, scale: 2 }),
  // km
  co2Saved: decimal("co2_saved", { precision: 8, scale: 2 }),
  // kg
  fare: decimal("fare", { precision: 8, scale: 2 }).notNull(),
  isFreeTshirtRide: boolean("is_free_tshirt_ride").notNull().default(false),
  requestedAt: timestamp("requested_at").notNull().default(sql`now()`),
  acceptedAt: timestamp("accepted_at"),
  startedAt: timestamp("started_at"),
  completedAt: timestamp("completed_at")
});
var bodegaItems = pgTable("bodega_items", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  description: text("description"),
  price: decimal("price", { precision: 8, scale: 2 }).notNull(),
  imageUrl: text("image_url"),
  category: text("category").notNull(),
  isEcoFriendly: boolean("is_eco_friendly").notNull().default(false),
  isAvailable: boolean("is_available").notNull().default(true),
  stock: integer("stock").notNull().default(0),
  createdAt: timestamp("created_at").notNull().default(sql`now()`)
});
var airbearInventory = pgTable("airbear_inventory", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  airbearId: varchar("airbear_id").notNull().references(() => airbears.id),
  itemId: varchar("item_id").notNull().references(() => bodegaItems.id),
  quantity: integer("quantity").notNull().default(0),
  lastRestocked: timestamp("last_restocked").default(sql`now()`)
});
var orders = pgTable("orders", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  rideId: varchar("ride_id").references(() => rides.id),
  airbearId: varchar("airbear_id").references(() => airbears.id),
  items: jsonb("items").notNull(),
  // Array of {itemId, quantity, price}
  totalAmount: decimal("total_amount", { precision: 10, scale: 2 }).notNull(),
  status: text("status").notNull().default("pending"),
  notes: text("notes"),
  createdAt: timestamp("created_at").notNull().default(sql`now()`)
});
var payments = pgTable("payments", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  orderId: varchar("order_id").references(() => orders.id),
  rideId: varchar("ride_id").references(() => rides.id),
  stripePaymentIntentId: text("stripe_payment_intent_id"),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  currency: text("currency").notNull().default("usd"),
  status: paymentStatusEnum("status").notNull().default("pending"),
  paymentMethod: paymentMethodEnum("payment_method").notNull(),
  metadata: jsonb("metadata"),
  createdAt: timestamp("created_at").notNull().default(sql`now()`)
});
var insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
  updatedAt: true
});
var insertSpotSchema = createInsertSchema(spots).omit({
  id: true,
  createdAt: true
});
var insertAirbearSchema = createInsertSchema(airbears).omit({
  id: true,
  createdAt: true
});
var insertRideSchema = createInsertSchema(rides).omit({
  id: true,
  requestedAt: true,
  acceptedAt: true,
  startedAt: true,
  completedAt: true
});
var insertBodegaItemSchema = createInsertSchema(bodegaItems).omit({
  id: true,
  createdAt: true
});
var insertOrderSchema = createInsertSchema(orders).omit({
  id: true,
  createdAt: true
});
var insertPaymentSchema = createInsertSchema(payments).omit({
  id: true,
  createdAt: true
});

// server/routes.ts
var isMockMode = !process.env.STRIPE_SECRET_KEY;
var stripe = isMockMode ? {
  paymentIntents: {
    create: async () => ({
      id: "mock_pi_" + Math.random().toString(36).substring(2, 15),
      client_secret: "mock_cs_" + Math.random().toString(36).substring(2, 15),
      status: "succeeded",
      amount: 1e3,
      // $10.00
      currency: "usd"
    })
  }
  // Add other Stripe methods as needed
} : new Stripe(process.env.STRIPE_SECRET_KEY || "", {
  apiVersion: "2023-10-16"
});
if (isMockMode) {
  console.warn("\u26A0\uFE0F  Running in mock mode. No real Stripe transactions will be processed.");
}
async function registerRoutes(app2) {
  app2.post("/api/auth/register", async (req, res) => {
    try {
      const userData = insertUserSchema.parse(req.body);
      const existingUser = await storage.getUserByEmail(userData.email);
      if (existingUser) {
        return res.status(400).json({ message: "User already exists" });
      }
      const user = await storage.createUser(userData);
      res.json({ user: { id: user.id, email: user.email, username: user.username, role: user.role } });
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  });
  app2.post("/api/auth/login", async (req, res) => {
    try {
      const { email } = req.body;
      const user = await storage.getUserByEmail(email);
      if (!user) {
        return res.status(401).json({ message: "User not found" });
      }
      res.json({ user: { id: user.id, email: user.email, username: user.username, role: user.role } });
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  });
  app2.get("/api/spots", async (req, res) => {
    try {
      const spots2 = await storage.getAllSpots();
      res.json(spots2);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  });
  app2.get("/api/rickshaws", async (req, res) => {
    try {
      const rickshaws = await storage.getAllRickshaws();
      res.json(rickshaws);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  });
  app2.get("/api/rickshaws/available", async (req, res) => {
    try {
      const rickshaws = await storage.getAvailableRickshaws();
      res.json(rickshaws);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  });
  app2.post("/api/rides", async (req, res) => {
    try {
      const rideData = insertRideSchema.parse(req.body);
      const ride = await storage.createRide(rideData);
      res.json(ride);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  });
  app2.get("/api/rides/user/:userId", async (req, res) => {
    try {
      const { userId } = req.params;
      const rides2 = await storage.getRidesByUser(userId);
      res.json(rides2);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  });
  app2.patch("/api/rides/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const updates = req.body;
      const ride = await storage.updateRide(id, updates);
      res.json(ride);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  });
  app2.get("/api/bodega/items", async (req, res) => {
    try {
      const { category } = req.query;
      const items = category ? await storage.getBodegaItemsByCategory(category) : await storage.getAllBodegaItems();
      res.json(items);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  });
  app2.post("/api/orders", async (req, res) => {
    try {
      const orderData = insertOrderSchema.parse(req.body);
      const order = await storage.createOrder(orderData);
      res.json(order);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  });
  app2.get("/api/orders/user/:userId", async (req, res) => {
    try {
      const { userId } = req.params;
      const orders2 = await storage.getOrdersByUser(userId);
      res.json(orders2);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  });
  app2.post("/api/create-payment-intent", async (req, res) => {
    try {
      const { amount, orderId, rideId, paymentMethod = "stripe" } = req.body;
      if (!amount || amount <= 0) {
        return res.status(400).json({ message: "Invalid amount" });
      }
      let paymentIntent;
      if (paymentMethod === "cash") {
        const qrData = {
          orderId,
          rideId,
          amount,
          timestamp: Date.now(),
          method: "cash"
        };
        return res.json({
          qrCode: Buffer.from(JSON.stringify(qrData)).toString("base64"),
          paymentMethod: "cash"
        });
      } else {
        paymentIntent = await stripe.paymentIntents.create({
          amount: Math.round(amount * 100),
          // Convert to cents
          currency: "usd",
          automatic_payment_methods: {
            enabled: true
          },
          metadata: {
            orderId: orderId || "",
            rideId: rideId || ""
          }
        });
        res.json({
          clientSecret: paymentIntent.client_secret,
          paymentIntentId: paymentIntent.id
        });
      }
    } catch (error) {
      res.status(500).json({ message: "Error creating payment intent: " + error.message });
    }
  });
  app2.post("/api/payments/confirm", async (req, res) => {
    try {
      const paymentData = insertPaymentSchema.parse(req.body);
      const payment = await storage.createPayment(paymentData);
      res.json(payment);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  });
  app2.post("/api/ceo-tshirt/purchase", async (req, res) => {
    try {
      const { userId, size, amount } = req.body;
      const paymentIntent = await stripe.paymentIntents.create({
        amount: 1e4,
        // $100.00 in cents
        currency: "usd",
        automatic_payment_methods: {
          enabled: true
        },
        metadata: {
          product_type: "ceo_tshirt",
          user_id: userId,
          size,
          unlimited_rides: "true",
          non_transferable: "true"
        }
      });
      res.json({
        clientSecret: paymentIntent.client_secret,
        paymentIntentId: paymentIntent.id
      });
    } catch (error) {
      res.status(500).json({ message: "Error creating CEO T-shirt payment: " + error.message });
    }
  });
  app2.get("/api/users/:userId/free-ride-status", async (req, res) => {
    try {
      const { userId } = req.params;
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      if (!user.hasCeoTshirt) {
        return res.json({
          canRideFree: false,
          reason: "No CEO T-shirt purchased"
        });
      }
      const today = (/* @__PURE__ */ new Date()).toISOString().split("T")[0];
      const todayRides = await storage.getRidesByUserAndDate(userId, today);
      const freeRidesToday = todayRides.filter((ride) => ride.isFreeTshirtRide);
      if (freeRidesToday.length > 0) {
        return res.json({
          canRideFree: false,
          reason: "Daily free ride already used"
        });
      }
      res.json({ canRideFree: true });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  });
  app2.post("/api/webhooks/stripe", async (req, res) => {
    try {
      const sig = req.headers["stripe-signature"];
      const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;
      if (!sig || !endpointSecret) {
        return res.status(400).json({ message: "Missing signature or webhook secret" });
      }
      let event;
      try {
        event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
      } catch (err) {
        return res.status(400).json({ message: `Webhook signature verification failed: ${err.message}` });
      }
      switch (event.type) {
        case "payment_intent.succeeded":
          const paymentIntent = event.data.object;
          console.log("PaymentIntent succeeded:", paymentIntent.id);
          if (paymentIntent.metadata?.product_type === "ceo_tshirt") {
            const userId = paymentIntent.metadata.user_id;
            if (userId) {
              await storage.updateUser(userId, {
                hasCeoTshirt: true,
                tshirtPurchaseDate: /* @__PURE__ */ new Date()
              });
              console.log("CEO T-shirt activated for user:", userId);
            }
          }
          const metadata = paymentIntent.metadata;
          if (metadata?.orderId || metadata?.rideId) {
            if (metadata.orderId) {
              await storage.updateOrder(metadata.orderId, { status: "completed" });
            }
            if (metadata.rideId) {
              await storage.updateRide(metadata.rideId, { status: "completed" });
            }
          }
          break;
        case "payment_intent.payment_failed":
          const failedPayment = event.data.object;
          console.log("PaymentIntent failed:", failedPayment.id);
          break;
        default:
          console.log(`Unhandled event type ${event.type}`);
      }
      res.json({ received: true });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  });
  app2.get("/api/analytics/overview", async (req, res) => {
    try {
      const spots2 = await storage.getAllSpots();
      const airbears2 = await storage.getAllAirbears();
      const activeAirbears = airbears2.filter((a) => a.isAvailable && !a.isCharging);
      const chargingAirbears = airbears2.filter((a) => a.isCharging);
      const maintenanceAirbears = airbears2.filter((a) => a.maintenanceStatus !== "good");
      const analytics = {
        totalSpots: spots2.length,
        totalAirbears: airbears2.length,
        activeAirbears: activeAirbears.length,
        chargingAirbears: chargingAirbears.length,
        maintenanceAirbears: maintenanceAirbears.length,
        averageBatteryLevel: airbears2.length > 0 ? Math.round(airbears2.reduce((sum, a) => sum + a.batteryLevel, 0) / airbears2.length) : 0
      };
      res.json(analytics);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  });
  app2.post("/api/push-subscriptions", async (req, res) => {
    try {
      const { subscription, preferences } = req.body;
      if (!subscription || !preferences) {
        return res.status(400).json({ message: "Subscription and preferences required" });
      }
      console.log("Push subscription registered:", {
        endpoint: subscription.endpoint,
        preferences
      });
      res.json({
        success: true,
        message: "Push subscription registered successfully"
      });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  });
  app2.patch("/api/push-subscriptions", async (req, res) => {
    try {
      const { endpoint, preferences } = req.body;
      if (!endpoint || !preferences) {
        return res.status(400).json({ message: "Endpoint and preferences required" });
      }
      console.log("Push preferences updated:", {
        endpoint,
        preferences
      });
      res.json({
        success: true,
        message: "Push preferences updated successfully"
      });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  });
  app2.delete("/api/push-subscriptions", async (req, res) => {
    try {
      const { endpoint } = req.body;
      if (!endpoint) {
        return res.status(400).json({ message: "Endpoint required" });
      }
      console.log("Push subscription removed:", endpoint);
      res.json({
        success: true,
        message: "Push subscription removed successfully"
      });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  });
  app2.post("/api/notifications/test", async (req, res) => {
    try {
      res.json({
        success: true,
        message: "Test notification sent successfully"
      });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  });
  app2.post("/api/notifications/driver-available", async (req, res) => {
    try {
      const { userId, location, availableDrivers } = req.body;
      if (!userId) {
        return res.status(400).json({ message: "User ID required" });
      }
      console.log("Driver availability notification requested:", {
        userId,
        location,
        availableDrivers: availableDrivers || 1
      });
      res.json({
        success: true,
        message: "Driver availability notification sent"
      });
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  });
  const httpServer = createServer(app2);
  return httpServer;
}

// server/vite.ts
import express from "express";
import fs from "fs";
import path2 from "path";
import { createServer as createViteServer, createLogger } from "vite";

// vite.config.ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import { fileURLToPath } from "url";
var __dirname = path.dirname(fileURLToPath(import.meta.url));
var vite_config_default = defineConfig({
  plugins: [
    react()
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "client", "src")
    }
  },
  root: path.resolve(__dirname, "client"),
  build: {
    outDir: path.resolve(__dirname, "dist/public"),
    emptyOutDir: true
  },
  server: {
    fs: {
      strict: false,
      allow: [".."]
    }
  }
});

// server/vite.ts
import { nanoid } from "nanoid";
import { fileURLToPath as fileURLToPath2 } from "url";
var __dirname2 = path2.dirname(fileURLToPath2(import.meta.url));
var viteLogger = createLogger();
function log(message, source = "express") {
  const formattedTime = (/* @__PURE__ */ new Date()).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true
  });
  console.log(`${formattedTime} [${source}] ${message}`);
}
async function setupVite(app2, server) {
  console.log("Setting up Vite...");
  const vite = await createViteServer({
    ...vite_config_default,
    configFile: false,
    customLogger: {
      ...viteLogger,
      error: (msg, options) => {
        console.error("Vite error:", msg);
        viteLogger.error(msg, options);
      }
    },
    appType: "custom"
  });
  app2.use(vite.middlewares);
  console.log("Vite middlewares added");
  app2.use("*", async (req, res, next) => {
    const url = req.originalUrl;
    try {
      const clientTemplate = path2.resolve(
        __dirname2,
        "..",
        "client",
        "index.html"
      );
      let template = await fs.promises.readFile(clientTemplate, "utf-8");
      template = template.replace(
        `src="/src/main.tsx"`,
        `src="/src/main.tsx?v=${nanoid()}"`
      );
      const page = await vite.transformIndexHtml(url, template);
      res.status(200).set({ "Content-Type": "text/html" }).end(page);
    } catch (e) {
      console.error("Error processing request:", e.message);
      vite.ssrFixStacktrace(e);
      next(e);
    }
  });
}
function serveStatic(app2) {
  const distPath = path2.resolve(__dirname2, "public");
  if (!fs.existsSync(distPath)) {
    throw new Error(
      `Could not find the build directory: ${distPath}, make sure to build the client first`
    );
  }
  app2.use(express.static(distPath));
  app2.use("*", (_req, res) => {
    res.sendFile(path2.resolve(distPath, "index.html"));
  });
}

// server/index.ts
var app = express2();
app.use(express2.json());
app.use(express2.urlencoded({ extended: false }));
app.use((req, res, next) => {
  const start = Date.now();
  const path3 = req.path;
  let capturedJsonResponse = void 0;
  const originalResJson = res.json;
  res.json = function(bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };
  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path3.startsWith("/api")) {
      let logLine = `${req.method} ${path3} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }
      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "\u2026";
      }
      log(logLine);
    }
  });
  next();
});
(async () => {
  const server = await registerRoutes(app);
  app.use((err, _req, res, _next) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";
    res.status(status).json({ message });
    throw err;
  });
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }
  const port = parseInt(process.env.PORT || "5000", 10);
  server.listen({
    port,
    host: "0.0.0.0",
    reusePort: true
  }, () => {
    log(`serving on port ${port}`);
  });
})();
