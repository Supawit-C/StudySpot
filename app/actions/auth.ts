"use server";
// Server Action: สมัคร/เข้าสู่ระบบ/ออกจากระบบ ผ่าน Supabase Auth บน server
// รหัสผ่านถูกส่งไปตรวจที่ server แล้ว Supabase ตั้ง session cookie ให้
import { createClient } from "@/lib/supabase/server";
import { loginSchema, registerSchema, type LoginInput, type RegisterInput } from "@/lib/schemas";

export type AuthResult = { error?: string; needsConfirm?: boolean };

export async function signIn(input: LoginInput): Promise<AuthResult> {
  const parsed = loginSchema.safeParse(input);
  if (!parsed.success) return { error: parsed.error.issues[0].message };
  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword(parsed.data);
  return error ? { error: "อีเมลหรือรหัสผ่านไม่ถูกต้อง" } : {};
}

export async function signUp(input: RegisterInput): Promise<AuthResult> {
  const parsed = registerSchema.safeParse(input);
  if (!parsed.success) return { error: parsed.error.issues[0].message };
  const { name, email, password } = parsed.data;
  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp({ email, password, options: { data: { name } } });
  if (error) return { error: error.code === "user_already_exists" ? "อีเมลนี้มีบัญชีอยู่แล้ว" : "สมัครสมาชิกไม่สำเร็จ กรุณาลองอีกครั้ง" };
  // ถ้าเปิด "Confirm email" ใน Supabase จะยังไม่มี session จนกว่าผู้ใช้กดยืนยันในอีเมล
  return data.session ? {} : { needsConfirm: true };
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
}
