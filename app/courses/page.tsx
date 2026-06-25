import { AppShell } from "@/components/app-shell";
import { CourseGrid } from "@/components/tables";
import { Button, Card, Field, SectionHeader, inputClass } from "@/components/ui";
import { createCourseAction } from "@/lib/actions";
import { getCurrentProfile } from "@/lib/current-user";
import { t } from "@/lib/i18n";
import { getLocale } from "@/lib/i18n-server";
import { getCourses, getTeachers, getTerms } from "@/lib/queries";
import { Plus, Search } from "lucide-react";

export default async function CoursesPage() {
  const [profile, courses, teachers, terms, locale] = await Promise.all([getCurrentProfile(), getCourses(), getTeachers(), getTerms(), getLocale()]);

  return (
    <AppShell role={profile.role} displayName={profile.name} locale={locale}>
      <div className="grid gap-6">
        <SectionHeader title={t(locale, "courses")} eyebrow={t(locale, "courseWorkspace")} action={profile.role === "admin" || profile.role === "teacher" ? <Button form="create-course-form"><Plus size={16} /> {t(locale, "createCourse")}</Button> : null} />
        <Card>
          <div className="grid gap-3 md:grid-cols-[1fr_180px_180px]">
            <div className="flex h-10 items-center gap-2 rounded border border-[#e2e8f0] px-3 text-sm text-slate-500"><Search size={16} /> {t(locale, "searchCourse")}</div>
            <select className="focus-ring h-10 rounded border border-[#e2e8f0] px-3 text-sm"><option>Semester 1</option></select>
            <select className="focus-ring h-10 rounded border border-[#e2e8f0] px-3 text-sm"><option>2026</option></select>
          </div>
        </Card>
        <CourseGrid courses={courses.data} locale={locale} />
        {profile.role === "admin" || profile.role === "teacher" ? <Card>
          <form id="create-course-form" action={createCourseAction}>
            <h2 className="text-lg font-semibold">{t(locale, "createCourse")}</h2>
            <div className="mt-4 grid gap-4 md:grid-cols-2">
              <Field label={t(locale, "courseCode")}><input name="course_code" className={inputClass} placeholder="IT204" required /></Field>
              <Field label={t(locale, "courseName")}><input name="course_name" className={inputClass} placeholder="Web Application Development" required /></Field>
              {profile.role === "admin" ? (
                <Field label={t(locale, "teacher")}><select name="teacher_id" className={inputClass} required><option value="">{t(locale, "selectTeacher")}</option>{teachers.data.map((teacher) => <option key={teacher.id} value={teacher.id}>{teacher.name}</option>)}</select></Field>
              ) : (
                <Field label={t(locale, "teacher")}><input className={inputClass} value={profile.name} readOnly /></Field>
              )}
              <Field label={t(locale, "academicTerm")}><select name="term_id" className={inputClass}><option value="">{t(locale, "noTerm")}</option>{terms.data.map((term) => <option key={term.id} value={term.id}>{term.label}</option>)}</select></Field>
              <Field label={t(locale, "description")}><textarea name="description" className="focus-ring min-h-24 rounded border border-[#e2e8f0] p-3 text-sm md:col-span-2" placeholder={t(locale, "courseDescription")} /></Field>
            </div>
            <div className="mt-5 flex justify-end"><Button>{t(locale, "createCourse")}</Button></div>
          </form>
        </Card> : null}
      </div>
    </AppShell>
  );
}
