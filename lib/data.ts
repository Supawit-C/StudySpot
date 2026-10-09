// data access ฝั่ง server เท่านั้น — key และ query ไม่หลุดไปที่ browser
import "server-only";
import { cache } from "react";
import { publicClient } from "./supabase/public";
import { createClient } from "./supabase/server";
import type { Space } from "./spaces";
import type { Booking } from "./types";

// ข้อมูลห้องเป็นข้อมูลสาธารณะ ใช้ client ที่ไม่มี cookie เพื่อให้หน้าเรียกใช้เป็น SSG/ISR ได้
export const getSpaces = cache(async (): Promise<Space[]> => {
  const { data, error } = await publicClient().from("spaces").select("*").order("name");
  if (error) throw error;
  return data;
});

export const getSpace = cache(async (id: string): Promise<Space | null> => {
  const { data, error } = await publicClient().from("spaces").select("*").eq("id", id).maybeSingle();
  if (error) throw error;
  return data;
});

export async function getBookedSlots(spaceId: string, date: string): Promise<string[]> {
  const { data, error } = await publicClient().rpc("get_booked_slots", { p_space_id: spaceId, p_date: date });
  if (error) throw error;
  return data ?? [];
}

export async function getCurrentUser() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  return { id: user.id, email: user.email ?? "", name: (user.user_metadata.name as string | undefined) ?? user.email?.split("@")[0] ?? "" };
}

// RLS ใน Supabase กรองให้เหลือเฉพาะการจองของผู้ใช้ที่ login อยู่
export async function getMyBookings(): Promise<Booking[]> {
  const supabase = await createClient();
  const { data, error } = await supabase.from("bookings").select("id, space_id, date, slots, note, created_at").order("date").order("slots");
  if (error) throw error;
  return data;
}
