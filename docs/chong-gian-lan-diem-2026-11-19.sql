-- Lửa Đá — CHỐNG GIAN LẬN ĐIỂM (tuỳ chọn), 19/11/2026
-- Hai con số do máy người chơi tự báo lên và người rành kỹ thuật sửa được:
--   players/<uid>.rk = [điểm mùa, mã mùa]         → bảng xếp hạng mùa
--   players/<uid>.cg = [công hiến, mã liên minh]  → cấp liên minh
-- Máy chủ không chạy được luật chơi nên không tự tính lại điểm; tệp này đặt TRẦN TĂNG ngay ở máy chủ:
--   · điểm mùa: mỗi phút tăng tối đa 60 (cộng 40 điểm dư), mỗi lần ghi không quá 400. Chơi thật không bao giờ chạm trần này.
--   · công hiến: mỗi người mỗi ngày tăng tối đa 200, đúng bằng giới hạn trong game. Máy chủ tự đếm theo ngày ở bảng ld_score_day.
--   Vượt trần thì máy chủ ÉP con số về trần (không báo lỗi, không chặn các dữ liệu khác trong cùng lần ghi).
--   Quản trị viên không bị ép. Có lỗi bất ngờ trong lúc kiểm thì cho qua như chưa có tệp này (không làm hỏng việc lưu của người chơi).
--
-- CÁCH CHẠY: Supabase → SQL Editor → dán cả tệp → Run. Cả tệp là MỘT giao dịch: lỗi ở đâu thì không có gì thay đổi.
-- LƯU Ý: đoạn này CHƯA được chạy thử trên máy chủ thật. Nếu báo lỗi, chụp lại gửi để sửa. Gỡ bỏ: drop trigger ld_score_guard on public.docs;

begin;

create table if not exists public.ld_score_day (
  user_id uuid primary key references auth.users(id) on delete cascade,
  day     date not null default current_date,
  cg_inc  numeric not null default 0
);
alter table public.ld_score_day enable row level security;     -- không có policy: chỉ hàm bên dưới (security definer) đọc / ghi
revoke all on public.ld_score_day from public, anon, authenticated;

create or replace function public.ld_score_guard() returns trigger
language plpgsql security definer set search_path = '' as $$
declare
  od   jsonb;
  dt   numeric;      -- số phút từ lần ghi trước của tài liệu này
  v    numeric;
  o    numeric;
  cap  numeric;
  inc  numeric;
  room numeric;
  d    public.ld_score_day%rowtype;
begin
  if split_part(new.path, '/', 1) <> 'players' then return new; end if;
  begin
    if public.ld_is_admin() then return new; end if;
    od := case when tg_op = 'UPDATE' then old.data else '{}'::jsonb end;
    dt := case when tg_op = 'UPDATE' then greatest(0, extract(epoch from (now() - old.updated_at)) / 60.0) else 1 end;

    -- điểm mùa
    if jsonb_typeof(new.data -> 'rk') = 'array' and jsonb_array_length(new.data -> 'rk') = 2
       and jsonb_typeof(new.data -> 'rk' -> 0) = 'number' then
      v := (new.data -> 'rk' ->> 0)::numeric;
      o := 0;
      if jsonb_typeof(od -> 'rk') = 'array' and jsonb_array_length(od -> 'rk') = 2
         and jsonb_typeof(od -> 'rk' -> 0) = 'number'
         and (od -> 'rk' ->> 1) is not distinct from (new.data -> 'rk' ->> 1) then
        o := (od -> 'rk' ->> 0)::numeric;       -- cùng mùa: so với điểm đang có; sang mùa mới thì tính từ 0
      end if;
      cap := o + least(400, 60 * dt + 40);
      if v > cap then new.data := jsonb_set(new.data, '{rk,0}', to_jsonb(floor(cap))); end if;
      if v < 0 then new.data := jsonb_set(new.data, '{rk,0}', to_jsonb(0)); end if;
    end if;

    -- công hiến liên minh
    if jsonb_typeof(new.data -> 'cg') = 'array' and jsonb_array_length(new.data -> 'cg') = 2
       and jsonb_typeof(new.data -> 'cg' -> 0) = 'number' then
      v := (new.data -> 'cg' ->> 0)::numeric;
      o := 0;
      if jsonb_typeof(od -> 'cg') = 'array' and jsonb_array_length(od -> 'cg') = 2
         and jsonb_typeof(od -> 'cg' -> 0) = 'number'
         and (od -> 'cg' ->> 1) is not distinct from (new.data -> 'cg' ->> 1) then
        o := (od -> 'cg' ->> 0)::numeric;       -- cùng liên minh: so với công hiến đang có; đổi liên minh thì tính từ 0
      end if;
      inc := v - o;
      if inc > 0 then
        insert into public.ld_score_day (user_id) values (auth.uid()) on conflict (user_id) do nothing;
        select * into d from public.ld_score_day where user_id = auth.uid() for update;
        if d.day <> current_date then
          update public.ld_score_day set day = current_date, cg_inc = 0 where user_id = auth.uid();
          d.cg_inc := 0;
        end if;
        room := greatest(0, 200 - d.cg_inc);
        if inc > room then
          inc := room;
          new.data := jsonb_set(new.data, '{cg,0}', to_jsonb(floor(o + room)));
        end if;
        update public.ld_score_day set cg_inc = cg_inc + inc where user_id = auth.uid();
      end if;
      if v < 0 then new.data := jsonb_set(new.data, '{cg,0}', to_jsonb(0)); end if;
    end if;
  exception when others then
    return new;     -- có gì bất ngờ thì cho qua, không làm hỏng việc lưu của người chơi
  end;
  return new;
end $$;
revoke all on function public.ld_score_guard() from public, anon, authenticated;

drop trigger if exists ld_score_guard on public.docs;
create trigger ld_score_guard before insert or update on public.docs
  for each row execute function public.ld_score_guard();

commit;

select 'Lửa Đá: đã đặt trần tăng điểm mùa và công hiến ở máy chủ' as ket_qua;
