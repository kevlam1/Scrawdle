-- Update 002 (2026-11-05): thumbs up / thumbs down votes on published drawings.
--
-- Run ONCE, in the Supabase SQL Editor, on a project that already ran schema.sql and update 001
-- (that's Kevin's project). A brand-new project doesn't need this file: schema.sql already
-- includes everything here.
--
-- Run this BEFORE the frontend that calls cast_vote / vote_counts reaches main. If the frontend
-- ships first, the gallery still loads but shows no vote buttons (publish.js treats a missing
-- function as "voting isn't set up yet").
--
-- The win condition: a drawing with at least one thumbs up has won. That rule lives in the
-- frontend (frontend/votes.js) so it can change without another database update.

-- 1. The votes. One per voter per drawing; voting again changes it. There are no logins, so a
-- voter is a random id the browser keeps (see publish.js). Clearing browser data gives a new id,
-- so this can't stop someone voting twice on purpose; it stops accidental double votes.
-- "on delete cascade": the daily wipe deletes old drawings, and their votes go with them.
create table if not exists public.votes (
  drawing_id uuid not null references public.drawings (id) on delete cascade,
  voter_id uuid not null,
  value smallint not null check (value in (1, -1)), -- 1 = thumbs up, -1 = thumbs down
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (drawing_id, voter_id)
);

-- RLS on with NO policies, like public.lobbies: the public key can't read or write the table
-- directly (otherwise anyone could read every voter id and vote in their name). Visitors go
-- through the two functions below.
alter table public.votes enable row level security;

-- Votes, changes, or clears (vote = 0) one voter's vote on one drawing. Only drawings the
-- gallery can show are open for votes: today's window, and not hidden by a moderator.
-- Doesn't stop voting on your own drawing: drawings don't record who published them. The
-- gallery hides the buttons on your own drawing instead.
create or replace function public.cast_vote(target_drawing uuid, voter uuid, vote int)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  if voter is null or vote is null or vote not in (1, 0, -1) then
    raise exception 'a vote is 1 (thumbs up), -1 (thumbs down) or 0 (clear)';
  end if;
  if not exists (
    select 1 from public.drawings
    where id = target_drawing and not hidden and day between current_date - 1 and current_date + 1
  ) then
    raise exception 'that drawing is not open for votes';
  end if;
  if vote = 0 then
    delete from public.votes where drawing_id = target_drawing and voter_id = voter;
  else
    insert into public.votes (drawing_id, voter_id, value) values (target_drawing, voter, vote)
    on conflict (drawing_id, voter_id) do update set value = excluded.value, updated_at = now();
  end if;
end;
$$;

-- Thumbs up and down for each of the given drawings, plus this voter's own vote on each
-- (1, -1, or 0 for none). Never returns who voted. A drawing with no votes still gets a row.
create or replace function public.vote_counts(drawing_ids uuid[], voter uuid)
returns table (drawing_id uuid, up int, down int, my_vote int)
language sql
security definer
set search_path = ''
stable
as $$
  select d.id,
         (count(*) filter (where v.value = 1))::int,
         (count(*) filter (where v.value = -1))::int,
         coalesce(max(v.value) filter (where v.voter_id = voter), 0)::int
  from unnest(drawing_ids) as d(id)
  left join public.votes v on v.drawing_id = d.id
  group by d.id;
$$;

grant execute on function public.cast_vote(uuid, uuid, int) to anon;
grant execute on function public.vote_counts(uuid[], uuid) to anon;
