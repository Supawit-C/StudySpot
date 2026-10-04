import { notFound } from "next/navigation";
import { getSpace } from "@/lib/spaces";
import { BookingForm } from "@/components/booking-form";
export default async function BookPage({ params }: { params: Promise<{ id: string }> }) { const { id } = await params; const space = getSpace(id); if (!space) notFound(); return <BookingForm space={space} />; }
