// Server Component: layout ไม่มี state — ห่อด้วย AppProviders (client) เพื่อให้ทุกหน้าใช้ Global state ได้
// ไม่อ่าน session ที่นี่ เพราะ cookies() ใน layout จะทำให้ทุกหน้ากลายเป็น dynamic และ ISR/SSG ใช้ไม่ได้
import type { Metadata } from "next";
import "./globals.css";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { AppProviders } from "@/components/providers";

export const metadata: Metadata = { title: "StudySpot | จองพื้นที่เรียน", description: "ค้นหาและจองพื้นที่อ่านหนังสือในมหาวิทยาลัย" };
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) { return <html lang="th"><body><AppProviders><Header />{children}<Footer /></AppProviders></body></html>; }
