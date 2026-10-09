// Server Component + SSG/ISR: สร้างหน้ารายละเอียดของทุกห้องไว้ล่วงหน้าตอน build (generateStaticParams)
// และ revalidate ทุก 1 ชั่วโมง — รายละเอียดห้องเปลี่ยนน้อย จึงเสิร์ฟเป็น static ได้เร็วและดีต่อ SEO
// ห้องที่เพิ่มใหม่หลัง build จะถูก render ครั้งแรกตอนมีคนเข้าแล้ว cache ต่อ (dynamicParams = true โดย default)
// เวลาว่างแบบ real-time ไม่อยู่หน้านี้ แต่อยู่ /book/[id] ซึ่งเป็น SSR
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { getSpace, getSpaces } from "@/lib/data";
import { FavoriteButton } from "@/components/favorite-button";

export const revalidate = 3600;

export async function generateStaticParams() {
  return (await getSpaces()).map(space => ({ id: space.id }));
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const space = await getSpace((await params).id);
  return { title: space ? `${space.name} | StudySpot` : "ไม่พบพื้นที่ | StudySpot" };
}

export default async function SpaceDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params; const space = await getSpace(id); if (!space) notFound();
  return <main className="page"><div className="container detail-grid"><div className="detail-content"><span className="eyebrow">{space.building.toUpperCase()} · {space.floor}</span><h1>{space.name}</h1><div className="meta-row"><span>◉ รองรับ {space.capacity} คน</span><span>◷ {space.hours}</span></div><div className="detail-photo" style={{ backgroundImage: `url(${space.image})` }} /><p>{space.description}</p><h3>อุปกรณ์ในห้อง</h3><div className="amenity-list">{space.amenities.map(item => <span className="amenity" key={item}>✓ {item}</span>)}</div></div><aside className="booking-box"><span className="eyebrow">{space.type}</span><h2>พร้อมให้คุณจอง</h2><p>เลือกเวลาที่ต้องการได้สูงสุด 4 ชั่วโมงต่อครั้ง ดูช่วงเวลาว่างล่าสุดได้ในหน้าจอง</p><Link className="button button-primary" style={{ width: "100%" }} href={`/book/${space.id}`}>เริ่มจองพื้นที่ →</Link><FavoriteButton id={space.id} /></aside></div></main>;
}
