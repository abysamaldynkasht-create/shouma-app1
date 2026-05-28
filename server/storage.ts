import { 
  type User, 
  type InsertUser, 
  type RestaurantReview, 
  type InsertRestaurantReview, 
  type GroupTripRequest, 
  type InsertGroupTripRequest, 
  type TourRequest, 
  type InsertTourRequest,
  users,
  groupTripRequests,
  tourRequests
} from "@shared/schema";
import { randomUUID } from "crypto";
import { db } from "./db";
import { eq, desc, sql } from "drizzle-orm";

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  getRestaurantReviews(restaurantId: string): Promise<RestaurantReview[]>;
  createRestaurantReview(review: InsertRestaurantReview): Promise<RestaurantReview>;
  createGroupTripRequest(request: InsertGroupTripRequest): Promise<GroupTripRequest>;
  getGroupTripRequests(): Promise<GroupTripRequest[]>;
  createTourRequest(request: InsertTourRequest): Promise<TourRequest>;
  getTourRequests(guideId?: number): Promise<TourRequest[]>;
  getTourRequestById(id: number): Promise<TourRequest | undefined>;
  updateTourRequestStatus(id: number, status: string): Promise<TourRequest>;
  getGuideAvailability(guideId: number): Promise<boolean>;
  setGuideAvailability(guideId: number, available: boolean): Promise<boolean>;

  // Dynamic admin additions and updates
  getDbTourGuides(): Promise<any[]>;
  createDbTourGuide(guide: any): Promise<any>;
  updateDbTourGuide(id: number, guide: any): Promise<any>;
  deleteDbTourGuide(id: number): Promise<void>;
  getLatestAnnouncement(): Promise<any>;
  createOrUpdateAnnouncement(title: string, message: string, isActive?: boolean): Promise<any>;
  getDbAttractions(): Promise<any[]>;
  createDbAttraction(attr: any): Promise<any>;
  deleteDbAttraction(id: number): Promise<void>;
  getDbHotels(): Promise<any[]>;
  createDbHotel(hotel: any): Promise<any>;
  deleteDbHotel(id: number): Promise<void>;
  getDbRestaurants(): Promise<any[]>;
  createDbRestaurant(rest: any): Promise<any>;
  deleteDbRestaurant(id: number): Promise<void>;

  // Media upload storage helpers
  getMediaAssets(): Promise<any[]>;
  createMediaAsset(asset: any): Promise<any>;
  deleteMediaAsset(id: number): Promise<void>;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }

  async getRestaurantReviews(restaurantId: string): Promise<RestaurantReview[]> {
    const res = await db.execute(sql`
      SELECT id::text, restaurant_id::text as "restaurantId", user_name as "userName", rating, comment, date 
      FROM restaurant_reviews 
      WHERE restaurant_id = ${parseInt(restaurantId, 10)}
      ORDER BY date DESC
    `);
    return res.rows as unknown as RestaurantReview[];
  }

  async createRestaurantReview(insertReview: InsertRestaurantReview): Promise<RestaurantReview> {
    const dateStr = new Date().toISOString().split('T')[0];
    const maxIdResult = await db.execute(sql`SELECT COALESCE(MAX(id), 0) + 1 as next_id FROM restaurant_reviews`);
    const nextId = (maxIdResult.rows[0] as any).next_id;

    await db.execute(sql`
      INSERT INTO restaurant_reviews (id, restaurant_id, user_name, rating, comment, date)
      VALUES (
        ${nextId}, 
        ${parseInt(insertReview.restaurantId, 10)}, 
        ${insertReview.userName}, 
        ${insertReview.rating}, 
        ${insertReview.comment}, 
        ${dateStr}
      )
    `);

    return {
      id: nextId.toString(),
      restaurantId: insertReview.restaurantId,
      userName: insertReview.userName,
      rating: insertReview.rating,
      comment: insertReview.comment,
      date: dateStr,
    };
  }

  async createGroupTripRequest(request: InsertGroupTripRequest): Promise<GroupTripRequest> {
    const [tripRequest] = await db
      .insert(groupTripRequests)
      .values({
        ...request,
        createdAt: new Date(),
      })
      .returning();
    return tripRequest;
  }

  async getGroupTripRequests(): Promise<GroupTripRequest[]> {
    return await db
      .select()
      .from(groupTripRequests)
      .orderBy(desc(groupTripRequests.createdAt));
  }

  async createTourRequest(request: InsertTourRequest): Promise<TourRequest> {
    const [tourReq] = await db
      .insert(tourRequests)
      .values({
        ...request,
        status: request.status || "pending",
        createdAt: new Date(),
      })
      .returning();
    return tourReq;
  }

  async getTourRequests(guideId?: number): Promise<TourRequest[]> {
    if (guideId !== undefined) {
      return await db
        .select()
        .from(tourRequests)
        .where(eq(tourRequests.guideId, guideId))
        .orderBy(desc(tourRequests.createdAt));
    }
    return await db
      .select()
      .from(tourRequests)
      .orderBy(desc(tourRequests.createdAt));
  }

  async getTourRequestById(id: number): Promise<TourRequest | undefined> {
    const [request] = await db
      .select()
      .from(tourRequests)
      .where(eq(tourRequests.id, id));
    return request;
  }

  async updateTourRequestStatus(id: number, status: string): Promise<TourRequest> {
    const [updated] = await db
      .update(tourRequests)
      .set({ status })
      .where(eq(tourRequests.id, id))
      .returning();
    if (!updated) {
      throw new Error(`Tour request with ID ${id} not found`);
    }
    return updated;
  }

  async getGuideAvailability(guideId: number): Promise<boolean> {
    const res = await db.execute(sql`
      SELECT available 
      FROM guide_availability 
      WHERE guide_id = ${guideId}
    `);
    if (res.rows.length === 0) {
      return true;
    }
    return (res.rows[0] as any).available;
  }

  async setGuideAvailability(guideId: number, available: boolean): Promise<boolean> {
    await db.execute(sql`
      INSERT INTO guide_availability (guide_id, available)
      VALUES (${guideId}, ${available})
      ON CONFLICT (guide_id)
      DO UPDATE SET available = EXCLUDED.available
    `);
    return available;
  }

  // --- Dynamic admin additions and updates ---
  async getDbTourGuides(): Promise<any[]> {
    const res = await db.execute(sql`SELECT * FROM db_tour_guides ORDER BY id DESC`);
    return res.rows;
  }

  async createDbTourGuide(guide: any): Promise<any> {
    const langs = Array.isArray(guide.languages) ? guide.languages : ['العربية', 'الإنجليزية'];
    const langsStr = `{${langs.map((l: any) => `"${String(l).replace(/"/g, '\\"')}"`).join(',')}}`;

    const services = Array.isArray(guide.services) ? guide.services : [];
    const servicesStr = `{${services.map((s: any) => `"${String(s).replace(/"/g, '\\"')}"`).join(',')}}`;

    const experienceNum = parseInt(guide.experience, 10) || 3;
    const reviewsCountNum = parseInt(guide.reviewsCount || guide.reviews_count, 10) || 12;
    const pricePerDayNum = parseInt(guide.pricePerDay || guide.price_per_day, 10) || 45;

    const res = await db.execute(sql`
      INSERT INTO db_tour_guides (name, name_ar, specialization, specialization_ar, languages, experience, city, description, image_url, phone, whatsapp, rating, reviews_count, price_per_day, services, availability, email, password, additional_images, bank_account)
      VALUES (
        ${guide.name}, ${guide.nameAr || guide.name_ar || ''}, ${guide.specialization}, ${guide.specializationAr || guide.specialization_ar || ''}, 
        ${langsStr}, ${experienceNum}, ${guide.city}, ${guide.description}, 
        ${guide.imageUrl || guide.image_url || ''}, ${guide.phone}, ${guide.whatsapp}, ${guide.rating || '4.8'}, 
        ${reviewsCountNum}, ${pricePerDayNum}, 
        ${servicesStr}, ${guide.availability !== false},
        ${guide.email || ''}, ${guide.password || 'shouma2026'}, ${guide.additionalImages || guide.additional_images || ''}, ${guide.bankAccount || guide.bank_account || ''}
      )
      RETURNING *
    `);
    return res.rows[0];
  }

  async updateDbTourGuide(id: number, guide: any): Promise<any> {
    const langs = Array.isArray(guide.languages) ? guide.languages : ['العربية', 'الإنجليزية'];
    const langsStr = `{${langs.map((l: any) => `"${String(l).replace(/"/g, '\\"')}"`).join(',')}}`;

    const services = Array.isArray(guide.services) ? guide.services : [];
    const servicesStr = `{${services.map((s: any) => `"${String(s).replace(/"/g, '\\"')}"`).join(',')}}`;

    const experienceNum = parseInt(guide.experience, 10) || 3;
    const pricePerDayNum = parseInt(guide.pricePerDay || guide.price_per_day, 10) || 45;

    const res = await db.execute(sql`
      UPDATE db_tour_guides
      SET 
        name = ${guide.name},
        name_ar = ${guide.nameAr || guide.name_ar || ''},
        specialization = ${guide.specialization},
        specialization_ar = ${guide.specializationAr || guide.specialization_ar || ''},
        languages = ${langsStr},
        experience = ${experienceNum},
        city = ${guide.city},
        description = ${guide.description},
        image_url = ${guide.imageUrl || guide.image_url || ''},
        phone = ${guide.phone},
        whatsapp = ${guide.whatsapp},
        price_per_day = ${pricePerDayNum},
        services = ${servicesStr},
        email = ${guide.email || ''},
        password = ${guide.password || 'shouma2026'},
        additional_images = ${guide.additionalImages || guide.additional_images || ''},
        bank_account = ${guide.bank_account || guide.bankAccount || ''}
      WHERE id = ${id}
      RETURNING *
    `);
    return res.rows[0];
  }

  async deleteDbTourGuide(id: number): Promise<void> {
    await db.execute(sql`DELETE FROM db_tour_guides WHERE id = ${id}`);
  }

  async getLatestAnnouncement(): Promise<any> {
    const res = await db.execute(sql`SELECT * FROM announcements WHERE is_active = true ORDER BY id DESC LIMIT 1`);
    return res.rows[0];
  }

  async createOrUpdateAnnouncement(title: string, message: string, isActive: boolean = true): Promise<any> {
    await db.execute(sql`UPDATE announcements SET is_active = false`);
    const res = await db.execute(sql`
      INSERT INTO announcements (title, message, is_active)
      VALUES (${title}, ${message}, ${isActive})
      RETURNING *
    `);
    return res.rows[0];
  }

  async getDbAttractions(): Promise<any[]> {
    const res = await db.execute(sql`SELECT * FROM db_attractions ORDER BY id DESC`);
    return res.rows;
  }

  async createDbAttraction(attr: any): Promise<any> {
    const tags = Array.isArray(attr.tags) ? attr.tags : (attr.tags ? String(attr.tags).split(',').map(x => x.trim()) : []);
    const tagsStr = `{${tags.map((f: any) => `"${String(f).replace(/"/g, '\\"')}"`).join(',')}}`;
    const res = await db.execute(sql`
      INSERT INTO db_attractions (name, name_ar, description, governorate, governorate_id, wilayat, category, image, map_url, rating, additional_images, tags)
      VALUES (${attr.name}, ${attr.nameAr}, ${attr.description}, ${attr.governorate}, ${attr.governorateId}, ${attr.wilayat}, ${attr.category}, ${attr.image}, ${attr.mapUrl}, ${attr.rating || '4.8'}, ${attr.additionalImages || attr.additional_images || ''}, ${tagsStr})
      RETURNING *
    `);
    return res.rows[0];
  }

  async deleteDbAttraction(id: number): Promise<void> {
    await db.execute(sql`DELETE FROM db_attractions WHERE id = ${id}`);
  }

  async getDbHotels(): Promise<any[]> {
    const res = await db.execute(sql`SELECT * FROM db_hotels ORDER BY id DESC`);
    return res.rows;
  }

  async createDbHotel(hotel: any): Promise<any> {
    const amens = Array.isArray(hotel.amenities) ? hotel.amenities : (hotel.amenities ? String(hotel.amenities).split(',').map(x => x.trim()) : []);
    const amensStr = `{${amens.map((f: any) => `"${String(f).replace(/"/g, '\\"')}"`).join(',')}}`;
    const res = await db.execute(sql`
      INSERT INTO db_hotels (name, name_ar, description, city, region, image, rating, price_per_night, stars, phone, map_url, additional_images, bank_account, amenities)
      VALUES (${hotel.name}, ${hotel.nameAr}, ${hotel.description}, ${hotel.city}, ${hotel.region}, ${hotel.image}, ${hotel.rating || 4.8}, ${hotel.pricePerNight || 55}, ${hotel.stars || 4}, ${hotel.phone}, ${hotel.mapUrl}, ${hotel.additionalImages || hotel.additional_images || ''}, ${hotel.bankAccount || hotel.bank_account || ''}, ${amensStr})
      RETURNING *
    `);
    return res.rows[0];
  }

  async deleteDbHotel(id: number): Promise<void> {
    await db.execute(sql`DELETE FROM db_hotels WHERE id = ${id}`);
  }

  async getDbRestaurants(): Promise<any[]> {
    const res = await db.execute(sql`SELECT * FROM db_restaurants ORDER BY id DESC`);
    return res.rows;
  }

  async createDbRestaurant(rest: any): Promise<any> {
    const feats = Array.isArray(rest.features) ? rest.features : (rest.features ? String(rest.features).split(',').map(x => x.trim()) : []);
    const featsStr = `{${feats.map((f: any) => `"${String(f).replace(/"/g, '\\"')}"`).join(',')}}`;

    const ratingNum = parseFloat(rest.rating) || 4.8;

    const res = await db.execute(sql`
      INSERT INTO db_restaurants (name, name_ar, description, city, region, image, cuisine, price_range, rating, features, map_url, additional_images)
      VALUES (${rest.name}, ${rest.nameAr}, ${rest.description}, ${rest.city}, ${rest.region}, ${rest.image}, ${rest.cuisine}, ${rest.priceRange || 'moderate'}, ${ratingNum}, ${featsStr}, ${rest.mapUrl}, ${rest.additionalImages || rest.additional_images || ''})
      RETURNING *
    `);
    return res.rows[0];
  }

  async deleteDbRestaurant(id: number): Promise<void> {
    await db.execute(sql`DELETE FROM db_restaurants WHERE id = ${id}`);
  }

  async getMediaAssets(): Promise<any[]> {
    const res = await db.execute(sql`SELECT * FROM media_assets ORDER BY id DESC`);
    return res.rows;
  }

  async createMediaAsset(asset: any): Promise<any> {
    const res = await db.execute(sql`
      INSERT INTO media_assets (filename, url, file_type, mime_type, size, storage_key_used)
      VALUES (${asset.filename}, ${asset.url}, ${asset.fileType}, ${asset.mimeType}, ${asset.size}, ${asset.storageKeyUsed})
      RETURNING *
    `);
    return res.rows[0];
  }

  async deleteMediaAsset(id: number): Promise<void> {
    await db.execute(sql`DELETE FROM media_assets WHERE id = ${id}`);
  }
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private restaurantReviews: Map<string, RestaurantReview>;
  private groupTripRequests: Map<number, GroupTripRequest>;
  private groupTripNextId: number;
  private tourRequests: Map<number, TourRequest>;
  private tourRequestNextId: number;
  private guideAvailability: Map<number, boolean>;

  // MemStorage Stubs for Admin operations
  async getDbTourGuides(): Promise<any[]> { return []; }
  async createDbTourGuide(guide: any): Promise<any> { return guide; }
  async updateDbTourGuide(id: number, guide: any): Promise<any> { return { ...guide, id }; }
  async deleteDbTourGuide(id: number): Promise<void> {}
  async getLatestAnnouncement(): Promise<any> { return null; }
  async createOrUpdateAnnouncement(title: string, message: string, isActive?: boolean): Promise<any> { return { title, message, isActive }; }
  async getDbAttractions(): Promise<any[]> { return []; }
  async createDbAttraction(attr: any): Promise<any> { return attr; }
  async deleteDbAttraction(id: number): Promise<void> {}
  async getDbHotels(): Promise<any[]> { return []; }
  async createDbHotel(hotel: any): Promise<any> { return hotel; }
  async deleteDbHotel(id: number): Promise<void> {}
  async getDbRestaurants(): Promise<any[]> { return []; }
  async createDbRestaurant(rest: any): Promise<any> { return rest; }
  async deleteDbRestaurant(id: number): Promise<void> {}

  // Media stub operations
  async getMediaAssets(): Promise<any[]> { return []; }
  async createMediaAsset(asset: any): Promise<any> { return asset; }
  async deleteMediaAsset(id: number): Promise<void> {}

  constructor() {
    this.users = new Map();
    this.restaurantReviews = new Map();
    this.groupTripRequests = new Map();
    this.groupTripNextId = 1;
    this.tourRequests = new Map();
    this.tourRequestNextId = 1;
    this.guideAvailability = new Map();
    this.seedRestaurantReviews();
    this.seedGuideAvailability();
  }

  private seedGuideAvailability() {
    this.guideAvailability.set(1, true);
    this.guideAvailability.set(2, true);
    this.guideAvailability.set(3, true);
    this.guideAvailability.set(4, false);
    this.guideAvailability.set(5, true);
    this.guideAvailability.set(6, true);
  }

  private seedRestaurantReviews() {
    const sampleReviews: RestaurantReview[] = [
      {
        id: "r1",
        restaurantId: "1",
        userName: "محمد العامري",
        rating: 5,
        comment: "مكان رائع وقهوة عمانية أصيلة، الأجواء التراثية مميزة جداً",
        date: "2024-01-15"
      },
      {
        id: "r2",
        restaurantId: "1",
        userName: "سارة البلوشي",
        rating: 4,
        comment: "الحلويات لذيذة والخدمة ممتازة، أنصح بزيارته",
        date: "2024-01-10"
      },
      {
        id: "r3",
        restaurantId: "3",
        userName: "أحمد الهاشمي",
        rating: 5,
        comment: "المضغوط الأفضل في البريمي بلا منازع!",
        date: "2024-02-01"
      },
      {
        id: "r4",
        restaurantId: "5",
        userName: "فاطمة الحارثي",
        rating: 5,
        comment: "إطلالة خيالية على قلعة نزوى، تجربة لا تُنسى",
        date: "2024-01-20"
      },
    ];
    sampleReviews.forEach(review => {
      this.restaurantReviews.set(review.id, review);
    });
  }

  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  async getRestaurantReviews(restaurantId: string): Promise<RestaurantReview[]> {
    return Array.from(this.restaurantReviews.values())
      .filter(review => review.restaurantId === restaurantId)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }

  async createRestaurantReview(insertReview: InsertRestaurantReview): Promise<RestaurantReview> {
    const id = randomUUID();
    const review: RestaurantReview = {
      ...insertReview,
      id,
      date: new Date().toISOString().split('T')[0]
    };
    this.restaurantReviews.set(id, review);
    return review;
  }

  async createGroupTripRequest(request: InsertGroupTripRequest): Promise<GroupTripRequest> {
    const id = this.groupTripNextId++;
    const tripRequest: GroupTripRequest = {
      ...request,
      id,
      createdAt: new Date(),
    };
    this.groupTripRequests.set(id, tripRequest);
    return tripRequest;
  }

  async getGroupTripRequests(): Promise<GroupTripRequest[]> {
    return Array.from(this.groupTripRequests.values())
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  async createTourRequest(request: InsertTourRequest): Promise<TourRequest> {
    const id = this.tourRequestNextId++;
    const tourReq: TourRequest = {
      ...request,
      id,
      status: request.status || "pending",
      createdAt: new Date(),
    };
    this.tourRequests.set(id, tourReq);
    return tourReq;
  }

  async getTourRequests(guideId?: number): Promise<TourRequest[]> {
    const requests = Array.from(this.tourRequests.values());
    if (guideId !== undefined) {
      return requests
        .filter((req) => req.guideId === guideId)
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }
    return requests.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  async getTourRequestById(id: number): Promise<TourRequest | undefined> {
    return this.tourRequests.get(id);
  }

  async updateTourRequestStatus(id: number, status: string): Promise<TourRequest> {
    const request = this.tourRequests.get(id);
    if (!request) {
      throw new Error(`Tour request with ID ${id} not found`);
    }
    const updated: TourRequest = { ...request, status };
    this.tourRequests.set(id, updated);
    return updated;
  }

  async getGuideAvailability(guideId: number): Promise<boolean> {
    return this.guideAvailability.get(guideId) ?? true;
  }

  async setGuideAvailability(guideId: number, available: boolean): Promise<boolean> {
    this.guideAvailability.set(guideId, available);
    return available;
  }
}

export const storage = new DatabaseStorage();
