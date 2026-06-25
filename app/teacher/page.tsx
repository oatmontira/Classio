import Link from "next/link";
import { AppShell } from "@/components/app-shell";
import { AssignmentTable, CourseGrid, SubmissionTable } from "@/components/tables";
import { Button, Card, SectionHeader, StatCard } from "@/components/ui";
import { t } from "@/lib/i18n";
import { getLocale } from "@/lib/i18n-server";
import { getAppData } from "@/lib/queries";
import { ClipboardCheck, Plus } from "lucide-react";

export default async function TeacherDashboardPage() {
  const [{ assignments, courses, submissions }, locale] = await Promise.all([getAppData(), getLocale()]);
  const openAssignments = assignments.data.filter((assignment) => assignment.status === "open").length;
  const pendingReview = assignments.data.reduce((total, assignment) => total + assignment.pendingReview, 0);

  return (
    <AppShell role="teacher" locale={locale}>
      <div className="grid gap-6">
        <SectionHeader title={t(locale, "teacherDashboard")} eyebrow={t(locale, "todayAtGlance")} action={<Link href="/assignments/new"><Button><Plus size={16} /> {t(locale, "createAssignment")}</Button></Link>} />
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard label={t(locale, "navMyCourses")} value={String(courses.data.length)} note={courses.source === "supabase" ? t(locale, "fromSupabase") : t(locale, "supabaseNotConfigured")} />
          <StatCard label={t(locale, "openAssignments")} value={String(openAssignments)} note={t(locale, "currentlyAcceptingWork")} tone="sky" />
          <StatCard label={t(locale, "waitingReview")} value={String(pendingReview)} note={t(locale, "acrossAssignments")} tone="amber" />
          <StatCard label={t(locale, "reviewed")} value={String(submissions.data.filter((submission) => submission.status === "graded").length)} note={t(locale, "gradedSubmissions")} tone="green" />
        </div>
        <Card>
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold">{t(locale, "priorityReviewQueue")}</h2>
              <p className="text-sm text-slate-500">{t(locale, "reviewQueueNote")}</p>
            </div>
            <ClipboardCheck className="text-blue-600" />
          </div>
          <div className="mt-5"><SubmissionTable submissions={submissions.data} locale={locale} /></div>
        </Card>
        <CourseGrid courses={courses.data} locale={locale} />
        <AssignmentTable assignments={assignments.data} locale={locale} />
      </div>
    </AppShell>
  );
}
