import { pool } from "./db";

// Helper arrays of default values to seed database.
const defaultHikingTrips = [
  {
    id: 1,
    name: "Jebel Shams Summit",
    name_ar: "قمة جبل شمس",
    description: "رحلة هايكنق مثيرة إلى أعلى قمة في عُمان. استمتع بمناظر خلابة للوادي الأخضر وتجربة التخييم تحت النجوم في واحدة من أجمل المواقع الطبيعية.",
    location: "جبل شمس",
    region: "الداخلية",
    image: "https://images.unsplash.com/photo-1551632811-561732d1e306?q=80&w=800",
    gallery: ["https://images.unsplash.com/photo-1551632811-561732d1e306?q=80&w=800"],
    difficulty: "hard",
    duration: "يومين / ليلة واحدة",
    distance: "12 كم",
    price: 45,
    includes: ["مرشد سياحي", "وجبة غداء", "معدات التخييم", "نقل من مسقط", "إفطار"],
    rating: 4.9,
    phone: "+968 9123 4567"
  },
  {
    id: 2,
    name: "Wadi Shab Adventure",
    name_ar: "مغامرة وادي شاب",
    description: "رحلة سباحة وهايكنق في أجمل أودية عُمان. اكتشف الكهوف المخفية والشلالات الطبيعية والبرك الفيروزية في مغامرة لا تُنسى.",
    location: "وادي شاب",
    region: "جنوب الشرقية",
    image: "https://images.unsplash.com/photo-1682687220742-aba13b6e50ba?q=80&w=800",
    gallery: ["https://images.unsplash.com/photo-1682687220742-aba13b6e50ba?q=80&w=800"],
    difficulty: "moderate",
    duration: "يوم واحد",
    distance: "5 كم",
    price: 25,
    includes: ["مرشد سياحي", "قارب", "وجبة غداء", "معدات السباحة", "نقل"],
    rating: 4.8,
    phone: "+968 9234 5678"
  },
  {
    id: 3,
    name: "Jabal Akhdar Trek",
    name_ar: "رحلة الجبل الأخضر",
    description: "اكتشف جمال الجبل الأخضر مع ممرات المشي القديمة بين القرى التراثية ومزارع الورد والرمان. استمتع بالمناخ البارد والإطلالات الرائعة.",
    location: "الجبل الأخضر",
    region: "الداخلية",
    image: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800",
    gallery: ["https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800"],
    difficulty: "moderate",
    duration: "يوم واحد",
    distance: "8 كم",
    price: 35,
    includes: ["مرشد محلي", "غداء تقليدي", "زيارة قرى", "شاي عماني", "نقل 4x4"],
    rating: 4.7,
    phone: "+968 9345 6789"
  },
  {
    id: 4,
    name: "Wadi Bani Khalid",
    name_ar: "وادي بني خالد",
    description: "رحلة استرخاء وسباحة في برك وادي بني خالد الصافية. مالي للعائلات مع مناظر طبيعية خلابة وكهوف مدهشة للاستكشاف.",
    location: "وادي بني خالد",
    region: "شمال الشرقية",
    image: "https://images.unsplash.com/photo-1501555088652-021faa106b9b?q=80&w=800",
    gallery: ["https://images.unsplash.com/photo-1501555088652-021faa106b9b?q=80&w=800"],
    difficulty: "easy",
    duration: "يوم واحد",
    distance: "3 كم",
    price: 20,
    includes: ["مرشد سياحي", "وجبة غداء", "نقل", "دخول الكهوف"],
    rating: 4.6,
    phone: "+968 9456 7890"
  },
  {
    id: 5,
    name: "Snake Canyon",
    name_ar: "وادي الثعبان",
    description: "مغامرة تسلق وقفز في وادي الثعبان الشهير. تحدي مثير للمغامرين مع تسلق الصخور والقفز في البرك والسباحة عبر الممرات الضيقة.",
    location: "وادي الأفاعي",
    region: "الداخلية",
    image: "https://images.unsplash.com/photo-1533240332313-0db49b459ad6?q=80&w=800",
    gallery: ["https://images.unsplash.com/photo-1533240332313-0db49b459ad6?q=80&w=800"],
    difficulty: "expert",
    duration: "يوم واحد",
    distance: "4 كم",
    price: 55,
    includes: ["مرشد خبير", "معدات السلامة", "حبال التسلق", "وجبة غداء", "تأمين", "نقل"],
    rating: 4.9,
    phone: "+968 9567 8901"
  },
  {
    id: 6,
    name: "Desert Safari & Camping",
    name_ar: "سفاري وتخييم صحراوي",
    description: "تجربة صحراوية كاملة في رمال الشرقية. قيادة على الكثبان الرملية، ركوب الجمال، عشاء تحت النجوم، والتخييم في خيام تقليدية.",
    location: "رمال الشرقية",
    region: "شمال الشرقية",
    image: "https://images.unsplash.com/photo-1542401886-65d6c61db217?q=80&w=800",
    gallery: ["https://images.unsplash.com/photo-1542401886-65d6c61db217?q=80&w=800"],
    difficulty: "easy",
    duration: "يومين / ليلة واحدة",
    distance: "غير محدد",
    price: 65,
    includes: ["نقل 4x4", "ركوب جمال", "عشاء شواء", "تخييم", "إفطار", "مشاهدة النجوم"],
    rating: 4.8,
    phone: "+968 9678 9012"
  },
  {
    id: 7,
    name: "Salalah Khareef Trek",
    name_ar: "رحلة خريف صلالة",
    description: "اكتشف سحر موسم الخريف في صلالة مع رحلات المشي في الجبال الخضراء والشلالات والعيون الطبيعية. تجربة استثنائية في أجواء استوائية.",
    location: "صلالة",
    region: "ظفار",
    image: "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?q=80&w=800",
    gallery: ["https://images.unsplash.com/photo-1441974231531-c6227db76b6e?q=80&w=800"],
    difficulty: "easy",
    duration: "يوم واحد",
    distance: "6 كم",
    price: 30,
    includes: ["مرشد محلي", "زيارة الشلالات", "وجبة غداء", "جوز الهند الطازج", "نقل"],
    rating: 4.7,
    phone: "+968 9789 0123"
  },
  {
    id: 8,
    name: "Musandam Dhow Cruise",
    name_ar: "رحلة مسندم البحرية",
    description: "رحلة بحرية على متن قارب تقليدي في فيوردات مسندم الخلابة. سباحة، غطس، صيد أسماك، ومشاهدة الدلافين في مياه صافية كريستالية.",
    location: "مسندم",
    region: "مسندم",
    image: "https://images.unsplash.com/photo-1544551763-46a013bb70d5?q=80&w=800",
    gallery: ["https://images.unsplash.com/photo-1544551763-46a013bb70d5?q=80&w=800"],
    difficulty: "easy",
    duration: "يوم واحد",
    distance: "غير محدد",
    price: 40,
    includes: ["قارب داو", "غداء بحري", "معدات الغطس", "صيد أسماك", "مشروبات"],
    rating: 4.9,
    phone: "+968 9890 1234"
  }
];

const defaultAccessiblePlaces = [
  {
    id: 1,
    name: "المتحف الوطني العماني",
    name_en: "National Museum of Oman",
    description: "متحف مهيأ بالكامل لأصحاب الهمم مع مصاعد، منحدرات، كراسي متحركة مجانية، ولافتات بطريقة برايل. يوفر جولات بلغة الإشارة عند الطلب.",
    description_en: "Fully accessible museum with elevators, ramps, free wheelchairs, and Braille signage. Sign language tours available upon request.",
    location: "مسقط، القرم",
    location_en: "Muscat, Qurum",
    category: "wheelchair",
    features: ["كراسي متحركة مجانية", "مصاعد", "منحدرات", "لافتات برايل", "جولات بلغة الإشارة", "دخول مجاني للمرافق"],
    features_en: ["Free wheelchairs", "Elevators", "Ramps", "Braille signage", "Sign language tours", "Free entry for companions"],
    rating: 5.0,
    phone: "+968 2401 8700",
    map_url: "https://share.google/w1qoVzACJItpeC0x7",
    fully_accessible: true
  },
  {
    id: 2,
    name: "جامع السلطان قابوس الأكبر",
    name_en: "Sultan Qaboos Grand Mosque",
    description: "مهيأ بالكامل مع مداخل واسعة بدون درج، أرضيات ملساء، دورات مياه مخصصة، ومواقف سيارات لذوي الاحتياجات الخاصة.",
    description_en: "Fully accessible with wide step-free entrances, smooth floors, designated restrooms, and reserved parking for people with special needs.",
    location: "مسقط، بوشر",
    location_en: "Muscat, Bawshar",
    category: "entrances",
    features: ["مداخل بدون درج", "أرضيات ملساء", "دورات مياه مخصصة", "مواقف سيارات مخصصة", "كراسي متحركة"],
    features_en: ["Step-free entrances", "Smooth floors", "Designated restrooms", "Reserved parking", "Wheelchairs"],
    rating: 5.0,
    phone: "+968 2450 5100",
    map_url: "https://share.google/HsHWETNMNrzudAsiw",
    fully_accessible: true
  },
  {
    id: 3,
    name: "دار الأوبرا السلطانية",
    name_en: "Royal Opera House Muscat",
    description: "مرافق مهيأة بالكامل تشمل مقاعد مخصصة، مصاعد، دورات مياه مهيأة، ونظام سمعي مساعد للمسرح.",
    description_en: "Fully equipped facilities including designated seating, elevators, accessible restrooms, and assistive hearing system for the theater.",
    location: "مسقط، الخوير",
    location_en: "Muscat, Al Khuwair",
    category: "support",
    features: ["مقاعد مخصصة", "مصاعد", "نظام سمعي مساعد", "دورات مياه مهيأة", "مواقف مخصصة"],
    features_en: ["Designated seating", "Elevators", "Assistive hearing system", "Accessible restrooms", "Reserved parking"],
    rating: 4.9,
    phone: "+968 2240 3300",
    map_url: "https://maps.app.goo.gl/VDdQwqu3VM1hpNGP6",
    fully_accessible: true
  }
];

const defaultHiddenGems = [
  {
    id: 1,
    name: "قرية بلد سيت",
    name_en: "Bilad Sayt Village",
    description: "قرية جبلية تقليدية معزولة تقع في أعالي جبال الحجر. تتميز بمدرجاتها زراعية الخضراء وبيوتها الحجرية القديمة والهواء النقي.",
    description_en: "An isolated traditional mountain village in the Hajar Mountains. Known for its green agricultural terraces, old stone houses, and fresh air.",
    location: "ولاية الحمراء",
    location_en: "Al Hamra",
    governorate: "dakhiliyah",
    governorate_en: "Dakhiliyah",
    image: "https://images.unsplash.com/photo-1501555088652-021faa106b9b?q=80&w=800",
    rating: 4.9,
    map_url: "https://maps.app.goo.gl/YnskwhUiTqFWzyLY9"
  },
  {
    id: 2,
    name: "شاطئ فنس",
    name_en: "Fins Beach",
    description: "شاطئ رملي أبيض هادئ يقع بين مسقط وصور. مياهه الصافية ورماله الناعمة تجعله ملاذاً مثالياً للهروب من صخب المدينة.",
    description_en: "A quiet white sandy beach between Muscat and Sur. Its clear waters and soft sand make it a perfect escape from city life.",
    location: "ولاية قريات",
    location_en: "Quriyat",
    governorate: "sharqiyah",
    governorate_en: "South Sharqiyah",
    image: "https://images.unsplash.com/photo-1544551763-46a013bb70d5?q=80&w=800",
    rating: 4.7,
    map_url: "https://maps.app.goo.gl/nCfxh94LsUvPDH3v9"
  },
  {
    id: 3,
    name: "جبل سمحان",
    name_en: "Jabal Samhan",
    description: "محمية طبيعية في ظفار تضم النمر العربي النادر. تتميز بمناظرها الخلابة من على ارتفاع 2000 متر فوق سطح البحر.",
    description_en: "A nature reserve in Dhofar home to the rare Arabian leopard. Features breathtaking views from 2000 meters above sea level.",
    location: "ولاية مرباط",
    location_en: "Mirbat",
    governorate: "dhofar",
    governorate_en: "Dhofar",
    image: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?q=80&w=800",
    rating: 4.8,
    map_url: "https://maps.app.goo.gl/fJMtvythxoefsD6dA"
  }
];

export async function initDatabaseTables() {
  if (!process.env.DATABASE_URL) {
    console.log("⚠️ DATABASE_URL is not set. Database verification is skipped, continuing with MemStorage.");
    return;
  }
  console.log("⏳ Running automated shouma-explorer database verification...");
  try {
    // 1. Create or alter db_hotels split payment columns
    try {
      await pool.query(`ALTER TABLE "db_hotels" ADD COLUMN IF NOT EXISTS "split_shouma_pct" integer DEFAULT 15;`);
      await pool.query(`ALTER TABLE "db_hotels" ADD COLUMN IF NOT EXISTS "split_hotel_pct" integer DEFAULT 85;`);
      await pool.query(`ALTER TABLE "db_hotels" ADD COLUMN IF NOT EXISTS "email" text;`);
      await pool.query(`ALTER TABLE "db_hotels" ADD COLUMN IF NOT EXISTS "password" text;`);
      await pool.query(`ALTER TABLE "db_hotels" ADD COLUMN IF NOT EXISTS "status" text NOT NULL DEFAULT 'approved';`);
      console.log("✅ Verified hotel split gateways, email, password, and status columns inside 'db_hotels'!");
    } catch (e) {
      console.warn("Hotel split/credentials columns already exist or alter failed:", e);
    }

    // 1.5. Create or alter users verification columns
    try {
      await pool.query(`ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "phone" text;`);
      await pool.query(`ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "is_verified" boolean DEFAULT false;`);
      await pool.query(`ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "verification_code" text;`);
      await pool.query(`ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "verified_via" text;`);
      
      // Auto-verify all existing users to prevent lockouts
      const updated = await pool.query(`UPDATE "users" SET "is_verified" = true WHERE "is_verified" IS NULL OR "is_verified" = false;`);
      console.log(`✅ Verified user verification and phone columns inside 'users'! Auto-verified existing users: ${updated.rowCount}`);

      // Seed default demo & admin users if missing
      try {
        await pool.query(`
          INSERT INTO "users" (id, username, password, email, phone, is_verified, verified_via)
          VALUES 
            ('demo-user-1', 'demo', 'demo123', 'demo@shouma.om', '+96890000000', true, 'email'),
            ('admin-user-1', 'admin', 'admin123', 'admin@shouma.om', '+96891111111', true, 'email'),
            ('shouma-user-1', 'shouma', '123456', 'shouma@shouma.om', '+96892222222', true, 'email')
          ON CONFLICT (id) DO NOTHING;
        `);
        console.log("✅ Verified default demo & admin users in 'users' table!");
      } catch (errUserSeed) {
        console.warn("Default user seed warning:", errUserSeed);
      }

      // Create db_portal_accounts table and seed sub-dashboard accounts
      try {
        await pool.query(`
          CREATE TABLE IF NOT EXISTS "db_portal_accounts" (
            "id" serial PRIMARY KEY,
            "portal_type" varchar(50) NOT NULL,
            "portal_name" varchar(100) NOT NULL,
            "email" text NOT NULL UNIQUE,
            "password" text NOT NULL,
            "name" text NOT NULL,
            "is_active" boolean NOT NULL DEFAULT true,
            "created_at" timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
          );
        `);
        await pool.query(`
          INSERT INTO "db_portal_accounts" ("portal_type", "portal_name", "email", "password", "name")
          VALUES 
            ('hotels', 'لوحة إدارة الفنادق والمنتجعات', 'hotel@shouma.com', 'hotel2026', 'مدير الفنادق والمنتجعات'),
            ('cars', 'لوحة إدارة مكتب تأجير السيارات', 'cars@shouma.com', 'cars2026', 'مدير مكتب السيارات'),
            ('trips', 'لوحة إدارة الرحلات الاستكشافية', 'trips@shouma.com', 'trips2026', 'مدير الرحلات والفعاليات'),
            ('finance', 'لوحة الإدارة المالية العامة', 'finance@shouma.com', 'finance2026', 'المحاسب المالي العام'),
            ('marketing', 'لوحة إدارة التسويق والإعلانات', 'marketing@shouma.com', 'marketing2026', 'مسؤول التسويق والإعلانات'),
            ('tech', 'لوحة الدعم التقني والبرمجي', 'tech@shouma.com', 'tech2026', 'مدير الخدمات التقنية'),
            ('guides', 'لوحة المرشدين السياحيين', 'guide@shouma.com', 'guide2026', 'مرشد سياحي معتمد')
          ON CONFLICT ("email") DO NOTHING;
        `);
        console.log("✅ Verified and seeded 'db_portal_accounts' table!");
      } catch (errPortalSeed) {
        console.warn("Portal accounts table creation/seed error:", errPortalSeed);
      }
    } catch (e) {
      console.warn("User verification columns alter failed:", e);
    }

    // 2. Create db_hiking_trips
    await pool.query(`
      CREATE TABLE IF NOT EXISTS "db_hiking_trips" (
        "id" serial PRIMARY KEY,
        "name" text NOT NULL,
        "name_ar" text NOT NULL,
        "description" text NOT NULL,
        "location" text NOT NULL,
        "region" text NOT NULL,
        "image" text NOT NULL,
        "gallery" text[] NOT NULL DEFAULT '{}'::text[],
        "difficulty" text NOT NULL DEFAULT 'easy',
        "duration" text NOT NULL,
        "distance" text NOT NULL,
        "price" integer NOT NULL,
        "includes" text[] NOT NULL DEFAULT '{}'::text[],
        "rating" numeric NOT NULL DEFAULT 4.8,
        "phone" text NOT NULL,
        "created_at" timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Seed default hiking trips if empty
    const checkHiking = await pool.query(`SELECT COUNT(*) FROM "db_hiking_trips"`);
    if (parseInt(checkHiking.rows[0].count, 10) === 0) {
      console.log("🌱 Seeding default hiking trips into PostgreSQL...");
      for (const trip of defaultHikingTrips) {
        const galleryStr = `{${trip.gallery.map(g => `"${g}"`).join(',')}}`;
        const includesStr = `{${trip.includes.map(inc => `"${inc.replace(/"/g, '\\"')}"`).join(',')}}`;
        await pool.query(`
          INSERT INTO "db_hiking_trips" (name, name_ar, description, location, region, image, gallery, difficulty, duration, distance, price, includes, rating, phone)
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
        `, [trip.name, trip.name_ar, trip.description, trip.location, trip.region, trip.image, galleryStr, trip.difficulty, trip.duration, trip.distance, trip.price, includesStr, trip.rating, trip.phone]);
      }
    }

    // 3. Create db_himam_shouma
    await pool.query(`
      CREATE TABLE IF NOT EXISTS "db_himam_shouma" (
        "id" serial PRIMARY KEY,
        "name" text NOT NULL,
        "name_en" text NOT NULL,
        "description" text NOT NULL,
        "description_en" text NOT NULL,
        "location" text NOT NULL,
        "location_en" text NOT NULL,
        "category" text NOT NULL,
        "features" text[] NOT NULL DEFAULT '{}'::text[],
        "features_en" text[] NOT NULL DEFAULT '{}'::text[],
        "rating" numeric NOT NULL DEFAULT 4.8,
        "phone" text,
        "map_url" text,
        "fully_accessible" boolean NOT NULL DEFAULT true,
        "created_at" timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Seed default Himam Shouma if empty
    const checkHimam = await pool.query(`SELECT COUNT(*) FROM "db_himam_shouma"`);
    if (parseInt(checkHimam.rows[0].count, 10) === 0) {
      console.log("🌱 Seeding default Himam Shouma places into PostgreSQL...");
      for (const place of defaultAccessiblePlaces) {
        const featsStr = `{${place.features.map(f => `"${f.replace(/"/g, '\\"')}"`).join(',')}}`;
        const featsEnStr = `{${place.features_en.map(f => `"${f.replace(/"/g, '\\"')}"`).join(',')}}`;
        await pool.query(`
          INSERT INTO "db_himam_shouma" (name, name_en, description, description_en, location, location_en, category, features, features_en, rating, phone, map_url, fully_accessible)
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
        `, [place.name, place.name_en, place.description, place.description_en, place.location, place.location_en, place.category, featsStr, featsEnStr, place.rating, place.phone, place.map_url, place.fully_accessible]);
      }
    }

    // 4. Create db_drob_shouma
    await pool.query(`
      CREATE TABLE IF NOT EXISTS "db_drob_shouma" (
        "id" serial PRIMARY KEY,
        "name" text NOT NULL,
        "name_en" text NOT NULL,
        "description" text NOT NULL,
        "description_en" text NOT NULL,
        "location" text NOT NULL,
        "location_en" text NOT NULL,
        "governorate" text NOT NULL,
        "governorate_en" text NOT NULL,
        "image" text NOT NULL,
        "rating" numeric NOT NULL DEFAULT 4.8,
        "map_url" text,
        "created_at" timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Seed default Drob if empty
    const checkDrob = await pool.query(`SELECT COUNT(*) FROM "db_drob_shouma"`);
    if (parseInt(checkDrob.rows[0].count, 10) === 0) {
      console.log("🌱 Seeding default Drob Shouma (Hidden Gems) into PostgreSQL...");
      for (const gem of defaultHiddenGems) {
        await pool.query(`
          INSERT INTO "db_drob_shouma" (name, name_en, description, description_en, location, location_en, governorate, governorate_en, image, rating, map_url)
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
        `, [gem.name, gem.name_en, gem.description, gem.description_en, gem.location, gem.location_en, gem.governorate, gem.governorate_en, gem.image, gem.rating, gem.map_url]);
      }
    }

    // 5. Create db_hiking_payments
    await pool.query(`
      CREATE TABLE IF NOT EXISTS "db_hiking_payments" (
        "id" serial PRIMARY KEY,
        "gateway_name" text NOT NULL,
        "is_active" boolean NOT NULL DEFAULT true,
        "details" text,
        "created_at" timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create db_hiking_bookings
    await pool.query(`
      CREATE TABLE IF NOT EXISTS "db_hiking_bookings" (
        "id" serial PRIMARY KEY,
        "trip_id" integer NOT NULL,
        "trip_name" text NOT NULL,
        "full_name" text NOT NULL,
        "phone" text NOT NULL,
        "email" text NOT NULL,
        "attendees" integer NOT NULL DEFAULT 1,
        "booking_date" text NOT NULL,
        "paid_amount" integer NOT NULL,
        "payment_gateway" text NOT NULL,
        "created_at" timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
      )
    `);

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

    // Create db_finance_transactions for complete accounting system
    await pool.query(`
      CREATE TABLE IF NOT EXISTS "db_finance_transactions" (
        "id" serial PRIMARY KEY,
        "type" text NOT NULL,
        "category" text NOT NULL,
        "amount" numeric NOT NULL,
        "description" text NOT NULL,
        "date" text NOT NULL,
        "reference_id" text,
        "created_at" timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Seed default transactions if empty (Disabled to start with a clean slate)
    const checkTx = await pool.query(`SELECT COUNT(*) FROM "db_finance_transactions"`);
    if (parseInt(checkTx.rows[0].count, 10) === 0) {
      console.log("🌱 Database is clean. Waiting for live transactions...");
    }

    // Seed default Hiking Payments if empty
    const checkPayments = await pool.query(`SELECT COUNT(*) FROM "db_hiking_payments"`);
    if (parseInt(checkPayments.rows[0].count, 10) === 0) {
      console.log("🌱 Seeding default Hiking Payment options into PostgreSQL...");
      const defaultGateways = [
        "بوابة دفع شومة الفورية (مؤكدة بنسبة ١٠٠٪)",
        "البطاقات الائتمانية والخصم المباشر (فيزا/ماستركارد/مدى)",
        "بوابة عُمان الرقمية الموحدة لخدمات السداد"
      ];
      for (const gw of defaultGateways) {
        await pool.query(`
          INSERT INTO "db_hiking_payments" (gateway_name, is_active, details)
          VALUES ($1, true, 'تم التفعيل افتراضيا بواسطة لوحة التحكم الرئيسية')
        `, [gw]);
      }
    }

    // Create db_car_bookings
    await pool.query(`
      CREATE TABLE IF NOT EXISTS "db_car_bookings" (
        "id" serial PRIMARY KEY,
        "car_id" text NOT NULL,
        "car_name" text NOT NULL,
        "full_name" text NOT NULL,
        "phone" text NOT NULL,
        "email" text NOT NULL,
        "days" integer NOT NULL DEFAULT 1,
        "price_per_day" numeric NOT NULL,
        "total_price" numeric NOT NULL,
        "license_url" text,
        "id_card_url" text,
        "status" text NOT NULL DEFAULT 'pending',
        "payment_gateway" text NOT NULL DEFAULT 'بوابة دفع شومة الفورية',
        "created_at" timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Seed default car bookings if empty (Disabled to start with a clean slate)
    const checkCarBookings = await pool.query(`SELECT COUNT(*) FROM "db_car_bookings"`);
    if (parseInt(checkCarBookings.rows[0].count, 10) === 0) {
      console.log("🌱 Database is clean. Waiting for live car rental bookings...");
    }

    // Delete experimental default mock rows immediately if they are present to ensure a clean start
    try {
      await pool.query(`
        DELETE FROM "db_car_bookings" 
        WHERE email IN ('ahmed@example.om', 'sara@example.om')
      `);
      await pool.query(`
        DELETE FROM "db_finance_transactions" 
        WHERE description IN (
          'صيانة وشراء حبال ومعدات تسلق للهايكنق', 
          'مستحقات مرشد سياحي خارجي لرحلة جبل شمس', 
          'حملة إعلانية ممولة للترويج للموسم السياحي', 
          'رعاية إعلانية لفعاليات المغامرات من شريك خارجي', 
          'اشتراك إنترنت وتجهيزات مكتبية لمقر الشركة'
        )
      `);
      console.log("🧹 Cleaned up existing experimental/test default records successfully!");
    } catch (cleanErr) {
      console.warn("Cleanup warning (optional table records already cleared):", cleanErr);
    }

    // --- PROPERTY MANAGEMENT SYSTEM & RBAC CUSTOM TABLES ---
    console.log("⏳ Creating Property Management System (PMS) and RBAC tables...");
    
    // 1. Hotel Staff
    await pool.query(`
      CREATE TABLE IF NOT EXISTS "db_hotel_staff" (
        "id" serial PRIMARY KEY,
        "hotel_id" integer NOT NULL,
        "username" text NOT NULL UNIQUE,
        "password" text NOT NULL,
        "role" text NOT NULL, -- 'manager', 'receptionist', 'accountant'
        "name" text NOT NULL,
        "created_at" timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // 2. Hotel Rooms (Pending Approval Workflow)
    await pool.query(`
      CREATE TABLE IF NOT EXISTS "db_hotel_rooms" (
        "id" serial PRIMARY KEY,
        "hotel_id" integer NOT NULL,
        "name" text NOT NULL,
        "name_ar" text NOT NULL,
        "description" text NOT NULL,
        "price_base" numeric NOT NULL,
        "commission_pct" integer NOT NULL DEFAULT 15, -- 5%, 10%, 15% applied by admin
        "commission_amount" numeric DEFAULT 15,
        "price_final" numeric NOT NULL, -- Calculated final price including commission
        "max_guests" integer NOT NULL DEFAULT 2,
        "amenities" text[] NOT NULL DEFAULT '{}'::text[],
        "image" text NOT NULL DEFAULT '',
        "status" text NOT NULL DEFAULT 'pending', -- 'pending', 'approved', 'rejected'
        "available_rooms" integer NOT NULL DEFAULT 10,
        "created_at" timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
      )
    `);
    await pool.query(`ALTER TABLE "db_hotel_rooms" ADD COLUMN IF NOT EXISTS "commission_amount" numeric DEFAULT 15;`);
    await pool.query(`ALTER TABLE "db_hotel_rooms" ADD COLUMN IF NOT EXISTS "available_rooms" integer NOT NULL DEFAULT 10;`);

    // 3. Hotel Reviews
    await pool.query(`
      CREATE TABLE IF NOT EXISTS "db_hotel_reviews" (
        "id" serial PRIMARY KEY,
        "hotel_id" integer NOT NULL,
        "user_name" text NOT NULL,
        "rating" integer NOT NULL DEFAULT 5, -- 1 to 5 stars
        "comment" text NOT NULL,
        "created_at" timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // 4. Hotel Payouts (End of Month Settlements)
    await pool.query(`
      CREATE TABLE IF NOT EXISTS "db_hotel_payouts" (
        "id" serial PRIMARY KEY,
        "hotel_id" integer NOT NULL,
        "month" text NOT NULL, -- e.g. '2026-07'
        "total_revenue" numeric NOT NULL DEFAULT 0,
        "commission_amount" numeric NOT NULL DEFAULT 0,
        "payout_amount" numeric NOT NULL DEFAULT 0,
        "status" text NOT NULL DEFAULT 'pending', -- 'pending', 'paid'
        "paid_at" timestamp
      )
    `);

    // Seed staff and reviews if empty
    try {
      const hotelResult = await pool.query(`SELECT id FROM "db_hotels" ORDER BY id LIMIT 5`);
      const staffCheck = await pool.query(`SELECT COUNT(*) FROM "db_hotel_staff"`);
      if (parseInt(staffCheck.rows[0].count, 10) === 0 && hotelResult.rows.length > 0) {
        console.log("🌱 Seeding default hotel staff accounts for RBAC demonstration...");
        for (const hRow of hotelResult.rows) {
          const hid = hRow.id;
          // Manager
          await pool.query(`
            INSERT INTO "db_hotel_staff" (hotel_id, username, password, role, name)
            VALUES ($1, $2, $3, 'manager', $4)
            ON CONFLICT (username) DO NOTHING
          `, [hid, `manager_${hid}@shouma.com`, 'shouma2026', 'سليمان الحارثي']);
          // Receptionist
          await pool.query(`
            INSERT INTO "db_hotel_staff" (hotel_id, username, password, role, name)
            VALUES ($1, $2, $3, 'receptionist', $4)
            ON CONFLICT (username) DO NOTHING
          `, [hid, `receptionist_${hid}@shouma.com`, 'shouma2026', 'عزة البوسعيدية']);
          // Accountant
          await pool.query(`
            INSERT INTO "db_hotel_staff" (hotel_id, username, password, role, name)
            VALUES ($1, $2, $3, 'accountant', $4)
            ON CONFLICT (username) DO NOTHING
          `, [hid, `accountant_${hid}@shouma.com`, 'shouma2026', 'أحمد الريامي']);
        }
      }

      const reviewsCheck = await pool.query(`SELECT COUNT(*) FROM "db_hotel_reviews"`);
      if (parseInt(reviewsCheck.rows[0].count, 10) === 0 && hotelResult.rows.length > 0) {
        console.log("🌱 Seeding default hotel reviews...");
        for (const hRow of hotelResult.rows) {
          const hid = hRow.id;
          await pool.query(`
            INSERT INTO "db_hotel_reviews" (hotel_id, user_name, rating, comment) VALUES
            ($1, 'ماجد الشعيلي', 5, 'إقامة رائعة جداً، الضيافة العمانية حاضرة والخدمة ممتازة'),
            ($1, 'منى الوهيبية', 4, 'الغرف نظيفة ومريحة للغاية، الإطلالة ساحرة جداً وننصح بزيارته')
          `, [hid]);
        }
      }
    } catch (seedErr) {
      console.warn("PMS/RBAC Seeding warning:", seedErr);
    }

    // --- MARKETING & PROMOTIONAL ADS SYSTEM ---
    console.log("⏳ Creating Marketing Ads and Splash Configuration tables...");
    
    await pool.query(`
      CREATE TABLE IF NOT EXISTS "db_marketing_ads" (
        "id" serial PRIMARY KEY,
        "title" text NOT NULL,
        "title_ar" text NOT NULL,
        "description" text NOT NULL,
        "description_ar" text NOT NULL,
        "image_url" text NOT NULL,
        "link" text,
        "is_active" boolean NOT NULL DEFAULT true,
        "created_at" timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS "db_splash_config" (
        "id" serial PRIMARY KEY,
        "title" text NOT NULL,
        "title_ar" text NOT NULL,
        "subtitle" text NOT NULL,
        "subtitle_ar" text NOT NULL,
        "background_type" text NOT NULL DEFAULT 'landscape', -- 'landscape' or 'image'
        "background_image" text,
        "is_active" boolean NOT NULL DEFAULT true,
        "created_at" timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Seed default ads if empty
    try {
      const adsCheck = await pool.query(`SELECT COUNT(*) FROM "db_marketing_ads"`);
      if (parseInt(adsCheck.rows[0].count, 10) === 0) {
        console.log("🌱 Seeding default promotional and marketing ads...");
        await pool.query(`
          INSERT INTO "db_marketing_ads" (title, title_ar, description, description_ar, image_url, link, is_active) VALUES
          (
            'Student Companies Exhibition - Injaz Oman', 
            'معرض الشركات الطلابية - إنجاز عُمان', 
            'March 5-7 | 7:30 PM - 12:00 AM at Oman Convention & Exhibition Centre', 
            '٥ - ٧ مارس | ٧:٣٠ مساءً - ١٢:٠٠ صباحاً في مركز عُمان للمعارض والمؤتمرات', 
            '/assets/image_1772574646292.png', 
            'https://maps.app.goo.gl/2SFBSzDjqRn9sY216', 
            true
          ),
          (
            'Magical Jebel Shams Adventures', 
            'مغامرات جبل شمس الساحرة', 
            'Explore the high peak of Jebel Shams and enjoy the cool weather and breathtaking views.', 
            'استكشف قمة جبل شمس الشاهقة واستمتع بالطقس البارد والإطلالات الخلابة.', 
            'https://images.unsplash.com/photo-1544644181-1484b3fdfc62?auto=format&fit=crop&w=1200&q=80', 
            '/hiking', 
            true
          ),
          (
            'Special SUV Rental Discount', 
            'خصم خاص على حجز سيارات الدفع الرباعي', 
            'Save 15% on all SUV rentals this week for a unique desert experience.', 
            'وفر ١٥٪ على جميع حجوزات سيارات الدفع الرباعي هذا الأسبوع لتجربة برية فريدة.', 
            'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=1200&q=80', 
            '/taxis', 
            true
          )
        `);
      }

      const splashCheck = await pool.query(`SELECT COUNT(*) FROM "db_splash_config"`);
      if (parseInt(splashCheck.rows[0].count, 10) === 0) {
        console.log("🌱 Seeding default splash screen configurations...");
        await pool.query(`
          INSERT INTO "db_splash_config" (title, title_ar, subtitle, subtitle_ar, background_type, is_active) VALUES
          (
            'Welcome to Shouma', 
            'مرحباً بكم في شومة', 
            'Your smart integrated tour guide in the Sultanate of Oman', 
            'دليلك السياحي الذكي المتكامل في سلطنة عُمان', 
            'landscape', 
            true
          )
        `);
      }
    } catch (seedErr) {
      console.warn("Marketing/Splash Seeding warning:", seedErr);
    }

    // Create user_settings table if it doesn't exist
    try {
      await pool.query(`
        CREATE TABLE IF NOT EXISTS "user_settings" (
          "id" serial PRIMARY KEY,
          "user_id" varchar NOT NULL UNIQUE REFERENCES "users"("id") ON DELETE CASCADE,
          "currency" varchar(3) NOT NULL DEFAULT 'OMR',
          "gps_enabled" boolean NOT NULL DEFAULT true,
          "distance_unit" varchar(2) NOT NULL DEFAULT 'km',
          "booking_notifications" boolean NOT NULL DEFAULT true,
          "promo_notifications" boolean NOT NULL DEFAULT true,
          "updated_at" timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
        )
      `);
      console.log("✅ Verified 'user_settings' table exists!");
    } catch (errSettings) {
      console.error("Error creating user_settings table:", errSettings);
    }

    console.log("✅ Automated shouma-explorer database verification complete!");

  } catch (error) {
    console.error("❌ Error in automated database verification:", error);
  }
}
