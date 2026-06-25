import { AppShell } from "@/components/app-shell";
import { AssignmentTable, SubmissionTable } from "@/components/tables";
import { Button, Card, SectionHeader, StatCard } from "@/components/ui";
import { t } from "@/lib/i18n";
import { getLocale } from "@/lib/i18n-server";
import { getAppData } from "@/lib/queries";
import { Plus } from "lucide-react";

export default async function AdminDashboardPage() {
  const [{ assignments, submissions, stats }, locale] = await Promise.all([getAppData(), getLocale()]);

  return (
    <AppShell role="admin" locale={locale}>
      <div className="grid gap-6">
        <SectionHeader title={t(locale, "adminDashboard")} eyebrow={t(locale, "systemOverview")} action={<Button><Plus size={16} /> {t(locale, "addUser")}</Button>} />
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-6">
          <StatCard label={t(locale, "totalUsers")} value={String(stats.data.totalUsers)} note={stats.source === "supabase" ? t(locale, "fromSupabase") : t(locale, "supabaseNotConfigured")} />
          <StatCard label={t(locale, "teachers")} value={String(stats.data.teachers)} note={t(locale, "activeInstructors")} tone="purple" />
          <StatCard label={t(locale, "students")} value={String(stats.data.students)} note={t(locale, "currentSemester")} tone="sky" />
          <StatCard label={t(locale, "courses")} value={String(stats.data.courses)} note={t(locale, "publishedCourses")} tone="green" />
          <StatCard label={t(locale, "assignments")} value={String(stats.data.assignments)} note={t(locale, "trackedAssignments")} tone="amber" />
          <StatCard label={t(locale, "submissions")} value={String(stats.data.submissions)} note={t(locale, "latestSubmissions")} />
        </div>
        <div className="grid gap-4 xl:grid-cols-[1.2fr_0.8fr]">
          <Card>
            <h2 className="text-lg font-semibold">{t(locale, "submissionActivity")}</h2>
            <div className="mt-6 flex h-64 items-end gap-3">
              {[42, 64, 55, 72, 88, 58, 76].map((height, index) => (
                <div key={index} className="flex flex-1 flex-col items-center gap-2">
                  <div className="w-full rounded-t bg-blue-600" style={{ height: `${height}%` }} />
                  <span className="text-xs text-slate-500">D{index + 1}</span>
                </div>
              ))}
            </div>
          </Card>
          <Card>
            <h2 className="text-lg font-semibold">{t(locale, "roleDistribution")}</h2>
            <div className="mt-5 grid gap-3">
              {[t(locale, "students"), t(locale, "teachers"), t(locale, "admin")].map((item, index) => {
                const values = [78, 18, 4];
                return (
                  <div key={item}>
                    <div className="flex justify-between text-sm"><span>{item}</span><span className="text-slate-500">{values[index]}%</span></div>
                    <div className="mt-2 h-2 rounded-full bg-slate-100"><div className="h-2 rounded-full bg-violet-600" style={{ width: `${values[index]}%` }} /></div>
                  </div>
                );
              })}
            </div>
          </Card>
        </div>
        <AssignmentTable assignments={assignments.data} locale={locale} />
        <SubmissionTable submissions={submissions.data} locale={locale} />
      </div>
    </AppShell>
  );
}
