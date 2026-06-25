import Link from "next/link";
import { notFound } from "next/navigation";
import { AppShell } from "@/components/app-shell";
import { AssignmentTable, SubmissionTable } from "@/components/tables";
import { Badge, Button, Card, Field, SectionHeader, StatCard, inputClass } from "@/components/ui";
import { updateCourseAction } from "@/lib/actions";
import { getCurrentProfile } from "@/lib/current-user";
import { t } from "@/lib/i18n";
import { getLocale } from "@/lib/i18n-server";
import { getAppData, getTeachers, getTerms } from "@/lib/queries";
import { Plus } from "lucide-react";

export default async function CourseDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [profile, { assignments, courses, submissions }, teachers, terms, locale] = await Promise.all([getCurrentProfile(), getAppData(), getTeachers(), getTerms(), getLocale()]);
  const course = courses.data.find((item) => item.id === id);
  if (!course) notFound();

  const courseAssignments = assignments.data.filter((assignment) => assignment.courseId === course.id || assignment.course === course.code);
  const courseSubmissions = submissions.data.filter((submission) => courseAssignments.some((assignment) => assignment.id === submission.assignmentId) || submission.course === course.code);

  return (
    <AppShell role={profile.role} displayName={profile.name} locale={locale}>
      <div className="grid gap-6">
        <SectionHeader title={`${course.code} ${course.name}`} eyebrow={`${course.teacher} / Semester ${course.semester}/${course.academicYear}`} action={profile.role === "teacher" ? <Link href="/assignments/new"><Button><Plus size={16} /> {t(locale, "createAssignment")}</Button></Link> : null} />
        <Card>
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <Badge status={course.status === "active" ? "active" : "closed"} locale={locale} />
              <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-600">{locale === "th" ? "ข้อมูลรายวิชาถูกโหลดจาก Supabase และสามารถอัปเดตได้จากหน้านี้ รายการงานและงานที่ส่งด้านล่างอ้างอิงข้อมูลจริงจากฐานข้อมูล" : "Course data is loaded from Supabase and can be updated from this page. Assignment and submission lists below reflect related database records."}</p>
            </div>
            <div className="grid grid-cols-2 gap-3 text-sm md:w-80">
              <div className="rounded bg-slate-50 p-3"><p className="font-bold">{course.students}</p><p className="text-slate-500">{t(locale, "students")}</p></div>
              <div className="rounded bg-slate-50 p-3"><p className="font-bold">{course.assignments}</p><p className="text-slate-500">{t(locale, "assignments")}</p></div>
            </div>
          </div>
        </Card>
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard label={t(locale, "students")} value={String(course.students)} note={t(locale, "active")} />
          <StatCard label={t(locale, "activeAssignments")} value={String(courseAssignments.length)} note={t(locale, "openForSubmission")} tone="sky" />
          <StatCard label={t(locale, "pendingSubmissions")} value={String(courseSubmissions.filter((item) => item.status === "submitted" || item.status === "late").length)} note={t(locale, "needGrading")} tone="amber" />
          <StatCard label={t(locale, "graded")} value={String(courseSubmissions.filter((item) => item.status === "graded").length)} note={t(locale, "completedReview")} tone="green" />
        </div>
        {profile.role === "admin" ? <Card>
          <form action={updateCourseAction}>
            <input name="id" value={course.id} type="hidden" />
            <h2 className="text-lg font-semibold">{t(locale, "editCourse")}</h2>
            <div className="mt-4 grid gap-4 md:grid-cols-2">
              <Field label={t(locale, "courseCode")}><input name="course_code" className={inputClass} defaultValue={course.code} required /></Field>
              <Field label={t(locale, "courseName")}><input name="course_name" className={inputClass} defaultValue={course.name} required /></Field>
              <Field label={t(locale, "teacher")}>
                <select name="teacher_id" className={inputClass} defaultValue={course.teacherId} required>
                  {teachers.data.map((teacher) => <option key={teacher.id} value={teacher.id}>{teacher.name}</option>)}
                </select>
              </Field>
              <Field label={t(locale, "academicTerm")}>
                <select name="term_id" className={inputClass} defaultValue={course.termId ?? ""}>
                  <option value="">{t(locale, "noTerm")}</option>
                  {terms.data.map((term) => <option key={term.id} value={term.id}>{term.label}</option>)}
                </select>
              </Field>
              <Field label={t(locale, "status")}>
                <select name="status" className={inputClass} defaultValue={course.status === "active" ? "active" : "archived"}>
                  <option value="active">Active</option>
                  <option value="archived">Archived</option>
                  <option value="completed">Completed</option>
                </select>
              </Field>
              <Field label={t(locale, "description")}><textarea name="description" className="focus-ring min-h-24 rounded border border-[#e2e8f0] p-3 text-sm" placeholder={t(locale, "courseDescription")} /></Field>
            </div>
            <div className="mt-5 flex justify-end"><Button>{t(locale, "updateCourse")}</Button></div>
          </form>
        </Card> : null}
        <div className="flex gap-2 overflow-x-auto">
          {[t(locale, "overview"), t(locale, "assignments"), t(locale, "students"), t(locale, "submissions")].map((tab, index) => <button key={tab} type="button" className={`rounded px-4 py-2 text-sm font-semibold ${index === 0 ? "bg-blue-600 text-white" : "border border-[#e2e8f0] bg-white text-slate-600"}`}>{tab}</button>)}
        </div>
        <AssignmentTable assignments={courseAssignments} locale={locale} />
        <SubmissionTable submissions={courseSubmissions} locale={locale} />
      </div>
    </AppShell>
  );
}
