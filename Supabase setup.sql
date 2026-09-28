-- Run this ONCE: Supabase dashboard -> SQL Editor -> New query -> paste -> Run

-- 1. One row per student (username + email), created automatically at sign-up
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  username text,
  email text,
  created_at timestamptz default now()
);

-- 2. What each student saved (the heart button)
create table if not exists public.saved_resources (
  user_id uuid references auth.users(id) on delete cascade,
  resource_id text,
  created_at timestamptz default now(),
  primary key (user_id, resource_id)
);

-- 3. Every download (who, what, when)
create table if not exists public.downloads (
  id bigint generated always as identity primary key,
  user_id uuid references auth.users(id) on delete cascade,
  resource_id text not null,
  created_at timestamptz default now()
);

-- 4. Copy username/email into profiles when someone signs up
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, username, email)
  values (new.id, new.raw_user_meta_data->>'username', new.email);
  return new;
end; $$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- 5. Privacy: students can only touch THEIR OWN rows.
--    You (admin) see everything in the dashboard Table Editor.
alter table public.profiles enable row level security;
alter table public.saved_resources enable row level security;
alter table public.downloads enable row level security;

create policy "read own profile" on public.profiles for select using (auth.uid() = id);
create policy "own saved: select" on public.saved_resources for select using (auth.uid() = user_id);
create policy "own saved: insert" on public.saved_resources for insert with check (auth.uid() = user_id);
create policy "own saved: delete" on public.saved_resources for delete using (auth.uid() = user_id);
create policy "own downloads: select" on public.downloads for select using (auth.uid() = user_id);
create policy "own downloads: insert" on public.downloads for insert with check (auth.uid() = user_id);
