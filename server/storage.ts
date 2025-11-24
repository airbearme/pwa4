import { type User, type InsertUser, type Spot, type InsertSpot, type Airbear, type InsertAirbear, type Ride, type InsertRide, type BodegaItem, type InsertBodegaItem, type Order, type InsertOrder, type Payment, type InsertPayment } from "@shared/schema";
import { randomUUID } from "crypto";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

export interface IStorage {
  // Users
  getUser(id: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: string, updates: Partial<User>): Promise<User>;

  // Enhanced user methods
  getRidesByUserAndDate(userId: string, date: string): Promise<Ride[]>;

  // Spots
  getAllSpots(): Promise<Spot[]>;
  createSpot(spot: InsertSpot): Promise<Spot>;
  getSpotById(id: string): Promise<Spot | undefined>;

  // Airbears (renamed from Rickshaws)
  getAllAirbears(): Promise<Airbear[]>;
  getAvailableAirbears(): Promise<Airbear[]>;
  getAirbearsByDriver(driverId: string): Promise<Airbear[]>;
  createAirbear(airbear: InsertAirbear): Promise<Airbear>;
  updateAirbear(id: string, updates: Partial<Airbear>): Promise<Airbear>;
  
  // Legacy rickshaw methods for compatibility
  getAllRickshaws(): Promise<any[]>;
  getAvailableRickshaws(): Promise<any[]>;

  // Rides
  getRidesByUser(userId: string): Promise<Ride[]>;
  getRidesByDriver(driverId: string): Promise<Ride[]>;
  createRide(ride: InsertRide): Promise<Ride>;
  updateRide(id: string, updates: Partial<Ride>): Promise<Ride>;
  getRideById(id: string): Promise<Ride | undefined>;

  // Bodega Items
  getAllBodegaItems(): Promise<BodegaItem[]>;
  getBodegaItemsByCategory(category: string): Promise<BodegaItem[]>;
  createBodegaItem(item: InsertBodegaItem): Promise<BodegaItem>;
  updateBodegaItem(id: string, updates: Partial<BodegaItem>): Promise<BodegaItem>;

  // Orders
  getOrdersByUser(userId: string): Promise<Order[]>;
  createOrder(order: InsertOrder): Promise<Order>;
  updateOrder(id: string, updates: Partial<Order>): Promise<Order>;

  // Payments
  getPaymentsByUser(userId: string): Promise<Payment[]>;
  createPayment(payment: InsertPayment): Promise<Payment>;
  updatePayment(id: string, updates: Partial<Payment>): Promise<Payment>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User> = new Map();
  private spots: Map<string, Spot> = new Map();
  private airbears: Map<string, Airbear> = new Map();
  private rides: Map<string, Ride> = new Map();
  private bodegaItems: Map<string, BodegaItem> = new Map();
  private orders: Map<string, Order> = new Map();
  private payments: Map<string, Payment> = new Map();

  constructor() {
    this.initializeDefaultData();
  }

  private initializeDefaultData() {
    // Initialize spots from CSV data
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

    spotsData.forEach(spotData => {
      const spot: Spot = {
        id: randomUUID(),
        name: spotData.name,
        latitude: spotData.latitude,
        longitude: spotData.longitude,
        isActive: true,
        createdAt: new Date()
      };
      this.spots.set(spot.id, spot);
    });

    // Initialize sample airbears (using first 5 created spots)
    const createdSpots = Array.from(this.spots.values()).slice(0, 5);
    const airbearsData = [
      { driverId: null, currentSpotId: createdSpots[0]?.id || null, batteryLevel: 85, isAvailable: true, isCharging: false, totalDistance: "125.5", maintenanceStatus: "good" },
      { driverId: null, currentSpotId: createdSpots[1]?.id || null, batteryLevel: 92, isAvailable: true, isCharging: false, totalDistance: "89.2", maintenanceStatus: "good" },
      { driverId: null, currentSpotId: createdSpots[2]?.id || null, batteryLevel: 78, isAvailable: false, isCharging: true, totalDistance: "156.8", maintenanceStatus: "good" },
      { driverId: null, currentSpotId: createdSpots[3]?.id || null, batteryLevel: 95, isAvailable: true, isCharging: false, totalDistance: "67.3", maintenanceStatus: "good" },
      { driverId: null, currentSpotId: createdSpots[4]?.id || null, batteryLevel: 45, isAvailable: false, isCharging: false, totalDistance: "203.1", maintenanceStatus: "maintenance" }
    ];

    airbearsData.forEach(airbearData => {
      const airbear: Airbear = {
        id: randomUUID(),
        driverId: airbearData.driverId,
        currentSpotId: airbearData.currentSpotId,
        batteryLevel: airbearData.batteryLevel,
        isAvailable: airbearData.isAvailable,
        isCharging: airbearData.isCharging,
        totalDistance: airbearData.totalDistance,
        maintenanceStatus: airbearData.maintenanceStatus,
        createdAt: new Date()
      };
      this.airbears.set(airbear.id, airbear);
    });

    // Initialize sample bodega items
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

    bodegaItemsData.forEach(itemData => {
      const item: BodegaItem = {
        id: randomUUID(),
        name: itemData.name,
        description: itemData.description,
        price: itemData.price,
        imageUrl: null,
        category: itemData.category,
        isEcoFriendly: itemData.isEcoFriendly,
        isAvailable: true,
        stock: itemData.stock,
        createdAt: new Date()
      };
      this.bodegaItems.set(item.id, item);
    });

    // Initialize sample users with different roles
    const sampleUsers = [
      { email: "user@example.com", username: "testuser", fullName: "Test User", role: "user", ecoPoints: 50, totalRides: 5, co2Saved: "2.5", hasCeoTshirt: false, tshirtPurchaseDate: null },
      { email: "driver@example.com", username: "testdriver", fullName: "Test Driver", role: "driver", ecoPoints: 200, totalRides: 45, co2Saved: "18.7", hasCeoTshirt: true, tshirtPurchaseDate: new Date() },
      { email: "admin@example.com", username: "admin", fullName: "System Admin", role: "admin", ecoPoints: 0, totalRides: 0, co2Saved: "0", hasCeoTshirt: false, tshirtPurchaseDate: null }
    ];

    sampleUsers.forEach(userData => {
      const user: User = {
        ...userData,
        id: randomUUID(),
        avatarUrl: null,
        stripeCustomerId: null,
        stripeSubscriptionId: null,
        role: userData.role as "user" | "driver" | "admin",
        createdAt: new Date(),
        updatedAt: new Date()
      };
      this.users.set(user.id, user);
    });
  }
  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.email === email);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const user: User = {
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
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.users.set(user.id, user);
    return user;
  }

  async updateUser(id: string, updates: Partial<User>): Promise<User> {
    const user = this.users.get(id);
    if (!user) throw new Error("User not found");
    const updatedUser = { ...user, ...updates, updatedAt: new Date() };
    this.users.set(id, updatedUser);
    return updatedUser;
  }

  async getRidesByUserAndDate(userId: string, date: string): Promise<Ride[]> {
    const userRides = Array.from(this.rides.values()).filter(r => r.userId === userId);
    return userRides.filter(ride => {
      const rideDate = ride.requestedAt.toISOString().split('T')[0];
      return rideDate === date;
    });
  }
  // Spots
  async getAllSpots(): Promise<Spot[]> {
    return Array.from(this.spots.values());
  }

  async createSpot(insertSpot: InsertSpot): Promise<Spot> {
    const spot: Spot = {
      ...insertSpot,
      id: randomUUID(),
      latitude: insertSpot.latitude,
      longitude: insertSpot.longitude,
      isActive: insertSpot.isActive ?? true,
      createdAt: new Date()
    };
    this.spots.set(spot.id, spot);
    return spot;
  }

  async getSpotById(id: string): Promise<Spot | undefined> {
    return this.spots.get(id);
  }

  // Airbears (renamed from Rickshaws)
  async getAllAirbears(): Promise<Airbear[]> {
    return Array.from(this.airbears.values());
  }

  async getAvailableAirbears(): Promise<Airbear[]> {
    return Array.from(this.airbears.values()).filter(r => r.isAvailable && !r.isCharging);
  }

  async getAirbearsByDriver(driverId: string): Promise<Airbear[]> {
    return Array.from(this.airbears.values()).filter(r => r.driverId === driverId);
  }

  async createAirbear(insertAirbear: InsertAirbear): Promise<Airbear> {
    const airbear: Airbear = {
      ...insertAirbear,
      id: randomUUID(),
      driverId: insertAirbear.driverId || null,
      currentSpotId: insertAirbear.currentSpotId || null,
      batteryLevel: insertAirbear.batteryLevel || 100,
      isAvailable: insertAirbear.isAvailable ?? true,
      isCharging: insertAirbear.isCharging ?? false,
      totalDistance: insertAirbear.totalDistance || "0",
      maintenanceStatus: insertAirbear.maintenanceStatus || "good",
      createdAt: new Date()
    };
    this.airbears.set(airbear.id, airbear);
    return airbear;
  }

  async updateAirbear(id: string, updates: Partial<Airbear>): Promise<Airbear> {
    const airbear = this.airbears.get(id);
    if (!airbear) throw new Error("Airbear not found");
    const updatedAirbear = { ...airbear, ...updates };
    this.airbears.set(id, updatedAirbear);
    return updatedAirbear;
  }

  // Legacy rickshaw methods
  async getAllRickshaws(): Promise<any[]> {
    return this.getAllAirbears();
  }

  async getAvailableRickshaws(): Promise<any[]> {
    return this.getAvailableAirbears();
  }

  // Rides
  async getRidesByUser(userId: string): Promise<Ride[]> {
    return Array.from(this.rides.values()).filter(r => r.userId === userId);
  }

  async getRidesByDriver(driverId: string): Promise<Ride[]> {
    return Array.from(this.rides.values()).filter(r => r.driverId === driverId);
  }

  async createRide(insertRide: InsertRide): Promise<Ride> {
    const ride: Ride = {
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
      requestedAt: new Date(),
      acceptedAt: null,
      startedAt: null,
      completedAt: null
    };
    this.rides.set(ride.id, ride);
    return ride;
  }

  async updateRide(id: string, updates: Partial<Ride>): Promise<Ride> {
    const ride = this.rides.get(id);
    if (!ride) throw new Error("Ride not found");
    const updatedRide = { ...ride, ...updates };
    this.rides.set(id, updatedRide);
    return updatedRide;
  }

  async getRideById(id: string): Promise<Ride | undefined> {
    return this.rides.get(id);
  }

  // Bodega Items
  async getAllBodegaItems(): Promise<BodegaItem[]> {
    return Array.from(this.bodegaItems.values());
  }

  async getBodegaItemsByCategory(category: string): Promise<BodegaItem[]> {
    return Array.from(this.bodegaItems.values()).filter(item => item.category === category);
  }

  async createBodegaItem(insertItem: InsertBodegaItem): Promise<BodegaItem> {
    const item: BodegaItem = {
      ...insertItem,
      id: randomUUID(),
      description: insertItem.description || null,
      imageUrl: insertItem.imageUrl || null,
      isEcoFriendly: insertItem.isEcoFriendly || false,
      isAvailable: insertItem.isAvailable ?? true,
      stock: insertItem.stock || 0,
      createdAt: new Date()
    };
    this.bodegaItems.set(item.id, item);
    return item;
  }

  async updateBodegaItem(id: string, updates: Partial<BodegaItem>): Promise<BodegaItem> {
    const item = this.bodegaItems.get(id);
    if (!item) throw new Error("Bodega item not found");
    const updatedItem = { ...item, ...updates };
    this.bodegaItems.set(id, updatedItem);
    return updatedItem;
  }

  // Orders
  async getOrdersByUser(userId: string): Promise<Order[]> {
    return Array.from(this.orders.values()).filter(o => o.userId === userId);
  }

  async createOrder(insertOrder: InsertOrder): Promise<Order> {
    const order: Order = {
      ...insertOrder,
      id: randomUUID(),
      rideId: insertOrder.rideId || null,
      airbearId: insertOrder.airbearId || null,
      status: insertOrder.status || "pending",
      notes: insertOrder.notes || null,
      createdAt: new Date()
    };
    this.orders.set(order.id, order);
    return order;
  }

  async updateOrder(id: string, updates: Partial<Order>): Promise<Order> {
    const order = this.orders.get(id);
    if (!order) throw new Error("Order not found");
    const updatedOrder = { ...order, ...updates };
    this.orders.set(id, updatedOrder);
    return updatedOrder;
  }

  // Payments
  async getPaymentsByUser(userId: string): Promise<Payment[]> {
    return Array.from(this.payments.values()).filter(p => p.userId === userId);
  }

  async createPayment(insertPayment: InsertPayment): Promise<Payment> {
    const payment: Payment = {
      ...insertPayment,
      id: randomUUID(),
      orderId: insertPayment.orderId || null,
      rideId: insertPayment.rideId || null,
      stripePaymentIntentId: insertPayment.stripePaymentIntentId || null,
      currency: insertPayment.currency || "usd",
      status: insertPayment.status || "pending",
      metadata: insertPayment.metadata || null,
      createdAt: new Date()
    };
    this.payments.set(payment.id, payment);
    return payment;
  }

  async updatePayment(id: string, updates: Partial<Payment>): Promise<Payment> {
    const payment = this.payments.get(id);
    if (!payment) throw new Error("Payment not found");
    const updatedPayment = { ...payment, ...updates };
    this.payments.set(id, updatedPayment);
    return updatedPayment;
  }
}

class SupabaseStorage implements IStorage {
  constructor(private supabase: SupabaseClient) {}

  private assert<T>(data: T | null, error: any): T {
    if (error) {
      throw new Error(error.message || "Supabase query failed");
    }
    if (data === null) {
      throw new Error("Supabase returned no data");
    }
    return data;
  }

  // Users
  async getUser(id: string): Promise<User | undefined> {
    const { data, error } = await this.supabase.from("users").select("*").eq("id", id).maybeSingle();
    if (error) throw new Error(error.message);
    return data ?? undefined;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const { data, error } = await this.supabase.from("users").select("*").eq("email", email).maybeSingle();
    if (error) throw new Error(error.message);
    return data ?? undefined;
  }

  async createUser(user: InsertUser): Promise<User> {
    const { data, error } = await this.supabase.from("users").insert(user).select().single();
    return this.assert(data as User, error);
  }

  async updateUser(id: string, updates: Partial<User>): Promise<User> {
    const { data, error } = await this.supabase.from("users").update(updates).eq("id", id).select().single();
    return this.assert(data as User, error);
  }

  async getRidesByUserAndDate(userId: string, date: string): Promise<Ride[]> {
    const start = new Date(`${date}T00:00:00.000Z`).toISOString();
    const end = new Date(`${date}T23:59:59.999Z`).toISOString();
    const { data, error } = await this.supabase
      .from("rides")
      .select("*")
      .eq("user_id", userId)
      .gte("requested_at", start)
      .lte("requested_at", end);
    return this.assert((data ?? []) as Ride[], error);
  }

  // Spots
  async getAllSpots(): Promise<Spot[]> {
    const { data, error } = await this.supabase.from("spots").select("*").eq("is_active", true).order("name");
    return this.assert((data ?? []) as Spot[], error);
  }

  async createSpot(spot: InsertSpot): Promise<Spot> {
    const { data, error } = await this.supabase.from("spots").insert(spot).select().single();
    return this.assert(data as Spot, error);
  }

  async getSpotById(id: string): Promise<Spot | undefined> {
    const { data, error } = await this.supabase.from("spots").select("*").eq("id", id).maybeSingle();
    if (error) throw new Error(error.message);
    return data ?? undefined;
  }

  // Airbears
  async getAllAirbears(): Promise<Airbear[]> {
    const { data, error } = await this.supabase.from("airbears").select("*");
    return this.assert((data ?? []) as Airbear[], error);
  }

  async getAvailableAirbears(): Promise<Airbear[]> {
    const { data, error } = await this.supabase.from("airbears").select("*").eq("is_available", true);
    return this.assert((data ?? []) as Airbear[], error);
  }

  async getAirbearsByDriver(driverId: string): Promise<Airbear[]> {
    const { data, error } = await this.supabase.from("airbears").select("*").eq("driver_id", driverId);
    return this.assert((data ?? []) as Airbear[], error);
  }

  async createAirbear(airbear: InsertAirbear): Promise<Airbear> {
    const { data, error } = await this.supabase.from("airbears").insert(airbear).select().single();
    return this.assert(data as Airbear, error);
  }

  async updateAirbear(id: string, updates: Partial<Airbear>): Promise<Airbear> {
    const { data, error } = await this.supabase.from("airbears").update(updates).eq("id", id).select().single();
    return this.assert(data as Airbear, error);
  }

  // Legacy helpers
  async getAllRickshaws(): Promise<any[]> {
    return this.getAllAirbears();
  }
  async getAvailableRickshaws(): Promise<any[]> {
    return this.getAvailableAirbears();
  }

  // Rides
  async getRidesByUser(userId: string): Promise<Ride[]> {
    const { data, error } = await this.supabase.from("rides").select("*").eq("user_id", userId).order("requested_at", { ascending: false });
    return this.assert((data ?? []) as Ride[], error);
  }

  async getRidesByDriver(driverId: string): Promise<Ride[]> {
    const { data, error } = await this.supabase.from("rides").select("*").eq("driver_id", driverId).order("requested_at", { ascending: false });
    return this.assert((data ?? []) as Ride[], error);
  }

  async createRide(ride: InsertRide): Promise<Ride> {
    const { data, error } = await this.supabase.from("rides").insert(ride).select().single();
    return this.assert(data as Ride, error);
  }

  async updateRide(id: string, updates: Partial<Ride>): Promise<Ride> {
    const { data, error } = await this.supabase.from("rides").update(updates).eq("id", id).select().single();
    return this.assert(data as Ride, error);
  }

  async getRideById(id: string): Promise<Ride | undefined> {
    const { data, error } = await this.supabase.from("rides").select("*").eq("id", id).maybeSingle();
    if (error) throw new Error(error.message);
    return data ?? undefined;
  }

  // Bodega Items
  async getAllBodegaItems(): Promise<BodegaItem[]> {
    const { data, error } = await this.supabase.from("bodega_items").select("*").eq("is_available", true).order("name");
    return this.assert((data ?? []) as BodegaItem[], error);
  }

  async getBodegaItemsByCategory(category: string): Promise<BodegaItem[]> {
    const { data, error } = await this.supabase.from("bodega_items").select("*").eq("category", category);
    return this.assert((data ?? []) as BodegaItem[], error);
  }

  async createBodegaItem(item: InsertBodegaItem): Promise<BodegaItem> {
    const { data, error } = await this.supabase.from("bodega_items").insert(item).select().single();
    return this.assert(data as BodegaItem, error);
  }

  async updateBodegaItem(id: string, updates: Partial<BodegaItem>): Promise<BodegaItem> {
    const { data, error } = await this.supabase.from("bodega_items").update(updates).eq("id", id).select().single();
    return this.assert(data as BodegaItem, error);
  }

  // Orders
  async getOrdersByUser(userId: string): Promise<Order[]> {
    const { data, error } = await this.supabase.from("orders").select("*").eq("user_id", userId).order("created_at", { ascending: false });
    return this.assert((data ?? []) as Order[], error);
  }

  async createOrder(order: InsertOrder): Promise<Order> {
    const { data, error } = await this.supabase.from("orders").insert(order).select().single();
    return this.assert(data as Order, error);
  }

  async updateOrder(id: string, updates: Partial<Order>): Promise<Order> {
    const { data, error } = await this.supabase.from("orders").update(updates).eq("id", id).select().single();
    return this.assert(data as Order, error);
  }

  // Payments
  async getPaymentsByUser(userId: string): Promise<Payment[]> {
    const { data, error } = await this.supabase.from("payments").select("*").eq("user_id", userId).order("created_at", { ascending: false });
    return this.assert((data ?? []) as Payment[], error);
  }

  async createPayment(payment: InsertPayment): Promise<Payment> {
    const { data, error } = await this.supabase.from("payments").insert(payment).select().single();
    return this.assert(data as Payment, error);
  }

  async updatePayment(id: string, updates: Partial<Payment>): Promise<Payment> {
    const { data, error } = await this.supabase.from("payments").update(updates).eq("id", id).select().single();
    return this.assert(data as Payment, error);
  }
}

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

export const storage: IStorage = supabaseUrl && supabaseServiceRoleKey
  ? (() => {
      const client = createClient(supabaseUrl, supabaseServiceRoleKey);
      console.log("✅ Supabase storage enabled");
      return new SupabaseStorage(client);
    })()
  : (() => {
      console.warn("⚠️ Using in-memory storage. Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY for persistence.");
      return new MemStorage();
    })();
