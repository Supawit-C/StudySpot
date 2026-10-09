"use client";
// Client Component: เลือกช่วงเวลาแบบ interactive (onClick, state ของฟอร์ม) ด้วย react-hook-form + zod
// ช่วงเวลาที่ถูกจองแล้ว (booked) มาจาก Server Component แบบ SSR; เปลี่ยนวันที่ = เปลี่ยน ?date= ให้ server ดึงใหม่
// กดยืนยันแล้วเรียก Server Action createBooking ซึ่ง validate ด้วย schema เดียวกันซ้ำบน server

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { Space } from "@/lib/spaces";
import { MAX_SLOTS, SLOTS, prettyDate, today } from "@/lib/spaces";
import { bookingSchema, type BookingInput } from "@/lib/schemas";
import { createBooking } from "@/app/actions/bookings";

export function BookingForm({ space, date, booked }: { space: Space; date: string; booked: string[] }) {
  const router = useRouter(); const [loadingDate, startTransition] = useTransition();
  const { register, handleSubmit, watch, setValue, setError, formState: { errors, isSubmitting } } = useForm<BookingInput>({
    resolver: zodResolver(bookingSchema),
    defaultValues: { spaceId: space.id, date, slots: [], note: "" },
  });
  const selected = watch("slots"); const currentDate = watch("date");

  const toggle = (slot: BookingInput["slots"][number]) => {
    const next = selected.includes(slot) ? selected.filter(item => item !== slot) : [...selected, slot].sort();
    // ให้ zod เป็นคนแจ้ง error เมื่อเกิน 4 ช่วง แทนการเงียบไม่ให้กด
    setValue("slots", next, { shouldValidate: true });
  };
  const dateField = register("date", { onChange: event => startTransition(() => router.replace(`/book/${space.id}?date=${event.target.value}`, { scroll: false })) });
  const onSubmit = async (values: BookingInput) => { const result = await createBooking(values); if (result?.error) setError("root", { message: result.error }); };

  return <main className="page"><form className="container booking-layout" onSubmit={handleSubmit(onSubmit)} noValidate><section className="booking-panel"><span className="eyebrow">จองพื้นที่</span><h1>{space.name}</h1><p className="page-intro">{space.building} · {space.floor} · รองรับ {space.capacity} คน</p>
    <div className="form-row"><label htmlFor="date">วันที่เข้าใช้</label><input id="date" type="date" min={today()} aria-invalid={!!errors.date} {...dateField} />{errors.date && <span className="error">{errors.date.message}</span>}</div>
    <h3 style={{ marginBottom: 6 }}>เลือกช่วงเวลา</h3><p className="page-intro" style={{ fontSize: 12 }}>เลือกต่อเนื่องหรือแยกกันได้ไม่เกิน {MAX_SLOTS} ชั่วโมง · สีเทาคือถูกจองแล้ว</p>
    <div className="slot-grid" aria-busy={loadingDate}>{SLOTS.map(slot => { const busy = booked.includes(slot); return <button type="button" onClick={() => toggle(slot)} aria-pressed={selected.includes(slot)} className={`slot ${selected.includes(slot) ? "selected" : ""} ${busy ? "busy" : ""}`} disabled={busy || loadingDate} key={slot}>{slot}</button>; })}</div>
    {errors.slots && <p className="error">{errors.slots.message ?? errors.slots.root?.message}</p>}
    <div className="form-row"><label htmlFor="note">หมายเหตุ (ไม่บังคับ)</label><input id="note" aria-invalid={!!errors.note} {...register("note")} placeholder="เช่น ใช้สำหรับประชุมกลุ่มวิชา…" />{errors.note && <span className="error">{errors.note.message}</span>}</div>
    {errors.root && <p className="error" role="alert">{errors.root.message}</p>}
    <button className="button button-primary" type="submit" disabled={isSubmitting || loadingDate} style={{ marginTop: 10 }}>{isSubmitting ? "กำลังจอง…" : "ยืนยันการจอง →"}</button></section>
    <aside className="summary-card"><h2>สรุปการจอง</h2><dl><div><dt>พื้นที่</dt><dd>{space.name}</dd></div><div><dt>วันที่</dt><dd>{currentDate ? prettyDate(currentDate) : "-"}</dd></div><div><dt>เวลา</dt><dd>{selected.length ? selected.join(", ") : "ยังไม่ได้เลือก"}</dd></div><div><dt>ระยะเวลา</dt><dd>{selected.length} ชั่วโมง</dd></div></dl><p className="notice" style={{ marginTop: 18 }}>โปรดมาถึงภายใน 15 นาทีหลังเริ่มช่วงเวลาที่จอง มิฉะนั้นสิทธิ์การจองอาจถูกยกเลิก</p></aside></form></main>;
}
