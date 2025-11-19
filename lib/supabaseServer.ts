// lib/supabaseServer.ts

import { createClient as createSupabaseClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl) {
  throw new Error("NEXT_PUBLIC_SUPABASE_URL is not set");
}

if (!serviceRoleKey) {
  throw new Error("SUPABASE_SERVICE_ROLE_KEY is not set");
}

/**
 * هذا الكلاينت مخصص للاستخدام في:
 * - Route Handlers تحت app/api
 * - أي كود سيرفر فقط
 *
 * ⚠️ ممنوع استخدامه في Components تشتغل على المتصفح،
 * لأنه يستخدم service_role (صلاحيات كاملة).
 */
export const supabaseServer = createSupabaseClient(
  supabaseUrl,
  serviceRoleKey,
  {
    auth: {
      persistSession: false,
    },
  }
);

/**
 * دالة ترجع نفس الكلاينت، عشان تقدر تستخدم:
 * import { createClient } from "@/lib/supabaseServer";
 */
export function createClient() {
  return supabaseServer;
}
