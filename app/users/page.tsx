import { AppShell } from "@/components/app-shell";
import { UserTable } from "@/components/tables";
import { Button, Card, Field, SectionHeader, inputClass } from "@/components/ui";
import { createUserAction } from "@/lib/actions";
import { t } from "@/lib/i18n";
import { getLocale } from "@/lib/i18n-server";
import { getUsers } from "@/lib/queries";
import { Plus, Search } from "lucide-react";

export default async function UsersPage() {
  const [users, locale] = await Promise.all([getUsers(), getLocale()]);

  return (
    <AppShell role="admin" locale={locale}>
      <div className="grid gap-6">
        <SectionHeader title={t(locale, "userManagement")} eyebrow={t(locale, "admin")} action={<Button><Plus size={16} /> {t(locale, "addUser")}</Button>} />
        <Card>
          <div className="grid gap-3 md:grid-cols-[1fr_180px_180px_auto]">
            <div className="flex h-10 items-center gap-2 rounded border border-[#e2e8f0] px-3 text-sm text-slate-500"><Search size={16} /> {t(locale, "searchNameEmailCode")}</div>
            <select className={inputClass}><option>{t(locale, "allRoles")}</option><option>Admin</option><option>Teacher</option><option>Student</option></select>
            <select className={inputClass}><option>{t(locale, "allStatus")}</option><option>{t(locale, "active")}</option><option>{t(locale, "disabled")}</option></select>
            <Button variant="secondary">{t(locale, "filter")}</Button>
          </div>
        </Card>
        <UserTable users={users.data} locale={locale} />
        <Card>
          <form action={createUserAction}>
            <h2 className="text-lg font-semibold">{t(locale, "createUser")}</h2>
            <div className="mt-4 grid gap-4 md:grid-cols-2">
              <Field label={t(locale, "fullName")}><input name="full_name" className={inputClass} placeholder="Nicha Boonmee" required /></Field>
              <Field label={t(locale, "email")}><input name="email" className={inputClass} placeholder="name@university.ac.th" type="email" required /></Field>
              <Field label={t(locale, "role")}><select name="role" className={inputClass} defaultValue="student"><option value="student">Student</option><option value="teacher">Teacher</option><option value="admin">Admin</option></select></Field>
              <Field label={t(locale, "studentTeacherCode")}><input name="code" className={inputClass} placeholder="661234001" /></Field>
              <Field label={t(locale, "temporaryPassword")}><input name="password" className={inputClass} placeholder="Password@12345" type="password" /></Field>
            </div>
            <div className="mt-5 flex justify-end gap-2"><Button variant="secondary">{t(locale, "cancel")}</Button><Button>{t(locale, "saveUser")}</Button></div>
          </form>
        </Card>
      </div>
    </AppShell>
  );
}
