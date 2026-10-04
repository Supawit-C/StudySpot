"use client";

import { createContext, useContext, useEffect, useState } from "react";
import type { Booking, User } from "@/lib/types";

type AuthContextValue = { user: User | null; login: (user: User) => void; logout: () => void };
const AuthContext = createContext<AuthContextValue | null>(null);
type BookingContextValue = { bookings: Booking[]; addBooking: (booking: Omit<Booking, "id" | "createdAt">) => void; cancelBooking: (id: string) => void };
const BookingContext = createContext<BookingContextValue | null>(null);
type FavoritesContextValue = { favorites: string[]; toggleFavorite: (id: string) => void };
const FavoritesContext = createContext<FavoritesContextValue | null>(null);

function useStoredState<T>(key: string, initial: T) {
  const [value, setValue] = useState<T>(initial);
  const [ready, setReady] = useState(false);
  useEffect(() => { try { const saved = localStorage.getItem(key); if (saved) setValue(JSON.parse(saved)); } finally { setReady(true); } }, [key]);
  useEffect(() => { if (ready) localStorage.setItem(key, JSON.stringify(value)); }, [key, ready, value]);
  return [value, setValue] as const;
}

export function AppProviders({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useStoredState<User | null>("studyspot-user", null);
  const [bookings, setBookings] = useStoredState<Booking[]>("studyspot-bookings", []);
  const [favorites, setFavorites] = useStoredState<string[]>("studyspot-favorites", []);
  return <AuthContext.Provider value={{ user, login: setUser, logout: () => setUser(null) }}><BookingContext.Provider value={{ bookings, addBooking: booking => setBookings(current => [...current, { ...booking, id: crypto.randomUUID(), createdAt: new Date().toISOString() }]), cancelBooking: id => setBookings(current => current.filter(booking => booking.id !== id)) }}><FavoritesContext.Provider value={{ favorites, toggleFavorite: id => setFavorites(current => current.includes(id) ? current.filter(item => item !== id) : [...current, id]) }}>{children}</FavoritesContext.Provider></BookingContext.Provider></AuthContext.Provider>;
}
export function useAuth() { const context = useContext(AuthContext); if (!context) throw new Error("useAuth must be inside AppProviders"); return context; }
export function useBookings() { const context = useContext(BookingContext); if (!context) throw new Error("useBookings must be inside AppProviders"); return context; }
export function useFavorites() { const context = useContext(FavoritesContext); if (!context) throw new Error("useFavorites must be inside AppProviders"); return context; }
