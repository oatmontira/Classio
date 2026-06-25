-- SubmitHub Supabase schema
-- Run this file in Supabase SQL Editor.
-- This script creates the MVP database structure described in database.md.

begin;

create extension if not exists pgcrypto;

do $$
begin
  if not exists (select 1 from pg_type where typname = 'user_role') then
    create type public.user_role as enum ('admin', 'teacher', 'student');
  end if;

  if not exists (select 1 from pg_type where typname = 'account_status') then
    create type public.account_status as enum ('active', 'disabled');
  end if;

  if not exists (select 1 from pg_type where typname = 'course_status') then
    create type public.course_status as enum ('active', 'archived', 'completed');
  end if;

  if not exists (select 1 from pg_type where typname = 'enrollment_status') then
    create type public.enrollment_status as enum ('active', 'removed', 'completed');
  end if;

  if not exists (select 1 from pg_type where typname = 'assignment_status') then
    create type public.assignment_status as enum ('draft', 'scheduled', 'open', 'closed', 'overdue');
  end if;

  if not exists (select 1 from pg_type where typname = 'submission_status') then
    create type public.submission_status as enum ('draft', 'submitted', 'late', 'graded', 'returned');
  end if;

  if not exists (select 1 from pg_type where typname = 'submission_type') then
    create type public.submission_type as enum ('pdf', 'image', 'link', 'video');
  end if;

  if not exists (select 1 from pg_type where typname = 'notification_type') then
    create type public.notification_type as enum (
      'assignment_published',
      'deadline_reminder',
      'submission_received',
      'grade_released',
      'assignment_overdue',
      'system'
    );
  end if;
end $$;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null,
  email text not null unique,
  role public.user_role not null,
  student_code text unique,
  teacher_code text unique,
  avatar_url text,
  status public.account_status not null default 'active',
  last_sign_in_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint profiles_student_code_required check (
    role <> 'student' or student_code is not null
  ),
  constraint profiles_teacher_code_required check (
    role <> 'teacher' or teacher_code is not null
  )
);

create table if not exists public.academic_terms (
  id uuid primary key default gen_random_uuid(),
  academic_year text not null,
  semester text not null,
  starts_at date,
  ends_at date,
  is_active boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  unique (academic_year, semester)
);

create table if not exists public.courses (
  id uuid primary key default gen_random_uuid(),
  course_code text not null,
  course_name text not null,
  description text,
  term_id uuid references public.academic_terms(id) on delete set null,
  teacher_id uuid not null references public.profiles(id) on delete restrict,
  status public.course_status not null default 'active',
  created_by uuid references public.profiles(id) on delete set null,
  updated_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz,

  unique (course_code, term_id)
);

create table if not exists public.enrollments (
  id uuid primary key default gen_random_uuid(),
  course_id uuid not null references public.courses(id) on delete cascade,
  student_id uuid not null references public.profiles(id) on delete cascade,
  status public.enrollment_status not null default 'active',
  enrolled_by uuid references public.profiles(id) on delete set null,
  enrolled_at timestamptz not null default now(),
  removed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  unique (course_id, student_id)
);

create table if not exists public.assignments (
  id uuid primary key default gen_random_uuid(),
  course_id uuid not null references public.courses(id) on delete cascade,
  teacher_id uuid not null references public.profiles(id) on delete restrict,
  title text not null,
  description text,
  max_score numeric(6,2) not null default 0,
  allowed_submission_types public.submission_type[] not null default array['pdf']::public.submission_type[],
  allow_resubmission boolean not null default true,
  allow_late_submission boolean not null default true,
  late_policy text,
  open_at timestamptz,
  due_at timestamptz not null,
  closed_at timestamptz,
  published_at timestamptz,
  status public.assignment_status not null default 'draft',
  created_by uuid references public.profiles(id) on delete set null,
  updated_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz,

  constraint assignments_score_non_negative check (max_score >= 0),
  constraint assignments_due_after_open check (
    open_at is null or due_at > open_at
  )
);

create table if not exists public.submissions (
  id uuid primary key default gen_random_uuid(),
  assignment_id uuid not null references public.assignments(id) on delete cascade,
  student_id uuid not null references public.profiles(id) on delete cascade,
  submission_type public.submission_type not null,
  text_note text,
  link_url text,
  submitted_at timestamptz,
  status public.submission_status not null default 'draft',
  attempt_no integer not null default 1,
  is_latest boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint submissions_attempt_positive check (attempt_no >= 1),
  constraint submissions_link_required_for_link check (
    submission_type <> 'link' or link_url is not null
  )
);

create table if not exists public.submission_files (
  id uuid primary key default gen_random_uuid(),
  submission_id uuid not null references public.submissions(id) on delete cascade,
  bucket_name text not null default 'submission-files',
  storage_path text not null,
  original_file_name text not null,
  mime_type text not null,
  file_size_bytes bigint not null,
  file_hash text,
  uploaded_by uuid not null references public.profiles(id) on delete cascade,
  uploaded_at timestamptz not null default now(),

  constraint submission_files_size_positive check (file_size_bytes > 0)
);

create table if not exists public.grades (
  id uuid primary key default gen_random_uuid(),
  submission_id uuid not null unique references public.submissions(id) on delete cascade,
  teacher_id uuid not null references public.profiles(id) on delete restrict,
  score numeric(6,2) not null,
  feedback text,
  graded_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint grades_score_non_negative check (score >= 0)
);

create table if not exists public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  type public.notification_type not null,
  title text not null,
  message text not null,
  related_course_id uuid references public.courses(id) on delete cascade,
  related_assignment_id uuid references public.assignments(id) on delete cascade,
  related_submission_id uuid references public.submissions(id) on delete cascade,
  is_read boolean not null default false,
  read_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists public.audit_logs (
  id uuid primary key default gen_random_uuid(),
  actor_id uuid references public.profiles(id) on delete set null,
  action text not null,
  entity_type text not null,
  entity_id uuid,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create unique index if not exists submissions_one_latest_per_student_assignment
on public.submissions (assignment_id, student_id)
where is_latest = true;

create index if not exists profiles_role_idx on public.profiles (role);
create index if not exists profiles_status_idx on public.profiles (status);

create index if not exists courses_teacher_id_idx on public.courses (teacher_id);
create index if not exists courses_term_id_idx on public.courses (term_id);
create index if not exists courses_status_idx on public.courses (status);

create index if not exists enrollments_course_id_idx on public.enrollments (course_id);
create index if not exists enrollments_student_id_idx on public.enrollments (student_id);
create index if not exists enrollments_status_idx on public.enrollments (status);

create index if not exists assignments_course_id_idx on public.assignments (course_id);
create index if not exists assignments_teacher_id_idx on public.assignments (teacher_id);
create index if not exists assignments_status_idx on public.assignments (status);
create index if not exists assignments_due_at_idx on public.assignments (due_at);
create index if not exists assignments_published_at_idx on public.assignments (published_at);

create index if not exists submissions_assignment_id_idx on public.submissions (assignment_id);
create index if not exists submissions_student_id_idx on public.submissions (student_id);
create index if not exists submissions_status_idx on public.submissions (status);
create index if not exists submissions_submitted_at_idx on public.submissions (submitted_at);

create index if not exists submission_files_submission_id_idx on public.submission_files (submission_id);

create index if not exists grades_teacher_id_idx on public.grades (teacher_id);
create index if not exists grades_graded_at_idx on public.grades (graded_at);

create index if not exists notifications_user_id_idx on public.notifications (user_id);
create index if not exists notifications_is_read_idx on public.notifications (is_read);
create index if not exists notifications_created_at_idx on public.notifications (created_at desc);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create or replace function public.current_user_role()
returns public.user_role
language sql
security definer
set search_path = public
stable
as $$
  select role from public.profiles where id = auth.uid()
$$;

create or replace function public.is_admin()
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1
    from public.profiles
    where id = auth.uid()
      and role = 'admin'
      and status = 'active'
  )
$$;

create or replace function public.is_course_teacher(target_course_id uuid)
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1
    from public.courses
    where id = target_course_id
      and teacher_id = auth.uid()
      and deleted_at is null
  )
$$;

create or replace function public.is_enrolled_student(target_course_id uuid)
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1
    from public.enrollments
    where course_id = target_course_id
      and student_id = auth.uid()
      and status = 'active'
  )
$$;

create or replace function public.validate_profile_role()
returns trigger
language plpgsql
as $$
declare
  target_role public.user_role;
begin
  if tg_table_name = 'courses' then
    select role into target_role from public.profiles where id = new.teacher_id;
    if target_role <> 'teacher' then
      raise exception 'courses.teacher_id must reference a teacher profile';
    end if;
  elsif tg_table_name = 'enrollments' then
    select role into target_role from public.profiles where id = new.student_id;
    if target_role <> 'student' then
      raise exception 'enrollments.student_id must reference a student profile';
    end if;
  elsif tg_table_name = 'assignments' then
    select role into target_role from public.profiles where id = new.teacher_id;
    if target_role <> 'teacher' then
      raise exception 'assignments.teacher_id must reference a teacher profile';
    end if;
  end if;

  return new;
end;
$$;

create or replace function public.set_submission_status()
returns trigger
language plpgsql
as $$
declare
  assignment_due_at timestamptz;
begin
  if new.submitted_at is null or new.status = 'draft' then
    return new;
  end if;

  select due_at into assignment_due_at
  from public.assignments
  where id = new.assignment_id;

  if assignment_due_at is not null and new.submitted_at > assignment_due_at then
    new.status = 'late';
  elsif new.status not in ('graded', 'returned') then
    new.status = 'submitted';
  end if;

  return new;
end;
$$;

create or replace function public.validate_grade_score()
returns trigger
language plpgsql
as $$
declare
  max_allowed numeric(6,2);
begin
  select a.max_score into max_allowed
  from public.assignments a
  join public.submissions s on s.assignment_id = a.id
  where s.id = new.submission_id;

  if max_allowed is null then
    raise exception 'assignment max score not found for submission %', new.submission_id;
  end if;

  if new.score > max_allowed then
    raise exception 'grade score % exceeds assignment max score %', new.score, max_allowed;
  end if;

  return new;
end;
$$;

drop trigger if exists set_profiles_updated_at on public.profiles;
create trigger set_profiles_updated_at
before update on public.profiles
for each row execute function public.set_updated_at();

drop trigger if exists set_academic_terms_updated_at on public.academic_terms;
create trigger set_academic_terms_updated_at
before update on public.academic_terms
for each row execute function public.set_updated_at();

drop trigger if exists set_courses_updated_at on public.courses;
create trigger set_courses_updated_at
before update on public.courses
for each row execute function public.set_updated_at();

drop trigger if exists set_enrollments_updated_at on public.enrollments;
create trigger set_enrollments_updated_at
before update on public.enrollments
for each row execute function public.set_updated_at();

drop trigger if exists set_assignments_updated_at on public.assignments;
create trigger set_assignments_updated_at
before update on public.assignments
for each row execute function public.set_updated_at();

drop trigger if exists set_submissions_updated_at on public.submissions;
create trigger set_submissions_updated_at
before update on public.submissions
for each row execute function public.set_updated_at();

drop trigger if exists set_grades_updated_at on public.grades;
create trigger set_grades_updated_at
before update on public.grades
for each row execute function public.set_updated_at();

drop trigger if exists validate_courses_teacher_role on public.courses;
create trigger validate_courses_teacher_role
before insert or update of teacher_id on public.courses
for each row execute function public.validate_profile_role();

drop trigger if exists validate_enrollments_student_role on public.enrollments;
create trigger validate_enrollments_student_role
before insert or update of student_id on public.enrollments
for each row execute function public.validate_profile_role();

drop trigger if exists validate_assignments_teacher_role on public.assignments;
create trigger validate_assignments_teacher_role
before insert or update of teacher_id on public.assignments
for each row execute function public.validate_profile_role();

drop trigger if exists set_submissions_status on public.submissions;
create trigger set_submissions_status
before insert or update of submitted_at, status on public.submissions
for each row execute function public.set_submission_status();

drop trigger if exists validate_grades_score on public.grades;
create trigger validate_grades_score
before insert or update of score, submission_id on public.grades
for each row execute function public.validate_grade_score();

alter table public.profiles enable row level security;
alter table public.academic_terms enable row level security;
alter table public.courses enable row level security;
alter table public.enrollments enable row level security;
alter table public.assignments enable row level security;
alter table public.submissions enable row level security;
alter table public.submission_files enable row level security;
alter table public.grades enable row level security;
alter table public.notifications enable row level security;
alter table public.audit_logs enable row level security;

drop policy if exists "profiles_select_self_or_admin" on public.profiles;
create policy "profiles_select_self_or_admin"
on public.profiles for select
to authenticated
using (
  id = auth.uid()
  or public.is_admin()
  or exists (
    select 1
    from public.courses c
    join public.enrollments e on e.course_id = c.id
    where c.teacher_id = auth.uid()
      and e.student_id = profiles.id
      and e.status = 'active'
  )
  or exists (
    select 1
    from public.courses c
    join public.enrollments e on e.course_id = c.id
    where e.student_id = auth.uid()
      and c.teacher_id = profiles.id
      and e.status = 'active'
  )
);

drop policy if exists "profiles_update_self_or_admin" on public.profiles;
create policy "profiles_update_self_or_admin"
on public.profiles for update
to authenticated
using (id = auth.uid() or public.is_admin())
with check (id = auth.uid() or public.is_admin());

drop policy if exists "academic_terms_select_authenticated" on public.academic_terms;
create policy "academic_terms_select_authenticated"
on public.academic_terms for select
to authenticated
using (true);

drop policy if exists "academic_terms_admin_all" on public.academic_terms;
create policy "academic_terms_admin_all"
on public.academic_terms for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "courses_select_by_role" on public.courses;
create policy "courses_select_by_role"
on public.courses for select
to authenticated
using (
  deleted_at is null
  and (
    public.is_admin()
    or teacher_id = auth.uid()
    or public.is_enrolled_student(id)
  )
);

drop policy if exists "courses_admin_insert" on public.courses;
create policy "courses_admin_insert"
on public.courses for insert
to authenticated
with check (public.is_admin());

drop policy if exists "courses_admin_or_teacher_update" on public.courses;
create policy "courses_admin_or_teacher_update"
on public.courses for update
to authenticated
using (public.is_admin() or teacher_id = auth.uid())
with check (public.is_admin() or teacher_id = auth.uid());

drop policy if exists "enrollments_select_by_role" on public.enrollments;
create policy "enrollments_select_by_role"
on public.enrollments for select
to authenticated
using (
  public.is_admin()
  or student_id = auth.uid()
  or public.is_course_teacher(course_id)
);

drop policy if exists "enrollments_admin_or_teacher_insert" on public.enrollments;
create policy "enrollments_admin_or_teacher_insert"
on public.enrollments for insert
to authenticated
with check (
  public.is_admin()
  or public.is_course_teacher(course_id)
);

drop policy if exists "enrollments_admin_or_teacher_update" on public.enrollments;
create policy "enrollments_admin_or_teacher_update"
on public.enrollments for update
to authenticated
using (
  public.is_admin()
  or public.is_course_teacher(course_id)
)
with check (
  public.is_admin()
  or public.is_course_teacher(course_id)
);

drop policy if exists "assignments_select_by_role" on public.assignments;
create policy "assignments_select_by_role"
on public.assignments for select
to authenticated
using (
  deleted_at is null
  and (
    public.is_admin()
    or teacher_id = auth.uid()
    or (
      published_at is not null
      and public.is_enrolled_student(course_id)
    )
  )
);

drop policy if exists "assignments_teacher_insert" on public.assignments;
create policy "assignments_teacher_insert"
on public.assignments for insert
to authenticated
with check (
  public.is_admin()
  or public.is_course_teacher(course_id)
);

drop policy if exists "assignments_teacher_update" on public.assignments;
create policy "assignments_teacher_update"
on public.assignments for update
to authenticated
using (
  public.is_admin()
  or public.is_course_teacher(course_id)
)
with check (
  public.is_admin()
  or public.is_course_teacher(course_id)
);

drop policy if exists "submissions_select_by_role" on public.submissions;
create policy "submissions_select_by_role"
on public.submissions for select
to authenticated
using (
  public.is_admin()
  or student_id = auth.uid()
  or exists (
    select 1
    from public.assignments a
    where a.id = submissions.assignment_id
      and public.is_course_teacher(a.course_id)
  )
);

drop policy if exists "submissions_student_insert" on public.submissions;
create policy "submissions_student_insert"
on public.submissions for insert
to authenticated
with check (
  student_id = auth.uid()
  and exists (
    select 1
    from public.assignments a
    where a.id = assignment_id
      and a.published_at is not null
      and public.is_enrolled_student(a.course_id)
      and (
        a.allow_late_submission
        or now() <= a.due_at
      )
  )
);

drop policy if exists "submissions_student_update_own" on public.submissions;
create policy "submissions_student_update_own"
on public.submissions for update
to authenticated
using (student_id = auth.uid())
with check (student_id = auth.uid());

drop policy if exists "submission_files_select_by_role" on public.submission_files;
create policy "submission_files_select_by_role"
on public.submission_files for select
to authenticated
using (
  public.is_admin()
  or uploaded_by = auth.uid()
  or exists (
    select 1
    from public.submissions s
    join public.assignments a on a.id = s.assignment_id
    where s.id = submission_files.submission_id
      and public.is_course_teacher(a.course_id)
  )
);

drop policy if exists "submission_files_student_insert" on public.submission_files;
create policy "submission_files_student_insert"
on public.submission_files for insert
to authenticated
with check (
  uploaded_by = auth.uid()
  and exists (
    select 1
    from public.submissions s
    where s.id = submission_id
      and s.student_id = auth.uid()
  )
);

drop policy if exists "grades_select_by_role" on public.grades;
create policy "grades_select_by_role"
on public.grades for select
to authenticated
using (
  public.is_admin()
  or exists (
    select 1
    from public.submissions s
    where s.id = grades.submission_id
      and s.student_id = auth.uid()
  )
  or exists (
    select 1
    from public.submissions s
    join public.assignments a on a.id = s.assignment_id
    where s.id = grades.submission_id
      and public.is_course_teacher(a.course_id)
  )
);

drop policy if exists "grades_teacher_insert" on public.grades;
create policy "grades_teacher_insert"
on public.grades for insert
to authenticated
with check (
  public.is_admin()
  or exists (
    select 1
    from public.submissions s
    join public.assignments a on a.id = s.assignment_id
    where s.id = submission_id
      and public.is_course_teacher(a.course_id)
  )
);

drop policy if exists "grades_teacher_update" on public.grades;
create policy "grades_teacher_update"
on public.grades for update
to authenticated
using (
  public.is_admin()
  or exists (
    select 1
    from public.submissions s
    join public.assignments a on a.id = s.assignment_id
    where s.id = grades.submission_id
      and public.is_course_teacher(a.course_id)
  )
)
with check (
  public.is_admin()
  or exists (
    select 1
    from public.submissions s
    join public.assignments a on a.id = s.assignment_id
    where s.id = submission_id
      and public.is_course_teacher(a.course_id)
  )
);

drop policy if exists "notifications_select_own" on public.notifications;
create policy "notifications_select_own"
on public.notifications for select
to authenticated
using (user_id = auth.uid());

drop policy if exists "notifications_update_own_read_state" on public.notifications;
create policy "notifications_update_own_read_state"
on public.notifications for update
to authenticated
using (user_id = auth.uid())
with check (user_id = auth.uid());

drop policy if exists "audit_logs_admin_select" on public.audit_logs;
create policy "audit_logs_admin_select"
on public.audit_logs for select
to authenticated
using (public.is_admin());

drop view if exists public.teacher_assignment_summary;
create view public.teacher_assignment_summary
with (security_invoker = true)
as
select
  a.id as assignment_id,
  a.title,
  a.course_id,
  c.course_code,
  c.course_name,
  a.teacher_id,
  a.status,
  a.due_at,
  a.max_score,
  count(e.student_id) filter (where e.status = 'active') as total_students,
  count(s.id) filter (where s.status in ('submitted', 'late', 'graded')) as submitted_count,
  count(s.id) filter (where s.status in ('submitted', 'late')) as pending_review_count,
  count(g.id) as graded_count
from public.assignments a
join public.courses c on c.id = a.course_id
left join public.enrollments e on e.course_id = c.id
left join public.submissions s on s.assignment_id = a.id and s.student_id = e.student_id and s.is_latest = true
left join public.grades g on g.submission_id = s.id
where a.deleted_at is null
group by a.id, c.id;

drop view if exists public.student_assignment_status;
create view public.student_assignment_status
with (security_invoker = true)
as
select
  e.student_id,
  c.id as course_id,
  c.course_code,
  c.course_name,
  a.id as assignment_id,
  a.title,
  a.due_at,
  a.status as assignment_status,
  s.id as submission_id,
  coalesce(s.status, 'draft') as submission_status,
  s.submitted_at,
  g.score,
  g.feedback
from public.enrollments e
join public.courses c on c.id = e.course_id
join public.assignments a on a.course_id = c.id
left join public.submissions s on s.assignment_id = a.id and s.student_id = e.student_id and s.is_latest = true
left join public.grades g on g.submission_id = s.id
where e.status = 'active'
  and a.published_at is not null
  and a.deleted_at is null;

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values
  ('submission-files', 'submission-files', false, 26214400, array[
    'application/pdf',
    'image/jpeg',
    'image/png',
    'image/webp',
    'video/mp4',
    'video/webm'
  ]),
  ('assignment-files', 'assignment-files', false, 26214400, array[
    'application/pdf',
    'image/jpeg',
    'image/png',
    'image/webp'
  ]),
  ('profile-avatars', 'profile-avatars', true, 5242880, array[
    'image/jpeg',
    'image/png',
    'image/webp'
  ])
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "storage_profile_avatars_public_read" on storage.objects;
create policy "storage_profile_avatars_public_read"
on storage.objects for select
to authenticated
using (bucket_id = 'profile-avatars');

drop policy if exists "storage_profile_avatars_own_write" on storage.objects;
create policy "storage_profile_avatars_own_write"
on storage.objects for insert
to authenticated
with check (
  bucket_id = 'profile-avatars'
  and (storage.foldername(name))[1] = auth.uid()::text
);

drop policy if exists "storage_submission_files_own_upload" on storage.objects;
create policy "storage_submission_files_own_upload"
on storage.objects for insert
to authenticated
with check (
  bucket_id = 'submission-files'
  and (storage.foldername(name))[3] = auth.uid()::text
);

drop policy if exists "storage_submission_files_read_by_owner_or_teacher" on storage.objects;
create policy "storage_submission_files_read_by_owner_or_teacher"
on storage.objects for select
to authenticated
using (
  bucket_id = 'submission-files'
  and (
    public.is_admin()
    or (storage.foldername(name))[3] = auth.uid()::text
    or public.is_course_teacher(((storage.foldername(name))[1])::uuid)
  )
);

drop policy if exists "storage_assignment_files_teacher_upload" on storage.objects;
create policy "storage_assignment_files_teacher_upload"
on storage.objects for insert
to authenticated
with check (
  bucket_id = 'assignment-files'
  and (
    public.is_admin()
    or public.is_course_teacher(((storage.foldername(name))[1])::uuid)
  )
);

drop policy if exists "storage_assignment_files_read_by_course_member" on storage.objects;
create policy "storage_assignment_files_read_by_course_member"
on storage.objects for select
to authenticated
using (
  bucket_id = 'assignment-files'
  and (
    public.is_admin()
    or public.is_course_teacher(((storage.foldername(name))[1])::uuid)
    or public.is_enrolled_student(((storage.foldername(name))[1])::uuid)
  )
);

grant usage on schema public to anon, authenticated;
grant select, insert, update, delete on all tables in schema public to authenticated;
grant usage, select on all sequences in schema public to authenticated;

commit;
