// Server Component + ISR: ดึงรายการห้องทั้งหมดจาก Supabase แล้ว cache เป็น static HTML, regenerate ทุก 1 ชั่วโมง
// เหตุผล: ข้อมูลห้องเปลี่ยนไม่บ่อยและเหมือนกันสำหรับทุกคน — ไม่จำเป็นต้อง query DB ทุก request
// ไม่อ่าน searchParams บน server (ถ้าอ่านหน้าจะกลายเป็น dynamic ทันที) แต่ให้ SpaceFilters (client) กรองจาก URL แทน
import { Suspense } from "react";
import { getSpaces } from "@/lib/data";
import { SpaceFilters } from "@/components/space-filters";

export const revalidate = 3600;

export default async function SpacesPage() {
  const spaces = await getSpaces();
  return <main className="page"><div className="container"><span className="eyebrow">Explore spaces</span><h1 className="page-title">หาพื้นที่ที่พอดีกับคุณ</h1><p className="page-intro">เช็กห้องว่าง อุปกรณ์ และจำนวนที่นั่ง ก่อนออกไปทำงาน</p><Suspense fallback={<div className="empty">กำลังโหลดตัวกรอง…</div>}><SpaceFilters spaces={spaces} /></Suspense></div></main>;
}
