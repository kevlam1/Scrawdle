-- Update 003 (2026-11-05): reporting drawings. Three different players' reports hide a drawing.
--
-- Run ONCE, in the Supabase SQL Editor, on a project that already ran schema.sql and updates 001
-- and 002 (that's Kevin's project). A brand-new project doesn't need this file: schema.sql already
-- includes everything here. Running it a second time is harmless.
--
-- Step-by-step instructions, including how to check it worked, are under "Pending database
-- updates" at the top of ../../../CLAUDE.md.
--
-- Run this BEFORE the frontend that calls report_drawing reaches main. If the frontend ships
-- first, pressing Report says reporting isn't switched on yet, and nothing else breaks.

-- 1. The reports. One per reporter per drawing, so reporting twice counts once. There are no
-- logins, so a reporter is the same random browser id votes use (see publish.js). Clearing
-- browser data gives a new id, so one person determined to hide a drawing could do it alone;
-- this stops accidents and casual misuse, not a determined attacker. A teammate can bring a
-- wrongly hidden drawing back by setting hidden = false in the dashboard.
-- "on delete cascade": the daily wipe deletes old drawings, and their reports go with them.
create table if not exists public.reports (
  drawing_id uuid not null references public.drawings (id) on delete cascade,
  reporter_id uuid not null,
  created_at timestamptz not null default now(),
  primary key (drawing_id, reporter_id)
);

-- RLS on with NO policies, like votes and lobbies: the public key can't read who reported what.
-- Visitors go through the function below.
alter table public.reports enable row level security;

-- Records one report and hides the drawing once enough different players have reported it.
-- Returns true when the drawing is hidden (now or already). The number lives here, not in the
-- browser, so nobody can change it from a page; the gallery's confirm message says 3 too.
create or replace function public.report_drawing(target_drawing uuid, reporter uuid)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
declare
  reports_to_hide constant int := 3;
  is_hidden boolean;
begin
  if reporter is null then
    raise exception 'a report needs a reporter id';
  end if;
  select hidden into is_hidden from public.drawings
  where id = target_drawing and day between current_date - 1 and current_date + 1;
  if not found then
    raise exception 'that drawing is not open for reports';
  end if;
  if is_hidden then
    return true;
  end if;
  insert into public.reports (drawing_id, reporter_id) values (target_drawing, reporter)
  on conflict (drawing_id, reporter_id) do nothing;
  if (select count(*) from public.reports where drawing_id = target_drawing) >= reports_to_hide then
    update public.drawings set hidden = true where id = target_drawing;
    return true;
  end if;
  return false;
end;
$$;

grant execute on function public.report_drawing(uuid, uuid) to anon;
