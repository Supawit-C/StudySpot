"use client";
// Client Component: ปุ่มที่ต้องมี onClick และสถานะ pending — ตัว mutation จริงอยู่ใน Server Action cancelBooking
// หลังลบเสร็จ server เรียก revalidatePath("/my-bookings") ตารางจึงอัปเดตเองโดยไม่ต้องจัดการ state ฝั่ง client

import { useState, useTransition } from "react";
import { cancelBooking } from "@/app/actions/bookings";

export function CancelBookingButton({ id, label = "ยกเลิก" }: { id: string; label?: string }) {
  const [pending, startTransition] = useTransition(); const [error, setError] = useState("");
  const cancel = () => startTransition(async () => { const result = await cancelBooking(id); setError(result?.error ?? ""); });
  return <><button className="button button-danger" onClick={cancel} disabled={pending}>{pending ? "กำลังยกเลิก…" : label}</button>{error && <span className="error" role="alert">{error}</span>}</>;
}
