import Link from "next/link";
export default function NotFound() { return <main className="page"><div className="container"><div className="empty"><h1>ไม่พบพื้นที่นี้</h1><p>ลิงก์อาจไม่ถูกต้อง หรือห้องนี้ไม่มีอยู่แล้ว</p><Link href="/spaces" className="button button-primary">กลับไปดูพื้นที่ทั้งหมด</Link></div></div></main>; }
