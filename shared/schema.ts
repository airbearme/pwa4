import { pgTable, text, uuid, timestamp, integer, boolean, decimal, pgEnum, jsonb } from 'drizzle-orm/pg-core';
import { createInsertSchema } from 'drizzle-zod';

export const userRole = pgEnum('user_role', ['user', 'driver', 'admin']);
export const rideStatus = pgEnum('ride_status', ['pending', 'accepted', 'in_progress', 'completed', 'cancelled']);
export const paymentStatus = pgEnum('payment_status', ['pending', 'completed', 'failed', 'refunded']);
export const paymentMethod = pgEnum('payment_method', ['stripe', 'apple_pay', 'google_pay', 'cash']);
export const maintenanceStatus = pgEnum('maintenance_status', ['excellent', 'good', 'needs_service', 'out_of_service']);

export const users = pgTable('users', {
  id: uuid('id').defaultRandom().primaryKey(),
  email: text('email').notNull().unique(),
  username: text('username').notNull().unique(),
  fullName: text('full_name'),
  avatarUrl: text('avatar_url'),
  role: userRole('role').notNull().default('user'),
  stripeCustomerId: text('stripe_customer_id'),
  stripeSubscriptionId: text('stripe_subscription_id'),
  ecoPoints: integer('eco_points').notNull().default(0),
  totalRides: integer('total_rides').notNull().default(0),
  co2Saved: decimal('co2_saved', { precision: 10, scale: 2 }).notNull().default('0'),
  hasCeoTshirt: boolean('has_ceo_tshirt').notNull().default(false),
  tshirtPurchaseDate: timestamp('tshirt_purchase_date', { withTimezone: true }),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow(),
});

export const spots = pgTable('spots', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: text('name').notNull(),
  latitude: decimal('latitude', { precision: 10, scale: 8 }).notNull(),
  longitude: decimal('longitude', { precision: 11, scale: 8 }).notNull(),
  description: text('description'),
  amenities: text('amenities').array(),
  isActive: boolean('is_active').notNull().default(true),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
});

export const airbears = pgTable('airbears', {
  id: uuid('id').defaultRandom().primaryKey(),
  driverId: uuid('driver_id').references(() => users.id),
  currentSpotId: uuid('current_spot_id').references(() => spots.id),
  batteryLevel: integer('battery_level').notNull().default(100),
  isAvailable: boolean('is_available').notNull().default(true),
  isCharging: boolean('is_charging').notNull().default(false),
  totalDistance: decimal('total_distance', { precision: 10, scale: 2 }).notNull().default('0'),
  maintenanceStatus: maintenanceStatus('maintenance_status').notNull().default('good'),
  solarPanelEfficiency: decimal('solar_panel_efficiency', { precision: 5, scale: 2 }).notNull().default('95.0'),
  lastMaintenance: timestamp('last_maintenance', { withTimezone: true }).defaultNow(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
});

export const rides = pgTable('rides', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id').notNull().references(() => users.id),
  driverId: uuid('driver_id').references(() => users.id),
  airbearId: uuid('airbear_id').references(() => airbears.id),
  pickupSpotId: uuid('pickup_spot_id').notNull().references(() => spots.id),
  destinationSpotId: uuid('destination_spot_id').notNull().references(() => spots.id),
  status: rideStatus('status').notNull().default('pending'),
  estimatedDuration: integer('estimated_duration'),
  actualDuration: integer('actual_duration'),
  distance: decimal('distance', { precision: 8, scale: 2 }),
  co2Saved: decimal('co2_saved', { precision: 8, scale: 2 }),
  fare: decimal('fare', { precision: 8, scale: 2 }).notNull(),
  isFreeTshirtRide: boolean('is_free_tshirt_ride').notNull().default(false),
  requestedAt: timestamp('requested_at', { withTimezone: true }).defaultNow(),
  acceptedAt: timestamp('accepted_at', { withTimezone: true }),
  startedAt: timestamp('started_at', { withTimezone: true }),
  completedAt: timestamp('completed_at', { withTimezone: true }),
});

export const bodegaItems = pgTable('bodega_items', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: text('name').notNull(),
  description: text('description'),
  price: decimal('price', { precision: 8, scale: 2 }).notNull(),
  imageUrl: text('image_url'),
  category: text('category').notNull(),
  isEcoFriendly: boolean('is_eco_friendly').notNull().default(false),
  isAvailable: boolean('is_available').notNull().default(true),
  isCeoSpecial: boolean('is_ceo_special').notNull().default(false),
  stock: integer('stock').notNull().default(0),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
});

export const airbearInventory = pgTable('airbear_inventory', {
  id: uuid('id').defaultRandom().primaryKey(),
  airbearId: uuid('airbear_id').notNull().references(() => airbears.id),
  itemId: uuid('item_id').notNull().references(() => bodegaItems.id),
  quantity: integer('quantity').notNull().default(0),
  lastRestocked: timestamp('last_restocked', { withTimezone: true }).defaultNow(),
});

export const orders = pgTable('orders', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id').notNull().references(() => users.id),
  rideId: uuid('ride_id').references(() => rides.id),
  airbearId: uuid('airbear_id').references(() => airbears.id),
  items: jsonb('items').notNull(),
  totalAmount: decimal('total_amount', { precision: 10, scale: 2 }).notNull(),
  status: text('status').notNull().default('pending'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
});

export const payments = pgTable('payments', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id').notNull().references(() => users.id),
  orderId: uuid('order_id').references(() => orders.id),
  rideId: uuid('ride_id').references(() => rides.id),
  stripePaymentIntentId: text('stripe_payment_intent_id'),
  amount: decimal('amount', { precision: 10, scale: 2 }).notNull(),
  currency: text('currency').notNull().default('usd'),
  status: paymentStatus('status').notNull().default('pending'),
  paymentMethod: paymentMethod('payment_method').notNull(),
  metadata: jsonb('metadata'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
});

export const advertisingPackages = pgTable('advertising_packages', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: text('name').notNull(),
  description: text('description'),
  price: decimal('price', { precision: 8, scale: 2 }).notNull(),
  features: text('features').array(),
  includesLedBanner: boolean('includes_led_banner').notNull().default(false),
  includesScreenAds: boolean('includes_screen_ads').notNull().default(false),
  includesWebsiteAds: boolean('includes_website_ads').notNull().default(true),
  isActive: boolean('is_active').notNull().default(true),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
});

export const insertRideSchema = createInsertSchema(rides);
export const insertOrderSchema = createInsertSchema(orders);
export const insertPaymentSchema = createInsertSchema(payments);
