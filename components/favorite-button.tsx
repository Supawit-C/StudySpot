"use client";
// Client Component: toggle รายการโปรดผ่าน FavoritesContext (onClick) — เป็น "เกาะ" เล็ก ๆ ในหน้ารายละเอียดที่เป็น Server Component
import { useFavorites } from "./providers";
export function FavoriteButton({ id }: { id: string }) { const { favorites, toggleFavorite } = useFavorites(); const active = favorites.includes(id); return <button className="button button-light" onClick={() => toggleFavorite(id)} style={{ width: "100%", marginTop: 9 }}>{active ? "♥ บันทึกไว้แล้ว" : "♡ เก็บเป็นรายการโปรด"}</button>; }
