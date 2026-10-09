// Route Handler: คืนข้อมูลผู้ใช้ที่ login อยู่ให้ AuthContext ฝั่ง client
// อ่าน session จาก cookie บน server ได้ทั้งโหมด Supabase และโหมดเดโม (cookie เป็น httpOnly, JS อ่านตรงไม่ได้)
import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/data";

export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json({ user: await getCurrentUser() }, { headers: { "Cache-Control": "private, no-store" } });
}
