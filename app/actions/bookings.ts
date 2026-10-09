"use server";
// Server Action: mutation ของการจอง ทำบน server เพราะต้องตรวจ session และเขียนฐานข้อมูล
// โดยไม่เปิดให้ browser แก้ข้อมูลตรง ๆ — RLS + trigger ใน Supabase เป็นด่านสุดท้ายอีกชั้น
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { bookingSchema, type BookingInput } from "@/lib/schemas";

export type ActionResult = { error: string } | undefined;

export async function createBooking(input: BookingInput): Promise<ActionResult> {
  const parsed = bookingSchema.safeParse(input);
  if (!parsed.success) return { error: parsed.error.issues[0].message };

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "กรุณาเข้าสู่ระบบก่อนจอง" };

  const { spaceId, date, slots, note } = parsed.data;
  const { error } = await supabase.from("bookings").insert({ space_id: spaceId, date, slots: [...slots].sort(), note, user_id: user.id });
  if (error) return { error: error.message.includes("SLOT_TAKEN") ? "บางช่วงเวลาเพิ่งถูกจองไป กรุณาเลือกใหม่" : "จองไม่สำเร็จ กรุณาลองอีกครั้ง" };

  revalidatePath("/my-bookings");
  redirect("/my-bookings?created=1");
}

export async function cancelBooking(id: string): Promise<ActionResult> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "กรุณาเข้าสู่ระบบ" };

  // RLS อนุญาตให้ลบเฉพาะแถวของตัวเอง ถ้า count = 0 แปลว่าไม่ใช่ของผู้ใช้คนนี้หรือไม่มีอยู่แล้ว
  const { error, count } = await supabase.from("bookings").delete({ count: "exact" }).eq("id", id).eq("user_id", user.id);
  if (error || !count) return { error: "ยกเลิกไม่สำเร็จ" };

  revalidatePath("/my-bookings");
}
