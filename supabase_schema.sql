-- ==========================================
-- 1. PROFILES TABLE (Must exist before we can link blogs to it)
-- ==========================================
create table if not exists public.profiles (
  id uuid references auth.users on delete cascade not null primary key,
  email text,
  full_name text,
  avatar_url text,
  updated_at timestamptz
);

alter table public.profiles enable row level security;

-- ==========================================
-- 2. CRITICAL: BACKFILL PROFILES (Fix for Foreign Key Error)
-- ==========================================
-- This copies all existing users from auth.users to public.profiles
-- so that existing blogs don't break the foreign key constraint.
insert into public.profiles (id, email, full_name)
select id, email, raw_user_meta_data->>'full_name'
from auth.users
on conflict (id) do nothing;

-- ==========================================
-- 3. BLOGS TABLE
-- ==========================================
create table if not exists public.blogs (
  id uuid default gen_random_uuid() primary key,
  title text not null,
  content text not null,
  author_id uuid references auth.users(id) not null,
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

-- Enable RLS
alter table public.blogs enable row level security;

-- ==========================================
-- 4. POLICIES (Idempotent)
-- ==========================================
do $$
begin
  -- Blogs Policies
  if not exists (select 1 from pg_policies where tablename = 'blogs' and policyname = 'Public blogs are viewable by everyone') then
    create policy "Public blogs are viewable by everyone" on public.blogs for select using ( true );
  end if;
  
  if not exists (select 1 from pg_policies where tablename = 'blogs' and policyname = 'Users can populate blogs') then
    create policy "Users can populate blogs" on public.blogs for insert with check ( auth.uid() = author_id );
  end if;

  if not exists (select 1 from pg_policies where tablename = 'blogs' and policyname = 'Users can update own blogs') then
    create policy "Users can update own blogs" on public.blogs for update using ( auth.uid() = author_id );
  end if;

  if not exists (select 1 from pg_policies where tablename = 'blogs' and policyname = 'Users can delete own blogs') then
    create policy "Users can delete own blogs" on public.blogs for delete using ( auth.uid() = author_id );
  end if;

  -- Profiles Policies
  if not exists (select 1 from pg_policies where tablename = 'profiles' and policyname = 'Public profiles are viewable by everyone') then
    create policy "Public profiles are viewable by everyone" on public.profiles for select using ( true );
  end if;

  if not exists (select 1 from pg_policies where tablename = 'profiles' and policyname = 'Users can insert their own profile') then
    create policy "Users can insert their own profile" on public.profiles for insert with check ( auth.uid() = id );
  end if;

  if not exists (select 1 from pg_policies where tablename = 'profiles' and policyname = 'Users can update own profile') then
    create policy "Users can update own profile" on public.profiles for update using ( auth.uid() = id );
  end if;
end
$$;

-- ==========================================
-- 5. TRIGGERS (Auto-create profile on new signup)
-- ==========================================
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, full_name)
  values (new.id, new.email, new.raw_user_meta_data->>'full_name');
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ==========================================
-- 6. RELATIONSHIPS (Safe to run now that Backfill is done)
-- ==========================================
alter table public.blogs
  drop constraint if exists blogs_author_id_fkey,
  add constraint blogs_author_id_fkey
  foreign key (author_id)
  references public.profiles(id);
