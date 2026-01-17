-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Create specific schema for the app to ensure clean namespace if needed (optional, using public for simplicity)

-- 1. PROFILES TABLE
create table if not exists public.profiles (
  id uuid references auth.users on delete cascade not null primary key,
  updated_at timestamp with time zone,
  email text,
  full_name text,
  avatar_url text,
  
  constraint username_length check (char_length(full_name) >= 3)
);

-- RLS for Profiles
alter table public.profiles enable row level security;

create policy "Public profiles are viewable by everyone."
  on profiles for select
  using ( true );

create policy "Users can insert their own profile."
  on profiles for insert
  with check ( auth.uid() = id );

create policy "Users can update own profile."
  on profiles for update
  using ( auth.uid() = id );

-- 2. BLOGS TABLE
create table if not exists public.blogs (
  id uuid default uuid_generate_v4() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  title text not null,
  content text not null,
  author_id uuid references public.profiles(id) on delete cascade not null
);

-- RLS for Blogs
alter table public.blogs enable row level security;

create policy "Blogs are viewable by everyone."
  on blogs for select
  using ( true );

create policy "Authenticated users can insert blogs."
  on blogs for insert
  with check ( auth.uid() = author_id );

create policy "Users can update their own blogs."
  on blogs for update
  using ( auth.uid() = author_id );

create policy "Users can delete their own blogs."
  on blogs for delete
  using ( auth.uid() = author_id );


-- 3. TRIGGERS & FUNCTIONS

-- Function to handle new user signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, full_name, avatar_url)
  values (
    new.id,
    new.email,
    new.raw_user_meta_data->>'full_name',
    new.raw_user_meta_data->>'avatar_url'
  );
  return new;
end;
$$ language plpgsql security definer;

-- Trigger to call the function on signup
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Helper to backfill profiles if they don't exist for existing users (run manually if needed)
-- insert into public.profiles (id, email)
-- select id, email from auth.users
-- on conflict (id) do nothing;
