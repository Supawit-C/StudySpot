"use client";
// Client Component: รายการโปรดอยู่ใน FavoritesContext (localStorage) ซึ่งมีแค่บน browser
// ข้อมูลห้องรับมาจาก Server Component เป็น props แล้วกรองตาม id ที่บันทึกไว้
import Link from "next/link";
import type { Space } from "@/lib/spaces";
import { useAuth, useFavorites } from "./providers";
import { SpaceCard } from "./space-card";
export function FavoritesList({ spaces }: { spaces: Space[] }) { const { user } = useAuth(); const { favorites } = useFavorites(); const items = spaces.filter(space => favorites.includes(space.id)); return <>{!user && <div className="notice" style={{ marginBottom: 18 }}>รายการโปรดถูกบันทึกไว้ในอุปกรณ์นี้ คุณสามารถเข้าสู่ระบบก่อนจองได้ภายหลัง</div>}<div className="space-list">{items.length ? items.map(space => <SpaceCard space={space} key={space.id} />) : <div className="empty"><p>ยังไม่มีพื้นที่ที่บันทึกไว้ กด ♡ บนพื้นที่ที่ถูกใจเพื่อเก็บไว้ที่นี่</p><Link href="/spaces" className="button button-primary">ไปค้นหาพื้นที่</Link></div>}</div></>; }
