// Server Component: อ่าน ?next= จาก searchParams บน server แล้วส่งต่อให้ AuthForm (client) ที่มีฟอร์ม interactive
import { AuthForm } from "@/components/auth-form";
import { safeNext } from "@/lib/safe-next";

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ next?: string }> }) {
  return <AuthForm mode="login" next={safeNext((await searchParams).next)} />;
}
