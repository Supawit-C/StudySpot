-- StudySpot database schema
-- รันไฟล์นี้ทั้งไฟล์ใน Supabase Dashboard → SQL Editor ครั้งเดียว

-- ---------- spaces: ข้อมูลห้อง (ทุกคนอ่านได้ แก้ไขไม่ได้จากฝั่งแอป) ----------
create table if not exists public.spaces (
  id text primary key,
  name text not null,
  building text not null,
  floor text not null,
  capacity int not null check (capacity > 0),
  type text not null,
  image text not null,
  description text not null,
  amenities text[] not null default '{}',
  hours text not null
);

alter table public.spaces enable row level security;
drop policy if exists "spaces are readable by everyone" on public.spaces;
create policy "spaces are readable by everyone" on public.spaces for select using (true);

-- ---------- bookings: การจองของผู้ใช้ ----------
create table if not exists public.bookings (
  id uuid primary key default gen_random_uuid(),
  space_id text not null references public.spaces(id) on delete cascade,
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  date date not null,
  slots text[] not null check (cardinality(slots) between 1 and 4),
  note text not null default '' check (char_length(note) <= 200),
  created_at timestamptz not null default now()
);

create index if not exists bookings_space_date_idx on public.bookings (space_id, date);

alter table public.bookings enable row level security;
drop policy if exists "users read own bookings" on public.bookings;
create policy "users read own bookings" on public.bookings for select using (auth.uid() = user_id);
drop policy if exists "users create own bookings" on public.bookings;
create policy "users create own bookings" on public.bookings for insert with check (auth.uid() = user_id);
drop policy if exists "users delete own bookings" on public.bookings;
create policy "users delete own bookings" on public.bookings for delete using (auth.uid() = user_id);

-- กันจองช่วงเวลาซ้อนกันในระดับฐานข้อมูล (กัน race condition ที่ตรวจในแอปไม่ทัน)
-- security definer เพื่อให้มองเห็นการจองของทุกคน (ไม่ติด RLS ที่ให้เห็นแค่ของตัวเอง)
create or replace function public.prevent_slot_overlap() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  perform pg_advisory_xact_lock(hashtext(new.space_id || new.date::text));
  if exists (
    select 1 from public.bookings b
    where b.space_id = new.space_id and b.date = new.date and b.slots && new.slots
  ) then
    raise exception 'SLOT_TAKEN' using errcode = 'P0001';
  end if;
  return new;
end;
$$;

drop trigger if exists bookings_no_overlap on public.bookings;
create trigger bookings_no_overlap before insert on public.bookings
  for each row execute function public.prevent_slot_overlap();

-- ช่วงเวลาที่ถูกจองแล้ว: คืนเฉพาะ slot ไม่เปิดเผยว่าใครจอง (RLS ปกติให้เห็นแค่ของตัวเอง)
create or replace function public.get_booked_slots(p_space_id text, p_date date)
returns setof text
language sql stable security definer set search_path = public as $$
  select unnest(slots) from public.bookings where space_id = p_space_id and date = p_date;
$$;

grant execute on function public.get_booked_slots(text, date) to anon, authenticated;

-- ---------- seed ----------
insert into public.spaces (id, name, building, floor, capacity, type, image, description, amenities, hours) values
  ('aurora-201', 'Aurora Study Lounge', 'Learning Commons', 'ชั้น 2', 8, 'ห้องกลุ่ม', 'https://images.unsplash.com/photo-1497366811353-6870744d04b2?auto=format&fit=crop&w=1000&q=85', 'ห้องทำงานกลุ่มที่สว่าง โปร่ง และเงียบพอดีสำหรับทีมที่ต้องการโฟกัสงานร่วมกัน', array['จอ 55 นิ้ว', 'ไวท์บอร์ด', 'ปลั๊กไฟ', 'Wi‑Fi'], '08:00 – 20:00'),
  ('nest-104', 'The Nest', 'Central Library', 'ชั้น 1', 4, 'ห้องเงียบ', 'https://images.unsplash.com/photo-1524758631624-e2822e304c36?auto=format&fit=crop&w=1000&q=85', 'มุมเล็กสำหรับติวงานหรือประชุมแบบใกล้ชิด ภายในห้องสมุดกลาง', array['จอ 40 นิ้ว', 'Wi‑Fi', 'ปลั๊กไฟ'], '08:00 – 22:00'),
  ('canopy-301', 'Canopy Room', 'Engineering', 'ชั้น 3', 12, 'ห้องกลุ่ม', 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1000&q=85', 'พื้นที่ทำงานขนาดใหญ่สำหรับ workshop การนำเสนอ และโปรเจกต์กลุ่ม', array['โปรเจกเตอร์', 'ไวท์บอร์ด', 'Wi‑Fi', 'ปลั๊กไฟ'], '09:00 – 19:00'),
  ('focus-14', 'Focus Pod 14', 'Learning Commons', 'ชั้น 4', 2, 'โฟกัสพอด', 'https://images.unsplash.com/photo-1497215728101-856f4ea42174?auto=format&fit=crop&w=1000&q=85', 'พื้นที่ส่วนตัวสำหรับอ่านหนังสือออนไลน์ สัมภาษณ์ หรือประชุมแบบสองคน', array['จอ 27 นิ้ว', 'Wi‑Fi', 'ปลั๊กไฟ'], '08:00 – 20:00'),
  ('orbit-106', 'Orbit Seminar', 'Science', 'ชั้น 1', 20, 'ห้องสัมมนา', 'https://images.unsplash.com/photo-1517048676732-d65bc937f952?auto=format&fit=crop&w=1000&q=85', 'ห้องสัมมนาเพื่อการเรียนรู้และนำเสนองาน พร้อมที่นั่งครบสำหรับกลุ่มใหญ่', array['โปรเจกเตอร์', 'ไมค์', 'ไวท์บอร์ด', 'Wi‑Fi'], '08:00 – 18:00'),
  ('terrace-07', 'Terrace Desk 07', 'Student Center', 'ชั้น 2', 1, 'โต๊ะเดี่ยว', 'https://images.unsplash.com/photo-1501504905252-473c47e087f8?auto=format&fit=crop&w=1000&q=85', 'โต๊ะริมหน้าต่างรับแสงธรรมชาติ สำหรับวันที่อยากอ่านหนังสือเงียบ ๆ คนเดียว', array['Wi‑Fi', 'ปลั๊กไฟ', 'วิวสวน'], '09:00 – 20:00')
on conflict (id) do nothing;
