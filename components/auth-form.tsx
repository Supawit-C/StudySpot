"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useAuth } from "./providers";

const loginSchema = z.object({ email: z.string().email("กรุณากรอกอีเมลให้ถูกต้อง"), password: z.string().min(6, "รหัสผ่านอย่างน้อย 6 ตัวอักษร") });
const registerSchema = loginSchema.extend({ name: z.string().min(2, "กรุณากรอกชื่ออย่างน้อย 2 ตัวอักษร") });
type LoginInput = z.infer<typeof loginSchema>; type RegisterInput = z.infer<typeof registerSchema>;

export function AuthForm({ mode }: { mode: "login" | "register" }) {
  const isRegister = mode === "register"; const router = useRouter(); const { login } = useAuth();
  const form = useForm<RegisterInput>({ resolver: zodResolver(isRegister ? registerSchema : loginSchema) as never, defaultValues: { name: "", email: "", password: "" } });
  const onSubmit = (data: RegisterInput) => { login({ name: data.name || data.email.split("@")[0], email: data.email }); router.push("/spaces"); };
  return <main className="auth-wrap"><section className="auth-card"><span className="eyebrow">StudySpot account</span><h1>{isRegister ? "เริ่มต้นใช้งาน" : "ยินดีต้อนรับกลับ"}</h1><p>{isRegister ? "สร้างบัญชีเพื่อจองพื้นที่และจัดการการจองของคุณ" : "เข้าสู่ระบบเพื่อจองพื้นที่อ่านหนังสือ"}</p><form onSubmit={form.handleSubmit(onSubmit)} noValidate>{isRegister && <div className="form-row"><label htmlFor="name">ชื่อที่แสดง</label><input id="name" placeholder="เช่น อรอนงค์ ใจดี" {...form.register("name")} />{form.formState.errors.name && <span className="error">{form.formState.errors.name.message}</span>}</div>}<div className="form-row"><label htmlFor="email">อีเมลมหาวิทยาลัย</label><input id="email" type="email" placeholder="name@university.ac.th" {...form.register("email")} />{form.formState.errors.email && <span className="error">{form.formState.errors.email.message}</span>}</div><div className="form-row"><label htmlFor="password">รหัสผ่าน</label><input id="password" type="password" placeholder="อย่างน้อย 6 ตัวอักษร" {...form.register("password")} />{form.formState.errors.password && <span className="error">{form.formState.errors.password.message}</span>}</div><button className="button button-primary" style={{ width: "100%", marginTop: 10 }} type="submit">{isRegister ? "สร้างบัญชี" : "เข้าสู่ระบบ"} →</button></form><p style={{ marginTop: 20, marginBottom: 0 }}>{isRegister ? "มีบัญชีอยู่แล้ว? " : "ยังไม่มีบัญชี? "}<Link className="text-link" href={isRegister ? "/login" : "/register"}>{isRegister ? "เข้าสู่ระบบ" : "สมัครสมาชิก"}</Link></p></section></main>;
}
