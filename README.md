# StudySpot

เว็บแอปค้นหาและจองพื้นที่อ่านหนังสือ/ทำงานกลุ่มในมหาวิทยาลัย ตาม proposal ใน `proposal-studyspot.md`

## เริ่มใช้งาน

```bash
npm install
npm run dev
```

เปิด [http://localhost:3000](http://localhost:3000)

## สิ่งที่ทำแล้ว

- Route ครบ: หน้าแรก, login/register, ค้นหา, รายละเอียด, จอง, การจองของฉัน และรายการโปรด
- ค้นหา/กรองอาคาร จำนวนที่นั่ง และอุปกรณ์ โดยสะท้อนค่าไว้ใน URL
- ฟอร์ม login/register ใช้ `react-hook-form` และ `zod`
- เลือกช่วงเวลาได้สูงสุด 4 ชั่วโมง, ตรวจช่วงเวลาที่ถูกจองแล้วในเบราว์เซอร์, ยกเลิกการจองได้เฉพาะรายการของผู้ใช้ที่กำลัง login
- Favorites, session จำลอง และ bookings ถูกเก็บใน `localStorage` เพื่อให้เดโมทำงานได้โดยไม่ต้องมี credential

## เชื่อม Supabase ก่อนใช้งานจริง

โปรเจกต์เวอร์ชันนี้ใช้ data/mock persistence เพื่อให้รันได้ทันที เพราะยังไม่มี Supabase URL/key อยู่ใน repository. ตั้งค่า environment จาก `.env.example` แล้วเปลี่ยน provider ใน `components/providers.tsx` และ data layer ใน `lib/spaces.ts` ไปใช้ Supabase Auth/ตาราง `spaces`, `bookings` ตาม proposal. สำหรับ production ควรย้าย mutation login, create booking และ cancel booking ไปเป็น Server Actions พร้อมตรวจ session และ policy/RLS ในฐานข้อมูล.
