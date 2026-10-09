"use client";
// Client Component: ช่องค้นหา/ตัวกรองต้องตอบสนองทันทีตอนพิมพ์ (onChange, useSearchParams)
// รายการห้องทั้งหมดถูกดึงมาจาก Server Component แบบ ISR แล้วส่งเป็น props — กรองบน client จึงไม่ต้องยิง request ใหม่

import { useRouter, useSearchParams } from "next/navigation";
import { amenitiesOf, type Space } from "@/lib/spaces";
import { SpaceCard } from "./space-card";

export function SpaceFilters({ spaces }: { spaces: Space[] }) {
  const router = useRouter(); const params = useSearchParams();
  const query = params.get("q") ?? ""; const building = params.get("building") ?? ""; const capacity = params.get("capacity") ?? ""; const amenity = params.get("amenity") ?? "";
  // เก็บค่าตัวกรองไว้ใน URL เพื่อให้แชร์ลิงก์/กด back แล้วได้ผลเดิม
  const update = (name: string, value: string) => { const next = new URLSearchParams(params.toString()); if (value) next.set(name, value); else next.delete(name); router.replace(`/spaces?${next.toString()}`, { scroll: false }); };
  const filtered = spaces.filter(space => (!query || `${space.name} ${space.building} ${space.type}`.toLowerCase().includes(query.toLowerCase())) && (!building || space.building === building) && (!capacity || space.capacity >= Number(capacity)) && (!amenity || space.amenities.includes(amenity)));
  const buildings = Array.from(new Set(spaces.map(space => space.building))).sort();
  return <><div className="filter-bar"><input className="search" value={query} onChange={event => update("q", event.target.value)} placeholder="ค้นหาชื่อห้อง หรืออาคาร…" aria-label="ค้นหาพื้นที่" /><select className="field" aria-label="อาคาร" value={building} onChange={event => update("building", event.target.value)}><option value="">ทุกอาคาร</option>{buildings.map(item => <option key={item}>{item}</option>)}</select><select className="field" aria-label="จำนวนที่นั่ง" value={capacity} onChange={event => update("capacity", event.target.value)}><option value="">ทุกขนาด</option><option value="2">2 คนขึ้นไป</option><option value="4">4 คนขึ้นไป</option><option value="8">8 คนขึ้นไป</option></select><select className="field" aria-label="อุปกรณ์" value={amenity} onChange={event => update("amenity", event.target.value)}><option value="">อุปกรณ์ทั้งหมด</option>{amenitiesOf(spaces).map(item => <option key={item}>{item}</option>)}</select></div><p className="page-intro">พบ <b>{filtered.length}</b> พื้นที่</p><div className="space-list">{filtered.length ? filtered.map(space => <SpaceCard space={space} key={space.id} />) : <div className="empty">ไม่พบพื้นที่ที่ตรงกับเงื่อนไข ลองปรับตัวกรองอีกครั้ง</div>}</div></>;
}
