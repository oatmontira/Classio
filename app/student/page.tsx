import Link from "next/link";
import { AppShell } from "@/components/app-shell";
import { CourseGrid } from "@/components/tables";
import { Badge, Button, Card, SectionHeader, StatCard } from "@/components/ui";
import { t } from "@/lib/i18n";
import { getLocale } from "@/lib/i18n-server";
import { getAppData } from "@/lib/queries";
import { ArrowRight, CalendarClock } from "lucide-react";

export default async function StudentDashboardPage() {
  const [{ assignments, courses, submissions }, locale] = await Promise.all([getAppData(), getLocale()]);
  const toSubmit = assignments.data.filter((assignment) => assignment.status === "open" || assignment.status === "overdue").length;
  const graded = submissions.data.filter((submission) => submission.status === "graded").length;

  return (
    <AppShell role="student" locale={locale}>
      <div className="grid gap-6">
        <SectionHeader title={t(locale, "studentDashboard")} eyebrow={t(locale, "yourDeadlines")} action={<Link href="/submit"><Button>{t(locale, "submitWork")} <ArrowRight size={16} /></Button></Link>} />
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard label={t(locale, "toSubmit")} value={String(toSubmit)} note={assignments.source === "supabase" ? t(locale, "fromSupabase") : t(locale, "supabaseNotConfigured")} />
          <StatCard label={t(locale, "dueSoon")} value={String(assignments.data.filter((assignment) => assignment.status === "open").length)} note={t(locale, "openAssignmentsNote")} tone="amber" />
          <StatCard label={t(locale, "submitted")} value={String(submissions.data.length)} note={t(locale, "thisSemester")} tone="sky" />
          <StatCard label={t(locale, "graded")} value={String(graded)} note={t(locale, "reviewedWork")} tone="green" />
        </div>
        <div className="grid gap-4 xl:grid-cols-[1fr_0.9fr]">
          <Card>
            <h2 className="text-lg font-semibold">{t(locale, "priorityList")}</h2>
            <div className="mt-4 grid gap-3">
              {assignments.data.slice(0, 3).map((assignment) => (
                <Link key={assignment.id} href={`/assignments/${assignment.id}`} className="flex items-center justify-between gap-4 rounded border border-[#e2e8f0] p-4 hover:bg-blue-50/40">
                  <div>
                    <p className="font-semibold">{assignment.title}</p>
                    <p className="text-sm text-slate-500">{assignment.course} / {t(locale, "dueDate")} {assignment.dueDate}</p>
                  </div>
                  <Badge status={assignment.status} locale={locale} />
                </Link>
              ))}
            </div>
          </Card>
          <Card>
            <h2 className="flex items-center gap-2 text-lg font-semibold"><CalendarClock size={19} /> {t(locale, "deadlineTimeline")}</h2>
            <div className="mt-5 grid gap-4 border-l border-slate-200 pl-4">
              {assignments.data.slice(0, 4).map((assignment) => (
                <div key={assignment.id} className="relative">
                  <span className="absolute -left-[21px] top-1 h-3 w-3 rounded-full bg-blue-600" />
                  <p className="font-semibold">{assignment.title}</p>
                  <p className="text-sm text-slate-500">{assignment.dueDate}</p>
                </div>
              ))}
            </div>
          </Card>
        </div>
        <CourseGrid courses={courses.data} locale={locale} />
        <Card>
          <h2 className="text-lg font-semibold">{t(locale, "recentFeedback")}</h2>
          <div className="mt-4 grid gap-3">
            {submissions.data.filter((item) => item.feedback).map((item) => (
              <div key={item.id} className="rounded border border-[#e2e8f0] p-4">
                <p className="font-semibold">{item.assignment}</p>
                <p className="mt-1 text-sm text-slate-500">{item.feedback}</p>
                <p className="mt-2 text-sm font-semibold text-blue-700">{t(locale, "score")} {item.score}/15</p>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </AppShell>
  );
}
