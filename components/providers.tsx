"use client";
// Client Component: Global state ฝั่ง client ด้วย React Context
// - AuthContext: ผู้ใช้ที่ login อยู่ (ดึงจาก /api/me) ให้ Header และหน้าที่ interactive อ่านได้ทันทีโดยไม่ต้องทำทุกหน้าเป็น dynamic
// - FavoritesContext: รายการโปรด เก็บใน localStorage เพราะเป็นข้อมูลส่วนตัวบนอุปกรณ์ ไม่จำเป็นต้องอยู่บน server
// ต้องเป็น client เพราะใช้ useState/useEffect/localStorage และ fetch ข้อมูลผู้ใช้หลัง login/logout

import { createContext, useCallback, useContext, useEffect, useState } from "react";
import type { User } from "@/lib/types";

type AuthContextValue = { user: User | null; loading: boolean; refresh: () => Promise<void> };
const AuthContext = createContext<AuthContextValue | null>(null);
type FavoritesContextValue = { favorites: string[]; toggleFavorite: (id: string) => void };
const FavoritesContext = createContext<FavoritesContextValue | null>(null);

function useStoredState<T>(key: string, initial: T) {
  const [value, setValue] = useState<T>(initial);
  const [ready, setReady] = useState(false);
  useEffect(() => { try { const saved = localStorage.getItem(key); if (saved) setValue(JSON.parse(saved)); } catch {} finally { setReady(true); } }, [key]);
  useEffect(() => { if (ready) try { localStorage.setItem(key, JSON.stringify(value)); } catch {} }, [key, ready, value]);
  return [value, setValue] as const;
}

export function AppProviders({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [favorites, setFavorites] = useStoredState<string[]>("studyspot-favorites", []);

  // Server Action เป็นคนตั้ง/ลบ session cookie (httpOnly) ฝั่ง client จึงถาม Route Handler /api/me เพื่ออ่านผู้ใช้ปัจจุบัน
  const refresh = useCallback(async () => {
    try { const response = await fetch("/api/me", { cache: "no-store" }); setUser((await response.json()).user); } catch { setUser(null); } finally { setLoading(false); }
  }, []);

  useEffect(() => { refresh(); }, [refresh]);

  const toggleFavorite = useCallback((id: string) => setFavorites(current => current.includes(id) ? current.filter(item => item !== id) : [...current, id]), [setFavorites]);

  return <AuthContext.Provider value={{ user, loading, refresh }}><FavoritesContext.Provider value={{ favorites, toggleFavorite }}>{children}</FavoritesContext.Provider></AuthContext.Provider>;
}
export function useAuth() { const context = useContext(AuthContext); if (!context) throw new Error("useAuth must be inside AppProviders"); return context; }
export function useFavorites() { const context = useContext(FavoritesContext); if (!context) throw new Error("useFavorites must be inside AppProviders"); return context; }
