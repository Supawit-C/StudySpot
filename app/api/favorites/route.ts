// Route Handler: คืนเฉพาะ space_id ที่ user ปัจจุบันบันทึกไว้ให้ FavoritesContext
import { NextResponse } from "next/server";
import { getMyFavoriteSpaceIds } from "@/lib/data";

export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json({ favorites: await getMyFavoriteSpaceIds() }, { headers: { "Cache-Control": "private, no-store" } });
}
