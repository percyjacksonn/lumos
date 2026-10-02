-- Run in: Supabase dashboard -> SQL Editor -> New query -> paste -> Run. Safe to re-run.

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  username text, email text, created_at timestamptz default now()
);
create table if not exists public.saved_resources (
  user_id uuid references auth.users(id) on delete cascade,
  resource_id text check (char_length(resource_id) <= 200),
  created_at timestamptz default now(),
  primary key (user_id, resource_id)
);
create table if not exists public.downloads (
  id bigint generated always as identity primary key,
  user_id uuid references auth.users(id) on delete cascade,
  resource_id text not null check (char_length(resource_id) <= 200),
  created_at timestamptz default now()
);
create index if not exists downloads_user_idx on public.downloads (user_id, created_at desc);
create unique index if not exists profiles_username_uq on public.profiles (lower(username));

-- Profile row on sign-up (username collisions get a numeric suffix instead of breaking sign-up)
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
declare uname text := coalesce(nullif(left(new.raw_user_meta_data->>'username', 20), ''), split_part(new.email, '@', 1));
begin
  begin
    insert into public.profiles (id, username, email) values (new.id, uname, new.email);
  exception when unique_violation then
    insert into public.profiles (id, username, email) values (new.id, left(uname, 15) || floor(random()*9000+1000)::int, new.email);
  end;
  return new;
end; $$;
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users
  for each row execute function public.handle_new_user();

-- Lets the sign-up form check a username before creating the account
create or replace function public.username_available(u text)
returns boolean language sql security definer set search_path = public stable as $$
  select not exists (select 1 from public.profiles where lower(username) = lower(u));
$$;
revoke all on function public.username_available(text) from public;
grant execute on function public.username_available(text) to anon, authenticated;

-- Row Level Security: students only touch THEIR OWN rows
alter table public.profiles enable row level security;
alter table public.saved_resources enable row level security;
alter table public.downloads enable row level security;

drop policy if exists "read own profile" on public.profiles;
drop policy if exists "own saved: select" on public.saved_resources;
drop policy if exists "own saved: insert" on public.saved_resources;
drop policy if exists "own saved: delete" on public.saved_resources;
drop policy if exists "own downloads: select" on public.downloads;
drop policy if exists "own downloads: insert" on public.downloads;
create policy "read own profile" on public.profiles for select using (auth.uid() = id);
create policy "own saved: select" on public.saved_resources for select using (auth.uid() = user_id);
create policy "own saved: insert" on public.saved_resources for insert with check (auth.uid() = user_id);
create policy "own saved: delete" on public.saved_resources for delete using (auth.uid() = user_id);
create policy "own downloads: select" on public.downloads for select using (auth.uid() = user_id);
create policy "own downloads: insert" on public.downloads for insert with check (auth.uid() = user_id);

-- ================= CONTRIBUTE (admin/teacher uploads with secret code) =================
create extension if not exists pgcrypto with schema extensions;

create table if not exists public.resources (
  id bigint generated always as identity primary key,
  subject_id text not null, type text not null, unit int, teacher text,
  title text not null, file_path text not null, uploaded_by text,
  created_at timestamptz default now()
);
create table if not exists public.app_secrets (key text primary key, value text not null);
create table if not exists public.upload_access (user_id uuid primary key references auth.users(id) on delete cascade, expires_at timestamptz not null);
create table if not exists public.code_attempts (id bigint generated always as identity primary key, user_id uuid, at timestamptz default now());
alter table public.resources enable row level security;
alter table public.app_secrets enable row level security;      -- no policies = nobody can read it from the browser
alter table public.upload_access enable row level security;
alter table public.code_attempts enable row level security;


create or replace function public.redeem_upload_code(code text)
returns boolean language plpgsql security definer set search_path = public, extensions as $$
begin
  if auth.uid() is null then return false; end if;
  if (select count(*) from code_attempts where user_id = auth.uid() and at > now() - interval '1 hour') >= 5 then
    raise exception 'Too many wrong codes. Try again in an hour.';
  end if;
  if encode(digest(code, 'sha256'), 'hex') = (select value from app_secrets where key = 'upload_code_hash') then
    insert into upload_access values (auth.uid(), now() + interval '30 minutes')
      on conflict (user_id) do update set expires_at = excluded.expires_at;
    return true;
  end if;
  insert into code_attempts (user_id) values (auth.uid());
  return false;
end; $$;
revoke all on function public.redeem_upload_code(text) from public;
grant execute on function public.redeem_upload_code(text) to authenticated;

drop policy if exists "anyone reads resources" on public.resources;
drop policy if exists "uploaders add resources" on public.resources;
create policy "anyone reads resources" on public.resources for select using (true);
create policy "uploaders add resources" on public.resources for insert to authenticated
  with check (exists (select 1 from public.upload_access u where u.user_id = auth.uid() and u.expires_at > now()));

drop policy if exists "uploaders upload files" on storage.objects;
create policy "uploaders upload files" on storage.objects for insert to authenticated
  with check (bucket_id = 'study-materials' and exists (select 1 from public.upload_access u where u.user_id = auth.uid() and u.expires_at > now()));

-- ================= SECURITY HARDENING (admin role, contributor access, storage) =================
-- ADMIN: only rows in this table are admins. Nobody can write to it from the browser.
create table if not exists public.admins (user_id uuid primary key references auth.users(id) on delete cascade);
alter table public.admins enable row level security;
drop policy if exists "read own admin row" on public.admins;
create policy "read own admin row" on public.admins for select to authenticated using (user_id = auth.uid());
revoke all on public.admins from anon, authenticated;
grant select on public.admins to authenticated;

-- >>> RUN ONCE, WITH YOUR OWN EMAIL (the one you sign in to Lumos with), then delete the line:
-- insert into public.admins (user_id) select id from auth.users where email = 'YOUR_EMAIL_HERE' on conflict do nothing;

create or replace function public.is_admin() returns boolean language sql security definer stable set search_path = public as $$
  select exists (select 1 from public.admins where user_id = auth.uid()); $$;
create or replace function public.can_upload() returns boolean language sql security definer stable set search_path = public as $$
  select public.is_admin() or exists (select 1 from public.upload_access u where u.user_id = auth.uid() and u.expires_at > now()); $$;
revoke all on function public.is_admin(), public.can_upload() from public, anon;
grant execute on function public.is_admin(), public.can_upload() to authenticated;

-- PROFILES: users may change ONLY their own username and avatar (no role column exists to change)
alter table public.profiles add column if not exists avatar text check (avatar in ('male','female'));
alter table public.profiles drop constraint if exists profiles_username_len;
alter table public.profiles add constraint profiles_username_len check (username is null or char_length(username) between 1 and 20) not valid;
revoke insert, update, delete on public.profiles from anon, authenticated;
grant update (username, avatar) on public.profiles to authenticated;
drop policy if exists "update own profile" on public.profiles;
create policy "update own profile" on public.profiles for update to authenticated using (auth.uid() = id) with check (auth.uid() = id);

-- SECRET CODE: stored as a salted bcrypt hash, only ever checked inside the database
create or replace function public.redeem_upload_code(code text)
returns boolean language plpgsql security definer set search_path = public, extensions as $$
declare h text := (select value from app_secrets where key = 'upload_code_hash');
begin
  if auth.uid() is null or h is null then return false; end if;
  if (select count(*) from code_attempts where user_id = auth.uid() and at > now() - interval '1 hour') >= 5 then
    raise exception 'Too many wrong codes. Try again in an hour.';
  end if;
  if code is not null and crypt(code, h) = h then
    insert into upload_access values (auth.uid(), now() + interval '30 minutes')
      on conflict (user_id) do update set expires_at = excluded.expires_at;
    return true;
  end if;
  insert into code_attempts (user_id) values (auth.uid());
  return false;
end; $$;
revoke all on function public.redeem_upload_code(text) from public, anon;
grant execute on function public.redeem_upload_code(text) to authenticated;

-- >>> SET / CHANGE THE SECRET CODE (run in SQL Editor, replace MyNewCode with 8+ characters, then delete the line):
-- insert into public.app_secrets values ('upload_code_hash', extensions.crypt('MyNewCode', extensions.gen_salt('bf')))
--   on conflict (key) do update set value = excluded.value;

-- Contributors can see their own access window; admins can see everything (activity)
drop policy if exists "read own access" on public.upload_access;
create policy "read own access" on public.upload_access for select to authenticated using (user_id = auth.uid() or public.is_admin());
drop policy if exists "admin reads attempts" on public.code_attempts;
create policy "admin reads attempts" on public.code_attempts for select to authenticated using (public.is_admin());
drop policy if exists "admin manages access" on public.upload_access;
create policy "admin manages access" on public.upload_access for delete to authenticated using (public.is_admin());

-- RESOURCES: contributors insert only as themselves; only admins edit/delete
alter table public.resources add column if not exists uploaded_by_id uuid default auth.uid();
drop policy if exists "uploaders add resources" on public.resources;
create policy "uploaders add resources" on public.resources for insert to authenticated
  with check (public.can_upload() and uploaded_by_id = auth.uid() and char_length(title) between 1 and 150
    and file_path ~* '^[a-z]+/y[1-4]-s[1-8]/[a-z-]+/[0-9]+_[a-z0-9_.-]+\.pdf$');
drop policy if exists "admin edits resources" on public.resources;
drop policy if exists "admin deletes resources" on public.resources;
create policy "admin edits resources" on public.resources for update to authenticated using (public.is_admin()) with check (public.is_admin());
create policy "admin deletes resources" on public.resources for delete to authenticated using (public.is_admin());

-- STORAGE: PDFs only, fixed folder pattern, 25 MB max; only admins can replace or delete files
update storage.buckets set file_size_limit = 26214400, allowed_mime_types = array['application/pdf'] where id = 'study-materials';
drop policy if exists "uploaders upload files" on storage.objects;
create policy "uploaders upload files" on storage.objects for insert to authenticated
  with check (bucket_id = 'study-materials' and public.can_upload()
    and name ~* '^[a-z]+/y[1-4]-s[1-8]/[a-z-]+/[0-9]+_[a-z0-9_.-]+\.pdf$');
drop policy if exists "admin edits files" on storage.objects;
drop policy if exists "admin deletes files" on storage.objects;
create policy "admin edits files" on storage.objects for update to authenticated using (bucket_id = 'study-materials' and public.is_admin()) with check (bucket_id = 'study-materials' and public.is_admin());
create policy "admin deletes files" on storage.objects for delete to authenticated using (bucket_id = 'study-materials' and public.is_admin());
