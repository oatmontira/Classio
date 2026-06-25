import { AppShell } from "@/components/app-shell";
import { Badge, Button, Card, Field, SectionHeader, inputClass } from "@/components/ui";
import { upsertGradeAction } from "@/lib/actions";
import { t } from "@/lib/i18n";
import { getLocale } from "@/lib/i18n-server";
import { getSubmissions, getTeachers } from "@/lib/queries";
import { Download, ExternalLink, FileText, Save } from "lucide-react";

export default async function ReviewPage() {
  const [submissions, teachers, locale] = await Promise.all([getSubmissions(), getTeachers(), getLocale()]);
  const activeSubmission = submissions.data[0];

  return (
    <AppShell role="teacher" locale={locale}>
      <div className="grid gap-6">
        <SectionHeader title={t(locale, "reviewSubmission")} eyebrow={t(locale, "gradingWorkflow")} action={<Button form="grade-form" disabled={!activeSubmission}><Save size={16} /> {t(locale, "saveGrade")}</Button>} />
        {submissions.data.length === 0 ? (
          <Card>
            <div className="rounded border border-dashed border-[#e2e8f0] p-6 text-sm text-slate-600">{t(locale, "noSubmissionsToGrade")}</div>
          </Card>
        ) : (
          <div className="grid gap-6 xl:grid-cols-[280px_1fr_360px]">
            <Card className="h-fit">
              <h2 className="text-lg font-semibold">{t(locale, "students")}</h2>
              <div className="mt-4 grid gap-2">
                {submissions.data.map((submission, index) => (
                  <button key={submission.id} type="button" className={`rounded border p-3 text-left text-sm ${index === 0 ? "border-blue-600 bg-blue-50" : "border-[#e2e8f0] bg-white"}`}>
                    <p className="font-semibold">{submission.student}</p>
                    <p className="text-xs text-slate-500">{submission.code}</p>
                    <div className="mt-2"><Badge status={submission.status} locale={locale} /></div>
                  </button>
                ))}
              </div>
            </Card>
            <Card>
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 className="text-lg font-semibold">{t(locale, "submittedWork")}</h2>
                  <p className="text-sm text-slate-500">{activeSubmission.student} {t(locale, "submitted")} {activeSubmission.submittedAt}</p>
                </div>
                <Badge status={activeSubmission.status} locale={locale} />
              </div>
              <div className="mt-5 grid gap-4">
                <div className="rounded-lg border border-[#e2e8f0] bg-slate-50 p-6">
                  <FileText className="text-blue-600" size={38} />
                  <p className="mt-4 font-semibold">{activeSubmission.file}</p>
                  <p className="mt-1 text-sm text-slate-500">{t(locale, "fileMetadataNote")}</p>
                  <div className="mt-5 flex gap-2"><Button type="button" variant="secondary"><ExternalLink size={16} /> Open</Button><Button type="button" variant="secondary"><Download size={16} /> Download</Button></div>
                </div>
                <div className="rounded border border-[#e2e8f0] p-4">
                  <p className="text-sm font-semibold">{t(locale, "assignment")}</p>
                  <p className="mt-2 text-sm leading-6 text-slate-600">{activeSubmission.course} / {activeSubmission.assignment}</p>
                </div>
              </div>
            </Card>
            <Card className="h-fit">
              <h2 className="text-lg font-semibold">{t(locale, "gradeFeedback")}</h2>
              <form id="grade-form" action={upsertGradeAction} className="mt-4 grid gap-4">
                <input name="submission_id" value={activeSubmission.id} type="hidden" />
                <Field label={t(locale, "teacher")}>
                  <select name="teacher_id" className={inputClass} required>
                    <option value="">{t(locale, "selectTeacher")}</option>
                    {teachers.data.map((teacher) => <option key={teacher.id} value={teacher.id}>{teacher.name}</option>)}
                  </select>
                </Field>
                <Field label={t(locale, "score")}><input name="score" className={inputClass} defaultValue={activeSubmission.score ?? 0} min="0" step="0.01" type="number" /></Field>
                <Field label={t(locale, "feedback")}><textarea name="feedback" className="focus-ring min-h-36 rounded border border-[#e2e8f0] p-3 text-sm" defaultValue={activeSubmission.feedback ?? ""} placeholder={t(locale, "writeFeedback")} /></Field>
                <label className="flex items-center justify-between rounded border border-[#e2e8f0] p-3 text-sm font-semibold">{t(locale, "markReviewed")} <input type="checkbox" defaultChecked /></label>
                <Button>{t(locale, "saveGrade")}</Button>
              </form>
            </Card>
          </div>
        )}
      </div>
    </AppShell>
  );
}
