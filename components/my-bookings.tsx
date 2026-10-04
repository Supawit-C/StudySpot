"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { getSpace, prettyDate } from "@/lib/spaces";
import { useAuth, useBookings } from "./providers";

export function MyBookings() {
  const { user } = useAuth(); const { bookings, cancelBooking } = useBookings(); const search = useSearchParams();
  if (!user) return <main className="page"><div className="container"><div className="empty"><p>เข้าสู่ระบบก่อนเพื่อดูและจัดการรายการจองของคุณ</p><Link className="button button-primary" href="/login">เข้าสู่ระบบ</Link></div></div></main>;
  const mine = bookings.filter(booking => booking.userEmail === user.email).sort((a, b) => `${a.date}${a.slots[0]}`.localeCompare(`${b.date}${b.slots[0]}`));
  return <main className="page"><div className="container"><span className="eyebrow">My schedule</span><h1 className="page-title">การจองของฉัน</h1><p className="page-intro">จัดการแผนการใช้พื้นที่ของคุณได้ที่นี่</p>{search.get("created") === "1" && <div className="form-message">จองพื้นที่เรียบร้อยแล้ว! ข้อมูลถูกเพิ่มในตารางของคุณ</div>}{mine.length ? <><table className="booking-table"><thead><tr><th>พื้นที่</th><th>วันที่</th><th>เวลา</th><th>สถานะ</th><th></th></tr></thead><tbody>{mine.map(booking => { const space = getSpace(booking.spaceId); return <tr key={booking.id}><td><b>{space?.name}</b><br /><span style={{ color: "#667170", fontSize: 11 }}>{space?.building}</span></td><td>{prettyDate(booking.date)}</td><td>{booking.slots.join(", ")}</td><td><span className="booking-status">ยืนยันแล้ว</span></td><td><button className="button button-danger" onClick={() => cancelBooking(booking.id)}>ยกเลิก</button></td></tr>; })}</tbody></table><div className="mobile-booking">{mine.map(booking => { const space = getSpace(booking.spaceId); return <article className="booking-panel" key={booking.id}><b>{space?.name}</b><p className="page-intro">{prettyDate(booking.date)} · {booking.slots.join(", ")}</p><button className="button button-danger" onClick={() => cancelBooking(booking.id)}>ยกเลิกการจอง</button></article>; })}</div></> : <div className="empty"><p>คุณยังไม่มีรายการจอง ลองค้นหาที่นั่งสำหรับ session ถัดไป</p><Link className="button button-primary" href="/spaces">ค้นหาพื้นที่</Link></div>}</div></main>;
}
