import Link from "next/link";
import { MoreHorizontal } from "lucide-react";
import { deleteAssignmentAction, deleteCourseAction, deleteUserAction } from "@/lib/actions";
import { t, type Locale } from "@/lib/i18n";
import type { Assignment, Course, Submission, User } from "@/lib/types";
import { Badge, Button, Card } from "./ui";

export function UserTable({ users = [], locale = "th" }: { users?: User[]; locale?: Locale }) {
  if (!users.length) {
    return <Card><p className="text-sm text-slate-500">{t(locale, "noUsers")}</p></Card>;
  }

  return (
    <Card className="overflow-hidden p-0">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[760px] text-left text-sm">
          <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
            <tr>
              <th className="px-4 py-3">{t(locale, "name")}</th>
              <th className="px-4 py-3">{t(locale, "role")}</th>
              <th className="px-4 py-3">{t(locale, "code")}</th>
              <th className="px-4 py-3">{t(locale, "email")}</th>
              <th className="px-4 py-3">{t(locale, "status")}</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {users.map((user) => (
              <tr key={user.id} className="hover:bg-slate-50">
                <td className="px-4 py-3 font-semibold text-slate-950">{user.name}</td>
                <td className="px-4 py-3 capitalize text-slate-600">{user.role}</td>
                <td className="px-4 py-3 text-slate-600">{user.code}</td>
                <td className="px-4 py-3 text-slate-600">{user.email}</td>
                <td className="px-4 py-3"><Badge status={user.status} locale={locale} /></td>
                <td className="px-4 py-3 text-right">
                  <form action={deleteUserAction}>
                    <input type="hidden" name="id" value={user.id} />
                    <Button variant="ghost" className="h-8 w-8 px-0"><MoreHorizontal size={16} /></Button>
                  </form>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}

export function AssignmentTable({ assignments = [], locale = "th" }: { assignments?: Assignment[]; locale?: Locale }) {
  if (!assignments.length) {
    return <Card><p className="text-sm text-slate-500">{t(locale, "noAssignmentsFound")}</p></Card>;
  }

  return (
    <Card className="overflow-hidden p-0">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[860px] text-left text-sm">
          <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
            <tr>
              <th className="px-4 py-3">{t(locale, "assignment")}</th>
              <th className="px-4 py-3">{t(locale, "course")}</th>
              <th className="px-4 py-3">{t(locale, "dueDate")}</th>
              <th className="px-4 py-3">{t(locale, "types")}</th>
              <th className="px-4 py-3">{t(locale, "progress")}</th>
              <th className="px-4 py-3">{t(locale, "status")}</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {assignments.map((assignment) => (
              <tr key={assignment.id} className="hover:bg-slate-50">
                <td className="px-4 py-3">
                  <Link href={`/assignments/${assignment.id}`} className="font-semibold text-slate-950 hover:text-blue-700">{assignment.title}</Link>
                  <p className="text-xs text-slate-500">{assignment.pendingReview} {t(locale, "pendingReview")}</p>
                </td>
                <td className="px-4 py-3 text-slate-600">{assignment.course}</td>
                <td className="px-4 py-3 text-slate-600">{assignment.dueDate}</td>
                <td className="px-4 py-3 text-slate-600">{assignment.types.join(", ")}</td>
                <td className="px-4 py-3 text-slate-600">{assignment.submitted}/{assignment.total} {t(locale, "submittedCount")}</td>
                <td className="px-4 py-3"><Badge status={assignment.status} locale={locale} /></td>
                <td className="px-4 py-3 text-right">
                  <form action={deleteAssignmentAction}>
                    <input type="hidden" name="id" value={assignment.id} />
                    <Button variant="ghost" className="h-8 w-8 px-0"><MoreHorizontal size={16} /></Button>
                  </form>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}

export function CourseGrid({ courses = [], locale = "th" }: { courses?: Course[]; locale?: Locale }) {
  if (!courses.length) {
    return <Card><p className="text-sm text-slate-500">{t(locale, "noCourses")}</p></Card>;
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      {courses.map((course) => (
        <div key={course.id} className="card p-5 transition hover:border-blue-200 hover:bg-blue-50/30">
          <Link href={`/courses/${course.id}`}>
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-sm font-bold text-blue-700">{course.code}</p>
              <h3 className="mt-2 text-lg font-semibold leading-snug text-slate-950">{course.name}</h3>
            </div>
            <Badge status="active" locale={locale} />
          </div>
          <p className="mt-4 text-sm text-slate-500">{course.teacher}</p>
          <div className="mt-5 grid grid-cols-2 gap-3 text-sm">
            <div className="rounded bg-slate-50 p-3">
              <p className="font-bold text-slate-950">{course.students}</p>
              <p className="text-slate-500">{t(locale, "students")}</p>
            </div>
            <div className="rounded bg-slate-50 p-3">
              <p className="font-bold text-slate-950">{course.assignments}</p>
              <p className="text-slate-500">{t(locale, "assignments")}</p>
            </div>
          </div>
          </Link>
          <form action={deleteCourseAction} className="mt-4">
            <input type="hidden" name="id" value={course.id} />
            <Button variant="ghost" className="h-8 px-2 text-xs">{t(locale, "archiveCourse")}</Button>
          </form>
        </div>
      ))}
    </div>
  );
}

export function SubmissionTable({ submissions = [], locale = "th" }: { submissions?: Submission[]; locale?: Locale }) {
  if (!submissions.length) {
    return <Card><p className="text-sm text-slate-500">{t(locale, "noSubmissions")}</p></Card>;
  }

  return (
    <Card className="overflow-hidden p-0">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[760px] text-left text-sm">
          <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
            <tr>
              <th className="px-4 py-3">{t(locale, "students")}</th>
              <th className="px-4 py-3">{t(locale, "assignment")}</th>
              <th className="px-4 py-3">{t(locale, "submitted")}</th>
              <th className="px-4 py-3">{t(locale, "file")}</th>
              <th className="px-4 py-3">{t(locale, "status")}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {submissions.map((submission) => (
              <tr key={submission.id} className="hover:bg-slate-50">
                <td className="px-4 py-3">
                  <p className="font-semibold text-slate-950">{submission.student}</p>
                  <p className="text-xs text-slate-500">{submission.code}</p>
                </td>
                <td className="px-4 py-3 text-slate-600">{submission.assignment}</td>
                <td className="px-4 py-3 text-slate-600">{submission.submittedAt}</td>
                <td className="px-4 py-3 text-slate-600">{submission.file}</td>
                <td className="px-4 py-3"><Badge status={submission.status} locale={locale} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}
