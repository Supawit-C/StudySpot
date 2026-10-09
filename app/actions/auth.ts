"use server";
// Server Action: สมัคร/เข้าสู่ระบบ/ออกจากระบบ บน server แล้วตั้ง session cookie
// Supabase: ตรวจรหัสผ่านจริงด้วย Supabase Auth
// โหมดเดโม: ไม่มีฐานข้อมูลผู้ใช้ จึงรับทุกอีเมล/รหัสผ่านที่ผ่าน zod แล้วเก็บผู้ใช้ใน httpOnly cookie
import { hasSupabase } from "@/lib/mode";
import { writeDemoUser } from "@/lib/demo-store";
import { createClient } from "@/lib/supabase/server";
import { loginSchema, registerSchema, type LoginInput, type RegisterInput } from "@/lib/schemas";

export type AuthResult = { error?: string; needsConfirm?: boolean };

// id ผูกกับอีเมล เพื่อให้ login อีเมลเดิมแล้วเห็นการจองเดิม
const demoUser = (email: string, name?: string) => ({ id: `demo:${email.toLowerCase()}`, email, name: name ?? email.split("@")[0] });

export async function signIn(input: LoginInput): Promise<AuthResult> {
  const parsed = loginSchema.safeParse(input);
  if (!parsed.success) return { error: parsed.error.issues[0].message };
  if (!hasSupabase) { await writeDemoUser(demoUser(parsed.data.email)); return {}; }
  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword(parsed.data);
  return error ? { error: "อีเมลหรือรหัสผ่านไม่ถูกต้อง" } : {};
}

export async function signUp(input: RegisterInput): Promise<AuthResult> {
  const parsed = registerSchema.safeParse(input);
  if (!parsed.success) return { error: parsed.error.issues[0].message };
  const { name, email, password } = parsed.data;
  if (!hasSupabase) { await writeDemoUser(demoUser(email, name)); return {}; }
  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp({ email, password, options: { data: { name } } });
  if (error) return { error: error.code === "user_already_exists" ? "อีเมลนี้มีบัญชีอยู่แล้ว" : "สมัครสมาชิกไม่สำเร็จ กรุณาลองอีกครั้ง" };
  // ถ้าเปิด "Confirm email" ใน Supabase จะยังไม่มี session จนกว่าผู้ใช้กดยืนยันในอีเมล
  return data.session ? {} : { needsConfirm: true };
}

export async function signOut() {
  if (!hasSupabase) return writeDemoUser(null);
  const supabase = await createClient();
  await supabase.auth.signOut();
}
