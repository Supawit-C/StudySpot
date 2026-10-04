import type { Metadata } from "next";
import "./globals.css";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { AppProviders } from "@/components/providers";

export const metadata: Metadata = { title: "StudySpot | จองพื้นที่เรียน", description: "ค้นหาและจองพื้นที่อ่านหนังสือในมหาวิทยาลัย" };
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) { return <html lang="th"><body><AppProviders><Header />{children}<Footer /></AppProviders></body></html>; }
