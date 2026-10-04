import { notFound } from "next/navigation";
import Link from "next/link";
import { getSpace } from "@/lib/spaces";
import { FavoriteButton } from "@/components/favorite-button";

export default async function SpaceDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params; const space = getSpace(id); if (!space) notFound();
  return <main className="page"><div className="container detail-grid"><div className="detail-content"><span className="eyebrow">{space.building.toUpperCase()} · {space.floor}</span><h1>{space.name}</h1><div className="meta-row"><span>◉ รองรับ {space.capacity} คน</span><span>◷ {space.hours}</span></div><div className="detail-photo" style={{ backgroundImage: `url(${space.image})` }} /><p>{space.description}</p><h3>อุปกรณ์ในห้อง</h3><div className="amenity-list">{space.amenities.map(item => <span className="amenity" key={item}>✓ {item}</span>)}</div></div><aside className="booking-box"><span className="eyebrow">สถานะวันนี้</span><h2>พร้อมให้คุณจอง</h2><p>เลือกเวลาที่ต้องการได้สูงสุด 4 ชั่วโมงต่อครั้ง</p><div className="time-chips"><span className="time-chip">09:00</span><span className="time-chip busy">10:00</span><span className="time-chip">11:00</span><span className="time-chip">13:00</span><span className="time-chip busy">14:00</span><span className="time-chip">15:00</span></div><Link className="button button-primary" style={{ width: "100%" }} href={`/book/${space.id}`}>เริ่มจองพื้นที่ →</Link><FavoriteButton id={space.id} /></aside></div></main>;
}
