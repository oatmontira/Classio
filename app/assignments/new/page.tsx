import { AppShell } from "@/components/app-shell";
import { Button, Card, Field, SectionHeader, inputClass } from "@/components/ui";
import { createAssignmentAction } from "@/lib/actions";
import { t } from "@/lib/i18n";
import { getLocale } from "@/lib/i18n-server";
import { getCourses, getTeachers } from "@/lib/queries";
import { Check, FileImage, FileText, Link as LinkIcon, Video } from "lucide-react";

const submissionTypes = [
  { value: "pdf", label: "PDF", icon: FileText, defaultChecked: true },
  { value: "image", label: "Image", icon: FileImage, defaultChecked: true },
  { value: "link", label: "Link", icon: LinkIcon, defaultChecked: true },
  { value: "video", label: "Video", icon: Video, defaultChecked: false }
];

export default async function CreateAssignmentPage() {
  const [courses, teachers, locale] = await Promise.all([getCourses(), getTeachers(), getLocale()]);

  return (
    <AppShell role="teacher" locale={locale}>
      <div className="grid gap-6">
        <SectionHeader title={t(locale, "createAssignmentTitle")} eyebrow={t(locale, "assignmentSetup")} action={<Button form="create-assignment-form"><Check size={16} /> {t(locale, "publish")}</Button>} />
        <form id="create-assignment-form" action={createAssignmentAction} className="grid gap-6 xl:grid-cols-[1fr_360px]">
          <Card>
            <div className="grid gap-5">
              <Field label={t(locale, "assignmentTitle")}><input name="title" className={inputClass} placeholder="Lab 03: Form Validation" required /></Field>
              <div className="grid gap-4 md:grid-cols-2">
                <Field label={t(locale, "course")}>
                  <select name="course_id" className={inputClass} required>
                    <option value="">{t(locale, "allCourses")}</option>
                    {courses.data.map((course) => <option key={course.id} value={course.id}>{course.code} {course.name}</option>)}
                  </select>
                </Field>
                <Field label={t(locale, "teacher")}>
                  <select name="teacher_id" className={inputClass} required>
                    <option value="">{t(locale, "selectTeacher")}</option>
                    {teachers.data.map((teacher) => <option key={teacher.id} value={teacher.id}>{teacher.name}</option>)}
                  </select>
                </Field>
              </div>
              <Field label={t(locale, "description")}><textarea name="description" className="focus-ring min-h-36 rounded border border-[#e2e8f0] p-3 text-sm" placeholder={locale === "th" ? "อธิบายงาน ไฟล์ที่ต้องส่ง และเกณฑ์การให้คะแนน" : "Explain the task, required files, and grading criteria."} /></Field>
              <div className="grid gap-4 md:grid-cols-3">
                <Field label={t(locale, "maxScore")}><input name="max_score" className={inputClass} defaultValue="20" min="0" step="0.01" type="number" /></Field>
                <Field label={t(locale, "openDate")}><input name="open_at" className={inputClass} type="datetime-local" /></Field>
                <Field label={t(locale, "dueDate")}><input name="due_at" className={inputClass} type="datetime-local" required /></Field>
              </div>
              <div>
                <p className="text-sm font-semibold">{t(locale, "allowedSubmissionTypes")}</p>
                <div className="mt-3 grid gap-3 sm:grid-cols-2">
                  {submissionTypes.map(({ value, label, icon: Icon, defaultChecked }) => (
                    <label key={value} className="flex items-center gap-3 rounded border border-[#e2e8f0] p-3 text-sm font-semibold">
                      <input name="allowed_submission_types" value={value} type="checkbox" defaultChecked={defaultChecked} />
                      <Icon size={18} className="text-blue-600" />
                      {label}
                    </label>
                  ))}
                </div>
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <Field label={t(locale, "lateSubmissionPolicy")}>
                  <select name="late_policy" className={inputClass} defaultValue="Allow but mark as late">
                    <option>Allow but mark as late</option>
                    <option>Block after due date</option>
                  </select>
                </Field>
                <label className="flex items-center justify-between rounded border border-[#e2e8f0] p-3 text-sm font-semibold">{t(locale, "allowResubmission")} <input name="allow_resubmission" type="checkbox" defaultChecked /></label>
                <label className="flex items-center justify-between rounded border border-[#e2e8f0] p-3 text-sm font-semibold">{t(locale, "allowLateSubmission")} <input name="allow_late_submission" type="checkbox" defaultChecked /></label>
                <label className="flex items-center justify-between rounded border border-[#e2e8f0] p-3 text-sm font-semibold">{t(locale, "publishNow")} <input name="publish" type="checkbox" defaultChecked /></label>
              </div>
            </div>
          </Card>
          <Card className="h-fit">
            <h2 className="text-lg font-semibold">{t(locale, "previewSummary")}</h2>
            <div className="mt-4 grid gap-3 text-sm text-slate-600">
              <p>Data will be saved directly to Supabase assignments.</p>
              <p>Use real course and teacher records from the database before creating an assignment.</p>
              <p>Students can submit once this assignment is published.</p>
            </div>
            <div className="mt-5 rounded bg-blue-50 p-4 text-sm text-blue-800">If the course or teacher list is empty, create those records first.</div>
          </Card>
        </form>
      </div>
    </AppShell>
  );
}
