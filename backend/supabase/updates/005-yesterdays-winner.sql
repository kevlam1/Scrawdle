-- Update 005 (2026-11-07): yesterday's winner. One function, top_drawings, that returns the best
-- drawing(s) of a given day, for "Yesterday's winner" on the home screen and the leaderboard page.
--
-- Run ONCE, in the Supabase SQL Editor, on a project that already ran schema.sql plus updates 001 to
-- 004 (that's Kevin's project). A brand-new project doesn't need this file: schema.sql already
-- includes it. Running it a second time is harmless.
--
-- Step-by-step instructions, including how to check it worked, are under "Pending database updates"
-- at the top of ../../../CLAUDE.md. Until it runs, the game simply shows no winner; nothing breaks.
--
-- Why a function instead of reading the table: the public key may only read drawings dated within a
-- day of the database's own date, which is UTC (see "public can read today's visible drawings" in
-- schema.sql). In US time the database is already on tomorrow from late afternoon, so the player's
-- yesterday stops being readable each evening, even though the daily wipe hasn't deleted it yet.
-- This function returns only the winners (not every drawing), for days the wipe still keeps, and
-- leaves that read rule as it is. It stores nothing and keeps nothing longer.
--
-- (Numbering: a planned update that drops 'basic' and 'detailed' from the mode constraint was
-- mentioned in CLAUDE.md as "005"; it becomes 006.)

-- The best drawing of `target_day` among `modes`: the most thumbs up (at least one), then the fewest
-- thumbs down. Every drawing tied on both is returned, oldest first, up to `max_count` (at most 10).
-- Hidden drawings never count. Days outside what the daily wipe keeps (UTC today and yesterday, with a
-- day either side for players' local dates) return nothing, so this can't dig up anything older.
create or replace function public.top_drawings(target_day date, modes text[], max_count int default 3)
returns table (id uuid, mode text, image_path text, prompts jsonb, up int, down int)
language sql
security definer
set search_path = ''
stable
as $$
  with counted as (
    select d.id, d.mode, d.image_path, d.prompts, d.created_at,
           (count(v.value) filter (where v.value = 1))::int as up,
           (count(v.value) filter (where v.value = -1))::int as down
    from public.drawings d
    left join public.votes v on v.drawing_id = d.id
    where d.day = target_day
      and d.mode = any (modes)
      and not d.hidden
      and target_day between current_date - 2 and current_date + 1
    group by d.id
  ),
  best as (
    select c.up, c.down from counted c where c.up >= 1 order by c.up desc, c.down asc limit 1
  )
  select c.id, c.mode, c.image_path, c.prompts, c.up, c.down
  from counted c
  join best b on c.up = b.up and c.down = b.down
  order by c.created_at, c.id
  limit least(greatest(coalesce(max_count, 3), 1), 10);
$$;

grant execute on function public.top_drawings(date, text[], int) to anon;
