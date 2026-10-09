"use client";
// Client Component: แสดงชื่อผู้ใช้จาก AuthContext และมีปุ่ม logout (onClick)
// ถ้าให้ layout อ่าน session บน server จะทำให้ทุกหน้ากลายเป็น dynamic และใช้ ISR/SSG ไม่ได้

import Link from "next/link";
import { useRouter } from "next/navigation";
import { signOut } from "@/app/actions/auth";
import { useAuth } from "./providers";

const links = [{ href: "/spaces", label: "ค้นหาพื้นที่" }, { href: "/my-bookings", label: "การจองของฉัน" }, { href: "/favorites", label: "รายการโปรด" }];

export function Header() {
  const { user, loading, refresh } = useAuth(); const router = useRouter();
  const logout = async () => { await signOut(); await refresh(); router.push("/"); router.refresh(); };
  return <header className="site-header"><nav className="container nav"><Link href="/" className="brand"><span className="brand-mark">s.</span>StudySpot</Link><div className="nav-links">{links.map(link => <Link key={link.href} href={link.href}>{link.label}</Link>)}</div><div className="nav-actions">{loading ? null : user ? <><span className="nav-user">สวัสดี, {user.name.split(" ")[0]}</span><button onClick={logout} className="button button-light">ออกจากระบบ</button></> : <><Link href="/login" className="button button-ghost">เข้าสู่ระบบ</Link><Link href="/register" className="button button-primary">สมัครสมาชิก</Link></>}</div></nav><div className="container mobile-nav">{links.map(link => <Link key={link.href} href={link.href}>{link.label}</Link>)}{user && <button onClick={logout} className="mobile-logout">ออกจากระบบ</button>}</div></header>;
}
