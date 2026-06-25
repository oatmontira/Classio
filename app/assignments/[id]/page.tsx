import Link from "next/link";
import { notFound } from "next/navigation";
import { AppShell } from "@/components/app-shell";
import { SubmissionTable } from "@/components/tables";
import { Badge, Button, Card, Field, SectionHeader, StatCard, inputClass } from "@/components/ui";
import { updateAssignmentAction } from "@/lib/actions";
import { getCurrentProfile } from "@/lib/current-user";
import { t } from "@/lib/i18n";
import { getLocale } from "@/lib/i18n-server";
import { getAppData, getCourses, getTeachers } from "@/lib/queries";
import { Edit, UploadCloud } from "lucide-react";

const submissionTypes = [
  { value: "pdf", label: "PDF" },
  { value: "image", label: "Image" },
  { value: "link", label: "Link" },
  { value: "video", label: "Video" }
];

function toDateTimeLocal(value?: string | null) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toISOString().slice(0, 16);
}

export default async function AssignmentDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [profile, { assignments, submissions }, courses, teachers, locale] = await Promise.all([getCurrentProfile(), getAppData(), getCourses(), getTeachers(), getLocale()]);
  const assignment = assignments.data.find((item) => item.id === id);
  if (!assignment) notFound();

  const assignmentSubmissions = submissions.data.filter((submission) => submission.assignmentId === assignment.id || submission.assignment === assignment.title);

  return (
    <AppShell role={profile.role} displayName={profile.name} locale={locale}>
      <div className="grid gap-6">
        <SectionHeader title={assignment.title} eyebrow={`${assignment.course} / ${assignment.teacher}`} action={profile.role === "student" ? <Link href="/submit"><Button><UploadCloud size={16} /> {t(locale, "submitWork")}</Button></Link> : null} />
        <Card>
          <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
            <div>
              <Badge status={assignment.status} locale={locale} />
              <p className="mt-4 max-w-3xl leading-7 text-slate-600">{locale === "th" ? "ข้อมูลงานมอบหมายถูกโหลดจาก Supabase อาจารย์สามารถแก้ไขการตั้งค่าได้ด้านล่าง และนักศึกษาสามารถส่งงานจากหน้าส่งงานได้" : "Assignment data is loaded from Supabase. Teachers can update assignment settings below, and students can submit work from the submission page."}</p>
            </div>
            {profile.role === "teacher" ? <Button form="edit-assignment-form" variant="secondary"><Edit size={16} /> {t(locale, "updateAssignment")}</Button> : null}
          </div>
        </Card>
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard label={t(locale, "maxScore")} value={`${assignment.maxScore}`} note={t(locale, "score")} />
          <StatCard label={t(locale, "dueDate")} value={assignment.dueDate.slice(0, 6)} note={assignment.dueDate} tone="amber" />
          <StatCard label={t(locale, "submitted")} value={`${assignment.submitted}/${assignment.total}`} note={t(locale, "studentProgress")} tone="sky" />
          <StatCard label={t(locale, "pendingReview")} value={String(assignment.pendingReview)} note={t(locale, "needGrading")} tone="purple" />
        </div>
        {profile.role === "teacher" ? <Card>
          <form id="edit-assignment-form" action={updateAssignmentAction}>
            <input name="id" value={assignment.id} type="hidden" />
            <h2 className="text-lg font-semibold">{t(locale, "editAssignment")}</h2>
            <div className="mt-4 grid gap-4 md:grid-cols-2">
              <Field label={t(locale, "assignmentTitle")}><input name="title" className={inputClass} defaultValue={assignment.title} required /></Field>
              <Field label={t(locale, "course")}>
                <select name="course_id" className={inputClass} defaultValue={assignment.courseId} required>
                  {courses.data.map((course) => <option key={course.id} value={course.id}>{course.code} {course.name}</option>)}
                </select>
              </Field>
              <Field label={t(locale, "teacher")}>
                <select name="teacher_id" className={inputClass} defaultValue={assignment.teacherId} required>
                  {teachers.data.map((teacher) => <option key={teacher.id} value={teacher.id}>{teacher.name}</option>)}
                </select>
              </Field>
              <Field label={t(locale, "status")}>
                <select name="status" className={inputClass} defaultValue={assignment.status}>
                  <option value="draft">{t(locale, "draft")}</option>
                  <option value="open">{t(locale, "open")}</option>
                  <option value="closed">{t(locale, "closed")}</option>
                  <option value="overdue">{t(locale, "overdue")}</option>
                </select>
              </Field>
              <Field label={t(locale, "maxScore")}><input name="max_score" className={inputClass} defaultValue={assignment.maxScore} min="0" step="0.01" type="number" /></Field>
              <Field label={t(locale, "openDate")}><input name="open_at" className={inputClass} defaultValue={toDateTimeLocal(assignment.openAt)} type="datetime-local" /></Field>
              <Field label={t(locale, "dueDate")}><input name="due_at" className={inputClass} defaultValue={toDateTimeLocal(assignment.dueAt)} type="datetime-local" required /></Field>
              <Field label={t(locale, "latePolicy")}><input name="late_policy" className={inputClass} placeholder={locale === "th" ? "อนุญาตแต่ทำเครื่องหมายว่าส่งช้า" : "Allow but mark as late"} /></Field>
              <Field label={t(locale, "description")}><textarea name="description" className="focus-ring min-h-24 rounded border border-[#e2e8f0] p-3 text-sm" placeholder={locale === "th" ? "คำอธิบายงานมอบหมาย" : "Assignment description"} /></Field>
            </div>
            <div className="mt-4 grid gap-3 sm:grid-cols-4">
              {submissionTypes.map((type) => (
                <label key={type.value} className="flex items-center gap-2 rounded border border-[#e2e8f0] p-3 text-sm font-semibold">
                  <input name="allowed_submission_types" value={type.value} type="checkbox" defaultChecked={assignment.types.includes(type.label as never)} />
                  {type.label}
                </label>
              ))}
            </div>
            <div className="mt-4 grid gap-3 md:grid-cols-3">
              <label className="flex items-center justify-between rounded border border-[#e2e8f0] p-3 text-sm font-semibold">{t(locale, "allowResubmission")} <input name="allow_resubmission" type="checkbox" defaultChecked /></label>
              <label className="flex items-center justify-between rounded border border-[#e2e8f0] p-3 text-sm font-semibold">{t(locale, "allowLateSubmission")} <input name="allow_late_submission" type="checkbox" defaultChecked /></label>
              <label className="flex items-center justify-between rounded border border-[#e2e8f0] p-3 text-sm font-semibold">{t(locale, "published")} <input name="publish" type="checkbox" defaultChecked={assignment.status !== "draft"} /></label>
            </div>
            <div className="mt-5 flex justify-end"><Button>{t(locale, "updateAssignment")}</Button></div>
          </form>
        </Card> : null}
        <SubmissionTable submissions={assignmentSubmissions} locale={locale} />
      </div>
    </AppShell>
  );
}
