-- GROUNDLEVEL DATABASE SCHEMA
-- Run this in your Supabase SQL editor

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- USERS (extends Supabase auth.users)
create table public.profiles (
  id uuid references auth.users on delete cascade primary key,
  email text,
  full_name text,
  plan text default 'free', -- free | pro
  stripe_customer_id text,
  stripe_subscription_id text,
  subscription_status text default 'inactive',
  encounters_this_month int default 0,
  created_at timestamp with time zone default timezone('utc'::text, now())
);

-- ENCOUNTERS
create table public.encounters (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade,
  created_at timestamp with time zone default timezone('utc'::text, now()),
  encounter_type text, -- stop_search | road_stop | private_security | etc
  badge_number text,
  description text,
  flag text, -- green | amber | red
  summary text,
  violations jsonb default '[]',
  next_steps jsonb default '[]',
  complaint_worthy boolean default false,
  complaint_body text,
  severity int default 0,
  recording_duration int default 0, -- seconds
  location_note text,
  status text default 'recorded' -- recorded | analysed | complaint_filed
);

-- COMPLAINTS
create table public.complaints (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade,
  encounter_id uuid references public.encounters(id) on delete cascade,
  created_at timestamp with time zone default timezone('utc'::text, now()),
  complaint_body text, -- IOPC | council | SIA etc
  complaint_text text,
  badge_number text,
  status text default 'draft', -- draft | submitted | acknowledged | resolved
  reference_number text
);

-- BLUFF CHECKS LOG (anonymous analytics)
create table public.bluff_checks (
  id uuid default uuid_generate_v4() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()),
  phrase text,
  verdict text,
  risk_level text
);

-- PATTERN DATA (aggregated, anonymised)
create table public.pattern_flags (
  id uuid default uuid_generate_v4() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()),
  badge_number text,
  encounter_type text,
  flag text,
  location_note text,
  organisation text
);

-- ROW LEVEL SECURITY
alter table public.profiles enable row level security;
alter table public.encounters enable row level security;
alter table public.complaints enable row level security;

-- Profiles: users can only see their own
create policy "Users can view own profile" on public.profiles
  for select using (auth.uid() = id);
create policy "Users can update own profile" on public.profiles
  for update using (auth.uid() = id);

-- Encounters: users can only see their own
create policy "Users can view own encounters" on public.encounters
  for select using (auth.uid() = user_id);
create policy "Users can insert own encounters" on public.encounters
  for insert with check (auth.uid() = user_id);
create policy "Users can update own encounters" on public.encounters
  for update using (auth.uid() = user_id);

-- Complaints: users can only see their own
create policy "Users can view own complaints" on public.complaints
  for select using (auth.uid() = user_id);
create policy "Users can insert own complaints" on public.complaints
  for insert with check (auth.uid() = user_id);

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email)
  values (new.id, new.email);
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
