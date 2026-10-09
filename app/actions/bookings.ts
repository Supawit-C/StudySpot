"use server";
// Server Action: mutation ของการจอง ทำบน server เพราะต้องตรวจ session และเขียนข้อมูล
// โดยไม่เปิดให้ browser แก้ข้อมูลตรง ๆ — ใน Supabase มี RLS + trigger เป็นด่านสุดท้ายอีกชั้น
// โหมดเดโมเขียนลง httpOnly cookie แทนฐานข้อมูล แต่ validate และตรวจเงื่อนไขเหมือนกันทุกอย่าง
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { hasSupabase } from "@/lib/mode";
import { getSpace } from "@/lib/data";
import { DEMO_MAX_BOOKINGS, readDemoBookings, readDemoUser, writeDemoBookings } from "@/lib/demo-store";
import { createClient } from "@/lib/supabase/server";
import { bookingSchema, type BookingInput } from "@/lib/schemas";

export type ActionResult = { error: string } | undefined;

const SLOT_TAKEN = "บางช่วงเวลาเพิ่งถูกจองไป กรุณาเลือกใหม่";

export async function createBooking(input: BookingInput): Promise<ActionResult> {
  const parsed = bookingSchema.safeParse(input);
  if (!parsed.success) return { error: parsed.error.issues[0].message };
  const { spaceId, date, slots, note } = parsed.data;
  const sortedSlots: string[] = [...slots].sort();
  // input มาจาก client ได้ทุกค่า ต้องตรวจว่าห้องมีอยู่จริง
  if (!(await getSpace(spaceId))) return { error: "ไม่พบพื้นที่นี้" };

  if (hasSupabase) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { error: "กรุณาเข้าสู่ระบบก่อนจอง" };
    const { error } = await supabase.from("bookings").insert({ space_id: spaceId, date, slots: sortedSlots, note, user_id: user.id });
    if (error) return { error: error.message.includes("SLOT_TAKEN") ? SLOT_TAKEN : "จองไม่สำเร็จ กรุณาลองอีกครั้ง" };
  } else {
    const user = await readDemoUser();
    if (!user) return { error: "กรุณาเข้าสู่ระบบก่อนจอง" };
    const bookings = await readDemoBookings();
    if (bookings.some(booking => booking.space_id === spaceId && booking.date === date && booking.slots.some(slot => sortedSlots.includes(slot)))) return { error: SLOT_TAKEN };
    if (bookings.length >= DEMO_MAX_BOOKINGS) return { error: `โหมดเดโมเก็บการจองได้สูงสุด ${DEMO_MAX_BOOKINGS} รายการ กรุณายกเลิกรายการเก่าก่อน` };
    await writeDemoBookings([...bookings, { id: crypto.randomUUID(), user_id: user.id, space_id: spaceId, date, slots: sortedSlots, note, created_at: new Date().toISOString() }]);
  }

  revalidatePath("/my-bookings");
  redirect("/my-bookings?created=1");
}

export async function cancelBooking(id: string): Promise<ActionResult> {
  if (hasSupabase) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { error: "กรุณาเข้าสู่ระบบ" };
    // RLS อนุญาตให้ลบเฉพาะแถวของตัวเอง ถ้า count = 0 แปลว่าไม่ใช่ของผู้ใช้คนนี้หรือไม่มีอยู่แล้ว
    const { error, count } = await supabase.from("bookings").delete({ count: "exact" }).eq("id", id).eq("user_id", user.id);
    if (error || !count) return { error: "ยกเลิกไม่สำเร็จ" };
  } else {
    const user = await readDemoUser();
    if (!user) return { error: "กรุณาเข้าสู่ระบบ" };
    const bookings = await readDemoBookings();
    const remaining = bookings.filter(booking => !(booking.id === id && booking.user_id === user.id));
    if (remaining.length === bookings.length) return { error: "ยกเลิกไม่สำเร็จ" };
    await writeDemoBookings(remaining);
  }

  revalidatePath("/my-bookings");
}
