-- CHỐNG GIAN LẬN ĐẬP ĐỒ: máy chủ quyết định thành công/thất bại và giữ cấp cường hoá.
-- Cách dùng: Supabase → SQL Editor → dán toàn bộ tệp này → Run (chạy lại nhiều lần cũng không sao).
-- Chưa chạy tệp này thì game vẫn đập đồ bình thường (tính trên máy người chơi như cũ).
-- Sau khi chạy: người chơi đã đăng nhập sẽ được máy chủ gieo tỉ lệ; cấp lưu ở bảng ld_enh, máy người chơi không tự sửa được.

create table if not exists public.ld_enh (
  user_id uuid not null references auth.users(id) on delete cascade,
  slot    text not null check (slot in ('wp','tl','ar','hd','sh','bd','bk','ft','ac')),
  lv      int  not null default 0 check (lv between 0 and 15),
  luck    int  not null default 0 check (luck between 0 and 6),
  updated timestamptz not null default now(),
  primary key (user_id, slot)
);
alter table public.ld_enh enable row level security;
drop policy if exists ld_enh_read on public.ld_enh;
create policy ld_enh_read on public.ld_enh for select to authenticated using (true);  -- ai cũng xem được cấp của nhau (bảng xếp hạng); KHÔNG có quyền ghi trực tiếp

-- p_slot: ô trang bị; p_cur: cấp hiện có trên máy (chỉ dùng MỘT lần khi máy chủ chưa có dòng nào cho ô đó, nhận tối đa +10 để người chơi cũ không mất cấp);
-- p_stone: người chơi có Đá hộ mệnh trong túi hay không.
create or replace function public.ld_dp_roll(p_slot text, p_cur int default 0, p_stone boolean default false) returns jsonb
language plpgsql security definer set search_path = '' as $$
declare
  uid   uuid := auth.uid();
  r     public.ld_enh%rowtype;
  rates int[] := array[100,100,100,90,80,70,60,50,40,33,27,22,18,14,10];
  n     int;
  rate  int;
  ok    boolean;
  used  boolean := false;
begin
  if uid is null then raise exception 'Cần đăng nhập'; end if;
  if p_slot not in ('wp','tl','ar','hd','sh','bd','bk','ft','ac') then raise exception 'Ô không hợp lệ'; end if;
  select * into r from public.ld_enh where user_id = uid and slot = p_slot for update;
  if not found then
    insert into public.ld_enh (user_id, slot, lv) values (uid, p_slot, least(greatest(coalesce(p_cur, 0), 0), 10)) returning * into r;
  end if;
  if r.lv >= 15 then return jsonb_build_object('ok', false, 'lv', r.lv, 'luck', r.luck, 'stone', false, 'max', true); end if;
  if now() - r.updated < interval '700 milliseconds' and r.updated > now() - interval '1 day' and r.lv > 0 then
    raise exception 'Đập nhanh quá, thử lại';   -- chặn bắn lệnh liên tục
  end if;
  n := r.lv + 1;
  rate := least(100, rates[n] + least(r.luck, 6) * 5);
  ok := (random() * 100) < rate;
  if ok then
    update public.ld_enh set lv = n, luck = 0, updated = now() where user_id = uid and slot = p_slot returning * into r;
  else
    if n >= 11 then
      if coalesce(p_stone, false) then used := true;
      else update public.ld_enh set lv = greatest(0, lv - 1) where user_id = uid and slot = p_slot; end if;
    end if;
    update public.ld_enh set luck = least(6, luck + 1), updated = now() where user_id = uid and slot = p_slot returning * into r;
  end if;
  return jsonb_build_object('ok', ok, 'lv', r.lv, 'luck', r.luck, 'stone', used, 'rate', rate);
end $$;
revoke all on function public.ld_dp_roll(text, int, boolean) from public, anon;
grant execute on function public.ld_dp_roll(text, int, boolean) to authenticated;

-- đọc lại toàn bộ cấp của chính mình (game gọi khi vào để máy và máy chủ khớp nhau)
create or replace function public.ld_dp_mine() returns jsonb
language sql stable security definer set search_path = '' as $$
  select coalesce(jsonb_object_agg(slot, jsonb_build_array(lv, luck)), '{}'::jsonb) from public.ld_enh where user_id = auth.uid()
$$;
revoke all on function public.ld_dp_mine() from public, anon;
grant execute on function public.ld_dp_mine() to authenticated;
