// โหมดเดโม: ถ้ายังไม่ได้ใส่ env ของ Supabase จะใช้ข้อมูลตัวอย่าง + cookie แทนฐานข้อมูล
// ใส่ NEXT_PUBLIC_SUPABASE_URL และ NEXT_PUBLIC_SUPABASE_ANON_KEY เมื่อไหร่ ระบบจะสลับไปใช้ Supabase เอง
export const hasSupabase = Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
