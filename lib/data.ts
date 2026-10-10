// data access ฝั่ง server เท่านั้น — key และ query ไม่หลุดไปที่ browser
// ทุกฟังก์ชันมี 2 ทาง: Supabase (เมื่อตั้งค่า env แล้ว) หรือโหมดเดโม (ข้อมูลตัวอย่าง + cookie)
import "server-only";
import { cache } from "react";
import { hasSupabase } from "./mode";
import { seedSpaces } from "./seed";
import { readDemoBookings, readDemoUser } from "./demo-store";
import { publicClient } from "./supabase/public";
import { createClient } from "./supabase/server";
import type { Space } from "./spaces";
import type { Booking, User } from "./types";

// ข้อมูลห้องเป็นข้อมูลสาธารณะ ใช้ client ที่ไม่มี cookie เพื่อให้หน้าเรียกใช้เป็น SSG/ISR ได้
export const getSpaces = cache(async (): Promise<Space[]> => {
  if (!hasSupabase) return [...seedSpaces].sort((a, b) => a.name.localeCompare(b.name));
  const { data, error } = await publicClient().from("spaces").select("*").order("name");
  if (error) throw error;
  return data;
});

export const getSpace = cache(async (id: string): Promise<Space | null> => {
  if (!hasSupabase) return seedSpaces.find(space => space.id === id) ?? null;
  const { data, error } = await publicClient().from("spaces").select("*").eq("id", id).maybeSingle();
  if (error) throw error;
  return data;
});

export async function getBookedSlots(spaceId: string, date: string): Promise<string[]> {
  if (!hasSupabase) return (await readDemoBookings()).filter(booking => booking.space_id === spaceId && booking.date === date).flatMap(booking => booking.slots);
  const { data, error } = await publicClient().rpc("get_booked_slots", { p_space_id: spaceId, p_date: date });
  if (error) throw error;
  return data ?? [];
}

export async function getCurrentUser(): Promise<User | null> {
  if (!hasSupabase) return readDemoUser();
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  return { id: user.id, email: user.email ?? "", name: (user.user_metadata.name as string | undefined) ?? user.email?.split("@")[0] ?? "" };
}

// RLS ใน Supabase กรองให้เหลือเฉพาะการจองของผู้ใช้ที่ login อยู่
export async function getMyBookings(): Promise<Booking[]> {
  if (!hasSupabase) {
    const user = await readDemoUser(); if (!user) return [];
    return (await readDemoBookings()).filter(booking => booking.user_id === user.id).sort((a, b) => `${a.date}${a.slots[0]}`.localeCompare(`${b.date}${b.slots[0]}`));
  }
  const supabase = await createClient();
  const { data, error } = await supabase.from("bookings").select("id, space_id, date, slots, note, created_at").order("date").order("slots");
  if (error) throw error;
  return data;
}

// RLS กรองให้เหลือเฉพาะรายการโปรดของผู้ใช้ใน session ปัจจุบัน
export async function getMyFavoriteSpaceIds(): Promise<string[]> {
  if (!hasSupabase) return [];
  const supabase = await createClient();
  const { data, error } = await supabase.from("favorites").select("space_id").order("created_at", { ascending: false });
  if (error) throw error;
  return data.map(favorite => favorite.space_id);
}
