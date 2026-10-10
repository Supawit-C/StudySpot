# StudySpot

เว็บแอปค้นหาและจองพื้นที่อ่านหนังสือ/ทำงานกลุ่มในมหาวิทยาลัย ตาม proposal ใน `proposal-studyspot.md`

**Production:** https://studyspot-delta.vercel.app

Stack: Next.js 15 (App Router) · React 19 · Supabase (Postgres + Auth) · react-hook-form + zod · Vercel

## เริ่มใช้งาน

### โหมดเดโม (ไม่ต้องตั้งค่าอะไร)

```bash
npm install
npm run dev
```

ถ้ายังไม่มี env ของ Supabase แอปจะทำงานใน **โหมดเดโม** อัตโนมัติ (`lib/mode.ts`)

- ข้อมูลห้องมาจาก `lib/seed.ts` (ชุดเดียวกับ seed ในฐานข้อมูล) — ISR/SSG ทำงานเหมือนเดิม
- login/register รับอีเมลและรหัสผ่านใดก็ได้ที่ผ่าน zod แล้วเก็บผู้ใช้ใน httpOnly cookie
- การจองเขียนผ่าน Server Action ลง httpOnly cookie (`lib/demo-store.ts`) — validate และกันจองซ้อนเหมือนของจริง แต่เห็นเฉพาะในเบราว์เซอร์นั้น

### เชื่อม Supabase (ใช้งานจริง)

1. สร้างโปรเจกต์ที่ [supabase.com](https://supabase.com) แล้วเปิด **SQL Editor** → วางเนื้อหา `supabase/schema.sql` ทั้งไฟล์ → Run แล้วรัน `supabase/favorites.sql` เพื่อเปิดใช้รายการโปรดแยกตามบัญชี
2. (สำหรับเดโม) Authentication → Sign In / Providers → Email → ปิด **Confirm email** เพื่อสมัครแล้วเข้าใช้ได้ทันที
3. คัดลอก `.env.example` เป็น `.env.local` แล้วใส่ค่าจาก Project Settings → API
4. รัน `npm run dev` แล้วเปิด [http://localhost:3000](http://localhost:3000) — แอปจะสลับไปใช้ Supabase เอง

บน Vercel ให้ใส่ `NEXT_PUBLIC_SUPABASE_URL` และ `NEXT_PUBLIC_SUPABASE_ANON_KEY` ใน Project Settings → Environment Variables แล้ว redeploy

## Routes และวิธี render

| Route | Component | Rendering | เหตุผล |
|---|---|---|---|
| `/` | Server | **ISR** (`revalidate = 3600`) | ห้องยอดนิยมเปลี่ยนน้อย เสิร์ฟ HTML ที่ cache ไว้ได้เร็ว และ regenerate เบื้องหลังทุก 1 ชม. |
| `/spaces` | Server + `SpaceFilters` (Client) | **ISR** (`revalidate = 3600`) | รายการห้องเหมือนกันทุกคน ไม่ต้อง query DB ทุก request; ตัวกรองทำบน client จาก URL จึงไม่ทำให้หน้ากลายเป็น dynamic |
| `/spaces/[id]` | Server + `FavoriteButton` (Client) | **SSG + ISR** (`generateStaticParams`, `revalidate = 3600`) | สร้างหน้าของทุกห้องไว้ตอน build เร็วและดีต่อ SEO; ห้องใหม่ถูก render เมื่อมีคนเข้าครั้งแรก |
| `/book/[id]` | Server + `BookingForm` (Client) | **SSR** (`dynamic = "force-dynamic"`) | ช่วงเวลาว่างต้องสดทุก request ถ้า cache อาจเห็นช่วงที่ถูกจองแล้วว่าว่าง; ตรวจ login บน server ก่อนส่งหน้า |
| `/my-bookings` | Server + `CancelBookingButton` (Client) | **SSR** (`dynamic = "force-dynamic"`) | ข้อมูลส่วนตัวต่อผู้ใช้ อ่านจาก session cookie ทุก request |
| `/favorites` | Server + `FavoritesList` (Client) | **ISR** (`revalidate = 3600`) | ข้อมูลห้องจาก server, ส่วนรายการโปรดของผู้ใช้ดึงจาก Supabase หลังอ่าน session |
| `/login`, `/register` | Server + `AuthForm` (Client) | Dynamic (อ่าน `?next=`) | server อ่าน `next` แล้วส่งต่อให้ฟอร์ม เพื่อพากลับหน้าที่ค้างไว้หลัง login |

## Server Component vs Client Component

หลักที่ใช้: **เป็น Server Component เป็นค่าเริ่มต้น** (ดึงข้อมูลได้ตรง, ไม่ส่ง JS ไป browser, key ไม่หลุด) และแยกเฉพาะส่วนที่ต้องมี state / event / browser API ออกเป็น Client Component ชิ้นเล็ก ๆ ทุกไฟล์มีคอมเมนต์บรรทัดแรกอธิบายเหตุผล

| ไฟล์ | ชนิด | เหตุผล |
|---|---|---|
| `app/**/page.tsx`, `app/layout.tsx` | Server | ดึงข้อมูลจาก Supabase บน server, กำหนด ISR/SSR |
| `components/footer.tsx` | Server | เนื้อหาคงที่ ไม่มี interaction |
| `components/providers.tsx` | Client | React Context + `useState`/`useEffect`/`fetch` รายการโปรดของ account |
| `components/header.tsx` | Client | อ่านผู้ใช้จาก AuthContext, ปุ่ม logout (ถ้าอ่าน session ใน layout ทุกหน้าจะกลายเป็น dynamic) |
| `components/space-filters.tsx` | Client | ช่องค้นหา/ตัวกรอง `onChange` + `useSearchParams` |
| `components/space-card.tsx`, `favorite-button.tsx`, `favorites-list.tsx` | Client | toggle รายการโปรดใน FavoritesContext |
| `components/auth-form.tsx`, `booking-form.tsx` | Client | ฟอร์ม react-hook-form ต้องใช้ hooks และ event |
| `components/cancel-booking-button.tsx` | Client | `onClick` + สถานะ pending (`useTransition`) |

## Mutation (Server Actions)

| Action | ไฟล์ | ทำอะไร |
|---|---|---|
| `createBooking` | `app/actions/bookings.ts` | ตรวจ session → validate ด้วย `bookingSchema` (zod) → insert → `revalidatePath("/my-bookings")` → redirect |
| `cancelBooking` | `app/actions/bookings.ts` | ตรวจ session → ลบเฉพาะแถวของตัวเอง → `revalidatePath("/my-bookings")` |
| `setFavorite` | `app/actions/favorites.ts` | ตรวจ session → เพิ่ม/ลบ favorite ของ user ปัจจุบันภายใต้ RLS |
| `signIn`, `signUp`, `signOut` | `app/actions/auth.ts` | Supabase Auth บน server ตั้ง session cookie (โหมดเดโม: ตั้ง cookie ผู้ใช้เอง) |

Route Handler `GET /api/me` (`app/api/me/route.ts`) คืนผู้ใช้ปัจจุบันให้ AuthContext เพราะ session cookie เป็น httpOnly ฝั่ง client อ่านเองไม่ได้

ด่านป้องกันซ้อนกัน 3 ชั้น: zod ฝั่ง client (UX) → zod ใน Server Action (ไม่เชื่อ input จาก browser) → RLS + trigger `prevent_slot_overlap` ใน Postgres (กันจองซ้อนแม้กดพร้อมกัน)

## Global State (React Context)

- `AuthContext` — ผู้ใช้ที่ login อยู่ ดึงจาก `/api/me` และเรียก `refresh()` หลัง login/logout; ใช้ใน Header และฟอร์ม login
- `FavoritesContext` — รายการโปรดของผู้ใช้ปัจจุบัน ดึงจาก `GET /api/favorites` และเพิ่ม/ลบผ่าน Server Action

## ฟอร์มและ Validation

schema ทั้งหมดอยู่ใน `lib/schemas.ts` ใช้ร่วมกันทั้ง `zodResolver` ฝั่ง client และ `safeParse` ใน Server Action

- `loginSchema` / `registerSchema` — อีเมลถูกรูปแบบ, รหัสผ่าน ≥ 6 ตัว, ชื่อ 2–50 ตัว
- `bookingSchema` — วันที่ต้องไม่ย้อนหลัง, เลือก 1–4 ช่วงเวลาจากรายการที่กำหนด ไม่ซ้ำกัน, หมายเหตุ ≤ 200 ตัว

## Responsive

CSS breakpoint ที่ 800px (layout 1 คอลัมน์, เมนูแนวนอนเลื่อนได้, ตารางการจองเปลี่ยนเป็นการ์ด) และ 500px (การ์ดห้อง 1 คอลัมน์, ช่องเวลา 2 คอลัมน์)

## สมาชิกผู้จัดทำและการแบ่งงาน (Contribution Log)

| รหัสนักศึกษา | ชื่อ-นามสกุล | หน้าที่และความรับผิดชอบ (Contribution) |
|---|---|---|
| **682110183** | **พันธวีร์ ธรรมคุณ** | - ออกแบบและตั้งค่าฐานข้อมูล Supabase (Database Schema, Tables, Constraints & RLS)<br>- พัฒนาหน้า `/spaces` (รายการห้อง) และ `/spaces/[id]` (รายละเอียดห้องแบบไดนามิก)<br>- ออกแบบระบบค้นหา (Search) ตัวกรอง (Filters) และจัดการ Query Parameters<br>- วางสถาปัตยกรรม Data Fetching (ISR `revalidate = 3600` และ SSG `generateStaticParams`)<br>- จัดการตั้งค่า Environment Variables และ Deploy ระบบขึ้น Vercel |
| **682110105** | **ศุภวิชญ์ ชัยรัตน์** | - พัฒนาระบบยืนยันตัวตน หน้า `/login`, `/register` และ Server Actions (`signIn`, `signUp`, `signOut`)<br>- พัฒนา Global State ฝั่ง Client (`AuthContext`, `AppProviders`) และ Route Handler `/api/me`<br>- พัฒนาหน้าจองห้อง `/book/[id]` และระบบเลือก Interactive Time Slots (จำกัดสูงสุด 4 ช่วงเวลา)<br>- ออกแบบระบบ Data Validation ด้วย `zod` + `react-hook-form` ครอบคลุมทั้ง Client-side และ Server-side |
| **682110197** | **สัฏฐี ทำทอง** | - พัฒนาหน้า `/my-bookings` (รายการประวัติการจอง) พร้อมปุ่มยกเลิกการจอง (`cancelBooking` Server Action)<br>- พัฒนาหน้า `/favorites` และระบบบันทึกรายการโปรด (`FavoritesContext` เชื่อมต่อ `localStorage`)<br>- ออกแบบ Responsive Design (CSS Grid/Flexbox รองรับทั้งจอคอมพิวเตอร์และมือถือ)<br>- จัดทำเอกสารสรุปโครงการ, เขียน `README.md`, ใส่คอมเมนต์อธิบาย Server/Client Components และทดสอบ Edge Cases |

