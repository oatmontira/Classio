import Link from "next/link";
import { AppShell } from "@/components/app-shell";
import { AssignmentTable } from "@/components/tables";
import { Button, Card, SectionHeader } from "@/components/ui";
import { getCurrentProfile } from "@/lib/current-user";
import { t } from "@/lib/i18n";
import { getLocale } from "@/lib/i18n-server";
import { getAssignments } from "@/lib/queries";
import { Plus, Search } from "lucide-react";

export default async function AssignmentsPage() {
  const [profile, assignments, locale] = await Promise.all([getCurrentProfile(), getAssignments(), getLocale()]);

  return (
    <AppShell role={profile.role} displayName={profile.name} locale={locale}>
      <div className="grid gap-6">
        <SectionHeader title={t(locale, "assignments")} eyebrow={t(locale, "assignmentWorkspace")} action={profile.role === "teacher" ? <Link href="/assignments/new"><Button><Plus size={16} /> {t(locale, "createAssignment")}</Button></Link> : null} />
        <Card>
          <div className="grid gap-3 md:grid-cols-[1fr_180px_180px_180px]">
            <div className="flex h-10 items-center gap-2 rounded border border-[#e2e8f0] px-3 text-sm text-slate-500"><Search size={16} /> {t(locale, "searchAssignment")}</div>
            <select className="focus-ring h-10 rounded border border-[#e2e8f0] px-3 text-sm"><option>{t(locale, "allCourses")}</option></select>
            <select className="focus-ring h-10 rounded border border-[#e2e8f0] px-3 text-sm"><option>{t(locale, "allStatus")}</option></select>
            <select className="focus-ring h-10 rounded border border-[#e2e8f0] px-3 text-sm"><option>{t(locale, "dueDate")}</option></select>
          </div>
        </Card>
        <AssignmentTable assignments={assignments.data} locale={locale} />
      </div>
    </AppShell>
  );
}
