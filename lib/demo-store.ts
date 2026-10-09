// ที่เก็บข้อมูลของโหมดเดโม: เก็บผู้ใช้และการจองใน httpOnly cookie ฝั่ง server
// อ่าน/เขียนได้เฉพาะใน Server Component, Server Action และ Route Handler — JS บน browser แตะไม่ได้
// ข้อจำกัด: การจองเห็นเฉพาะในเบราว์เซอร์ของตัวเอง จึงกันจองซ้อนกับผู้ใช้คนอื่นไม่ได้ (ของจริงใช้ Supabase)
import "server-only";
import { cookies } from "next/headers";
import { z } from "zod";
import type { Booking, User } from "./types";

export type DemoBooking = Booking & { user_id: string };

const USER_COOKIE = "studyspot-demo-user";
const BOOKINGS_COOKIE = "studyspot-demo-bookings";
// cookie หนึ่งตัวจุได้ราว 4KB จึงจำกัดจำนวนการจองที่เก็บไว้
export const DEMO_MAX_BOOKINGS = 15;
const options = { httpOnly: true, sameSite: "lax" as const, secure: process.env.NODE_ENV === "production", path: "/", maxAge: 60 * 60 * 24 * 30 };

// ค่าใน cookie แก้ไขได้จากฝั่งผู้ใช้ จึง validate ทุกครั้งที่อ่าน
const userSchema = z.object({ id: z.string(), name: z.string(), email: z.string() });
const bookingsSchema = z.array(z.object({ id: z.string(), user_id: z.string(), space_id: z.string(), date: z.string(), slots: z.array(z.string()), note: z.string(), created_at: z.string() }));

const read = async <T,>(name: string, schema: z.ZodType<T>, fallback: T): Promise<T> => {
  const raw = (await cookies()).get(name)?.value;
  if (!raw) return fallback;
  try { const parsed = schema.safeParse(JSON.parse(raw)); return parsed.success ? parsed.data : fallback; } catch { return fallback; }
};

export const readDemoUser = () => read<User | null>(USER_COOKIE, userSchema.nullable(), null);
export const readDemoBookings = () => read<DemoBooking[]>(BOOKINGS_COOKIE, bookingsSchema, []);

export async function writeDemoUser(user: User | null) {
  const store = await cookies();
  if (user) store.set(USER_COOKIE, JSON.stringify(user), options); else store.delete(USER_COOKIE);
}

export async function writeDemoBookings(bookings: DemoBooking[]) {
  (await cookies()).set(BOOKINGS_COOKIE, JSON.stringify(bookings), options);
}
