import express from "express";
import path from "path";
import pg from "pg";
import { createServer as createViteServer } from "vite";

const { Pool } = pg;

const app = express();
app.use(express.json());

const PORT = 3000;

// Setup database connection with manual double-@ parsing support
const dbUrl = process.env.DATABASE_URL || "postgresql://postgres:Shouma@_3_7_3@db.fruiddsksjpyvabibjgk.supabase.co:5432/postgres";
let dbConfig: any = {};

if (dbUrl.includes("@db.fruiddsksjpyvabibjgk.supabase.co")) {
  dbConfig = {
    user: "postgres",
    password: "Shouma@_3_7_3",
    host: "db.fruiddsksjpyvabibjgk.supabase.co",
    port: 5432,
    database: "postgres",
    ssl: { rejectUnauthorized: false }
  };
} else {
  dbConfig = {
    connectionString: dbUrl,
    ssl: dbUrl.includes("supabase") || dbUrl.includes("neon") ? { rejectUnauthorized: false } : undefined
  };
}

const pool = new Pool(dbConfig);
let useMemoryFallback = false;

// Memory Fallback DB Store
let memApps = [
  {
    id: "app-1",
    name: "سالم بن عبدالله الكندي",
    age: 28,
    phone: "+968 99123456",
    email: "salim.kindi@gmail.com",
    nationality: "عماني",
    governorate: "الداخلية (نزوى)",
    languages: ["العربية", "الإنجليزية"],
    description: "مرشد سياحي مرخص بخبرة تزيد عن 4 كسنوات في جبال عمان وحصونها التاريخية. شغوف بنقل مغامرات وديان عمان للسياح.",
    status: "pending",
    submittedAt: "2026-05-19T08:30:00Z"
  },
  {
    id: "app-2",
    name: "مريم بنت علي الشعيبية",
    age: 25,
    phone: "+968 95887766",
    email: "maryam.sh@outlook.com",
    nationality: "عمانية",
    governorate: "مسقط",
    languages: ["العربية", "الإنجليزية", "الألمانية"],
    description: "متخصصة في السياحة البيئية والشاطئية. أحب تعريف الزوار بثقافتنا كعمانيين وحسن الضيافة العمانية الأصيلة.",
    status: "approved",
    submittedAt: "2026-05-18T14:15:00Z"
  }
];

let memTickets = [
  {
    id: "ticket-1",
    guideName: "مريم بنت علي الشعيبية",
    email: "maryam.sh@outlook.com",
    subject: "طلب شارة مرشد جديدة",
    message: "مرحباً إدارة شومة الموقرة، أرغب في تقديم طلب للحصول على شارة معدنية جديدة تحمل هويتي السياحية لوضعها أثناء الرحلات القادمة.",
    status: "answered",
    reply: "مرحباً مريم، شارتك جاهزة بالفعل! يمكنك استلامها من مكتبنا الرئيسي بالقرم أو سيتم شحنها إليك مع مندوب الرحلة القادمة.",
    createdAt: "2026-05-19T10:00:00Z"
  },
  {
    id: "ticket-2",
    guideName: "حمد الحبسي",
    email: "hamadalhabsi208@gmail.com",
    subject: "مساعدة في مستندات تفعيل الحساب",
    message: "السلام عليكم، أود التأكد من تفعيل حسابي كمرشد سياحي حتى أبدأ في استقبال طلبات الرحلات بنجاح.",
    status: "open",
    createdAt: "2026-05-20T11:20:00Z"
  }
];

let memOffice = {
  name: "مكتب شومة الرئيسي للسياحة والرحلات",
  address: "سلطنة عمان - مسقط - حي القرم التجاري - بناية شومة، الطابق الأول، مكتب ١٠٤ مقابل حديقة القرم الطبيعية",
  phone: "+968 2456 7890",
  workingHours: "يومياً من السبت إلى الخميس: 9:00 صباحاً - 6:00 مساءً (الجمعة مغلق)",
  mapEmbedUrl: "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3656.9634732152014!2d58.47271031358934!3d23.6056586326177!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3e92019779df3b69%3A0xc3f587d559ab5f9d!2z2KfZhNmC2LHZhQ!5e0!3m2!1sar!2som!4v1716223800000!5m2!1sar!2som"
};

let memTrips = [
  {
    id: "trip-1",
    touristName: "جون سميث وعائلته (٤ أشخاص)",
    destination: "وادي بني خالد ورمال وهيبة",
    date: "2026-05-25",
    duration: "يوم كامل (7:00 ص - 8:00 م)",
    status: "assigned",
    price: "٨٠ ر.ع",
    notes: "الزوار مهتمون جداً بالتصوير الفوتوغرافي وتجربة المأكولات العمانية التقليدية وقت الغداء."
  },
  {
    id: "trip-2",
    touristName: "سارة لوران (شخصين)",
    destination: "جولة معالم مسقط التاريخية (جامع السلطان قابوس الأكبر - سوق مطرح - قصر العلم)",
    date: "2026-05-28",
    duration: "نصف يوم (8:00 ص - 1:00 م)",
    status: "accepted",
    price: "٤٥ ر.ع",
    notes: "تحتاج السائحة إلى شرح مفصل باللغة الإنجليزية وعن العادات والتقاليد العمانية."
  }
];

// Initialize and verify Database Schema/Tables
async function initDb() {
  try {
    const client = await pool.connect();
    console.log("🔒 Successfully connected to PostgreSQL database.");

    // Create Applications table
    await client.query(`
      CREATE TABLE IF NOT EXISTS guide_applications (
        id VARCHAR(50) PRIMARY KEY,
        name VARCHAR(150) NOT NULL,
        age INT NOT NULL,
        phone VARCHAR(50) NOT NULL,
        email VARCHAR(100) NOT NULL,
        nationality VARCHAR(100) NOT NULL,
        governorate VARCHAR(100) NOT NULL,
        languages TEXT[] NOT NULL,
        description TEXT NOT NULL,
        status VARCHAR(20) DEFAULT 'pending',
        submitted_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Create Support Tickets table
    await client.query(`
      CREATE TABLE IF NOT EXISTS support_tickets (
        id VARCHAR(50) PRIMARY KEY,
        guide_name VARCHAR(150) NOT NULL,
        email VARCHAR(100) NOT NULL,
        subject VARCHAR(255) NOT NULL,
        message TEXT NOT NULL,
        status VARCHAR(20) DEFAULT 'open',
        reply TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Create Office config table
    await client.query(`
      CREATE TABLE IF NOT EXISTS office_config (
        id VARCHAR(50) PRIMARY KEY DEFAULT 'main',
        name VARCHAR(255) NOT NULL,
        address TEXT NOT NULL,
        phone VARCHAR(50) NOT NULL,
        working_hours VARCHAR(255) NOT NULL,
        map_embed_url TEXT NOT NULL
      );
    `);

    // Create Trip Bookings table
    await client.query(`
      CREATE TABLE IF NOT EXISTS trip_bookings (
        id VARCHAR(50) PRIMARY KEY,
        tourist_name VARCHAR(150) NOT NULL,
        destination VARCHAR(255) NOT NULL,
        date VARCHAR(50) NOT NULL,
        duration VARCHAR(100) NOT NULL,
        status VARCHAR(20) DEFAULT 'assigned',
        price VARCHAR(50) NOT NULL,
        notes TEXT
      );
    `);

    // Seed Applications if empty
    const appCount = await client.query("SELECT COUNT(*) FROM guide_applications");
    if (parseInt(appCount.rows[0].count, 10) === 0) {
      console.log("Seeding initial applications into PostgreSQL...");
      for (const app of memApps) {
        await client.query(
          `INSERT INTO guide_applications (id, name, age, phone, email, nationality, governorate, languages, description, status, submitted_at) 
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)`,
          [app.id, app.name, app.age, app.phone, app.email, app.nationality, app.governorate, app.languages, app.description, app.status, app.submittedAt]
        );
      }
    }

    // Seed Support Tickets if empty
    const ticketCount = await client.query("SELECT COUNT(*) FROM support_tickets");
    if (parseInt(ticketCount.rows[0].count, 10) === 0) {
      console.log("Seeding initial support tickets into PostgreSQL...");
      for (const ticket of memTickets) {
        await client.query(
          `INSERT INTO support_tickets (id, guide_name, email, subject, message, status, reply, created_at) 
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
          [ticket.id, ticket.guideName, ticket.email, ticket.subject, ticket.message, ticket.status, ticket.reply, ticket.createdAt]
        );
      }
    }

    // Seed Office Config if empty
    const officeCount = await client.query("SELECT COUNT(*) FROM office_config");
    if (parseInt(officeCount.rows[0].count, 10) === 0) {
      console.log("Seeding default office config into PostgreSQL...");
      await client.query(
        `INSERT INTO office_config (id, name, address, phone, working_hours, map_embed_url) 
         VALUES ('main', $1, $2, $3, $4, $5)`,
        [memOffice.name, memOffice.address, memOffice.phone, memOffice.workingHours, memOffice.mapEmbedUrl]
      );
    }

    // Seed Trip bookings if empty
    const tripCount = await client.query("SELECT COUNT(*) FROM trip_bookings");
    if (parseInt(tripCount.rows[0].count, 10) === 0) {
      console.log("Seeding default trip bookings into PostgreSQL...");
      for (const trip of memTrips) {
        await client.query(
          `INSERT INTO trip_bookings (id, tourist_name, destination, date, duration, status, price, notes) 
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
          [trip.id, trip.touristName, trip.destination, trip.date, trip.duration, trip.status, trip.price, trip.notes]
        );
      }
    }

    client.release();
    console.log("🚀 Database tables bootstrapped and seeded successfully.");
  } catch (err: any) {
    console.error("⚠️ Failed to initialize PostgreSQL database. Falling back to secure in-memory data store. Error:", err.message);
    useMemoryFallback = true;
  }
}

initDb();

// --- 1. GUIDE APPLICATIONS REST ENDPOINTS ---

app.get("/api/applications", async (req, res) => {
  if (useMemoryFallback) {
    return res.json(memApps);
  }
  try {
    const result = await pool.query("SELECT * FROM guide_applications ORDER BY submitted_at DESC");
    const apps = result.rows.map(row => ({
      id: row.id,
      name: row.name,
      age: row.age,
      phone: row.phone,
      email: row.email,
      nationality: row.nationality,
      governorate: row.governorate,
      languages: row.languages,
      description: row.description,
      status: row.status,
      submittedAt: row.submitted_at
    }));
    res.json(apps);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.post("/api/applications", async (req, res) => {
  const { name, age, phone, email, nationality, governorate, languages, description } = req.body;
  const id = "app-" + Date.now();
  const submittedAt = new Date().toISOString();
  const status = "pending";

  if (useMemoryFallback) {
    const newApp = { id, name, age, phone, email, nationality, governorate, languages, description, status, submittedAt };
    memApps = [newApp, ...memApps];
    return res.json(newApp);
  }

  try {
    await pool.query(
      `INSERT INTO guide_applications (id, name, age, phone, email, nationality, governorate, languages, description, status, submitted_at) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)`,
      [id, name, age, phone, email, nationality, governorate, languages, description, status, submittedAt]
    );
    res.json({ id, name, age, phone, email, nationality, governorate, languages, description, status, submittedAt });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.put("/api/applications/:id", async (req, res) => {
  const { id } = req.params;
  const { status } = req.body; // 'approved' | 'rejected'

  if (useMemoryFallback) {
    memApps = memApps.map(app => app.id === id ? { ...app, status } : app);
    const updated = memApps.find(app => app.id === id);
    return res.json(updated);
  }

  try {
    const result = await pool.query(
      "UPDATE guide_applications SET status = $1 WHERE id = $2 RETURNING *",
      [status, id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Application not found" });
    }
    const row = result.rows[0];
    res.json({
      id: row.id,
      name: row.name,
      age: row.age,
      phone: row.phone,
      email: row.email,
      nationality: row.nationality,
      governorate: row.governorate,
      languages: row.languages,
      description: row.description,
      status: row.status,
      submittedAt: row.submitted_at
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.delete("/api/applications/:id", async (req, res) => {
  const { id } = req.params;

  if (useMemoryFallback) {
    memApps = memApps.filter(app => app.id !== id);
    return res.json({ success: true });
  }

  try {
    const result = await pool.query("DELETE FROM guide_applications WHERE id = $1 RETURNING *", [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Application not found" });
    }
    res.json({ success: true, deleted: result.rows[0] });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// --- 2. OFFICE CONFIGURATION REST ENDPOINTS ---

app.get("/api/office", async (req, res) => {
  if (useMemoryFallback) {
    return res.json(memOffice);
  }
  try {
    const result = await pool.query("SELECT * FROM office_config WHERE id = 'main'");
    if (result.rows.length === 0) {
      return res.json(memOffice);
    }
    const row = result.rows[0];
    res.json({
      name: row.name,
      address: row.address,
      phone: row.phone,
      workingHours: row.working_hours,
      mapEmbedUrl: row.map_embed_url
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.post("/api/office", async (req, res) => {
  const { name, address, phone, workingHours, mapEmbedUrl } = req.body;

  if (useMemoryFallback) {
    memOffice = { name, address, phone, workingHours, mapEmbedUrl };
    return res.json(memOffice);
  }

  try {
    const result = await pool.query(
      `INSERT INTO office_config (id, name, address, phone, working_hours, map_embed_url) 
       VALUES ('main', $1, $2, $3, $4, $5)
       ON CONFLICT (id) 
       DO UPDATE SET name = $1, address = $2, phone = $3, working_hours = $4, map_embed_url = $5
       RETURNING *`,
      [name, address, phone, workingHours, mapEmbedUrl]
    );
    const row = result.rows[0];
    res.json({
      name: row.name,
      address: row.address,
      phone: row.phone,
      workingHours: row.working_hours,
      mapEmbedUrl: row.map_embed_url
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// --- 3. TRIP BOOKINGS REST ENDPOINTS ---

app.get("/api/trips", async (req, res) => {
  if (useMemoryFallback) {
    return res.json(memTrips);
  }
  try {
    const result = await pool.query("SELECT * FROM trip_bookings ORDER BY date DESC");
    const trips = result.rows.map(row => ({
      id: row.id,
      touristName: row.tourist_name,
      destination: row.destination,
      date: row.date,
      duration: row.duration,
      status: row.status,
      price: row.price,
      notes: row.notes
    }));
    res.json(trips);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.post("/api/trips", async (req, res) => {
  const { touristName, destination, date, duration, price, notes } = req.body;
  const id = "trip-" + Date.now();
  const status = "assigned";

  if (useMemoryFallback) {
    const newTrip = { id, touristName, destination, date, duration, status, price, notes };
    memTrips = [newTrip, ...memTrips];
    return res.json(newTrip);
  }

  try {
    await pool.query(
      `INSERT INTO trip_bookings (id, tourist_name, destination, date, duration, status, price, notes) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
      [id, touristName, destination, date, duration, status, price, notes]
    );
    res.json({ id, touristName, destination, date, duration, status, price, notes });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.put("/api/trips/:id", async (req, res) => {
  const { id } = req.params;
  const { status } = req.body; // 'assigned' | 'accepted' | 'declined' | 'completed'

  if (useMemoryFallback) {
    memTrips = memTrips.map(trip => trip.id === id ? { ...trip, status } : trip);
    const updated = memTrips.find(trip => trip.id === id);
    return res.json(updated);
  }

  try {
    const result = await pool.query(
      "UPDATE trip_bookings SET status = $1 WHERE id = $2 RETURNING *",
      [status, id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Trip booking not found" });
    }
    const row = result.rows[0];
    res.json({
      id: row.id,
      touristName: row.tourist_name,
      destination: row.destination,
      date: row.date,
      duration: row.duration,
      status: row.status,
      price: row.price,
      notes: row.notes
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.delete("/api/trips/:id", async (req, res) => {
  const { id } = req.params;

  if (useMemoryFallback) {
    memTrips = memTrips.filter(trip => trip.id !== id);
    return res.json({ success: true });
  }

  try {
    const result = await pool.query("DELETE FROM trip_bookings WHERE id = $1 RETURNING *", [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Trip booking not found" });
    }
    res.json({ success: true, deleted: result.rows[0] });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// --- 4. SUPPORT TICKETS REST ENDPOINTS ---

app.get("/api/tickets", async (req, res) => {
  if (useMemoryFallback) {
    return res.json(memTickets);
  }
  try {
    const result = await pool.query("SELECT * FROM support_tickets ORDER BY created_at DESC");
    const tickets = result.rows.map(row => ({
      id: row.id,
      guideName: row.guide_name,
      email: row.email,
      subject: row.subject,
      message: row.message,
      status: row.status,
      reply: row.reply,
      createdAt: row.created_at
    }));
    res.json(tickets);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.post("/api/tickets", async (req, res) => {
  const { guideName, email, subject, message } = req.body;
  const id = "ticket-" + Date.now();
  const status = "open";
  const createdAt = new Date().toISOString();

  if (useMemoryFallback) {
    const newTicket = { id, guideName, email, subject, message, status, createdAt };
    memTickets = [newTicket, ...memTickets];
    return res.json(newTicket);
  }

  try {
    await pool.query(
      `INSERT INTO support_tickets (id, guide_name, email, subject, message, status, created_at) 
       VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      [id, guideName, email, subject, message, status, createdAt]
    );
    res.json({ id, guideName, email, subject, message, status, createdAt });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

app.put("/api/tickets/:id", async (req, res) => {
  const { id } = req.params;
  const { status, reply } = req.body;

  if (useMemoryFallback) {
    memTickets = memTickets.map(ticket => ticket.id === id ? { ...ticket, status, reply } : ticket);
    const updated = memTickets.find(ticket => ticket.id === id);
    return res.json(updated);
  }

  try {
    const result = await pool.query(
      "UPDATE support_tickets SET status = $1, reply = $2 WHERE id = $3 RETURNING *",
      [status, reply, id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Support ticket not found" });
    }
    const row = result.rows[0];
    res.json({
      id: row.id,
      guideName: row.guide_name,
      email: row.email,
      subject: row.subject,
      message: row.message,
      status: row.status,
      reply: row.reply,
      createdAt: row.created_at
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// --- VITE MIDDLEWARE SETUP ---

async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa"
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
