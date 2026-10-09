// Server Component + SSR: การจองเป็นข้อมูลส่วนตัวของแต่ละคน ต้องอ่านจาก session cookie ทุก request จึง cache ไม่ได้
// (เรียก cookies() ผ่าน createClient ทำให้หน้านี้เป็น dynamic อยู่แล้ว ประกาศ force-dynamic ไว้ให้ชัด)
// ปุ่มยกเลิกเป็น Client Component เล็ก ๆ ที่เรียก Server Action cancelBooking
import Link from "next/link";
import { getCurrentUser, getMyBookings, getSpaces } from "@/lib/data";
import { prettyDate } from "@/lib/spaces";
import { CancelBookingButton } from "@/components/cancel-booking-button";

export const dynamic = "force-dynamic";

export default async function MyBookingsPage({ searchParams }: { searchParams: Promise<{ created?: string }> }) {
  const user = await getCurrentUser();
  if (!user) return <main className="page"><div className="container"><div className="empty"><p>เข้าสู่ระบบก่อนเพื่อดูและจัดการรายการจองของคุณ</p><Link className="button button-primary" href="/login?next=%2Fmy-bookings">เข้าสู่ระบบ</Link></div></div></main>;
  const [bookings, spaces, { created }] = await Promise.all([getMyBookings(), getSpaces(), searchParams]);
  const spaceById = new Map(spaces.map(space => [space.id, space]));
  return <main className="page"><div className="container"><span className="eyebrow">My schedule</span><h1 className="page-title">การจองของฉัน</h1><p className="page-intro">จัดการแผนการใช้พื้นที่ของคุณได้ที่นี่</p>{created === "1" && <div className="form-message">จองพื้นที่เรียบร้อยแล้ว! ข้อมูลถูกเพิ่มในตารางของคุณ</div>}{bookings.length ? <><table className="booking-table"><thead><tr><th>พื้นที่</th><th>วันที่</th><th>เวลา</th><th>สถานะ</th><th></th></tr></thead><tbody>{bookings.map(booking => { const space = spaceById.get(booking.space_id); return <tr key={booking.id}><td><b>{space?.name}</b><br /><span style={{ color: "#667170", fontSize: 11 }}>{space?.building}</span></td><td>{prettyDate(booking.date)}</td><td>{booking.slots.join(", ")}</td><td><span className="booking-status">ยืนยันแล้ว</span></td><td><CancelBookingButton id={booking.id} /></td></tr>; })}</tbody></table><div className="mobile-booking">{bookings.map(booking => { const space = spaceById.get(booking.space_id); return <article className="booking-panel" key={booking.id}><b>{space?.name}</b><p className="page-intro">{prettyDate(booking.date)} · {booking.slots.join(", ")}</p><CancelBookingButton id={booking.id} label="ยกเลิกการจอง" /></article>; })}</div></> : <div className="empty"><p>คุณยังไม่มีรายการจอง ลองค้นหาที่นั่งสำหรับ session ถัดไป</p><Link className="button button-primary" href="/spaces">ค้นหาพื้นที่</Link></div>}</div></main>;
}
