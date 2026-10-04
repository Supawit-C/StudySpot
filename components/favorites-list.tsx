"use client";
import Link from "next/link";
import { spaces } from "@/lib/spaces";
import { useAuth, useFavorites } from "./providers";
import { SpaceCard } from "./space-card";
export function FavoritesList() { const { user } = useAuth(); const { favorites } = useFavorites(); const items = spaces.filter(space => favorites.includes(space.id)); return <main className="page"><div className="container"><span className="eyebrow">Saved for later</span><h1 className="page-title">พื้นที่รายการโปรด</h1><p className="page-intro">เก็บห้องที่ถูกใจไว้ แล้วกลับมาจองเมื่อพร้อม</p>{!user && <div className="notice" style={{ marginBottom: 18 }}>รายการโปรดถูกบันทึกไว้ในอุปกรณ์นี้ คุณสามารถเข้าสู่ระบบก่อนจองได้ภายหลัง</div>}<div className="space-list">{items.length ? items.map(space => <SpaceCard space={space} key={space.id} />) : <div className="empty"><p>ยังไม่มีพื้นที่ที่บันทึกไว้ กด ♡ บนพื้นที่ที่ถูกใจเพื่อเก็บไว้ที่นี่</p><Link href="/spaces" className="button button-primary">ไปค้นหาพื้นที่</Link></div>}</div></div></main>; }
