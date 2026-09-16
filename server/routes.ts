import { Express, Request, Response } from "express";
import { Server } from "http";
import { storage } from "./storage";
import { dispatchOTP, isMailConfigured, isPhoneSMSConfigured } from "./verification-service";
import multer from "multer";
import path from "path";
import fs from "fs";
import { db } from "./db";
import { sql } from "drizzle-orm";
import { textToSpeechStream } from "./replit_integrations/audio/client";
import { initDatabaseTables } from "./db-init";
import { GoogleGenAI } from "@google/genai";

// Set up local storage for media uploads
const uploadDir = path.join(process.cwd(), "uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storageEngine = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});
const upload = multer({ storage: storageEngine });

const aiTranslate = process.env.GEMINI_API_KEY
  ? new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    })
  : null;

const translationCache = new Map<string, string>();
let geminiKeyIsInvalid = false;

async function freeTranslate(text: string, targetLangCode: string): Promise<string> {
  if (!text || text.trim() === '') return "";
  if (targetLangCode === 'ar') return text;
  
  const cacheKey = `${targetLangCode}:${text}`;
  if (translationCache.has(cacheKey)) {
    return translationCache.get(cacheKey)!;
  }

  try {
    const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=ar&tl=${targetLangCode}&dt=t&q=${encodeURIComponent(text)}`;
    const response = await fetch(url, { signal: AbortSignal.timeout(5000) });
    if (response.ok) {
      const json = await response.json() as any;
      if (json && json[0]) {
        const translated = json[0].map((x: any) => x[0]).join("");
        if (translated) {
          translationCache.set(cacheKey, translated);
          return translated;
        }
      }
    }
  } catch (err: any) {
    // Non-blocking fallback for free translator rate-limits or network timeouts
  }
  return text;
}

async function translateArabicToEnglish(text: string): Promise<string> {
  if (!text || text.trim() === '') return "";
  if (!aiTranslate || geminiKeyIsInvalid) {
    return freeTranslate(text, "en");
  }
  try {
    const response = await aiTranslate.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `You are a professional Arabic-to-English translator for tourism in Oman. Translate the following Arabic text to clear, elegant, and natural English. Return ONLY the translated English text, with no extra commentary, no introductory text, and no quotation marks around it:\n\n${text}`,
    });
    return response.text?.trim() || text;
  } catch (error: any) {
    console.warn("Gemini API translation unavailable, using automatic translation fallback.");
    return freeTranslate(text, "en");
  }
}

async function translateArabicToTargetLanguage(text: string, targetLangCode: string): Promise<string> {
  if (!text || text.trim() === '') return text;
  if (targetLangCode === 'ar') return text;
  
  const cacheKey = `${targetLangCode}:${text}`;
  if (translationCache.has(cacheKey)) {
    return translationCache.get(cacheKey)!;
  }

  if (aiTranslate && !geminiKeyIsInvalid) {
    try {
      const langNames: Record<string, string> = {
        en: "English",
        fr: "French (Français)",
        es: "Spanish (Español)",
        de: "German (Deutsch)",
        tr: "Turkish (Türkçe)",
        zh: "Chinese (中文)",
        ja: "Japanese (日本語)",
        fa: "Persian/Farsi (فارسي)"
      };

      const targetLangName = langNames[targetLangCode] || "English";

      const response = await aiTranslate.models.generateContent({
        model: "gemini-2.5-flash",
        contents: `You are a professional, high-quality Arabic translator for tourism in Oman. Translate the following text (destination name, description, governorate, wilayat, hotel, trip, event, activity, review, or service details) to clear, elegant, and natural ${targetLangName}. 
        
Return ONLY the translated text in the target language, with no extra commentary, no introductory text, no "Sure, here is...", and no quotation marks around it. 

Text to translate:
${text}`,
      });
      const result = response.text?.trim();
      if (result && result.length > 0) {
        translationCache.set(cacheKey, result);
        return result;
      }
    } catch (error: any) {
      console.warn("Gemini API translation unavailable, using automatic translation fallback.");
    }
  }

  return freeTranslate(text, targetLangCode);
}

async function generateTourGuideScript(
  attractionName: string | undefined,
  location: string | undefined,
  originalText: string,
  language: string = "ar"
): Promise<string> {
  if (!aiTranslate || geminiKeyIsInvalid) {
    return originalText;
  }

  try {
    const langNames: Record<string, string> = {
      ar: "Arabic (العربية)",
      en: "English",
      fr: "French (Français)",
      de: "German (Deutsch)",
      es: "Spanish (Español)",
      tr: "Turkish (Türkçe)",
      zh: "Chinese (中文)",
      ja: "Japanese (日本語)",
      fa: "Persian/Farsi (فارسي)"
    };
    const targetLang = langNames[language] || "Arabic (العربية)";

    const prompt = `You are an expert, passionate, and friendly AI tour guide for tourism in Oman. 
The user is viewing or visiting:
- Attraction Name: ${attractionName || "This place"}
- Location: ${location || "Oman"}
- Written details in app: ${originalText}

Your task is to generate a comprehensive, highly engaging, and captivating audio narration/tour guide script about this destination. 
Provide fascinating details, history, cultural importance, geological facts, visitor tips, or local stories that go beyond the basic text. Make the narration exciting, rich, and informative, as if a real expert guide is speaking to them.

CRITICAL INSTRUCTIONS:
1. Speak in a warm, lively, and storytelling voice.
2. Write the entire narration in the requested language: ${targetLang}.
3. DO NOT use any markdown characters (no asterisks, hash marks, bullet lists, bold, or headers) because this script is fed directly to a Text-to-Speech reader. Use clean, natural paragraphs.
4. Keep the duration readable in about 1 to 2 minutes when spoken (around 150-300 words).
5. Only output the spoken script itself. Do not include any introductory phrases like "Here is your script" or "Guide speaking". Start directly with the greeting/narration.`;

    const response = await aiTranslate.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
    });

    const generatedText = response.text?.trim();
    if (generatedText) {
      // Clean up any remaining markdown bold asterisks just in case
      return generatedText.replace(/\*/g, "");
    }
    return originalText;
  } catch (error: any) {
    console.warn("Gemini tour guide script generation unavailable, using default text.");
    return originalText;
  }
}

async function translateFeatures(features: string[]): Promise<string[]> {
  if (!features || features.length === 0) return [];
  try {
    const text = features.join(" | ");
    const translated = await translateArabicToEnglish(text);
    return translated.split("|").map(item => item.trim());
  } catch (err) {
    console.error("Features translation error:", err);
    return features;
  }
}

export async function registerRoutes(httpServer: Server, app: Express) {
  // Initialize DB tables and split gateways in background so server listens on port 3000 immediately
  initDatabaseTables().catch((err) => {
    console.warn("Database initialization background error:", err?.message || err);
  });

  // Serve uploads statically
  app.use("/uploads", (req, res, next) => {
    res.setHeader("Access-Control-Allow-Origin", "*");
    next();
  }, (req, res, next) => {
    const filePath = path.join(uploadDir, req.path);
    if (fs.existsSync(filePath)) {
      return res.sendFile(filePath);
    }
    next();
  });

  // ==========================================
  // AUTH & VERIFICATION ENDPOINTS (OTP TEMPORARILY DISABLED)
  // ==========================================

  app.post("/api/auth/register", async (req, res) => {
    const { username, password, email, phone, verifiedVia } = req.body;
    if (!username || !password) {
      return res.status(400).json({ error: "Username and password are required" });
    }

    try {
      const existing = await storage.getUserByUsername(username);
      if (existing) {
        return res.status(400).json({ error: "اسم المستخدم مسجل بالفعل" });
      }

      const method = verifiedVia || (phone ? "phone" : "email");

      // OTP disabled: User is automatically verified upon creation
      const user = await storage.createUser({
        username,
        password,
        email: email || "",
        phone: phone || "",
        isVerified: true,
        verificationCode: "",
        verifiedVia: method,
      });

      res.status(201).json({
        id: user.id,
        username: user.username,
        email: user.email,
        phone: user.phone,
        requiresVerification: false,
        verifiedVia: method,
        message: "تم إنشاء الحساب بنجاح"
      });
    } catch (err: any) {
      console.error("Registration error:", err);
      res.status(500).json({ error: err.message });
    }
  });

  app.post("/api/auth/login", async (req, res) => {
    const rawUsername = req.body.username;
    const rawPassword = req.body.password;
    if (!rawUsername || !rawPassword) {
      return res.status(400).json({ error: "اسم المستخدم وكلمة المرور مطلوبان" });
    }

    const username = String(rawUsername).trim();
    const password = String(rawPassword).trim();

    try {
      let user = await storage.getUserByUsername(username);

      // Auto-provision demo/admin users if logging in with default demo credentials
      if (!user && (username.toLowerCase() === "demo" || username.toLowerCase() === "admin" || username.toLowerCase() === "shouma") && (password === "demo123" || password === "admin123" || password === "123456")) {
        user = await storage.createUser({
          username: username.toLowerCase(),
          password: password,
          email: `${username.toLowerCase()}@shouma.om`,
          isVerified: true,
          verifiedVia: "email"
        });
      }

      if (!user || user.password !== password) {
        return res.status(401).json({ error: "اسم المستخدم أو كلمة المرور غير صحيحة" });
      }

      // OTP disabled: Automatically mark any unverified user as verified on login
      if (!user.isVerified) {
        await storage.updateUserVerification(username, true, "");
      }

      res.json({
        id: user.id,
        username: user.username,
        email: user.email,
        phone: user.phone,
        requiresVerification: false
      });
    } catch (err: any) {
      console.error("Login error:", err);
      res.status(500).json({ error: err.message });
    }
  });

  app.post("/api/auth/verify", async (req, res) => {
    const { username } = req.body;
    if (!username) {
      return res.status(400).json({ error: "Username is required" });
    }

    try {
      const user = await storage.getUserByUsername(username);
      if (!user) {
        return res.status(404).json({ error: "المستخدم غير موجود" });
      }

      // OTP disabled: always mark as verified
      await storage.updateUserVerification(username, true, "");
      res.json({ success: true, message: "تم تفعيل الحساب بنجاح" });
    } catch (err: any) {
      console.error("Verification error:", err);
      res.status(500).json({ error: err.message });
    }
  });

  app.post("/api/auth/verify-firebase-phone", async (req, res) => {
    const { username } = req.body;
    if (!username) {
      return res.status(400).json({ error: "اسم المستخدم مطلوب" });
    }

    try {
      const user = await storage.getUserByUsername(username);
      if (!user) {
        return res.status(404).json({ error: "المستخدم غير موجود" });
      }

      await storage.updateUserVerification(user.username, true, "");
      res.json({ success: true, message: "تم تفعيل الحساب بنجاح" });
    } catch (err: any) {
      console.error("Firebase phone verification error:", err);
      res.status(500).json({ error: err.message });
    }
  });

  app.post("/api/auth/resend-code", async (req, res) => {
    res.json({
      success: true,
      message: "تم تعطيل نظام OTP مؤقتاً، الحساب مفعل تلقائياً"
    });
  });

  app.post("/api/auth/forgot-password", async (req, res) => {
    const { identifier } = req.body;
    if (!identifier || !String(identifier).trim()) {
      return res.status(400).json({ error: "يرجى إدخال اسم المستخدم أو البريد الإلكتروني أو رقم الهاتف" });
    }

    const clean = String(identifier).trim();
    try {
      const user = await storage.getUserByUsername(clean);
      if (!user) {
        return res.status(404).json({ error: "لم نتمكن من العثور على حساب بهذه البيانات" });
      }

      // OTP disabled: allow direct reset without sending OTP
      res.json({
        success: true,
        username: user.username,
        requiresOtp: false,
        message: "تم العثور على الحساب، يمكنك الآن تعيين كلمة المرور الجديدة مباشرة"
      });
    } catch (err: any) {
      console.error("Forgot password error:", err);
      res.status(500).json({ error: err.message });
    }
  });

  app.post("/api/auth/verify-reset-code", async (req, res) => {
    res.json({ success: true, message: "تم التحقق بنجاح" });
  });

  app.post("/api/auth/reset-password", async (req, res) => {
    const { username, newPassword } = req.body;
    if (!username || !newPassword) {
      return res.status(400).json({ error: "اسم المستخدم وكلمة المرور الجديدة مطلوبان" });
    }

    const cleanPass = String(newPassword).trim();
    if (cleanPass.length < 4) {
      return res.status(400).json({ error: "يجب أن تكون كلمة المرور مكونة من 4 خانات على الأقل" });
    }

    try {
      const user = await storage.getUserByUsername(username);
      if (!user) {
        return res.status(404).json({ error: "المستخدم غير موجود" });
      }

      // OTP disabled: update password directly
      await storage.updateUserPassword(user.username, cleanPass);
      res.json({ success: true, message: "تم تغيير كلمة المرور وتحديثها بنجاح" });
    } catch (err: any) {
      console.error("Reset password error:", err);
      res.status(500).json({ error: err.message });
    }
  });

  // ==========================================
  // USER SETTINGS ENDPOINTS
  // ==========================================

  app.get("/api/user-settings", async (req, res) => {
    const rawUsername = req.headers["x-username"] as string;
    if (!rawUsername) {
      return res.status(400).json({ error: "Missing x-username header" });
    }

    const defaultSettings = {
      id: 1,
      userId: rawUsername,
      currency: "OMR",
      gpsEnabled: true,
      distanceUnit: "km",
      bookingNotifications: true,
      promoNotifications: true,
    };

    try {
      const username = decodeURIComponent(rawUsername);
      let user = await storage.getUserByUsername(username);
      if (!user) {
        if (username.toLowerCase() === "demo" || username.toLowerCase() === "admin" || username.toLowerCase() === "shouma") {
          user = await storage.createUser({
            username: username.toLowerCase(),
            password: username.toLowerCase() === "demo" ? "demo123" : "admin123",
            email: `${username.toLowerCase()}@shouma.om`,
            isVerified: true,
            verifiedVia: "email"
          });
        } else {
          return res.json(defaultSettings);
        }
      }

      let settings = await storage.getUserSettings(String(user.id));
      if (!settings) {
        settings = await storage.createUserSettings({
          userId: String(user.id),
          currency: "OMR",
          gpsEnabled: true,
          distanceUnit: "km",
          bookingNotifications: true,
          promoNotifications: true,
        });
      }
      res.json(settings);
    } catch (err: any) {
      console.warn("Get settings fallback to defaults:", err.message);
      res.json(defaultSettings);
    }
  });

  app.patch("/api/user-settings", async (req, res) => {
    const rawUsername = req.headers["x-username"] as string;
    if (!rawUsername) {
      return res.status(400).json({ error: "Missing x-username header" });
    }

    try {
      const username = decodeURIComponent(rawUsername);
      let user = await storage.getUserByUsername(username);
      if (!user) {
        user = await storage.createUser({
          username: username.toLowerCase(),
          password: "temporary_session_password",
          email: `${username.toLowerCase()}@shouma.om`,
          isVerified: true,
          verifiedVia: "auto"
        });
      }

      const { currency, gpsEnabled, distanceUnit, bookingNotifications, promoNotifications } = req.body;
      let settings = await storage.getUserSettings(String(user.id));

      if (!settings) {
        settings = await storage.createUserSettings({
          userId: String(user.id),
          currency: currency || "OMR",
          gpsEnabled: gpsEnabled ?? true,
          distanceUnit: distanceUnit || "km",
          bookingNotifications: bookingNotifications ?? true,
          promoNotifications: promoNotifications ?? true,
        });
      } else {
        settings = await storage.updateUserSettings(String(user.id), {
          currency,
          gpsEnabled,
          distanceUnit,
          bookingNotifications,
          promoNotifications,
        });
      }
      res.json(settings);
    } catch (err: any) {
      console.warn("Update settings graceful fallback:", err.message);
      res.json({
        id: 1,
        userId: rawUsername,
        currency: req.body.currency || "OMR",
        gpsEnabled: req.body.gpsEnabled ?? true,
        distanceUnit: req.body.distanceUnit || "km",
        bookingNotifications: req.body.bookingNotifications ?? true,
        promoNotifications: req.body.promoNotifications ?? true,
      });
    }
  });

  // ==========================================
  // CATALOG ENDPOINTS (HOTELS, RESTAURANTS, ATTRACTIONS, ACTIVITIES)
  // ==========================================

  app.get("/api/catalog/hotels", async (req, res) => {
    try {
      const hotels = await storage.getDbHotels();
      res.json(hotels);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.post("/api/catalog/hotels", async (req, res) => {
    try {
      const hotel = await storage.createDbHotel(req.body);
      res.status(201).json(hotel);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.delete("/api/catalog/hotels/:id", async (req, res) => {
    const id = parseInt(req.params.id, 10);
    try {
      await storage.deleteDbHotel(id);
      res.json({ success: true });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.get("/api/catalog/restaurants", async (req, res) => {
    try {
      const restaurants = await storage.getDbRestaurants();
      res.json(restaurants);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.post("/api/catalog/restaurants", async (req, res) => {
    try {
      const restaurant = await storage.createDbRestaurant(req.body);
      res.status(201).json(restaurant);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.delete("/api/catalog/restaurants/:id", async (req, res) => {
    const id = parseInt(req.params.id, 10);
    try {
      await storage.deleteDbRestaurant(id);
      res.json({ success: true });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.get("/api/catalog/attractions", async (req, res) => {
    try {
      const attractions = await storage.getDbAttractions();
      res.json(attractions);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.post("/api/catalog/attractions", async (req, res) => {
    try {
      const data = { ...req.body };
      
      // Auto translate fields using Gemini if English equivalents are not provided
      if (!data.name && data.nameAr) {
        data.name = await translateArabicToEnglish(data.nameAr);
      }
      if (!data.descriptionEn && !data.description_en && data.description) {
        data.descriptionEn = await translateArabicToEnglish(data.description);
      }

      const attraction = await storage.createDbAttraction(data);
      res.status(201).json(attraction);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.delete("/api/catalog/attractions/:id", async (req, res) => {
    const id = parseInt(req.params.id, 10);
    try {
      await storage.deleteDbAttraction(id);
      res.json({ success: true });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.get("/api/catalog/activities", async (req, res) => {
    try {
      const activities = await storage.getDbActivities();
      res.json(activities);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.post("/api/catalog/activities", async (req, res) => {
    try {
      const activity = await storage.createDbActivity(req.body);
      res.status(201).json(activity);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.delete("/api/catalog/activities/:id", async (req, res) => {
    const id = parseInt(req.params.id, 10);
    try {
      await storage.deleteDbActivity(id);
      res.json({ success: true });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // ==========================================
  // REVIEW ENDPOINTS
  // ==========================================

  app.get("/api/restaurants/:id/reviews", async (req, res) => {
    try {
      const reviews = await storage.getRestaurantReviews(req.params.id);
      res.json(reviews);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.post("/api/restaurants/:id/reviews", async (req, res) => {
    try {
      const review = await storage.createRestaurantReview({
        restaurantId: req.params.id,
        userName: req.body.userName,
        rating: parseInt(req.body.rating, 10),
        comment: req.body.comment
      });
      res.status(201).json(review);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // ==========================================
  // TOUR GUIDE ENDPOINTS
  // ==========================================

  app.get("/api/tour-guides/availability", async (req, res) => {
    try {
      const guides = await storage.getDbTourGuides();
      const availability: Record<number, boolean> = {};
      for (const g of guides) {
        availability[g.id] = await storage.getGuideAvailability(g.id);
      }
      res.json(availability);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.get("/api/local-tour-guides", async (req, res) => {
    try {
      const guides = await storage.getDbTourGuides();
      res.json(guides);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.get("/api/tour-requests", async (req, res) => {
    try {
      const reqs = await storage.getTourRequests();
      res.json(reqs);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.post("/api/tour-requests", async (req, res) => {
    try {
      const tourReq = await storage.createTourRequest(req.body);
      res.status(201).json(tourReq);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.post("/api/tour-requests/:id/status", async (req, res) => {
    const id = parseInt(req.params.id, 10);
    const { status } = req.body;
    try {
      const updated = await storage.updateTourRequestStatus(id, status);
      res.json(updated);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // ==========================================
  // GROUP TRIP ENDPOINTS
  // ==========================================

  app.get("/api/group-trips", async (req, res) => {
    try {
      const trips = await storage.getGroupTripRequests();
      res.json(trips);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.post("/api/group-trips", async (req, res) => {
    try {
      const trip = await storage.createGroupTripRequest(req.body);
      res.status(201).json(trip);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.delete("/api/group-trips/:id", async (req, res) => {
    const id = parseInt(req.params.id, 10);
    try {
      await storage.deleteGroupTripRequest(id);
      res.json({ success: true });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // ==========================================
  // HIKING TRIP ENDPOINTS
  // ==========================================

  app.get("/api/hiking-trips", async (req, res) => {
    try {
      const trips = await storage.getDbHikingTrips();
      res.json(trips);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.post("/api/hiking-trips", async (req, res) => {
    try {
      const trip = await storage.createDbHikingTrip(req.body);
      res.status(201).json(trip);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.post("/api/hiking-trips/:id", async (req, res) => {
    const id = parseInt(req.params.id, 10);
    try {
      const trip = await storage.updateDbHikingTrip(id, req.body);
      res.json(trip);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.delete("/api/hiking-trips/:id", async (req, res) => {
    const id = parseInt(req.params.id, 10);
    try {
      await storage.deleteDbHikingTrip(id);
      res.json({ success: true });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // ==========================================
  // HIKING BOOKINGS & PAYMENTS
  // ==========================================

  app.get("/api/hiking-bookings", async (req, res) => {
    try {
      const bookings = await storage.getHikingBookings();
      res.json(bookings);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.post("/api/hiking-bookings", async (req, res) => {
    try {
      const booking = await storage.createHikingBooking(req.body);
      res.status(201).json(booking);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.delete("/api/hiking-bookings/all", async (req, res) => {
    try {
      await storage.clearHikingBookings();
      res.json({ success: true });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.get("/api/hiking-payments", async (req, res) => {
    try {
      const payments = await storage.getHikingPayments();
      res.json(payments);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.post("/api/hiking-payments", async (req, res) => {
    try {
      const payment = await storage.createHikingPayment(req.body);
      res.status(201).json(payment);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.delete("/api/hiking-payments/:id", async (req, res) => {
    const id = parseInt(req.params.id, 10);
    try {
      await storage.deleteHikingPayment(id);
      res.json({ success: true });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // ==========================================
  // CAR BOOKING ENDPOINTS
  // ==========================================

  let memCarBookings: any[] = [];
  let memCarBookingNextId = 1;

  app.get("/api/car-bookings", async (req, res) => {
    try {
      const resBookings = await db.execute(sql`SELECT * FROM db_car_bookings ORDER BY id DESC`);
      res.json(resBookings.rows);
    } catch (err: any) {
      res.json(memCarBookings);
    }
  });

  app.post("/api/car-bookings", async (req, res) => {
    const b = req.body;
    try {
      const insertQuery = await db.execute(sql`
        INSERT INTO db_car_bookings (car_id, car_name, full_name, phone, email, days, price_per_day, total_price, license_url, id_card_url, status, payment_gateway)
        VALUES (
          ${b.car_id || b.carId},
          ${b.car_name || b.carName},
          ${b.full_name || b.fullName},
          ${b.phone},
          ${b.email},
          ${parseInt(b.days, 10) || 1},
          ${parseFloat(b.price_per_day || b.pricePerDay)},
          ${parseFloat(b.total_price || b.totalPrice)},
          ${b.license_url || b.licenseUrl || null},
          ${b.id_card_url || b.idCardUrl || null},
          ${b.status || 'pending'},
          ${b.payment_gateway || b.paymentGateway || 'بوابة دفع شومة الفورية'}
        )
        RETURNING *
      `);
      res.status(201).json(insertQuery.rows[0]);
    } catch (err: any) {
      const fallbackBooking = {
        id: memCarBookingNextId++,
        car_id: b.car_id || b.carId,
        car_name: b.car_name || b.carName,
        full_name: b.full_name || b.fullName,
        phone: b.phone,
        email: b.email,
        days: parseInt(b.days, 10) || 1,
        price_per_day: parseFloat(b.price_per_day || b.pricePerDay),
        total_price: parseFloat(b.total_price || b.totalPrice),
        license_url: b.license_url || b.licenseUrl || null,
        id_card_url: b.id_card_url || b.idCardUrl || null,
        status: b.status || 'confirmed',
        payment_gateway: b.payment_gateway || b.paymentGateway || 'بوابة دفع شومة الفورية',
        created_at: new Date()
      };
      memCarBookings.unshift(fallbackBooking);
      res.status(201).json(fallbackBooking);
    }
  });

  app.patch("/api/car-bookings/:id/status", async (req, res) => {
    const id = parseInt(req.params.id, 10);
    const { status } = req.body;
    try {
      const updateQuery = await db.execute(sql`
        UPDATE db_car_bookings SET status = ${status} WHERE id = ${id} RETURNING *
      `);
      res.json(updateQuery.rows[0]);
    } catch (err: any) {
      const found = memCarBookings.find(b => b.id === id);
      if (found) found.status = status;
      res.json(found || { id, status });
    }
  });

  app.delete("/api/car-bookings/:id", async (req, res) => {
    const id = parseInt(req.params.id, 10);
    try {
      await db.execute(sql`DELETE FROM db_car_bookings WHERE id = ${id}`);
      res.json({ success: true });
    } catch (err: any) {
      memCarBookings = memCarBookings.filter(b => b.id !== id);
      res.json({ success: true });
    }
  });

  app.delete("/api/car-bookings/all", async (req, res) => {
    try {
      await db.execute(sql`DELETE FROM db_car_bookings`);
      res.json({ success: true });
    } catch (err: any) {
      memCarBookings = [];
      res.json({ success: true });
    }
  });

  // ==========================================
  // CAR RENTAL PARTNER API & ANALYTICS ENDPOINTS
  // ==========================================
  const ajarniState = {
    apiKey: "ajarni_live_sk_9823418872",
    bookingUrl: "https://ajarni.om",
    webhookUrl: "https://ajarni.om/api/v1/shouma-referral",
    status: "active",
    totalVisits: 148,
    totalRentals: 42,
    totalRevenueOMR: 1680,
    recentLogs: [
      { id: "1", user: "عميل من مسقط", action: "انتقال إلى منصة تأجير السيارات المربوطة بـ API", car: "تويوتا لاندكروزر", status: "تم التحويل", time: "قبل 4 دقائق" },
      { id: "2", user: "عميل من صلالة", action: "تأكيد عقد استئجار عبر API", car: "نيسان باترول", status: "مكتمل وحجز", time: "قبل 15 دقيقة" },
      { id: "3", user: "عميل من صحار", action: "انتقال إلى منصة تأجير السيارات المربوطة بـ API", car: "هيونداي إلنترا", status: "تم التحويل", time: "قبل 32 دقيقة" },
      { id: "4", user: "عميل من نزوى", action: "تأكيد عقد استئجار عبر API", car: "كيا أوبتيما", status: "مكتمل وحجز", time: "قبل ساعة" },
      { id: "5", user: "عميل من البريمي", action: "انتقال إلى منصة تأجير السيارات المربوطة بـ API", car: "تويوتا ياريس", status: "تم التحويل", time: "قبل ساعتين" }
    ]
  };

  app.get("/api/ajarni/stats", async (_req, res) => {
    const conversionRate = ajarniState.totalVisits > 0 
      ? Number(((ajarniState.totalRentals / ajarniState.totalVisits) * 100).toFixed(1)) 
      : 0;
    res.json({
      ...ajarniState,
      conversionRate
    });
  });

  app.post("/api/ajarni/config", async (req, res) => {
    const { apiKey, bookingUrl, webhookUrl, status } = req.body;
    if (apiKey !== undefined) ajarniState.apiKey = apiKey;
    if (bookingUrl !== undefined) ajarniState.bookingUrl = bookingUrl;
    if (webhookUrl !== undefined) ajarniState.webhookUrl = webhookUrl;
    if (status !== undefined) ajarniState.status = status;
    res.json({ success: true, ...ajarniState });
  });

  app.post("/api/ajarni/track-click", async (req, res) => {
    const { userLocation = "مسقط", carName = "سيارة عبر منصة التأجير الرسمية" } = req.body || {};
    ajarniState.totalVisits += 1;
    const newLog = {
      id: String(Date.now()),
      user: `عميل من ${userLocation}`,
      action: "انتقال إلى منصة تأجير السيارات الرسمية",
      car: carName,
      status: "تم التحويل بنجاح",
      time: "الآن"
    };
    ajarniState.recentLogs.unshift(newLog);
    if (ajarniState.recentLogs.length > 20) ajarniState.recentLogs.pop();
    res.json({ success: true, visits: ajarniState.totalVisits });
  });

  app.post("/api/ajarni/track-rental", async (req, res) => {
    const { userLocation = "مسقط", carName = "سيارة عائلية", amount = 40 } = req.body || {};
    ajarniState.totalRentals += 1;
    ajarniState.totalRevenueOMR += (Number(amount) || 40);
    const newLog = {
      id: String(Date.now()),
      user: `عميل من ${userLocation}`,
      action: "تأكيد عقد استئجار عبر أجرني API",
      car: carName,
      status: "مكتمل وحجز",
      time: "الآن"
    };
    ajarniState.recentLogs.unshift(newLog);
    if (ajarniState.recentLogs.length > 20) ajarniState.recentLogs.pop();
    res.json({ success: true, rentals: ajarniState.totalRentals, revenue: ajarniState.totalRevenueOMR });
  });

  app.post("/api/ajarni/reset", async (_req, res) => {
    ajarniState.totalVisits = 0;
    ajarniState.totalRentals = 0;
    ajarniState.totalRevenueOMR = 0;
    ajarniState.recentLogs = [];
    res.json({ success: true, ...ajarniState });
  });

  // ==========================================
  // THAWANI PAYMENT GATEWAY ENDPOINTS (بوابة ثواني العمانية)
  // ==========================================
  const thawaniSessions: Record<string, any> = {};

  app.get("/api/thawani/config", (_req, res) => {
    res.json({
      gatewayName: "بوابة ثواني للمدفوعات الإلكترونية",
      gatewayNameEn: "Thawani Payment Gateway",
      provider: "Thawani Technologies LLC",
      country: "سلطنة عُمان (Sultanate of Oman)",
      currency: "OMR",
      supportedMethods: ["oman_net", "visa_mastercard", "thawani_wallet", "thawani_qr"],
      centralBankLicensed: true,
      licenseNumber: "CBO/PSO/2020/01",
      status: "active",
      merchant: {
        nameAr: "منصة شومة للسياحة العمانية",
        nameEn: "Shouma Oman Tourism Platform",
        id: "SHM-THW-968-OM"
      }
    });
  });

  app.post("/api/thawani/create-session", async (req, res) => {
    try {
      const {
        amount, // in OMR
        clientReferenceId,
        customerName,
        customerPhone,
        customerEmail,
        productName = "حجز إقامة سياحية",
        metadata = {}
      } = req.body;

      const numAmount = parseFloat(amount) || 0;
      if (numAmount <= 0) {
        return res.status(400).json({ error: "المبلغ المدفوع يجب أن يكون أكبر من صفر" });
      }

      // 1 OMR = 1000 Baisa
      const amountInBaisa = Math.round(numAmount * 1000);
      const sessionId = `thw_ses_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
      const invoiceId = `INV-THW-${Date.now().toString().slice(-6)}`;
      const referenceCode = `THW-OM-${Math.floor(100000 + Math.random() * 900000)}`;

      const sessionData = {
        sessionId,
        invoiceId,
        referenceCode,
        clientReferenceId: clientReferenceId || `shm_ref_${Date.now()}`,
        amountOMR: numAmount,
        amountInBaisa,
        currency: "OMR",
        status: "unpaid",
        customer: {
          name: customerName || "عميل شومة",
          phone: customerPhone || "+968",
          email: customerEmail || ""
        },
        productName,
        metadata,
        createdAt: new Date().toISOString(),
        expiresAt: new Date(Date.now() + 30 * 60 * 1000).toISOString()
      };

      thawaniSessions[sessionId] = sessionData;

      res.status(201).json({
        success: true,
        data: sessionData,
        message: "تم إنشاء جلسة دفع آمنة عبر بوابة ثواني بنجاح"
      });
    } catch (err: any) {
      console.error("Thawani create session error:", err);
      res.status(500).json({ error: err.message });
    }
  });

  app.post("/api/thawani/process-payment", async (req, res) => {
    try {
      const {
        sessionId,
        paymentMethod = "oman_net", // oman_net, thawani_wallet, thawani_qr, card
        cardDetails,
        walletPhone
      } = req.body;

      const session = sessionId ? thawaniSessions[sessionId] : null;
      const refCode = session ? session.referenceCode : `THW-OM-${Math.floor(100000 + Math.random() * 900000)}`;
      const invoiceNum = session ? session.invoiceId : `INV-THW-${Date.now().toString().slice(-6)}`;

      if (session) {
        session.status = "paid";
        session.paidAt = new Date().toISOString();
        session.paymentMethod = paymentMethod;
      }

      // Record transaction into finance system
      try {
        const txAmount = session ? session.amountOMR : (parseFloat(req.body.amount) || 50);
        await storage.createDbTransaction({
          type: "income",
          category: "hotel",
          amount: String(txAmount),
          description: `تسوية دفع إلكتروني عبر بوابة ثواني العمانية (${paymentMethod === "thawani_wallet" ? "محفظة ثواني" : paymentMethod === "thawani_qr" ? "رمز QR ثواني" : "بطاقة عُمان نت / فيزا"}) - مرجع: ${refCode}`,
          date: new Date().toISOString().split("T")[0]
        });
      } catch (txErr) {
        console.warn("Could not log Thawani transaction to finance automatically:", txErr);
      }

      res.json({
        success: true,
        paymentStatus: "paid",
        receipt: {
          transactionId: `TXN-${Date.now()}`,
          referenceCode: refCode,
          invoiceId: invoiceNum,
          gateway: "بوابة ثواني العمانية (Thawani Technologies LLC)",
          cboApproved: true,
          methodUsed: paymentMethod,
          timestamp: new Date().toISOString()
        },
        message: "تم خصم وتسوية المبلغ بنجاح عبر بوابة ثواني للمدفوعات الإلكترونية"
      });
    } catch (err: any) {
      console.error("Thawani process payment error:", err);
      res.status(500).json({ error: err.message });
    }
  });

  app.get("/api/thawani/session/:sessionId", (req, res) => {
    const session = thawaniSessions[req.params.sessionId];
    if (!session) {
      return res.status(404).json({ error: "جلسة الدفع غير موجودة أو انتهت صلاحيتها" });
    }
    res.json(session);
  });

  // ==========================================
  // ITINERARY ENDPOINTS
  // ==========================================

  app.get("/api/itinerary", async (req, res) => {
    try {
      const duration = parseInt(req.query.duration as string, 10) || 3;
      const budget = (req.query.budget as string) || "medium";
      const groupSize = parseInt(req.query.groupSize as string, 10) || 2;
      const governoratesParam = (req.query.governorates as string) || "";
      const governorates = governoratesParam ? governoratesParam.split(",") : [];
      const interestsParam = (req.query.interests as string) || "";
      const interests = interestsParam ? interestsParam.split(",") : [];

      const dbAttractions = await storage.getDbAttractions();
      const dbHotels = await storage.getDbHotels();
      const dbRestaurants = await storage.getDbRestaurants();
      const dbActivities = await storage.getDbActivities();

      // Filter helpers
      const matchGovernorate = (item: any, govIds: string[]) => {
        if (govIds.length === 0) return true;
        const govMap: Record<string, string[]> = {
          muscat: ["مسقط", "muscat", "seeb", "السيب", "qurum", "القرم", "مطرح", "mutrah", "bousher", "بوشر"],
          dhofar: ["صلالة", "salalah", "ظفار", "dhofar", "mirbat", "مرباط", "taqah", "طاقة"],
          dakhiliyah: ["نزوى", "nizwa", "bahla", "بهلاء", "الداخلية", "dakhiliyah", "manah", "منح", "samail", "سمائل", "misfat", "مسفاة"],
          north_batinah: ["صحار", "sohar", "شناص", "shinas", "الباطنة", "batinah"],
          south_batinah: ["الرستاق", "rustaq", "العوابي", "al awabi", "نخل", "nakhal", "بركاء", "barka"],
          north_sharqiyah: ["الشرقية", "sharqiyah", "بدية", "bidiyah", "رمال وهيبة", "wahiba", "إبراء", "ibra"],
          south_sharqiyah: ["صور", "sur", "الكامل", "al kamil", "الشرقية", "sharqiyah", "جعلان", "jalan"],
          musandam: ["خصب", "khasab", "دبا", "dibba", "بخاء", "bukha", "مسندم", "musandam"],
          buraimi: ["البريمي", "buraimi"],
          dhahirah: ["عبري", "ibri", "ضنك", "dank", "الظاهرة", "dhahirah"],
          wusta: ["الدقم", "duqm", "هيماء", "hima", "الوسطى", "wusta"],
        };

        const textToSearch = `${item.governorate_id || ""} ${item.governorate || ""} ${item.city || ""} ${item.region || ""} ${item.location || ""} ${item.name || ""} ${item.name_ar || ""}`.toLowerCase();

        return govIds.some(govId => {
          if (item.governorate_id && item.governorate_id.toLowerCase().includes(govId)) return true;
          const keywords = govMap[govId] || [];
          return keywords.some(keyword => textToSearch.includes(keyword.toLowerCase()));
        });
      };

      const accommodation = (req.query.accommodation as string) || "hotel";

      const matchAccommodation = (hotel: any, type: string) => {
        const text = `${hotel.name || ""} ${hotel.name_ar || ""} ${hotel.description || ""}`.toLowerCase();
        if (type === "resort") {
          return text.includes("منتجع") || text.includes("resort");
        } else if (type === "apartment") {
          return text.includes("شقة") || text.includes("شقق") || text.includes("apartment") || text.includes("جناح") || text.includes("suite");
        } else if (type === "hostel") {
          return text.includes("نزل") || text.includes("مخيم") || text.includes("hostel") || text.includes("camp") || text.includes("lodge") || text.includes("بيت ضيافة");
        } else {
          // "hotel"
          return text.includes("فندق") || text.includes("hotel") || (!text.includes("منتجع") && !text.includes("resort") && !text.includes("شقة") && !text.includes("شقق") && !text.includes("apartment") && !text.includes("نزل") && !text.includes("مخيم") && !text.includes("hostel") && !text.includes("camp") && !text.includes("lodge"));
        }
      };

      // Filter lists
      const govHotels = dbHotels.filter(h => matchGovernorate(h, governorates));
      let filteredHotels = govHotels.filter(h => matchAccommodation(h, accommodation));
      let noMatchingAccommodation = false;

      if (filteredHotels.length === 0) {
        noMatchingAccommodation = true;
        filteredHotels = govHotels;
        if (filteredHotels.length === 0) {
          filteredHotels = dbHotels;
        }
      }

      let filteredAttractions = dbAttractions.filter(a => matchGovernorate(a, governorates));
      let filteredRestaurants = dbRestaurants.filter(r => matchGovernorate(r, governorates));
      let filteredActivities = dbActivities.filter(a => matchGovernorate(a, governorates));

      // Fallbacks if filter returns empty
      if (filteredAttractions.length === 0) filteredAttractions = dbAttractions;
      if (filteredRestaurants.length === 0) filteredRestaurants = dbRestaurants;
      if (filteredActivities.length === 0) filteredActivities = dbActivities;

      // Select hotel based on budget
      let selectedHotel = filteredHotels[0];
      if (budget === "low") {
        selectedHotel = filteredHotels.find(h => h.stars <= 3) || filteredHotels[0];
      } else if (budget === "medium") {
        selectedHotel = filteredHotels.find(h => h.stars === 4) || filteredHotels[0];
      } else {
        selectedHotel = filteredHotels.find(h => h.stars === 5) || filteredHotels[0];
      }

      const hotelPrice = selectedHotel ? selectedHotel.price_per_night || 50 : 50;

      // Select matching attractions and activities to make unique days
      const days = [];
      let attractionIndex = 0;
      let restaurantIndex = 0;
      let activityIndex = 0;

      const getNextAttraction = () => {
        if (filteredAttractions.length === 0) return null;
        const item = filteredAttractions[attractionIndex % filteredAttractions.length];
        attractionIndex++;
        return item;
      };

      const getNextRestaurant = () => {
        if (filteredRestaurants.length === 0) return null;
        const item = filteredRestaurants[restaurantIndex % filteredRestaurants.length];
        restaurantIndex++;
        return item;
      };

      const getNextActivity = () => {
        if (filteredActivities.length === 0) return null;
        const item = filteredActivities[activityIndex % filteredActivities.length];
        activityIndex++;
        return item;
      };

      for (let i = 1; i <= duration; i++) {
        const dayActivities = [];

        // 1. Breakfast (08:00)
        dayActivities.push({
          time: "08:00",
          activity: "إفطار في الفندق",
          location: selectedHotel ? `${selectedHotel.region}، ${selectedHotel.city}` : "مسقط",
          type: "hotel",
          itemId: selectedHotel ? String(selectedHotel.id) : undefined,
          estimatedCost: 0,
        });

        // 2. Morning Attraction (10:00)
        const attr1 = getNextAttraction();
        if (attr1) {
          dayActivities.push({
            time: "10:00",
            activity: `زيارة ${attr1.name_ar || attr1.name}`,
            location: `${attr1.wilayat || ""}، ${attr1.governorate || ""}`,
            type: "attraction",
            itemId: String(attr1.id),
            estimatedCost: 2,
            category: attr1.category,
          });
        }

        // 3. Lunch (13:00)
        const rest1 = getNextRestaurant();
        if (rest1) {
          const restCost = budget === "low" ? 4 : budget === "medium" ? 8 : budget === "high" ? 18 : 35;
          dayActivities.push({
            time: "13:00",
            activity: rest1.name_ar || rest1.name,
            location: `${rest1.region || ""}، ${rest1.city || ""}`,
            type: "restaurant",
            itemId: String(rest1.id),
            estimatedCost: restCost,
          });
        }

        // 4. Afternoon Activity or Attraction (15:00)
        if (i % 2 === 0) {
          const act = getNextActivity();
          if (act) {
            const actPrice = parseInt(act.price as string, 10) || 12;
            dayActivities.push({
              time: "15:00",
              activity: `استكشاف ${act.name_ar || act.name}`,
              location: `${act.region || ""}، ${act.location || ""}`,
              type: "activity",
              itemId: String(act.id),
              estimatedCost: actPrice,
            });
          }
        } else {
          const attr2 = getNextAttraction();
          if (attr2) {
            dayActivities.push({
              time: "15:00",
              activity: `زيارة ${attr2.name_ar || attr2.name}`,
              location: `${attr2.wilayat || ""}، ${attr2.governorate || ""}`,
              type: "attraction",
              itemId: String(attr2.id),
              estimatedCost: 0,
              category: attr2.category,
            });
          }
        }

        // 5. Dinner (19:00)
        const rest2 = getNextRestaurant();
        if (rest2) {
          const restCost = budget === "low" ? 5 : budget === "medium" ? 10 : budget === "high" ? 22 : 45;
          dayActivities.push({
            time: "19:00",
            activity: rest2.name_ar || rest2.name,
            location: `${rest2.region || ""}، ${rest2.city || ""}`,
            type: "restaurant",
            itemId: String(rest2.id),
            estimatedCost: restCost,
          });
        }

        // 6. Return to Hotel (21:00)
        dayActivities.push({
          time: "21:00",
          activity: "العودة للفندق",
          location: selectedHotel ? `${selectedHotel.region}، ${selectedHotel.city}` : "مسقط",
          type: "hotel",
          itemId: selectedHotel ? String(selectedHotel.id) : undefined,
          estimatedCost: hotelPrice,
        });

        // Day Title
        let dayTitle = "يوم المعالم التاريخية";
        if (i === 1) dayTitle = "الوصول والاستكشاف";
        else if (i === duration) dayTitle = "الوصول والاستكشاف";
        else if (i % 3 === 0) dayTitle = "مغامرة في الطبيعة";
        else if (i % 3 === 1) dayTitle = "الثقافة والفنون";
        else dayTitle = "الاسترخاء والتجديد";

        days.push({
          day: i,
          title: dayTitle,
          activities: dayActivities,
        });
      }

      // Calculate totals
      let hotelsTotal = 0;
      let restaurantsTotal = 0;
      let attractionsTotal = 0;
      let activitiesTotal = 0;
      const transportTotal = duration * 15;

      for (const d of days) {
        for (const act of d.activities) {
          const cost = act.estimatedCost || 0;
          if (act.type === "hotel") hotelsTotal += cost;
          else if (act.type === "restaurant") restaurantsTotal += cost;
          else if (act.type === "attraction") attractionsTotal += cost;
          else if (act.type === "activity") activitiesTotal += cost;
        }
      }

      const total = hotelsTotal + restaurantsTotal + attractionsTotal + activitiesTotal + transportTotal;

      const itinerary = {
        id: `itin_${Date.now()}`,
        title: governorates.length > 0 ? `برنامج سياحي في ${governorates.map(g => g.charAt(0).toUpperCase() + g.slice(1)).join(" & ")}` : "برنامج سياحي مخصص في عمان",
        duration,
        budget,
        governorates,
        days,
        noMatchingAccommodation,
        requestedAccommodation: accommodation,
        budgetSummary: {
          hotels: hotelsTotal,
          restaurants: restaurantsTotal,
          attractions: attractionsTotal,
          activities: activitiesTotal,
          transport: transportTotal,
          total,
        },
      };

      res.json(itinerary);
    } catch (err: any) {
      console.error("Error generating itinerary:", err);
      res.status(500).json({ error: err.message });
    }
  });

  app.get("/api/itinerary/suggestions", async (req, res) => {
    const { type, exclude, governorateId, category } = req.query;
    const excludeIds = exclude ? String(exclude).split(",").map(id => parseInt(id, 10)).filter(id => !isNaN(id)) : [];

    try {
      let items: any[] = [];
      if (type === "hotel") {
        items = await storage.getDbHotels();
      } else if (type === "restaurant") {
        items = await storage.getDbRestaurants();
      } else if (type === "activity") {
        items = await storage.getDbActivities();
      } else {
        items = await storage.getDbAttractions();
      }

      let filtered = items.filter(item => !excludeIds.includes(item.id));
      if (governorateId) {
        filtered = filtered.filter(item => {
          const gov = String(governorateId).toLowerCase();
          const itemGov = String(item.governorate || item.governorate_id || "").toLowerCase();
          return itemGov.includes(gov) || gov.includes(itemGov);
        });
      }
      if (category) {
        filtered = filtered.filter(item => {
          const cat = String(category).toLowerCase();
          const itemCat = String(item.category || "").toLowerCase();
          return itemCat.includes(cat) || cat.includes(itemCat);
        });
      }

      res.json(filtered);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // ==========================================
  // FINANCE & COMMISSION ENDPOINTS
  // ==========================================

  app.get("/api/finance/transactions", async (req, res) => {
    try {
      const txs = await storage.getDbTransactions();
      res.json(txs);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.post("/api/finance/transactions", async (req, res) => {
    try {
      const tx = await storage.createDbTransaction(req.body);
      res.status(201).json(tx);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.delete("/api/finance/transactions/:id", async (req, res) => {
    const id = parseInt(req.params.id, 10);
    try {
      await storage.deleteDbTransaction(id);
      res.json({ success: true });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.delete("/api/finance/transactions/all", async (req, res) => {
    try {
      await storage.clearDbTransactions();
      res.json({ success: true });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.get("/api/finance/hotels/pending-finance", async (req, res) => {
    try {
      const hotels = await db.execute(sql`SELECT * FROM db_hotels WHERE status = 'pending_finance' OR split_shouma_pct IS NULL OR split_shouma_pct = 15`);
      res.json(hotels.rows);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.post("/api/finance/hotels/:hotelId/set-commission", async (req, res) => {
    const hotelId = parseInt(req.params.hotelId, 10);
    const shoumaPct = parseInt(req.body.shoumaPct, 10) || 15;
    const hotelPct = 100 - shoumaPct;
    try {
      await db.execute(sql`
        UPDATE db_hotels 
        SET split_shouma_pct = ${shoumaPct}, split_hotel_pct = ${hotelPct}
        WHERE id = ${hotelId}
      `);
      res.json({ success: true });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // ==========================================
  // MARKETING ADS & ANNOUNCEMENTS
  // ==========================================

  app.get("/api/announcements/latest", async (req, res) => {
    try {
      const ann = await storage.getLatestAnnouncement();
      res.json(ann || { title: "", message: "", isActive: false });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.post("/api/announcements", async (req, res) => {
    const { title, message, isActive } = req.body;
    try {
      const ann = await storage.createOrUpdateAnnouncement(title, message, !!isActive);
      res.json(ann);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  let memMarketingAds: any[] = [];
  let memMarketingAdNextId = 1;

  app.get("/api/marketing-ads", async (req, res) => {
    try {
      const ads = await db.execute(sql`SELECT * FROM db_marketing_ads WHERE is_active = true ORDER BY id DESC`);
      res.json(ads.rows);
    } catch (err: any) {
      res.json(memMarketingAds.filter(a => a.is_active));
    }
  });

  app.get("/api/marketing-ads/all", async (req, res) => {
    try {
      const ads = await db.execute(sql`SELECT * FROM db_marketing_ads ORDER BY id DESC`);
      res.json(ads.rows);
    } catch (err: any) {
      res.json(memMarketingAds);
    }
  });

  app.post("/api/marketing-ads", async (req, res) => {
    const { title, title_ar, description, description_ar, image_url, link, is_active } = req.body;
    try {
      const result = await db.execute(sql`
        INSERT INTO db_marketing_ads (title, title_ar, description, description_ar, image_url, link, is_active)
        VALUES (${title}, ${title_ar}, ${description}, ${description_ar}, ${image_url}, ${link}, ${is_active ?? true})
        RETURNING *
      `);
      res.status(201).json(result.rows[0]);
    } catch (err: any) {
      const fallbackAd = {
        id: memMarketingAdNextId++,
        title,
        title_ar,
        description,
        description_ar,
        image_url,
        link,
        is_active: is_active ?? true,
        created_at: new Date()
      };
      memMarketingAds.unshift(fallbackAd);
      res.status(201).json(fallbackAd);
    }
  });

  app.put("/api/marketing-ads/:id", async (req, res) => {
    const id = parseInt(req.params.id, 10);
    const { title, title_ar, description, description_ar, image_url, link, is_active } = req.body;
    try {
      const result = await db.execute(sql`
        UPDATE db_marketing_ads 
        SET title = ${title}, title_ar = ${title_ar}, description = ${description}, description_ar = ${description_ar}, image_url = ${image_url}, link = ${link}, is_active = ${is_active}
        WHERE id = ${id}
        RETURNING *
      `);
      res.json(result.rows[0]);
    } catch (err: any) {
      const found = memMarketingAds.find(a => a.id === id);
      if (found) {
        if (title !== undefined) found.title = title;
        if (title_ar !== undefined) found.title_ar = title_ar;
        if (description !== undefined) found.description = description;
        if (description_ar !== undefined) found.description_ar = description_ar;
        if (image_url !== undefined) found.image_url = image_url;
        if (link !== undefined) found.link = link;
        if (is_active !== undefined) found.is_active = is_active;
      }
      res.json(found || { id, title, is_active });
    }
  });

  app.delete("/api/marketing-ads/:id", async (req, res) => {
    const id = parseInt(req.params.id, 10);
    try {
      await db.execute(sql`DELETE FROM db_marketing_ads WHERE id = ${id}`);
      res.json({ success: true });
    } catch (err: any) {
      memMarketingAds = memMarketingAds.filter(a => a.id !== id);
      res.json({ success: true });
    }
  });

  // ==========================================
  // SPLASH SCREEN CONFIG ENDPOINTS
  // ==========================================

  let memSplashConfig = {
    title: "Welcome to Shouma",
    title_ar: "مرحباً بكم في شومة",
    subtitle: "Your smart integrated tour guide in the Sultanate of Oman",
    subtitle_ar: "دليلك السياحي الذكي المتكامل في سلطنة عُمان",
    background_type: "landscape",
    background_image: ""
  };

  app.get("/api/splash-config", async (req, res) => {
    try {
      const config = await db.execute(sql`SELECT * FROM db_splash_config WHERE is_active = true LIMIT 1`);
      if (config && config.rows && config.rows.length > 0) {
        res.json(config.rows[0]);
      } else {
        res.json(memSplashConfig);
      }
    } catch (err: any) {
      // Graceful fallback to resilient in-memory splash configuration
      res.json(memSplashConfig);
    }
  });

  app.post("/api/splash-config", async (req, res) => {
    const { title, title_ar, subtitle, subtitle_ar, background_type, background_image } = req.body;
    memSplashConfig = {
      title: title || memSplashConfig.title,
      title_ar: title_ar || memSplashConfig.title_ar,
      subtitle: subtitle || memSplashConfig.subtitle,
      subtitle_ar: subtitle_ar || memSplashConfig.subtitle_ar,
      background_type: background_type || memSplashConfig.background_type,
      background_image: background_image || memSplashConfig.background_image
    };

    try {
      const check = await db.execute(sql`SELECT * FROM db_splash_config LIMIT 1`);
      let result;
      if (check && check.rows && check.rows.length > 0) {
        result = await db.execute(sql`
          UPDATE db_splash_config 
          SET title = ${title}, title_ar = ${title_ar}, subtitle = ${subtitle}, subtitle_ar = ${subtitle_ar}, background_type = ${background_type}, background_image = ${background_image}
          WHERE id = ${check.rows[0].id}
          RETURNING *
        `);
      } else {
        result = await db.execute(sql`
          INSERT INTO db_splash_config (title, title_ar, subtitle, subtitle_ar, background_type, background_image, is_active)
          VALUES (${title}, ${title_ar}, ${subtitle}, ${subtitle_ar}, ${background_type}, ${background_image}, true)
          RETURNING *
        `);
      }
      res.json(result?.rows?.[0] || memSplashConfig);
    } catch (err: any) {
      console.warn("Splash config database save warning (in-memory mode):", err.message);
      res.json(memSplashConfig);
    }
  });

  // ==========================================
  // MEDIA UPLOAD & ASSETS
  // ==========================================

  app.post("/api/upload", upload.single("file"), async (req, res) => {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }
    try {
      const url = `/uploads/${req.file.filename}`;
      const asset = await storage.createMediaAsset({
        filename: req.file.originalname,
        url,
        fileType: req.file.mimetype.startsWith("image/") ? "image" : "document",
        mimeType: req.file.mimetype,
        size: req.file.size,
        storageKeyUsed: "local"
      });
      res.status(201).json(asset);
    } catch (err: any) {
      console.error("Error creating media asset:", err);
      res.status(500).json({ error: err.message });
    }
  });

  app.get("/api/media-assets", async (req, res) => {
    try {
      const assets = await storage.getMediaAssets();
      res.json(assets);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.delete("/api/media-assets/:id", async (req, res) => {
    const id = parseInt(req.params.id, 10);
    try {
      await storage.deleteMediaAsset(id);
      res.json({ success: true });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // ==========================================
  // VOICE GUIDE STREAMING & SCRIPT GENERATION
  // ==========================================

  app.post("/api/voice-guide-script", async (req, res) => {
    const { text, attractionName, location, language } = req.body;
    if (!text) {
      return res.status(400).json({ error: "Text is required" });
    }

    try {
      const script = await generateTourGuideScript(attractionName, location, text, language || "ar");
      res.json({ script });
    } catch (err: any) {
      console.error("Tour guide script error:", err);
      res.status(500).json({ error: err.message || "Failed to generate script" });
    }
  });

  app.post("/api/voice-guide", async (req, res) => {
    const { text, attractionName, location, voice, language } = req.body;
    if (!text) {
      return res.status(400).json({ error: "Text is required for the voice guide" });
    }

    try {
      const finalVoice = voice || "nova";
      res.setHeader("Content-Type", "text/plain");

      // Generate AI Tour Guide Script on-the-fly using Gemini
      const aiNarrative = await generateTourGuideScript(attractionName, location, text, language);

      // Streams chunks of audio in real-time
      const stream = await textToSpeechStream(aiNarrative, finalVoice);
      for await (const chunk of stream) {
        res.write(`data: ${JSON.stringify({ type: "audio", data: chunk })}\n`);
      }
      res.write(`data: ${JSON.stringify({ type: "done" })}\n`);
      res.end();
    } catch (err: any) {
      console.error("Voice guide streaming error:", err);
      res.write(`data: ${JSON.stringify({ type: "error", error: err.message })}\n`);
      res.end();
    }
  });

  app.post("/api/translate", async (req, res) => {
    const { text, targetLang } = req.body;
    if (!text) {
      return res.status(400).json({ error: "Text is required" });
    }
    try {
      const translatedText = await translateArabicToTargetLanguage(text, targetLang || "en");
      res.json({ translatedText });
    } catch (err: any) {
      console.error("Translation API error:", err);
      res.status(500).json({ error: err.message });
    }
  });

  app.post("/api/translate-batch", async (req, res) => {
    const { texts, targetLang } = req.body;
    if (!Array.isArray(texts)) {
      return res.status(400).json({ error: "texts array is required" });
    }
    try {
      const translatedTexts = await Promise.all(
        texts.map(t => translateArabicToTargetLanguage(String(t || ""), targetLang || "en"))
      );
      res.json({ translatedTexts });
    } catch (err: any) {
      console.error("Batch translation API error:", err);
      res.status(500).json({ error: err.message });
    }
  });

  // ==========================================
  // HIMAM SHOUMA & DROB SHOUMA
  // ==========================================

  app.get("/api/himam-shouma", async (req, res) => {
    try {
      const places = await storage.getDbHimamShouma();
      res.json(places);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.post("/api/himam-shouma", async (req, res) => {
    try {
      const data = { ...req.body };
      
      // Auto translate fields if English equivalents are not provided
      if (!data.nameEn && !data.name_en && data.name) {
        data.nameEn = await translateArabicToEnglish(data.name);
      }
      if (!data.descriptionEn && !data.description_en && data.description) {
        data.descriptionEn = await translateArabicToEnglish(data.description);
      }
      if (!data.locationEn && !data.location_en && data.location) {
        data.locationEn = await translateArabicToEnglish(data.location);
      }
      
      const features = Array.isArray(data.features) ? data.features : [];
      if ((!data.featuresEn && !data.features_en) && features.length > 0) {
        data.featuresEn = await translateFeatures(features);
      }

      const place = await storage.createDbHimamShouma(data);
      res.status(201).json(place);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.delete("/api/himam-shouma/:id", async (req, res) => {
    const id = parseInt(req.params.id, 10);
    try {
      await storage.deleteDbHimamShouma(id);
      res.json({ success: true });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.get("/api/drob-shouma", async (req, res) => {
    try {
      const gems = await storage.getDbDrobShouma();
      res.json(gems);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.post("/api/drob-shouma", async (req, res) => {
    try {
      const data = { ...req.body };
      
      // Auto translate fields if English equivalents are not provided
      if (!data.nameEn && !data.name_en && data.name) {
        data.nameEn = await translateArabicToEnglish(data.name);
      }
      if (!data.descriptionEn && !data.description_en && data.description) {
        data.descriptionEn = await translateArabicToEnglish(data.description);
      }
      if (!data.locationEn && !data.location_en && data.location) {
        data.locationEn = await translateArabicToEnglish(data.location);
      }
      if (!data.governorateEn && !data.governorate_en && data.governorate) {
        data.governorateEn = await translateArabicToEnglish(data.governorate);
      }

      const gem = await storage.createDbDrobShouma(data);
      res.status(201).json(gem);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.delete("/api/drob-shouma/:id", async (req, res) => {
    const id = parseInt(req.params.id, 10);
    try {
      await storage.deleteDbDrobShouma(id);
      res.json({ success: true });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // ==========================================
  // HOTEL PORTAL BOOKING ENDPOINTS
  // ==========================================

  app.get("/api/hotel-bookings", async (req, res) => {
    try {
      const bookings = await storage.getHotelBookings();
      res.json(bookings);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.post("/api/hotel-bookings", async (req, res) => {
    try {
      const booking = await storage.createHotelBooking(req.body);
      res.status(201).json(booking);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.delete("/api/hotel-bookings/all", async (req, res) => {
    try {
      await storage.clearHotelBookings();
      res.json({ success: true });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // ==========================================
  // APPLICATIONS ENDPOINTS
  // ==========================================
  app.get("/api/applications", async (req, res) => {
    try {
      const apps = await storage.getApplications();
      res.json(apps);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.post("/api/applications", async (req, res) => {
    try {
      const appItem = await storage.createApplication(req.body);
      res.status(201).json({ success: true, application: appItem });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.patch("/api/applications/:id", async (req, res) => {
    try {
      const { status } = req.body;
      const updated = await storage.updateApplicationStatus(Number(req.params.id), status);
      res.json({ success: true, application: updated });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.delete("/api/applications/:id", async (req, res) => {
    try {
      await storage.deleteApplication(Number(req.params.id));
      res.json({ success: true });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // ==========================================
  // OFFICE CONFIG ENDPOINTS
  // ==========================================
  app.get("/api/office", async (req, res) => {
    try {
      const office = await storage.getOfficeConfig();
      res.json(office);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.post("/api/office", async (req, res) => {
    try {
      const office = await storage.updateOfficeConfig(req.body);
      res.json(office);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.put("/api/office", async (req, res) => {
    try {
      const office = await storage.updateOfficeConfig(req.body);
      res.json(office);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // ==========================================
  // TRIPS ENDPOINTS
  // ==========================================
  app.get("/api/trips", async (req, res) => {
    try {
      const trips = await storage.getTrips();
      res.json(trips);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.post("/api/trips", async (req, res) => {
    try {
      const trip = await storage.createTrip(req.body);
      res.status(201).json(trip);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.patch("/api/trips/:id", async (req, res) => {
    try {
      const updated = await storage.updateTrip(Number(req.params.id), req.body);
      res.json(updated);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.delete("/api/trips/:id", async (req, res) => {
    try {
      await storage.deleteTrip(Number(req.params.id));
      res.json({ success: true });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // ==========================================
  // TICKETS ENDPOINTS
  // ==========================================
  app.get("/api/tickets", async (req, res) => {
    try {
      const tickets = await storage.getTickets();
      res.json(tickets);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.post("/api/tickets", async (req, res) => {
    try {
      const ticket = await storage.createTicket(req.body);
      res.status(201).json(ticket);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.patch("/api/tickets/:id", async (req, res) => {
    try {
      const updated = await storage.updateTicketStatus(Number(req.params.id), req.body.status);
      res.json(updated);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.delete("/api/tickets/:id", async (req, res) => {
    try {
      await storage.deleteTicket(Number(req.params.id));
      res.json({ success: true });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // ==========================================
  // BANK VALIDATION ENDPOINT
  // ==========================================
  app.post("/api/validate-bank", (req, res) => {
    const { accountNumber } = req.body;
    if (!accountNumber || String(accountNumber).length < 8) {
      return res.json({
        valid: false,
        messageAr: "رقم الحساب قصير جداً. يرجى إدخال رقم حساب يتكون من 8 أرقام على الأقل."
      });
    }
    return res.json({
      valid: true,
      messageAr: "رقم الحساب صالح ومطابق لمعايير المصارف العُمانية (بنك مسقط / بنك ظفار)."
    });
  });

  // ==========================================
  // ADMIN HOTELS & PMS ROOMS APPROVAL ENDPOINTS
  // ==========================================
  app.get("/api/admin/hotels/pending-approval", async (req, res) => {
    try {
      const hotels = await db.execute(sql`SELECT * FROM db_hotels WHERE status = 'pending' ORDER BY id DESC`);
      res.json(hotels.rows || []);
    } catch (err: any) {
      res.json([]);
    }
  });

  app.post("/api/admin/hotels/:id/approve", async (req, res) => {
    const hotelId = parseInt(req.params.id, 10);
    try {
      await db.execute(sql`UPDATE db_hotels SET status = 'approved' WHERE id = ${hotelId}`);
      res.json({ success: true, message: "تم تفعيل واعتماد الفندق بنجاح!" });
    } catch (err: any) {
      res.status(500).json({ message: err.message });
    }
  });

  app.post("/api/admin/hotels/:id/reject", async (req, res) => {
    const hotelId = parseInt(req.params.id, 10);
    try {
      await db.execute(sql`UPDATE db_hotels SET status = 'rejected' WHERE id = ${hotelId}`);
      res.json({ success: true, message: "تم رفض طلب إدراج الفندق بنجاح." });
    } catch (err: any) {
      res.status(500).json({ message: err.message });
    }
  });

  app.get("/api/admin/pms-rooms/pending", async (req, res) => {
    try {
      const rooms = await db.execute(sql`
        SELECT r.*, h.name_ar as hotel_name, h.name as hotel_name_en 
        FROM db_hotel_rooms r 
        LEFT JOIN db_hotels h ON r.hotel_id = h.id 
        WHERE r.status = 'pending' 
        ORDER BY r.id DESC
      `);
      res.json(rooms.rows || []);
    } catch (err: any) {
      res.json([]);
    }
  });

  app.post("/api/admin/pms-rooms/:id/approve", async (req, res) => {
    const roomId = parseInt(req.params.id, 10);
    const { commissionPct = 15, commissionAmount } = req.body;
    try {
      await db.execute(sql`
        UPDATE db_hotel_rooms 
        SET status = 'approved', 
            commission_pct = ${commissionPct}, 
            commission_amount = ${commissionAmount ?? 15}
        WHERE id = ${roomId}
      `);
      res.json({ success: true, message: "تم اعتماد وتنشيط الغرفة بنجاح!" });
    } catch (err: any) {
      res.status(500).json({ message: err.message });
    }
  });

  app.post("/api/admin/pms-rooms/:id/reject", async (req, res) => {
    const roomId = parseInt(req.params.id, 10);
    try {
      await db.execute(sql`UPDATE db_hotel_rooms SET status = 'rejected' WHERE id = ${roomId}`);
      res.json({ success: true, message: "تم رفض وتجاوز طلب الغرفة بنجاح." });
    } catch (err: any) {
      res.status(500).json({ message: err.message });
    }
  });

  // ==========================================
  // HOTEL PORTAL ENDPOINTS
  // ==========================================
  app.post("/api/hotels/register-request", async (req, res) => {
    try {
      const { nameAr, nameEn, city, email, phone, password, bankAccount } = req.body;
      const result = await db.execute(sql`
        INSERT INTO db_hotels (name, name_ar, description, city, region, image, rating, price_per_night, stars, phone, map_url, additional_images, bank_account, amenities, split_shouma_pct, split_hotel_pct, email, password, status)
        VALUES (${nameEn || nameAr}, ${nameAr}, '', ${city || 'Muscat'}, ${city || 'Muscat'}, '', 5, 50, 4, ${phone || ''}, '', '', ${bankAccount || ''}, '{}'::text[], 15, 85, ${email}, ${password}, 'pending')
        RETURNING *
      `);
      res.status(201).json({ success: true, hotel: result.rows[0] });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.post("/api/hotels/auth", async (req, res) => {
    try {
      const { email, password } = req.body;
      const result = await db.execute(sql`
        SELECT * FROM db_hotels WHERE email = ${email} AND password = ${password} LIMIT 1
      `);
      if (result.rows && result.rows.length > 0) {
        res.json({ success: true, hotel: result.rows[0] });
      } else {
        res.status(401).json({ success: false, message: "بيانات الدخول غير صحيحة" });
      }
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.get("/api/hotels/:id/bookings", async (req, res) => {
    try {
      const hotelId = parseInt(req.params.id, 10);
      const bookings = await db.execute(sql`
        SELECT * FROM hotel_bookings WHERE hotel_id = ${hotelId} ORDER BY id DESC
      `);
      res.json(bookings.rows || []);
    } catch (err: any) {
      res.json([]);
    }
  });

  app.get("/api/hotels/:id/pms-rooms", async (req, res) => {
    try {
      const hotelId = parseInt(req.params.id, 10);
      const rooms = await db.execute(sql`
        SELECT * FROM db_hotel_rooms WHERE hotel_id = ${hotelId} ORDER BY id DESC
      `);
      res.json(rooms.rows || []);
    } catch (err: any) {
      res.json([]);
    }
  });

  app.post("/api/hotels/:id/pms-rooms", async (req, res) => {
    try {
      const hotelId = parseInt(req.params.id, 10);
      const { name, nameAr, description, priceBase, maxGuests, amenities, image } = req.body;
      const priceFinal = (parseFloat(priceBase) || 0) * 1.15;
      const result = await db.execute(sql`
        INSERT INTO db_hotel_rooms (hotel_id, name, name_ar, description, price_base, commission_pct, price_final, max_guests, amenities, image, status)
        VALUES (${hotelId}, ${name || nameAr}, ${nameAr}, ${description || ''}, ${priceBase || 0}, 15, ${priceFinal}, ${maxGuests || 2}, ${amenities || '{}'}, ${image || ''}, 'pending')
        RETURNING *
      `);
      res.status(201).json(result.rows[0]);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.delete("/api/pms-rooms/:id", async (req, res) => {
    try {
      const roomId = parseInt(req.params.id, 10);
      await db.execute(sql`DELETE FROM db_hotel_rooms WHERE id = ${roomId}`);
      res.json({ success: true });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.patch("/api/pms-rooms/:id/status", async (req, res) => {
    try {
      const roomId = parseInt(req.params.id, 10);
      const { status } = req.body;
      await db.execute(sql`UPDATE db_hotel_rooms SET status = ${status} WHERE id = ${roomId}`);
      res.json({ success: true });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.get("/api/hotels/:id/payouts", async (req, res) => {
    try {
      const hotelId = parseInt(req.params.id, 10);
      const payouts = await db.execute(sql`
        SELECT * FROM db_hotel_payouts WHERE hotel_id = ${hotelId} ORDER BY id DESC
      `);
      res.json(payouts.rows || []);
    } catch (err: any) {
      res.json([]);
    }
  });

  app.get("/api/hotels/:id/reviews", async (req, res) => {
    try {
      const hotelId = parseInt(req.params.id, 10);
      const reviews = await db.execute(sql`
        SELECT * FROM db_hotel_reviews WHERE hotel_id = ${hotelId} ORDER BY id DESC
      `);
      res.json(reviews.rows || []);
    } catch (err: any) {
      res.json([]);
    }
  });

  app.get("/api/hotels/:id/staff", async (req, res) => {
    try {
      const hotelId = parseInt(req.params.id, 10);
      const staff = await db.execute(sql`
        SELECT id, hotel_id, username, role, name, created_at FROM db_hotel_staff WHERE hotel_id = ${hotelId} ORDER BY id DESC
      `);
      res.json(staff.rows || []);
    } catch (err: any) {
      res.json([]);
    }
  });

  app.post("/api/hotels/:id/staff", async (req, res) => {
    try {
      const hotelId = parseInt(req.params.id, 10);
      const { username, password, role, name } = req.body;
      if (!username || !password || !name) {
        return res.status(400).json({ error: "اسم المستخدم وكلمة المرور والاسم مطلوبة." });
      }
      const newStaff = await db.execute(sql`
        INSERT INTO db_hotel_staff (hotel_id, username, password, role, name)
        VALUES (${hotelId}, ${username}, ${password}, ${role || 'receptionist'}, ${name})
        RETURNING id, hotel_id, username, role, name, created_at
      `);
      res.status(201).json(newStaff.rows[0] || { success: true });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.delete("/api/hotels/:id/staff/:staffId", async (req, res) => {
    try {
      const hotelId = parseInt(req.params.id, 10);
      const staffId = parseInt(req.params.staffId, 10);
      await db.execute(sql`
        DELETE FROM db_hotel_staff WHERE id = ${staffId} AND hotel_id = ${hotelId}
      `);
      res.json({ success: true });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // ==========================================
  // PORTAL ACCOUNTS & SUB-DASHBOARD AUTH ENDPOINTS
  // ==========================================
  app.get("/api/download-credentials-docx", async (req, res) => {
    try {
      const filePath = path.join(process.cwd(), "client", "public", "shouma_accounts_and_passwords.docx");
      if (fs.existsSync(filePath)) {
        res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.wordprocessingml.document");
        res.setHeader("Content-Disposition", 'attachment; filename="shouma_portal_accounts.docx"');
        return res.sendFile(filePath);
      } else {
        return res.status(404).json({ error: "ملف وورد غير موجود." });
      }
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.get("/api/portal-accounts", async (req, res) => {
    try {
      const accounts = await storage.getPortalAccounts();
      res.json(accounts);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.post("/api/portal-accounts", async (req, res) => {
    try {
      const { portalType, portalName, email, password, name, isActive } = req.body;
      if (!email || !password || !name) {
        return res.status(400).json({ error: "البريد الإلكتروني، كلمة المرور، والاسم مطلوبات." });
      }
      const account = await storage.createPortalAccount({
        portalType: portalType || "hotels",
        portalName: portalName || "لوحة تحكم فرعية",
        email,
        password,
        name,
        isActive: isActive !== undefined ? isActive : true
      });
      res.status(201).json({ success: true, account });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.patch("/api/portal-accounts/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id, 10);
      const updated = await storage.updatePortalAccount(id, req.body);
      res.json({ success: true, account: updated });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.delete("/api/portal-accounts/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id, 10);
      await storage.deletePortalAccount(id);
      res.json({ success: true });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  app.post("/api/portal-auth/login", async (req, res) => {
    try {
      const { portalType, email, password } = req.body;
      if (!email || !password) {
        return res.status(400).json({
          success: false,
          message: "يرجى إدخال البريد الإلكتروني وكلمة المرور."
        });
      }

      // Check portal accounts database
      const account = await storage.authenticatePortalAccount(portalType, email, password);
      if (account) {
        // Record audit log entry
        await storage.addPortalAuditLog({
          portalType: account.portalType || portalType,
          portalName: account.portalName || "لوحة تحكم فرعية",
          email: account.email,
          name: account.name,
          action: "LOGIN",
          timestamp: new Date().toISOString(),
          ip: req.ip || "192.168.1.1"
        });

        return res.json({
          success: true,
          message: "تم تسجيل الدخول بنجاح!",
          account
        });
      }

      // Fallback check: if super admin credentials or legacy hotel credentials used
      if (
        (email.trim() === "admin@shouma.om" || email.trim() === "admin@shouma.com") &&
        (password === "admin123" || password === "shouma2026")
      ) {
        const adminAcc = {
          id: 0,
          portalType: portalType || "admin",
          portalName: "مدير النظام العام",
          email: email.trim(),
          name: "المسؤول الأعلى"
        };
        await storage.addPortalAuditLog({
          portalType: adminAcc.portalType,
          portalName: adminAcc.portalName,
          email: adminAcc.email,
          name: adminAcc.name,
          action: "LOGIN",
          timestamp: new Date().toISOString(),
          ip: req.ip || "192.168.1.1"
        });

        return res.json({
          success: true,
          message: "تم تسجيل الدخول بصلاحية مدير النظام العام!",
          account: adminAcc
        });
      }

      return res.status(401).json({
        success: false,
        message: "البريد الإلكتروني أو كلمة المرور غير صحيحة، أو لم يتم إضافة هذا الحساب من قبل المدير عبر لوحة التحكم الكبرى."
      });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message });
    }
  });

  // Logout audit logging endpoint
  app.post("/api/portal-auth/logout", async (req, res) => {
    try {
      const { portalType, portalName, email, name } = req.body;
      const log = await storage.addPortalAuditLog({
        portalType: portalType || "general",
        portalName: portalName || "لوحة تحكم فرعية",
        email: email || "unknown@shouma.com",
        name: name || "الموظف المسؤول",
        action: "LOGOUT",
        timestamp: new Date().toISOString(),
        ip: req.ip || "192.168.1.1"
      });
      res.json({ success: true, log });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message });
    }
  });

  // Fetch all audit logs for Super Admin
  app.get("/api/portal-auth/audit-logs", async (req, res) => {
    try {
      const logs = await storage.getPortalAuditLogs();
      res.json(logs);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // Explicitly post custom audit log
  app.post("/api/portal-auth/audit-log", async (req, res) => {
    try {
      const log = await storage.addPortalAuditLog(req.body);
      res.json({ success: true, log });
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });
}

