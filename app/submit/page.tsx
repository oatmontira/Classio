import { AppShell } from "@/components/app-shell";
import { SubmissionForm } from "@/components/submission-form";
import { Badge, Card, SectionHeader } from "@/components/ui";
import { createSubmissionAction } from "@/lib/actions";
import { getCurrentProfile } from "@/lib/current-user";
import { t } from "@/lib/i18n";
import { getLocale } from "@/lib/i18n-server";
import { getAssignments } from "@/lib/queries";

export default async function SubmitPage() {
  const [profile, assignments, locale] = await Promise.all([getCurrentProfile(), getAssignments(), getLocale()]);
  const assignment = assignments.data[0];

  return (
    <AppShell role={profile.role} displayName={profile.name} locale={locale}>
      <div className="grid gap-6">
        <SectionHeader title={t(locale, "submitTitle")} eyebrow={assignment ? `${assignment.course} / ${assignment.title}` : t(locale, "submitWorkspace")} action={<Badge status={assignment ? assignment.status : "draft"} label={assignment ? t(locale, "openForSubmission") : t(locale, "noAssignmentSelected")} />} />
        <div className="grid gap-6 xl:grid-cols-[1fr_360px]">
          <Card>
            {assignments.data.length === 0 ? (
              <div className="rounded border border-dashed border-[#e2e8f0] p-6 text-sm text-slate-600">
                {t(locale, "noAssignments")}
              </div>
            ) : (
              <SubmissionForm assignments={assignments.data} action={createSubmissionAction} locale={locale} />
            )}
          </Card>
          <Card className="h-fit">
            <h2 className="text-lg font-semibold">{t(locale, "uploadState")}</h2>
            <div className="mt-4 grid gap-3 text-sm text-slate-600">
              <div className="rounded border border-[#e2e8f0] p-3">{t(locale, "storageNote")}</div>
              <div className="rounded border border-[#e2e8f0] p-3">{t(locale, "fileMetadataNote")}</div>
              <div className="rounded border border-[#e2e8f0] p-3">{t(locale, "latestAttemptNote")}</div>
            </div>
          </Card>
        </div>
      </div>
    </AppShell>
  );
}
