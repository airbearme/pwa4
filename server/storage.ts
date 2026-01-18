import { createClient, SupabaseClient } from "@supabase/supabase-js";
import { randomUUID } from "crypto";
import {
  User, InsertUser,
  Spot, InsertSpot,
  Airbear, InsertAirbear,
  Ride, InsertRide,
  BodegaItem, InsertBodegaItem,
  Order, InsertOrder,
  Payment, InsertPayment,
} from "../shared/schema.js";

interface IStorage {
  // Users
  getUser(id: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: string, updates: Partial<User>): Promise<User>;
  getRidesByUserAndDate(userId: string, date: string): Promise<Ride[]>;

  // Spots
  getAllSpots(): Promise<Spot[]>;
  createSpot(spot: InsertSpot): Promise<Spot>;
  getSpotById(id: string): Promise<Spot | undefined>;

  // Airbears
  getAllAirbears(): Promise<Airbear[]>;
  getAvailableAirbears(): Promise<Airbear[]>;
  getAirbearsByDriver(driverId: string): Promise<Airbear[]>;
  createAirbear(airbear: InsertAirbear): Promise<Airbear>;
  updateAirbear(id: string, updates: Partial<Airbear>): Promise<Airbear>;

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

  // Legacy API support
  getAllRickshaws(): Promise<any[]>;
  getAvailableRickshaws(): Promise<any[]>;
}

class MemStorage implements IStorage {
  private users = new Map<string, User>();
  private spots = new Map<string, Spot>();
  private airbears = new Map<string, Airbear>();
  private rides = new Map<string, Ride>();
  private bodegaItems = new Map<string, BodegaItem>();
  private orders = new Map<string, Order>();
  private payments = new Map<string, Payment>();

  constructor() {
    // Pre-seed with some data for development
    const spotsData: InsertSpot[] = [
      { name: 'Court Street Downtown', latitude: '42.099118', longitude: '-75.917538' },
      { name: 'Riverwalk BU Center', latitude: '42.098765', longitude: '-75.916543' },
      { name: 'Confluence Park', latitude: '42.090123', longitude: '-75.912345' },
    ];
    spotsData.forEach(spot => this.createSpot(spot));

    // Pre-seed bodega items with proper images
    const bodegaItems: InsertBodegaItem[] = [
      {
        name: 'Cold Brew Coffee',
        description: 'Smooth, cold-brewed coffee served over ice with a hint of vanilla',
        price: '4.50',
        imageUrl: 'https://images.unsplash.com/photo-1461023058943-07fcbe16d735?w=400&h=400&fit=crop',
        category: 'beverages',
        isEcoFriendly: true,
        stock: 25
      },
      {
        name: 'Green Smoothie Bowl',
        description: 'Organic spinach, banana, almond milk, topped with granola and berries',
        price: '8.75',
        imageUrl: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=400&h=400&fit=crop',
        category: 'food',
        isEcoFriendly: true,
        stock: 15
      },
      {
        name: 'Avocado Toast',
        description: 'Sourdough bread with smashed avocado, cherry tomatoes, and microgreens',
        price: '7.25',
        imageUrl: 'https://images.unsplash.com/photo-1541519227354-08fa5d50c44d?w=400&h=400&fit=crop',
        category: 'food',
        isEcoFriendly: true,
        stock: 20
      },
      {
        name: 'Sparkling Water',
        description: 'Naturally carbonated spring water in recyclable glass bottles',
        price: '2.50',
        imageUrl: 'https://images.unsplash.com/photo-1559839914-17aae19cec71?w=400&h=400&fit=crop',
        category: 'beverages',
        isEcoFriendly: true,
        stock: 30
      },
      {
        name: 'Dark Chocolate Bar',
        description: '70% cocoa organic dark chocolate with sea salt',
        price: '3.75',
        imageUrl: 'https://images.unsplash.com/photo-1606312619070-d48b4c652a52?w=400&h=400&fit=crop',
        category: 'snacks',
        isEcoFriendly: true,
        stock: 40
      },
      {
        name: 'Trail Mix',
        description: 'Mixed nuts, dried cranberries, and dark chocolate chips',
        price: '5.25',
        imageUrl: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=400&fit=crop',
        category: 'snacks',
        isEcoFriendly: true,
        stock: 35
      },
      {
        name: 'Herbal Tea',
        description: 'Caffeine-free chamomile tea in compostable packaging',
        price: '3.25',
        imageUrl: 'https://images.unsplash.com/photo-1544787219-7f47ccb76574?w=400&h=400&fit=crop',
        category: 'beverages',
        isEcoFriendly: true,
        stock: 22
      },
      {
        name: 'Veggie Wrap',
        description: 'Whole wheat wrap with hummus, cucumber, bell peppers, and sprouts',
        price: '6.50',
        imageUrl: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?w=400&h=400&fit=crop',
        category: 'food',
        isEcoFriendly: true,
        stock: 18
      },
      {
        name: 'Protein Bar',
        description: 'Plant-based protein bar with almonds and dates',
        price: '4.00',
        imageUrl: 'https://images.unsplash.com/photo-1621939514649-280e2ee25f60?w=400&h=400&fit=crop',
        category: 'snacks',
        isEcoFriendly: true,
        stock: 28
      },
      {
        name: 'Matcha Latte',
        description: 'Ceremonial grade matcha with oat milk and honey',
        price: '5.75',
        imageUrl: 'https://images.unsplash.com/photo-1536256263959-770b48d82b0a?w=400&h=400&fit=crop',
        category: 'beverages',
        isEcoFriendly: true,
        stock: 16
      },
      {
        name: 'Reusable Water Bottle',
        description: 'Stainless steel insulated water bottle - perfect for eco-conscious riders',
        price: '24.99',
        imageUrl: 'https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=400&h=400&fit=crop',
        category: 'accessories',
        isEcoFriendly: true,
        stock: 12
      },
      {
        name: 'Bamboo Toothbrush',
        description: 'Biodegradable bamboo toothbrush with charcoal bristles',
        price: '4.99',
        imageUrl: 'https://images.unsplash.com/photo-1559599101-f09722fb4948?w=400&h=400&fit=crop',
        category: 'accessories',
        isEcoFriendly: true,
        stock: 25
      }
    ];
    bodegaItems.forEach(item => this.createBodegaItem(item));

    // Pre-seed an airbear for testing
    const firstSpot = Array.from(this.spots.values())[0];
    if (firstSpot) {
      this.createAirbear({
        driverId: null,
        currentSpotId: firstSpot.id,
        latitude: '42.099118',
        longitude: '-75.917538',
        batteryLevel: 85,
        isAvailable: true,
        isCharging: false,
        maintenanceStatus: 'good'
      });
    }
  }

  // Users
  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(u => u.email === email);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const user: User = {
      ...insertUser,
      id: insertUser.id || randomUUID(),
      fullName: insertUser.fullName || null,
      avatarUrl: insertUser.avatarUrl || null,
      role: insertUser.role || "user",
      ecoPoints: insertUser.ecoPoints || 0,
      totalRides: insertUser.totalRides || 0,
      co2Saved: insertUser.co2Saved || "0",
      hasCeoTshirt: insertUser.hasCeoTshirt || false,
      stripeCustomerId: insertUser.stripeCustomerId ?? null,
      stripeSubscriptionId: insertUser.stripeSubscriptionId ?? null,
      tshirtPurchaseDate: insertUser.tshirtPurchaseDate || null,
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
    const start = new Date(`${date}T00:00:00.000Z`);
    const end = new Date(`${date}T23:59:59.999Z`);
    return Array.from(this.rides.values()).filter(r =>
      r.userId === userId &&
      r.requestedAt >= start &&
      r.requestedAt <= end
    );
  }

  // Spots
  async getAllSpots(): Promise<Spot[]> {
    return Array.from(this.spots.values());
  }

  async createSpot(insertSpot: InsertSpot): Promise<Spot> {
    const spot: Spot = {
      ...insertSpot,
      id: randomUUID(),
      isActive: insertSpot.isActive ?? true,
      createdAt: new Date()
    };
    this.spots.set(spot.id, spot);
    return spot;
  }

  async getSpotById(id: string): Promise<Spot | undefined> {
    return this.spots.get(id);
  }

  // Airbears
  async getAllAirbears(): Promise<Airbear[]> {
    return Array.from(this.airbears.values());
  }

  async getAvailableAirbears(): Promise<Airbear[]> {
    return Array.from(this.airbears.values()).filter(a => a.isAvailable);
  }

  async getAirbearsByDriver(driverId: string): Promise<Airbear[]> {
    return Array.from(this.airbears.values()).filter(a => a.driverId === driverId);
  }

  async createAirbear(insertAirbear: InsertAirbear): Promise<Airbear> {
    const airbear: Airbear = {
      ...insertAirbear,
      id: randomUUID(),
      driverId: insertAirbear.driverId || null,
      currentSpotId: insertAirbear.currentSpotId || null,
      latitude: insertAirbear.latitude ?? null,
      longitude: insertAirbear.longitude ?? null,
      heading: insertAirbear.heading ?? null,
      batteryLevel: insertAirbear.batteryLevel || 100,
      isAvailable: insertAirbear.isAvailable ?? true,
      isCharging: insertAirbear.isCharging || false,
      maintenanceStatus: insertAirbear.maintenanceStatus || "good",
      totalDistance: "0",
      createdAt: new Date(),
      updatedAt: new Date()
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

  // Legacy API support
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
      fare: insertRide.fare || "0",
      distance: insertRide.distance || null,
      estimatedDuration: insertRide.estimatedDuration || null,
      actualDuration: insertRide.actualDuration || null,
      co2Saved: insertRide.co2Saved || null,
      isFreeTshirtRide: insertRide.isFreeTshirtRide || false,
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
    return Array.from(this.bodegaItems.values()).filter(i => i.category === category);
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
    if (!item) throw new Error("Item not found");
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
  constructor(private supabase: SupabaseClient) { }

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
const supabaseSecretKey = process.env.SUPABASE_SECRET_KEY;

// Force using MemStorage for development/testing when using test credentials
const isUsingTestCredentials =
  supabaseUrl?.includes('test-project.supabase.co') ||
  supabaseSecretKey?.includes('test-supabase-secret-key-for-development-only');

// Also force MemStorage if USE_MOCK_DATABASE is explicitly set
const useMockDatabase = process.env.USE_MOCK_DATABASE === 'true' ||
                       process.env.NODE_ENV === 'development' ||
                       process.env.VERCEL_ENV === 'development';

export const storage: IStorage = !isUsingTestCredentials && !useMockDatabase && supabaseUrl && supabaseSecretKey
  ? (() => {
    console.log('=€ Using SupabaseStorage for production');
    const client = createClient(supabaseUrl, supabaseSecretKey);
    return new SupabaseStorage(client);
  })()
  : (() => {
    console.log('=¾ Using MemStorage for development/testing');
    return new MemStorage();
  })();