"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import type { Space } from "@/lib/spaces";
import { prettyDate, today } from "@/lib/spaces";
import { useAuth, useBookings } from "./providers";

const slots = ["09:00", "10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00", "17:00", "18:00"];
export function BookingForm({ space }: { space: Space }) {
  const router = useRouter(); const { user } = useAuth(); const { bookings, addBooking } = useBookings(); const [date, setDate] = useState(today()); const [selected, setSelected] = useState<string[]>([]); const [note, setNote] = useState(""); const [message, setMessage] = useState("");
  useEffect(() => { if (!user) router.replace(`/login?next=/book/${space.id}`); }, [user, router, space.id]);
  const unavailable = useMemo(() => bookings.filter(booking => booking.spaceId === space.id && booking.date === date).flatMap(booking => booking.slots), [bookings, space.id, date]);
  const toggle = (slot: string) => { if (unavailable.includes(slot)) return; setSelected(current => current.includes(slot) ? current.filter(item => item !== slot) : current.length < 4 ? [...current, slot].sort() : current); };
  const submit = () => { if (!user || !selected.length) return setMessage("เลือกช่วงเวลาอย่างน้อย 1 ช่วง"); addBooking({ spaceId: space.id, date, slots: selected, note, userEmail: user.email }); router.push("/my-bookings?created=1"); };
  if (!user) return <main className="page"><div className="container"><div className="empty">กำลังพาคุณไปยังหน้าเข้าสู่ระบบ…</div></div></main>;
  return <main className="page"><div className="container booking-layout"><section className="booking-panel"><span className="eyebrow">จองพื้นที่</span><h1>{space.name}</h1><p className="page-intro">{space.building} · {space.floor} · รองรับ {space.capacity} คน</p><div className="form-row"><label htmlFor="date">วันที่เข้าใช้</label><input id="date" type="date" min={today()} value={date} onChange={event => { setDate(event.target.value); setSelected([]); }} /></div><h3 style={{ marginBottom: 6 }}>เลือกช่วงเวลา</h3><p className="page-intro" style={{ fontSize: 12 }}>เลือกต่อเนื่องหรือแยกกันได้ไม่เกิน 4 ชั่วโมง · สีเทาคือถูกจองแล้ว</p><div className="slot-grid">{slots.map(slot => <button onClick={() => toggle(slot)} className={`slot ${selected.includes(slot) ? "selected" : ""} ${unavailable.includes(slot) ? "busy" : ""}`} disabled={unavailable.includes(slot)} key={slot}>{slot}</button>)}</div><div className="form-row"><label htmlFor="note">หมายเหตุ (ไม่บังคับ)</label><input id="note" value={note} onChange={event => setNote(event.target.value)} placeholder="เช่น ใช้สำหรับประชุมกลุ่มวิชา…" /></div>{message && <p className="error">{message}</p>}<button className="button button-primary" onClick={submit} style={{ marginTop: 10 }}>ยืนยันการจอง →</button></section><aside className="summary-card"><h2>สรุปการจอง</h2><dl><div><dt>พื้นที่</dt><dd>{space.name}</dd></div><div><dt>วันที่</dt><dd>{prettyDate(date)}</dd></div><div><dt>เวลา</dt><dd>{selected.length ? selected.join(", ") : "ยังไม่ได้เลือก"}</dd></div><div><dt>ระยะเวลา</dt><dd>{selected.length} ชั่วโมง</dd></div></dl><p className="notice" style={{ marginTop: 18 }}>โปรดมาถึงภายใน 15 นาทีหลังเริ่มช่วงเวลาที่จอง มิฉะนั้นสิทธิ์การจองอาจถูกยกเลิก</p></aside></div></main>;
}
