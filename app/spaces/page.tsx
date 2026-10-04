"use client";

import { Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { allAmenities, spaces } from "@/lib/spaces";
import { SpaceCard } from "@/components/space-card";

export default function SpacesPage() {
  return <Suspense fallback={<main className="page"><div className="container"><div className="empty">กำลังโหลดพื้นที่…</div></div></main>}><SpacesContent /></Suspense>;
}

function SpacesContent() {
  const router = useRouter(); const params = useSearchParams();
  const query = params.get("q") ?? ""; const building = params.get("building") ?? ""; const capacity = params.get("capacity") ?? ""; const amenity = params.get("amenity") ?? "";
  const update = (name: string, value: string) => { const next = new URLSearchParams(params.toString()); value ? next.set(name, value) : next.delete(name); router.replace(`/spaces?${next.toString()}`, { scroll: false }); };
  const filtered = spaces.filter(space => (!query || `${space.name} ${space.building} ${space.type}`.toLowerCase().includes(query.toLowerCase())) && (!building || space.building === building) && (!capacity || space.capacity >= Number(capacity)) && (!amenity || space.amenities.includes(amenity)));
  const buildings = Array.from(new Set(spaces.map(space => space.building)));
  return <main className="page"><div className="container"><span className="eyebrow">Explore spaces</span><h1 className="page-title">หาพื้นที่ที่พอดีกับคุณ</h1><p className="page-intro">เช็กห้องว่าง อุปกรณ์ และจำนวนที่นั่ง ก่อนออกไปทำงาน</p><div className="filter-bar"><input className="search" value={query} onChange={event => update("q", event.target.value)} placeholder="ค้นหาชื่อห้อง หรืออาคาร…" aria-label="ค้นหาพื้นที่" /><select className="field" value={building} onChange={event => update("building", event.target.value)}><option value="">ทุกอาคาร</option>{buildings.map(item => <option key={item}>{item}</option>)}</select><select className="field" value={capacity} onChange={event => update("capacity", event.target.value)}><option value="">ทุกขนาด</option><option value="2">2 คนขึ้นไป</option><option value="4">4 คนขึ้นไป</option><option value="8">8 คนขึ้นไป</option></select><select className="field" value={amenity} onChange={event => update("amenity", event.target.value)}><option value="">อุปกรณ์ทั้งหมด</option>{allAmenities.map(item => <option key={item}>{item}</option>)}</select></div><p className="page-intro">พบ <b>{filtered.length}</b> พื้นที่</p><div className="space-list">{filtered.length ? filtered.map(space => <SpaceCard space={space} key={space.id} />) : <div className="empty">ไม่พบพื้นที่ที่ตรงกับเงื่อนไข ลองปรับตัวกรองอีกครั้ง</div>}</div></div></main>;
}
