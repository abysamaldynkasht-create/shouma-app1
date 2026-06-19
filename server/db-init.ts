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
      console.log("✅ Verified hotel split gateways, email, and password columns inside 'db_hotels'!");
    } catch (e) {
      console.warn("Hotel split/credentials columns already exist or alter failed:", e);
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

    console.log("✅ Automated shouma-explorer database verification complete!");

  } catch (error) {
    console.error("❌ Error in automated database verification:", error);
  }
}
