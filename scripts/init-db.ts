import { pool, db } from "../server/db";
import { initDatabaseTables } from "../server/db-init";
import dotenv from "dotenv";

dotenv.config({ override: true });

async function main() {
  console.log("==========================================");
  console.log("🚀 جاري اختبار والاتصال بقاعدة البيانات الجديدة...");
  console.log("==========================================");
  
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    console.error("❌ خطأ: لم يتم العثور على DATABASE_URL في المتغيرات البيئية أو ملف .env");
    process.exit(1);
  }

  // Mask password for display
  const masked = connectionString.replace(/:([^:@]+)@/, ":****@");
  console.log(`🔗 رابط الاتصال: ${masked}`);

  if (connectionString.includes(".railway.internal")) {
    console.warn("\n⚠️ تنبيه هام حول Railway:");
    console.warn("النطاق 'postgres-jpdb.railway.internal' هو نطاق شبكة داخلية (Private Network) يعمل فقط داخل خوادم Railway نفسها.");
    console.warn("للاتصال من خارج Railway (مثل هذا التطبيق على السحابة)، تحتاج إلى تفعيل Public Networking في Railway واستخدام الرابط العام (Public URL) مثل:");
    console.warn("postgresql://postgres:PASSWORD@roundhouse.proxy.rlwy.net:PORT/railway\n");
  }

  try {
    console.log("⏳ محاولة الاتصال بالخادم...");
    const client = await pool.connect();
    console.log("✅ تم الاتصال بنجاح بقاعدة البيانات!");
    
    const versionRes = await client.query("SELECT version();");
    console.log("📌 إصدار PostgreSQL:", versionRes.rows[0]?.version);
    client.release();

    console.log("\n⏳ جاري إنشاء وتهيئة جميع الجداول والبيانات الافتراضية...");
    await initDatabaseTables();

    console.log("\n🎉 اكتملت تهيئة قاعدة البيانات وإنشاء كافة الجداول والحسابات الافتراضية بنجاح!");
  } catch (err: any) {
    console.error("\n❌ فشل الاتصال بقاعدة البيانات:");
    console.error(`- الكود: ${err.code}`);
    console.error(`- الرسالة: ${err.message}`);
    
    if (err.code === "ENOTFOUND" || err.code === "EAI_AGAIN") {
      console.error("\nسبب المشكلة:");
      console.error("اسم المضيف (Host) غير موجود على شبكة الإنترنت العامة لأنه عنوان داخلي خاص بريلواي (.railway.internal).");
      console.error("يرجى تزويدنا برابط الاتصال العام (Public URL / TCP Proxy) من لوحة تحكم Railway:");
      console.error("Railway Dashboard -> PostgreSQL Service -> Settings -> Public Networking -> TCP Proxy (Connect Tab).");
    }
  } finally {
    await pool.end();
  }
}

main().catch(console.error);
