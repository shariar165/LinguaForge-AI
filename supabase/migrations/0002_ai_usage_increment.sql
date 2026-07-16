-- ============================= atomic AI usage increment =============================
-- Replaces the backend's read-then-upsert (racy under concurrent requests) with a
-- single atomic statement: increments today's counter only while the user is below
-- the daily cap. Returns the new count, or -1 when the user is at the cap.
-- Called by the backend with the service role key; not executable by app users.
create or replace function public.increment_ai_usage (p_user_id uuid, p_limit integer)
returns integer
language plpgsql
security definer set search_path = ''
as $$
declare
  v_count integer;
begin
  if p_limit <= 0 then
    return -1;
  end if;

  insert into public.ai_usage (user_id, date, message_count)
  values (p_user_id, (now() at time zone 'utc')::date, 1)
  on conflict (user_id, date) do update
    set message_count = public.ai_usage.message_count + 1
    where public.ai_usage.message_count < p_limit
  returning message_count into v_count;

  -- null means the conflict update was skipped: the user is already at the cap
  return coalesce(v_count, -1);
end;
$$;

revoke execute on function public.increment_ai_usage (uuid, integer) from public, anon, authenticated;
