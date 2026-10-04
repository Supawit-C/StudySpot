export type Space = {
  id: string;
  name: string;
  building: string;
  floor: string;
  capacity: number;
  type: string;
  image: string;
  description: string;
  amenities: string[];
  hours: string;
};

export const spaces: Space[] = [
  { id: "aurora-201", name: "Aurora Study Lounge", building: "Learning Commons", floor: "ชั้น 2", capacity: 8, type: "ห้องกลุ่ม", image: "https://images.unsplash.com/photo-1497366811353-6870744d04b2?auto=format&fit=crop&w=1000&q=85", description: "ห้องทำงานกลุ่มที่สว่าง โปร่ง และเงียบพอดีสำหรับทีมที่ต้องการโฟกัสงานร่วมกัน", amenities: ["จอ 55 นิ้ว", "ไวท์บอร์ด", "ปลั๊กไฟ", "Wi‑Fi"], hours: "08:00 – 20:00" },
  { id: "nest-104", name: "The Nest", building: "Central Library", floor: "ชั้น 1", capacity: 4, type: "ห้องเงียบ", image: "https://images.unsplash.com/photo-1524758631624-e2822e304c36?auto=format&fit=crop&w=1000&q=85", description: "มุมเล็กสำหรับติวงานหรือประชุมแบบใกล้ชิด ภายในห้องสมุดกลาง", amenities: ["จอ 40 นิ้ว", "Wi‑Fi", "ปลั๊กไฟ"], hours: "08:00 – 22:00" },
  { id: "canopy-301", name: "Canopy Room", building: "Engineering", floor: "ชั้น 3", capacity: 12, type: "ห้องกลุ่ม", image: "https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1000&q=85", description: "พื้นที่ทำงานขนาดใหญ่สำหรับ workshop การนำเสนอ และโปรเจกต์กลุ่ม", amenities: ["โปรเจกเตอร์", "ไวท์บอร์ด", "Wi‑Fi", "ปลั๊กไฟ"], hours: "09:00 – 19:00" },
  { id: "focus-14", name: "Focus Pod 14", building: "Learning Commons", floor: "ชั้น 4", capacity: 2, type: "โฟกัสพอด", image: "https://images.unsplash.com/photo-1497215728101-856f4ea42174?auto=format&fit=crop&w=1000&q=85", description: "พื้นที่ส่วนตัวสำหรับอ่านหนังสือออนไลน์ สัมภาษณ์ หรือประชุมแบบสองคน", amenities: ["จอ 27 นิ้ว", "Wi‑Fi", "ปลั๊กไฟ"], hours: "08:00 – 20:00" },
  { id: "orbit-106", name: "Orbit Seminar", building: "Science", floor: "ชั้น 1", capacity: 20, type: "ห้องสัมมนา", image: "https://images.unsplash.com/photo-1517048676732-d65bc937f952?auto=format&fit=crop&w=1000&q=85", description: "ห้องสัมมนาเพื่อการเรียนรู้และนำเสนองาน พร้อมที่นั่งครบสำหรับกลุ่มใหญ่", amenities: ["โปรเจกเตอร์", "ไมค์", "ไวท์บอร์ด", "Wi‑Fi"], hours: "08:00 – 18:00" },
  { id: "terrace-07", name: "Terrace Desk 07", building: "Student Center", floor: "ชั้น 2", capacity: 1, type: "โต๊ะเดี่ยว", image: "https://images.unsplash.com/photo-1501504905252-473c47e087f8?auto=format&fit=crop&w=1000&q=85", description: "โต๊ะริมหน้าต่างรับแสงธรรมชาติ สำหรับวันที่อยากอ่านหนังสือเงียบ ๆ คนเดียว", amenities: ["Wi‑Fi", "ปลั๊กไฟ", "วิวสวน"], hours: "09:00 – 20:00" }
];

export const getSpace = (id: string) => spaces.find((space) => space.id === id);
export const allAmenities = Array.from(new Set(spaces.flatMap((space) => space.amenities))).sort();
export const today = () => new Date().toISOString().slice(0, 10);
export const prettyDate = (value: string) => new Intl.DateTimeFormat("th-TH", { dateStyle: "medium" }).format(new Date(`${value}T00:00:00`));
