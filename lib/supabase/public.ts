// client แบบไม่มี session/cookie สำหรับอ่านข้อมูลสาธารณะ (ตาราง spaces)
// ไม่แตะ cookies() จึงใช้ได้ในหน้าที่เป็น SSG/ISR โดยไม่ถูกบังคับให้เป็น dynamic
import "server-only";
import { createClient } from "@supabase/supabase-js";

export const publicClient = () =>
  createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, { auth: { persistSession: false } });
