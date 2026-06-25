import { AppShell } from "@/components/app-shell";
import { Badge, Card, SectionHeader } from "@/components/ui";
import { t } from "@/lib/i18n";
import { getLocale } from "@/lib/i18n-server";
import { getSubmissions } from "@/lib/queries";

export default async function GradesPage() {
  const [submissions, locale] = await Promise.all([getSubmissions(), getLocale()]);

  return (
    <AppShell role="student" locale={locale}>
      <div className="grid gap-6">
        <SectionHeader title={t(locale, "gradesTitle")} eyebrow={t(locale, "studentRecords")} />
        <div className="grid gap-4">
          {submissions.data.map((submission) => (
            <Card key={submission.id}>
              <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                <div>
                  <Badge status={submission.status} locale={locale} />
                  <h2 className="mt-3 text-lg font-semibold">{submission.assignment}</h2>
                  <p className="text-sm text-slate-500">{submission.course} / {t(locale, "submitted")} {submission.submittedAt}</p>
                  <p className="mt-3 text-sm text-slate-600">{submission.feedback ?? t(locale, "feedbackPending")}</p>
                </div>
                <div className="rounded bg-blue-50 px-5 py-4 text-center text-blue-700">
                  <p className="text-2xl font-bold">{submission.score ?? "-"}</p>
                  <p className="text-xs font-semibold">{t(locale, "score")}</p>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </AppShell>
  );
}
