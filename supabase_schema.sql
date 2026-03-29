-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- 1. Profiles
create table if not exists profiles (
  id uuid references auth.users not null primary key,
  updated_at timestamp with time zone,
  full_name text,
  email text,
  target_exam text,
  is_premium boolean default false,
  age integer,
  subscription_status text default 'free',
  streak_count integer default 0,
  last_activity timestamp with time zone default now()
);

-- 2. Attempts (mock test sessions)
create table if not exists attempts (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users not null,
  exam text not null,
  subject text not null,
  score integer default 0,
  total_questions integer default 0,
  time_spent integer default 0,
  mistakes_count integer default 0,
  accuracy integer default 0,
  mistakes_data jsonb default '[]',
  created_at timestamp with time zone default now()
);

-- 3. AI Notes
create table if not exists ai_notes (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users not null,
  subject text,
  exam text,
  title text,
  content jsonb,
  created_at timestamp with time zone default now()
);

-- Row Level Security
alter table profiles enable row level security;
alter table attempts enable row level security;
alter table ai_notes enable row level security;

-- Policies: Profiles
drop policy if exists "Users can view own profile." on profiles;
create policy "Users can view own profile." on profiles for select using (auth.uid() = id);

drop policy if exists "Users can insert own profile." on profiles;
create policy "Users can insert own profile." on profiles for insert with check (auth.uid() = id);

drop policy if exists "Users can update own profile." on profiles;
create policy "Users can update own profile." on profiles for update using (auth.uid() = id);

-- Policies: Attempts
drop policy if exists "Users can view own attempts." on attempts;
create policy "Users can view own attempts." on attempts for select using (auth.uid() = user_id);

drop policy if exists "Users can insert own attempts." on attempts;
create policy "Users can insert own attempts." on attempts for insert with check (auth.uid() = user_id);

-- Policies: AI Notes
drop policy if exists "Users can view own notes." on ai_notes;
create policy "Users can view own notes." on ai_notes for select using (auth.uid() = user_id);

drop policy if exists "Users can insert own notes." on ai_notes;
create policy "Users can insert own notes." on ai_notes for insert with check (auth.uid() = user_id);

-- 4. Premium Requests
create table if not exists premium_requests (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users not null,
  user_email text not null,
  status text default 'pending',
  created_at timestamp with time zone default now()
);

-- Row Level Security for premium_requests
alter table premium_requests enable row level security;

drop policy if exists "Users can insert own request." on premium_requests;
create policy "Users can insert own request." on premium_requests for insert with check (auth.uid() = user_id);

drop policy if exists "Users can view own request." on premium_requests;
create policy "Users can view own request." on premium_requests for select using (auth.uid() = user_id);

drop policy if exists "Admins can view all requests." on premium_requests;
create policy "Admins can view all requests." on premium_requests for select using (auth.email() like '%admin%');

drop policy if exists "Admins can update requests." on premium_requests;
create policy "Admins can update requests." on premium_requests for update using (auth.email() like '%admin%');
