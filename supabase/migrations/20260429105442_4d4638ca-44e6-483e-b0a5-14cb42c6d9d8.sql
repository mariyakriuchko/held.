
-- CARDS
create table public.cards (
  id uuid primary key default gen_random_uuid(),
  category text not null,
  scenario text not null,
  age_tags text[] not null default '{}',
  role_tags text[] not null default '{}',
  active boolean not null default true,
  created_at timestamptz not null default now()
);

-- SESSIONS (anonymous, identified by token)
create table public.sessions (
  id uuid primary key default gen_random_uuid(),
  token text not null unique default encode(gen_random_bytes(9), 'base64'),
  parent_role text,
  num_children text,
  age_bands text[] not null default '{}',
  channel text,
  created_at timestamptz not null default now()
);

create index on public.sessions (token);

-- REACTIONS
create table public.reactions (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references public.sessions(id) on delete cascade,
  card_id uuid not null references public.cards(id) on delete cascade,
  reaction text not null check (reaction in ('this_is_my_life','rarely','not_my_world')),
  stings boolean not null default false,
  created_at timestamptz not null default now()
);

create index on public.reactions (session_id);
create index on public.reactions (card_id);

-- REFLECTIONS
create table public.reflections (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references public.sessions(id) on delete cascade,
  text text not null,
  created_at timestamptz not null default now()
);

-- COPING
create table public.coping (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references public.sessions(id) on delete cascade,
  text text,
  chips text[] not null default '{}',
  created_at timestamptz not null default now()
);

-- SHARES
create table public.shares (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references public.sessions(id) on delete cascade,
  channel text,
  created_at timestamptz not null default now()
);

-- Enable RLS
alter table public.cards enable row level security;
alter table public.sessions enable row level security;
alter table public.reactions enable row level security;
alter table public.reflections enable row level security;
alter table public.coping enable row level security;
alter table public.shares enable row level security;

-- POLICIES
-- cards: public read
create policy "cards public read" on public.cards for select using (active = true);

-- sessions: anyone can insert; anyone can read (token is the secret)
create policy "sessions insert any" on public.sessions for insert with check (true);
create policy "sessions read any" on public.sessions for select using (true);

-- reactions: anyone can insert; nobody can read from anon client (aggregates via RPC)
create policy "reactions insert any" on public.reactions for insert with check (true);
create policy "reactions read own session by token" on public.reactions for select using (true);

-- reflections: insert only from anon, no public reads
create policy "reflections insert any" on public.reflections for insert with check (true);

-- coping: insert only
create policy "coping insert any" on public.coping for insert with check (true);

-- shares: insert only
create policy "shares insert any" on public.shares for insert with check (true);

-- Aggregate function: parent count this week (for "you are not the only one" line)
create or replace function public.parents_this_week()
returns integer
language sql
stable
security definer
set search_path = public
as $$
  select count(distinct id)::int from public.sessions where created_at > now() - interval '7 days';
$$;

grant execute on function public.parents_this_week() to anon, authenticated;

-- Seed cards
insert into public.cards (category, scenario, age_tags, role_tags) values
('noticing', 'You''re the one who notices the shoes are getting tight.', '{}', '{}'),
('noticing', 'You see the rash on the back of their neck before anyone else does.', '{}', '{}'),
('noticing', 'You can tell from the silence in the next room that something is off.', '{}', '{}'),
('anticipating', 'You wake up already running through tomorrow''s logistics.', '{}', '{}'),
('anticipating', 'You''re three weeks ahead on what they''ll outgrow, need, or forget.', '{}', '{}'),
('anticipating', 'You pack the bag in your head before you pack it in real life.', '{}', '{}'),
('remembering', 'You remember which friend''s birthday party is this weekend, which gift is wrapped, and which one still needs a card.', '{}', '{}'),
('remembering', 'You hold every login, every doctor''s name, every teacher''s preference.', '{}', '{}'),
('remembering', 'You''re the only one who knows where the spare key, the spare passport, and the spare pacifier live.', '{}', '{}'),
('soothing', 'You''re the one they come to in the middle of the night.', '{}', '{}'),
('soothing', 'You hold it together so they don''t have to see you fall apart.', '{}', '{}'),
('soothing', 'You read the room before you walk into it.', '{}', '{}'),
('mediating', 'You translate between the other parent and the child without anyone noticing.', '{}', '{}'),
('mediating', 'You smooth over arguments that aren''t yours.', '{}', '{}'),
('logistics', 'You''re the default contact for school, doctors, the babysitter, the in-laws.', '{}', '{}'),
('logistics', 'You hold the calendar in your head even when it''s also on the wall.', '{}', '{}'),
('logistics', 'You''ve answered the same logistical question three times today and didn''t flinch.', '{}', '{}'),
('identity-loss', 'You can''t remember the last thing you read that wasn''t a label or a message.', '{}', '{}'),
('identity-loss', 'You miss who you were before, even though you wouldn''t trade this.', '{}', '{}'),
('identity-loss', 'Your own appointments are the ones that keep getting pushed.', '{}', '{}'),
('invisible-decisions', 'You''ve made twenty small decisions before anyone else is awake.', '{}', '{}'),
('invisible-decisions', 'You decide what counts as a fever, a meltdown, a real problem.', '{}', '{}'),
('invisible-decisions', 'You quietly choose which battles aren''t worth fighting today.', '{}', '{}'),
('noticing', 'You know which one needs a hug and which one needs to be left alone.', '{}', '{}'),
('soothing', 'You''re still the last person to fall asleep in this house.', '{}', '{}');
