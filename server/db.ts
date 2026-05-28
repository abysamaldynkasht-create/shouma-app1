import { Pool, types } from 'pg';
import { drizzle } from 'drizzle-orm/node-postgres';
import * as schema from '../shared/schema';
import 'dotenv/config';

// 1. قراءة المتغير وتأكيد نوعه لـ TypeScript لمنع أي خطأ بناء مستقبلي
const connectionString = process.env.DATABASE_URL as string;

// 2. التحقق من وجود الرابط قبل بدء الاتصال
if (!connectionString) {
  throw new Error("DATABASE_URL is not set inside the environment.");
}

// 3. تحويل البيانات الرقمية بشكل صحيح
types.setTypeParser(1700, (val) => parseFloat(val));

// 4. إنشاء الـ Pool وتمرير الرابط النظيف مباشرة (منفذ 6543) مع الـ SSL
export const pool = new Pool({
  connectionString: connectionString,
  ssl: {
    rejectUnauthorized: false, // ضروري جداً لقواعد بيانات Supabase الخارجية
  },
});

// 5. ربط Drizzle ORM بالسكيما الخاصة بتطبيق Shouma
export const db = drizzle(pool, { schema });
