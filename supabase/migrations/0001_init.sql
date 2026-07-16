-- LinguaVerse AI — initial schema
-- Run this in the Supabase SQL editor (or `supabase db push`) on a fresh project.

-- ============================= profiles =============================
create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  username text unique check (char_length(username) between 3 and 24),
  avatar_url text,
  xp integer not null default 0 check (xp >= 0),
  daily_goal_minutes integer not null default 10 check (daily_goal_minutes between 5 and 120),
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

create policy "Users can view their own profile"
  on public.profiles for select using (auth.uid () = id);

create policy "Users can update their own profile"
  on public.profiles for update using (auth.uid () = id);

-- Auto-create a profile row when a user signs up
create function public.handle_new_user ()
returns trigger
language plpgsql
security definer set search_path = ''
as $$
begin
  insert into public.profiles (id, username)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'username', split_part(new.email, '@', 1) || '_' || left(new.id::text, 4))
  );
  insert into public.streaks (user_id) values (new.id);
  return new;
end;
$$;

-- ============================= lessons =============================
create table public.lessons (
  id text primary key,
  unit integer not null,
  unit_title text not null,
  level text not null check (level in ('A1', 'A2', 'B1')),
  "order" integer not null,
  title text not null,
  description text not null default '',
  xp_reward integer not null default 20,
  content jsonb not null,
  unique (unit, "order")
);

alter table public.lessons enable row level security;

create policy "Lessons are readable by authenticated users"
  on public.lessons for select to authenticated using (true);

-- ============================= user_progress =============================
create table public.user_progress (
  user_id uuid not null references public.profiles (id) on delete cascade,
  lesson_id text not null references public.lessons (id) on delete cascade,
  status text not null default 'in_progress' check (status in ('in_progress', 'completed')),
  quiz_score integer check (quiz_score between 0 and 100),
  completed_at timestamptz,
  updated_at timestamptz not null default now(),
  primary key (user_id, lesson_id)
);

alter table public.user_progress enable row level security;

create policy "Users manage their own progress"
  on public.user_progress for all using (auth.uid () = user_id) with check (auth.uid () = user_id);

-- ============================= streaks =============================
create table public.streaks (
  user_id uuid primary key references public.profiles (id) on delete cascade,
  current_streak integer not null default 0 check (current_streak >= 0),
  longest_streak integer not null default 0 check (longest_streak >= 0),
  last_active_date date
);

alter table public.streaks enable row level security;

create policy "Users manage their own streak"
  on public.streaks for all using (auth.uid () = user_id) with check (auth.uid () = user_id);

-- ============================= saved_words =============================
create table public.saved_words (
  id bigint generated always as identity primary key,
  user_id uuid not null references public.profiles (id) on delete cascade,
  word text not null check (char_length(word) between 1 and 100),
  definition text not null default '',
  example text not null default '',
  created_at timestamptz not null default now(),
  unique (user_id, word)
);

alter table public.saved_words enable row level security;

create policy "Users manage their own saved words"
  on public.saved_words for all using (auth.uid () = user_id) with check (auth.uid () = user_id);

-- ============================= achievements =============================
create table public.achievements (
  id text primary key,
  title text not null,
  description text not null,
  icon text not null default 'award',
  requirement_kind text not null check (requirement_kind in ('lessons_completed', 'streak_days', 'xp_total', 'words_saved')),
  requirement_value integer not null check (requirement_value > 0)
);

alter table public.achievements enable row level security;

create policy "Achievements are readable by authenticated users"
  on public.achievements for select to authenticated using (true);

create table public.user_achievements (
  user_id uuid not null references public.profiles (id) on delete cascade,
  achievement_id text not null references public.achievements (id) on delete cascade,
  unlocked_at timestamptz not null default now(),
  primary key (user_id, achievement_id)
);

alter table public.user_achievements enable row level security;

create policy "Users manage their own achievements"
  on public.user_achievements for all using (auth.uid () = user_id) with check (auth.uid () = user_id);

-- ============================= ai_usage =============================
-- Written only by the backend (service role). No user-facing policies:
-- RLS enabled with no policies blocks all access via the anon/authenticated keys.
create table public.ai_usage (
  user_id uuid not null references public.profiles (id) on delete cascade,
  date date not null,
  message_count integer not null default 0 check (message_count >= 0),
  primary key (user_id, date)
);

alter table public.ai_usage enable row level security;

create policy "Users can read their own usage"
  on public.ai_usage for select using (auth.uid () = user_id);

-- ============================= xp / streak helper =============================
-- Atomic server-side function called after completing a lesson: adds XP and
-- advances the streak. security definer so it can update both tables safely,
-- but it only ever touches the calling user's rows.
create function public.complete_lesson (p_lesson_id text, p_quiz_score integer)
returns void
language plpgsql
security definer set search_path = ''
as $$
declare
  v_user uuid := auth.uid();
  v_xp integer;
  v_today date := (now() at time zone 'utc')::date;
  v_last date;
  v_already_completed boolean;
begin
  if v_user is null then
    raise exception 'not authenticated';
  end if;

  select xp_reward into v_xp from public.lessons where id = p_lesson_id;
  if v_xp is null then
    raise exception 'unknown lesson';
  end if;

  select status = 'completed' into v_already_completed
  from public.user_progress where user_id = v_user and lesson_id = p_lesson_id;

  insert into public.user_progress (user_id, lesson_id, status, quiz_score, completed_at, updated_at)
  values (v_user, p_lesson_id, 'completed', p_quiz_score, now(), now())
  on conflict (user_id, lesson_id) do update
    set status = 'completed',
        quiz_score = greatest(coalesce(public.user_progress.quiz_score, 0), excluded.quiz_score),
        completed_at = coalesce(public.user_progress.completed_at, now()),
        updated_at = now();

  -- XP only the first time a lesson is completed (no farming)
  if not coalesce(v_already_completed, false) then
    update public.profiles set xp = xp + v_xp where id = v_user;
  end if;

  select last_active_date into v_last from public.streaks where user_id = v_user;
  if v_last is null or v_last < v_today - 1 then
    update public.streaks
      set current_streak = 1, longest_streak = greatest(longest_streak, 1), last_active_date = v_today
      where user_id = v_user;
  elsif v_last = v_today - 1 then
    update public.streaks
      set current_streak = current_streak + 1,
          longest_streak = greatest(longest_streak, current_streak + 1),
          last_active_date = v_today
      where user_id = v_user;
  end if;
end;
$$;

-- Attach the signup trigger after all referenced tables exist
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user ();
