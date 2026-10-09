// type และ helper ที่ไม่แตะฐานข้อมูล — import ได้ทั้งฝั่ง server และ client
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

export const SLOTS = ["09:00", "10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00", "17:00", "18:00"] as const;
export const MAX_SLOTS = 4;

export const amenitiesOf = (spaces: Space[]) => Array.from(new Set(spaces.flatMap(space => space.amenities))).sort();
// วันที่ตามเวลาไทย (server บน Vercel เป็น UTC ถ้าใช้ toISOString ตรง ๆ ช่วงเช้าจะได้วันของเมื่อวาน)
export const today = () => new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Bangkok" }).format(new Date());
export const prettyDate = (value: string) => new Intl.DateTimeFormat("th-TH", { dateStyle: "medium" }).format(new Date(`${value}T00:00:00`));
