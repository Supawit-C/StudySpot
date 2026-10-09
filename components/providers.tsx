"use client";
// Client Component: Global state ฝั่ง client ด้วย React Context
// - AuthContext: ผู้ใช้ที่ login อยู่ ให้ Header และหน้าที่ interactive อ่านได้ทันทีโดยไม่ต้องทำทุกหน้าเป็น dynamic
// - FavoritesContext: รายการโปรด เก็บใน localStorage เพราะเป็นข้อมูลส่วนตัวบนอุปกรณ์ ไม่จำเป็นต้องอยู่บน server
// ต้องเป็น client เพราะใช้ useState/useEffect/localStorage และ subscribe การเปลี่ยน session

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { createBrowserClient } from "@supabase/ssr";
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
  const supabase = useMemo(() => createBrowserClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!), []);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [favorites, setFavorites] = useStoredState<string[]>("studyspot-favorites", []);

  // Server Action เป็นคนตั้ง/ลบ session cookie แล้วฝั่ง client เรียก refresh() เพื่ออ่านค่าใหม่
  const refresh = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser();
    setUser(user ? { id: user.id, email: user.email ?? "", name: user.user_metadata.name ?? user.email?.split("@")[0] ?? "" } : null);
    setLoading(false);
  }, [supabase]);

  useEffect(() => {
    refresh();
    const { data: { subscription } } = supabase.auth.onAuthStateChange(() => { refresh(); });
    return () => subscription.unsubscribe();
  }, [supabase, refresh]);

  const toggleFavorite = useCallback((id: string) => setFavorites(current => current.includes(id) ? current.filter(item => item !== id) : [...current, id]), [setFavorites]);

  return <AuthContext.Provider value={{ user, loading, refresh }}><FavoritesContext.Provider value={{ favorites, toggleFavorite }}>{children}</FavoritesContext.Provider></AuthContext.Provider>;
}
export function useAuth() { const context = useContext(AuthContext); if (!context) throw new Error("useAuth must be inside AppProviders"); return context; }
export function useFavorites() { const context = useContext(FavoritesContext); if (!context) throw new Error("useFavorites must be inside AppProviders"); return context; }
