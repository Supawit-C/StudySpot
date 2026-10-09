# StudySpot

เว็บแอปค้นหาและจองพื้นที่อ่านหนังสือ/ทำงานกลุ่มในมหาวิทยาลัย ตาม proposal ใน `proposal-studyspot.md`

**Production:** https://studyspot-delta.vercel.app

Stack: Next.js 15 (App Router) · React 19 · Supabase (Postgres + Auth) · react-hook-form + zod · Vercel

## เริ่มใช้งาน

1. สร้างโปรเจกต์ที่ [supabase.com](https://supabase.com) แล้วเปิด **SQL Editor** → วางเนื้อหา `supabase/schema.sql` ทั้งไฟล์ → Run
2. (สำหรับเดโม) Authentication → Sign In / Providers → Email → ปิด **Confirm email** เพื่อสมัครแล้วเข้าใช้ได้ทันที
3. คัดลอก `.env.example` เป็น `.env.local` แล้วใส่ค่าจาก Project Settings → API
4. รัน

```bash
npm install
npm run dev
```

เปิด [http://localhost:3000](http://localhost:3000)

บน Vercel ให้ใส่ `NEXT_PUBLIC_SUPABASE_URL` และ `NEXT_PUBLIC_SUPABASE_ANON_KEY` ใน Project Settings → Environment Variables แล้ว redeploy

## Routes และวิธี render

| Route | Component | Rendering | เหตุผล |
|---|---|---|---|
| `/` | Server | **ISR** (`revalidate = 3600`) | ห้องยอดนิยมเปลี่ยนน้อย เสิร์ฟ HTML ที่ cache ไว้ได้เร็ว และ regenerate เบื้องหลังทุก 1 ชม. |
| `/spaces` | Server + `SpaceFilters` (Client) | **ISR** (`revalidate = 3600`) | รายการห้องเหมือนกันทุกคน ไม่ต้อง query DB ทุก request; ตัวกรองทำบน client จาก URL จึงไม่ทำให้หน้ากลายเป็น dynamic |
| `/spaces/[id]` | Server + `FavoriteButton` (Client) | **SSG + ISR** (`generateStaticParams`, `revalidate = 3600`) | สร้างหน้าของทุกห้องไว้ตอน build เร็วและดีต่อ SEO; ห้องใหม่ถูก render เมื่อมีคนเข้าครั้งแรก |
| `/book/[id]` | Server + `BookingForm` (Client) | **SSR** (`dynamic = "force-dynamic"`) | ช่วงเวลาว่างต้องสดทุก request ถ้า cache อาจเห็นช่วงที่ถูกจองแล้วว่าว่าง; ตรวจ login บน server ก่อนส่งหน้า |
| `/my-bookings` | Server + `CancelBookingButton` (Client) | **SSR** (`dynamic = "force-dynamic"`) | ข้อมูลส่วนตัวต่อผู้ใช้ อ่านจาก session cookie ทุก request |
| `/favorites` | Server + `FavoritesList` (Client) | **ISR** (`revalidate = 3600`) | ข้อมูลห้องจาก server, ส่วนรายการโปรดอยู่ใน localStorage บน browser |
| `/login`, `/register` | Server + `AuthForm` (Client) | Dynamic (อ่าน `?next=`) | server อ่าน `next` แล้วส่งต่อให้ฟอร์ม เพื่อพากลับหน้าที่ค้างไว้หลัง login |

## Server Component vs Client Component

หลักที่ใช้: **เป็น Server Component เป็นค่าเริ่มต้น** (ดึงข้อมูลได้ตรง, ไม่ส่ง JS ไป browser, key ไม่หลุด) และแยกเฉพาะส่วนที่ต้องมี state / event / browser API ออกเป็น Client Component ชิ้นเล็ก ๆ ทุกไฟล์มีคอมเมนต์บรรทัดแรกอธิบายเหตุผล

| ไฟล์ | ชนิด | เหตุผล |
|---|---|---|
| `app/**/page.tsx`, `app/layout.tsx` | Server | ดึงข้อมูลจาก Supabase บน server, กำหนด ISR/SSR |
| `components/footer.tsx` | Server | เนื้อหาคงที่ ไม่มี interaction |
| `components/providers.tsx` | Client | React Context + `useState`/`useEffect`/`localStorage` |
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
| `signIn`, `signUp`, `signOut` | `app/actions/auth.ts` | Supabase Auth บน server ตั้ง session cookie |

ด่านป้องกันซ้อนกัน 3 ชั้น: zod ฝั่ง client (UX) → zod ใน Server Action (ไม่เชื่อ input จาก browser) → RLS + trigger `prevent_slot_overlap` ใน Postgres (กันจองซ้อนแม้กดพร้อมกัน)

## Global State (React Context)

- `AuthContext` — ผู้ใช้ที่ login อยู่ อ่านจาก Supabase session และ subscribe `onAuthStateChange`; ใช้ใน Header และฟอร์ม login
- `FavoritesContext` — รายการโปรด เก็บใน `localStorage` ใช้ร่วมกันระหว่าง SpaceCard, FavoriteButton และหน้า Favorites

## ฟอร์มและ Validation

schema ทั้งหมดอยู่ใน `lib/schemas.ts` ใช้ร่วมกันทั้ง `zodResolver` ฝั่ง client และ `safeParse` ใน Server Action

- `loginSchema` / `registerSchema` — อีเมลถูกรูปแบบ, รหัสผ่าน ≥ 6 ตัว, ชื่อ 2–50 ตัว
- `bookingSchema` — วันที่ต้องไม่ย้อนหลัง, เลือก 1–4 ช่วงเวลาจากรายการที่กำหนด ไม่ซ้ำกัน, หมายเหตุ ≤ 200 ตัว

## Responsive

CSS breakpoint ที่ 800px (layout 1 คอลัมน์, เมนูแนวนอนเลื่อนได้, ตารางการจองเปลี่ยนเป็นการ์ด) และ 500px (การ์ดห้อง 1 คอลัมน์, ช่องเวลา 2 คอลัมน์)
