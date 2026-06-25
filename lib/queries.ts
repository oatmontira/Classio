import { unstable_noStore as noStore } from "next/cache";
import { supabaseAdmin } from "./supabase-admin";
import type { Assignment, Course, Submission, SubmissionType, User } from "./types";

type DataSource<T> = {
  data: T;
  source: "supabase" | "unconfigured";
  error?: string;
};

type DashboardStats = {
  totalUsers: number;
  teachers: number;
  students: number;
  courses: number;
  assignments: number;
  submissions: number;
};

type AppNotification = {
  id: string;
  title: string;
  body: string;
  type: string;
  time: string;
  unread: boolean;
};

const emptySource = <T>(data: T, error?: unknown): DataSource<T> => ({
  data,
  source: "unconfigured",
  error: error instanceof Error ? error.message : typeof error === "string" ? error : undefined
});

const fromSupabase = <T>(data: T): DataSource<T> => ({
  data,
  source: "supabase"
});

function formatDate(value: string | null | undefined) {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  }).format(date);
}

function mapSubmissionType(type: string): SubmissionType {
  const normalized = type.toLowerCase();
  if (normalized === "pdf") return "PDF";
  if (normalized === "image") return "Image";
  if (normalized === "video") return "Video";
  return "Link";
}

function mapAssignmentStatus(status: string): Assignment["status"] {
  if (status === "scheduled") return "draft";
  if (status === "draft" || status === "open" || status === "closed" || status === "overdue") return status;
  return "draft";
}

function mapSubmissionStatus(status: string): Submission["status"] {
  if (status === "submitted" || status === "late" || status === "graded") return status;
  return "unsubmitted";
}

function relationValue(value: unknown, key: string) {
  if (!value || typeof value !== "object") return undefined;
  if (Array.isArray(value)) return relationValue(value[0], key);
  const record = value as Record<string, unknown>;
  return typeof record[key] === "string" ? record[key] : undefined;
}

function relationNumber(value: unknown, key: string) {
  if (!value || typeof value !== "object") return undefined;
  if (Array.isArray(value)) return relationNumber(value[0], key);
  const record = value as Record<string, unknown>;
  return typeof record[key] === "number" ? record[key] : undefined;
}

export async function getUsers(): Promise<DataSource<User[]>> {
  noStore();
  if (!supabaseAdmin) return emptySource([]);

  const { data, error } = await supabaseAdmin
    .from("profiles")
    .select("id, full_name, email, role, student_code, teacher_code, status")
    .order("created_at", { ascending: false });

  if (error) return emptySource([], error.message);

  return fromSupabase(
    data.map((profile) => ({
      id: profile.id,
      name: profile.full_name,
      email: profile.email,
      role: profile.role,
      code: profile.student_code ?? profile.teacher_code ?? "-",
      status: profile.status
    }))
  );
}

export async function getTeachers() {
  const users = await getUsers();
  return {
    ...users,
    data: users.data.filter((user) => user.role === "teacher")
  };
}

export async function getStudents() {
  const users = await getUsers();
  return {
    ...users,
    data: users.data.filter((user) => user.role === "student")
  };
}

export async function getTerms() {
  noStore();
  if (!supabaseAdmin) return emptySource<Array<{ id: string; label: string }>>([]);

  const { data, error } = await supabaseAdmin
    .from("academic_terms")
    .select("id, academic_year, semester")
    .order("academic_year", { ascending: false })
    .order("semester", { ascending: false });

  if (error) return emptySource([], error.message);

  return fromSupabase(data.map((term) => ({ id: term.id, label: `Semester ${term.semester}/${term.academic_year}` })));
}

export async function getCourses(): Promise<DataSource<Course[]>> {
  noStore();
  if (!supabaseAdmin) return emptySource([]);

  const { data, error } = await supabaseAdmin
    .from("courses")
    .select(
      `
      id,
      course_code,
      course_name,
      teacher_id,
      term_id,
      status,
      teacher:profiles!courses_teacher_id_fkey(full_name),
      term:academic_terms(semester, academic_year),
      enrollments(id),
      assignments(id)
    `
    )
    .is("deleted_at", null)
    .order("created_at", { ascending: false });

  if (error) return emptySource([], error.message);

  return fromSupabase(
    data.map((course) => ({
      id: course.id,
      teacherId: course.teacher_id,
      termId: course.term_id,
      code: course.course_code,
      name: course.course_name,
      teacher: relationValue(course.teacher, "full_name") ?? "Unassigned teacher",
      semester: relationValue(course.term, "semester") ?? "-",
      academicYear: relationValue(course.term, "academic_year") ?? "-",
      students: Array.isArray(course.enrollments) ? course.enrollments.length : 0,
      assignments: Array.isArray(course.assignments) ? course.assignments.length : 0,
      status: course.status === "active" ? "active" : "closed"
    }))
  );
}

export async function getAssignments(): Promise<DataSource<Assignment[]>> {
  noStore();
  if (!supabaseAdmin) return emptySource([]);

  const { data, error } = await supabaseAdmin
    .from("assignments")
    .select(
      `
      id,
      course_id,
      teacher_id,
      title,
      max_score,
      allowed_submission_types,
      open_at,
      due_at,
      status,
      course:courses(course_code, course_name, enrollments(id)),
      teacher:profiles!assignments_teacher_id_fkey(full_name),
      submissions(id, status)
    `
    )
    .is("deleted_at", null)
    .order("due_at", { ascending: true });

  if (error) return emptySource([], error.message);

  return fromSupabase(
    data.map((assignment) => {
      const submissions = Array.isArray(assignment.submissions) ? assignment.submissions : [];
      const course = Array.isArray(assignment.course) ? assignment.course[0] : assignment.course;
      const total = relationNumber(course, "enrollments") ?? (course && typeof course === "object" && Array.isArray((course as { enrollments?: unknown[] }).enrollments) ? (course as { enrollments: unknown[] }).enrollments.length : 0);

      return {
        id: assignment.id,
        courseId: assignment.course_id,
        teacherId: assignment.teacher_id,
        title: assignment.title,
        course: relationValue(course, "course_code") ?? "Course",
        teacher: relationValue(assignment.teacher, "full_name") ?? "Teacher",
        dueAt: assignment.due_at,
        openAt: assignment.open_at,
        dueDate: formatDate(assignment.due_at),
        openDate: formatDate(assignment.open_at),
        maxScore: Number(assignment.max_score),
        status: mapAssignmentStatus(assignment.status),
        types: assignment.allowed_submission_types.map(mapSubmissionType),
        submitted: submissions.filter((submission) => submission.status === "submitted" || submission.status === "late" || submission.status === "graded").length,
        total,
        pendingReview: submissions.filter((submission) => submission.status === "submitted" || submission.status === "late").length
      };
    })
  );
}

export async function getSubmissions(): Promise<DataSource<Submission[]>> {
  noStore();
  if (!supabaseAdmin) return emptySource([]);

  const { data, error } = await supabaseAdmin
    .from("submissions")
    .select(
      `
      id,
      assignment_id,
      student_id,
      submitted_at,
      status,
      student:profiles!submissions_student_id_fkey(full_name, student_code),
      assignment:assignments(title, course:courses(course_code)),
      files:submission_files(original_file_name),
      grade:grades(score, feedback)
    `
    )
    .eq("is_latest", true)
    .order("created_at", { ascending: false });

  if (error) return emptySource([], error.message);

  return fromSupabase(
    data.map((submission) => {
      const assignment = Array.isArray(submission.assignment) ? submission.assignment[0] : submission.assignment;
      const course = assignment && typeof assignment === "object" && "course" in assignment ? (assignment.course as unknown) : undefined;
      const files = Array.isArray(submission.files) ? submission.files : [];
      const grade = Array.isArray(submission.grade) ? submission.grade[0] : submission.grade;

      return {
        id: submission.id,
        assignmentId: submission.assignment_id,
        studentId: submission.student_id,
        student: relationValue(submission.student, "full_name") ?? "Student",
        code: relationValue(submission.student, "student_code") ?? "-",
        assignment: relationValue(assignment, "title") ?? "Assignment",
        course: relationValue(course, "course_code") ?? "-",
        submittedAt: formatDate(submission.submitted_at),
        status: mapSubmissionStatus(submission.status),
        file: relationValue(files[0], "original_file_name") ?? "-",
        score: grade && typeof grade === "object" && "score" in grade ? Number(grade.score) : undefined,
        feedback: grade && typeof grade === "object" && typeof grade.feedback === "string" ? grade.feedback : undefined
      };
    })
  );
}

export async function getNotifications(): Promise<DataSource<AppNotification[]>> {
  noStore();
  if (!supabaseAdmin) return emptySource([]);

  const { data, error } = await supabaseAdmin
    .from("notifications")
    .select("id, title, message, type, is_read, created_at")
    .order("created_at", { ascending: false })
    .limit(50);

  if (error) return emptySource([], error.message);

  return fromSupabase(
    data.map((notification) => ({
      id: notification.id,
      title: notification.title,
      body: notification.message,
      type: notification.type,
      time: formatDate(notification.created_at),
      unread: !notification.is_read
    }))
  );
}

export async function getDashboardStats(): Promise<DataSource<DashboardStats>> {
  noStore();
  if (!supabaseAdmin) {
    return emptySource({
      totalUsers: 0,
      teachers: 0,
      students: 0,
      courses: 0,
      assignments: 0,
      submissions: 0
    });
  }

  const [profilesResult, coursesResult, assignmentsResult, submissionsResult] = await Promise.all([
    supabaseAdmin.from("profiles").select("role", { count: "exact", head: false }),
    supabaseAdmin.from("courses").select("id", { count: "exact", head: true }).is("deleted_at", null),
    supabaseAdmin.from("assignments").select("id", { count: "exact", head: true }).is("deleted_at", null),
    supabaseAdmin.from("submissions").select("id", { count: "exact", head: true })
  ]);

  if (profilesResult.error || coursesResult.error || assignmentsResult.error || submissionsResult.error) {
    return emptySource({
      totalUsers: 0,
      teachers: 0,
      students: 0,
      courses: 0,
      assignments: 0,
      submissions: 0
    });
  }

  const profiles = profilesResult.data ?? [];
  const teachers = profiles.filter((profile) => profile.role === "teacher").length;
  const students = profiles.filter((profile) => profile.role === "student").length;

  return fromSupabase({
    totalUsers: profilesResult.count ?? profiles.length,
    teachers,
    students,
    courses: coursesResult.count ?? 0,
    assignments: assignmentsResult.count ?? 0,
    submissions: submissionsResult.count ?? 0
  });
}

export async function getAppData() {
  const [users, courses, assignments, submissions, notifications, stats] = await Promise.all([
    getUsers(),
    getCourses(),
    getAssignments(),
    getSubmissions(),
    getNotifications(),
    getDashboardStats()
  ]);

  return {
    users,
    courses,
    assignments,
    submissions,
    notifications,
    stats,
    source: "supabase" as const
  };
}
