// Server Component + SSR (force-dynamic): ทุก request ดึง session และช่วงเวลาที่ถูกจองล่าสุดจาก Supabase
// เหตุผล: ข้อมูลการจองเปลี่ยนตลอดเวลาและต้องสดเสมอ ถ้า cache (SSG/ISR) ผู้ใช้อาจเห็นช่วงที่ถูกจองไปแล้วว่าว่าง
// ตรวจ login บน server แล้ว redirect ไปหน้า login ก่อนส่ง HTML จึงไม่มีจังหวะที่หน้าจองโผล่มาแล้วเด้งออก
import { notFound, redirect } from "next/navigation";
import { getBookedSlots, getCurrentUser, getSpace } from "@/lib/data";
import { today } from "@/lib/spaces";
import { BookingForm } from "@/components/booking-form";

export const dynamic = "force-dynamic";

export default async function BookPage({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ date?: string }> }) {
  const [{ id }, query] = await Promise.all([params, searchParams]);
  const user = await getCurrentUser();
  if (!user) redirect(`/login?next=${encodeURIComponent(`/book/${id}`)}`);
  const space = await getSpace(id); if (!space) notFound();
  const date = query.date && /^\d{4}-\d{2}-\d{2}$/.test(query.date) && query.date >= today() ? query.date : today();
  const booked = await getBookedSlots(space.id, date);
  // key={date} ให้ฟอร์ม reset ช่วงเวลาที่เลือกไว้เมื่อเปลี่ยนวัน
  return <BookingForm key={date} space={space} date={date} booked={booked} />;
}
