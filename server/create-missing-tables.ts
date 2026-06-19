import { pool } from "./db";

async function createMissingTables() {
  console.log("⏳ Checking and creating missing tables...");
  try {
    // 1. Create tour_requests if not exists
    await pool.query(`
      CREATE TABLE IF NOT EXISTS "tour_requests" (
        "id" serial PRIMARY KEY NOT NULL,
        "guide_id" integer NOT NULL,
        "user_name" text NOT NULL,
        "email" text NOT NULL,
        "phone" text NOT NULL,
        "group_size" integer NOT NULL,
        "hours" integer NOT NULL,
        "trip_date" text NOT NULL,
        "destination" text NOT NULL,
        "details" text NOT NULL,
        "status" text DEFAULT 'pending' NOT NULL,
        "created_at" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL
      )
    `);
    console.log("✅ Table 'tour_requests' is verified/created successfully!");

    // 1b. Create guide_availability if not exists
    await pool.query(`
      CREATE TABLE IF NOT EXISTS "guide_availability" (
        "guide_id" integer PRIMARY KEY NOT NULL,
        "available" boolean NOT NULL DEFAULT true
      )
    `);
    console.log("✅ Table 'guide_availability' is verified/created successfully!");

    // Seed guide availability if empty
    const checkAvailabilityCount = await pool.query(`SELECT COUNT(*) FROM "guide_availability"`);
    if (parseInt(checkAvailabilityCount.rows[0].count, 10) === 0) {
      console.log("🌱 Seeding default guide availabilities...");
      try {
        await pool.query(`
          INSERT INTO "guide_availability" (guide_id, available) VALUES
          (1, true),
          (2, true),
          (3, true),
          (4, false),
          (5, true),
          (6, true)
        `);
      } catch (e) {
        console.warn("⚠️ Failed to seed guide availabilities:", e);
      }
    }

    // Seed restaurant reviews if empty
    const checkReviewsCount = await pool.query(`SELECT COUNT(*) FROM "restaurant_reviews"`);
    if (parseInt(checkReviewsCount.rows[0].count, 10) === 0) {
      console.log("🌱 Seeding default restaurant reviews...");
      try {
        await pool.query(`
          INSERT INTO "restaurant_reviews" (id, restaurant_id, user_name, rating, comment, date) VALUES
          (1, 1, 'محمد العامري', 5, 'مكان رائع وقهوة عمانية أصيلة، الأجواء التراثية مميزة جداً', '2024-01-15'),
          (2, 1, 'سارة البلوشي', 4, 'الحلويات لذيذة والخدمة ممتازة، أنصح بزيارته', '2024-01-10'),
          (3, 3, 'أحمد الهاشمي', 5, 'المضغوط الأفضل في البريمي بلا منازع!', '2024-02-01'),
          (4, 5, 'فاطمة الحارثي', 5, 'إطلالة خيالية على قلعة نزوى، تجربة لا تُنسى', '2024-01-20')
        `);
      } catch (e) {
        console.warn("⚠️ Failed to seed default restaurant reviews (likely matching restaurant IDs are missing, which is fine):", e);
      }
    }

    // 2. We can also make sure conversations has all columns just in case
    await pool.query(`
      CREATE TABLE IF NOT EXISTS "conversations" (
        "id" serial PRIMARY KEY NOT NULL,
        "title" text NOT NULL,
        "created_at" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL
      )
    `);

    // 3. Make sure messages is created
    await pool.query(`
      CREATE TABLE IF NOT EXISTS "messages" (
        "id" serial PRIMARY KEY NOT NULL,
        "conversation_id" integer NOT NULL,
        "role" text NOT NULL,
        "content" text NOT NULL,
        "created_at" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL
      )
    `);

    // 4. Make sure group_trip_requests is created
    await pool.query(`
      CREATE TABLE IF NOT EXISTS "group_trip_requests" (
        "id" serial PRIMARY KEY NOT NULL,
        "number_of_people" integer NOT NULL,
        "number_of_days" integer NOT NULL,
        "preferences" text[] NOT NULL,
        "country" text NOT NULL,
        "arrival_date" text NOT NULL,
        "destination_preference" text NOT NULL,
        "selected_governorate" text,
        "created_at" timestamp DEFAULT CURRENT_TIMESTAMP NOT NULL
      )
    `);

    // 5. Make sure users is created
    await pool.query(`
      CREATE TABLE IF NOT EXISTS "users" (
        "id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
        "username" text NOT NULL,
        "password" text NOT NULL,
        "email" text,
        CONSTRAINT "users_username_unique" UNIQUE("username")
      )
    `);

    // Ensure email column exists if users table was already created
    try {
      await pool.query(`
        ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "email" text;
      `);
      console.log("✅ Column 'email' inside table 'users' verified!");
    } catch (err) {
      console.warn("⚠️ Column 'email' alter failed or already exist:", err);
    }

    // 6. Create announcements if not exists
    await pool.query(`
      CREATE TABLE IF NOT EXISTS "announcements" (
        "id" serial PRIMARY KEY NOT NULL,
        "title" text NOT NULL,
        "message" text NOT NULL,
        "is_active" boolean NOT NULL DEFAULT true,
        "created_at" timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log("✅ Table 'announcements' verified/created successfully!");

    // Seed default announcement if empty
    const checkAnnCount = await pool.query(`SELECT COUNT(*) FROM "announcements"`);
    if (parseInt(checkAnnCount.rows[0].count, 10) === 0) {
      console.log("🌱 Seeding default announcement...");
      await pool.query(`
        INSERT INTO "announcements" (title, message, is_active) VALUES
        ('مرحباً بكم في تطبيق شومة للسياحة!', 'يسعدنا إطلاق النسخة المحدثة لعام 2026 مع لوحة تحكم متطورة وتغطية شاملة لكل معالم وجولات سلطنة عُمان.', true)
      `);
    }

    // 7. Create db_tour_guides if not exists
    await pool.query(`
      CREATE TABLE IF NOT EXISTS "db_tour_guides" (
        "id" serial PRIMARY KEY NOT NULL,
        "name" text NOT NULL,
        "name_ar" text NOT NULL,
        "specialization" text NOT NULL,
        "specialization_ar" text NOT NULL,
        "languages" text[] NOT NULL DEFAULT '{}'::text[],
        "experience" integer NOT NULL,
        "city" text NOT NULL,
        "description" text NOT NULL,
        "image_url" text,
        "phone" text NOT NULL,
        "whatsapp" text NOT NULL,
        "rating" numeric NOT NULL DEFAULT 4.8,
        "reviews_count" integer NOT NULL DEFAULT 12,
        "price_per_day" integer NOT NULL DEFAULT 45,
        "services" text[] NOT NULL DEFAULT '{}'::text[],
        "availability" boolean NOT NULL DEFAULT true
      )
    `);
    console.log("✅ Table 'db_tour_guides' verified/created successfully!");

    // Seed default guides if empty
    const checkGuidesCount = await pool.query(`SELECT COUNT(*) FROM "db_tour_guides"`);
    if (parseInt(checkGuidesCount.rows[0].count, 10) === 0) {
      console.log("🌱 Seeding initial tour guides to DB...");
      await pool.query(`
        INSERT INTO "db_tour_guides" (name, name_ar, specialization, specialization_ar, languages, experience, city, description, image_url, phone, whatsapp, rating, reviews_count, price_per_day, services, availability) VALUES
        ('Ahmed Al-Balushi', 'أحمد البلوشي', 'Historical & Cultural Tours', 'جولات تاريخية وثقافية', ARRAY['العربية', 'الإنجليزية', 'الفرنسية'], 12, 'مسقط', 'مرشد سياحي محترف متخصص في التاريخ العُماني والمواقع الأثرية. خبرة واسعة في تنظيم الجولات للمجموعات والأفراد مع معرفة عميقة بالتراث العُماني.', '/src/assets/guide-ahmed.png', '+968 9123 4567', '+96891234567', 4.9, 156, 50, ARRAY['جولات القلاع والحصون', 'الأسواق التقليدية', 'المتاحف', 'جولات المدينة القديمة'], true),
        ('Fatima Al-Habsi', 'فاطمة الحبسي', 'Adventure & Nature Tours', 'جولات المغامرة والطبيعة', ARRAY['العربية', 'الإنجليزية'], 8, 'نزوى', 'مرشدة متخصصة في رحلات المغامرة والهايكنج في الجبال العُمانية. خبيرة في مسارات الجبل الأخضر وجبل شمس مع اهتمام خاص بالسلامة.', '/src/assets/guide-fatima.png', '+968 9234 5678', '+96892345678', 4.8, 98, 45, ARRAY['رحلات الهايكنج', 'التخييم', 'مشاهدة النجوم', 'جولات الوديان'], true),
        ('Khalid Al-Rashdi', 'خالد الراشدي', 'Desert Safari Tours', 'رحلات الصحراء السفاري', ARRAY['العربية', 'الإنجليزية', 'الألمانية'], 15, 'صلالة', 'خبير في رحلات الصحراء والسفاري مع معرفة واسعة بصحراء الربع الخالي ورمال وهيبة. متخصص في تنظيم رحلات التخييم الصحراوي الفاخرة.', '/src/assets/guide-khalid.png', '+968 9345 6789', '+96893456789', 4.9, 203, 60, ARRAY['سفاري الصحراء', 'التخييم البدوي', 'ركوب الجمال', 'جولات الكثبان الرملية'], true),
        ('Mariam Al-Lawati', 'مريم اللواتي', 'Photography Tours', 'جولات التصوير الفوتوغرافي', ARRAY['العربية', 'الإنجليزية', 'الإيطالية'], 6, 'مسقط', 'مرشدة متخصصة في جولات التصوير الفوتوغرافي، تساعدك في اكتشاف أفضل المواقع والأوقات لالتقاط صور مذهلة لعُمان.', '/src/assets/guide-mariam.png', '+968 9456 7890', '+96894567890', 4.7, 67, 55, ARRAY['جولات شروق الشمس', 'جولات غروب الشمس', 'تصوير المناظر الطبيعية', 'تصوير الحياة البرية'], false),
        ('Said Al-Kindi', 'سعيد الكندي', 'Marine & Diving Tours', 'جولات بحرية والغوص', ARRAY['العربية', 'الإنجليزية'], 10, 'مسندم', 'مرشد بحري محترف ومدرب غوص معتمد. خبرة واسعة في تنظيم رحلات مشاهدة الدلافين والغوص في مياه مسندم الصافية.', '/src/assets/guide-said.png', '+968 9567 8901', '+96895678901', 4.8, 124, 70, ARRAY['رحلات الغوص', 'مشاهدة الدلافين', 'الصيد', 'جولات القوارب'], true),
        ('Yusuf Al-Farsi', 'يوسف الفارسي', 'Family & Group Tours', 'جولات عائلية ومجموعات', ARRAY['العربية', 'الإنجليزية', 'الهندية'], 9, 'صحار', 'متخصص في تنظيم الجولات العائلية والمجموعات الكبيرة. يوفر تجربة سياحية ممتعة وآمنة للجميع مع مراعاة احتياجات الأطفال وكبار السن.', '/src/assets/guide-yusuf.png', '+968 9678 9012', '+96896789012', 4.6, 89, 40, ARRAY['جولات عائلية', 'رحلات مدرسية', 'جولات الشركات', 'حفلات خاصة'], true)
      `);
    }

    // 8. Create db_attractions if not exists
    await pool.query(`
      CREATE TABLE IF NOT EXISTS "db_attractions" (
        "id" serial PRIMARY KEY NOT NULL,
        "name" text NOT NULL,
        "name_ar" text NOT NULL,
        "description" text NOT NULL,
        "governorate" text NOT NULL,
        "governorate_id" text NOT NULL,
        "wilayat" text NOT NULL,
        "category" text NOT NULL,
        "image" text NOT NULL,
        "map_url" text,
        "rating" text NOT NULL DEFAULT '4.8',
        "tags" text[] NOT NULL DEFAULT '{}'::text[],
        "created_at" timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log("✅ Table 'db_attractions' verified/created successfully!");

    // 9. Create db_hotels if not exists
    await pool.query(`
      CREATE TABLE IF NOT EXISTS "db_hotels" (
        "id" serial PRIMARY KEY NOT NULL,
        "name" text NOT NULL,
        "name_ar" text NOT NULL,
        "description" text NOT NULL,
        "city" text NOT NULL,
        "region" text NOT NULL,
        "image" text NOT NULL,
        "rating" numeric NOT NULL DEFAULT 4.8,
        "price_per_night" integer NOT NULL DEFAULT 55,
        "stars" integer NOT NULL DEFAULT 4,
        "phone" text NOT NULL,
        "map_url" text,
        "amenities" text[] NOT NULL DEFAULT '{}'::text[],
        "created_at" timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log("✅ Table 'db_hotels' verified/created successfully!");

    // 10. Create db_restaurants if not exists
    await pool.query(`
      CREATE TABLE IF NOT EXISTS "db_restaurants" (
        "id" serial PRIMARY KEY NOT NULL,
        "name" text NOT NULL,
        "name_ar" text NOT NULL,
        "description" text NOT NULL,
        "city" text NOT NULL,
        "region" text NOT NULL,
        "image" text NOT NULL,
        "cuisine" text NOT NULL,
        "price_range" text NOT NULL DEFAULT 'moderate',
        "rating" numeric NOT NULL DEFAULT 4.8,
        "features" text[] NOT NULL DEFAULT '{}'::text[],
        "map_url" text,
        "created_at" timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log("✅ Table 'db_restaurants' verified/created successfully!");

    // 11. Create media_assets if not exists
    await pool.query(`
      CREATE TABLE IF NOT EXISTS "media_assets" (
        "id" serial PRIMARY KEY NOT NULL,
        "filename" text NOT NULL,
        "url" text NOT NULL,
        "file_type" text NOT NULL,
        "mime_type" text NOT NULL,
        "size" integer NOT NULL,
        "storage_key_used" text NOT NULL,
        "created_at" timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log("✅ Table 'media_assets' verified/created successfully!");

    // 12. Create db_activities if not exists
    await pool.query(`
      CREATE TABLE IF NOT EXISTS "db_activities" (
        "id" serial PRIMARY KEY NOT NULL,
        "name" text NOT NULL,
        "name_ar" text NOT NULL,
        "description" text NOT NULL,
        "description_ar" text NOT NULL,
        "location" text NOT NULL,
        "region" text NOT NULL,
        "duration" text NOT NULL,
        "price" text NOT NULL,
        "image" text NOT NULL,
        "rating" numeric NOT NULL DEFAULT 4.8,
        "includes" text[] NOT NULL DEFAULT '{}'::text[],
        "provider" text,
        "phone" text,
        "map_url" text,
        "branches" jsonb NOT NULL DEFAULT '[]'::jsonb,
        "created_at" timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log("✅ Table 'db_activities' verified/created successfully!");

    // Seed default activities if empty
    const checkActCount = await pool.query(`SELECT COUNT(*) FROM "db_activities"`);
    if (parseInt(checkActCount.rows[0].count, 10) === 0) {
      console.log("🌱 Seeding initial activities to DB...");
      await pool.query(`
        INSERT INTO "db_activities" (name, name_ar, description, description_ar, location, region, duration, price, image, rating, includes, provider, phone, map_url, branches) VALUES
        (
          'Camel Riding in Bidiya Sands', 'ركوب الجمال في رمال بدية',
          'Experience the traditional Omani way of desert travel with a memorable camel ride through the stunning Bidiya sand dunes.',
          'استمتع بتجربة السفر العماني التقليدي في الصحراء مع رحلة لا تُنسى على ظهر الجمال عبر كثبان رمال بدية الخلابة.',
          'بدية، محافظة شمال الشرقية', 'محافظة شمال الشرقية', '1-2 ساعة', '15-25 ر.ع',
          'https://images.unsplash.com/photo-1542332213-9b5a5a3fda35?auto=format&fit=crop&w=600&q=80',
          4.8, ARRAY['ركوب الجمال', 'مرشد محلي', 'صور تذكارية'], 'شيد الأجداد', '+96891234567',
          'https://maps.app.goo.gl/JQkZ43c6Nvps8wjo9', '[]'::jsonb
        ),
        (
          'Horse Riding on Seeb Beach', 'ركوب الخيل على شاطئ السيب',
          'Enjoy a scenic horseback ride along the beautiful Seeb beach. Perfect for beginners and experienced riders alike.',
          'استمتع بركوب الخيل على طول شاطئ السيب الجميل. مناسب للمبتدئين والفرسان ذوي الخبرة.',
          'السيب، محافظة مسقط', 'محافظة مسقط', '1 ساعة', '10-20 ر.ع',
          'https://images.unsplash.com/photo-1598974357801-cbca100e65d3?auto=format&fit=crop&w=600&q=80',
          4.7, ARRAY['ركوب الخيل', 'مدرب محترف', 'معدات السلامة'], 'نادي الفروسية', '+96897817171',
          'https://maps.app.goo.gl/7PJ69Jbr1Mfu2cn38', '[]'::jsonb
        )
      `);
    }

    // Helper to dynamically add missing columns recursively or safely
    console.log("⚙️ Ensuring additional columns for multiple images, logins, etc. exist...");
    
    // 1. db_tour_guides: email, password, additional_images, bank_account
    await pool.query(`ALTER TABLE "db_tour_guides" ADD COLUMN IF NOT EXISTS "email" text;`);
    await pool.query(`ALTER TABLE "db_tour_guides" ADD COLUMN IF NOT EXISTS "password" text DEFAULT 'shouma2026';`);
    await pool.query(`ALTER TABLE "db_tour_guides" ADD COLUMN IF NOT EXISTS "additional_images" text DEFAULT '';`);
    await pool.query(`ALTER TABLE "db_tour_guides" ADD COLUMN IF NOT EXISTS "bank_account" text DEFAULT '';`);

    // 2. db_attractions: additional_images, tags
    await pool.query(`ALTER TABLE "db_attractions" ADD COLUMN IF NOT EXISTS "additional_images" text DEFAULT '';`);
    await pool.query(`ALTER TABLE "db_attractions" ADD COLUMN IF NOT EXISTS "tags" text[] NOT NULL DEFAULT '{}'::text[];`);

    // 3. db_hotels: additional_images, bank_account, amenities, email, password
    await pool.query(`ALTER TABLE "db_hotels" ADD COLUMN IF NOT EXISTS "additional_images" text DEFAULT '';`);
    await pool.query(`ALTER TABLE "db_hotels" ADD COLUMN IF NOT EXISTS "bank_account" text DEFAULT '';`);
    await pool.query(`ALTER TABLE "db_hotels" ADD COLUMN IF NOT EXISTS "amenities" text[] NOT NULL DEFAULT '{}'::text[];`);
    await pool.query(`ALTER TABLE "db_hotels" ADD COLUMN IF NOT EXISTS "email" text;`);
    await pool.query(`ALTER TABLE "db_hotels" ADD COLUMN IF NOT EXISTS "password" text;`);

    // 4. db_restaurants: additional_images
    await pool.query(`ALTER TABLE "db_restaurants" ADD COLUMN IF NOT EXISTS "additional_images" text DEFAULT '';`);

    // Create db_hotel_bookings
    await pool.query(`
      CREATE TABLE IF NOT EXISTS "db_hotel_bookings" (
        "id" serial PRIMARY KEY,
        "hotel_id" integer NOT NULL,
        "hotel_name" text NOT NULL,
        "room_name" text,
        "full_name" text NOT NULL,
        "phone" text NOT NULL,
        "email" text NOT NULL,
        "nights" integer NOT NULL DEFAULT 1,
        "price_per_night" numeric NOT NULL,
        "total_price" numeric NOT NULL,
        "payment_gateway" text NOT NULL,
        "created_at" timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
      )
    `);

    console.log("✅ Custom database schema additions (email, password, multiple images) verified successfully!");

    console.log("✅ All required tables verified successfully in PostgreSQL database!");
  } catch (error) {
    console.error("❌ Error creating missing tables:", error);
  } finally {
    await pool.end();
  }
}

createMissingTables();
