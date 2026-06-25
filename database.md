# Database Design: SubmitHub

## 1. เป้าหมายของฐานข้อมูล

ฐานข้อมูลนี้ออกแบบสำหรับเว็บแอป SubmitHub ซึ่งเป็นระบบจัดการการมอบหมายงานและการส่งงานของนักศึกษาในรายวิชา รองรับผู้ใช้งาน 3 บทบาท ได้แก่ Admin, Teacher และ Student โดยใช้ Supabase เป็น backend หลัก

ฐานข้อมูลต้องรองรับ:

- การเข้าสู่ระบบผ่าน Supabase Auth
- การจัดการโปรไฟล์ผู้ใช้และบทบาท
- การจัดการรายวิชา
- การเพิ่มนักศึกษาเข้ารายวิชา
- การสร้างและเผยแพร่งานมอบหมาย
- การส่งงานหลายรูปแบบ เช่น PDF, รูปภาพ, ลิงก์ และวิดีโอ
- การตรวจงาน ให้คะแนน และ feedback
- การแจ้งเตือนภายในระบบ
- Dashboard และรายงานสรุปตามบทบาท
- Row Level Security เพื่อป้องกันการเข้าถึงข้อมูลข้ามสิทธิ์

## 2. Database Platform

แนะนำใช้:

- Database: PostgreSQL บน Supabase
- Authentication: Supabase Auth
- File Storage: Supabase Storage
- Authorization: PostgreSQL Row Level Security
- API Layer: Supabase auto-generated REST/Realtime API และ Server Actions ใน Next.js

## 3. Naming Convention

- ชื่อตารางใช้ `snake_case` และเป็นพหูพจน์ เช่น `profiles`, `courses`
- Primary key ใช้ `id uuid`
- Foreign key ใช้รูปแบบ `{table_singular}_id`
- Timestamp ใช้ `created_at`, `updated_at`, `deleted_at`
- Enum ใช้ suffix `_type` หรือ `_status`
- ตารางที่ต้อง audit สำคัญควรมี `created_by`, `updated_by`

## 4. Auth Strategy

Supabase Auth จะเก็บบัญชีหลักไว้ใน `auth.users`

ตาราง `profiles` จะเป็น public user profile ที่ผูกกับ `auth.users.id`

ความสัมพันธ์:

```text
auth.users.id 1:1 profiles.id
```

ระบบไม่ควรเก็บ `password_hash` เองใน public schema เพราะ Supabase Auth จัดการรหัสผ่านและ session ให้แล้ว

## 5. Enum Types

ควรสร้าง enum เพื่อควบคุมค่าที่ใช้ซ้ำและลดข้อมูลผิดรูปแบบ

```sql
create type user_role as enum ('admin', 'teacher', 'student');

create type account_status as enum ('active', 'disabled');

create type course_status as enum ('active', 'archived', 'completed');

create type enrollment_status as enum ('active', 'removed', 'completed');

create type assignment_status as enum (
  'draft',
  'scheduled',
  'open',
  'closed',
  'overdue'
);

create type submission_status as enum (
  'draft',
  'submitted',
  'late',
  'graded',
  'returned'
);

create type submission_type as enum (
  'pdf',
  'image',
  'link',
  'video'
);

create type notification_type as enum (
  'assignment_published',
  'deadline_reminder',
  'submission_received',
  'grade_released',
  'assignment_overdue',
  'system'
);
```

## 6. Entity Relationship Overview

```text
profiles
  ├─ courses.teacher_id
  ├─ enrollments.student_id
  ├─ assignments.teacher_id
  ├─ submissions.student_id
  ├─ grades.teacher_id
  └─ notifications.user_id

courses
  ├─ enrollments.course_id
  └─ assignments.course_id

assignments
  └─ submissions.assignment_id

submissions
  ├─ submission_files.submission_id
  └─ grades.submission_id
```

## 7. Tables

## 7.1 profiles

เก็บข้อมูลผู้ใช้ที่แสดงในระบบและข้อมูล role

```sql
create table profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null,
  email text not null unique,
  role user_role not null,
  student_code text unique,
  teacher_code text unique,
  avatar_url text,
  status account_status not null default 'active',
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
```

หมายเหตุ:

- Admin ไม่จำเป็นต้องมี `student_code` หรือ `teacher_code`
- Student ต้องมี `student_code`
- Teacher ต้องมี `teacher_code`
- หากสถาบันมีเลขประจำตัวซ้ำข้ามปี ควรเพิ่ม `organization_id` หรือ `academic_year` ใน unique constraint

## 7.2 academic_terms

เก็บปีการศึกษาและภาคเรียน เพื่อให้รายวิชาอ้างอิงได้เป็นระบบ

```sql
create table academic_terms (
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
```

## 7.3 courses

เก็บข้อมูลรายวิชา

```sql
create table courses (
  id uuid primary key default gen_random_uuid(),
  course_code text not null,
  course_name text not null,
  description text,
  term_id uuid references academic_terms(id) on delete set null,
  teacher_id uuid not null references profiles(id) on delete restrict,
  status course_status not null default 'active',
  created_by uuid references profiles(id) on delete set null,
  updated_by uuid references profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz,

  unique (course_code, term_id)
);
```

Business rules:

- `teacher_id` ต้องเป็น user ที่มี role `teacher`
- Admin สร้างหรือแก้รายวิชาได้
- Teacher เห็นเฉพาะรายวิชาที่ตนเองรับผิดชอบ
- Student เห็นเฉพาะรายวิชาที่ตนเอง enrolled

## 7.4 enrollments

เชื่อม Student กับ Course

```sql
create table enrollments (
  id uuid primary key default gen_random_uuid(),
  course_id uuid not null references courses(id) on delete cascade,
  student_id uuid not null references profiles(id) on delete cascade,
  status enrollment_status not null default 'active',
  enrolled_by uuid references profiles(id) on delete set null,
  enrolled_at timestamptz not null default now(),
  removed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  unique (course_id, student_id)
);
```

Business rules:

- `student_id` ต้องเป็น role `student`
- นักศึกษาที่ status เป็น `removed` ไม่ควรเห็น assignment ใหม่
- ใน MVP อาจให้ Admin หรือ Teacher เพิ่ม Student เข้ารายวิชา

## 7.5 assignments

เก็บงานมอบหมายในรายวิชา

```sql
create table assignments (
  id uuid primary key default gen_random_uuid(),
  course_id uuid not null references courses(id) on delete cascade,
  teacher_id uuid not null references profiles(id) on delete restrict,
  title text not null,
  description text,
  max_score numeric(6,2) not null default 0,
  allowed_submission_types submission_type[] not null default array['pdf']::submission_type[],
  allow_resubmission boolean not null default true,
  allow_late_submission boolean not null default true,
  late_policy text,
  open_at timestamptz,
  due_at timestamptz not null,
  closed_at timestamptz,
  published_at timestamptz,
  status assignment_status not null default 'draft',
  created_by uuid references profiles(id) on delete set null,
  updated_by uuid references profiles(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz,

  constraint assignments_score_non_negative check (max_score >= 0),
  constraint assignments_due_after_open check (
    open_at is null or due_at > open_at
  )
);
```

Business rules:

- Assignment ที่ status `draft` ไม่แสดงให้ Student เห็น
- Assignment ที่ `published_at` แล้วและอยู่ใน course ที่ Student enrolled จึงแสดงใน Student Dashboard
- หากเวลาปัจจุบันเกิน `due_at` และยังเปิดรับอยู่ ระบบอาจแสดงเป็น `overdue`
- `teacher_id` ควรตรงกับ teacher ของ course หรือเป็น teacher ที่ได้รับสิทธิ์ร่วมในอนาคต

## 7.6 submissions

เก็บ submission หลักของนักศึกษา

```sql
create table submissions (
  id uuid primary key default gen_random_uuid(),
  assignment_id uuid not null references assignments(id) on delete cascade,
  student_id uuid not null references profiles(id) on delete cascade,
  submission_type submission_type not null,
  text_note text,
  link_url text,
  submitted_at timestamptz,
  status submission_status not null default 'draft',
  attempt_no integer not null default 1,
  is_latest boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint submissions_attempt_positive check (attempt_no >= 1),
  constraint submissions_link_required_for_link check (
    submission_type <> 'link' or link_url is not null
  )
);
```

แนะนำ unique indexes:

```sql
create unique index submissions_one_latest_per_student_assignment
on submissions (assignment_id, student_id)
where is_latest = true;
```

Business rules:

- Student ส่งงานได้เฉพาะ assignment ใน course ที่ตนเอง enrolled
- หาก assignment ไม่อนุญาต resubmission ให้มี latest submission ได้ชุดเดียว
- หากส่งหลัง `assignments.due_at` ให้ status เป็น `late`
- หากยัง upload ไม่เสร็จ ไม่ควรเปลี่ยน status เป็น `submitted`

## 7.7 submission_files

เก็บ metadata ของไฟล์ที่ upload ใน Supabase Storage

```sql
create table submission_files (
  id uuid primary key default gen_random_uuid(),
  submission_id uuid not null references submissions(id) on delete cascade,
  bucket_name text not null default 'submission-files',
  storage_path text not null,
  original_file_name text not null,
  mime_type text not null,
  file_size_bytes bigint not null,
  file_hash text,
  uploaded_by uuid not null references profiles(id) on delete cascade,
  uploaded_at timestamptz not null default now(),

  constraint submission_files_size_positive check (file_size_bytes > 0)
);
```

Storage path ที่แนะนำ:

```text
submission-files/{course_id}/{assignment_id}/{student_id}/{submission_id}/{file_name}
```

รองรับไฟล์:

- PDF: `application/pdf`
- Image: `image/jpeg`, `image/png`, `image/webp`
- Video: แนะนำเก็บเป็นลิงก์ก่อนใน MVP หรือจำกัดขนาดไฟล์อย่างเข้มงวด

## 7.8 grades

เก็บคะแนนและ feedback

```sql
create table grades (
  id uuid primary key default gen_random_uuid(),
  submission_id uuid not null unique references submissions(id) on delete cascade,
  teacher_id uuid not null references profiles(id) on delete restrict,
  score numeric(6,2) not null,
  feedback text,
  graded_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),

  constraint grades_score_non_negative check (score >= 0)
);
```

Business rules:

- `score` ต้องไม่เกิน `assignments.max_score`
- ควร enforce ด้วย trigger เพราะ check constraint ข้ามตารางไม่ได้ตรงๆ
- Student เห็นได้เฉพาะ grade ของตนเอง
- Teacher เห็นได้เฉพาะ grade ใน course ที่ตนเองรับผิดชอบ

## 7.9 notifications

เก็บ notification ภายในระบบ

```sql
create table notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references profiles(id) on delete cascade,
  type notification_type not null,
  title text not null,
  message text not null,
  related_course_id uuid references courses(id) on delete cascade,
  related_assignment_id uuid references assignments(id) on delete cascade,
  related_submission_id uuid references submissions(id) on delete cascade,
  is_read boolean not null default false,
  read_at timestamptz,
  created_at timestamptz not null default now()
);
```

Notification examples:

- Assignment published: ส่งให้ Student ทุกคนใน course
- Deadline reminder: ส่งก่อน due date เช่น 24 ชั่วโมง
- Submission received: ส่งให้ Teacher
- Grade released: ส่งให้ Student
- Assignment overdue: ส่งให้ Student ที่ยังไม่ส่ง

## 7.10 audit_logs

ใช้เก็บเหตุการณ์สำคัญ เช่น ลบรายวิชา เปลี่ยนคะแนน หรือปิดรับงาน

```sql
create table audit_logs (
  id uuid primary key default gen_random_uuid(),
  actor_id uuid references profiles(id) on delete set null,
  action text not null,
  entity_type text not null,
  entity_id uuid,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);
```

แนะนำบันทึก:

- Admin disabled user
- Teacher published assignment
- Teacher changed grade
- Student submitted assignment
- Student resubmitted assignment
- Teacher closed assignment

## 8. Optional Tables หลัง MVP

## 8.1 course_teachers

ใช้เมื่อหนึ่งรายวิชามีอาจารย์หลายคน

```sql
create table course_teachers (
  id uuid primary key default gen_random_uuid(),
  course_id uuid not null references courses(id) on delete cascade,
  teacher_id uuid not null references profiles(id) on delete cascade,
  role text not null default 'co_teacher',
  created_at timestamptz not null default now(),

  unique (course_id, teacher_id)
);
```

## 8.2 submission_comments

ใช้ทำ comment thread ระหว่าง Teacher และ Student หลัง MVP

```sql
create table submission_comments (
  id uuid primary key default gen_random_uuid(),
  submission_id uuid not null references submissions(id) on delete cascade,
  author_id uuid not null references profiles(id) on delete cascade,
  body text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  deleted_at timestamptz
);
```

## 8.3 assignment_attachments

ใช้แนบไฟล์โจทย์หรือเอกสารประกอบงาน

```sql
create table assignment_attachments (
  id uuid primary key default gen_random_uuid(),
  assignment_id uuid not null references assignments(id) on delete cascade,
  bucket_name text not null default 'assignment-files',
  storage_path text not null,
  original_file_name text not null,
  mime_type text not null,
  file_size_bytes bigint not null,
  uploaded_by uuid not null references profiles(id) on delete set null,
  uploaded_at timestamptz not null default now()
);
```

## 9. Indexes

แนะนำ indexes สำหรับ performance ของ Dashboard, list page และ permission checks

```sql
create index profiles_role_idx on profiles (role);
create index profiles_status_idx on profiles (status);

create index courses_teacher_id_idx on courses (teacher_id);
create index courses_term_id_idx on courses (term_id);
create index courses_status_idx on courses (status);

create index enrollments_course_id_idx on enrollments (course_id);
create index enrollments_student_id_idx on enrollments (student_id);
create index enrollments_status_idx on enrollments (status);

create index assignments_course_id_idx on assignments (course_id);
create index assignments_teacher_id_idx on assignments (teacher_id);
create index assignments_status_idx on assignments (status);
create index assignments_due_at_idx on assignments (due_at);
create index assignments_published_at_idx on assignments (published_at);

create index submissions_assignment_id_idx on submissions (assignment_id);
create index submissions_student_id_idx on submissions (student_id);
create index submissions_status_idx on submissions (status);
create index submissions_submitted_at_idx on submissions (submitted_at);

create index submission_files_submission_id_idx on submission_files (submission_id);

create index grades_teacher_id_idx on grades (teacher_id);
create index grades_graded_at_idx on grades (graded_at);

create index notifications_user_id_idx on notifications (user_id);
create index notifications_is_read_idx on notifications (is_read);
create index notifications_created_at_idx on notifications (created_at desc);
```

## 10. Views สำหรับ Dashboard

## 10.1 teacher_assignment_summary

ใช้แสดง Assignment List และ Teacher Dashboard

```sql
create view teacher_assignment_summary as
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
from assignments a
join courses c on c.id = a.course_id
left join enrollments e on e.course_id = c.id
left join submissions s on s.assignment_id = a.id and s.student_id = e.student_id and s.is_latest = true
left join grades g on g.submission_id = s.id
group by a.id, c.id;
```

## 10.2 student_assignment_status

ใช้แสดง Student Dashboard และ To Submit

```sql
create view student_assignment_status as
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
from enrollments e
join courses c on c.id = e.course_id
join assignments a on a.course_id = c.id
left join submissions s on s.assignment_id = a.id and s.student_id = e.student_id and s.is_latest = true
left join grades g on g.submission_id = s.id
where e.status = 'active'
  and a.published_at is not null;
```

หมายเหตุ: หากใช้ view กับ RLS ต้องทดสอบ security behavior บน Supabase ให้รอบคอบ หรือใช้ RPC ที่ตรวจ `auth.uid()` ชัดเจนแทน

## 11. Row Level Security Design

เปิด RLS ทุกตารางใน public schema ที่มีข้อมูลผู้ใช้

```sql
alter table profiles enable row level security;
alter table courses enable row level security;
alter table enrollments enable row level security;
alter table assignments enable row level security;
alter table submissions enable row level security;
alter table submission_files enable row level security;
alter table grades enable row level security;
alter table notifications enable row level security;
alter table audit_logs enable row level security;
```

## 11.1 Helper Functions

```sql
create or replace function current_user_role()
returns user_role
language sql
security definer
set search_path = public
stable
as $$
  select role from profiles where id = auth.uid()
$$;

create or replace function is_admin()
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1 from profiles
    where id = auth.uid()
      and role = 'admin'
      and status = 'active'
  )
$$;

create or replace function is_course_teacher(target_course_id uuid)
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1 from courses
    where id = target_course_id
      and teacher_id = auth.uid()
      and deleted_at is null
  )
$$;

create or replace function is_enrolled_student(target_course_id uuid)
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1 from enrollments
    where course_id = target_course_id
      and student_id = auth.uid()
      and status = 'active'
  )
$$;
```

## 11.2 Policy Summary

### profiles

- Admin อ่านและแก้ไขทุก profile ได้
- ผู้ใช้ทั่วไปอ่าน profile ของตัวเองได้
- Teacher อ่าน profile ของ Student ใน course ที่ตนเองสอนได้
- Student อ่าน profile teacher ของ course ที่ตนเองเรียนได้

### courses

- Admin อ่าน/สร้าง/แก้ไขทุก course ได้
- Teacher อ่าน course ที่ตนเองสอนได้
- Student อ่าน course ที่ตนเอง enrolled ได้

### enrollments

- Admin อ่าน/สร้าง/แก้ไขได้ทั้งหมด
- Teacher อ่าน enrollment ใน course ที่ตนเองสอนได้
- Teacher เพิ่ม Student เข้ารายวิชาของตนเองได้ หาก product policy อนุญาต
- Student อ่าน enrollment ของตัวเองได้

### assignments

- Admin อ่านทั้งหมด
- Teacher อ่าน/สร้าง/แก้ไข assignment ใน course ที่ตนเองสอนได้
- Student อ่านเฉพาะ assignment ที่ publish แล้วใน course ที่ตนเอง enrolled

### submissions

- Admin อ่านทั้งหมด
- Teacher อ่าน submission ใน assignment ของ course ที่ตนเองสอนได้
- Student อ่าน/สร้าง/แก้ไข submission ของตัวเองได้ตาม assignment policy

### grades

- Admin อ่านทั้งหมด
- Teacher อ่าน/สร้าง/แก้ไข grade ใน course ที่ตนเองสอนได้
- Student อ่าน grade ของ submission ตัวเองเท่านั้น

### notifications

- ผู้ใช้แต่ละคนอ่านและอัปเดต `is_read` ของ notification ตัวเองได้
- System หรือ service role สร้าง notification ให้ผู้ใช้ได้

## 12. Example RLS Policies

ตัวอย่างบางส่วนสำหรับเริ่ม implementation

```sql
create policy "profiles_select_self_or_admin"
on profiles for select
using (
  id = auth.uid()
  or is_admin()
);

create policy "courses_select_by_role"
on courses for select
using (
  is_admin()
  or teacher_id = auth.uid()
  or is_enrolled_student(id)
);

create policy "assignments_select_by_role"
on assignments for select
using (
  is_admin()
  or teacher_id = auth.uid()
  or (
    published_at is not null
    and is_enrolled_student(course_id)
  )
);

create policy "submissions_select_by_role"
on submissions for select
using (
  is_admin()
  or student_id = auth.uid()
  or exists (
    select 1
    from assignments a
    where a.id = submissions.assignment_id
      and is_course_teacher(a.course_id)
  )
);

create policy "notifications_select_own"
on notifications for select
using (user_id = auth.uid());

create policy "notifications_update_own_read_state"
on notifications for update
using (user_id = auth.uid())
with check (user_id = auth.uid());
```

## 13. Storage Design

## 13.1 Buckets

```text
submission-files
assignment-files
profile-avatars
```

## 13.2 Bucket Access

### submission-files

- Student upload ได้เฉพาะ path ของตัวเอง
- Student read ได้เฉพาะไฟล์ submission ของตัวเอง
- Teacher read ได้เฉพาะไฟล์ใน course ที่ตนเองสอน
- Admin read ได้ทั้งหมด

### assignment-files

- Teacher upload ได้เฉพาะ course ที่ตนเองสอน
- Student read ได้เฉพาะ assignment ที่ publish แล้วใน course ที่ enrolled

### profile-avatars

- ผู้ใช้ upload avatar ของตัวเองได้
- ทุก user ที่ authenticated อ่าน avatar ได้

## 14. Triggers และ Automation

## 14.1 updated_at trigger

ควรใช้ trigger กลางเพื่ออัปเดต `updated_at`

```sql
create or replace function set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;
```

นำไปใช้กับตาราง:

- profiles
- academic_terms
- courses
- enrollments
- assignments
- submissions
- grades
- submission_comments

## 14.2 submission status trigger

เมื่อ Student submit งาน:

- ถ้า `submitted_at > assignments.due_at` ให้ status = `late`
- ถ้าไม่เกิน due date ให้ status = `submitted`

ควรทำใน service layer หรือ database trigger ก็ได้ แต่ต้องมี logic กลางที่ใช้เหมือนกันทุกช่องทาง

## 14.3 grade validation trigger

ตรวจว่า `grades.score <= assignments.max_score`

ควรทำเป็น trigger เพราะ constraint ปกติอ้างข้ามตารางไม่ได้

## 14.4 notification triggers

สร้าง notification เมื่อ:

- Assignment published
- Submission submitted
- Grade created หรือ updated

สำหรับ deadline reminder แนะนำใช้ scheduled job เช่น Supabase Edge Function + cron

## 15. Data Access Patterns

## 15.1 Admin Dashboard

ต้อง query:

- count profiles by role
- count courses
- count assignments
- count submissions
- recent submissions
- recent courses

ใช้ indexes:

- `profiles_role_idx`
- `courses_status_idx`
- `assignments_status_idx`
- `submissions_submitted_at_idx`

## 15.2 Teacher Dashboard

ต้อง query:

- courses where `teacher_id = auth.uid()`
- assignments in teacher courses
- submissions pending review
- assignment progress

แนะนำใช้ `teacher_assignment_summary`

## 15.3 Student Dashboard

ต้อง query:

- enrolled courses
- published assignments
- latest submissions
- grades
- due soon assignments

แนะนำใช้ `student_assignment_status`

## 16. MVP Migration Order

ลำดับการสร้าง database ที่แนะนำ:

1. Enable extensions เช่น `pgcrypto`
2. Create enum types
3. Create `profiles`
4. Create `academic_terms`
5. Create `courses`
6. Create `enrollments`
7. Create `assignments`
8. Create `submissions`
9. Create `submission_files`
10. Create `grades`
11. Create `notifications`
12. Create indexes
13. Create helper functions
14. Enable RLS
15. Create RLS policies
16. Create storage buckets
17. Create triggers
18. Create dashboard views

## 17. Seed Data เบื้องต้น

ตัวอย่างข้อมูลสำหรับ development:

- Admin: `admin@university.ac.th`
- Teacher:
  - `narin@university.ac.th`
  - `kanya@university.ac.th`
- Student:
  - `nicha@student.ac.th`
  - `poom@student.ac.th`
  - `sirin@student.ac.th`
  - `tanapol@student.ac.th`
- Courses:
  - CS101 Introduction to Programming
  - IT204 Web Application Development
  - DS310 Data Visualization
  - ENG102 Academic Writing
- Assignments:
  - Lab 03: Form Validation
  - Final Project Proposal
  - Data Chart Analysis
  - Research Summary PDF

## 18. Open Decisions

ยังต้องตัดสินใจเพิ่มเติมก่อนทำ production:

- ขนาดไฟล์สูงสุดต่อ submission
- จะอนุญาต video upload หรือให้ส่ง video link เท่านั้น
- Student แก้ไข submission หลังส่งได้หรือไม่
- ต้องเก็บ submission version history ระดับไหน
- Admin สามารถแก้ไขคะแนนได้หรือไม่
- Teacher หลายคนต่อหนึ่ง course ต้องรองรับตั้งแต่ MVP หรือหลัง MVP
- ต้อง import Student ด้วย CSV/Excel หรือยัง
- ต้องส่ง notification ผ่าน email เพิ่มเติมหรือไม่

## 19. Recommended MVP Scope

สำหรับ MVP ให้เริ่มจากตารางเหล่านี้ก่อน:

- `profiles`
- `academic_terms`
- `courses`
- `enrollments`
- `assignments`
- `submissions`
- `submission_files`
- `grades`
- `notifications`

ฟีเจอร์หลัง MVP ค่อยเพิ่ม:

- `course_teachers`
- `submission_comments`
- `assignment_attachments`
- advanced audit logs
- export grades
- bulk import
- scheduled reminders

