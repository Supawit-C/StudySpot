# Final Project Proposal — StudySpot
สมาชิก: พันธวีร์ ธรรมคุณ 682110183, ศุภวิชญ์ ชัยรัตน์ 682110105, สัฏฐี ทำทอง 682110197

## 1. แอปนี้ทำอะไร ใครใช้
StudySpot คือระบบค้นหาและจองพื้นที่อ่านหนังสือหรือห้องทำงานกลุ่มภายในมหาวิทยาลัย
สำหรับนักศึกษาที่ต้องการดูว่าห้องใดว่าง รองรับกี่คน และมีอุปกรณ์อะไรบ้าง ก่อนเลือกช่วงเวลา
และจองผ่านแอป ปัจจุบันข้อมูลห้องกระจัดกระจายและต้องเดินหาเอง ผู้ใช้ต้องสมัครสมาชิกหรือ login ก่อนจอง และดูได้เฉพาะรายการจองของตนเอง

## 2. หน้าที่จะมี (อย่างน้อย 4 route)
| Route | หน้านี้ทำอะไร |
|---|---|
| / | หน้าแรก — แนะนำพื้นที่ยอดนิยมและลิงก์ไปหน้าค้นหาห้อง |
| /login | ฟอร์มเข้าสู่ระบบด้วยอีเมลและรหัสผ่าน |
| /register | ฟอร์มสมัครสมาชิกด้วยชื่อ อีเมล และรหัสผ่าน |
| /spaces | รายการพื้นที่ทั้งหมด + ค้นหา + กรองตามอาคาร จำนวนที่นั่ง และอุปกรณ์ (คำค้นอยู่ใน URL) |
| /spaces/[id] | รายละเอียดห้อง เช่น รูป ความจุ อุปกรณ์ ตารางเวลาว่าง และปุ่มเริ่มจอง/เก็บเป็นรายการโปรด |
| /book/[id] | เลือกวันและช่วงเวลาจอง แล้วกรอกฟอร์มผู้จอง — ต้อง login ก่อนเข้า |
| /my-bookings | รายการจองของฉัน พร้อมปุ่มยกเลิกการจอง |
| /favorites | ห้องที่บันทึกเป็นรายการโปรดบน client |

## 3. Server หรือ Client — และทำไม
| ส่วนของแอป | Server / Client | เหตุผล |
|---|---|---|
| layout + หน้า / | Server | แสดงโครงหน้าและข้อมูลคงที่ ไม่มี state หรือ event handler จึงไม่ต้องส่ง JS เพิ่ม |
| /spaces รายการห้อง | Server | ดึงข้อมูลห้องจาก Supabase และอ่าน search params บน server; ใช้ ISR revalidate 1 ชั่วโมง เพราะข้อมูลห้องเปลี่ยนไม่บ่อย |
| /spaces/[id] รายละเอียด + ตารางว่าง | Server | ดึงข้อมูลตาม id และเวลาว่างล่าสุดทุก request เพราะมีคนจองเปลี่ยนสถานะได้ตลอด |
| ช่องค้นหา + filter | Client | ต้องใช้ onChange, debounce และเขียนคำค้น/ตัวกรองกลับ URL ด้วย useSearchParams |
| ปุ่มรายการโปรด | Client | ต้องกดแล้วเปลี่ยนทันที และอ่าน/เขียน localStorage ผ่าน FavoritesContext |
| ตารางเลือกเวลา + BookingProvider | Client | ผู้ใช้เลือก/ยกเลิกเวลาแบบทันที; Context เก็บเวลาที่เลือกให้หลาย component โดยไม่ prop drilling |
| Login/Register form | Client | react-hook-form + zod ต้องใช้ state และ event handler เพื่อ validate ก่อนส่ง |
| Navigation ที่แสดงชื่อผู้ใช้/ปุ่ม logout | Client | ต้องอ่าน session จาก AuthProvider แล้วเปลี่ยน UI ตามสถานะ login |
| createBooking, cancelBooking, signIn/signUp | Server Action | ตรวจ session และสิทธิ์เจ้าของข้อมูลก่อนเขียน Supabase โดยไม่ให้โค้ดที่แตะฐานข้อมูลหรือรหัสผ่านหลุดไป browser |

## 4. ข้อมูลมาจากไหน + จุดที่ต้องเขียนข้อมูลกลับ
- แหล่งข้อมูล: Supabase — ตาราง `spaces` เก็บข้อมูลห้อง, `bookings` เก็บวัน/เวลาและ `user_id` ของผู้จอง, และ Supabase Auth สำหรับบัญชีผู้ใช้ หน้า `/spaces` ใช้ ISR 1 ชั่วโมง ส่วนหน้ารายละเอียด/ช่วงเวลาว่างใช้ SSR เพื่อให้ข้อมูลการจองล่าสุด
- mutation (Server Action / Route Handler) ที่จุดไหน: `signUp`, `signIn`, `signOut` สำหรับบัญชีผู้ใช้; `createBooking` จากฟอร์ม `/book/[id]` ตรวจว่า login แล้ว ช่วงเวลายังว่าง และเลือกไม่เกิน 4 ชั่วโมงก่อนบันทึก; `cancelBooking` ใน `/my-bookings` ยกเลิกได้เฉพาะรายการของผู้ใช้คนนั้น แล้ว `revalidatePath()` อัปเดตตารางเวลา

## 5. แบ่งงานกันยังไง
- พันธวีร์ ธรรมคุณ: ตั้งค่า Supabase Auth/ฐานข้อมูล, ทำ /spaces และ /spaces/[id], search/filter/query params, SSR/ISR และ deploy บน Vercel
- ศุภวิชญ์ ชัยรัตน์: ทำ /login, /register, AuthProvider, BookingProvider, ตารางเลือกเวลา, /book/[id] และ react-hook-form + zod
- สัฏฐี ทำทอง: ทำ /my-bookings, favorites, responsive UI, ทดสอบ edge cases และช่วยเขียน README/คอมเมนต์อธิบาย Server/Client
