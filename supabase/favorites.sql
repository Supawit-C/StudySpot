-- เพิ่มตารางรายการโปรดที่ผูกกับบัญชีผู้ใช้
-- รันไฟล์นี้ใน Supabase Dashboard → SQL Editor หลังจากรัน schema.sql แล้ว

create table if not exists public.favorites (
  user_id uuid not null references auth.users(id) on delete cascade,
  space_id text not null references public.spaces(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, space_id)
);

alter table public.favorites enable row level security;

drop policy if exists "users read own favorites" on public.favorites;
create policy "users read own favorites" on public.favorites
  for select using ((select auth.uid()) = user_id);

drop policy if exists "users add own favorites" on public.favorites;
create policy "users add own favorites" on public.favorites
  for insert with check ((select auth.uid()) = user_id);

drop policy if exists "users delete own favorites" on public.favorites;
create policy "users delete own favorites" on public.favorites
  for delete using ((select auth.uid()) = user_id);
