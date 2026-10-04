"use client";

import Link from "next/link";
import { useAuth } from "./providers";

export function Header() {
  const { user, logout } = useAuth();
  return <header className="site-header"><nav className="container nav"><Link href="/" className="brand"><span className="brand-mark">s.</span>StudySpot</Link><div className="nav-links"><Link href="/spaces">ค้นหาพื้นที่</Link><Link href="/my-bookings">การจองของฉัน</Link><Link href="/favorites">รายการโปรด</Link></div><div className="nav-actions">{user ? <><span className="nav-user">สวัสดี, {user.name.split(" ")[0]}</span><button onClick={logout} className="button button-light">ออกจากระบบ</button></> : <><Link href="/login" className="button button-ghost">เข้าสู่ระบบ</Link><Link href="/register" className="button button-primary">สมัครสมาชิก</Link></>}</div></nav></header>;
}
