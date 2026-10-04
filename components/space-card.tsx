"use client";

import Link from "next/link";
import type { Space } from "@/lib/spaces";
import { useFavorites } from "./providers";

export function SpaceCard({ space }: { space: Space }) {
  const { favorites, toggleFavorite } = useFavorites(); const active = favorites.includes(space.id);
  return <article className="space-card"><div className="space-photo" style={{ backgroundImage: `url(${space.image})` }}><span className="tag">{space.type}</span><button className={`heart ${active ? "active" : ""}`} onClick={() => toggleFavorite(space.id)} aria-label="บันทึกรายการโปรด">{active ? "♥" : "♡"}</button></div><Link href={`/spaces/${space.id}`} className="space-info"><h3>{space.name}</h3><p>{space.building} · {space.floor} · รองรับ {space.capacity} คน</p><div className="feature-row">{space.amenities.slice(0, 3).map(item => <span className="feature" key={item}>{item}</span>)}</div></Link></article>;
}
