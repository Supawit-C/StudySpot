"use server";
// Server Action: เขียนรายการโปรดบน server เพื่อให้ RLS ผูกข้อมูลกับ user_id ของ session เสมอ
import { revalidatePath } from "next/cache";
import { getSpace } from "@/lib/data";
import { hasSupabase } from "@/lib/mode";
import { createClient } from "@/lib/supabase/server";

export type FavoriteActionResult = { error: string } | undefined;

export async function setFavorite(spaceId: string, shouldSave: boolean): Promise<FavoriteActionResult> {
  if (!spaceId || !(await getSpace(spaceId))) return { error: "ไม่พบพื้นที่นี้" };
  if (!hasSupabase) return { error: "รายการโปรดแยกตามบัญชีได้เมื่อเชื่อม Supabase" };

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "กรุณาเข้าสู่ระบบก่อนบันทึกรายการโปรด" };

  const { error } = shouldSave
    ? await supabase.from("favorites").upsert({ user_id: user.id, space_id: spaceId }, { onConflict: "user_id,space_id", ignoreDuplicates: true })
    : await supabase.from("favorites").delete().eq("user_id", user.id).eq("space_id", spaceId);
  if (error) return { error: "บันทึกรายการโปรดไม่สำเร็จ กรุณาลองอีกครั้ง" };

  revalidatePath("/favorites");
  return undefined;
}
