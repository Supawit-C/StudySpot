// ใช้เฉพาะฝั่ง server (Server Component / Server Action) — อ่าน session จาก cookie ของ request
// การเรียก cookies() ทำให้หน้าที่ใช้ client นี้เป็น dynamic (SSR) อัตโนมัติ
import "server-only";
import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";

export async function createClient() {
  const cookieStore = await cookies();
  return createServerClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, {
    cookies: {
      getAll: () => cookieStore.getAll(),
      setAll: cookiesToSet => {
        // Server Component เขียน cookie ไม่ได้ — ปล่อยให้ middleware เป็นคน refresh session แทน
        try { cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options)); } catch {}
      },
    },
  });
}
