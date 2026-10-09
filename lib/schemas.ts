// zod schema ชุดเดียวใช้ทั้งฝั่ง client (react-hook-form) และฝั่ง server (Server Action)
// client ตรวจเพื่อ UX ที่เร็ว, server ตรวจซ้ำเพราะ request อาจไม่ได้มาจากฟอร์มของเรา
import { z } from "zod";
import { MAX_SLOTS, SLOTS, today } from "./spaces";

export const loginSchema = z.object({
  email: z.email("กรุณากรอกอีเมลให้ถูกต้อง"),
  password: z.string().min(6, "รหัสผ่านอย่างน้อย 6 ตัวอักษร"),
});

export const registerSchema = loginSchema.extend({
  name: z.string().trim().min(2, "กรุณากรอกชื่ออย่างน้อย 2 ตัวอักษร").max(50, "ชื่อยาวเกิน 50 ตัวอักษร"),
});

export const bookingSchema = z.object({
  spaceId: z.string().min(1),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "รูปแบบวันที่ไม่ถูกต้อง").refine(value => value >= today(), "เลือกวันที่ตั้งแต่วันนี้เป็นต้นไป"),
  slots: z.array(z.enum(SLOTS))
    .min(1, "เลือกช่วงเวลาอย่างน้อย 1 ช่วง")
    .max(MAX_SLOTS, `เลือกได้ไม่เกิน ${MAX_SLOTS} ชั่วโมง`)
    .refine(slots => new Set(slots).size === slots.length, "มีช่วงเวลาซ้ำกัน"),
  note: z.string().trim().max(200, "หมายเหตุไม่เกิน 200 ตัวอักษร"),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
export type BookingInput = z.infer<typeof bookingSchema>;
