import type { Express } from "express";
import { createServer, type Server } from "http";
import fs from "fs";
import path from "path";
import { storage } from "./storage";
import { insertUserSchema, questionnaireSchema, insertRestaurantReviewSchema, insertGroupTripRequestSchema, insertTourRequestSchema, type Itinerary, type ItineraryDay, type ItineraryActivity, type BudgetSummary } from "@shared/schema";
import { z } from "zod";
import { textToSpeechStream } from "./replit_integrations/audio/client";
import OpenAI from "openai";

const getOpenAI = () => {
  return new OpenAI({
    apiKey: process.env.AI_INTEGRATIONS_OPENAI_API_KEY || "dummy-key-for-start",
    baseURL: process.env.AI_INTEGRATIONS_OPENAI_BASE_URL || undefined,
  });
};

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {

  app.post("/api/auth/register", async (req, res) => {
    try {
      const result = insertUserSchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ message: "بيانات غير صالحة" });
      }

      const existingUser = await storage.getUserByUsername(result.data.username);
      if (existingUser) {
        return res.status(409).json({ message: "اسم المستخدم موجود بالفعل" });
      }

      const user = await storage.createUser(result.data);
      return res.status(201).json({ id: user.id, username: user.username });
    } catch (error) {
      console.error("Registration error:", error);
      return res.status(500).json({ message: "حدث خطأ في الخادم" });
    }
  });

  app.post("/api/auth/login", async (req, res) => {
    try {
      const result = insertUserSchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ message: "بيانات غير صالحة" });
      }

      const user = await storage.getUserByUsername(result.data.username);
      if (!user) {
        return res.status(401).json({ message: "اسم المستخدم أو كلمة المرور غير صحيحة" });
      }

      if (user.password !== result.data.password) {
        return res.status(401).json({ message: "اسم المستخدم أو كلمة المرور غير صحيحة" });
      }

      return res.json({ id: user.id, username: user.username });
    } catch (error) {
      console.error("Login error:", error);
      return res.status(500).json({ message: "حدث خطأ في الخادم" });
    }
  });

  app.get("/api/restaurants/:id/reviews", async (req, res) => {
    try {
      const { id } = req.params;
      const reviews = await storage.getRestaurantReviews(id);
      return res.json(reviews);
    } catch (error) {
      console.error("Get reviews error:", error);
      return res.status(500).json({ message: "حدث خطأ في جلب التقييمات" });
    }
  });

  app.post("/api/restaurants/:id/reviews", async (req, res) => {
    try {
      const { id } = req.params;
      const result = insertRestaurantReviewSchema.safeParse({
        ...req.body,
        restaurantId: id
      });
      
      if (!result.success) {
        return res.status(400).json({ message: "بيانات غير صالحة", errors: result.error.errors });
      }

      const review = await storage.createRestaurantReview(result.data);
      return res.status(201).json(review);
    } catch (error) {
      console.error("Create review error:", error);
      return res.status(500).json({ message: "حدث خطأ في إضافة التقييم" });
    }
  });

  app.post("/api/voice-guide", async (req, res) => {
    try {
      const { text, attractionName, location, voice = "alloy", language = "ar" } = req.body;
      
      if (!text) {
        return res.status(400).json({ error: "Text is required" });
      }

      res.setHeader("Content-Type", "text/event-stream");
      res.setHeader("Cache-Control", "no-cache");
      res.setHeader("Connection", "keep-alive");

      const isArabic = language === "ar" || language === "fa";
      
      const systemPrompt = isArabic 
        ? `أنت مرشد سياحي خبير في سلطنة عُمان. مهمتك إنشاء نص صوتي غني ومثير للاهتمام عن المعالم السياحية العُمانية. 
            
قواعد مهمة:
- استخدم اللغة العربية الفصحى البسيطة
- أضف معلومات تاريخية وثقافية مثيرة
- اذكر نصائح للزوار
- اذكر أفضل أوقات الزيارة إن أمكن
- اجعل النص ممتعاً وحماسياً كأنك مرشد سياحي حقيقي
- لا تتجاوز 150 كلمة`
        : `You are an expert tour guide specializing in the Sultanate of Oman. Your task is to create rich, engaging audio narration about Omani tourist attractions.

Important rules:
- Use clear, simple English
- Add interesting historical and cultural information
- Provide tips for visitors
- Mention the best times to visit if applicable
- Make the text engaging and enthusiastic like a real tour guide
- Keep it under 150 words`;

      const userPrompt = isArabic
        ? `أنشئ نصاً صوتياً مرشداً سياحياً عن هذا المكان:
            
الاسم: ${attractionName || "معلم سياحي"}
الموقع: ${location || "عُمان"}
الوصف الأساسي: ${text}

أضف معلومات إضافية مثيرة للاهتمام وتفاصيل تاريخية وثقافية ونصائح للزوار.`
        : `Create an audio tour guide script about this place:
            
Name: ${attractionName || "Tourist Attraction"}
Location: ${location || "Oman"}
Basic description: ${text}

Add interesting additional information, historical and cultural details, and tips for visitors.`;

      const enrichedResponse = await getOpenAI().chat.completions.create({
        model: "gpt-5.2",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt }
        ],
        max_completion_tokens: 500,
      });

      const enrichedText = enrichedResponse.choices[0]?.message?.content || text;
      
      const stream = await textToSpeechStream(enrichedText, voice);
      
      for await (const audioChunk of stream) {
        res.write(`data: ${JSON.stringify({ type: "audio", data: audioChunk })}\n\n`);
      }

      res.write(`data: ${JSON.stringify({ type: "done" })}\n\n`);
      res.end();
    } catch (error) {
      console.error("Voice guide error:", error);
      if (res.headersSent) {
        res.write(`data: ${JSON.stringify({ type: "error", error: "Failed to generate audio" })}\n\n`);
        res.end();
      } else {
        res.status(500).json({ error: "Failed to generate voice guide" });
      }
    }
  });

  app.get("/api/itinerary", async (req, res) => {
    try {
      const duration = parseInt(req.query.duration as string) || 3;
      const budget = (req.query.budget as string) || "medium";
      const groupSize = parseInt(req.query.groupSize as string) || 2;
      const interests = ((req.query.interests as string) || "").split(",").filter(Boolean);
      const preferredActivities = ((req.query.preferredActivities as string) || "").split(",").filter(Boolean);
      const accommodation = (req.query.accommodation as string) || "hotel";
      const hotelPreference = (req.query.hotelPreference as string) || "single";
      const mealPreference = (req.query.mealPreference as string) || "mixed";
      const governorates = ((req.query.governorates as string) || "").split(",").filter(Boolean);

      const itinerary = generateItinerary({
        duration,
        budget,
        groupSize,
        interests,
        preferredActivities,
        accommodation,
        hotelPreference,
        mealPreference,
        governorates,
      });

      return res.json(itinerary);
    } catch (error) {
      console.error("Itinerary error:", error);
      return res.status(500).json({ message: "حدث خطأ في إنشاء الجدول" });
    }
  });

  app.get("/api/itinerary/suggestions", async (req, res) => {
    try {
      const type = (req.query.type as string) || "attraction";
      const category = req.query.category as string;
      const lat = parseFloat(req.query.lat as string);
      const lng = parseFloat(req.query.lng as string);
      const excludeIds = ((req.query.exclude as string) || "").split(",").filter(Boolean);
      const governorateId = req.query.governorateId as string;

      let items: GeoItem[] = [];
      if (type === "restaurant") {
        items = [...appRestaurants];
      } else if (type === "hotel") {
        items = [...appHotels];
      } else if (type === "activity") {
        items = [...appActivities];
      } else {
        items = [...appAttractions];
      }

      if (governorateId) {
        const filtered = items.filter(i => i.governorateId === governorateId);
        if (filtered.length > 0) items = filtered;
      }

      if (category && (type === "attraction" || type === "activity")) {
        const catFiltered = items.filter(i => i.category === category);
        if (catFiltered.length > 0) items = catFiltered;
      }

      items = items.filter(i => !excludeIds.includes(i.id));

      if (!isNaN(lat) && !isNaN(lng)) {
        const anchor: GeoItem = { id: "_anchor", name: "", location: "", lat, lng };
        items.sort((a, b) => {
          const distA = haversineDistance(anchor.lat, anchor.lng, a.lat, a.lng);
          const distB = haversineDistance(anchor.lat, anchor.lng, b.lat, b.lng);
          return distA - distB;
        });
      }

      const suggestions = items.slice(0, 8).map(item => ({
        id: item.id,
        name: item.name,
        location: item.location,
        category: item.category,
        governorateId: item.governorateId,
        lat: item.lat,
        lng: item.lng,
        estimatedCost: item.estimatedCost || 0,
        distance: !isNaN(lat) && !isNaN(lng) 
          ? Math.round(haversineDistance(lat, lng, item.lat, item.lng) * 10) / 10 
          : undefined,
      }));

      return res.json(suggestions);
    } catch (error) {
      console.error("Suggestions error:", error);
      return res.status(500).json({ message: "حدث خطأ في جلب الاقتراحات" });
    }
  });

  app.post("/api/group-trips", async (req, res) => {
    try {
      const result = insertGroupTripRequestSchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ message: "بيانات غير صالحة", errors: result.error.errors });
      }
      const tripRequest = await storage.createGroupTripRequest(result.data);
      return res.status(201).json(tripRequest);
    } catch (error) {
      console.error("Group trip request error:", error);
      return res.status(500).json({ message: "حدث خطأ في حفظ الطلب" });
    }
  });

  app.get("/api/group-trips", async (_req, res) => {
    try {
      const requests = await storage.getGroupTripRequests();
      return res.json(requests);
    } catch (error) {
      console.error("Get group trips error:", error);
      return res.status(500).json({ message: "حدث خطأ في جلب الطلبات" });
    }
  });

  // Tour Request Endpoints
  app.post("/api/tour-requests", async (req, res) => {
    try {
      const result = insertTourRequestSchema.safeParse(req.body);
      if (!result.success) {
        return res.status(400).json({ message: "بيانات غير صالحة", errors: result.error.errors });
      }
      const request = await storage.createTourRequest(result.data);
      return res.status(201).json(request);
    } catch (error) {
      console.error("Tour request create error:", error);
      return res.status(500).json({ message: "حدث خطأ في حفظ طلب الرحلة" });
    }
  });

  app.get("/api/tour-requests", async (req, res) => {
    try {
      const guideIdStr = req.query.guideId as string;
      const guideId = guideIdStr ? parseInt(guideIdStr, 10) : undefined;
      const requests = await storage.getTourRequests(guideId);
      return res.json(requests);
    } catch (error) {
      console.error("Get tour requests error:", error);
      return res.status(500).json({ message: "حدث خطأ في جلب طلبات الرحلات" });
    }
  });

  app.patch("/api/tour-requests/:id/status", async (req, res) => {
    try {
      const id = parseInt(req.params.id, 10);
      const { status } = req.body;
      if (!status || !["accepted", "rejected", "pending"].includes(status)) {
        return res.status(400).json({ message: "حالة غير صالحة" });
      }
      const updated = await storage.updateTourRequestStatus(id, status);
      return res.json(updated);
    } catch (error) {
      console.error("Update tour request status error:", error);
      return res.status(500).json({ message: "حدث خطأ في تحديث حالة الطلب" });
    }
  });

  // Tour Guide Availability Endpoints
  app.get("/api/tour-guides/availability", async (_req, res) => {
    try {
      const availabilities: Record<number, boolean> = {};
      for (let id = 1; id <= 6; id++) {
        availabilities[id] = await storage.getGuideAvailability(id);
      }
      return res.json(availabilities);
    } catch (error) {
      console.error("Get guide availabilities error:", error);
      return res.status(500).json({ message: "حدث خطأ في جلب توفر المرشدين" });
    }
  });

  app.get("/api/tour-guides/:id/availability", async (req, res) => {
    try {
      const guideId = parseInt(req.params.id, 10);
      const availability = await storage.getGuideAvailability(guideId);
      return res.json({ availability });
    } catch (error) {
      console.error("Get guide availability error:", error);
      return res.status(500).json({ message: "حدث خطأ في جلب توفر المرشد" });
    }
  });

  app.post("/api/tour-guides/:id/availability", async (req, res) => {
    try {
      const guideId = parseInt(req.params.id, 10);
      const { availability } = req.body;
      if (typeof availability !== "boolean") {
        return res.status(400).json({ message: "قيمة التوفر يجب أن تكون منطقية (true or false)" });
      }
      const updated = await storage.setGuideAvailability(guideId, availability);
      return res.json({ id: guideId, availability: updated });
    } catch (error) {
      console.error("Set guide availability error:", error);
      return res.status(500).json({ message: "حدث خطأ في تحديث توفر المرشد" });
    }
  });

  // --- ADMIN AND CATALOG API ENDPOINTS FOR THE WHOLE APP ---

  // Announcements Popups
  app.get("/api/announcements/latest", async (_req, res) => {
    try {
      const ann = await storage.getLatestAnnouncement();
      return res.json(ann || null);
    } catch (error) {
      console.error("Get latest announcement error:", error);
      return res.status(500).json({ message: "حدث خطأ في جلب الإعلان الأخير" });
    }
  });

  app.post("/api/announcements", async (req, res) => {
    try {
      const { title, message, isActive } = req.body;
      if (!title || !message) {
        return res.status(400).json({ message: "عنوان الإعلان والرسالة مطلوبان" });
      }
      const ann = await storage.createOrUpdateAnnouncement(title, message, isActive !== false);
      return res.json(ann);
    } catch (error) {
      console.error("Update announcement error:", error);
      return res.status(500).json({ message: "حدث خطأ في تحديث الإعلان" });
    }
  });

  // Dynamic Tour Guides
  app.get("/api/local-tour-guides", async (_req, res) => {
    try {
      const guides = await storage.getDbTourGuides();
      return res.json(guides);
    } catch (error) {
      console.error("Get tour guides error:", error);
      return res.status(500).json({ message: "حدث خطأ في جلب المرشدين" });
    }
  });

  app.post("/api/local-tour-guides", async (req, res) => {
    try {
      const guideData = req.body;
      if (!guideData.name || !guideData.nameAr || !guideData.phone) {
        return res.status(400).json({ message: "الاسم باللغتين ورقم الهاتف مطلوبان" });
      }
      const created = await storage.createDbTourGuide(guideData);
      return res.json(created);
    } catch (error) {
      console.error("Create tour guide error:", error);
      return res.status(500).json({ message: "حدث خطأ في إضافة المرشد" });
    }
  });

  app.put("/api/local-tour-guides/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id, 10);
      const guideData = req.body;
      if (!guideData.name || !guideData.nameAr || !guideData.phone) {
        return res.status(400).json({ message: "الاسم باللغتين ورقم الهاتف مطلوبان" });
      }
      const updated = await storage.updateDbTourGuide(id, guideData);
      return res.json(updated);
    } catch (error) {
      console.error("Update tour guide error:", error);
      return res.status(500).json({ message: "حدث خطأ في تحديث بيانات المرشد" });
    }
  });

  app.delete("/api/local-tour-guides/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id, 10);
      await storage.deleteDbTourGuide(id);
      return res.json({ success: true, message: "تم حذف المرشد بنجاح" });
    } catch (error) {
      console.error("Delete tour guide error:", error);
      return res.status(500).json({ message: "حدث خطأ في حذف المرشد" });
    }
  });

  // Dynamic Attractions
  app.get("/api/catalog/attractions", async (_req, res) => {
    try {
      const items = await storage.getDbAttractions();
      return res.json(items);
    } catch (error) {
      console.error("Get custom attractions error:", error);
      return res.status(500).json({ message: "حدث خطأ في جلب المعالم" });
    }
  });

  app.post("/api/catalog/attractions", async (req, res) => {
    try {
      const item = req.body;
      if (!item.name || !item.nameAr || !item.governorate) {
        return res.status(400).json({ message: "الاسم والمحافظة مطلوبان" });
      }
      const created = await storage.createDbAttraction(item);
      return res.json(created);
    } catch (error) {
      console.error("Create custom attraction error:", error);
      return res.status(500).json({ message: "حدث خطأ في إضافة المعلم" });
    }
  });

  app.delete("/api/catalog/attractions/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id, 10);
      await storage.deleteDbAttraction(id);
      return res.json({ success: true, message: "تم الحذف بنجاح" });
    } catch (error) {
      return res.status(500).json({ message: "حدث خطأ في الحذف" });
    }
  });

  // Dynamic Hotels
  app.get("/api/catalog/hotels", async (_req, res) => {
    try {
      const items = await storage.getDbHotels();
      return res.json(items);
    } catch (error) {
      console.error("Get custom hotels error:", error);
      return res.status(500).json({ message: "حدث خطأ في جلب الفنادق" });
    }
  });

  app.post("/api/catalog/hotels", async (req, res) => {
    try {
      const item = req.body;
      if (!item.name || !item.nameAr || !item.city) {
        return res.status(400).json({ message: "الاسم والمدينة مطلوبان" });
      }
      const created = await storage.createDbHotel(item);
      return res.json(created);
    } catch (error) {
      return res.status(500).json({ message: "حدث خطأ في الإضافة" });
    }
  });

  app.delete("/api/catalog/hotels/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id, 10);
      await storage.deleteDbHotel(id);
      return res.json({ success: true, message: "تم الحذف" });
    } catch (error) {
      return res.status(500).json({ message: "حدث خطأ في الحذف" });
    }
  });

  // Dynamic Restaurants
  app.get("/api/catalog/restaurants", async (_req, res) => {
    try {
      const items = await storage.getDbRestaurants();
      return res.json(items);
    } catch (error) {
      return res.status(500).json({ message: "حدث خطأ في جلب المطاعم" });
    }
  });

  app.post("/api/catalog/restaurants", async (req, res) => {
    try {
      const item = req.body;
      if (!item.name || !item.nameAr || !item.city) {
        return res.status(400).json({ message: "الاسم والمدينة مطلوبان" });
      }
      const created = await storage.createDbRestaurant(item);
      return res.json(created);
    } catch (error) {
      return res.status(500).json({ message: "حدث خطأ في الإضافة" });
    }
  });

  app.delete("/api/catalog/restaurants/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id, 10);
      await storage.deleteDbRestaurant(id);
      return res.json({ success: true, message: "تم الحذف" });
    } catch (error) {
      return res.status(500).json({ message: "حدث خطأ في الحذف" });
    }
  });

  // ========== MEDIA STORAGE & MANAGEMENT ROUTES ==========
  app.get("/api/media-assets", async (_req, res) => {
    try {
      const assets = await storage.getMediaAssets();
      return res.json(assets);
    } catch (error) {
      console.error("Get media assets error:", error);
      return res.status(500).json({ message: "حدث خطأ في جلب ملفات الوسائط" });
    }
  });

  app.post("/api/upload", async (req, res) => {
    try {
      const { filename, fileType, mimeType, size, base64Data } = req.body;
      if (!filename || !base64Data) {
        return res.status(400).json({ message: "البيانات غير مكتملة" });
      }

      // Ensure upload directory exists inside attached_assets
      const uploadsDir = path.join(process.cwd(), "attached_assets", "uploads");
      if (!fs.existsSync(uploadsDir)) {
        fs.mkdirSync(uploadsDir, { recursive: true });
      }

      // Clean the Base64 data if it has headers
      const cleanBase64 = base64Data.replace(/^data:.*;base64,/, "");
      const buffer = Buffer.from(cleanBase64, "base64");

      // Generate a clean and uniquely collision-free filename
      const uniqueId = Date.now() + "_" + Math.round(Math.random() * 1E9);
      const parsedFile = path.parse(filename);
      const cleanName = parsedFile.name.replace(/[^a-zA-Z0-9_\u0600-\u06FF]/g, "_");
      const uniqueFilename = `${cleanName}-${uniqueId}${parsedFile.ext}`;

      const filePath = path.join(uploadsDir, uniqueFilename);
      await fs.promises.writeFile(filePath, buffer);

      // Statically serve path
      const fileUrl = `/assets/uploads/${uniqueFilename}`;

      // Use the storage key
      const storageKey = process.env.MEDIA_STORAGE_API_KEY || "fr8RgP443tUZInXLjnaWIl54eo0";

      const mediaAsset = await storage.createMediaAsset({
        filename: uniqueFilename,
        url: fileUrl,
        fileType: fileType || (mimeType?.startsWith("video") ? "video" : "image"),
        mimeType: mimeType || "application/octet-stream",
        size: size || buffer.length,
        storageKeyUsed: storageKey,
      });

      return res.status(201).json(mediaAsset);
    } catch (error) {
      console.error("Upload handler error:", error);
      return res.status(500).json({ message: "حدث خطأ في معالجة ورفع ملف الوسائط" });
    }
  });

  app.delete("/api/media-assets/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id, 10);
      await storage.deleteMediaAsset(id);
      return res.json({ success: true, message: "تم حذف ملف الوسيط بنجاح" });
    } catch (error) {
      console.error("Delete media asset error:", error);
      return res.status(500).json({ message: "حدث خطأ في طلب حذف ملف الوسائط" });
    }
  });

  // ========== SHARABLE TOUR PANEL PERSISTENCE ==========
  const persistencePath = path.join(process.cwd(), "attached_assets", "admin_persistence.json");
  let adminData = {
    applications: [
      {
        id: 'app-1',
        name: 'سالم بن عبدالله الكندي',
        age: 28,
        phone: '+968 99123456',
        email: 'salim.kindi@gmail.com',
        nationality: 'عماني',
        governorate: 'الداخلية (نزوى)',
        languages: ['العربية', 'الإنجليزية'],
        description: 'مرشد سياحي مرخص بخبرة تزيد عن 4 كسنوات في جبال عمان وحصونها التاريخية. شغوف بنقل مغامرات وديان عمان للسياح.',
        status: 'pending' as const,
        submittedAt: '2026-05-19T08:30:00Z',
      },
      {
        id: 'app-2',
        name: 'مريم بنت علي الشعيبية',
        age: 25,
        phone: '+968 95887766',
        email: 'maryam.sh@outlook.com',
        nationality: 'عمانية',
        governorate: 'مسقط',
        languages: ['العربية', 'الإنجليزية', 'الألمانية'],
        description: 'متخصصة في السياحة البيئية والشاطئية. أحب تعريف الزوات بثقافتنا كعمانيين وحسن الضيافة العمانية الأصيلة.',
        status: 'approved' as const,
        submittedAt: '2026-05-18T14:15:00Z',
      }
    ],
    office: {
      name: 'مكتب شومة الرئيسي للسياحة والرحلات',
      address: 'سلطنة عمان - مسقط - حي القرم التجاري - بناية شومة، الطابق الأول، مكتب ١٠٤ مقابل حديقة القرم الطبيعية',
      phone: '+968 2456 7890',
      workingHours: 'يومياً من السبت إلى الخميس: 9:00 صباحاً - 6:00 مساءً (الجمعة مغلق)',
      mapEmbedUrl: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3656.9634732152014!2d58.47271031358934!3d23.6056586326177!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3e92019779df3b69%3A0xc3f587d559ab5f9d!2z2KfZhNmC2LHZhQ!5e0!3m2!1sar!2som!4v1716223800000!5m2!1sar!2som'
    },
    trips: [
      {
        id: 'trip-1',
        touristName: 'جون سميث وعائلته (٤ أشخاص)',
        destination: 'وادي بني خالد ورمال وهيبة',
        date: '2026-05-25',
        duration: 'يوم كامل (7:00 ص - 8:00 م)',
        status: 'assigned' as const,
        price: '٨٠ ر.ع',
        notes: 'الزوار مهتمون جداً بالتصوير الفوتوغرافي وتجربة المأكولات العمانية التقليدية وقت الغداء.',
      },
      {
        id: 'trip-2',
        touristName: 'سارة لوران (شخصين)',
        destination: 'جولة معالم مسقط التاريخية (جامع السلطان قابوس الأكبر - سوق مطرح - قصر العلم)',
        date: '2026-05-28',
        duration: 'نصف يوم (8:00 ص - 1:00 م)',
        status: 'accepted' as const,
        price: '٤٥ ر.ع',
        notes: 'تحتاج السائحة إلى شرح مفصل باللغة الإنجليزية وعن العادات والتقاليد العمانية.',
      }
    ],
    tickets: [
      {
        id: 'ticket-1',
        guideName: 'مريم بنت علي الشعيبية',
        email: 'maryam.sh@outlook.com',
        subject: 'طلب شارة مرشد جديدة',
        message: 'مرحباً إدارة شومة الموقرة، أرغب في تقديم طلب للحصول على شارة معدنية جديدة تحمل هويتي السياحية لوضعها أثناء الرحلات القادمة.',
        status: 'answered' as const,
        reply: 'مرحباً مريم، شارتك جاهزة بالفعل! يمكنك استلامها من مكتبنا الرئيسي بالقرم أو سيتم شحنها إليك مع مندوب الرحلة القادمة.',
        createdAt: '2026-05-19T10:00:00Z',
      },
      {
        id: 'ticket-2',
        guideName: 'حمد الحبسي',
        email: 'hamadalhabsi208@gmail.com',
        subject: 'مساعدة في مستندات تفعيل الحساب',
        message: 'السلام عليكم، أود التأكد من تفعيل حسابي كمرشد سياحي حتى أبدأ في استقبال طلبات الرحلات بنجاح.',
        status: 'open' as const,
        createdAt: '2026-05-20T11:20:00Z',
      }
    ]
  };

  const savePersistence = () => {
    try {
      const dir = path.dirname(persistencePath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      fs.writeFileSync(persistencePath, JSON.stringify(adminData, null, 2), "utf8");
    } catch (e) {
      console.error("Failed to save admin persistence:", e);
    }
  };

  try {
    if (fs.existsSync(persistencePath)) {
      const content = fs.readFileSync(persistencePath, "utf8");
      const parsed = JSON.parse(content);
      if (parsed && typeof parsed === "object") {
        if (Array.isArray(parsed.applications)) adminData.applications = parsed.applications;
        if (parsed.office) adminData.office = parsed.office;
        if (Array.isArray(parsed.trips)) adminData.trips = parsed.trips;
        if (Array.isArray(parsed.tickets)) adminData.tickets = parsed.tickets;
      }
    } else {
      savePersistence();
    }
  } catch (e) {
    console.error("Failed to load admin persistence, using defaults:", e);
  }

  // --- API Routes for Applications ---
  app.get("/api/applications", (_req, res) => {
    return res.json(adminData.applications);
  });

  app.post("/api/applications", (req, res) => {
    const { name, age, phone, email, nationality, governorate, languages, description } = req.body;
    const newApp = {
      id: "app-" + Date.now() + "_" + Math.round(Math.random() * 1000),
      name: name || "متقدم جديد",
      age: parseInt(age, 10) || 25,
      phone: phone || "",
      email: email || "",
      nationality: nationality || "عماني",
      governorate: governorate || "مسقط",
      languages: Array.isArray(languages) ? languages : ["العربية"],
      description: description || "",
      status: "pending" as const,
      submittedAt: new Date().toISOString()
    };
    adminData.applications.unshift(newApp);
    savePersistence();
    return res.status(201).json(newApp);
  });

  app.put("/api/applications/:id", (req, res) => {
    const { id } = req.params;
    const { status } = req.body;
    const index = adminData.applications.findIndex(a => a.id === id);
    if (index !== -1) {
      adminData.applications[index].status = status;
      savePersistence();
      return res.json(adminData.applications[index]);
    }
    return res.status(404).json({ message: "Application not found" });
  });

  app.delete("/api/applications/:id", (req, res) => {
    const { id } = req.params;
    adminData.applications = adminData.applications.filter(a => a.id !== id);
    savePersistence();
    return res.json({ success: true });
  });

  // --- API Routes for Office ---
  app.get("/api/office", (_req, res) => {
    return res.json(adminData.office);
  });

  app.post("/api/office", (req, res) => {
    const { name, address, phone, workingHours, mapEmbedUrl } = req.body;
    adminData.office = {
      name: name || adminData.office.name,
      address: address || adminData.office.address,
      phone: phone || adminData.office.phone,
      workingHours: workingHours || adminData.office.workingHours,
      mapEmbedUrl: mapEmbedUrl || adminData.office.mapEmbedUrl
    };
    savePersistence();
    return res.json(adminData.office);
  });

  // --- API Routes for Trips ---
  app.get("/api/trips", (_req, res) => {
    return res.json(adminData.trips);
  });

  app.post("/api/trips", (req, res) => {
    const { touristName, destination, date, duration, price, notes, badges } = req.body;
    const newTrip = {
      id: "trip-" + Date.now() + "_" + Math.round(Math.random() * 1000),
      touristName: touristName || "سائح",
      destination: destination || "",
      date: date || new Date().toISOString().split('T')[0],
      duration: duration || "يوم كامل",
      status: "assigned" as const,
      price: price || "٥٠ ر.ع",
      notes: notes || "",
      badges: badges || []
    };
    adminData.trips.unshift(newTrip);
    savePersistence();
    return res.status(201).json(newTrip);
  });

  app.put("/api/trips/:id", (req, res) => {
    const { id } = req.params;
    const { status } = req.body;
    const index = adminData.trips.findIndex(t => t.id === id);
    if (index !== -1) {
      adminData.trips[index].status = status;
      savePersistence();
      return res.json(adminData.trips[index]);
    }
    return res.status(404).json({ message: "Trip not found" });
  });

  app.delete("/api/trips/:id", (req, res) => {
    const { id } = req.params;
    adminData.trips = adminData.trips.filter(t => t.id !== id);
    savePersistence();
    return res.json({ success: true });
  });

  // --- API Routes for Tickets ---
  app.get("/api/tickets", (_req, res) => {
    return res.json(adminData.tickets);
  });

  app.post("/api/tickets", (req, res) => {
    const { guideName, email, subject, message } = req.body;
    const newTicket = {
      id: "ticket-" + Date.now() + "_" + Math.round(Math.random() * 1000),
      guideName: guideName || "مرشد",
      email: email || "",
      subject: subject || "بلاغ عام",
      message: message || "",
      status: "open" as const,
      createdAt: new Date().toISOString()
    };
    adminData.tickets.unshift(newTicket);
    savePersistence();
    return res.status(201).json(newTicket);
  });

  app.put("/api/tickets/:id", (req, res) => {
    const { id } = req.params;
    const { status, reply } = req.body;
    const index = adminData.tickets.findIndex(t => t.id === id);
    if (index !== -1) {
      if (status) adminData.tickets[index].status = status;
      if (reply) adminData.tickets[index].reply = reply;
      savePersistence();
      return res.json(adminData.tickets[index]);
    }
    return res.status(404).json({ message: "Ticket not found" });
  });

  return httpServer;
}

interface ItineraryParams {
  duration: number;
  budget: string;
  groupSize: number;
  interests: string[];
  preferredActivities: string[];
  accommodation: string;
  hotelPreference: string;
  mealPreference: string;
  governorates: string[];
}

interface GeoItem {
  id: string;
  name: string;
  location: string;
  category?: string;
  governorateId?: string;
  lat: number;
  lng: number;
  estimatedCost?: number;
  itemType?: "attraction" | "restaurant" | "hotel" | "activity";
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function haversineDistance(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLng / 2) * Math.sin(dLng / 2);
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function findNearest<T extends GeoItem>(target: GeoItem, items: T[], exclude: Set<string>): T | null {
  let best: T | null = null;
  let bestDist = Infinity;
  for (const item of items) {
    if (exclude.has(item.id)) continue;
    const dist = haversineDistance(target.lat, target.lng, item.lat, item.lng);
    if (dist < bestDist) {
      bestDist = dist;
      best = item;
    }
  }
  return best;
}

const appAttractions: GeoItem[] = [
  { id: "1", name: "شاطئ القرم", location: "محافظة مسقط", category: "nature", governorateId: "muscat", lat: 23.6071, lng: 58.4942, estimatedCost: 0 },
  { id: "2", name: "سوق مطرح", location: "محافظة مسقط", category: "markets", governorateId: "muscat", lat: 23.6193, lng: 58.5713, estimatedCost: 0 },
  { id: "3", name: "وادي الخوض", location: "محافظة مسقط", category: "wadis", governorateId: "muscat", lat: 23.5451, lng: 58.0872, estimatedCost: 0 },
  { id: "4", name: "منتزه القرم الطبيعي", location: "محافظة مسقط", category: "nature", governorateId: "muscat", lat: 23.5992, lng: 58.4156, estimatedCost: 0 },
  { id: "5", name: "قلعة مطرح", location: "محافظة مسقط", category: "heritage", governorateId: "muscat", lat: 23.6225, lng: 58.5695, estimatedCost: 1 },
  { id: "1034", name: "دار الأوبرا السلطانية", location: "محافظة مسقط", category: "heritage", governorateId: "muscat", lat: 23.5858, lng: 58.4005, estimatedCost: 5 },
  { id: "1032", name: "منتزه مرتفعات بوشر", location: "محافظة مسقط", category: "nature", governorateId: "muscat", lat: 23.5550, lng: 58.3950, estimatedCost: 0 },
  { id: "1033", name: "حديقة النخلة", location: "محافظة مسقط", category: "entertainment", governorateId: "muscat", lat: 23.5880, lng: 58.3750, estimatedCost: 2 },
  { id: "1037", name: "مسقط جراند مول", location: "محافظة مسقط", category: "markets", governorateId: "muscat", lat: 23.5900, lng: 58.4050, estimatedCost: 0 },
  { id: "6", name: "جبل الأخضر", location: "محافظة الداخلية", category: "nature", governorateId: "dakhiliyah", lat: 23.0742, lng: 57.6517, estimatedCost: 0 },
  { id: "7", name: "قلعة نزوى", location: "محافظة الداخلية", category: "heritage", governorateId: "dakhiliyah", lat: 22.9320, lng: 57.5292, estimatedCost: 3 },
  { id: "8", name: "وادي الغول", location: "محافظة الداخلية", category: "wadis", governorateId: "dakhiliyah", lat: 23.1250, lng: 57.3500, estimatedCost: 0 },
  { id: "9", name: "سوق نزوى التقليدي", location: "محافظة الداخلية", category: "markets", governorateId: "dakhiliyah", lat: 22.9315, lng: 57.5283, estimatedCost: 0 },
  { id: "10", name: "حديقة فلج دارس", location: "محافظة الداخلية", category: "entertainment", governorateId: "dakhiliyah", lat: 22.9251, lng: 57.5350, estimatedCost: 0 },
  { id: "34", name: "مسفاة العبريين", location: "محافظة الداخلية", category: "heritage", governorateId: "dakhiliyah", lat: 23.1350, lng: 57.3100, estimatedCost: 1 },
  { id: "35", name: "جبل شمس", location: "محافظة الداخلية", category: "nature", governorateId: "dakhiliyah", lat: 23.2360, lng: 57.2610, estimatedCost: 0 },
  { id: "36", name: "وادي بني خالد", location: "محافظة جنوب الشرقية", category: "wadis", governorateId: "south_sharqiyah", lat: 22.6100, lng: 59.0700, estimatedCost: 0 },
  { id: "37", name: "وادي شاب", location: "محافظة جنوب الشرقية", category: "wadis", governorateId: "south_sharqiyah", lat: 22.8400, lng: 59.1800, estimatedCost: 0 },
  { id: "39", name: "رأس الحد (محمية السلاحف)", location: "محافظة جنوب الشرقية", category: "nature", governorateId: "south_sharqiyah", lat: 22.5270, lng: 59.7980, estimatedCost: 3 },
  { id: "40", name: "حصن صور", location: "محافظة جنوب الشرقية", category: "heritage", governorateId: "south_sharqiyah", lat: 22.5670, lng: 59.5290, estimatedCost: 1 },
  { id: "43", name: "رمال وهيبة", location: "محافظة شمال الشرقية", category: "entertainment", governorateId: "north_sharqiyah", lat: 22.3500, lng: 58.5000, estimatedCost: 5 },
  { id: "44", name: "وادي بني عوف", location: "محافظة شمال الشرقية", category: "wadis", governorateId: "north_sharqiyah", lat: 23.2000, lng: 57.6000, estimatedCost: 0 },
  { id: "45", name: "حصن جبرين", location: "محافظة الداخلية", category: "heritage", governorateId: "dakhiliyah", lat: 23.2150, lng: 56.9900, estimatedCost: 3 },
  { id: "14", name: "قلعة صحار", location: "محافظة شمال الباطنة", category: "heritage", governorateId: "north_batinah", lat: 24.3636, lng: 56.7485, estimatedCost: 2 },
  { id: "13", name: "عين الكسفة", location: "محافظة شمال الباطنة", category: "springs", governorateId: "north_batinah", lat: 24.4000, lng: 56.7300, estimatedCost: 0 },
  { id: "15", name: "ساحل البريمي", location: "محافظة البريمي", category: "nature", governorateId: "buraimi", lat: 24.2340, lng: 55.7545, estimatedCost: 0 },
  { id: "16", name: "حصن الخندق", location: "محافظة البريمي", category: "heritage", governorateId: "buraimi", lat: 24.2400, lng: 55.7600, estimatedCost: 1 },
  { id: "19", name: "عين رزات", location: "محافظة ظفار", category: "springs", governorateId: "dhofar", lat: 17.0878, lng: 54.1020, estimatedCost: 0 },
  { id: "20", name: "كهف المرنيف", location: "محافظة ظفار", category: "nature", governorateId: "dhofar", lat: 16.8420, lng: 53.7640, estimatedCost: 0 },
  { id: "22", name: "شلالات وادي دربات", location: "محافظة ظفار", category: "wadis", governorateId: "dhofar", lat: 17.1100, lng: 54.4300, estimatedCost: 0 },
  { id: "24", name: "وادي دوكة (أرض اللبان)", location: "محافظة ظفار", category: "heritage", governorateId: "dhofar", lat: 17.1500, lng: 54.0700, estimatedCost: 2 },
  { id: "25", name: "شاطئ المغسيل", location: "محافظة ظفار", category: "nature", governorateId: "dhofar", lat: 16.8415, lng: 53.7635, estimatedCost: 0 },
  { id: "1038", name: "حديقة صلالة العامة", location: "محافظة ظفار", category: "entertainment", governorateId: "dhofar", lat: 17.0230, lng: 54.0900, estimatedCost: 0 },
  { id: "11", name: "عين حمران", location: "محافظة الوسطى", category: "springs", governorateId: "wusta", lat: 20.3200, lng: 57.0400, estimatedCost: 0 },
  { id: "12", name: "جزيرة مصيرة", location: "محافظة الوسطى", category: "nature", governorateId: "wusta", lat: 20.4500, lng: 58.7800, estimatedCost: 0 },
  { id: "17", name: "وادي ضم", location: "محافظة الظاهرة", category: "wadis", governorateId: "dhahirah", lat: 23.3000, lng: 56.5000, estimatedCost: 0 },
  { id: "18", name: "حصن عبري", location: "محافظة الظاهرة", category: "heritage", governorateId: "dhahirah", lat: 23.2250, lng: 56.7230, estimatedCost: 1 },
  { id: "30", name: "وادي الحوقين", location: "محافظة جنوب الباطنة", category: "wadis", governorateId: "south_batinah", lat: 23.3800, lng: 57.3600, estimatedCost: 0 },
  { id: "31", name: "عين الثوارة", location: "محافظة جنوب الباطنة", category: "springs", governorateId: "south_batinah", lat: 23.4100, lng: 57.5300, estimatedCost: 0 },
  { id: "49", name: "خور شم", location: "محافظة مسندم", category: "nature", governorateId: "musandam", lat: 26.1800, lng: 56.2300, estimatedCost: 0 },
  { id: "50", name: "قلعة خصب", location: "محافظة مسندم", category: "heritage", governorateId: "musandam", lat: 26.1760, lng: 56.2480, estimatedCost: 2 },
  { id: "48", name: "الرحلات البحرية في الخيران", location: "محافظة مسندم", category: "entertainment", governorateId: "musandam", lat: 26.1850, lng: 56.2350, estimatedCost: 15 },
  { id: "62", name: "سلك انزالقي خصب", location: "محافظة مسندم", category: "entertainment", governorateId: "musandam", lat: 26.1790, lng: 56.2400, estimatedCost: 10 },
  { id: "63", name: "شاطئ بصة", location: "محافظة مسندم", category: "nature", governorateId: "musandam", lat: 26.1650, lng: 56.2500, estimatedCost: 0 },
  { id: "64", name: "خور نجد", location: "محافظة مسندم", category: "wadis", governorateId: "musandam", lat: 26.1500, lng: 56.2700, estimatedCost: 0 },
  { id: "67", name: "جبل الرحيم", location: "محافظة مسندم", category: "nature", governorateId: "musandam", lat: 26.1400, lng: 56.2200, estimatedCost: 0 },
  { id: "66", name: "حصن الكمازرة", location: "محافظة مسندم", category: "heritage", governorateId: "musandam", lat: 26.2000, lng: 56.2600, estimatedCost: 1 },
  { id: "61", name: "مركز لولو التجاري", location: "محافظة مسندم", category: "markets", governorateId: "musandam", lat: 26.1770, lng: 56.2470, estimatedCost: 0 },
  { id: "65", name: "حديقة خصب العامة", location: "محافظة مسندم", category: "entertainment", governorateId: "musandam", lat: 26.1740, lng: 56.2450, estimatedCost: 0 },
  { id: "1035", name: "نادي عُمان للرماية", location: "محافظة مسقط", category: "entertainment", governorateId: "muscat", lat: 23.5700, lng: 58.3600, estimatedCost: 15 },
  { id: "1036", name: "عالم فابي لاند", location: "محافظة مسقط", category: "entertainment", governorateId: "muscat", lat: 23.5850, lng: 58.3850, estimatedCost: 5 },
  { id: "1041", name: "منتزه أتين الطبيعي", location: "محافظة ظفار", category: "nature", governorateId: "dhofar", lat: 17.0800, lng: 54.2000, estimatedCost: 0 },
];

const appActivities: GeoItem[] = [
  { id: "act-1", name: "هايكنج وادي شاب", location: "محافظة جنوب الشرقية", category: "adventure", governorateId: "south_sharqiyah", lat: 22.8400, lng: 59.1800, estimatedCost: 20, itemType: "activity" },
  { id: "act-2", name: "هايكنج جبل شمس (الممشى)", location: "محافظة الداخلية", category: "adventure", governorateId: "dakhiliyah", lat: 23.2360, lng: 57.2610, estimatedCost: 0, itemType: "activity" },
  { id: "act-3", name: "ركوب الجمال في رمال وهيبة", location: "محافظة شمال الشرقية", category: "adventure", governorateId: "north_sharqiyah", lat: 22.3500, lng: 58.5000, estimatedCost: 15, itemType: "activity" },
  { id: "act-4", name: "رحلة بحرية في مسندم", location: "محافظة مسندم", category: "adventure", governorateId: "musandam", lat: 26.1850, lng: 56.2350, estimatedCost: 25, itemType: "activity" },
  { id: "act-5", name: "سباحة في وادي بني خالد", location: "محافظة جنوب الشرقية", category: "swimming", governorateId: "south_sharqiyah", lat: 22.6100, lng: 59.0700, estimatedCost: 0, itemType: "activity" },
  { id: "act-6", name: "سباحة في عين رزات", location: "محافظة ظفار", category: "swimming", governorateId: "dhofar", lat: 17.0878, lng: 54.1020, estimatedCost: 0, itemType: "activity" },
  { id: "act-7", name: "غوص في جزر الديمانيات", location: "محافظة مسقط", category: "swimming", governorateId: "muscat", lat: 23.8500, lng: 57.9500, estimatedCost: 30, itemType: "activity" },
  { id: "act-8", name: "تخييم في رمال وهيبة", location: "محافظة شمال الشرقية", category: "camping", governorateId: "north_sharqiyah", lat: 22.3500, lng: 58.5000, estimatedCost: 25, itemType: "activity" },
  { id: "act-9", name: "مشاهدة السلاحف في رأس الجنز", location: "محافظة جنوب الشرقية", category: "nature", governorateId: "south_sharqiyah", lat: 22.4350, lng: 59.7950, estimatedCost: 5, itemType: "activity" },
  { id: "act-10", name: "انزالق على الرمال", location: "محافظة شمال الشرقية", category: "adventure", governorateId: "north_sharqiyah", lat: 22.3600, lng: 58.5100, estimatedCost: 10, itemType: "activity" },
  { id: "act-11", name: "تجربة الرماية الرياضية", location: "محافظة مسقط", category: "sports", governorateId: "muscat", lat: 23.5700, lng: 58.3600, estimatedCost: 20, itemType: "activity" },
  { id: "act-12", name: "هايكنج وادي الأربيين", location: "محافظة جنوب الشرقية", category: "adventure", governorateId: "south_sharqiyah", lat: 22.9200, lng: 59.2100, estimatedCost: 0, itemType: "activity" },
  { id: "act-13", name: "سباحة في وادي الحوقين", location: "محافظة جنوب الباطنة", category: "swimming", governorateId: "south_batinah", lat: 23.3800, lng: 57.3600, estimatedCost: 0, itemType: "activity" },
  { id: "act-14", name: "استكشاف كهوف الهوتة", location: "محافظة الداخلية", category: "adventure", governorateId: "dakhiliyah", lat: 23.0900, lng: 57.3800, estimatedCost: 7, itemType: "activity" },
];

const appHotels: GeoItem[] = [
  { id: "1", name: "فندق الحواس الست", location: "محافظة مسندم", governorateId: "musandam", lat: 26.1600, lng: 56.2550, estimatedCost: 500 },
  { id: "2", name: "مخيم ألف ليلة", location: "محافظة شمال الشرقية", governorateId: "north_sharqiyah", lat: 22.3600, lng: 58.4900, estimatedCost: 200 },
  { id: "3", name: "فندق شانغريلا مسقط", location: "محافظة مسقط", governorateId: "muscat", lat: 23.5400, lng: 58.6400, estimatedCost: 150 },
  { id: "4", name: "منتجع أنتارا الجبل الأخضر", location: "محافظة الداخلية", governorateId: "dakhiliyah", lat: 23.0750, lng: 57.6600, estimatedCost: 180 },
  { id: "5", name: "فندق W مسقط", location: "محافظة مسقط", governorateId: "muscat", lat: 23.6100, lng: 58.4200, estimatedCost: 100 },
  { id: "6", name: "فندق كمبينسكي الموج", location: "محافظة مسقط", governorateId: "muscat", lat: 23.6400, lng: 58.2700, estimatedCost: 120 },
  { id: "7", name: "فندق الفيصل", location: "محافظة ظفار", governorateId: "dhofar", lat: 17.0178, lng: 54.0825, estimatedCost: 80 },
  { id: "8", name: "فندق سنتارا صلالة", location: "محافظة ظفار", governorateId: "dhofar", lat: 16.9990, lng: 54.1200, estimatedCost: 120 },
];

const appRestaurants: GeoItem[] = [
  { id: "1", name: "قهوة البرج", location: "محافظة جنوب الباطنة", governorateId: "south_batinah", lat: 23.4850, lng: 57.9500, estimatedCost: 5 },
  { id: "2", name: "لاجونا", location: "محافظة مسقط", governorateId: "muscat", lat: 23.5960, lng: 58.4100, estimatedCost: 7 },
  { id: "3", name: "بيت المضغوط", location: "محافظة مسقط", governorateId: "muscat", lat: 23.5800, lng: 58.4000, estimatedCost: 5 },
  { id: "4", name: "مطاعم خوان", location: "محافظة مسقط", governorateId: "muscat", lat: 23.5950, lng: 58.4500, estimatedCost: 7 },
  { id: "5", name: "بين القصورين", location: "محافظة مسقط", governorateId: "muscat", lat: 23.6050, lng: 58.5400, estimatedCost: 7 },
  { id: "6", name: "ذا ريستورانت", location: "محافظة مسقط", governorateId: "muscat", lat: 23.5870, lng: 58.4250, estimatedCost: 7 },
  { id: "7", name: "ذكريات", location: "محافظة مسقط", governorateId: "muscat", lat: 23.6100, lng: 58.5000, estimatedCost: 7 },
  { id: "8", name: "شواء مسقط", location: "محافظة مسقط", governorateId: "muscat", lat: 23.6000, lng: 58.4700, estimatedCost: 5 },
  { id: "11", name: "مطعم ومطبخ عين الخليج", location: "محافظة شمال الشرقية", governorateId: "north_sharqiyah", lat: 22.5700, lng: 58.1200, estimatedCost: 5 },
  { id: "12", name: "مطعم بن عتيق للمأكولات العمانية", location: "محافظة ظفار", governorateId: "dhofar", lat: 17.0170, lng: 54.0900, estimatedCost: 7 },
  { id: "13", name: "مطعم الشرقية", location: "محافظة جنوب الشرقية", governorateId: "south_sharqiyah", lat: 22.5700, lng: 59.5300, estimatedCost: 5 },
  { id: "14", name: "مطعم الداخلية", location: "محافظة الداخلية", governorateId: "dakhiliyah", lat: 22.9300, lng: 57.5300, estimatedCost: 5 },
  { id: "15", name: "مطعم خصب", location: "محافظة مسندم", governorateId: "musandam", lat: 26.1770, lng: 56.2470, estimatedCost: 7 },
];

function findNearestWithinRadius<T extends GeoItem>(target: GeoItem, items: T[], exclude: Set<string>, maxDistKm: number): T | null {
  let best: T | null = null;
  let bestDist = Infinity;
  for (const item of items) {
    if (exclude.has(item.id)) continue;
    const dist = haversineDistance(target.lat, target.lng, item.lat, item.lng);
    if (dist <= maxDistKm && dist < bestDist) {
      bestDist = dist;
      best = item;
    }
  }
  return best;
}

const interestToCategoryMap: Record<string, string[]> = {
  adventure: ["adventure", "entertainment", "sports"],
  nature: ["nature", "wadis", "springs"],
  culture: ["heritage", "markets"],
  heritage: ["heritage"],
  swimming: ["wadis", "springs", "swimming"],
  food: ["markets"],
  entertainment: ["entertainment", "sports"],
  relaxation: ["nature", "springs"],
  shopping: ["markets"],
  photography: ["nature", "heritage", "wadis"],
};

const budgetMultipliers: Record<string, number> = {
  low: 0.6,
  medium: 1.0,
  high: 1.5,
  luxury: 2.5,
};

function generateItinerary(params: ItineraryParams): Itinerary {
  const { duration, budget, groupSize, interests, preferredActivities, hotelPreference, governorates } = params;
  const singleHotelMode = hotelPreference !== "multiple";
  const numDays = Math.min(duration, 7);
  const budgetMult = budgetMultipliers[budget] || 1.0;

  const budgetTitles: Record<string, string> = {
    low: "رحلة اقتصادية مميزة",
    medium: "رحلة متوازنة ومريحة",
    high: "رحلة فاخرة راقية",
    luxury: "رحلة استثنائية فاخرة",
  };

  const matchedCategories = new Set<string>();
  for (const interest of interests) {
    const cats = interestToCategoryMap[interest];
    if (cats) cats.forEach(c => matchedCategories.add(c));
  }
  for (const act of preferredActivities) {
    const cats = interestToCategoryMap[act];
    if (cats) cats.forEach(c => matchedCategories.add(c));
  }

  let filteredAttractions = governorates.length > 0
    ? appAttractions.filter(a => a.governorateId && governorates.includes(a.governorateId))
    : [...appAttractions];
  let filteredHotels = governorates.length > 0
    ? appHotels.filter(h => h.governorateId && governorates.includes(h.governorateId))
    : [...appHotels];
  let filteredRestaurants = governorates.length > 0
    ? appRestaurants.filter(r => r.governorateId && governorates.includes(r.governorateId))
    : [...appRestaurants];
  let filteredActivities = governorates.length > 0
    ? appActivities.filter(a => a.governorateId && governorates.includes(a.governorateId))
    : [...appActivities];

  if (filteredAttractions.length < 4) filteredAttractions = [...appAttractions];
  if (filteredHotels.length === 0) filteredHotels = [...appHotels];
  if (filteredRestaurants.length < 2) filteredRestaurants = [...appRestaurants];
  if (filteredActivities.length === 0) filteredActivities = [...appActivities];

  let interestAttractions: GeoItem[] = [];
  let otherAttractions: GeoItem[] = [];
  if (matchedCategories.size > 0) {
    interestAttractions = filteredAttractions.filter(a => a.category && matchedCategories.has(a.category));
    otherAttractions = filteredAttractions.filter(a => !a.category || !matchedCategories.has(a.category));
  } else {
    otherAttractions = filteredAttractions;
  }

  const prioritizedAttractions = [...shuffle(interestAttractions), ...shuffle(otherAttractions)];

  let interestActivities: GeoItem[] = [];
  if (matchedCategories.size > 0) {
    interestActivities = filteredActivities.filter(a => a.category && matchedCategories.has(a.category));
  }
  if (interestActivities.length === 0) interestActivities = filteredActivities;
  const shuffledActivities = shuffle(interestActivities);

  const hotels = shuffle(filteredHotels);
  const restaurants = shuffle(filteredRestaurants);

  const govGroups: Record<string, GeoItem[]> = {};
  for (const a of prioritizedAttractions) {
    const gov = a.governorateId || "other";
    if (!govGroups[gov]) govGroups[gov] = [];
    govGroups[gov].push(a);
  }

  const sortedGovs = Object.entries(govGroups)
    .sort((a, b) => b[1].length - a[1].length)
    .map(([gov]) => gov);

  const usedAttractions = new Set<string>();
  const usedRestaurants = new Set<string>();
  const usedHotels = new Set<string>();
  const usedActivities = new Set<string>();
  const days: ItineraryDay[] = [];

  const dayGovAssignments: string[] = [];
  let govIdx = 0;
  const tempUsed = new Set<string>();
  for (let i = 0; i < numDays; i++) {
    if (govIdx >= sortedGovs.length * 3) {
      dayGovAssignments.push(sortedGovs[i % sortedGovs.length]);
      continue;
    }
    const gov = sortedGovs[govIdx % sortedGovs.length];
    const available = (govGroups[gov] || []).filter(a => !tempUsed.has(a.id));
    if (available.length >= 1) {
      dayGovAssignments.push(gov);
      available.slice(0, 3).forEach(a => tempUsed.add(a.id));
      govIdx++;
    } else {
      govIdx++;
      i--;
    }
  }

  let fixedHotel: GeoItem | null = null;
  if (singleHotelMode) {
    const allDayGovs = new Set(dayGovAssignments);
    const govHotels = hotels.filter(h => h.governorateId && allDayGovs.has(h.governorateId));
    const pool = govHotels.length > 0 ? govHotels : hotels;
    const center: GeoItem = {
      id: "center", name: "", location: "",
      lat: prioritizedAttractions.reduce((s, a) => s + a.lat, 0) / prioritizedAttractions.length,
      lng: prioritizedAttractions.reduce((s, a) => s + a.lng, 0) / prioritizedAttractions.length,
    };
    fixedHotel = findNearest(center, pool, new Set()) || hotels[0];
  }

  const MAX_CLUSTER_RADIUS = 80;
  let totalHotelsCost = 0;
  let totalRestaurantsCost = 0;
  let totalAttractionsCost = 0;
  let totalActivitiesCost = 0;
  let totalTransportCost = 0;

  for (let i = 0; i < numDays; i++) {
    const dayGov = dayGovAssignments[i] || sortedGovs[i % sortedGovs.length];
    const govAttractionPool = govGroups[dayGov] || [];

    let anchor = govAttractionPool.find(a => !usedAttractions.has(a.id));
    if (!anchor) anchor = prioritizedAttractions.find(a => !usedAttractions.has(a.id));
    if (!anchor) {
      usedAttractions.clear();
      anchor = govAttractionPool[0] || prioritizedAttractions[0];
    }
    usedAttractions.add(anchor.id);

    const attr1 = anchor;
    let attr2 = findNearestWithinRadius(attr1, govAttractionPool, usedAttractions, MAX_CLUSTER_RADIUS);
    if (!attr2) attr2 = findNearestWithinRadius(attr1, prioritizedAttractions, usedAttractions, MAX_CLUSTER_RADIUS);
    if (!attr2) attr2 = findNearest(attr1, prioritizedAttractions, usedAttractions);
    if (!attr2) attr2 = prioritizedAttractions.find(a => a.id !== attr1.id) || attr1;
    usedAttractions.add(attr2.id);

    let dayActivity: GeoItem | null = null;
    const govActivities = shuffledActivities.filter(a => a.governorateId === dayGov && !usedActivities.has(a.id));
    if (govActivities.length > 0) {
      dayActivity = govActivities[0];
    } else {
      const anyActivity = shuffledActivities.find(a => !usedActivities.has(a.id));
      if (anyActivity && i < numDays - 1) dayActivity = anyActivity;
    }
    if (dayActivity) usedActivities.add(dayActivity.id);

    const dayCenter: GeoItem = {
      id: "center", name: "", location: "",
      lat: (attr1.lat + attr2.lat) / 2,
      lng: (attr1.lng + attr2.lng) / 2,
    };

    let hotel: GeoItem;
    if (singleHotelMode && fixedHotel) {
      hotel = fixedHotel;
    } else {
      let h = findNearestWithinRadius(dayCenter, hotels, usedHotels, MAX_CLUSTER_RADIUS);
      if (!h) h = findNearest(dayCenter, hotels, usedHotels);
      if (!h) {
        usedHotels.clear();
        h = findNearest(dayCenter, hotels, new Set()) || hotels[0];
      }
      hotel = h;
      usedHotels.add(hotel.id);
    }

    let restaurant1 = findNearestWithinRadius(attr1, restaurants, usedRestaurants, MAX_CLUSTER_RADIUS);
    if (!restaurant1) restaurant1 = findNearest(attr1, restaurants, usedRestaurants);
    if (!restaurant1) {
      usedRestaurants.clear();
      restaurant1 = findNearest(attr1, restaurants, new Set()) || restaurants[0];
    }
    usedRestaurants.add(restaurant1.id);

    let restaurant2 = findNearestWithinRadius(attr2, restaurants, usedRestaurants, MAX_CLUSTER_RADIUS);
    if (!restaurant2) restaurant2 = findNearest(attr2, restaurants, usedRestaurants);
    if (!restaurant2) restaurant2 = restaurants.find(r => r.id !== restaurant1.id) || restaurant1;
    if (restaurant2.id !== restaurant1.id) usedRestaurants.add(restaurant2.id);

    const distAttr = haversineDistance(attr1.lat, attr1.lng, attr2.lat, attr2.lng);
    const travelMin = Math.max(15, Math.round(distAttr / 60 * 60));
    const dayTransport = Math.round(distAttr * 0.3 * budgetMult);

    const hotelCost = Math.round((hotel.estimatedCost || 100) * budgetMult);
    const r1Cost = Math.round((restaurant1.estimatedCost || 5) * groupSize);
    const r2Cost = Math.round((restaurant2.estimatedCost || 5) * groupSize);
    const a1Cost = Math.round((attr1.estimatedCost || 0) * groupSize);
    const a2Cost = Math.round((attr2.estimatedCost || 0) * groupSize);
    const actCost = dayActivity ? Math.round((dayActivity.estimatedCost || 0) * groupSize) : 0;

    totalHotelsCost += hotelCost;
    totalRestaurantsCost += r1Cost + r2Cost;
    totalAttractionsCost += a1Cost + a2Cost;
    totalActivitiesCost += actCost;
    totalTransportCost += dayTransport;

    const activities: ItineraryActivity[] = [
      {
        time: "08:00",
        activity: "إفطار في الفندق",
        location: hotel.name,
        type: "hotel",
        itemId: hotel.id,
        description: `${hotel.location}`,
        estimatedCost: hotelCost,
        category: "hotel",
      },
      {
        time: "10:00",
        activity: `زيارة ${attr1.name}`,
        location: attr1.location,
        type: "attraction",
        itemId: attr1.id,
        description: `${Math.round(haversineDistance(hotel.lat, hotel.lng, attr1.lat, attr1.lng))} كم من الفندق`,
        estimatedCost: a1Cost,
        category: attr1.category,
      },
      {
        time: "13:00",
        activity: "غداء",
        location: restaurant1.name,
        type: "restaurant",
        itemId: restaurant1.id,
        description: `${Math.round(haversineDistance(attr1.lat, attr1.lng, restaurant1.lat, restaurant1.lng))} كم من ${attr1.name}`,
        estimatedCost: r1Cost,
        category: "restaurant",
      },
    ];

    if (dayActivity) {
      activities.push({
        time: "14:30",
        activity: dayActivity.name,
        location: dayActivity.location,
        type: "activity",
        itemId: dayActivity.id,
        description: `نشاط مميز - ${Math.round(haversineDistance(restaurant1.lat, restaurant1.lng, dayActivity.lat, dayActivity.lng))} كم`,
        estimatedCost: actCost,
        category: dayActivity.category,
      });
      activities.push({
        time: `${16 + Math.floor(travelMin / 60)}:${String(travelMin % 60).padStart(2, '0')}`,
        activity: `استكشاف ${attr2.name}`,
        location: attr2.location,
        type: "attraction",
        itemId: attr2.id,
        description: `${Math.round(distAttr)} كم من ${attr1.name} (~${travelMin} دقيقة)`,
        estimatedCost: a2Cost,
        category: attr2.category,
      });
    } else {
      activities.push({
        time: `${14 + Math.floor(travelMin / 60)}:${String(travelMin % 60).padStart(2, '0')}`,
        activity: `استكشاف ${attr2.name}`,
        location: attr2.location,
        type: "attraction",
        itemId: attr2.id,
        description: `${Math.round(distAttr)} كم من ${attr1.name} (~${travelMin} دقيقة)`,
        estimatedCost: a2Cost,
        category: attr2.category,
      });
    }

    activities.push(
      {
        time: "19:00",
        activity: "عشاء",
        location: restaurant2.name,
        type: "restaurant",
        itemId: restaurant2.id,
        description: `${Math.round(haversineDistance(attr2.lat, attr2.lng, restaurant2.lat, restaurant2.lng))} كم من ${attr2.name}`,
        estimatedCost: r2Cost,
        category: "restaurant",
      },
      {
        time: "21:00",
        activity: "العودة للفندق",
        location: hotel.name,
        type: "hotel",
        itemId: hotel.id,
        description: `${Math.round(haversineDistance(attr2.lat, attr2.lng, hotel.lat, hotel.lng))} كم`,
        estimatedCost: 0,
        category: "hotel",
      },
    );

    const dayTitlesByGov: Record<string, string[]> = {
      muscat: ["استكشاف مسقط", "جمال العاصمة", "يوم في مسقط"],
      dakhiliyah: ["تراث الداخلية", "قلاع ووديان", "يوم في نزوى"],
      dhofar: ["سحر ظفار", "خريف صلالة", "طبيعة ظفار"],
      musandam: ["جمال مسندم", "أفيورد العرب", "بحر مسندم"],
      north_batinah: ["ساحل الباطنة", "تاريخ صحار"],
      south_batinah: ["وديان جنوب الباطنة", "ينابيع وطبيعة"],
      north_sharqiyah: ["صحراء الشرقية", "رمال وهيبة"],
      south_sharqiyah: ["سواحل الشرقية", "وديان وأودية"],
      buraimi: ["تراث البريمي", "يوم في البريمي"],
      dhahirah: ["تراث الظاهرة", "يوم في عبري"],
      wusta: ["طبيعة الوسطى", "جزيرة مصيرة"],
    };

    const dayTitlesGeneral = [
      "الوصول والاستكشاف",
      "يوم المعالم التاريخية",
      "مغامرة في الطبيعة",
      "التسوق والترفيه",
      "الثقافة والفنون",
      "الاسترخاء والتجديد",
      "الوداع والمغادرة",
    ];

    const govTitles = dayTitlesByGov[dayGov];
    const dayTitle = govTitles
      ? govTitles[i % govTitles.length]
      : dayTitlesGeneral[i % dayTitlesGeneral.length];

    days.push({
      day: i + 1,
      title: dayTitle,
      activities,
    });
  }

  const budgetSummary: BudgetSummary = {
    hotels: totalHotelsCost,
    restaurants: totalRestaurantsCost,
    attractions: totalAttractionsCost,
    activities: totalActivitiesCost,
    transport: totalTransportCost,
    total: totalHotelsCost + totalRestaurantsCost + totalAttractionsCost + totalActivitiesCost + totalTransportCost,
  };

  return {
    id: `itinerary-${Date.now()}`,
    title: budgetTitles[budget] || "رحلتك المخصصة",
    duration,
    budget,
    governorates,
    days,
    budgetSummary,
  };
}
