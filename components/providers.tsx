"use client";
// Client Component: Global state ฝั่ง client ด้วย React Context
// - AuthContext: ผู้ใช้ที่ login อยู่ (ดึงจาก /api/me) ให้ Header และหน้าที่ interactive อ่านได้ทันทีโดยไม่ต้องทำทุกหน้าเป็น dynamic
// - FavoritesContext: รายการโปรดของบัญชีที่ login อยู่ ดึงจาก Supabase ผ่าน Route Handler
// ต้องเป็น client เพราะใช้ useState/useEffect/fetch และอัปเดต UI ทันทีเมื่อกดปุ่มหัวใจ

import { createContext, useCallback, useContext, useEffect, useState } from "react";
import type { User } from "@/lib/types";
import { setFavorite } from "@/app/actions/favorites";

type AuthContextValue = { user: User | null; loading: boolean; refresh: () => Promise<void> };
const AuthContext = createContext<AuthContextValue | null>(null);
type FavoritesContextValue = { favorites: string[]; toggleFavorite: (id: string) => Promise<void> };
const FavoritesContext = createContext<FavoritesContextValue | null>(null);

export function AppProviders({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [favorites, setFavorites] = useState<string[]>([]);

  // Server Action เป็นคนตั้ง/ลบ session cookie (httpOnly) ฝั่ง client จึงถาม Route Handler /api/me เพื่ออ่านผู้ใช้ปัจจุบัน
  const refresh = useCallback(async () => {
    try {
      const response = await fetch("/api/me", { cache: "no-store" });
      const currentUser = (await response.json()).user as User | null;
      setUser(currentUser);
      if (!currentUser) { setFavorites([]); return; }
      const favoriteResponse = await fetch("/api/favorites", { cache: "no-store" });
      setFavorites((await favoriteResponse.json()).favorites);
    } catch { setUser(null); setFavorites([]); } finally { setLoading(false); }
  }, []);

  useEffect(() => { refresh(); }, [refresh]);

  const toggleFavorite = useCallback(async (id: string) => {
    if (!user) { window.alert("กรุณาเข้าสู่ระบบก่อนบันทึกรายการโปรด"); return; }
    const previous = favorites;
    const shouldSave = !previous.includes(id);
    setFavorites(shouldSave ? [...previous, id] : previous.filter(item => item !== id));
    const result = await setFavorite(id, shouldSave);
    if (result?.error) { setFavorites(previous); window.alert(result.error); }
  }, [favorites, user]);

  return <AuthContext.Provider value={{ user, loading, refresh }}><FavoritesContext.Provider value={{ favorites, toggleFavorite }}>{children}</FavoritesContext.Provider></AuthContext.Provider>;
}
export function useAuth() { const context = useContext(AuthContext); if (!context) throw new Error("useAuth must be inside AppProviders"); return context; }
export function useFavorites() { const context = useContext(FavoritesContext); if (!context) throw new Error("useFavorites must be inside AppProviders"); return context; }
