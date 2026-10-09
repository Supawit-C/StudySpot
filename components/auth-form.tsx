"use client";
// Client Component: ฟอร์มต้องใช้ react-hook-form (hooks + event) เพื่อ validate ด้วย zod ก่อนส่ง
// ส่วนการตรวจรหัสผ่านจริงทำใน Server Action signIn/signUp

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm, type UseFormRegisterReturn } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { signIn, signUp, type AuthResult } from "@/app/actions/auth";
import { loginSchema, registerSchema, type LoginInput, type RegisterInput } from "@/lib/schemas";
import { useAuth } from "./providers";

type Mode = "login" | "register";
const copy = {
  login: { title: "ยินดีต้อนรับกลับ", intro: "เข้าสู่ระบบเพื่อจองพื้นที่อ่านหนังสือ", submit: "เข้าสู่ระบบ", switchText: "ยังไม่มีบัญชี? ", switchLabel: "สมัครสมาชิก", switchHref: "/register" },
  register: { title: "เริ่มต้นใช้งาน", intro: "สร้างบัญชีเพื่อจองพื้นที่และจัดการการจองของคุณ", submit: "สร้างบัญชี", switchText: "มีบัญชีอยู่แล้ว? ", switchLabel: "เข้าสู่ระบบ", switchHref: "/login" },
};

export function AuthForm({ mode, next }: { mode: Mode; next: string }) {
  const text = copy[mode]; const router = useRouter(); const { refresh } = useAuth();
  const [serverError, setServerError] = useState(""); const [notice, setNotice] = useState("");
  const done = async (result: AuthResult) => {
    if (result.error) return setServerError(result.error);
    if (result.needsConfirm) return setNotice("สมัครสำเร็จ! กรุณายืนยันอีเมลก่อนเข้าสู่ระบบ");
    await refresh(); router.push(next); router.refresh();
  };
  const withNext = (href: string) => next === "/spaces" ? href : `${href}?next=${encodeURIComponent(next)}`;
  return <main className="auth-wrap"><section className="auth-card"><span className="eyebrow">StudySpot account</span><h1>{text.title}</h1><p>{text.intro}</p>
    {mode === "register" ? <RegisterFields onSubmit={values => { setServerError(""); return signUp(values).then(done); }} submit={text.submit} /> : <LoginFields onSubmit={values => { setServerError(""); return signIn(values).then(done); }} submit={text.submit} />}
    {serverError && <p className="error" role="alert">{serverError}</p>}{notice && <div className="form-message">{notice}</div>}
    <p style={{ marginTop: 20, marginBottom: 0 }}>{text.switchText}<Link className="text-link" href={withNext(text.switchHref)}>{text.switchLabel}</Link></p></section></main>;
}

// แยก useForm ต่อ schema เพื่อให้ type ตรงกับฟิลด์จริงของแต่ละฟอร์ม
function LoginFields({ onSubmit, submit }: { onSubmit: (values: LoginInput) => Promise<void>; submit: string }) {
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<LoginInput>({ resolver: zodResolver(loginSchema), defaultValues: { email: "", password: "" } });
  return <form onSubmit={handleSubmit(onSubmit)} noValidate>
    <Field id="email" label="อีเมลมหาวิทยาลัย" type="email" placeholder="name@university.ac.th" error={errors.email?.message} registration={register("email")} />
    <Field id="password" label="รหัสผ่าน" type="password" placeholder="อย่างน้อย 6 ตัวอักษร" error={errors.password?.message} registration={register("password")} />
    <SubmitButton pending={isSubmitting} label={submit} /></form>;
}

function RegisterFields({ onSubmit, submit }: { onSubmit: (values: RegisterInput) => Promise<void>; submit: string }) {
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<RegisterInput>({ resolver: zodResolver(registerSchema), defaultValues: { name: "", email: "", password: "" } });
  return <form onSubmit={handleSubmit(onSubmit)} noValidate>
    <Field id="name" label="ชื่อที่แสดง" placeholder="เช่น อรอนงค์ ใจดี" error={errors.name?.message} registration={register("name")} />
    <Field id="email" label="อีเมลมหาวิทยาลัย" type="email" placeholder="name@university.ac.th" error={errors.email?.message} registration={register("email")} />
    <Field id="password" label="รหัสผ่าน" type="password" placeholder="อย่างน้อย 6 ตัวอักษร" error={errors.password?.message} registration={register("password")} />
    <SubmitButton pending={isSubmitting} label={submit} /></form>;
}

function Field({ id, label, type = "text", placeholder, error, registration }: { id: string; label: string; type?: string; placeholder: string; error?: string; registration: UseFormRegisterReturn }) {
  return <div className="form-row"><label htmlFor={id}>{label}</label><input id={id} type={type} placeholder={placeholder} aria-invalid={!!error} {...registration} />{error && <span className="error">{error}</span>}</div>;
}

function SubmitButton({ pending, label }: { pending: boolean; label: string }) {
  return <button className="button button-primary" style={{ width: "100%", marginTop: 10 }} type="submit" disabled={pending}>{pending ? "กำลังดำเนินการ…" : `${label} →`}</button>;
}
