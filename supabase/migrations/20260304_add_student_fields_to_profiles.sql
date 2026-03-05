alter table public.profiles
add column if not exists student_status text default 'none' check (student_status in ('none','active','expired','revoked')),
add column if not exists student_domain text,
add column if not exists student_verified_at timestamptz,
add column if not exists student_expires_at timestamptz;

create index if not exists profiles_student_expires_at_idx on public.profiles (student_expires_at);
create index if not exists profiles_student_status_idx on public.profiles (student_status);
