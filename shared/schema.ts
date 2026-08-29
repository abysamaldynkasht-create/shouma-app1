import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, jsonb, serial, timestamp, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const conversations = pgTable("conversations", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`).notNull(),
});

export const messages = pgTable("messages", {
  id: serial("id").primaryKey(),
  conversationId: integer("conversation_id").notNull().references(() => conversations.id, { onDelete: "cascade" }),
  role: text("role").notNull(),
  content: text("content").notNull(),
  createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`).notNull(),
});

export const insertConversationSchema = createInsertSchema(conversations).omit({
  id: true,
  createdAt: true,
});

export const insertMessageSchema = createInsertSchema(messages).omit({
  id: true,
  createdAt: true,
});

export type Conversation = typeof conversations.$inferSelect;
export type InsertConversation = z.infer<typeof insertConversationSchema>;
export type Message = typeof messages.$inferSelect;
export type InsertMessage = z.infer<typeof insertMessageSchema>;

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  email: text("email"),
  phone: text("phone"),
  isVerified: boolean("is_verified").default(false),
  verificationCode: text("verification_code"),
  verifiedVia: text("verified_via"),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  email: true,
  phone: true,
}).extend({
  email: z.string().email("البريد الإلكتروني غير صالح").optional().or(z.literal("")),
  phone: z.string().optional().or(z.literal("")),
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export const questionnaireSchema = z.object({
  duration: z.number().min(1).max(30),
  budget: z.enum(["low", "medium", "high", "luxury"]),
  interests: z.array(z.string()),
  groupSize: z.number().min(1).max(20),
  preferredActivities: z.array(z.string()),
  accommodation: z.enum(["hotel", "resort", "apartment", "hostel"]),
  hotelPreference: z.enum(["single", "multiple"]).optional(),
  mealPreference: z.enum(["local", "international", "mixed"]),
  governorates: z.array(z.string()).optional(),
});

export type QuestionnaireData = z.infer<typeof questionnaireSchema>;

export const governorates = [
  { id: "muscat", nameAr: "محافظة مسقط", nameEn: "Muscat" },
  { id: "dhofar", nameAr: "محافظة ظفار", nameEn: "Dhofar" },
  { id: "dakhiliyah", nameAr: "محافظة الداخلية", nameEn: "Ad Dakhiliyah" },
  { id: "north_batinah", nameAr: "محافظة شمال الباطنة", nameEn: "North Al Batinah" },
  { id: "south_batinah", nameAr: "محافظة جنوب الباطنة", nameEn: "South Al Batinah" },
  { id: "musandam", nameAr: "محافظة مسندم", nameEn: "Musandam" },
  { id: "buraimi", nameAr: "محافظة البريمي", nameEn: "Al Buraimi" },
  { id: "wusta", nameAr: "محافظة الوسطى", nameEn: "Al Wusta" },
  { id: "north_sharqiyah", nameAr: "محافظة شمال الشرقية", nameEn: "North Ash Sharqiyah" },
  { id: "south_sharqiyah", nameAr: "محافظة جنوب الشرقية", nameEn: "South Ash Sharqiyah" },
  { id: "dhahirah", nameAr: "محافظة الظاهرة", nameEn: "Ad Dhahirah" },
];

export interface ItineraryActivity {
  time: string;
  activity: string;
  location: string;
  type: "attraction" | "restaurant" | "hotel" | "transport" | "activity";
  image?: string;
  description?: string;
  rating?: string;
  itemId?: string;
  estimatedCost?: number;
  category?: string;
}

export interface ItineraryDay {
  day: number;
  title: string;
  activities: ItineraryActivity[];
}

export interface BudgetSummary {
  hotels: number;
  restaurants: number;
  attractions: number;
  activities: number;
  transport: number;
  total: number;
}

export interface Itinerary {
  id: string;
  title: string;
  duration: number;
  budget: string;
  governorates: string[];
  days: ItineraryDay[];
  budgetSummary?: BudgetSummary;
  noMatchingAccommodation?: boolean;
  requestedAccommodation?: string;
}

export interface Category {
  id: string;
  title: string;
  titleAr: string;
  icon: string;
  description: string;
  color: string;
}

export interface Attraction {
  id: string;
  name: string;
  nameAr: string;
  description: string;
  descriptionEn?: string;
  descriptionFr?: string;
  descriptionTr?: string;
  governorate: string;
  governorateId: string;
  wilayat: string;
  category: string;
  image: string;
  mapUrl: string | null;
  rating: string;
  lat?: number;
  lng?: number;
  additionalImages?: string[];
  tags?: string[] | string;
}

export interface RoomOption {
  id: string;
  name: string;
  nameAr: string;
  description: string;
  pricePerNight: number;
  maxGuests: number;
  amenities: string[];
  image?: string;
}

export interface HotelReview {
  id: string;
  userName: string;
  rating: number;
  comment: string;
  date: string;
}

export interface RestaurantReview {
  id: string;
  restaurantId: string;
  userName: string;
  rating: number;
  comment: string;
  date: string;
}

export const insertRestaurantReviewSchema = z.object({
  restaurantId: z.string(),
  userName: z.string().min(2),
  rating: z.number().min(1).max(5),
  comment: z.string().min(5),
});

export type InsertRestaurantReview = z.infer<typeof insertRestaurantReviewSchema>;

export interface Hotel {
  id: string;
  name: string;
  nameAr: string;
  description: string;
  descriptionEn?: string;
  descriptionFr?: string;
  descriptionTr?: string;
  city: string;
  region: string;
  image: string;
  gallery: string[];
  amenities: string[];
  rating: number;
  pricePerNight: number;
  stars: number;
  phone: string;
  mapUrl?: string;
  roomOptions?: RoomOption[];
  reviews?: HotelReview[];
  splitShoumaPct?: number;
  splitHotelPct?: number;
  additionalImages?: string;
  bankAccount?: string;
}

export interface Restaurant {
  id: string;
  name: string;
  nameAr: string;
  description: string;
  descriptionEn?: string;
  descriptionFr?: string;
  descriptionTr?: string;
  city: string;
  region: string;
  image: string;
  cuisine: string;
  priceRange: "budget" | "moderate" | "expensive" | "luxury";
  rating: number;
  features: string[];
  mapUrl?: string;
  additionalImages?: string;
}

export interface Taxi {
  id: string;
  name: string;
  nameAr: string;
  description: string;
  city: string;
  region: string;
  image: string;
  vehicleType: string;
  pricePerKm: number;
  rating: number;
  features: string[];
  phone: string;
  destinations?: string[];
}

export const groupTripRequests = pgTable("group_trip_requests", {
  id: serial("id").primaryKey(),
  numberOfPeople: integer("number_of_people").notNull(),
  numberOfDays: integer("number_of_days").notNull(),
  preferences: text("preferences").array().notNull(),
  country: text("country").notNull(),
  arrivalDate: text("arrival_date").notNull(),
  destinationPreference: text("destination_preference").notNull(),
  selectedGovernorate: text("selected_governorate"),
  createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`).notNull(),
});

export const insertGroupTripRequestSchema = createInsertSchema(groupTripRequests).omit({
  id: true,
  createdAt: true,
}).refine((data) => {
  if (data.destinationPreference === "single" && !data.selectedGovernorate) {
    return false;
  }
  return true;
}, {
  message: "selectedGovernorate is required when destinationPreference is 'single'",
  path: ["selectedGovernorate"],
});

export type GroupTripRequest = typeof groupTripRequests.$inferSelect;
export type InsertGroupTripRequest = z.infer<typeof insertGroupTripRequestSchema>;

export const tourRequests = pgTable("tour_requests", {
  id: serial("id").primaryKey(),
  guideId: integer("guide_id").notNull(),
  userName: text("user_name").notNull(),
  email: text("email").notNull(),
  phone: text("phone").notNull(),
  groupSize: integer("group_size").notNull(),
  hours: integer("hours").notNull(),
  tripDate: text("trip_date").notNull(),
  destination: text("destination").notNull(),
  details: text("details").notNull(),
  status: text("status").default("pending").notNull(),
  createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`).notNull(),
});

export const insertTourRequestSchema = createInsertSchema(tourRequests).omit({
  id: true,
  createdAt: true,
});

export type TourRequest = typeof tourRequests.$inferSelect;
export type InsertTourRequest = z.infer<typeof insertTourRequestSchema>;

export interface HikingTrip {
  id: string;
  name: string;
  nameAr: string;
  description: string;
  location: string;
  region: string;
  image: string;
  gallery: string[];
  difficulty: "easy" | "moderate" | "hard" | "expert";
  duration: string;
  distance: string;
  price: number;
  includes: string[];
  rating: number;
  phone: string;
}

export const userSettings = pgTable("user_settings", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id").notNull().unique().references(() => users.id, { onDelete: "cascade" }),
  currency: varchar("currency", { length: 3 }).notNull().default("OMR"),
  gpsEnabled: boolean("gps_enabled").notNull().default(true),
  distanceUnit: varchar("distance_unit", { length: 2 }).notNull().default("km"),
  bookingNotifications: boolean("booking_notifications").notNull().default(true),
  promoNotifications: boolean("promo_notifications").notNull().default(true),
  updatedAt: timestamp("updated_at").default(sql`CURRENT_TIMESTAMP`).notNull(),
});

export const insertUserSettingsSchema = createInsertSchema(userSettings).omit({
  id: true,
  updatedAt: true,
}).extend({
  currency: z.enum(["OMR", "USD", "AED"]).default("OMR"),
  distanceUnit: z.enum(["km", "mi"]).default("km"),
});

export type UserSettings = typeof userSettings.$inferSelect;
export type InsertUserSettings = z.infer<typeof insertUserSettingsSchema>;
