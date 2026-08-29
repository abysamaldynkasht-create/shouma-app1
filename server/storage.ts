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
  tourRequests,
  userSettings,
  type UserSettings,
  type InsertUserSettings
} from "@shared/schema";
import { randomUUID } from "crypto";
import { db } from "./db";
import { eq, desc, sql } from "drizzle-orm";

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser & { isVerified?: boolean; verificationCode?: string; verifiedVia?: string }): Promise<User>;
  updateUserVerification(username: string, isVerified: boolean, code?: string): Promise<void>;
  setUserVerificationDetails(username: string, code: string, verifiedVia: string): Promise<void>;
  updateUserPassword(username: string, newPassword: string): Promise<void>;
  getRestaurantReviews(restaurantId: string): Promise<RestaurantReview[]>;
  createRestaurantReview(review: InsertRestaurantReview): Promise<RestaurantReview>;
  createGroupTripRequest(request: InsertGroupTripRequest): Promise<GroupTripRequest>;
  getGroupTripRequests(): Promise<GroupTripRequest[]>;
  deleteGroupTripRequest(id: number): Promise<void>;
  createTourRequest(request: InsertTourRequest): Promise<TourRequest>;
  getTourRequests(guideId?: number): Promise<TourRequest[]>;
  getTourRequestById(id: number): Promise<TourRequest | undefined>;
  updateTourRequestStatus(id: number, status: string): Promise<TourRequest>;
  getGuideAvailability(guideId: number): Promise<boolean>;
  setGuideAvailability(guideId: number, available: boolean): Promise<boolean>;

  // User settings persistent operations
  getUserSettings(userId: string): Promise<UserSettings | undefined>;
  createUserSettings(settings: InsertUserSettings): Promise<UserSettings>;
  updateUserSettings(userId: string, settings: Partial<InsertUserSettings>): Promise<UserSettings>;

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
  getDbActivities(): Promise<any[]>;
  createDbActivity(activity: any): Promise<any>;
  deleteDbActivity(id: number): Promise<void>;

  // Media upload storage helpers
  getMediaAssets(): Promise<any[]>;
  createMediaAsset(asset: any): Promise<any>;
  deleteMediaAsset(id: number): Promise<void>;

  // New features
  getDbHikingTrips(): Promise<any[]>;
  createDbHikingTrip(trip: any): Promise<any>;
  updateDbHikingTrip(id: number, trip: any): Promise<any>;
  deleteDbHikingTrip(id: number): Promise<void>;

  getDbHimamShouma(): Promise<any[]>;
  createDbHimamShouma(place: any): Promise<any>;
  deleteDbHimamShouma(id: number): Promise<void>;

  getDbDrobShouma(): Promise<any[]>;
  createDbDrobShouma(gem: any): Promise<any>;
  deleteDbDrobShouma(id: number): Promise<void>;

  getHikingPayments(): Promise<any[]>;
  createHikingPayment(gateway: any): Promise<any>;
  deleteHikingPayment(id: number): Promise<void>;

  getHikingBookings(): Promise<any[]>;
  createHikingBooking(booking: any): Promise<any>;
  clearHikingBookings(): Promise<void>;
  getHotelBookings(): Promise<any[]>;
  createHotelBooking(booking: any): Promise<any>;
  clearHotelBookings(): Promise<void>;

  getDbTransactions(): Promise<any[]>;
  createDbTransaction(tx: any): Promise<any>;
  deleteDbTransaction(id: number): Promise<void>;
  clearDbTransactions(): Promise<void>;

  // Tour panel & Admin management items
  getApplications(): Promise<any[]>;
  createApplication(app: any): Promise<any>;
  updateApplicationStatus(id: number, status: string): Promise<any>;
  deleteApplication(id: number): Promise<void>;

  getOfficeConfig(): Promise<any>;
  updateOfficeConfig(config: any): Promise<any>;

  getTrips(): Promise<any[]>;
  createTrip(trip: any): Promise<any>;
  updateTrip(id: number, trip: any): Promise<any>;
  deleteTrip(id: number): Promise<void>;

  getTickets(): Promise<any[]>;
  createTicket(ticket: any): Promise<any>;
  updateTicketStatus(id: number, status: string): Promise<any>;
  deleteTicket(id: number): Promise<void>;

  getPortalAccounts(): Promise<any[]>;
  createPortalAccount(acc: any): Promise<any>;
  updatePortalAccount(id: number, acc: any): Promise<any>;
  deletePortalAccount(id: number): Promise<void>;
  authenticatePortalAccount(portalType: string, email: string, pass: string): Promise<any>;
  getPortalAuditLogs(): Promise<any[]>;
  addPortalAuditLog(entry: any): Promise<any>;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    if (!username) return undefined;
    const clean = username.trim();
    const lower = clean.toLowerCase();
    const [user] = await db
      .select()
      .from(users)
      .where(
        sql`LOWER(${users.username}) = ${lower} OR LOWER(${users.email}) = ${lower} OR ${users.phone} = ${clean}`
      );
    return user;
  }

  async createUser(insertUser: InsertUser & { isVerified?: boolean; verificationCode?: string; verifiedVia?: string }): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }

  async updateUserVerification(username: string, isVerified: boolean, code?: string): Promise<void> {
    const updateObj: any = { isVerified };
    if (code !== undefined) {
      updateObj.verificationCode = code;
    }
    await db.update(users).set(updateObj).where(eq(users.username, username));
  }

  async setUserVerificationDetails(username: string, code: string, verifiedVia: string): Promise<void> {
    await db.update(users).set({ verificationCode: code, verifiedVia }).where(eq(users.username, username));
  }

  async updateUserPassword(username: string, newPassword: string): Promise<void> {
    await db.update(users).set({ password: newPassword, verificationCode: null, isVerified: true }).where(eq(users.username, username));
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

  async deleteGroupTripRequest(id: number): Promise<void> {
    await db
      .delete(groupTripRequests)
      .where(eq(groupTripRequests.id, id));
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
    const tags = Array.isArray(attr.tags) ? attr.tags : (attr.tags ? String(attr.tags).split(',').map(x => x.trim()).filter(Boolean) : []);
    const tagsStr = `{${tags.map((f: any) => `"${String(f).replace(/"/g, '\\"')}"`).join(',')}}`;
    const res = await db.execute(sql`
      INSERT INTO db_attractions (name, name_ar, description, description_en, governorate, governorate_id, wilayat, category, image, map_url, rating, additional_images, tags)
      VALUES (${attr.name || attr.name_en || attr.nameAr || ''}, ${attr.nameAr || attr.name_ar || attr.name || ''}, ${attr.description || ''}, ${attr.descriptionEn || attr.description_en || ''}, ${attr.governorate || ''}, ${attr.governorateId || attr.governorate_id || 'muscat'}, ${attr.wilayat || ''}, ${attr.category || 'nature'}, ${attr.image || ''}, ${attr.mapUrl || attr.map_url || ''}, ${String(attr.rating || '4.8')}, ${attr.additionalImages || attr.additional_images || ''}, ${tagsStr}::text[])
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
    const amens = Array.isArray(hotel.amenities) ? hotel.amenities : (hotel.amenities ? String(hotel.amenities).split(',').map(x => x.trim()).filter(Boolean) : []);
    const amensStr = `{${amens.map((f: any) => `"${String(f).replace(/"/g, '\\"')}"`).join(',')}}`;
    const splitShouma = hotel.splitShoumaPct !== undefined ? parseInt(hotel.splitShoumaPct, 10) : 15;
    const splitHotel = hotel.splitHotelPct !== undefined ? parseInt(hotel.splitHotelPct, 10) : 85;
    const email = hotel.email || null;
    const password = hotel.password || null;
    const res = await db.execute(sql`
      INSERT INTO db_hotels (name, name_ar, description, city, region, image, rating, price_per_night, stars, phone, map_url, additional_images, bank_account, amenities, split_shouma_pct, split_hotel_pct, email, password)
      VALUES (${hotel.name}, ${hotel.nameAr || hotel.name_ar || hotel.name}, ${hotel.description}, ${hotel.city}, ${hotel.region}, ${hotel.image}, ${hotel.rating || 4.8}, ${hotel.pricePerNight || hotel.price_per_night || 55}, ${hotel.stars || 4}, ${hotel.phone || ''}, ${hotel.mapUrl || hotel.map_url || ''}, ${hotel.additionalImages || hotel.additional_images || ''}, ${hotel.bankAccount || hotel.bank_account || ''}, ${amensStr}::text[], ${splitShouma}, ${splitHotel}, ${email}, ${password})
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

  async getDbHikingTrips(): Promise<any[]> {
    const res = await db.execute(sql`SELECT * FROM db_hiking_trips ORDER BY id DESC`);
    return res.rows;
  }

  async createDbHikingTrip(trip: any): Promise<any> {
    const gallery = Array.isArray(trip.gallery) ? trip.gallery : [trip.image || ''];
    const galleryStr = `{${gallery.map((g: any) => `"${String(g).replace(/"/g, '\\"')}"`).join(',')}}`;
    
    const includes = Array.isArray(trip.includes) ? trip.includes : [];
    const includesStr = `{${includes.map((i: any) => `"${String(i).replace(/"/g, '\\"')}"`).join(',')}}`;

    const res = await db.execute(sql`
      INSERT INTO db_hiking_trips (name, name_ar, description, location, region, image, gallery, difficulty, duration, distance, price, includes, rating, phone)
      VALUES (
        ${trip.name}, ${trip.nameAr || trip.name_ar}, ${trip.description}, 
        ${trip.location}, ${trip.region}, ${trip.image}, ${galleryStr}, 
        ${trip.difficulty || 'easy'}, ${trip.duration}, ${trip.distance}, 
        ${parseInt(trip.price, 10) || 0}, ${includesStr}, 
        ${trip.rating || '4.8'}, ${trip.phone}
      )
      RETURNING *
    `);
    return res.rows[0];
  }

  async updateDbHikingTrip(id: number, trip: any): Promise<any> {
    const gallery = Array.isArray(trip.gallery) ? trip.gallery : [trip.image || ''];
    const galleryStr = `{${gallery.map((g: any) => `"${String(g).replace(/"/g, '\\"')}"`).join(',')}}`;
    
    const includes = Array.isArray(trip.includes) ? trip.includes : [];
    const includesStr = `{${includes.map((i: any) => `"${String(i).replace(/"/g, '\\"')}"`).join(',')}}`;

    const res = await db.execute(sql`
      UPDATE db_hiking_trips
      SET 
        name = ${trip.name},
        name_ar = ${trip.nameAr || trip.name_ar},
        description = ${trip.description},
        location = ${trip.location},
        region = ${trip.region},
        image = ${trip.image},
        gallery = ${galleryStr},
        difficulty = ${trip.difficulty || 'easy'},
        duration = ${trip.duration},
        distance = ${trip.distance},
        price = ${parseInt(trip.price, 10) || 0},
        includes = ${includesStr},
        phone = ${trip.phone}
      WHERE id = ${id}
      RETURNING *
    `);
    return res.rows[0];
  }

  async deleteDbHikingTrip(id: number): Promise<void> {
    await db.execute(sql`DELETE FROM db_hiking_trips WHERE id = ${id}`);
  }

  async getDbHimamShouma(): Promise<any[]> {
    const res = await db.execute(sql`SELECT * FROM db_himam_shouma ORDER BY id DESC`);
    return res.rows;
  }

  async createDbHimamShouma(place: any): Promise<any> {
    const features = Array.isArray(place.features) ? place.features : (place.features ? String(place.features).split(',').map((x: string) => x.trim()).filter(Boolean) : []);
    const featuresStr = `{${features.map((f: any) => `"${String(f).replace(/"/g, '\\"')}"`).join(',')}}`;
    
    const featuresEn = Array.isArray(place.features_en || place.featuresEn) ? (place.features_en || place.featuresEn) : (place.features_en || place.featuresEn ? String(place.features_en || place.featuresEn).split(',').map((x: string) => x.trim()).filter(Boolean) : []);
    const featuresEnStr = `{${featuresEn.map((f: any) => `"${String(f).replace(/"/g, '\\"')}"`).join(',')}}`;

    const res = await db.execute(sql`
      INSERT INTO db_himam_shouma (name, name_en, description, description_en, location, location_en, category, features, features_en, rating, phone, map_url, fully_accessible)
      VALUES (
        ${place.name || place.nameAr || ''}, ${place.nameEn || place.name_en || place.name || ''}, ${place.description || ''}, ${place.descriptionEn || place.description_en || ''},
        ${place.location || ''}, ${place.locationEn || place.location_en || ''}, ${place.category || 'wheelchair'},
        ${featuresStr}::text[], ${featuresEnStr}::text[], ${String(place.rating || '4.8')}, ${place.phone || ''}, ${place.mapUrl || place.map_url || ''}, ${place.fullyAccessible !== false}
      )
      RETURNING *
    `);
    return res.rows[0];
  }

  async deleteDbHimamShouma(id: number): Promise<void> {
    await db.execute(sql`DELETE FROM db_himam_shouma WHERE id = ${id}`);
  }

  async getDbDrobShouma(): Promise<any[]> {
    const res = await db.execute(sql`SELECT * FROM db_drob_shouma ORDER BY id DESC`);
    return res.rows;
  }

  async createDbDrobShouma(gem: any): Promise<any> {
    const res = await db.execute(sql`
      INSERT INTO db_drob_shouma (name, name_en, description, description_en, location, location_en, governorate, governorate_en, image, rating, map_url)
      VALUES (
        ${gem.name}, ${gem.nameEn || gem.name_en}, ${gem.description}, ${gem.descriptionEn || gem.description_en},
        ${gem.location}, ${gem.locationEn || gem.location_en}, ${gem.governorate}, ${gem.governorateEn || gem.governorate_en},
        ${gem.image}, ${gem.rating || '4.8'}, ${gem.mapUrl || gem.map_url || ''}
      )
      RETURNING *
    `);
    return res.rows[0];
  }

  async deleteDbDrobShouma(id: number): Promise<void> {
    await db.execute(sql`DELETE FROM db_drob_shouma WHERE id = ${id}`);
  }

  async getHikingPayments(): Promise<any[]> {
    const res = await db.execute(sql`SELECT * FROM db_hiking_payments ORDER BY id DESC`);
    return res.rows;
  }

  async createHikingPayment(gateway: any): Promise<any> {
    const res = await db.execute(sql`
      INSERT INTO db_hiking_payments (gateway_name, is_active, details)
      VALUES (${gateway.gatewayName || gateway.gateway_name}, ${gateway.isActive !== false}, ${gateway.details || ''})
      RETURNING *
    `);
    return res.rows[0];
  }

  async deleteHikingPayment(id: number): Promise<void> {
    await db.execute(sql`DELETE FROM db_hiking_payments WHERE id = ${id}`);
  }

  async getHikingBookings(): Promise<any[]> {
    const res = await db.execute(sql`SELECT * FROM db_hiking_bookings ORDER BY id DESC`);
    return res.rows;
  }

  async createHikingBooking(b: any): Promise<any> {
    const res = await db.execute(sql`
      INSERT INTO db_hiking_bookings (trip_id, trip_name, full_name, phone, email, attendees, booking_date, paid_amount, payment_gateway)
      VALUES (
        ${parseInt(b.trip_id || b.tripId, 10)}, 
        ${b.trip_name || b.tripName}, 
        ${b.full_name || b.fullName}, 
        ${b.phone}, 
        ${b.email}, 
        ${parseInt(b.attendees, 10) || 1}, 
        ${b.booking_date || b.bookingDate}, 
        ${parseInt(b.paid_amount || b.paidAmount, 10)}, 
        ${b.payment_gateway || b.paymentGateway || 'Credit Card'}
      )
      RETURNING *
    `);
    return res.rows[0];
  }

  async clearHikingBookings(): Promise<void> {
    await db.execute(sql`DELETE FROM db_hiking_bookings`);
  }

  async clearHotelBookings(): Promise<void> {
    await db.execute(sql`DELETE FROM db_hotel_bookings`);
  }

  async getHotelBookings(): Promise<any[]> {
    const res = await db.execute(sql`
      SELECT b.*, 
             r.price_base, 
             r.commission_pct, 
             r.commission_amount, 
             r.price_final
      FROM db_hotel_bookings b
      LEFT JOIN db_hotel_rooms r ON b.hotel_id = r.hotel_id AND (b.room_name = r.name_ar OR b.room_name = r.name)
      ORDER BY b.id DESC
    `);
    return res.rows;
  }

  async createHotelBooking(b: any): Promise<any> {
    const res = await db.execute(sql`
      INSERT INTO db_hotel_bookings (hotel_id, hotel_name, room_name, full_name, phone, email, nights, price_per_night, total_price, payment_gateway)
      VALUES (
        ${parseInt(b.hotel_id || b.hotelId, 10)},
        ${b.hotel_name || b.hotelName},
        ${b.room_name || b.roomName || ''},
        ${b.full_name || b.fullName},
        ${b.phone},
        ${b.email},
        ${parseInt(b.nights, 10) || 1},
        ${parseFloat(b.price_per_night || b.pricePerNight)},
        ${parseFloat(b.total_price || b.totalPrice)},
        ${b.payment_gateway || b.paymentGateway || 'Credit Card'}
      )
      RETURNING *
    `);
    return res.rows[0];
  }

  async getDbActivities(): Promise<any[]> {
    const res = await db.execute(sql`SELECT * FROM db_activities ORDER BY id DESC`);
    return res.rows;
  }

  async createDbActivity(act: any): Promise<any> {
    const includes = Array.isArray(act.includes) ? act.includes : (act.includes ? String(act.includes).split(',').map(x => x.trim()) : []);
    const includesStr = `{${includes.map((f: any) => `"${String(f).replace(/"/g, '\\"')}"`).join(',')}}`;
    const branchesJson = typeof act.branches === 'string' ? act.branches : JSON.stringify(act.branches || []);
    const res = await db.execute(sql`
      INSERT INTO db_activities (name, name_ar, description, description_ar, location, region, duration, price, image, rating, includes, provider, phone, map_url, branches)
      VALUES (${act.name}, ${act.nameAr}, ${act.description}, ${act.descriptionAr}, ${act.location}, ${act.region}, ${act.duration}, ${act.price}, ${act.image}, ${act.rating || '4.8'}, ${includesStr}, ${act.provider || ''}, ${act.phone || ''}, ${act.mapUrl || ''}, ${branchesJson}::jsonb)
      RETURNING *
    `);
    return res.rows[0];
  }

  async deleteDbActivity(id: number): Promise<void> {
    await db.execute(sql`DELETE FROM db_activities WHERE id = ${id}`);
  }

  async getDbTransactions(): Promise<any[]> {
    const res = await db.execute(sql`SELECT * FROM db_finance_transactions ORDER BY date DESC, id DESC`);
    return res.rows;
  }

  async createDbTransaction(tx: any): Promise<any> {
    const amountNum = parseFloat(tx.amount || 0);
    const res = await db.execute(sql`
      INSERT INTO db_finance_transactions (type, category, amount, description, date, reference_id)
      VALUES (${tx.type}, ${tx.category}, ${amountNum}, ${tx.description}, ${tx.date || new Date().toISOString().split('T')[0]}, ${tx.reference_id || null})
      RETURNING *
    `);
    return res.rows[0];
  }

  async deleteDbTransaction(id: number): Promise<void> {
    await db.execute(sql`DELETE FROM db_finance_transactions WHERE id = ${id}`);
  }

  async clearDbTransactions(): Promise<void> {
    await db.execute(sql`DELETE FROM db_finance_transactions`);
  }

  async getUserSettings(userId: string): Promise<UserSettings | undefined> {
    const [settings] = await db.select().from(userSettings).where(eq(userSettings.userId, userId));
    return settings;
  }

  async createUserSettings(settings: InsertUserSettings): Promise<UserSettings> {
    const [newSettings] = await db.insert(userSettings).values({
      ...settings,
      updatedAt: new Date(),
    }).returning();
    return newSettings;
  }

  async updateUserSettings(userId: string, settings: Partial<InsertUserSettings>): Promise<UserSettings> {
    const [updated] = await db
      .update(userSettings)
      .set({
        ...settings,
        updatedAt: new Date(),
      })
      .where(eq(userSettings.userId, userId))
      .returning();
    if (!updated) {
      throw new Error(`User settings for user ${userId} not found`);
    }
    return updated;
  }

  // Tour panel & Admin management items implementation
  async getApplications(): Promise<any[]> { return getModuleApplications(); }
  async createApplication(app: any): Promise<any> { return createModuleApplication(app); }
  async updateApplicationStatus(id: number, status: string): Promise<any> { return updateModuleApplicationStatus(id, status); }
  async deleteApplication(id: number): Promise<void> { return deleteModuleApplication(id); }

  async getOfficeConfig(): Promise<any> { return getModuleOfficeConfig(); }
  async updateOfficeConfig(config: any): Promise<any> { return updateModuleOfficeConfig(config); }

  async getTrips(): Promise<any[]> { return getModuleTrips(); }
  async createTrip(trip: any): Promise<any> { return createModuleTrip(trip); }
  async updateTrip(id: number, trip: any): Promise<any> { return updateModuleTrip(id, trip); }
  async deleteTrip(id: number): Promise<void> { return deleteModuleTrip(id); }

  async getTickets(): Promise<any[]> { return getModuleTickets(); }
  async createTicket(ticket: any): Promise<any> { return createModuleTicket(ticket); }
  async updateTicketStatus(id: number, status: string): Promise<any> { return updateModuleTicketStatus(id, status); }
  async deleteTicket(id: number): Promise<void> { return deleteModuleTicket(id); }

  async getPortalAccounts(): Promise<any[]> {
    try {
      const res = await db.execute(sql`SELECT * FROM db_portal_accounts ORDER BY id ASC`);
      if (res.rows && res.rows.length > 0) {
        return res.rows.map((r: any) => ({
          id: r.id,
          portalType: r.portal_type,
          portalName: r.portal_name,
          email: r.email,
          password: r.password,
          name: r.name,
          isActive: r.is_active,
          createdAt: r.created_at
        }));
      }
    } catch (e) {
      // fallback
    }
    return getModulePortalAccounts();
  }

  async createPortalAccount(acc: any): Promise<any> {
    try {
      const res = await db.execute(sql`
        INSERT INTO db_portal_accounts (portal_type, portal_name, email, password, name, is_active)
        VALUES (${acc.portalType}, ${acc.portalName || acc.portalType}, ${acc.email}, ${acc.password}, ${acc.name}, ${acc.isActive ?? true})
        RETURNING *
      `);
      const r = res.rows[0];
      return {
        id: r.id,
        portalType: r.portal_type,
        portalName: r.portal_name,
        email: r.email,
        password: r.password,
        name: r.name,
        isActive: r.is_active,
        createdAt: r.created_at
      };
    } catch (e) {
      return createModulePortalAccount(acc);
    }
  }

  async updatePortalAccount(id: number, acc: any): Promise<any> {
    try {
      const res = await db.execute(sql`
        UPDATE db_portal_accounts
        SET portal_type = COALESCE(${acc.portalType}, portal_type),
            portal_name = COALESCE(${acc.portalName}, portal_name),
            email = COALESCE(${acc.email}, email),
            password = COALESCE(${acc.password}, password),
            name = COALESCE(${acc.name}, name),
            is_active = COALESCE(${acc.isActive}, is_active)
        WHERE id = ${id}
        RETURNING *
      `);
      const r = res.rows[0];
      return {
        id: r.id,
        portalType: r.portal_type,
        portalName: r.portal_name,
        email: r.email,
        password: r.password,
        name: r.name,
        isActive: r.is_active,
        createdAt: r.created_at
      };
    } catch (e) {
      return updateModulePortalAccount(id, acc);
    }
  }

  async deletePortalAccount(id: number): Promise<void> {
    try {
      await db.execute(sql`DELETE FROM db_portal_accounts WHERE id = ${id}`);
    } catch (e) {
      console.warn("SQL delete portal account fallback:", e);
    }
    deleteModulePortalAccount(id);
  }

  async authenticatePortalAccount(portalType: string, email: string, pass: string): Promise<any> {
    try {
      const cleanEmail = (email || '').trim().toLowerCase();
      const res = await db.execute(sql`
        SELECT * FROM db_portal_accounts
        WHERE LOWER(email) = ${cleanEmail} AND password = ${pass} AND is_active = true
        LIMIT 1
      `);
      if (res.rows && res.rows.length > 0) {
        const r = res.rows[0];
        return {
          id: r.id,
          portalType: r.portal_type,
          portalName: r.portal_name,
          email: r.email,
          name: r.name
        };
      }
    } catch (e) {
      // fallback
    }
    return authenticateModulePortalAccount(portalType, email, pass);
  }

  async getPortalAuditLogs(): Promise<any[]> {
    return getModulePortalAuditLogs();
  }

  async addPortalAuditLog(entry: any): Promise<any> {
    return addModulePortalAuditLog(entry);
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
  private financeTransactions: Map<number, any>;
  private financeTxNextId: number;
  private settings: Map<string, UserSettings>;

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
  async getDbActivities(): Promise<any[]> { return []; }
  async createDbActivity(activity: any): Promise<any> { return activity; }
  async deleteDbActivity(id: number): Promise<void> {}

  // Media stub operations
  async getMediaAssets(): Promise<any[]> { return []; }
  async createMediaAsset(asset: any): Promise<any> { return asset; }
  async deleteMediaAsset(id: number): Promise<void> {}

  constructor() {
    this.users = new Map();
    // Seed default demo user
    const defaultDemoUser: User = {
      id: "demo-user-1",
      username: "demo",
      password: "demo123",
      email: "demo@shouma.om",
      phone: "+96890000000",
      isVerified: true,
      verificationCode: null,
      verifiedVia: "email"
    };
    this.users.set(defaultDemoUser.id, defaultDemoUser);
    this.restaurantReviews = new Map();
    this.groupTripRequests = new Map();
    this.groupTripNextId = 1;
    this.tourRequests = new Map();
    this.tourRequestNextId = 1;
    this.guideAvailability = new Map();
    this.financeTransactions = new Map();
    this.financeTxNextId = 1;
    this.settings = new Map();
    this.seedRestaurantReviews();
    this.seedGuideAvailability();
    this.seedFinanceTransactions();
  }

  private seedFinanceTransactions() {
    const defaultTxs = [
      { id: 1, type: "expense", category: "hiking", amount: 120, description: "صيانة وشراء حبال ومعدات تسلق للهايكنق", date: "2026-06-15", reference_id: null, created_at: new Date() },
      { id: 2, type: "expense", category: "salary", amount: 45, description: "مستحقات مرشد سياحي خارجي لرحلة جبل شمس", date: "2026-06-18", reference_id: null, created_at: new Date() },
      { id: 3, type: "expense", category: "marketing", amount: 50, description: "حملة إعلانية ممولة للترويج للموسم السياحي", date: "2026-06-20", reference_id: null, created_at: new Date() },
      { id: 4, type: "income", category: "other", amount: 450, description: "رعاية إعلانية لفعاليات المغامرات من شريك خارجي", date: "2026-06-21", reference_id: null, created_at: new Date() },
      { id: 5, type: "expense", category: "office", amount: 80, description: "اشتراك إنترنت وتجهيزات مكتبية لمقر الشركة", date: "2026-06-22", reference_id: null, created_at: new Date() }
    ];
    for (const tx of defaultTxs) {
      this.financeTransactions.set(tx.id, tx);
    }
    this.financeTxNextId = 6;
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
    if (!username) return undefined;
    const clean = username.trim();
    const lower = clean.toLowerCase();
    return Array.from(this.users.values()).find(
      (user) =>
        user.username?.toLowerCase() === lower ||
        user.email?.toLowerCase() === lower ||
        user.phone === clean
    );
  }

  async createUser(insertUser: InsertUser & { isVerified?: boolean; verificationCode?: string; verifiedVia?: string }): Promise<User> {
    const id = randomUUID();
    const user: User = {
      id,
      username: insertUser.username,
      password: insertUser.password,
      email: insertUser.email || null,
      phone: insertUser.phone || null,
      isVerified: insertUser.isVerified ?? false,
      verificationCode: insertUser.verificationCode || null,
      verifiedVia: insertUser.verifiedVia || null,
    };
    this.users.set(id, user);
    return user;
  }

  async updateUserVerification(username: string, isVerified: boolean, code?: string): Promise<void> {
    const user = await this.getUserByUsername(username);
    if (user) {
      user.isVerified = isVerified;
      if (code !== undefined) {
        user.verificationCode = code || null;
      }
    }
  }

  async setUserVerificationDetails(username: string, code: string, verifiedVia: string): Promise<void> {
    const user = await this.getUserByUsername(username);
    if (user) {
      user.verificationCode = code;
      user.verifiedVia = verifiedVia;
    }
  }

  async updateUserPassword(username: string, newPassword: string): Promise<void> {
    const user = await this.getUserByUsername(username);
    if (user) {
      user.password = newPassword;
      user.verificationCode = null;
      user.isVerified = true;
    }
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
      selectedGovernorate: request.selectedGovernorate ?? null,
      createdAt: new Date(),
    };
    this.groupTripRequests.set(id, tripRequest);
    return tripRequest;
  }

  async getGroupTripRequests(): Promise<GroupTripRequest[]> {
    return Array.from(this.groupTripRequests.values())
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  async deleteGroupTripRequest(id: number): Promise<void> {
    this.groupTripRequests.delete(id);
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

  async getDbHikingTrips(): Promise<any[]> { return []; }
  async createDbHikingTrip(trip: any): Promise<any> { return { ...trip, id: Math.floor(Math.random() * 1000) }; }
  async updateDbHikingTrip(id: number, trip: any): Promise<any> { return { ...trip, id }; }
  async deleteDbHikingTrip(id: number): Promise<void> {}

  async getDbHimamShouma(): Promise<any[]> { return []; }
  async createDbHimamShouma(place: any): Promise<any> { return { ...place, id: Math.floor(Math.random() * 1000) }; }
  async deleteDbHimamShouma(id: number): Promise<void> {}

  async getDbDrobShouma(): Promise<any[]> { return []; }
  async createDbDrobShouma(gem: any): Promise<any> { return { ...gem, id: Math.floor(Math.random() * 1000) }; }
  async deleteDbDrobShouma(id: number): Promise<void> {}

  async getHikingPayments(): Promise<any[]> { return []; }
  async createHikingPayment(gateway: any): Promise<any> { return { ...gateway, id: Math.floor(Math.random() * 1000) }; }
  async deleteHikingPayment(id: number): Promise<void> {}

  async getHikingBookings(): Promise<any[]> { return []; }
  async createHikingBooking(booking: any): Promise<any> { return { ...booking, id: Math.floor(Math.random() * 1000) }; }
  async clearHikingBookings(): Promise<void> {}

  async getHotelBookings(): Promise<any[]> { return []; }
  async createHotelBooking(booking: any): Promise<any> { return { ...booking, id: Math.floor(Math.random() * 1000) }; }
  async clearHotelBookings(): Promise<void> {}

  async getDbTransactions(): Promise<any[]> {
    return Array.from(this.financeTransactions.values()).sort((a, b) => b.id - a.id);
  }

  async createDbTransaction(tx: any): Promise<any> {
    const id = this.financeTxNextId++;
    const newTx = {
      id,
      type: tx.type,
      category: tx.category,
      amount: parseFloat(tx.amount || 0),
      description: tx.description,
      date: tx.date || new Date().toISOString().split('T')[0],
      reference_id: tx.reference_id || null,
      created_at: new Date()
    };
    this.financeTransactions.set(id, newTx);
    return newTx;
  }

  async deleteDbTransaction(id: number): Promise<void> {
    this.financeTransactions.delete(id);
  }

  async clearDbTransactions(): Promise<void> {
    this.financeTransactions.clear();
  }

  async getUserSettings(userId: string): Promise<UserSettings | undefined> {
    return this.settings.get(userId);
  }

  async createUserSettings(insertSettings: InsertUserSettings): Promise<UserSettings> {
    const id = Math.floor(Math.random() * 1000000);
    const newSettings: UserSettings = {
      id,
      userId: insertSettings.userId,
      currency: insertSettings.currency ?? "OMR",
      gpsEnabled: insertSettings.gpsEnabled ?? true,
      distanceUnit: insertSettings.distanceUnit ?? "km",
      bookingNotifications: insertSettings.bookingNotifications ?? true,
      promoNotifications: insertSettings.promoNotifications ?? true,
      updatedAt: new Date(),
    };
    this.settings.set(insertSettings.userId, newSettings);
    return newSettings;
  }

  async updateUserSettings(userId: string, updateData: Partial<InsertUserSettings>): Promise<UserSettings> {
    const current = this.settings.get(userId);
    if (!current) {
      throw new Error(`User settings for user ${userId} not found`);
    }
    const updated: UserSettings = {
      ...current,
      ...updateData,
      updatedAt: new Date(),
    };
    this.settings.set(userId, updated);
    return updated;
  }

  // Tour panel & Admin management items implementation for MemStorage
  async getApplications(): Promise<any[]> { return getModuleApplications(); }
  async createApplication(app: any): Promise<any> { return createModuleApplication(app); }
  async updateApplicationStatus(id: number, status: string): Promise<any> { return updateModuleApplicationStatus(id, status); }
  async deleteApplication(id: number): Promise<void> { return deleteModuleApplication(id); }

  async getOfficeConfig(): Promise<any> { return getModuleOfficeConfig(); }
  async updateOfficeConfig(config: any): Promise<any> { return updateModuleOfficeConfig(config); }

  async getTrips(): Promise<any[]> { return getModuleTrips(); }
  async createTrip(trip: any): Promise<any> { return createModuleTrip(trip); }
  async updateTrip(id: number, trip: any): Promise<any> { return updateModuleTrip(id, trip); }
  async deleteTrip(id: number): Promise<void> { return deleteModuleTrip(id); }

  async getTickets(): Promise<any[]> { return getModuleTickets(); }
  async createTicket(ticket: any): Promise<any> { return createModuleTicket(ticket); }
  async updateTicketStatus(id: number, status: string): Promise<any> { return updateModuleTicketStatus(id, status); }
  async deleteTicket(id: number): Promise<void> { return deleteModuleTicket(id); }

  async getPortalAccounts(): Promise<any[]> { return getModulePortalAccounts(); }
  async createPortalAccount(acc: any): Promise<any> { return createModulePortalAccount(acc); }
  async updatePortalAccount(id: number, acc: any): Promise<any> { return updateModulePortalAccount(id, acc); }
  async deletePortalAccount(id: number): Promise<void> { return deleteModulePortalAccount(id); }
  async authenticatePortalAccount(portalType: string, email: string, pass: string): Promise<any> { return authenticateModulePortalAccount(portalType, email, pass); }
  async getPortalAuditLogs(): Promise<any[]> { return getModulePortalAuditLogs(); }
  async addPortalAuditLog(entry: any): Promise<any> { return addModulePortalAuditLog(entry); }
}

// Module-level persistent state for Applications, Office, Trips, Tickets
const applicationsList: any[] = [];
let applicationNextId = 1;

let officeConfigData: any = {
  name: "مكتب شومة للسياحة والاستكشاف",
  address: "مسقط، الخوير، شارع السلطان قابوس",
  phone: "+968 91234567",
  workingHours: "السبت - الخميس: 8:00 ص - 8:00 م",
  mapEmbedUrl: ""
};

const tripsList: any[] = [];
let tripNextId = 1;

const ticketsList: any[] = [];
let ticketNextId = 1;

function getModuleApplications(): any[] {
  return applicationsList;
}

function createModuleApplication(app: any): any {
  const newApp = {
    id: applicationNextId++,
    fullName: app.fullName || app.name || "متقدم جديد",
    email: app.email || "",
    phone: app.phone || "",
    role: app.role || "guide",
    experience: app.experience || "",
    status: app.status || "pending",
    createdAt: new Date().toISOString()
  };
  applicationsList.push(newApp);
  return newApp;
}

function updateModuleApplicationStatus(id: number, status: string): any {
  const found = applicationsList.find(a => Number(a.id) === Number(id));
  if (found) {
    found.status = status;
    return found;
  }
  return { success: false };
}

function deleteModuleApplication(id: number): void {
  const idx = applicationsList.findIndex(a => Number(a.id) === Number(id));
  if (idx !== -1) {
    applicationsList.splice(idx, 1);
  }
}

function getModuleOfficeConfig(): any {
  return officeConfigData;
}

function updateModuleOfficeConfig(config: any): any {
  officeConfigData = { ...officeConfigData, ...config };
  return officeConfigData;
}

function getModuleTrips(): any[] {
  return tripsList;
}

function createModuleTrip(trip: any): any {
  const newTrip = {
    id: tripNextId++,
    title: trip.title || "جولة سياحية",
    guide: trip.guide || "مرشد شومة",
    date: trip.date || new Date().toISOString().split('T')[0],
    status: trip.status || "upcoming",
    passengers: trip.passengers || 1,
    price: trip.price || 50,
    location: trip.location || "مسقط"
  };
  tripsList.push(newTrip);
  return newTrip;
}

function updateModuleTrip(id: number, trip: any): any {
  const idx = tripsList.findIndex(t => Number(t.id) === Number(id));
  if (idx !== -1) {
    tripsList[idx] = { ...tripsList[idx], ...trip };
    return tripsList[idx];
  }
  return { success: false };
}

function deleteModuleTrip(id: number): void {
  const idx = tripsList.findIndex(t => Number(t.id) === Number(id));
  if (idx !== -1) {
    tripsList.splice(idx, 1);
  }
}

function getModuleTickets(): any[] {
  return ticketsList;
}

function createModuleTicket(ticket: any): any {
  const newTicket = {
    id: ticketNextId++,
    user: ticket.user || "مستخدم",
    subject: ticket.subject || "استفسار",
    message: ticket.message || "",
    priority: ticket.priority || "medium",
    status: ticket.status || "open",
    createdAt: new Date().toISOString()
  };
  ticketsList.push(newTicket);
  return newTicket;
}

function updateModuleTicketStatus(id: number, status: string): any {
  const found = ticketsList.find(t => Number(t.id) === Number(id));
  if (found) {
    found.status = status;
    return found;
  }
  return { success: false };
}

function deleteModuleTicket(id: number): void {
  const idx = ticketsList.findIndex(t => Number(t.id) === Number(id));
  if (idx !== -1) {
    ticketsList.splice(idx, 1);
  }
}

// Module-level persistent state for Portal Accounts & Audit Logs
const initialPortalAccounts: any[] = [
  // قسم الإدارة المالية والتدقيق (Finance)
  { id: 1, portalType: "finance", portalName: "لوحة الإدارة المالية العامة", email: "finance1@shouma.com", password: "finance2026", name: "سالم العبري - المحاسب الرئيسي", isActive: true, createdAt: new Date(Date.now() - 86400000 * 5).toISOString() },
  { id: 2, portalType: "finance", portalName: "لوحة الإدارة المالية العامة", email: "finance2@shouma.com", password: "finance2026", name: "بدرية الهنائية - مديرة التدقيق والأرباح", isActive: true, createdAt: new Date(Date.now() - 86400000 * 4).toISOString() },
  { id: 3, portalType: "finance", portalName: "لوحة الإدارة المالية العامة", email: "finance@shouma.com", password: "finance2026", name: "المحاسب المالي العام", isActive: true, createdAt: new Date(Date.now() - 86400000 * 10).toISOString() },

  // قسم الفنادق والمنتجعات (Hotels)
  { id: 4, portalType: "hotels", portalName: "لوحة إدارة الفنادق والمنتجعات", email: "hotel1@shouma.com", password: "hotel2026", name: "راشد الزدجالي - مدير قسم الفنادق", isActive: true, createdAt: new Date(Date.now() - 86400000 * 6).toISOString() },
  { id: 5, portalType: "hotels", portalName: "لوحة إدارة الفنادق والمنتجعات", email: "hotel2@shouma.com", password: "hotel2026", name: "فاطمة المعمرية - مسؤول الحجوزات والمنتجعات", isActive: true, createdAt: new Date(Date.now() - 86400000 * 3).toISOString() },
  { id: 6, portalType: "hotels", portalName: "لوحة إدارة الفنادق والمنتجعات", email: "hotel@shouma.com", password: "hotel2026", name: "مدير الفنادق والمنتجعات", isActive: true, createdAt: new Date(Date.now() - 86400000 * 10).toISOString() },

  // قسم تأجير السيارات (Cars)
  { id: 7, portalType: "cars", portalName: "لوحة إدارة مكتب تأجير السيارات", email: "cars1@shouma.com", password: "cars2026", name: "خالد السيابي - مدير مكتب السيارات", isActive: true, createdAt: new Date(Date.now() - 86400000 * 5).toISOString() },
  { id: 8, portalType: "cars", portalName: "لوحة إدارة مكتب تأجير السيارات", email: "cars2@shouma.com", password: "cars2026", name: "سلطان الوهيبي - مشرف أسطول المركبات", isActive: true, createdAt: new Date(Date.now() - 86400000 * 2).toISOString() },
  { id: 9, portalType: "cars", portalName: "لوحة إدارة مكتب تأجير السيارات", email: "cars@shouma.com", password: "cars2026", name: "مدير مكتب السيارات", isActive: true, createdAt: new Date(Date.now() - 86400000 * 10).toISOString() },

  // قسم الرحلات والفعاليات (Trips)
  { id: 10, portalType: "trips", portalName: "لوحة إدارة الرحلات الاستكشافية", email: "trips1@shouma.com", password: "trips2026", name: "حمد الحارثي - مدير الرحلات والفعاليات", isActive: true, createdAt: new Date(Date.now() - 86400000 * 4).toISOString() },
  { id: 11, portalType: "trips", portalName: "لوحة إدارة الرحلات الاستكشافية", email: "trips2@shouma.com", password: "trips2026", name: "أسماء البلوشية - منسق المغامرات والأنشطة", isActive: true, createdAt: new Date(Date.now() - 86400000 * 1).toISOString() },
  { id: 12, portalType: "trips", portalName: "لوحة إدارة الرحلات الاستكشافية", email: "trips@shouma.com", password: "trips2026", name: "مدير الرحلات والفعاليات", isActive: true, createdAt: new Date(Date.now() - 86400000 * 10).toISOString() },

  // قسم التسويق والإعلانات (Marketing)
  { id: 13, portalType: "marketing", portalName: "لوحة إدارة التسويق والإعلانات", email: "marketing1@shouma.com", password: "marketing2026", name: "طارق البوسعيدي - مدير التسويق والإعلانات", isActive: true, createdAt: new Date(Date.now() - 86400000 * 5).toISOString() },
  { id: 14, portalType: "marketing", portalName: "لوحة إدارة التسويق والإعلانات", email: "marketing2@shouma.com", password: "marketing2026", name: "مريم الكندية - أخصائية الحملات الرقمية", isActive: true, createdAt: new Date(Date.now() - 86400000 * 2).toISOString() },
  { id: 15, portalType: "marketing", portalName: "لوحة إدارة التسويق والإعلانات", email: "marketing@shouma.com", password: "marketing2026", name: "مسؤول التسويق والإعلانات", isActive: true, createdAt: new Date(Date.now() - 86400000 * 10).toISOString() },

  // قسم المرشدين السياحيين (Guides)
  { id: 16, portalType: "guides", portalName: "لوحة المرشدين السياحيين", email: "guide1@shouma.com", password: "guide2026", name: "يعقوب السالمي - كبير المرشدين", isActive: true, createdAt: new Date(Date.now() - 86400000 * 3).toISOString() },
  { id: 17, portalType: "guides", portalName: "لوحة المرشدين السياحيين", email: "guide@shouma.com", password: "guide2026", name: "مرشد سياحي معتمد", isActive: true, createdAt: new Date(Date.now() - 86400000 * 10).toISOString() },

  // قسم التقنية والدعم البرمجي (Tech)
  { id: 18, portalType: "tech", portalName: "لوحة الدعم التقني والبرمجي", email: "tech1@shouma.com", password: "tech2026", name: "مازن الخروصي - مهندس الأنظمة والدعم", isActive: true, createdAt: new Date(Date.now() - 86400000 * 4).toISOString() },
  { id: 19, portalType: "tech", portalName: "لوحة الدعم التقني والبرمجي", email: "tech@shouma.com", password: "tech2026", name: "مدير الخدمات التقنية", isActive: true, createdAt: new Date(Date.now() - 86400000 * 10).toISOString() }
];
let portalAccountNextId = 20;
const portalAccountsList: any[] = [...initialPortalAccounts];

const portalAuditLogsList: any[] = [
  { id: 1, portalType: "finance", portalName: "لوحة الإدارة المالية العامة", email: "finance1@shouma.com", name: "سالم العبري - المحاسب الرئيسي", action: "LOGIN", timestamp: new Date(Date.now() - 1000 * 60 * 12).toISOString(), ip: "192.168.1.10" },
  { id: 2, portalType: "hotels", portalName: "لوحة إدارة الفنادق والمنتجعات", email: "hotel2@shouma.com", name: "فاطمة المعمرية - مسؤول الحجوزات", action: "LOGIN", timestamp: new Date(Date.now() - 1000 * 60 * 35).toISOString(), ip: "192.168.1.18" },
  { id: 3, portalType: "hotels", portalName: "لوحة إدارة الفنادق والمنتجعات", email: "hotel1@shouma.com", name: "راشد الزدجالي - مدير قسم الفنادق", action: "LOGOUT", timestamp: new Date(Date.now() - 1000 * 60 * 90).toISOString(), ip: "192.168.1.15" },
  { id: 4, portalType: "cars", portalName: "لوحة إدارة مكتب تأجير السيارات", email: "cars1@shouma.com", name: "خالد السيابي - مدير مكتب السيارات", action: "LOGIN", timestamp: new Date(Date.now() - 1000 * 60 * 140).toISOString(), ip: "192.168.1.22" },
  { id: 5, portalType: "marketing", portalName: "لوحة إدارة التسويق والإعلانات", email: "marketing2@shouma.com", name: "مريم الكندية - أخصائية الحملات الرقمية", action: "LOGOUT", timestamp: new Date(Date.now() - 1000 * 60 * 200).toISOString(), ip: "192.168.1.30" },
  { id: 6, portalType: "trips", portalName: "لوحة إدارة الرحلات الاستكشافية", email: "trips1@shouma.com", name: "حمد الحارثي - مدير الرحلات والفعاليات", action: "LOGIN", timestamp: new Date(Date.now() - 1000 * 60 * 280).toISOString(), ip: "192.168.1.44" },
  { id: 7, portalType: "finance", portalName: "لوحة الإدارة المالية العامة", email: "finance2@shouma.com", name: "بدرية الهنائية - مديرة التدقيق والأرباح", action: "LOGOUT", timestamp: new Date(Date.now() - 1000 * 60 * 340).toISOString(), ip: "192.168.1.12" }
];
let portalAuditLogNextId = 8;

function getModulePortalAccounts(): any[] {
  return portalAccountsList;
}

function createModulePortalAccount(acc: any): any {
  const newAcc = {
    id: portalAccountNextId++,
    portalType: acc.portalType || "hotels",
    portalName: acc.portalName || acc.portalType || "لوحة تحكم فرعية",
    email: (acc.email || "").trim().toLowerCase(),
    password: acc.password || "123456",
    name: acc.name || "مدير النظام الفرعي",
    isActive: acc.isActive !== undefined ? Boolean(acc.isActive) : true,
    createdAt: new Date().toISOString()
  };
  portalAccountsList.push(newAcc);
  return newAcc;
}

function updateModulePortalAccount(id: number, acc: any): any {
  const found = portalAccountsList.find(a => Number(a.id) === Number(id));
  if (found) {
    if (acc.portalType) found.portalType = acc.portalType;
    if (acc.portalName) found.portalName = acc.portalName;
    if (acc.email) found.email = acc.email.trim().toLowerCase();
    if (acc.password) found.password = acc.password;
    if (acc.name) found.name = acc.name;
    if (acc.isActive !== undefined) found.isActive = Boolean(acc.isActive);
    return found;
  }
  return { success: false };
}

function deleteModulePortalAccount(id: number): void {
  const idx = portalAccountsList.findIndex(a => Number(a.id) === Number(id));
  if (idx !== -1) {
    portalAccountsList.splice(idx, 1);
  }
}

function authenticateModulePortalAccount(portalType: string, email: string, pass: string): any {
  const cleanEmail = (email || "").trim().toLowerCase();
  const found = portalAccountsList.find(a => 
    a.email.toLowerCase() === cleanEmail && 
    a.password === pass && 
    a.isActive !== false
  );
  if (found) {
    return {
      id: found.id,
      portalType: found.portalType,
      portalName: found.portalName,
      email: found.email,
      name: found.name
    };
  }
  return null;
}

function getModulePortalAuditLogs(): any[] {
  return [...portalAuditLogsList].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
}

function addModulePortalAuditLog(entry: any): any {
  const newLog = {
    id: portalAuditLogNextId++,
    portalType: entry.portalType || "general",
    portalName: entry.portalName || "النظام العام",
    email: (entry.email || "").trim().toLowerCase(),
    name: entry.name || "مستخدم للنظام",
    action: entry.action || "LOGIN",
    timestamp: entry.timestamp || new Date().toISOString(),
    ip: entry.ip || "192.168.1.1"
  };
  portalAuditLogsList.unshift(newLog);
  return newLog;
}

export const storage = process.env.DATABASE_URL ? new DatabaseStorage() : new MemStorage();
