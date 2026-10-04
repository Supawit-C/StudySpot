import { Suspense } from "react";
import { MyBookings } from "@/components/my-bookings";
export default function MyBookingsPage() { return <Suspense fallback={<main className="page"><div className="container"><div className="empty">กำลังโหลดการจอง…</div></div></main>}><MyBookings /></Suspense>; }
