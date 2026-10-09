// Server Component + ISR: ดึงข้อมูลห้องทั้งหมดแบบ cache 1 ชั่วโมง แล้วส่งให้ FavoritesList (client)
// ซึ่งกรองตามรายการโปรดใน localStorage — ส่วนที่เป็นข้อมูลส่วนตัวจึงอยู่ฝั่ง browser เท่านั้น
import { getSpaces } from "@/lib/data";
import { FavoritesList } from "@/components/favorites-list";

export const revalidate = 3600;

export default async function FavoritesPage() {
  const spaces = await getSpaces();
  return <main className="page"><div className="container"><span className="eyebrow">Saved for later</span><h1 className="page-title">พื้นที่รายการโปรด</h1><p className="page-intro">เก็บห้องที่ถูกใจไว้ แล้วกลับมาจองเมื่อพร้อม</p><FavoritesList spaces={spaces} /></div></main>;
}
